# Phase 9C: EHR Integration Connectors — Epic, Cerner, Medidata

**Status:** 🚧 ARCHITECTURE DESIGN  
**Target Timeline:** August 2026 — November 2026  
**Systems:** Epic, Cerner, Medidata (primary enterprise EHRs)  
**Deliverables:** Bidirectional HL7/FHIR connectors, data normalization, clinical workflow integration

---

## Overview

Phase 9C integrates the clinical alerting platform directly into hospital EHR systems, enabling:
- **Seamless Alert Delivery:** Critical alerts appear in clinician's EHR workflow
- **Patient Context:** Access complete patient records without app switching
- **Data Synchronization:** Real-time vital signs from monitoring devices → EHR
- **Clinical Documentation:** Alert acknowledgments and interventions auto-saved to chart
- **Interoperability:** FHIR-compliant data exchange with any certified EHR

---

## Architecture

### Integration Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                    Hospital EHR System                      │
│  (Epic, Cerner, Medidata)                                   │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HL7v2.5 / FHIR R4 / REST API
             │
┌────────────▼────────────────────────────────────────────────┐
│       Clinical Alerting Platform                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ EHR Adapter Layer                                    │  │
│  │ - HL7 Parser/Generator                              │  │
│  │ - FHIR Resource Mapping                             │  │
│  │ - Data Normalization                                │  │
│  │ - API Client (Epic FHIR, Cerner API, etc)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Alert Engine                                         │  │
│  │ - Real-time alert firing                            │  │
│  │ - Threshold optimization                            │  │
│  │ - Escalation logic                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Clinical Workflow Integration                        │  │
│  │ - Alert notifications in EHR                        │  │
│  │ - In-workflow documentation                         │  │
│  │ - Order entry integration                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component 1: FHIR-Based Data Exchange

### Standard FHIR Resources

```python
# features/ehr_integration/fhir_mapping.py
# Purpose: Map clinical data to FHIR resources

from fhir.resources.observation import Observation
from fhir.resources.patient import Patient
from fhir.resources.bundle import Bundle, BundleEntry
from fhir.resources.alert import Alert as FHIRAlert
import json
from datetime import datetime

class FHIRMapper:
    """
    Convert clinical observations to FHIR R4 resources.
    Enables interoperability with any FHIR-compliant EHR.
    """
    
    def observation_to_fhir(self, observation: dict) -> Observation:
        """
        Convert vital sign observation to FHIR Observation resource.
        
        Maps to LOINC codes (standard vital sign terminology).
        """
        loinc_codes = {
            'glucose': '2345-7',
            'heart_rate': '8867-4',
            'systolic_bp': '8480-6',
            'diastolic_bp': '8462-4',
            'spo2': '59408-5',
            'temperature': '8310-5'
        }
        
        vital_type = observation['type']
        
        fhir_obs = Observation({
            'id': observation['id'],
            'status': 'final',
            'subject': {
                'reference': f"Patient/{observation['patient_id']}"
            },
            'code': {
                'coding': [{
                    'system': 'http://loinc.org',
                    'code': loinc_codes.get(vital_type, 'unknown'),
                    'display': vital_type
                }]
            },
            'effectiveDateTime': observation['timestamp'].isoformat(),
            'issued': datetime.utcnow().isoformat(),
            'valueQuantity': {
                'value': observation['value'],
                'unit': self._get_unit(vital_type),
                'system': 'http://unitsofmeasure.org',
                'code': self._get_unit_code(vital_type)
            },
            'performer': [{
                'reference': f"Device/{observation['device_id']}"
            }],
            'device': {
                'reference': f"Device/{observation['device_id']}"
            }
        })
        
        return fhir_obs
    
    def alert_to_fhir(self, alert: dict) -> FHIRAlert:
        """
        Convert clinical alert to FHIR Alert resource.
        
        Used for alerting systems that support FHIR messages.
        """
        severity_map = {
            'P1': 'critical',
            'P2': 'high',
            'P3': 'medium'
        }
        
        fhir_alert = FHIRAlert({
            'id': alert['id'],
            'status': 'active',
            'severity': severity_map.get(alert['severity'], 'medium'),
            'subject': {
                'reference': f"Patient/{alert['patient_id']}"
            },
            'focus': [{
                'reference': f"Observation/{alert['triggering_observation_id']}"
            }],
            'indication': [
                {
                    'reference': f"Condition/{alert['alert_type']}"
                }
            ],
            'issued': datetime.utcnow().isoformat(),
            'note': [{
                'text': f"{alert['alert_type']}: {alert['value']} (threshold: {alert['threshold']})"
            }]
        })
        
        return fhir_alert
    
    def bundle_observations(self, observations: list) -> Bundle:
        """
        Bundle multiple observations into FHIR Bundle for batch transmission.
        """
        entries = []
        
        for obs in observations:
            fhir_obs = self.observation_to_fhir(obs)
            entry = BundleEntry({
                'resource': fhir_obs,
                'request': {
                    'method': 'POST',
                    'url': 'Observation'
                }
            })
            entries.append(entry)
        
        bundle = Bundle({
            'type': 'transaction',
            'entry': entries,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        return bundle
    
    def _get_unit(self, vital_type: str) -> str:
        units = {
            'glucose': 'mg/dL',
            'heart_rate': 'bpm',
            'systolic_bp': 'mmHg',
            'diastolic_bp': 'mmHg',
            'spo2': '%',
            'temperature': 'Celsius'
        }
        return units.get(vital_type, 'unknown')
    
    def _get_unit_code(self, vital_type: str) -> str:
        codes = {
            'glucose': 'mg/dL',
            'heart_rate': '/min',
            'systolic_bp': 'mm[Hg]',
            'diastolic_bp': 'mm[Hg]',
            'spo2': '%',
            'temperature': 'Cel'
        }
        return codes.get(vital_type, 'unknown')
```

