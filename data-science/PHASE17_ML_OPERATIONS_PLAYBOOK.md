# Phase 17: Data Science & ML Operations Playbook

**Status:** 🤖 ML OPERATIONS FRAMEWORK  
**Objective:** Establish data science workflows, model development, continuous learning, and MLOps infrastructure  
**Scope:** Model development, training pipelines, validation, experimentation, feature engineering, data quality  
**Timeline:** Concurrent with Phase 9-16 (ongoing ML development and optimization)

---

## Part 1: Model Development Lifecycle

### 1.1 Alert Optimization Model (ML Alert Thresholds)

**Business Objective:**
- Reduce false positive alerts while maintaining >95% sensitivity
- Personalize thresholds per patient cohort
- Improve clinician trust in alert system

**Model Type:** Supervised Classification (Gradient Boosting)
- XGBoost ensemble (primary)
- Random Forest (validation)
- Logistic Regression (baseline comparison)

**Data Collection & Labeling:**

```
Label Definition:
  Deterioration Event (Positive Class):
    - HR >130 sustained >10 minutes → Physician documented tachycardia
    - SBP <80 sustained >10 minutes → Physician documented hypotension
    - SpO2 <90% sustained >5 minutes → Physician documented hypoxemia
    - RR >30 sustained >10 minutes → Physician documented tachypnea
    - Temp >39°C sustained >15 min → Fever requiring intervention
    - Glucose >400 or <70 sustained → Glucose abnormality requiring intervention
  
  Non-Deterioration Event (Negative Class):
    - No physician intervention despite vital sign abnormality
    - Transient abnormality (self-corrected within 5 minutes)
    - Artifact (patient movement, sensor malfunction, calibration issue)
    - Medication effect (expected change from treatment)

Labeling Process (Manual Review by Clinicians):
  1. Extract potential deterioration events (rules-based)
  2. Present to clinician panel (2+ independent reviewers)
  3. Reach consensus on label (agreement threshold: 80%+)
  4. Document rationale (why this was/wasn't deterioration)
  5. Calculate inter-rater reliability (Cohen's kappa >0.8)

Dataset Composition (10,000 patients total):
  - 5,000 ICU patients (high acuity)
  - 3,000 medical floor patients (medium acuity)
  - 2,000 surgical floor patients (lower acuity)
  - Positive examples: 15% (1,500 deterioration events)
  - Negative examples: 85% (8,500 non-deterioration)
  - Class imbalance handling: SMOTE or class weights
```

**Feature Engineering:**

```
Vital Sign Features (time-series aggregations):

For each vital sign over rolling windows (5min, 15min, 1hr):
  ├─ Statistical Features:
  │  ├─ mean, median, std, min, max, range
  │  ├─ percentiles (10th, 25th, 75th, 90th)
  │  ├─ skewness, kurtosis
  │  └─ coefficient of variation (std/mean)
  │
  ├─ Trend Features:
  │  ├─ slope (linear regression on last N values)
  │  ├─ acceleration (second derivative)
  │  ├─ direction change frequency
  │  └─ sustained condition duration
  │
  ├─ Anomaly Features:
  │  ├─ Z-score (how far from patient baseline)
  │  ├─ isolation forest anomaly score
  │  ├─ Local Outlier Factor (LOF) score
  │  └─ Mahalanobis distance
  │
  └─ Composite Features:
     ├─ heart_rate_to_blood_pressure_ratio
     ├─ oxygen_saturation_decline_rate
     ├─ temperature_humidity_index (if available)
     └─ critical_value_count (how many vitals abnormal)

Patient Context Features:

  Demographic:
    ├─ age (continuous, >95 capped)
    ├─ gender (0/1)
    └─ BMI (continuous, if available)
  
  Clinical:
    ├─ comorbidity_count (integer)
    ├─ comorbidity_severity_score (CHARLSON index)
    ├─ primary_diagnosis (categorical)
    ├─ days_since_admission (continuous)
    ├─ icu_vs_floor (binary)
    └─ recent_surgery (binary)
  
  Baseline Vital Signs:
    ├─ baseline_heart_rate (patient's normal)
    ├─ baseline_blood_pressure (patient's normal)
    └─ baseline_temperature (patient's normal)
  
  Recent Treatments:
    ├─ medications_count (integer)
    ├─ vasoactive_agent (0/1)
    ├─ oxygen_therapy (0/1)
    ├─ days_on_vent (if intubated)
    └─ recent_procedure (0/1)

Temporal Features:
    ├─ hour_of_day (12am → 11pm, captures circadian effects)
    ├─ day_of_week (0=Monday → 6=Sunday)
    ├─ time_since_last_alert (minutes, captures alert fatigue)
    └─ observations_per_hour (sampling frequency)
```

**Feature Selection & Validation:**

