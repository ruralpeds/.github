#!/usr/bin/env python3
"""
Adverse Event Scenario Generator
Creates realistic adverse event test cases for FDA validation.

Compliance: IEC 62304 V&V, FDA 510(k) post-market surveillance
Purpose: Define specific adverse event scenarios that test:
         - Alert sensitivity (false negatives)
         - Alert specificity (false positives)
         - Clinical accuracy (severity scoring)
         - System response time (incident response runbook adherence)

Version: 1.0 (April 25, 2026)
"""

import json
import uuid
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from enum import Enum


# ============================================================================
# ADVERSE EVENT DEFINITIONS (FDA Form 3500A mapping)
# ============================================================================

class AdverseEventType(Enum):
    """FDA MedWatch adverse event types (IEC 62304 §5.8)."""
    HYPOGLYCEMIC_EVENT = "E001"      # Blood glucose <40 mg/dL
    HYPERGLYCEMIC_CRISIS = "E002"    # Blood glucose >350 mg/dL with acidosis symptoms
    SEVERE_HYPERTENSION = "E003"     # SBP >200 or DBP >120 x 10 min
    SEPSIS = "E004"                  # Systemic infection with SIRS criteria
    CARDIAC_ARRHYTHMIA = "E005"      # Irregular heart rhythm
    RESPIRATORY_FAILURE = "E006"     # SpO2 <85% or RR <8 or >35
    MEDICATION_INTERACTION = "E007"  # Adverse drug-drug interaction
    DEVICE_MALFUNCTION = "E008"      # Device failure/incorrect reading
    FALL_INJURY = "E009"             # Patient fall or trauma
    NOSOCOMIAL_INFECTION = "E010"    # Hospital-acquired infection


class SeverityLevel(Enum):
    """FDA MedWatch severity scale."""
    MILD = "1"       # Temporary, no treatment needed
    MODERATE = "2"   # Temporary, required treatment
    SEVERE = "3"     # Serious outcome (hospitalization, disability)
    CRITICAL = "4"   # Death or permanent disability


class CausalityAssessment(Enum):
    """WHO-UMC causality categories."""
    CERTAIN = 1.0           # Clear temporal relationship, known effect
    PROBABLE = 0.8         # Reasonable temporal relationship
    POSSIBLE = 0.6         # Temporal relationship but other causes
    UNLIKELY = 0.4         # Temporal relationship weak
    UNRELATED = 0.2        # No apparent relationship
    UNASSESSABLE = 0.5     # Insufficient data


# ============================================================================
# ADVERSE EVENT TEMPLATES
# ============================================================================

@dataclass
class AdverseEventScenario:
    """Single adverse event test case."""
    id: str
    event_type: AdverseEventType
    patient_id: str
    onset_timestamp: str
    severity: SeverityLevel
    causality_score: float
    triggering_vitals: Dict[str, float]  # Vital → value that triggered event
    expected_alert_name: str              # Name of alert that should fire
    expected_response_time_seconds: int   # SLA for incident response
    clinical_notes: str
    mdr_reportable: bool                  # Must be reported to FDA
    device_involvement: bool              # Does device malfunction play a role?

    def to_fhir_adverse_event(self) -> Dict:
        """Convert to FHIR R4 AdverseEvent resource."""
        return {
            "resourceType": "AdverseEvent",
            "id": self.id,
            "status": "completed",
            "category": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/adverse-event-category",
                    "code": "medication-mishap" if self.event_type == AdverseEventType.MEDICATION_INTERACTION else "product-use-error",
                    "display": self.event_type.name
                }]
            }],
            "event": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/meddra",
                    "code": self.event_type.value,
                    "display": self.event_type.name
                }]
            },
            "subject": {"reference": f"Patient/{self.patient_id}"},
            "date": self.onset_timestamp,
            "seriousness": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/adverse-event-seriousness",
                    "code": "Serious" if self.severity in [SeverityLevel.SEVERE, SeverityLevel.CRITICAL] else "Non-Serious"
                }]
            },
            "severity": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/adverse-event-severity",
                    "code": self.severity.name.lower()
                }]
            },
            "outcome": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/adverse-event-outcome",
                    "code": "Fatal" if self.severity == SeverityLevel.CRITICAL else "Unknown"
                }]
            },
            "causality": [{
                "assessment": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/adverse-event-causality-assess",
                        "code": self._causality_code(),
                        "display": self._causality_display()
                    }]
                },
                "productRelatedness": self.causality_score
            }],
            "description": self.clinical_notes,
            "extension": [{
                "url": "http://hl7.org/fhir/StructureDefinition/adverse-event-mdr-reportable",
                "valueBoolean": self.mdr_reportable
            }]
        }

    def _causality_code(self) -> str:
        """Map causality score to WHO-UMC code."""
        if self.causality_score >= 0.9:
            return "Certain"
        elif self.causality_score >= 0.7:
            return "Probable"
        elif self.causality_score >= 0.5:
            return "Possible"
        elif self.causality_score >= 0.3:
            return "Unlikely"
        else:
            return "Unrelated"

    def _causality_display(self) -> str:
        """Human-readable causality assessment."""
        return self._causality_code()


