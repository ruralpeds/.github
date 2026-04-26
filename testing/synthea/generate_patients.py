#!/usr/bin/env python3
"""
Synthea Patient Data Generator
Generates synthetic FHIR R4 patient data for medical device platform testing.

Compliance: IEC 62304 V&V, FDA 510(k) clinical evidence generation
Purpose: Create realistic patient scenarios with normal/abnormal vitals,
         medications, comorbidities, and adverse event triggers for:
         - Load testing (throughput/latency)
         - System validation (alert triggering)
         - Clinical accuracy testing (false positive/negative rates)

Version: 1.0 (April 25, 2026)
"""

import json
import random
import uuid
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from enum import Enum


# ============================================================================
# VITAL SIGN RANGES (Normal vs. Abnormal)
# ============================================================================

class VitalRange:
    """Clinical vital sign ranges for validation."""

    # Heart rate (bpm)
    HR_MIN_NORMAL = 60
    HR_MAX_NORMAL = 100
    HR_CRITICAL_LOW = 40
    HR_CRITICAL_HIGH = 150

    # Systolic BP (mmHg)
    SYS_MIN_NORMAL = 90
    SYS_MAX_NORMAL = 120
    SYS_HYPERTENSIVE = 180
    SYS_HYPOTENSIVE = 70

    # Diastolic BP (mmHg)
    DIA_MIN_NORMAL = 60
    DIA_MAX_NORMAL = 80
    DIA_HYPERTENSIVE = 120

    # Respiratory rate (breaths/min)
    RR_MIN_NORMAL = 12
    RR_MAX_NORMAL = 20
    RR_TACHYPNEA = 30
    RR_BRADYPNEA = 8

    # Temperature (Celsius)
    TEMP_MIN_NORMAL = 36.5
    TEMP_MAX_NORMAL = 37.5
    TEMP_FEVER = 38.5
    TEMP_HYPOTHERMIA = 35.0

    # SpO2 (%)
    O2_SAT_MIN_NORMAL = 95
    O2_SAT_HYPOXEMIA = 90

    # Glucose (mg/dL, fasting)
    GLUCOSE_MIN_NORMAL = 70
    GLUCOSE_MAX_NORMAL = 100
    GLUCOSE_PREDIABETES = 126
    GLUCOSE_DIABETES = 200
    GLUCOSE_SEVERE_HYPO = 40
    GLUCOSE_SEVERE_HYPER = 350


class PatientCondition(Enum):
    """Common chronic conditions (ICD-10)."""
    HEALTHY = "healthy"
    TYPE2_DIABETES = "E11"          # Type 2 diabetes
    HYPERTENSION = "I10"             # Essential hypertension
    CHRONIC_KIDNEY_DISEASE = "N18"   # Chronic kidney disease
    ASTHMA = "J45"                   # Asthma
    COPD = "J44"                     # Chronic obstructive pulmonary disease
    HEART_FAILURE = "I50"            # Heart failure
    ATRIAL_FIBRILLATION = "I48"      # Atrial fibrillation


class VitalPattern(Enum):
    """Vital sign patterns for scenarios."""
    NORMAL = "normal"                    # All vitals within normal range
    HYPERTENSIVE = "hypertensive"        # High BP (uncontrolled)
    HYPOGLYCEMIC = "hypoglycemic"        # Low glucose (diabetes complication)
    HYPERGLYCEMIC = "hyperglycemic"      # High glucose (diabetes crisis)
    SEPTIC = "septic"                    # Sepsis pattern (HR↑, RR↑, Temp↑, WBC↑)
    TACHYCARDIC = "tachycardic"          # Fast heart rate
    HYPOXEMIC = "hypoxemic"              # Low oxygen saturation
    COMBINED_ABNORMAL = "combined_abnormal"  # Multiple abnormalities


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class VitalSign:
    """Single vital sign observation."""
    timestamp: str
    vital_type: str  # "heart_rate", "blood_pressure", "temperature", etc.
    value: float
    unit: str
    status: str  # "normal", "abnormal", "critical"

    def to_fhir_observation(self) -> Dict:
        """Convert to FHIR R4 Observation resource."""
        return {
            "resourceType": "Observation",
            "id": str(uuid.uuid4()),
            "status": "final",
            "category": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    "code": "vital-signs",
                    "display": "Vital Signs"
                }]
            }],
            "code": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": self._get_loinc_code(),
                    "display": self.vital_type
                }]
            },
            "subject": {"reference": "Patient/[patient_id]"},
            "effectiveDateTime": self.timestamp,
            "valueQuantity": {
                "value": self.value,
                "unit": self.unit,
                "system": "http://unitsofmeasure.org"
            },
            "interpretation": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                    "code": self._get_interpretation_code()
                }]
            }]
        }

    def _get_loinc_code(self) -> str:
        """Return LOINC code for vital type."""
        codes = {
            "heart_rate": "8867-4",
            "blood_pressure_systolic": "8480-6",
            "blood_pressure_diastolic": "8462-4",
            "temperature": "8310-5",
            "respiratory_rate": "9279-1",
            "oxygen_saturation": "2708-6",
            "glucose": "2345-7",
            "white_blood_cells": "6690-2"
        }
        return codes.get(self.vital_type, "unknown")

    def _get_interpretation_code(self) -> str:
        """Return interpretation code (N=normal, H=high, L=low, C=critical)."""
        if self.status == "normal":
            return "N"
        elif self.status == "abnormal":
            return "H" if self.value > 100 else "L"
        elif self.status == "critical":
            return "C"
        return "U"  # Unknown