```python
# Feature Importance Analysis (XGBoost)
feature_importance = model.get_booster().get_score(importance_type='weight')
# Top features expected:
# 1. Heart_rate_slope (trending up)
# 2. Systolic_BP_min (how low it drops)
# 3. SpO2_decline_rate (rapid drop)
# 4. Age (older → more deterioration)
# 5. Comorbidity_count (more diseases → higher risk)

# Feature Multicollinearity Check (VIF > 10 → remove)
from statsmodels.stats.outliers_influence import variance_inflation_factor
vif_data = pd.DataFrame()
vif_data["feature"] = X.columns
vif_data["VIF"] = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]
# Acceptable: VIF < 5 for most features

# Feature Stability Test (on holdout set)
# Ensure feature importances similar between train and test
# If feature importance rank changes significantly → investigate
```

**Model Training:**

```python
from xgboost import XGBClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import roc_auc_score, precision_recall_curve
import pickle

# Training Configuration
config = {
    'n_estimators': 100,           # Number of trees
    'max_depth': 5,                # Tree depth (prevent overfitting)
    'learning_rate': 0.1,          # Shrinkage
    'subsample': 0.8,              # Row sampling
    'colsample_bytree': 0.8,       # Column sampling
    'min_child_weight': 1,         # Min samples per leaf
    'scale_pos_weight': 5.67,      # Class imbalance (85%/15%)
    'random_state': 42,
}

# Create model
model = XGBClassifier(**config)

# Cross-validation (5-fold stratified)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_validate(
    model, X_train, y_train,
    cv=cv,
    scoring=['roc_auc', 'precision', 'recall', 'f1'],
    return_train_score=True
)

# Print results
print(f"ROC-AUC: {cv_scores['test_roc_auc'].mean():.3f} ± {cv_scores['test_roc_auc'].std():.3f}")
print(f"Precision: {cv_scores['test_precision'].mean():.3f}")
print(f"Recall: {cv_scores['test_recall'].mean():.3f}")
print(f"F1-Score: {cv_scores['test_f1'].mean():.3f}")

# Train final model on full training set
model.fit(X_train, y_train)

# Save model with metadata
import json
metadata = {
    'model_type': 'xgboost_alert_optimizer',
    'version': '2.1.0',
    'training_date': '2026-04-25',
    'n_features': X_train.shape[1],
    'feature_names': X_train.columns.tolist(),
    'cv_roc_auc': float(cv_scores['test_roc_auc'].mean()),
    'cv_recall': float(cv_scores['test_recall'].mean()),
}

with open('models/alert_optimizer_v2.1_metadata.json', 'w') as f:
    json.dump(metadata, f)

with open('models/alert_optimizer_v2.1.pkl', 'wb') as f:
    pickle.dump(model, f)
```

**Model Validation:**

```python
import numpy as np
from sklearn.metrics import (
    roc_curve, auc, confusion_matrix, 
    precision_recall_curve, classification_report
)

# Test Set Performance
y_pred_proba = model.predict_proba(X_test)[:, 1]
y_pred = model.predict(X_test)

# ROC Curve & AUC
fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
roc_auc = auc(fpr, tpr)
print(f"Test ROC-AUC: {roc_auc:.3f}")

# Sensitivity (Recall) / Specificity Trade-off
tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
sensitivity = tp / (tp + fn)  # True Positive Rate
specificity = tn / (tn + fp)  # True Negative Rate
ppv = tp / (tp + fp)          # Positive Predictive Value (precision)
npv = tn / (tn + fn)          # Negative Predictive Value

print(f"Sensitivity (Recall): {sensitivity:.3f}")  # Target: >95%
print(f"Specificity: {specificity:.3f}")           # Target: >80%
print(f"PPV (Precision): {ppv:.3f}")
print(f"NPV: {npv:.3f}")

# Stratified Performance (by patient cohort)
for cohort in ['ICU', 'Medical', 'Surgical']:
    cohort_mask = X_test['unit_type'] == cohort
    cohort_auc = roc_auc_score(y_test[cohort_mask], y_pred_proba[cohort_mask])
    cohort_recall = recall_score(y_test[cohort_mask], y_pred[cohort_mask])
    print(f"{cohort}: AUC={cohort_auc:.3f}, Recall={cohort_recall:.3f}")

# Fairness Analysis (by demographics)
for age_group in ['<50', '50-65', '>65']:
    age_mask = pd.cut(X_test['age'], bins=[0, 50, 65, 150]) == age_group
    age_auc = roc_auc_score(y_test[age_mask], y_pred_proba[age_mask])
    age_recall = recall_score(y_test[age_mask], y_pred[age_mask])
    print(f"Age {age_group}: AUC={age_auc:.3f}, Recall={age_recall:.3f}")
    # Target: Metrics should not vary >5% across demographics
```

---

## Part 2: Continuous Learning System

### 2.1 Feedback Loop Architecture