# ============================================================================
# ADVERSE EVENT SCENARIO LIBRARY
# ============================================================================

class AdverseEventLibrary:
    """Collection of predefined adverse event test scenarios."""

    @staticmethod
    def get_all_scenarios() -> List[AdverseEventScenario]:
        """Return all predefined adverse event scenarios."""
        return [
            # ========== HYPOGLYCEMIC EVENT ==========
            AdverseEventScenario(
                id=f"ae-{uuid.uuid4().hex[:8]}",
                event_type=AdverseEventType.HYPOGLYCEMIC_EVENT,
                patient_id="patient-00001",
                onset_timestamp=datetime.now().isoformat() + "Z",
                severity=SeverityLevel.SEVERE,
                causality_score=0.95,  # Certain
                triggering_vitals={
                    "glucose": 35,          # <40 triggers severe hypoglycemia
                    "heart_rate": 120,      # Compensatory tachycardia
                    "blood_pressure_systolic": 85  # Hypotension
                },
                expected_alert_name="SevereHypoglycemiaDetected",
                expected_response_time_seconds=60,  # Critical alert SLA
                clinical_notes="Patient with Type 2 diabetes on metformin + insulin. Glucose dropped to 35 mg/dL over 30 minutes. Patient symptomatic with tremor, confusion.",
                mdr_reportable=True,
                device_involvement=False
            ),

            # ========== HYPERGLYCEMIC CRISIS ==========
            AdverseEventScenario(
                id=f"ae-{uuid.uuid4().hex[:8]}",
                event_type=AdverseEventType.HYPERGLYCEMIC_CRISIS,
                patient_id="patient-00002",
                onset_timestamp=datetime.now().isoformat() + "Z",
                severity=SeverityLevel.CRITICAL,
                causality_score=0.92,
                triggering_vitals={
                    "glucose": 380,         # >350 indicates crisis
                    "respiratory_rate": 28, # Kussmaul respiration (metabolic acidosis)
                    "heart_rate": 105,      # Tachycardia
                    "temperature": 38.2    # Fever (often present in DKA)
                },
                expected_alert_name="HyperglycemicCrisisDetected",
                expected_response_time_seconds=120,
                clinical_notes="Type 2 diabetes patient. Glucose 380 mg/dL. Respiratory rate elevated (Kussmaul). Lab results pending for pH/HCO3 confirmation of DKA.",
                mdr_reportable=True,
                device_involvement=False
            ),

            # ========== SEVERE HYPERTENSION ==========
            AdverseEventScenario(
                id=f"ae-{uuid.uuid4().hex[:8]}",
                event_type=AdverseEventType.SEVERE_HYPERTENSION,
                patient_id="patient-00003",
                onset_timestamp=datetime.now().isoformat() + "Z",
                severity=SeverityLevel.SEVERE,
                causality_score=0.85,
                triggering_vitals={
                    "blood_pressure_systolic": 215,  # >200
                    "blood_pressure_diastolic": 125, # >120
                    "heart_rate": 95,
                    "glucose": 145              # Often elevated during stress
                },
                expected_alert_name="SevereHypertensionDetected",
                expected_response_time_seconds=180,
                clinical_notes="Hypertensive patient with poor medication adherence. BP reading 215/125 for 15 minutes. Risk for hypertensive emergency (stroke, MI).",
                mdr_reportable=False,  # Not directly device-related
                device_involvement=True  # If device failed to alert
            ),

            # ========== SEPSIS ==========
            AdverseEventScenario(
                id=f"ae-{uuid.uuid4().hex[:8]}",
                event_type=AdverseEventType.SEPSIS,
                patient_id="patient-00004",
                onset_timestamp=datetime.now().isoformat() + "Z",
                severity=SeverityLevel.CRITICAL,
                causality_score=0.88,
                triggering_vitals={
                    "heart_rate": 125,        # >90 (SIRS criteria)
                    "respiratory_rate": 28,   # >20
                    "temperature": 39.1,      # >38 or <36
                    "blood_pressure_systolic": 95,  # Hypotensive
                    "white_blood_cells": 18.5 # >11 K/uL
                },
                expected_alert_name="SepsisAlertTriggered",
                expected_response_time_seconds=60,  # Sepsis = medical emergency
                clinical_notes="Post-op patient (day 3). Meets SIRS criteria (fever, HR 125, RR 28, possible wound infection). Blood cultures ordered.",
                mdr_reportable=True,
                device_involvement=False
            ),

            # ========== CARDIAC ARRHYTHMIA ==========
            AdverseEventScenario(
                id=f"ae-{uuid.uuid4().hex[:8]}",
                event_type=AdverseEventType.CARDIAC_ARRHYTHMIA,
                patient_id="patient-00005",
                onset_timestamp=datetime.now().isoformat() + "Z",
                severity=SeverityLevel.SEVERE,
                causality_score=0.78,  # Probable (could be multiple causes)
                triggering_vitals={
                    "heart_rate": 160,        # Atrial fibrillation typically 100-180
                    "blood_pressure_systolic": 105,  # May drop
                    "blood_pressure_diastolic": 65,
                    "oxygen_saturation": 92  # Slight hypoxemia
                },
                expected_alert_name="IrregularHeartRhythmDetected",
                expected_response_time_seconds=120,
                clinical_notes="Patient with known AF. HR 160, irregular rhythm. Not on anticoagulation. Risk for stroke.",
                mdr_reportable=True,
                device_involvement=True  # If device sensor failed to detect
            ),

            # ========== RESPIRATORY FAILURE ==========
            AdverseEventScenario(
                id=f"ae-{uuid.uuid4().hex[:8]}",
                event_type=AdverseEventType.RESPIRATORY_FAILURE,
                patient_id="patient-00006",
                onset_timestamp=datetime.now().isoformat() + "Z",
                severity=SeverityLevel.CRITICAL,
                causality_score=0.92,
                triggering_vitals={
                    "oxygen_saturation": 82,  # <85%
                    "respiratory_rate": 7,    # <8 (severe bradypnea)
                    "heart_rate": 135,        # Compensatory tachycardia
                    "blood_pressure_systolic": 88
                },
                expected_alert_name="RespiratoryFailureDetected",
                expected_response_time_seconds=30,  # Immediate action required
                clinical_notes="COPD patient on supplemental O2. Suddenly desaturated to 82%. RR dropped to 7 (opioid overdose suspected). Needs mechanical ventilation.",
                mdr_reportable=True,
                device_involvement=False
            ),

            # ========== MEDICATION INTERACTION ==========
            AdverseEventScenario(
                id=f"ae-{uuid.uuid4().hex[:8]}",
                event_type=AdverseEventType.MEDICATION_INTERACTION,
                patient_id="patient-00007",
                onset_timestamp=datetime.now().isoformat() + "Z",
                severity=SeverityLevel.MODERATE,
                causality_score=0.85,
                triggering_vitals={
                    "heart_rate": 145,        # Serotonin syndrome: tachycardia
                    "temperature": 39.5,      # High fever
                    "blood_pressure_systolic": 155
                },
                expected_alert_name="MedicationInteractionDetected",
                expected_response_time_seconds=300,
                clinical_notes="Patient on SSRIs + tramadol (serotonin syndrome risk). Presents with tremor, agitation, hyperthermia, tachycardia. Tramadol discontinued.",
                mdr_reportable=False,  # Medication, not device
                device_involvement=False
            ),

            # ========== DEVICE MALFUNCTION ==========
            AdverseEventScenario(
                id=f"ae-{uuid.uuid4().hex[:8]}",
                event_type=AdverseEventType.DEVICE_MALFUNCTION,
                patient_id="patient-00008",
                onset_timestamp=datetime.now().isoformat() + "Z",
                severity=SeverityLevel.SEVERE,
                causality_score=0.95,
                triggering_vitals={
                    "heart_rate": 240,        # IMPOSSIBLE vital → sensor failure
                    "blood_pressure_systolic": 999,  # Out of range
                    "oxygen_saturation": -5  # IMPOSSIBLE
                },
                expected_alert_name="DeviceSensorMalfunctionDetected",
                expected_response_time_seconds=180,
                clinical_notes="Continuous glucose monitor showed HR 240 bpm. On examination, patient HR normal (72). Device malfunction → erroneous alert triggered.",
                mdr_reportable=True,
                device_involvement=True
            ),

            # ========== FALSE NEGATIVE TEST (No alert when should alert) ==========
            AdverseEventScenario(
                id=f"ae-{uuid.uuid4().hex[:8]}",
                event_type=AdverseEventType.HYPOGLYCEMIC_EVENT,
                patient_id="patient-00009",
                onset_timestamp=datetime.now().isoformat() + "Z",
                severity=SeverityLevel.SEVERE,
                causality_score=0.90,
                triggering_vitals={
                    "glucose": 38,            # Critical
                    "heart_rate": 118,
                    "blood_pressure_systolic": 82
                },
                expected_alert_name="SevereHypoglycemiaDetected",
                expected_response_time_seconds=60,
                clinical_notes="VALIDATION TEST: Patient with glucose 38. System should alert but didn't. Measure false-negative rate.",
                mdr_reportable=True,
                device_involvement=True  # Alert system failure
            ),

            # ========== FALSE POSITIVE TEST (Alert when shouldn't alert) ==========
            AdverseEventScenario(
                id=f"ae-{uuid.uuid4().hex[:8]}",
                event_type=AdverseEventType.HYPOGLYCEMIC_EVENT,
                patient_id="patient-00010",
                onset_timestamp=datetime.now().isoformat() + "Z",
                severity=SeverityLevel.MILD,
                causality_score=0.2,  # Unlikely/unrelated
                triggering_vitals={
                    "glucose": 68,            # Normal (but near 70)
                    "heart_rate": 88,
                    "blood_pressure_systolic": 110
                },
                expected_alert_name="SevereHypoglycemiaDetected",  # Should NOT fire
                expected_response_time_seconds=0,  # N/A
                clinical_notes="VALIDATION TEST: Glucose 68 (normal). System should NOT alert. Measure false-positive rate.",
                mdr_reportable=False,
                device_involvement=True  # Alert system over-sensitivity
            ),
        ]