@dataclass
class Patient:
    """Synthetic FHIR patient with vitals and conditions."""
    id: str
    first_name: str
    last_name: str
    mrn: str
    dob: str
    gender: str
    conditions: List[PatientCondition]
    medications: List[Dict]
    vital_pattern: VitalPattern
    vitals_observations: List[VitalSign] = None

    def __post_init__(self):
        if self.vitals_observations is None:
            self.vitals_observations = []

    def to_fhir_patient(self) -> Dict:
        """Convert to FHIR R4 Patient resource."""
        return {
            "resourceType": "Patient",
            "id": self.id,
            "identifier": [{
                "system": "urn:oid:1.2.840.113619.6.999",
                "value": self.mrn
            }],
            "name": [{
                "use": "official",
                "given": [self.first_name],
                "family": self.last_name
            }],
            "gender": self.gender.lower(),
            "birthDate": self.dob,
            "address": [{
                "use": "home",
                "type": "both",
                "text": "[Generated address]",
                "city": "[Synthetic city]",
                "state": "[Synthetic state]",
                "postalCode": "[Synthetic zip]",
                "country": "US"
            }],
            "telecom": [{
                "system": "phone",
                "value": f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
            }],
            "extension": [{
                "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
                "valueCodeableConcept": {
                    "coding": [{
                        "system": "urn:oid:2.16.840.1.113883.6.238",
                        "code": random.choice(["2106-3", "2054-5", "1002-5", "2028-9"]),  # Race codes
                        "display": random.choice(["White", "Black/AA", "Native American", "Asian"])
                    }]
                }
            }]
        }

    def add_vital_observation(self, vital: VitalSign):
        """Add a vital sign observation."""
        self.vitals_observations.append(vital)


# ============================================================================
# PATIENT GENERATOR
# ============================================================================