```
Real-World Data Collection:
├─ Production Observations: Every vital sign measurement
├─ Outcome Labels: Clinician assessment (intervention/no intervention)
├─ Temporal Windows:
│  ├─ Alert → Clinician Response (0-5 minutes)
│  ├─ Short-term outcome (2-4 hours)
│  ├─ Medium-term outcome (24 hours)
│  └─ Long-term outcome (7 days, patient disposition)
└─ Data Retention: 90 days for training, 1 year archived

Outcome Labeling Process:
├─ Clinical Outcome Definition:
│  ├─ Positive: Alert preceded intervention (medication, transfer, monitoring)
│  ├─ Negative: No intervention, vital signs self-corrected
│  └─ Ambiguous: Unclear if intervention related to alert
├─ Automated Label Collection:
│  ├─ EHR integration: Extract orders/meds after alert
│  ├─ Escalation tracking: Was alert escalated? By whom?
│  └─ Patient monitoring: Increased monitoring frequency?
└─ Manual Label Verification (10% sample):
   └─ Weekly review by clinical team (validate automated labels)

Data Quality Assurance:
├─ Duplicate Detection: Same patient, same vital sign, <1 minute apart
├─ Sensor Artifact Detection: Sudden spikes/drops outside physiologic range
├─ Missing Data Handling: Observations with NaN values excluded from training
├─ Recalibration Detection: Known device calibration events
└─ Drift Detection: Patient population shift (e.g., new ICU type)
```

**Implementation (Python):**

```python
# continuous_learning_system.py

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy import create_engine
import mlflow

class ContinuousLearningSystem:
    """Production ML learning loop"""
    
    def __init__(self, db_url, mlflow_uri):
        self.engine = create_engine(db_url)
        mlflow.set_tracking_uri(mlflow_uri)
    
    def collect_training_data(self, days_back=90):
        """Collect observations + outcomes for last N days"""
        
        query = """
        SELECT
            o.observation_id,
            o.patient_id,
            o.observation_type,
            o.value,
            o.timestamp,
            a.alert_id,
            a.severity,
            a.created_at as alert_time,
            CASE 
                WHEN i.intervention_id IS NOT NULL 
                    AND i.performed_at < a.created_at + INTERVAL '5 minutes'
                THEN 1 
                ELSE 0 
            END as intervention_within_5min,
            CASE 
                WHEN DATEDIFF(minute, a.created_at, p.event_time) <= 240
                    AND p.event_type IN ('medication', 'procedure', 'transfer')
                THEN 1 
                ELSE 0 
            END as clinical_response,
            o.created_at
        FROM observations o
        LEFT JOIN alerts a ON o.patient_id = a.patient_id 
            AND a.created_at BETWEEN o.timestamp AND o.timestamp + INTERVAL '2 hours'
        LEFT JOIN interventions i ON a.alert_id = i.alert_id
        LEFT JOIN patient_events p ON o.patient_id = p.patient_id
        WHERE o.created_at >= NOW() - INTERVAL '%d days'
        ORDER BY o.timestamp DESC
        """ % days_back
        
        df = pd.read_sql(query, self.engine)
        return df
    
    def validate_data_quality(self, df):
        """Data quality checks"""
        
        checks = {
            'total_rows': len(df),
            'null_values': df.isnull().sum().to_dict(),
            'duplicate_observations': len(df[df.duplicated(subset=['observation_id'])]),
            'outliers': self._detect_outliers(df),
            'missing_outcomes': df['intervention_within_5min'].isnull().sum(),
        }
        
        # Log quality metrics
        mlflow.log_metrics(checks)
        
        if checks['missing_outcomes'] > len(df) * 0.1:  # >10% missing
            raise ValueError("High proportion of missing outcome labels")
        
        return checks
    
    def _detect_outliers(self, df):
        """Detect physiologic outliers"""
        outliers = {}
        
        # HR: 30-200 bpm
        outliers['heart_rate'] = len(
            df[(df['observation_type'] == 'heart_rate') & 
               ((df['value'] < 30) | (df['value'] > 200))]
        )
        
        # Temperature: 90-108°F
        outliers['temperature'] = len(
            df[(df['observation_type'] == 'temperature') & 
               ((df['value'] < 90) | (df['value'] > 108))]
        )
        
        # SpO2: 0-100%
        outliers['spo2'] = len(
            df[(df['observation_type'] == 'oxygen_saturation') & 
               ((df['value'] < 0) | (df['value'] > 100))]
        )
        
        return outliers
    
    def retrain_model(self, validation_date):
        """Retrain model with recent data"""
        
        # Collect data
        df_train = self.collect_training_data(days_back=90)
        
        # Validate quality
        quality_checks = self.validate_data_quality(df_train)
        
        # Feature engineering
        X, y = self._prepare_features(df_train)
        
        # Train new model
        with mlflow.start_run():
            mlflow.set_tag("model_type", "alert_optimizer")
            mlflow.set_tag("training_date", validation_date)
            
            # Train with cross-validation
            from sklearn.model_selection import cross_validate
            from xgboost import XGBClassifier
            
            model = XGBClassifier(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                random_state=42
            )
            
            scores = cross_validate(
                model, X, y, cv=5,
                scoring=['roc_auc', 'recall', 'precision']
            )
            
            # Log metrics
            mlflow.log_metrics({
                'cv_roc_auc': scores['test_roc_auc'].mean(),
                'cv_recall': scores['test_recall'].mean(),
                'cv_precision': scores['test_precision'].mean(),
            })
            
            # Train final model
            model.fit(X, y)
            
            # Validate on holdout
            y_pred_proba = model.predict_proba(X_test)[:, 1]
            from sklearn.metrics import roc_auc_score, recall_score
            
            final_auc = roc_auc_score(y_test, y_pred_proba)
            final_recall = recall_score(y_test, model.predict(X_test))
            
            mlflow.log_metrics({
                'final_auc': final_auc,
                'final_recall': final_recall,
            })
            
            # Register model if improvement detected
            if final_auc > 0.92:  # Threshold for production
                mlflow.sklearn.log_model(
                    model, "model",
                    registered_model_name="alert_optimizer"
                )
                print(f"✓ New model registered: AUC={final_auc:.3f}")
            else:
                print(f"✗ Model below threshold: AUC={final_auc:.3f} (require >0.92)")
    
    def monitor_model_drift(self):
        """Detect concept drift in production"""
        
        # Compare recent data vs training data
        recent_df = self.collect_training_data(days_back=7)
        
        # Statistical drift detection (Kolmogorov-Smirnov test)
        from scipy.stats import ks_2samp
        
        drift_metrics = {}
        for vital in ['heart_rate', 'blood_pressure', 'temperature']:
            recent_values = recent_df[recent_df['observation_type'] == vital]['value']
            training_values = self.get_training_distribution(vital)
            
            statistic, p_value = ks_2samp(recent_values, training_values)
            drift_metrics[f'{vital}_drift_pvalue'] = p_value
            
            if p_value < 0.05:  # Significant drift detected
                print(f"⚠️  Drift detected in {vital} (p={p_value:.4f})")
                mlflow.log_metric(f'{vital}_drift', 1)
        
        return drift_metrics
```