---

## Component 2: EHR-Specific Adapters

### Epic EHR Integration

```python
# features/ehr_integration/epic_adapter.py

class EpicAdapter:
    """
    Integrate with Epic EHR using Epic's FHIR API and Care Everywhere.
    Epic is the largest EHR in US hospitals (~55% market share).
    """
    
    def __init__(self, client_id: str, client_secret: str, base_url: str):
        """
        Initialize Epic FHIR adapter.
        
        Args:
            client_id: Epic OAuth2 client ID
            client_secret: Epic OAuth2 client secret
            base_url: Epic FHIR API base URL (e.g., https://hospital.epic.com/interconnect-fhir-r4/api/FHIR/R4/)
        """
        self.base_url = base_url
        self.session = requests.Session()
        
        # Authenticate using OAuth2
        self.access_token = self._get_access_token(client_id, client_secret)
        self.session.headers.update({
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/fhir+json'
        })
    
    def send_observations_to_epic(self, observations: list) -> dict:
        """
        Send vital sign observations to Epic EHR.
        
        Epic will add observations to patient's chart, making them visible
        in clinician workflow.
        """
        fhir_mapper = FHIRMapper()
        
        for obs in observations:
            fhir_obs = fhir_mapper.observation_to_fhir(obs)
            
            # POST observation to Epic FHIR API
            response = self.session.post(
                f"{self.base_url}Observation",
                json=json.loads(fhir_obs.json())
            )
            
            if response.status_code != 201:
                raise Exception(f"Failed to send observation to Epic: {response.text}")
        
        return {'status': 'success', 'observations_sent': len(observations)}
    
    def get_patient_context(self, patient_id: str) -> dict:
        """
        Retrieve patient context from Epic (demographics, medical history, medications).
        
        Used to enrich alert decisions with patient-specific information.
        """
        response = self.session.get(
            f"{self.base_url}Patient/{patient_id}"
        )
        
        if response.status_code == 200:
            patient_resource = response.json()
            return {
                'mrn': patient_resource['identifier'][0]['value'],
                'name': f"{patient_resource['name'][0]['given'][0]} {patient_resource['name'][0]['family']}",
                'dob': patient_resource['birthDate'],
                'gender': patient_resource['gender']
            }
        else:
            raise Exception(f"Failed to retrieve patient from Epic: {response.text}")
    
    def send_alert_notification(self, alert: dict, patient_id: str) -> dict:
        """
        Send alert notification to Epic, appears in clinician's inbox/workflow.
        
        Epic integrates alerts as in-basket messages that clinicians see
        alongside patient care workflow.
        """
        message = {
            'messageType': 'ALERT',
            'severity': alert['severity'],
            'subject': f"Critical Alert: {alert['alert_type']}",
            'body': f"{alert['alert_type']}: {alert['value']} (threshold: {alert['threshold']})",
            'patientId': patient_id,
            'createdAt': datetime.utcnow().isoformat(),
            'requiresAcknowledgment': True
        }
        
        # Send via Epic's Care Everywhere (secure messaging)
        response = self.session.post(
            f"{self.base_url}Communication",
            json=message
        )
        
        if response.status_code == 201:
            return {'status': 'success', 'notification_id': response.json()['id']}
        else:
            raise Exception(f"Failed to send alert to Epic: {response.text}")
    
    def _get_access_token(self, client_id: str, client_secret: str) -> str:
        """
        Authenticate with Epic using OAuth2 client credentials flow.
        """
        auth = (client_id, client_secret)
        response = requests.post(
            f"{self.base_url.split('/interconnect')[0]}/oauth2/token",
            auth=auth,
            data={'grant_type': 'client_credentials'}
        )
        
        if response.status_code == 200:
            return response.json()['access_token']
        else:
            raise Exception(f"Failed to authenticate with Epic: {response.text}")
```