class SyntheticPatientGenerator:
    """Generate realistic synthetic patients with vital signs."""

    def __init__(self, seed: int = 12345):
        """Initialize with random seed for reproducibility."""
        random.seed(seed)
        self.patients: List[Patient] = []

    def generate_population(self, count: int) -> List[Patient]:
        """Generate N synthetic patients with realistic distributions."""
        for i in range(count):
            patient = self._generate_single_patient(i)
            self.patients.append(patient)
        return self.patients

    def _generate_single_patient(self, index: int) -> Patient:
        """Generate single patient with demographics, conditions, vitals."""
        patient_id = f"patient-{index:05d}"
        mrn = f"MRN-{uuid.uuid4().hex[:8].upper()}"
        first_name = random.choice(["John", "Jane", "Robert", "Patricia", "Michael", "Jennifer"])
        last_name = random.choice(["Smith", "Johnson", "Williams", "Brown", "Jones"])
        gender = random.choice(["Male", "Female"])

        # Random age 18-90
        age = random.randint(18, 90)
        dob = (datetime.now() - timedelta(days=age*365)).strftime("%Y-%m-%d")

        # Assign conditions based on age/realistic prevalence
        conditions = self._generate_conditions(age)

        # Assign medications based on conditions
        medications = self._generate_medications(conditions)

        # Choose vital pattern (based on conditions)
        vital_pattern = self._choose_vital_pattern(conditions)

        patient = Patient(
            id=patient_id,
            first_name=first_name,
            last_name=last_name,
            mrn=mrn,
            dob=dob,
            gender=gender,
            conditions=conditions,
            medications=medications,
            vital_pattern=vital_pattern
        )

        # Generate 7 days of vital observations (every 15 minutes)
        self._generate_vital_observations(patient)

        return patient

    def _generate_conditions(self, age: int) -> List[PatientCondition]:
        """Generate conditions based on age-stratified prevalence."""
        conditions = [PatientCondition.HEALTHY]

        # Diabetes (10.8% prevalence, increases with age)
        if age > 40 and random.random() < 0.108 * (age / 50):
            conditions.append(PatientCondition.TYPE2_DIABETES)

        # Hypertension (29.8% prevalence, increases with age)
        if age > 35 and random.random() < 0.298 * (age / 60):
            conditions.append(PatientCondition.HYPERTENSION)

        # Chronic kidney disease (7.1%, increases with diabetes/hypertension)
        if PatientCondition.TYPE2_DIABETES in conditions and random.random() < 0.2:
            conditions.append(PatientCondition.CHRONIC_KIDNEY_DISEASE)

        # Asthma (6.5%, independent of age)
        if random.random() < 0.065:
            conditions.append(PatientCondition.ASTHMA)

        return conditions

    def _generate_medications(self, conditions: List[PatientCondition]) -> List[Dict]:
        """Generate medications based on conditions."""
        medications = []

        if PatientCondition.TYPE2_DIABETES in conditions:
            medications.append({
                "name": "Metformin",
                "code": "860004",
                "dose": "500mg",
                "frequency": "BID",
                "route": "PO"
            })

        if PatientCondition.HYPERTENSION in conditions:
            medications.append({
                "name": "Lisinopril",
                "code": "29046",
                "dose": "10mg",
                "frequency": "QD",
                "route": "PO"
            })

        if PatientCondition.ASTHMA in conditions:
            medications.append({
                "name": "Albuterol inhaler",
                "code": "435",
                "dose": "90mcg",
                "frequency": "PRN",
                "route": "INH"
            })

        return medications

    def _choose_vital_pattern(self, conditions: List[PatientCondition]) -> VitalPattern:
        """Choose vital pattern based on conditions."""
        # 70% healthy pattern, 30% abnormal
        if random.random() < 0.70 or len(conditions) == 1:
            return VitalPattern.NORMAL

        # Choose based on primary condition
        if PatientCondition.TYPE2_DIABETES in conditions:
            return random.choice([
                VitalPattern.NORMAL,
                VitalPattern.HYPERGLYCEMIC,
                VitalPattern.HYPOGLYCEMIC
            ])

        if PatientCondition.HYPERTENSION in conditions:
            return random.choice([
                VitalPattern.NORMAL,
                VitalPattern.HYPERTENSIVE
            ])

        return random.choice([
            VitalPattern.NORMAL,
            VitalPattern.TACHYCARDIC,
            VitalPattern.HYPOXEMIC,
            VitalPattern.COMBINED_ABNORMAL
        ])

    def _generate_vital_observations(self, patient: Patient):
        """Generate 7 days of vital signs (every 15 minutes = 672 observations)."""
        now = datetime.now()
        observation_count = 7 * 24 * 4  # 7 days, 4 obs/hour (every 15 min)

        for i in range(observation_count):
            timestamp = (now - timedelta(minutes=i*15)).strftime("%Y-%m-%dT%H:%M:%SZ")

            # Generate vitals based on pattern
            vitals = self._generate_vitals_for_pattern(patient.vital_pattern)

            for vital_type, value, unit in vitals:
                vital = VitalSign(
                    timestamp=timestamp,
                    vital_type=vital_type,
                    value=value,
                    unit=unit,
                    status=self._classify_vital_status(vital_type, value)
                )
                patient.add_vital_observation(vital)

    def _generate_vitals_for_pattern(self, pattern: VitalPattern) -> List[tuple]:
        """Generate vital values for given pattern."""
        vitals = []

        if pattern == VitalPattern.NORMAL:
            vitals = [
                ("heart_rate", random.randint(60, 100), "bpm"),
                ("blood_pressure_systolic", random.randint(90, 120), "mmHg"),
                ("blood_pressure_diastolic", random.randint(60, 80), "mmHg"),
                ("respiratory_rate", random.randint(12, 20), "breaths/min"),
                ("temperature", round(random.uniform(36.5, 37.5), 1), "Celsius"),
                ("oxygen_saturation", random.randint(95, 100), "%"),
                ("glucose", random.randint(70, 100), "mg/dL"),
            ]

        elif pattern == VitalPattern.HYPERTENSIVE:
            vitals = [
                ("heart_rate", random.randint(70, 110), "bpm"),
                ("blood_pressure_systolic", random.randint(160, 200), "mmHg"),  # HIGH
                ("blood_pressure_diastolic", random.randint(95, 120), "mmHg"),   # HIGH
                ("respiratory_rate", random.randint(14, 22), "breaths/min"),
                ("temperature", round(random.uniform(36.5, 37.5), 1), "Celsius"),
                ("oxygen_saturation", random.randint(95, 100), "%"),
                ("glucose", random.randint(80, 120), "mg/dL"),
            ]

        elif pattern == VitalPattern.HYPERGLYCEMIC:
            vitals = [
                ("heart_rate", random.randint(75, 110), "bpm"),
                ("blood_pressure_systolic", random.randint(120, 150), "mmHg"),
                ("blood_pressure_diastolic", random.randint(75, 95), "mmHg"),
                ("respiratory_rate", random.randint(16, 28), "breaths/min"),  # Kussmaul
                ("temperature", round(random.uniform(36.5, 38.0), 1), "Celsius"),
                ("oxygen_saturation", random.randint(94, 99), "%"),
                ("glucose", random.randint(280, 400), "mg/dL"),  # CRITICALLY HIGH
            ]

        elif pattern == VitalPattern.HYPOGLYCEMIC:
            vitals = [
                ("heart_rate", random.randint(90, 130), "bpm"),  # Compensatory tachycardia
                ("blood_pressure_systolic", random.randint(80, 110), "mmHg"),
                ("blood_pressure_diastolic", random.randint(50, 70), "mmHg"),
                ("respiratory_rate", random.randint(14, 22), "breaths/min"),
                ("temperature", round(random.uniform(36.0, 37.0), 1), "Celsius"),
                ("oxygen_saturation", random.randint(95, 100), "%"),
                ("glucose", random.randint(30, 60), "mg/dL"),  # CRITICALLY LOW
            ]

        elif pattern == VitalPattern.SEPTIC:
            vitals = [
                ("heart_rate", random.randint(110, 150), "bpm"),  # Tachycardia
                ("blood_pressure_systolic", random.randint(80, 110), "mmHg"),  # Hypotensive
                ("blood_pressure_diastolic", random.randint(40, 60), "mmHg"),
                ("respiratory_rate", random.randint(20, 35), "breaths/min"),  # Tachypnea
                ("temperature", round(random.uniform(38.5, 40.5), 1), "Celsius"),  # Fever/hypothermia
                ("oxygen_saturation", random.randint(90, 96), "%"),  # Hypoxemia
                ("glucose", random.randint(120, 200), "mg/dL"),
                ("white_blood_cells", round(random.uniform(15.0, 25.0), 1), "K/uL"),  # WBC elevation
            ]

        elif pattern == VitalPattern.TACHYCARDIC:
            vitals = [
                ("heart_rate", random.randint(110, 150), "bpm"),  # HIGH
                ("blood_pressure_systolic", random.randint(110, 140), "mmHg"),
                ("blood_pressure_diastolic", random.randint(70, 90), "mmHg"),
                ("respiratory_rate", random.randint(14, 24), "breaths/min"),
                ("temperature", round(random.uniform(36.5, 38.0), 1), "Celsius"),
                ("oxygen_saturation", random.randint(95, 100), "%"),
                ("glucose", random.randint(80, 110), "mg/dL"),
            ]

        elif pattern == VitalPattern.HYPOXEMIC:
            vitals = [
                ("heart_rate", random.randint(80, 120), "bpm"),
                ("blood_pressure_systolic", random.randint(95, 130), "mmHg"),
                ("blood_pressure_diastolic", random.randint(60, 85), "mmHg"),
                ("respiratory_rate", random.randint(18, 32), "breaths/min"),  # Tachypnea (compensatory)
                ("temperature", round(random.uniform(36.5, 37.8), 1), "Celsius"),
                ("oxygen_saturation", random.randint(85, 92), "%"),  # CRITICALLY LOW
                ("glucose", random.randint(75, 110), "mg/dL"),
            ]

        elif pattern == VitalPattern.COMBINED_ABNORMAL:
            # Multiple abnormalities (stress test)
            vitals = [
                ("heart_rate", random.randint(100, 140), "bpm"),
                ("blood_pressure_systolic", random.randint(140, 180), "mmHg"),
                ("blood_pressure_diastolic", random.randint(85, 110), "mmHg"),
                ("respiratory_rate", random.randint(20, 30), "breaths/min"),
                ("temperature", round(random.uniform(37.5, 39.0), 1), "Celsius"),
                ("oxygen_saturation", random.randint(90, 95), "%"),
                ("glucose", random.randint(150, 250), "mg/dL"),
            ]

        return vitals

    def _classify_vital_status(self, vital_type: str, value: float) -> str:
        """Classify vital as normal/abnormal/critical."""
        ranges = {
            "heart_rate": (VitalRange.HR_MIN_NORMAL, VitalRange.HR_MAX_NORMAL, VitalRange.HR_CRITICAL_LOW, VitalRange.HR_CRITICAL_HIGH),
            "blood_pressure_systolic": (VitalRange.SYS_MIN_NORMAL, VitalRange.SYS_MAX_NORMAL, VitalRange.SYS_HYPOTENSIVE, VitalRange.SYS_HYPERTENSIVE),
            "blood_pressure_diastolic": (VitalRange.DIA_MIN_NORMAL, VitalRange.DIA_MAX_NORMAL, 50, VitalRange.DIA_HYPERTENSIVE),
            "respiratory_rate": (VitalRange.RR_MIN_NORMAL, VitalRange.RR_MAX_NORMAL, VitalRange.RR_BRADYPNEA, VitalRange.RR_TACHYPNEA),
            "temperature": (VitalRange.TEMP_MIN_NORMAL, VitalRange.TEMP_MAX_NORMAL, VitalRange.TEMP_HYPOTHERMIA, VitalRange.TEMP_FEVER),
            "oxygen_saturation": (VitalRange.O2_SAT_MIN_NORMAL, 100, VitalRange.O2_SAT_HYPOXEMIA, 101),
            "glucose": (VitalRange.GLUCOSE_MIN_NORMAL, VitalRange.GLUCOSE_MAX_NORMAL, VitalRange.GLUCOSE_SEVERE_HYPO, VitalRange.GLUCOSE_SEVERE_HYPER),
        }

        if vital_type not in ranges:
            return "unknown"

        min_norm, max_norm, min_crit, max_crit = ranges[vital_type]

        if min_norm <= value <= max_norm:
            return "normal"
        elif min_crit <= value < min_norm or max_norm < value <= max_crit:
            return "abnormal"
        else:
            return "critical"

    def export_to_json(self, filepath: str):
        """Export all patients as FHIR Bundle."""
        bundle = {
            "resourceType": "Bundle",
            "type": "transaction",
            "entry": []
        }

        for patient in self.patients:
            # Patient resource
            bundle["entry"].append({
                "resource": patient.to_fhir_patient(),
                "request": {"method": "POST", "url": "Patient"}
            })

            # Vital observations
            for vital in patient.vitals_observations[:100]:  # Limit to 100 per patient for performance
                bundle["entry"].append({
                    "resource": vital.to_fhir_observation(),
                    "request": {"method": "POST", "url": "Observation"}
                })

        with open(filepath, 'w') as f:
            json.dump(bundle, f, indent=2)

        print(f"✅ Exported {len(self.patients)} patients to {filepath}")
        print(f"   Total FHIR resources: {len(bundle['entry'])}")


if __name__ == "__main__":
    import sys

    # Generate patients
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    output_file = sys.argv[2] if len(sys.argv) > 2 else "synthetic_patients.json"

    print(f"🔄 Generating {count} synthetic patients...")
    generator = SyntheticPatientGenerator(seed=12345)
    patients = generator.generate_population(count)

    # Summary statistics
    print(f"\n📊 Population Summary:")
    print(f"   Total patients: {len(patients)}")

    pattern_counts = {}
    for p in patients:
        pattern = p.vital_pattern.value
        pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1

    print(f"   Vital patterns:")
    for pattern, count in sorted(pattern_counts.items()):
        print(f"     - {pattern}: {count} ({100*count/len(patients):.1f}%)")

    condition_counts = {}
    for p in patients:
        for c in p.conditions:
            condition = c.value
            condition_counts[condition] = condition_counts.get(condition, 0) + 1

    print(f"   Conditions:")
    for condition, count in sorted(condition_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"     - {condition}: {count} patients")

    # Export
    print(f"\n💾 Exporting to {output_file}...")
    generator.export_to_json(output_file)