### 2.2 A/B Testing Framework

```
A/B Test Setup (Alert Threshold Optimization):

Control Group (80% of hospitals):
  ├─ Model Version: Current production (v2.0)
  ├─ Alert Rules: Existing thresholds
  ├─ Patient Population: ~20,000 patients/week
  └─ Metrics Tracked:
     ├─ Alert sensitivity (recall >95%)
     ├─ Alert specificity (precision >85%)
     ├─ Clinician satisfaction (survey weekly)
     └─ Clinical outcomes (deterioration detection rate)

Treatment Group (20% of hospitals):
  ├─ Model Version: New candidate (v2.1)
  ├─ Alert Rules: ML-optimized thresholds
  ├─ Patient Population: ~5,000 patients/week
  └─ Metrics Tracked: Same as control

Statistical Design:
  ├─ Hypothesis: New model reduces false positives by 15%
  │   without reducing sensitivity (<2% absolute reduction acceptable)
  ├─ Primary Metric: Alert specificity (false positive rate)
  ├─ Secondary Metrics: Sensitivity, clinician satisfaction
  ├─ Statistical Power: 90% (α=0.05, β=0.10)
  ├─ Sample Size: 5,000 patients per group
  ├─ Duration: 2 weeks minimum
  └─ Stopping Rules:
     ├─ Alarm signal: Sensitivity <93% (too many missed alerts) → Stop
     ├─ Success signal: Specificity improved + sensitivity maintained → Proceed

Analysis Plan:
  1. Intent-to-treat (ITT): Analyze all patients assigned to group
  2. Stratified analysis: Results by ICU vs Medical vs Surgical units
  3. Subgroup analysis: Results by age (<65 vs ≥65)
  4. Sensitivity analysis: Impact of different outcome definitions

Decision Rule:
  ├─ If improvement significant AND non-inferior: Roll out to production
  ├─ If improvement not significant: Continue development
  └─ If sensitivity decreased: Revert immediately, investigate
```

**Implementation (Python):**

```python
from scipy import stats
from numpy.random import binomial

class ABTestMonitor:
    """Monitor A/B test metrics in real-time"""
    
    def __init__(self, control_size=20000, treatment_size=5000):
        self.control_size = control_size
        self.treatment_size = treatment_size
        self.control_metrics = {}
        self.treatment_metrics = {}
    
    def calculate_metrics(self, true_positives, false_positives, 
                         false_negatives, true_negatives):
        """Calculate sensitivity, specificity, etc."""
        
        sensitivity = true_positives / (true_positives + false_negatives)
        specificity = true_negatives / (true_negatives + false_positives)
        ppv = true_positives / (true_positives + false_positives)
        npv = true_negatives / (true_negatives + false_negatives)
        
        return {
            'sensitivity': sensitivity,
            'specificity': specificity,
            'ppv': ppv,
            'npv': npv,
        }
    
    def run_hypothesis_test(self, control_metrics, treatment_metrics):
        """Two-proportion z-test for specificity improvement"""
        
        # H0: Treatment specificity = Control specificity
        # H1: Treatment specificity > Control specificity (one-tailed)
        
        control_spec = control_metrics['specificity']
        treatment_spec = treatment_metrics['specificity']
        
        # Pooled proportion
        p_pool = (control_spec * self.control_size + 
                  treatment_spec * self.treatment_size) / \
                 (self.control_size + self.treatment_size)
        
        # Standard error
        se = np.sqrt(p_pool * (1 - p_pool) * 
                     (1/self.control_size + 1/self.treatment_size))
        
        # Z-statistic
        z = (treatment_spec - control_spec) / se
        
        # One-tailed p-value
        p_value = 1 - stats.norm.cdf(z)
        
        return {
            'z_statistic': z,
            'p_value': p_value,
            'significant': p_value < 0.05,
            'effect_size': treatment_spec - control_spec,
        }
    
    def check_futility(self, treatment_sensitivity):
        """Check if treatment is performing too poorly"""
        
        # Futility boundary: sensitivity < 93%
        if treatment_sensitivity < 0.93:
            return True  # Stop test, revert treatment
        else:
            return False
    
    def early_stopping_analysis(self, week):
        """Weekly check for early stopping"""
        
        if week >= 2:  # Allow 2 weeks minimum
            test_results = self.run_hypothesis_test(
                self.control_metrics, 
                self.treatment_metrics
            )
            
            futility = self.check_futility(
                self.treatment_metrics['sensitivity']
            )
            
            if futility:
                print("🛑 STOP: Treatment sensitivity too low")
                return 'stop_futility'
            
            if test_results['significant']:
                print("✅ SUCCESS: Treatment shows significant improvement")
                return 'success_deploy'
            
            if week >= 4:  # Max duration
                print("⏱️  TIMEOUT: 4-week limit reached")
                if test_results['effect_size'] > 0.05:
                    return 'success_deploy'
                else:
                    return 'failure_no_improvement'
        
        return 'continue'
```

