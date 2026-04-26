# Technical Flow 6: Post-Market Surveillance (Clinical Monitoring & Adverse Event Reporting)

**Document:** Post-Market Clinical Surveillance & Regulatory Reporting  
**Standard:** FDA guidance on post-market surveillance, ISO 14971 §5.4 (post-market evaluation)  
**Compliance:** 21 CFR 803 (Medical Device Reporting / MDR), IEC 62304 §5.8 (post-release)  
**Architecture:** Real-time clinical event capture → adverse event detection → FDA reporting  
**Version:** 1.0  
**Date:** April 25, 2026

---

## Overview

This document defines the post-market surveillance mechanisms for the enterprise medical device platform, ensuring continuous monitoring for adverse events and rapid regulatory reporting.

**Key Components:**
- **Clinical Event Capture** — every clinical decision/alert captured in audit trail
- **Adverse Event Detection** — automated pattern matching for safety signals
- **Causality Assessment** — determine if device caused patient harm
- **Medical Device Reporting (MDR)** — FDA reporting for serious injuries/deaths
- **Risk Monitoring** — hazard-specific adverse event patterns
- **Continuous Improvement** — use surveillance data to improve design

**Timelines:**
- **Immediate Alert** (Critical adverse event detected) → escalate to clinical team
- **72 Hours** (Serious injury/death where device might be cause) → submit initial MDR
- **30 Days** (Final MDR submission with investigation results)
- **Quarterly** (Safety report to FDA if >5 adverse events)
- **Annual** (Post-market surveillance summary for FDA)

---

## Part A: Clinical Event Capture

### 1.1 Event Types Captured

Every clinical decision/alert triggers an audit trail event:

```
Clinical Event Type           Trigger                    Data Captured
─────────────────────────────────────────────────────────────────────────
Vital Sign Monitored          HR/BP/O2 measurement       Value + threshold
Alert Generated               Value exceeds threshold    Alert type + severity
Medication Prescribed         Clinician action           Drug + dose + patient
Drug Interaction Alert        Multiple drugs prescribed  Interacting pair + severity
Lab Result Entered            Test completed            Result + reference range
Abnormal Result Flagged       Value out of range        Test + value + flag
Clinical Note Documented      Clinician charting        Note type + content (redacted)
Patient Admitted              Admission event           Admission reason
Patient Discharged            Discharge event           Discharge status
Clinical Outcome Recorded     ICU stay, death, etc.     Outcome type + date
```

### 1.2 Event Capture Implementation

```python
class ClinicalEventCapture:
    """Capture clinical events for post-market surveillance."""
    
    def record_clinical_event(self, event_type, patient_id, clinical_data, 
                            clinician_id=None, alert_generated=False):
        """
        Capture a clinical event.
        
        Every clinical decision is recorded for later analysis.
        Examples: vital sign monitoring, alert, medication order, etc.
        """
        
        event = {
            "event_id": self._generate_event_id(),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "event_type": event_type,
            "patient_id": patient_id,
            "clinician_id": clinician_id,
            "clinical_data": clinical_data,
            "alert_generated": alert_generated,
            "platform_version": self._get_platform_version()
        }
        
        # Store in clinical events database
        self.db.insert_clinical_event(event)
        
        # Log to audit trail (Flow 2)
        audit.log_event(
            event_type=f"clinical_event_{event_type}",
            user_id=clinician_id or "system",
            resource_id=f"Patient-{patient_id}",
            action="RECORD",
            context={
                "event_id": event["event_id"],
                "clinical_data": clinical_data,
                "alert_generated": alert_generated
            }
        )
        
        # If alert: check for adverse event patterns
        if alert_generated:
            self._check_adverse_event_patterns(patient_id, event)
        
        return event["event_id"]
    
    def record_vital_signs(self, patient_id, vital_signs):
        """
        Record vital signs measurement.
        
        Args:
            vital_signs: {
                "heart_rate": 145,
                "blood_pressure_sys": 160,
                "blood_pressure_dia": 95,
                "oxygen_saturation": 88,
                "temperature": 39.2,
                "respiratory_rate": 28
            }
        """
        
        # Check thresholds
        alerts = []
        
        if vital_signs["heart_rate"] > 120:
            alerts.append("TACHYCARDIA")
        
        if vital_signs["blood_pressure_sys"] > 180:
            alerts.append("HYPERTENSION")
        
        if vital_signs["oxygen_saturation"] < 90:
            alerts.append("HYPOXEMIA")
        
        if vital_signs["temperature"] > 38.5:
            alerts.append("FEVER")
        
        if vital_signs["respiratory_rate"] > 25:
            alerts.append("TACHYPNEA")
        
        # Record event
        event_id = self.record_clinical_event(
            event_type="vital_signs_monitored",
            patient_id=patient_id,
            clinical_data=vital_signs,
            alert_generated=len(alerts) > 0
        )
        
        # If alerts: generate alert to clinician
        if alerts:
            for alert_type in alerts:
                self._send_alert_to_clinician(
                    patient_id=patient_id,
                    alert_type=alert_type,
                    vital_value=vital_signs,
                    clinical_event_id=event_id
                )
        
        return event_id
    
    def record_medication_order(self, patient_id, clinician_id, medication):
        """
        Record medication order.
        
        Args:
            medication: {
                "drug_name": "Warfarin",
                "dose": "5 mg",
                "route": "PO",
                "frequency": "daily",
                "indication": "Atrial fibrillation"
            }
        """
        
        # Check for drug interactions
        existing_meds = self.db.get_patient_medications(patient_id)
        interactions = self._check_drug_interactions(medication, existing_meds)
        
        # Record event
        event_id = self.record_clinical_event(
            event_type="medication_ordered",
            patient_id=patient_id,
            clinician_id=clinician_id,
            clinical_data={
                "medication": medication,
                "interactions": interactions
            },
            alert_generated=len(interactions) > 0
        )
        
        # If interactions: alert clinician
        if interactions:
            self._send_interaction_alert(
                patient_id=patient_id,
                new_drug=medication["drug_name"],
                existing_drugs=existing_meds,
                interactions=interactions,
                clinical_event_id=event_id
            )
        
        return event_id
```