### Cerner EHR Integration

```python
# features/ehr_integration/cerner_adapter.py

class CernerAdapter:
    """
    Integrate with Cerner EHR using Cerner's FHIR API.
    Cerner is second-largest EHR in US (~25% market share).
    """
    
    def __init__(self, cerner_code: str, access_token: str, base_url: str):
        """
        Initialize Cerner FHIR adapter.
        
        Args:
            cerner_code: Cerner account code (identifies hospital system)
            access_token: Cerner OAuth2 access token
            base_url: Cerner FHIR API base URL
        """
        self.cerner_code = cerner_code
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/fhir+json',
            'Accept': 'application/fhir+json'
        })
    
    def send_observations_to_cerner(self, observations: list) -> dict:
        """
        Send observations to Cerner EHR.
        
        Cerner FHIR API supports batch observation transmission.
        """
        fhir_mapper = FHIRMapper()
        bundle = fhir_mapper.bundle_observations(observations)
        
        response = self.session.post(
            self.base_url,
            json=json.loads(bundle.json())
        )
        
        if response.status_code in [200, 201]:
            return {'status': 'success', 'observations_sent': len(observations)}
        else:
            raise Exception(f"Failed to send observations to Cerner: {response.text}")
    
    def get_patient_medications(self, patient_id: str) -> list:
        """
        Retrieve patient's current medications from Cerner.
        
        Used for drug interaction checking in alert engine.
        """
        response = self.session.get(
            f"{self.base_url}Patient/{patient_id}/MedicationRequest"
        )
        
        if response.status_code == 200:
            bundle = response.json()
            medications = []
            for entry in bundle.get('entry', []):
                med_request = entry['resource']
                medications.append({
                    'drug_name': med_request['medicationCodeableConcept']['coding'][0]['display'],
                    'status': med_request['status'],
                    'dosage': med_request.get('dosageInstruction', [{}])[0].get('doseQuantity', {}).get('value')
                })
            return medications
        else:
            raise Exception(f"Failed to retrieve medications from Cerner: {response.text}")
    
    def create_alert_task(self, alert: dict, patient_id: str) -> dict:
        """
        Create a Task resource in Cerner representing the clinical alert.
        
        Cerner will route this to appropriate clinician workflow.
        """
        task = {
            'resourceType': 'Task',
            'status': 'requested',
            'intent': 'order',
            'priority': self._priority_from_severity(alert['severity']),
            'description': {
                'text': f"{alert['alert_type']}: {alert['value']} (threshold: {alert['threshold']})"
            },
            'for': {
                'reference': f"Patient/{patient_id}"
            },
            'authoredOn': datetime.utcnow().isoformat(),
            'owner': {
                'reference': 'Practitioner/unknown'  # Will be routed by Cerner
            }
        }
        
        response = self.session.post(
            f"{self.base_url}Task",
            json=task
        )
        
        if response.status_code in [200, 201]:
            return {'status': 'success', 'task_id': response.json()['id']}
        else:
            raise Exception(f"Failed to create task in Cerner: {response.text}")
    
    def _priority_from_severity(self, severity: str) -> str:
        mapping = {'P1': 'stat', 'P2': 'urgent', 'P3': 'routine'}
        return mapping.get(severity, 'routine')
```