---

## Part 3: Feature Store & Data Infrastructure

### 3.1 Feature Store Architecture

```
Feature Store (ML-ready data platform):

┌─────────────────────────────────────────────────────────┐
│                   Feature Store                         │
│  (Feast, Tecton, or custom implementation)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Feature Sets:                                          │
│  ├─ vital_sign_features (real-time)                    │
│  │  ├─ heart_rate_mean_5min                            │
│  │  ├─ heart_rate_slope_5min                           │
│  │  ├─ bp_systolic_min_1hr                             │
│  │  └─ ... (50+ derived features)                      │
│  │                                                      │
│  ├─ patient_features (batch, updated daily)            │
│  │  ├─ age                                             │
│  │  ├─ comorbidity_count                               │
│  │  ├─ baseline_heart_rate                             │
│  │  └─ ... (20+ patient attributes)                    │
│  │                                                      │
│  └─ temporal_features (real-time)                      │
│     ├─ time_of_day                                     │
│     ├─ days_since_admission                            │
│     └─ hours_since_last_alert                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Online Store (Redis)   │   Offline Store (S3+Parquet) │
│  - <10ms latency        │   - Training data export     │
│  - Real-time serving    │   - Historical analysis      │
│  - Low cardinality      │   - Audit trail              │
└─────────────────────────────────────────────────────────┘
          ↓                          ↓
   Model Inference        Model Training
   (Online)               (Offline/Batch)
```

**Implementation (Feast):**

```yaml
# feature_store.yaml

project: alert_system
registry: s3://feature-store-registry/

repo_config:
  online_store:
    type: redis
    connection_string: redis://redis:6379
  
  offline_store:
    type: s3
    path: s3://feature-store-offline/

  feature_store_offline_type: parquet

---
# feature_definitions.py

from feast import Entity, Feature, FeatureView, FeatureStore
from feast.data_sources import PushSource, BigQuerySource
from feast.on_demand_feature_view import on_demand_feature_view
from feast.types import Float32, String

# Define entities
patient = Entity(name="patient_id", join_keys=["patient_id"])

# Vital sign features (real-time push from API)
vital_signs_source = PushSource(
    name="vital_signs_push",
    columns=[
        "patient_id",
        "heart_rate",
        "systolic_bp",
        "diastolic_bp",
        "spo2",
        "temperature",
        "event_timestamp",
    ],
)

vital_signs_fv = FeatureView(
    name="vital_signs",
    entities=[patient],
    ttl="1h",
    features=[
        Feature(name="heart_rate", dtype=Float32),
        Feature(name="systolic_bp", dtype=Float32),
        Feature(name="diastolic_bp", dtype=Float32),
        Feature(name="spo2", dtype=Float32),
        Feature(name="temperature", dtype=Float32),
    ],
    online=True,
    source=vital_signs_source,
    tags={"team": "data-science", "critical": "yes"},
)

# On-demand features (computed from raw features)
@on_demand_feature_view(
    sources=[vital_signs_fv],
    schema=[
        ("heart_rate_z_score", Float32),
        ("spo2_decline_rate", Float32),
    ],
)
def derived_vital_features(inputs):
    """Compute derived features on-demand"""
    import numpy as np
    
    outputs = {
        "heart_rate_z_score": (inputs["heart_rate"] - 75) / 15,  # Standardize
        "spo2_decline_rate": max(0, 98 - inputs["spo2"]),  # Rate of decline
    }
    return outputs

# Patient demographics (batch, slow-changing)
patient_demographics_source = BigQuerySource(
    table="dataset.patient_demographics",
    event_timestamp_column="event_timestamp",
)

patient_demographics_fv = FeatureView(
    name="patient_demographics",
    entities=[patient],
    ttl="24h",
    features=[
        Feature(name="age", dtype=Float32),
        Feature(name="gender", dtype=String),
        Feature(name="comorbidity_count", dtype=Float32),
    ],
    source=patient_demographics_source,
    online=True,
)
```