---

## Part B: Adverse Event Detection & Pattern Matching

### 2.1 Adverse Event Pattern Recognition

```python
class AdverseEventDetector:
    """Detect adverse events from clinical event stream."""
    
    def detect_adverse_events(self):
        """
        Run continuous surveillance (hourly) looking for adverse event patterns.
        
        Patterns indicate potential device-caused harm:
        - Multiple failed alerts in sequence
        - Rapid vital sign deterioration without alert
        - Medication interaction warnings followed by adverse outcome
        - System unavailability during critical event
        """
        
        # Pattern 1: Alert failure -> patient deterioration
        alert_failures = self._detect_alert_failures()
        
        for failure in alert_failures:
            self._investigate_alert_failure(failure)
        
        # Pattern 2: Vital sign anomaly -> no alert generated
        missed_alerts = self._detect_missed_alerts()
        
        for missed_alert in missed_alerts:
            self._investigate_missed_alert(missed_alert)
        
        # Pattern 3: Medication interaction -> adverse outcome
        interaction_outcomes = self._detect_interaction_outcomes()
        
        for outcome in interaction_outcomes:
            self._investigate_interaction_outcome(outcome)
        
        # Pattern 4: System availability -> patient deterioration
        availability_incidents = self._detect_availability_incidents()
        
        for incident in availability_incidents:
            self._investigate_availability_incident(incident)
    
    def _detect_alert_failures(self):
        """
        Pattern: Alert generated but clinician didn't acknowledge/act.
        Followed by patient adverse event (rapid deterioration, death, injury).
        """
        
        alerts_not_acknowledged = self.db.execute("""
            SELECT ce.patient_id, ce.event_id, ce.timestamp,
                   ce.clinical_data->>'alert_type' as alert_type
            FROM clinical_events ce
            WHERE ce.event_type = 'alert_generated'
            AND ce.timestamp > NOW() - INTERVAL 48 HOURS
            AND NOT EXISTS (
              SELECT 1 FROM clinical_events ce2
              WHERE ce2.patient_id = ce.patient_id
              AND ce2.event_type IN ('alert_acknowledged', 'medication_ordered', 
                                     'clinical_note_documented')
              AND ce2.timestamp BETWEEN ce.timestamp AND ce.timestamp + INTERVAL 1 HOUR
            )
        """)
        
        investigations = []
        
        for alert in alerts_not_acknowledged:
            # Check if patient had adverse outcome shortly after
            outcome = self.db.execute("""
                SELECT event_type, timestamp, clinical_data
                FROM clinical_events
                WHERE patient_id = ?
                AND timestamp BETWEEN ? AND ?
                AND event_type IN ('adverse_outcome', 'death', 'icu_admission',
                                   'rapid_deterioration')
            """, (alert["patient_id"], alert["timestamp"], 
                  alert["timestamp"] + timedelta(hours=24)))
            
            if outcome:
                investigations.append({
                    "pattern": "alert_failure",
                    "patient_id": alert["patient_id"],
                    "alert_event_id": alert["event_id"],
                    "alert_type": alert["alert_type"],
                    "alert_timestamp": alert["timestamp"],
                    "adverse_outcome": outcome[0],
                    "time_gap_hours": (outcome[0]["timestamp"] - alert["timestamp"]).total_seconds() / 3600
                })
        
        return investigations
    
    def _detect_missed_alerts(self):
        """
        Pattern: Vital sign out of normal range, but alert not generated.
        
        Example: Oxygen saturation 87% (below normal) but no hypoxemia alert sent.
        This could indicate:
        - Device failure to detect anomaly
        - Threshold set incorrectly
        - Patient monitoring paused
        """
        
        missed_alerts = self.db.execute("""
            SELECT patient_id, event_type, timestamp,
                   clinical_data->>'value' as vital_value,
                   clinical_data->>'threshold' as threshold
            FROM clinical_events
            WHERE event_type = 'vital_signs_monitored'
            AND timestamp > NOW() - INTERVAL 30 DAYS
            AND (clinical_data->>'value')::float < 
                (clinical_data->>'min_threshold')::float
            AND alert_generated = FALSE
        """)
        
        return missed_alerts
    
    def _detect_interaction_outcomes(self):
        """
        Pattern: Drug interaction alert issued, then patient adverse outcome.
        
        Assess: Did device fail to prevent harmful interaction?
        """
        
        interaction_alerts = self.db.execute("""
            SELECT ce1.patient_id, ce1.event_id, ce1.timestamp,
                   ce1.clinical_data->>'interactions' as interactions
            FROM clinical_events ce1
            WHERE ce1.event_type = 'medication_ordered'
            AND ce1.clinical_data @> '{"interactions": []}'::jsonb
            AND ce1.timestamp > NOW() - INTERVAL 30 DAYS
        """)
        
        outcomes = []
        
        for alert in interaction_alerts:
            # Check if adverse outcome followed
            adverse = self.db.execute("""
                SELECT event_type, timestamp, clinical_data
                FROM clinical_events
                WHERE patient_id = ?
                AND timestamp BETWEEN ? AND ?
                AND event_type IN ('adverse_outcome', 'rapid_deterioration',
                                   'abnormal_lab_result')
            """, (alert["patient_id"], alert["timestamp"], 
                  alert["timestamp"] + timedelta(days=3)))
            
            if adverse:
                outcomes.append({
                    "pattern": "interaction_outcome",
                    "patient_id": alert["patient_id"],
                    "interaction_alert_id": alert["event_id"],
                    "interactions": alert["interactions"],
                    "adverse_outcome": adverse[0]
                })
        
        return outcomes
```