# ============================================================================
# EXPORT & VALIDATION
# ============================================================================

def export_adverse_events_to_json(filepath: str):
    """Export all adverse event scenarios as FHIR Bundle."""
    scenarios = AdverseEventLibrary.get_all_scenarios()

    bundle = {
        "resourceType": "Bundle",
        "type": "transaction",
        "entry": [],
        "total": len(scenarios),
        "description": "Adverse Event Test Scenarios for FDA 510(k) Validation"
    }

    for scenario in scenarios:
        bundle["entry"].append({
            "resource": scenario.to_fhir_adverse_event(),
            "request": {"method": "POST", "url": "AdverseEvent"}
        })

    with open(filepath, 'w') as f:
        json.dump(bundle, f, indent=2)

    print(f"✅ Exported {len(scenarios)} adverse event scenarios to {filepath}")

    # Summary
    severity_counts = {}
    event_type_counts = {}
    for scenario in scenarios:
        severity = scenario.severity.name
        event_type = scenario.event_type.name

        severity_counts[severity] = severity_counts.get(severity, 0) + 1
        event_type_counts[event_type] = event_type_counts.get(event_type, 0) + 1

    print(f"\n📊 Scenario Summary:")
    print(f"   By severity:")
    for severity, count in sorted(severity_counts.items()):
        print(f"     - {severity}: {count}")

    print(f"   By event type (top 5):")
    for event_type, count in sorted(event_type_counts.items(), key=lambda x: -x[1])[:5]:
        print(f"     - {event_type}: {count}")

    mdr_reportable = sum(1 for s in scenarios if s.mdr_reportable)
    print(f"   MDR-reportable events: {mdr_reportable}/{len(scenarios)}")


if __name__ == "__main__":
    import sys

    output_file = sys.argv[1] if len(sys.argv) > 1 else "adverse_event_scenarios.json"
    print(f"💾 Generating adverse event scenarios...")
    export_adverse_events_to_json(output_file)