**Feature Serving (Online):**

```python
# model_inference.py

from feast import FeatureStore
import mlflow
import numpy as np

fs = FeatureStore(repo_path=".")

def get_features_for_inference(patient_id, feature_names):
    """Get features for real-time model inference"""
    
    # Retrieve features from online store (<10ms)
    feature_vector = fs.get_online_features(
        features=feature_names,
        entity_rows=[{"patient_id": patient_id}],
    )
    
    return feature_vector.to_dict()

def predict_alert(patient_id, observation):
    """Real-time alert prediction"""
    
    # Push new observation to feature store
    fs.push("vital_signs_push", {
        "patient_id": patient_id,
        "heart_rate": observation['heart_rate'],
        "systolic_bp": observation['systolic_bp'],
        "diastolic_bp": observation['diastolic_bp'],
        "spo2": observation['spo2'],
        "temperature": observation['temperature'],
        "event_timestamp": datetime.now(),
    })
    
    # Get all features needed for model
    features = get_features_for_inference(
        patient_id=patient_id,
        feature_names=[
            "vital_signs:heart_rate",
            "vital_signs:spo2",
            "vital_signs:temperature",
            "derived_vital_features:heart_rate_z_score",
            "patient_demographics:age",
            "patient_demographics:comorbidity_count",
        ]
    )
    
    # Convert to numpy array
    feature_vector = np.array([
        features['vital_signs:heart_rate'][0],
        features['vital_signs:spo2'][0],
        features['vital_signs:temperature'][0],
        features['derived_vital_features:heart_rate_z_score'][0],
        features['patient_demographics:age'][0],
        features['patient_demographics:comorbidity_count'][0],
    ]).reshape(1, -1)
    
    # Load production model
    model = mlflow.sklearn.load_model("models:/alert_optimizer/production")
    
    # Predict
    risk_score = model.predict_proba(feature_vector)[0, 1]
    
    return {
        'patient_id': patient_id,
        'risk_score': float(risk_score),
        'alert_threshold': 0.5,
        'should_alert': risk_score > 0.5,
        'features': features,
    }
```

---

## Part 4: Monitoring & Alerting

### 4.1 Model Performance Monitoring

```
Production Model Monitoring Dashboard:

Real-Time Metrics:
├─ Prediction Volume: 10K predictions/hour
├─ Inference Latency: p95 < 100ms
├─ Model Output Distribution:
│  ├─ Mean risk score: 0.35 ± 0.05
│  ├─ % alerts triggered: 8-12% (target range)
│  └─ High-risk score count: (>0.7) trending?
└─ Feature Availability:
   ├─ Real-time features: Latency <1s
   ├─ Missing features: % NULL > 5%?
   └─ Feature staleness: Data >5min old?

Daily Performance Metrics:
├─ Sensitivity (Recall): >95% (alert true positive rate)
├─ Specificity: >80% (alert true negative rate)
├─ Positive Predictive Value: >85% (alert precision)
├─ Alert Fatigue Score: % clinicians ignoring alerts
├─ Clinical Outcome: Intervention rate after alert
└─ Patient Safety: Adverse events post-missed alerts

Drift Detection:
├─ Data Drift: Feature distributions changing?
│  └─ Alert: If Kolmogorov-Smirnov p-value < 0.05
├─ Label Drift: Outcome definition changing?
│  └─ Alert: If positive class rate changes >20%
├─ Prediction Drift: Model outputs changing?
│  └─ Alert: If mean prediction changes >15%
└─ Performance Drift: Metrics degrading?
   └─ Alert: If sensitivity drops below 92%

Alerting Rules (Pagerduty integration):
├─ CRITICAL: Sensitivity <92% → Incident commander page
├─ HIGH: Specificity <75% → Engineering lead page
├─ MEDIUM: Feature missing >10% → Data pipeline team page
└─ LOW: Inference latency >200ms → Log for optimization
```

**Implementation (Python monitoring):**