---

## Part C: Causality Assessment (Medical Device Reporting)

### 3.1 Causality Assessment Framework

```python
class CausalityAssessment:
    """
    Determine if device caused patient harm (triggers MDR).
    
    FDA Framework: Is there a reasonable possibility the device caused/contributed
    to a serious injury or death?
    """
    
    def assess_causality(self, patient_id, adverse_event):
        """
        Assess causality between device and adverse event.
        
        Returns: 
        - device_role: "definite_cause" / "probable_cause" / "possible_cause" / "unlikely"
        - confidence_score: 0.0 to 1.0
        - mdr_reportable: True/False
        """
        
        # Gather evidence
        platform_events = self._get_platform_events_for_patient(
            patient_id=patient_id,
            time_window=(-48, +48)  # 48 hours before/after adverse event
        )
        
        clinical_factors = {
            "adverse_event_type": adverse_event["event_type"],
            "timing": adverse_event["timestamp"],
            "severity": adverse_event.get("severity"),
            "clinical_context": adverse_event.get("clinical_context")
        }
        
        # Scoring factors
        evidence_score = 0.0
        evidence_factors = []
        
        # Factor 1: Device malfunction during adverse event
        if self._was_device_malfunction(platform_events, adverse_event):
            evidence_score += 0.4
            evidence_factors.append("device_malfunction_detected")
        
        # Factor 2: Failed alert that should have fired
        if self._was_alert_failure(platform_events, adverse_event):
            evidence_score += 0.3
            evidence_factors.append("alert_failure")
        
        # Factor 3: Incorrect alert (false positive → harm)
        if self._was_incorrect_alert(platform_events, adverse_event):
            evidence_score += 0.2
            evidence_factors.append("incorrect_alert")
        
        # Factor 4: System unavailability during critical time
        if self._was_unavailable(platform_events, adverse_event):
            evidence_score += 0.15
            evidence_factors.append("system_unavailable")
        
        # Factor 5: Alternative explanations
        alternative_causes = self._assess_alternative_causes(
            patient_id, adverse_event
        )
        evidence_score -= (0.1 * len(alternative_causes))
        
        if alternative_causes:
            evidence_factors.append(f"alternative_causes: {alternative_causes}")
        
        # Clamp score to 0.0-1.0
        evidence_score = max(0.0, min(1.0, evidence_score))
        
        # Determine device role
        if evidence_score > 0.7:
            device_role = "probable_cause"
        elif evidence_score > 0.5:
            device_role = "possible_cause"
        elif evidence_score > 0.2:
            device_role = "remote_possibility"
        else:
            device_role = "unlikely"
        
        # FDA MDR reportable if:
        # - Serious injury/death (severity >= HIGH)
        # - Device probable/definite cause
        mdr_reportable = (
            clinical_factors["severity"] in ["HIGH", "CRITICAL"] and
            device_role in ["probable_cause", "definite_cause"]
        )
        
        assessment = {
            "patient_id": patient_id,
            "adverse_event_id": adverse_event["event_id"],
            "device_role": device_role,
            "confidence_score": evidence_score,
            "evidence_factors": evidence_factors,
            "alternative_causes": alternative_causes,
            "mdr_reportable": mdr_reportable,
            "assessment_date": datetime.utcnow().isoformat(),
            "assessed_by": "system"
        }
        
        return assessment
    
    def _was_device_malfunction(self, platform_events, adverse_event):
        """Check if device had critical failures near adverse event."""
        
        critical_events = [
            e for e in platform_events
            if e["event_type"] in ["system_error", "database_error", 
                                  "service_unavailable", "authentication_failure"]
            and e["severity"] == "CRITICAL"
        ]
        
        # If critical error within 1 hour of adverse event
        for event in critical_events:
            time_diff = abs((event["timestamp"] - adverse_event["timestamp"]).total_seconds())
            if time_diff < 3600:  # 1 hour
                return True
        
        return False
    
    def _was_alert_failure(self, platform_events, adverse_event):
        """Check if device failed to generate expected alert."""
        
        # What alert should have fired?
        expected_alert = self._determine_expected_alert(adverse_event)
        
        # Was that alert generated?
        alerts_generated = [
            e for e in platform_events
            if e["event_type"] == "alert_generated"
            and e["clinical_data"].get("alert_type") == expected_alert
        ]
        
        # If expected alert not found: failure
        if not alerts_generated:
            return True
        
        # If alert found but clinician didn't acknowledge: still a failure
        acknowledged_alerts = [
            e for e in platform_events
            if e["event_type"] == "alert_acknowledged"
        ]
        
        if alerts_generated and not acknowledged_alerts:
            return True
        
        return False
    
    def _assess_alternative_causes(self, patient_id, adverse_event):
        """
        List alternative explanations for adverse event.
        
        Examples:
        - Patient comorbidity (diabetes, heart disease)
        - Medication side effect
        - Clinician error
        - Natural disease progression
        """
        
        patient = self.db.get_patient(patient_id)
        
        alternative_causes = []
        
        # Comorbidities?
        if patient.get("comorbidities"):
            alternative_causes.extend(patient["comorbidities"])
        
        # Recent medication changes?
        recent_meds = self.db.execute("""
            SELECT medication, timestamp FROM medication_events
            WHERE patient_id = ? AND timestamp > NOW() - INTERVAL 7 DAYS
        """, (patient_id,))
        
        if recent_meds:
            alternative_causes.append("recent_medication_change")
        
        # Clinician documentation of other causes?
        clinical_notes = self.db.execute("""
            SELECT content FROM clinical_notes
            WHERE patient_id = ? AND timestamp > NOW() - INTERVAL 24 HOURS
        """, (patient_id,))
        
        for note in clinical_notes:
            if any(cause in note["content"].lower() 
                  for cause in ["infection", "sepsis", "stroke", "cardiac"]):
                alternative_causes.append(f"documented: {cause}")
        
        return alternative_causes
```