### Medidata Integration

```python
# features/ehr_integration/medidata_adapter.py

class MedidataAdapter:
    """
    Integrate with Medidata clinical data platform.
    Medidata connects to EHRs and clinical trial systems.
    """
    
    def __init__(self, api_key: str, workspace_id: str, base_url: str):
        self.api_key = api_key
        self.workspace_id = workspace_id
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
    def send_observations_to_medidata(self, observations: list) -> dict:
        """
        Send observations to Medidata for clinical trial data collection.
        """
        payload = {
            'workspace_id': self.workspace_id,
            'observations': observations,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        response = self.session.post(
            f"{self.base_url}/observations",
            json=payload
        )
        
        if response.status_code == 200:
            return {'status': 'success', 'observations_sent': len(observations)}
        else:
            raise Exception(f"Failed to send observations to Medidata: {response.text}")
    
    def enroll_patient_in_trial(self, patient_id: str, trial_id: str) -> dict:
        """
        Enroll patient in clinical trial via Medidata.
        """
        enrollment = {
            'patient_id': patient_id,
            'trial_id': trial_id,
            'enrollment_date': datetime.utcnow().isoformat(),
            'status': 'active'
        }
        
        response = self.session.post(
            f"{self.base_url}/enrollments",
            json=enrollment
        )
        
        if response.status_code in [200, 201]:
            return {'status': 'success', 'enrollment_id': response.json()['id']}
        else:
            raise Exception(f"Failed to enroll patient: {response.text}")
```

---

## Component 3: EHR Adapter Manager

```python
# features/ehr_integration/ehr_manager.py

class EHRManager:
    """
    Central manager coordinating alerts across multiple connected EHR systems.
    """
    
    def __init__(self, config: dict):
        self.adapters = {}
        
        # Initialize adapters based on configuration
        if 'epic' in config:
            self.adapters['epic'] = EpicAdapter(**config['epic'])
        if 'cerner' in config:
            self.adapters['cerner'] = CernerAdapter(**config['cerner'])
        if 'medidata' in config:
            self.adapters['medidata'] = MedidataAdapter(**config['medidata'])
    
    def broadcast_alert_to_ehr_systems(self, alert: dict, patient_id: str):
        """
        Send alert to all connected EHR systems simultaneously.
        """
        results = {}
        
        for ehr_name, adapter in self.adapters.items():
            try:
                if ehr_name == 'epic':
                    result = adapter.send_alert_notification(alert, patient_id)
                elif ehr_name == 'cerner':
                    result = adapter.create_alert_task(alert, patient_id)
                elif ehr_name == 'medidata':
                    result = {'status': 'no_alert_support'}
                
                results[ehr_name] = result
            except Exception as e:
                results[ehr_name] = {'status': 'error', 'message': str(e)}
        
        return results
    
    def sync_observations_to_ehr(self, observations: list):
        """
        Synchronize observations to all connected EHRs.
        """
        for ehr_name, adapter in self.adapters.items():
            try:
                adapter.send_observations_to_ehr(observations)
            except Exception as e:
                # Log but don't fail — other EHRs may succeed
                print(f"Failed to sync to {ehr_name}: {e}")
    
    def get_patient_context_from_ehr(self, patient_id: str) -> dict:
        """
        Retrieve patient data from primary EHR system.
        """
        # Try primary EHR (Epic), fall back to others
        for ehr_name in ['epic', 'cerner', 'medidata']:
            if ehr_name in self.adapters:
                try:
                    return self.adapters[ehr_name].get_patient_context(patient_id)
                except:
                    continue
        
        raise Exception("Unable to retrieve patient context from any EHR")
```