```python
# ml_monitoring.py

import numpy as np
from scipy.stats import ks_2samp
from datetime import datetime, timedelta

class ModelMonitor:
    """Monitor production model health"""
    
    def __init__(self, model_name, alert_channel):
        self.model_name = model_name
        self.alert_channel = alert_channel  # Pagerduty
        self.baseline_sensitivity = 0.95
        self.baseline_specificity = 0.82
    
    def check_sensitivity(self, predictions, outcomes):
        """Daily sensitivity check"""
        
        sensitivity = np.mean(outcomes[predictions > 0.5])
        
        if sensitivity < self.baseline_sensitivity - 0.02:  # >2% drop
            self._alert(
                severity="CRITICAL",
                message=f"Model sensitivity degraded to {sensitivity:.3f} " +
                        f"(baseline: {self.baseline_sensitivity:.3f})"
            )
            return False
        
        return True
    
    def check_data_drift(self, recent_features, baseline_features):
        """KS test for feature distribution changes"""
        
        drifts = {}
        for feature_name in recent_features.columns:
            recent = recent_features[feature_name].dropna()
            baseline = baseline_features[feature_name].dropna()
            
            statistic, p_value = ks_2samp(recent, baseline)
            
            if p_value < 0.05:  # Significant drift
                drifts[feature_name] = p_value
                self._alert(
                    severity="MEDIUM",
                    message=f"Data drift detected in {feature_name} (p={p_value:.4f})"
                )
        
        return drifts
    
    def check_prediction_drift(self, predictions):
        """Monitor prediction output distribution"""
        
        mean_pred = np.mean(predictions)
        std_pred = np.std(predictions)
        
        # Check if mean drifting
        if abs(mean_pred - 0.35) > 0.05:  # ±15% from baseline
            self._alert(
                severity="MEDIUM",
                message=f"Prediction drift: mean={mean_pred:.3f} (expected 0.35)"
            )
            return False
        
        return True
    
    def check_feature_quality(self, features_df):
        """Check for missing or stale features"""
        
        for col in features_df.columns:
            missing_pct = features_df[col].isnull().sum() / len(features_df)
            
            if missing_pct > 0.10:  # >10% missing
                self._alert(
                    severity="MEDIUM",
                    message=f"Feature {col} has {missing_pct:.1%} missing values"
                )
                return False
        
        return True
    
    def _alert(self, severity, message):
        """Send alert to incident management"""
        
        import requests
        from datetime import datetime
        
        payload = {
            "routing_key": self.alert_channel,
            "event_action": "trigger",
            "dedup_key": f"{self.model_name}_{severity}_{datetime.now().isoformat()}",
            "payload": {
                "summary": f"[{severity}] {message}",
                "severity": severity.lower(),
                "source": f"ML Monitor: {self.model_name}",
                "timestamp": datetime.now().isoformat(),
            }
        }
        
        requests.post(
            "https://events.pagerduty.com/v2/enqueue",
            json=payload
        )
```

---

## Part 5: Experimentation Platform

### 5.1 ML Experiment Tracking

```
MLflow Experiment Tracking:

Experiment: "Alert Threshold Optimization"
├─ Run 1: Baseline (v2.0)
│  ├─ Model: XGBoost (100 trees)
│  ├─ Training Data: 10,000 patients, 90 days
│  ├─ Metrics:
│  │  ├─ train_roc_auc: 0.953
│  │  ├─ test_roc_auc: 0.942
│  │  ├─ test_sensitivity: 0.956
│  │  └─ test_specificity: 0.821
│  ├─ Parameters:
│  │  ├─ n_estimators: 100
│  │  ├─ max_depth: 5
│  │  ├─ learning_rate: 0.1
│  │  └─ scale_pos_weight: 5.67
│  ├─ Artifacts:
│  │  ├─ model.pkl (binary)
│  │  ├─ feature_importance.csv
│  │  └─ confusion_matrix.png
│  └─ Tags:
│     ├─ production: true
│     ├─ version: "2.0"
│     └─ deployed_date: "2026-01-15"
│
├─ Run 2: Feature Engineering v1
│  ├─ Model: XGBoost (same params)
│  ├─ Training Data: Same + new derived features
│  ├─ Metrics:
│  │  ├─ test_roc_auc: 0.948 (-0.006 vs baseline)
│  │  └─ test_sensitivity: 0.951 (-0.005)
│  └─ Conclusion: Features don't improve → shelve
│
├─ Run 3: Increased Tree Depth
│  ├─ Model: XGBoost (max_depth=7)
│  ├─ Metrics:
│  │  ├─ test_roc_auc: 0.939 (-0.003 vs baseline)
│  │  └─ test_sensitivity: 0.948 (-0.008)
│  └─ Conclusion: Overfitting risk → don't use
│
└─ Run 4: Class Weight Tuning
   ├─ Model: XGBoost (scale_pos_weight=7.5)
   ├─ Metrics:
   │  ├─ test_roc_auc: 0.944 (+0.002 vs baseline)
   │  ├─ test_sensitivity: 0.963 (+0.007)
   │  └─ test_specificity: 0.819 (-0.002)
   └─ Conclusion: Sensitivity improvement worth slight specificity loss
      → Ready for A/B test
```

**MLflow Integration (Python):**