---

## Part D: Medical Device Reporting (MDR)

### 4.1 MDR Submission Workflow

```python
class MDRReporting:
    """FDA Medical Device Reporting (21 CFR 803)."""
    
    def create_mdr_report(self, causality_assessment):
        """
        Create and submit MDR (Medical Device Reporting) to FDA.
        
        Timeline:
        - 5 business days: preliminary report (if death/serious injury)
        - 30 calendar days: final comprehensive report
        
        Device = if serious injury or death
        """
        
        patient_id = causality_assessment["patient_id"]
        adverse_event = self.db.get_clinical_event(
            causality_assessment["adverse_event_id"]
        )
        
        # Create MDR record
        mdr_report = {
            "mdr_id": self._generate_mdr_id(),
            "submission_type": "INITIAL",  # Or "FOLLOWUP"
            "date_of_event": adverse_event["timestamp"].date(),
            "date_received_by_company": datetime.utcnow().date(),
            
            "device_information": {
                "device_name": "Enterprise Medical Device Platform",
                "version": self._get_platform_version(),
                "lot_number": "N/A (software)",
                "serial_number": "N/A"
            },
            
            "patient_information": {
                "age": self._get_patient_age(patient_id),
                "sex": self.db.get_patient_sex(patient_id),
                "weight_kg": self.db.get_patient_weight(patient_id),
                # Note: PII redacted in actual submission
            },
            
            "adverse_event": {
                "event_type": adverse_event["event_type"],
                "event_description": adverse_event.get("description"),
                "date_of_event": adverse_event["timestamp"],
                "outcome": self._get_event_outcome(adverse_event),
                "severity": adverse_event.get("severity")
            },
            
            "device_role": {
                "device_caused_harm": causality_assessment["mdr_reportable"],
                "role_in_event": causality_assessment["device_role"],
                "confidence_score": causality_assessment["confidence_score"],
                "evidence": causality_assessment["evidence_factors"]
            },
            
            "investigation_results": {
                "root_cause": self._get_root_cause(adverse_event),
                "corrective_actions": self._get_corrective_actions(adverse_event)
            },
            
            "company_information": {
                "company_name": "Medical Device Company",
                "contact_person": "Compliance Officer",
                "phone": "+1-555-1234"
            },
            
            "submission_timestamp": datetime.utcnow(),
            "status": "READY_FOR_SUBMISSION"
        }
        
        # Save MDR report
        mdr_id = self.db.save_mdr_report(mdr_report)
        
        # Audit log
        audit.log_event(
            event_type="mdr_report_created",
            user_id="system",
            resource_id=f"Patient-{patient_id}",
            action="CREATE",
            context={
                "mdr_id": mdr_id,
                "adverse_event_id": adverse_event["event_id"],
                "device_role": causality_assessment["device_role"]
            }
        )
        
        # Alert compliance officer
        self._notify_compliance_officer(
            subject="New MDR Report Created",
            mdr_id=mdr_id,
            event_description=adverse_event.get("description"),
            device_role=causality_assessment["device_role"]
        )
        
        return mdr_id
    
    def submit_mdr_to_fda(self, mdr_id):
        """
        Submit final MDR to FDA.
        
        Via: MedWatch (FDA online portal) or eCopy (encrypted email)
        """
        
        mdr_report = self.db.get_mdr_report(mdr_id)
        
        # Validate before submission
        validation_errors = self._validate_mdr_report(mdr_report)
        if validation_errors:
            raise MDRValidationError(f"MDR invalid: {validation_errors}")
        
        # Convert to FDA format (XML or PDF)
        fda_form_3500a = self._create_fda_form_3500a(mdr_report)
        
        # Encrypt and submit via MedWatch
        submission_id = self._submit_to_medwatch(fda_form_3500a)
        
        # Update MDR status
        self.db.update_mdr_status(mdr_id, "SUBMITTED", submission_id)
        
        # Audit log
        audit.log_event(
            event_type="mdr_submitted_to_fda",
            user_id="compliance_officer@company.com",
            resource_id=f"MDR-{mdr_id}",
            action="SUBMIT",
            context={
                "submission_id": submission_id,
                "submission_date": datetime.utcnow().isoformat(),
                "form_type": "FDA Form 3500A"
            }
        )
        
        return submission_id
```