---

## Clinical Workflow Integration

### Embedded Alert Notifications

```
┌─────────────────────────────────────────────────────┐
│          Clinician's EHR Workflow                   │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ Patient Chart                                │  │
│  │ - Demographics, vitals, medications          │  │
│  │ ┌──────────────────────────────────────────┐ │  │
│  │ │ ALERT: Hypoglycemia - 38 mg/dL           │ │  │
│  │ │ Triggered: 14:23 | Threshold: 40 mg/dL   │ │  │
│  │ │                                           │ │  │
│  │ │ [Acknowledge] [Intervene] [Escalate]     │ │  │
│  │ └──────────────────────────────────────────┘ │  │
│  │ - Recent observations, trends                │  │
│  │ - Active orders, medications                 │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  All data in one place — no context switching       │
└─────────────────────────────────────────────────────┘
```

---

## Testing & Validation

### EHR Sandbox Testing

```python
# tests/ehr_integration_tests.py

class TestEpicIntegration:
    """Test Epic adapter against Epic's sandbox environment."""
    
    def test_send_observation_to_epic(self):
        adapter = EpicAdapter(
            client_id='sandbox_client',
            client_secret='sandbox_secret',
            base_url='https://open.epic.com/FHIR/R4/'
        )
        
        observation = {
            'id': 'obs_123',
            'patient_id': 'patient_456',
            'type': 'glucose',
            'value': 45,
            'timestamp': datetime.utcnow(),
            'device_id': 'device_789'
        }
        
        result = adapter.send_observations_to_epic([observation])
        assert result['status'] == 'success'
    
    def test_alert_notification_to_epic(self):
        adapter = EpicAdapter(...)
        
        alert = {
            'id': 'alert_123',
            'alert_type': 'hypoglycemia',
            'severity': 'P1',
            'value': 38,
            'threshold': 40
        }
        
        result = adapter.send_alert_notification(alert, 'patient_456')
        assert result['status'] == 'success'
        assert 'notification_id' in result

class TestCernerIntegration:
    """Test Cerner adapter."""
    
    def test_send_observations_to_cerner(self):
        adapter = CernerAdapter(
            cerner_code='123456',
            access_token='sandbox_token',
            base_url='https://fhir.cerner.com/r4/123456/'
        )
        
        observations = [
            {'type': 'glucose', 'value': 95, 'patient_id': 'pat_123'},
            {'type': 'heart_rate', 'value': 78, 'patient_id': 'pat_123'}
        ]
        
        result = adapter.send_observations_to_cerner(observations)
        assert result['observations_sent'] == 2
```

---

## Deployment & Rollout

### Hospital Integration Process

1. **Technical Setup** (Week 1)
   - Hospital IT provisions API credentials
   - Certificate pinning configured for hospital's certificates
   - Network firewall rules allow bidirectional communication

2. **Testing & Validation** (Week 2-3)
   - Sandbox testing with sample patient data
   - Real-world test with small clinician group
   - Validation of alert delivery, data synchronization

3. **Pilot Rollout** (Week 4-6)
   - Deploy to one hospital unit (ICU, Med-Surg, etc)
   - Monitor alert delivery, clinician adoption
   - Gather feedback on usability

4. **Full Deployment** (Week 7-8)
   - Roll out to all units in hospital
   - Deactivate parallel systems
   - Full monitoring and support

---

## Success Criteria

| Criterion | Target | Validation |
|-----------|--------|-----------|
| **Alert Delivery** | <2s from platform to EHR | Real-time monitoring |
| **Data Sync** | 99.9% successful transmission | Error rate tracking |
| **Clinician Adoption** | ≥80% use EHR-integrated alerts | Usage analytics |
| **Data Accuracy** | 100% correct FHIR mapping | Continuous validation |
| **System Availability** | 99.95% uptime | SLA monitoring |
| **API Response** | <200ms p95 | Performance testing |

---

**Status:** Architecture complete  
**Next Step:** Implementation (August 2026)  
**Blocking Items:** None — Ready to proceed post-FDA clearance