```python
import mlflow
import mlflow.sklearn
from sklearn.model_selection import cross_validate
from xgboost import XGBClassifier

# Set experiment
mlflow.set_experiment("Alert Threshold Optimization")

with mlflow.start_run(run_name="class_weight_tuning_v4"):
    
    # Log parameters
    params = {
        'n_estimators': 100,
        'max_depth': 5,
        'learning_rate': 0.1,
        'scale_pos_weight': 7.5,
    }
    mlflow.log_params(params)
    
    # Train model
    model = XGBClassifier(**params)
    
    # Cross-validation
    cv_scores = cross_validate(
        model, X_train, y_train, cv=5,
        scoring=['roc_auc', 'recall', 'precision'],
        return_train_score=True
    )
    
    # Log metrics
    mlflow.log_metrics({
        'cv_roc_auc': cv_scores['test_roc_auc'].mean(),
        'cv_recall': cv_scores['test_recall'].mean(),
        'cv_precision': cv_scores['test_precision'].mean(),
    })
    
    # Train final model
    model.fit(X_train, y_train)
    
    # Test set metrics
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    from sklearn.metrics import roc_auc_score, recall_score, precision_score
    
    mlflow.log_metrics({
        'test_roc_auc': roc_auc_score(y_test, y_pred_proba),
        'test_recall': recall_score(y_test, model.predict(X_test)),
        'test_precision': precision_score(y_test, model.predict(X_test)),
    })
    
    # Log artifacts
    mlflow.sklearn.log_model(model, "model")
    
    # Feature importance
    import pandas as pd
    feature_importance = pd.DataFrame({
        'feature': X_train.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    feature_importance.to_csv("feature_importance.csv")
    mlflow.log_artifact("feature_importance.csv")
    
    # Tags for categorization
    mlflow.set_tags({
        'team': 'data-science',
        'model_type': 'alert_optimizer',
        'status': 'ready_for_ab_test',
    })
```

---

## Part 6: Model Governance & Validation

### 6.1 Model Validation Checklist

```
PRE-PRODUCTION MODEL VALIDATION

Technical Validation:
  ☐ Model Performance
    ☐ Cross-validation AUC >0.90
    ☐ Test set AUC >0.92
    ☐ Sensitivity (recall) >95%
    ☐ Specificity >80%
    ☐ Calibration: Predicted probabilities align with true frequencies
  
  ☐ Feature Validation
    ☐ Feature importance ranked (top 5 features make sense)
    ☐ No data leakage (outcome variables not used as features)
    ☐ No multicollinearity (VIF <5 for all features)
    ☐ Missing data <5% for all features
  
  ☐ Fairness & Bias Analysis
    ☐ Performance stratified by age (<50, 50-65, >65)
      - AUC variance: <5% across groups
      - Sensitivity variance: <3% across groups
    ☐ Performance stratified by gender
      - AUC variance: <5%
    ☐ Performance stratified by ICU vs Medical vs Surgical
      - AUC variance: <5%
    ☐ No demographic features used directly (age → encoded)

Clinical Validation:
  ☐ Pilot Testing (3-5 hospitals, 2-4 weeks)
    ☐ Clinician review: Are alerts clinically sensible?
    ☐ Sensitivity: Catches 95%+ of true deteriorations
    ☐ Specificity: <25% false positive rate
    ☐ Usability: Clinicians can act on alerts
  
  ☐ Safety Assessment
    ☐ No cases of missed critical deterioration
    ☐ False alerts don't cause harm (just alert fatigue risk)
    ☐ Alert timing: Delivered within 2 seconds of threshold crossing
  
  ☐ Clinical Advisory Board Sign-Off
    ☐ Reviewed model documentation
    ☐ Reviewed pilot results
    ☐ Approved for production use
    ☐ Document: "Model safe for clinical use"

Regulatory Validation:
  ☐ FDA SaMD Compliance (if applicable)
    ☐ Modified Algorithm SOP completed
    ☐ Clinical validation data package prepared
    ☐ Risk management updated
  
  ☐ Documentation Complete
    ☐ Model Card (metadata, performance, limitations)
    ☐ Data Sheet (dataset description, collection, labeling)
    ☐ System Card (intended use, performance characteristics)
    ☐ Training reproducibility (seeds, versions, data)

Deployment Readiness:
  ☐ CI/CD Pipeline
    ☐ Automated model tests pass
    ☐ Integration tests with API pass
    ☐ Load testing: Handle 1000 RPS inference
  
  ☐ Monitoring Setup
    ☐ Model performance dashboard live
    ☐ Drift detection alerts configured
    ☐ Prediction output monitoring
    ☐ Incident response runbook ready
  
  ☐ Rollback Plan
    ☐ Previous model version verified working
    ☐ Rollback procedure tested
    ☐ RTO estimate: <5 minutes
```

---

## Success Criteria for Phase 17

| Criterion | Target | Validation |
|-----------|--------|-----------|
| **Alert Optimization Model** | AUC >0.92, Sensitivity >95% | Cross-validation + test set |
| **Data Collection & Labeling** | 10,000 patient dataset | Clinical label verification |
| **Feature Engineering** | 50+ derived features | Feature importance analysis |
| **Continuous Learning** | Automated monthly retraining | MLflow pipeline execution |
| **A/B Testing Framework** | 2-week pilot in 20% hospitals | Statistical significance testing |
| **Feature Store** | <10ms feature serving latency | Load testing validation |
| **Model Monitoring** | Drift detection alerts | Dashboard live monitoring |
| **MLflow Experiments** | 20+ tracked experiments | Run comparison dashboard |

---

**Status:** 🤖 PHASE 17 ML OPERATIONS COMPLETE

**Next Milestone:** Model deployment to production (September 2026)

**Timeline:** Concurrent with Phases 9-16 (ongoing ML development)

**Strategic Objective:** Enable continuous ML improvement, fair/safe model deployment, and production monitoring

---

**Last Updated:** April 25, 2026  
**Document Version:** 1.0 (ML Operations Framework Complete)  
**Maintained By:** Data Science & ML Engineering Team