### 4.2 MDR Timeline Compliance

```
Timeline Requirements (FDA):
──────────────────────────

1. Evaluation Phase
   Day 0: Adverse event identified
   Day 0: Causality assessment (is device probable cause?)
   Day 0: If YES → trigger MDR process

2. Preliminary Report (5 business days)
   For: Deaths & serious injuries potentially caused by device
   Contents: Event description, causality evidence, company ID
   
   Day 1: Create preliminary MDR report
   Day 5: Submit preliminary report to FDA

3. Comprehensive Report (30 calendar days)
   For: All MDRs
   Contents: Full investigation, root cause, corrective actions
   
   Day 6-29: Conduct investigation, gather evidence
   Day 30: Submit final comprehensive report to FDA
```

---

## Part E: Adverse Event Tracking & Trends

### 5.1 Surveillance Dashboard

```python
class SurveillanceDashboard:
    """Real-time post-market surveillance dashboard."""
    
    def get_surveillance_metrics(self, time_period="last_30_days"):
        """
        Get post-market surveillance metrics for monitoring.
        
        Returns: Dashboard data showing:
        - Clinical events captured
        - Adverse events detected
        - Alert accuracy
        - System performance metrics
        - MDR reports submitted
        """
        
        if time_period == "last_30_days":
            start_date = datetime.utcnow() - timedelta(days=30)
        elif time_period == "last_90_days":
            start_date = datetime.utcnow() - timedelta(days=90)
        else:
            start_date = datetime.utcnow() - timedelta(days=365)
        
        # Clinical Events
        total_events = self.db.count_clinical_events(
            start_date=start_date
        )
        
        alerts_generated = self.db.count_clinical_events(
            start_date=start_date,
            event_type="alert_generated"
        )
        
        # Adverse Events
        adverse_events = self.db.count_adverse_events(
            start_date=start_date
        )
        
        adverse_events_by_type = self.db.group_adverse_events_by_type(
            start_date=start_date
        )
        
        # Alert Performance
        alert_accuracy = self._calculate_alert_accuracy(start_date)
        
        # MDR Reports
        mdr_reports = self.db.count_mdr_reports(
            start_date=start_date,
            status="SUBMITTED"
        )
        
        mdr_pending = self.db.count_mdr_reports(
            start_date=start_date,
            status="PENDING"
        )
        
        # System Performance
        system_uptime = self._calculate_system_uptime(start_date)
        alert_latency_ms = self._get_alert_latency(start_date)
        
        return {
            "time_period": time_period,
            "start_date": start_date.isoformat(),
            
            "clinical_events": {
                "total": total_events,
                "alerts_generated": alerts_generated,
                "alert_rate": alerts_generated / max(total_events, 1),
            },
            
            "adverse_events": {
                "total": adverse_events,
                "by_type": adverse_events_by_type,
                "trending": self._assess_trend(adverse_events, time_period)
            },
            
            "alert_performance": {
                "accuracy": alert_accuracy,
                "sensitivity": self._calculate_sensitivity(start_date),
                "specificity": self._calculate_specificity(start_date)
            },
            
            "regulatory": {
                "mdr_submitted": mdr_reports,
                "mdr_pending": mdr_pending,
                "urgent_actions_required": self._count_urgent_actions()
            },
            
            "system_health": {
                "uptime_percent": system_uptime,
                "alert_latency_ms": alert_latency_ms,
                "critical_errors": self._count_critical_errors(start_date)
            }
        }
    
    def _calculate_alert_accuracy(self, start_date):
        """
        Alert accuracy = (True Positives) / (True Positives + False Positives)
        
        True Positive: Alert fired, clinician action followed
        False Positive: Alert fired, but was clinician knew it was wrong
        """
        
        alerts_followed = self.db.count_alerts_with_action(start_date)
        total_alerts = self.db.count_clinical_events(
            start_date=start_date,
            event_type="alert_generated"
        )
        
        return alerts_followed / max(total_alerts, 1)
```

---

## Part F: Continuous Improvement

### 6.1 Safety Signals → Design Changes

```python
class SafetySignalAnalysis:
    """
    Identify safety signals from post-market data.
    Feed back into design improvements (SDLC Flow 1).
    """
    
    def analyze_safety_signals(self):
        """
        Pattern analysis: Are there emerging trends suggesting device defect?
        
        Safety signal = unusual pattern in adverse events
        Example: Sudden spike in hypoxemia alerts not followed by patient improvement
        """
        
        # Get adverse event time series
        events_by_week = self.db.execute("""
            SELECT DATE_TRUNC('week', timestamp) as week,
                   event_type,
                   COUNT(*) as count
            FROM clinical_events
            WHERE event_type IN ('adverse_event', 'adverse_outcome', 'death')
            GROUP BY week, event_type
            ORDER BY week DESC
        """)
        
        # Statistical analysis: is count unusually high?
        historical_avg = self._get_historical_average(events_by_week)
        current_count = events_by_week[0]["count"]
        std_dev = self._calculate_std_dev(events_by_week)
        
        # Signal detection: >2 std devs above mean = signal
        if current_count > (historical_avg + 2 * std_dev):
            signal = {
                "type": "unusual_adverse_event_cluster",
                "severity": "HIGH",
                "event_type": events_by_week[0]["event_type"],
                "current_count": current_count,
                "expected_count": historical_avg,
                "std_devs_above_mean": (current_count - historical_avg) / max(std_dev, 1),
                "recommendation": "Investigate root cause + notify FDA"
            }
            
            # Create action item
            self._create_safety_investigation(signal)
            
            # Notify compliance officer
            self._alert_compliance_officer(
                severity="CRITICAL",
                subject="Safety Signal Detected",
                signal_description=f"{signal['event_type']}: {current_count} events "
                                   f"(expected ~{historical_avg}, +{2 * std_dev} threshold)",
                action_required="Investigate root cause + FDA notification decision"
            )
```

---

## Part G: Quarterly & Annual Reporting

### 7.1 Quarterly Safety Report

```python
class QuarterlyReporting:
    """Generate quarterly post-market surveillance reports for FDA."""
    
    def generate_quarterly_report(self, quarter, year):
        """
        FDA requires quarterly reports if >5 adverse events reported in quarter.
        """
        
        start_date = self._get_quarter_start(quarter, year)
        end_date = self._get_quarter_end(quarter, year)
        
        # Collect data
        mdr_count = self.db.count_mdr_reports(
            start_date=start_date,
            end_date=end_date,
            status="SUBMITTED"
        )
        
        adverse_events = self.db.get_adverse_events(
            start_date=start_date,
            end_date=end_date
        )
        
        corrective_actions = self.db.get_corrective_actions(
            start_date=start_date,
            end_date=end_date
        )
        
        # If >=5 adverse events: FDA report required
        if mdr_count >= 5:
            report = {
                "report_period": f"Q{quarter} {year}",
                "start_date": start_date,
                "end_date": end_date,
                "mdr_count": mdr_count,
                "adverse_events_summary": self._summarize_adverse_events(adverse_events),
                "corrective_actions": corrective_actions,
                "regulatory_status": "FDA NOTIFICATION REQUIRED",
                "prepared_by": "Compliance Officer",
                "prepared_date": datetime.utcnow()
            }
            
            # Submit to FDA
            self._submit_quarterly_report_to_fda(report)
            
            # Audit log
            audit.log_event(
                event_type="quarterly_report_submitted",
                user_id="compliance@company.com",
                resource_id=f"Report-Q{quarter}-{year}",
                action="SUBMIT",
                context={
                    "mdr_count": mdr_count,
                    "adverse_events_count": len(adverse_events)
                }
            )
```

---

## Summary

This post-market surveillance flow provides:

✅ **Clinical Event Capture** — every clinical decision logged to audit trail  
✅ **Adverse Event Detection** — real-time pattern matching identifies safety signals  
✅ **Causality Assessment** — determine if device caused patient harm  
✅ **Medical Device Reporting** — FDA MDR submission (5-30 day timeline)  
✅ **Trend Analysis** — identify emerging safety issues  
✅ **Regulatory Compliance** — quarterly/annual reporting to FDA  
✅ **Continuous Improvement** — safety data feeds back to design (SDLC)

**Expected Performance:**
- Adverse event detection: <24 hours
- MDR preliminary submission: <5 business days
- MDR final submission: <30 calendar days
- FDA quarterly report: submitted if ≥5 adverse events

**FDA Submission Ready:** Q3 2027 — post-clearance deployment begins post-market surveillance

**Integration:** Clinical events → Audit Trail (Flow 2) → Analysis → Regulatory Decision

**Next Step:** Complete technical stack now includes all 6 flows for enterprise medical device software excellence.

