# Phase 9A: Advanced Clinical Features — Machine Learning & Predictive Analytics

**Status:** 🚧 FRAMEWORK DESIGN  
**Target Timeline:** June 2026 — September 2026  
**Deliverables:** ML optimization engine, predictive analytics pipeline, clinical validation  
**Integration:** Post-FDA clearance (August 2026)

---

## Overview

Phase 9A adds machine learning-driven alert optimization and predictive analytics to the core alert engine. These features enhance clinical safety by:

1. **Dynamic Threshold Optimization** — Learn from physician feedback to adjust alert thresholds per patient population
2. **Early Warning System** — Predict patient deterioration 2-4 hours before clinical crisis
3. **Personalized Risk Scoring** — Patient-specific risk stratification based on clinical patterns
4. **Alert Fatigue Reduction** — Machine learning to minimize false positives while maintaining sensitivity

---

## Component 1: ML Alert Optimization Engine

### Architecture

```python
# features/ml_alert_optimization/alert_optimizer.py
# Purpose: Learn optimal alert thresholds from physician feedback

class AlertOptimizer:
    """
    Machine learning engine for optimizing alert thresholds based on 
    physician feedback and clinical outcomes.
    
    Workflow:
    1. Collect physician feedback on each alert (correct/false positive/missed)
    2. Store feedback with clinical context (patient vitals, other observations)
    3. Train ML model on physician feedback patterns
    4. Dynamically adjust alert thresholds per patient cohort
    5. Validate new thresholds before deployment
    6. Monitor clinical outcomes post-deployment
    """
    
    def __init__(self, db_connection, model_dir):
        self.db = db_connection
        self.model_dir = model_dir
        self.feedback_buffer = []
        self.threshold_models = {}
        
    def collect_physician_feedback(self, alert_id, alert_type, feedback_type, 
                                    patient_vitals, clinical_outcome):
        """
        Record physician feedback on alert accuracy.
        
        feedback_type: 'correct' | 'false_positive' | 'false_negative' | 'delayed'
        clinical_outcome: What actually happened to patient (recovery, deterioration, etc)
        """
        feedback = {
            'alert_id': alert_id,
            'alert_type': alert_type,
            'feedback': feedback_type,
            'vitals': patient_vitals,
            'outcome': clinical_outcome,
            'timestamp': datetime.utcnow(),
            'clinician_id': get_current_user()
        }
        self.feedback_buffer.append(feedback)
        
        # Store in database for persistence
        self.db.insert('alert_feedback', feedback)
        
    def train_threshold_model(self, alert_type, min_samples=500):
        """
        Train ML model on physician feedback to predict optimal thresholds.
        
        Uses gradient boosting to learn:
        - Which vital signs matter most for this alert type
        - What threshold values minimize false positives while keeping sensitivity high
        - How thresholds should vary by patient cohort (age, comorbidities, etc)
        """
        # Retrieve feedback data for this alert type
        feedback_data = self.db.query(
            f"SELECT * FROM alert_feedback WHERE alert_type = '{alert_type}'"
        )
        
        if len(feedback_data) < min_samples:
            raise ValueError(f"Insufficient feedback ({len(feedback_data)} < {min_samples})")
        
        # Prepare training data
        X = []  # Features: patient vitals, demographics, comorbidities
        y = []  # Labels: feedback type (correct=1, false_positive=0, etc)
        
        for record in feedback_data:
            features = self._extract_features(record['vitals'], record['patient_demographics'])
            label = self._encode_feedback(record['feedback'])
            X.append(features)
            y.append(label)
        
        # Train gradient boosting model
        model = XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        model.fit(X, y)
        
        # Store model
        model_path = f"{self.model_dir}/{alert_type}_threshold_model.pkl"
        joblib.dump(model, model_path)
        self.threshold_models[alert_type] = model
        
        # Extract feature importance
        importance = dict(zip(self._feature_names(), model.feature_importances_))
        return {
            'model': model,
            'accuracy': model.score(X, y),
            'feature_importance': importance
        }
    
    def calculate_optimal_thresholds(self, alert_type, patient_cohort=None):
        """
        Use trained model to calculate optimal thresholds.
        
        Thresholds are optimized for:
        - 100% sensitivity (no false negatives)
        - Minimal false positives (target <5%)
        - Patient-specific adjustments (age, risk factors, etc)
        """
        if alert_type not in self.threshold_models:
            raise ValueError(f"No trained model for {alert_type}")
        
        model = self.threshold_models[alert_type]
        
        # For each possible threshold value, calculate sensitivity/specificity
        base_threshold = self._get_baseline_threshold(alert_type)
        threshold_range = [
            base_threshold * 0.8,  # 20% lower
            base_threshold * 0.9,
            base_threshold * 1.0,  # Current
            base_threshold * 1.1,
            base_threshold * 1.2   # 20% higher
        ]
        
        best_threshold = None
        best_score = float('inf')
        metrics = {}
        
        for threshold in threshold_range:
            # Simulate alert firing at this threshold
            sensitivity, specificity, fpr, fnr = self._calculate_metrics_at_threshold(
                alert_type, threshold, patient_cohort
            )
            
            # Score: minimize false positives while maintaining 100% sensitivity
            # Weight: FPR is bad, FNR is unacceptable
            score = (0.3 * fpr) + (10.0 * fnr)  # Heavy penalty for false negatives
            
            metrics[threshold] = {
                'sensitivity': sensitivity,
                'specificity': specificity,
                'false_positive_rate': fpr,
                'false_negative_rate': fnr,
                'score': score
            }
            
            if score < best_score:
                best_score = score
                best_threshold = threshold
        
        return {
            'optimal_threshold': best_threshold,
            'metrics_at_threshold': metrics[best_threshold],
            'all_thresholds_evaluated': metrics,
            'recommendation': self._threshold_recommendation(alert_type, best_threshold)
        }
    
    def validate_new_thresholds(self, alert_type, new_thresholds, test_patient_cohort):
        """
        Validate new thresholds on holdout test data before deployment.
        
        Ensures new thresholds maintain or improve clinical safety.
        """
        # Get test data (patients not used in training)
        test_data = self.db.query(
            f"""SELECT * FROM alert_feedback 
               WHERE alert_type = '{alert_type}' 
               AND patient_id IN ({','.join(test_patient_cohort)})"""
        )
        
        # Simulate alert firing with new thresholds
        new_sensitivity, new_specificity, new_fpr, new_fnr = self._calculate_metrics_at_threshold(
            alert_type, new_thresholds, test_patient_cohort
        )
        
        # Compare to current thresholds
        current_sensitivity, current_specificity, current_fpr, current_fnr = self._get_current_metrics(
            alert_type
        )
        
        validation_result = {
            'alert_type': alert_type,
            'new_thresholds': new_thresholds,
            'metrics': {
                'current': {
                    'sensitivity': current_sensitivity,
                    'specificity': current_specificity,
                    'false_positive_rate': current_fpr,
                    'false_negative_rate': current_fnr
                },
                'new': {
                    'sensitivity': new_sensitivity,
                    'specificity': new_specificity,
                    'false_positive_rate': new_fpr,
                    'false_negative_rate': new_fnr
                },
                'improvement': {
                    'sensitivity_delta': new_sensitivity - current_sensitivity,
                    'specificity_delta': new_specificity - current_specificity,
                    'fpr_delta': new_fpr - current_fpr,
                    'fnr_delta': new_fnr - current_fnr
                }
            },
            'approved': self._is_safe_to_deploy(new_sensitivity, current_sensitivity, 
                                                new_fnr, current_fnr),
            'reason': self._validation_reason(new_sensitivity, current_sensitivity, 
                                              new_fnr, current_fnr)
        }
        
        return validation_result
    
    def _extract_features(self, vitals, demographics):
        """Extract ML features from patient vitals and demographics."""
        return [
            vitals.get('glucose', 0),
            vitals.get('heart_rate', 0),
            vitals.get('systolic_bp', 0),
            vitals.get('diastolic_bp', 0),
            vitals.get('spo2', 0),
            vitals.get('temperature', 0),
            demographics.get('age', 0),
            demographics.get('has_diabetes', 0),
            demographics.get('has_cardiac_disease', 0),
            demographics.get('has_respiratory_disease', 0)
        ]
    
    def _encode_feedback(self, feedback_type):
        """Encode feedback type as binary classification."""
        if feedback_type == 'correct':
            return 1
        else:  # false_positive, false_negative, delayed
            return 0
    
    def _feature_names(self):
        """Return feature names for interpretability."""
        return [
            'glucose', 'heart_rate', 'systolic_bp', 'diastolic_bp', 'spo2', 'temperature',
            'age', 'has_diabetes', 'has_cardiac_disease', 'has_respiratory_disease'
        ]
    
    def _is_safe_to_deploy(self, new_sensitivity, current_sensitivity, new_fnr, current_fnr):
        """
        Validate that new thresholds are safe to deploy.
        
        Rules:
        - Must maintain ≥99% sensitivity (no loss in critical alerts)
        - FNR must not increase (no more false negatives than currently)
        - Must improve specificity or FPR (reduce false positives)
        """
        return (new_sensitivity >= 0.99 and 
                new_fnr <= current_fnr and
                new_sensitivity >= current_sensitivity)
    
    def _validation_reason(self, new_sensitivity, current_sensitivity, new_fnr, current_fnr):
        """Provide human-readable validation reason."""
        reasons = []
        if new_sensitivity < current_sensitivity:
            reasons.append(f"Sensitivity decreased ({current_sensitivity:.1%} → {new_sensitivity:.1%})")
        if new_fnr > current_fnr:
            reasons.append(f"False negative rate increased ({current_fnr:.1%} → {new_fnr:.1%})")
        if new_sensitivity < 0.99:
            reasons.append(f"Sensitivity below required 99% ({new_sensitivity:.1%})")
        
        if not reasons:
            reasons.append("Meets all safety criteria for deployment")
        
        return "; ".join(reasons)
```

### Integration with Core Alert Engine

```python
# app/alerts/alert_manager.py — Modified to use ML optimization

class AlertManager:
    def __init__(self, db_connection, ml_optimizer=None):
        self.db = db_connection
        self.ml_optimizer = ml_optimizer  # Optional ML engine
        self.alert_thresholds = self._load_thresholds()
    
    def fire_alert(self, patient_id, observation):
        """
        Fire alert if observation crosses threshold.
        Uses ML-optimized thresholds if available.
        """
        alert_type = self._classify_observation(observation)
        patient_cohort = self._get_patient_cohort(patient_id)
        
        # Use ML-optimized threshold if available, otherwise use default
        if self.ml_optimizer and alert_type in self.ml_optimizer.threshold_models:
            threshold = self.ml_optimizer.calculate_optimal_thresholds(
                alert_type, 
                patient_cohort
            )['optimal_threshold']
        else:
            threshold = self.alert_thresholds[alert_type]
        
        # Fire alert if observation exceeds threshold
        if self._exceeds_threshold(observation, threshold):
            alert = {
                'patient_id': patient_id,
                'alert_type': alert_type,
                'severity': self._calculate_severity(alert_type),
                'threshold_used': threshold,
                'optimization_version': self._get_optimization_version(alert_type),
                'timestamp': datetime.utcnow()
            }
            
            self.db.insert('alerts', alert)
            self._notify_clinician(alert)
            
            return alert
    
    def record_feedback(self, alert_id, feedback_type):
        """
        Record physician feedback on alert for ML training.
        """
        alert = self.db.query_one('alerts', {'id': alert_id})
        clinical_outcome = self.db.query_one('clinical_outcomes', 
                                            {'alert_id': alert_id})
        
        if self.ml_optimizer:
            self.ml_optimizer.collect_physician_feedback(
                alert_id,
                alert['alert_type'],
                feedback_type,
                alert['observation_values'],
                clinical_outcome
            )
```

---

## Component 2: Predictive Analytics Engine

### Early Warning System

```python
# features/predictive_analytics/early_warning_system.py
# Purpose: Predict patient deterioration 2-4 hours in advance

class EarlyWarningSystem:
    """
    Predictive model that detects patients at risk of clinical deterioration
    2-4 hours before critical alerts would normally fire.
    
    Uses multivariate time series analysis to detect:
    - Subtle vital sign trends (slow glucose decline toward hypoglycemia)
    - Pattern changes (heart rate becoming more irregular)
    - Cumulative risk (multiple minor abnormalities adding up)
    """
    
    def __init__(self, db_connection, model_dir):
        self.db = db_connection
        self.model_dir = model_dir
        self.risk_models = {}  # One model per patient cohort
        self.rolling_window = 60  # minutes of observations for analysis
        
    def calculate_deterioration_risk(self, patient_id, observation_history):
        """
        Calculate risk score (0-100) that patient will deteriorate in next 2-4 hours.
        
        Returns:
        - Risk score (0-100)
        - Risk factors contributing to score
        - Predicted time to critical condition
        - Recommended interventions
        """
        patient_cohort = self._get_patient_cohort(patient_id)
        
        # Extract time series features from observation history
        features = self._extract_time_series_features(observation_history)
        
        # Get risk model for patient cohort
        if patient_cohort not in self.risk_models:
            raise ValueError(f"No risk model for cohort {patient_cohort}")
        
        model = self.risk_models[patient_cohort]
        
        # Predict risk score
        risk_score = model.predict_proba([features])[0][1] * 100
        
        # Get feature contributions (SHAP values for interpretability)
        risk_factors = self._calculate_feature_importance(model, features)
        
        # Predict time to critical condition
        time_to_critical = self._predict_time_to_critical(
            observation_history, 
            risk_factors
        )
        
        return {
            'patient_id': patient_id,
            'risk_score': risk_score,
            'risk_level': self._categorize_risk(risk_score),
            'risk_factors': sorted(risk_factors.items(), 
                                  key=lambda x: abs(x[1]), reverse=True)[:5],
            'predicted_time_to_critical_minutes': time_to_critical,
            'recommended_actions': self._get_recommended_actions(
                patient_id, risk_score, risk_factors
            ),
            'timestamp': datetime.utcnow()
        }
    
    def train_risk_model(self, patient_cohort, training_data, min_samples=1000):
        """
        Train deterioration risk model on historical patient data.
        
        training_data format:
        {
            'observation_histories': [...],  # 60 min of vitals per patient
            'deteriorated': [True/False, ...],  # Did patient actually deteriorate?
            'time_to_deterioration_minutes': [...],  # How long until critical?
        }
        """
        if len(training_data['observation_histories']) < min_samples:
            raise ValueError(f"Insufficient training data ({len(training_data)} < {min_samples})")
        
        # Extract features from all observation histories
        X = []
        y = []
        
        for obs_history, deteriorated in zip(
            training_data['observation_histories'],
            training_data['deteriorated']
        ):
            features = self._extract_time_series_features(obs_history)
            X.append(features)
            y.append(1 if deteriorated else 0)
        
        # Train logistic regression model (interpretable for clinical use)
        model = LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight='balanced'  # Handle class imbalance
        )
        model.fit(X, y)
        
        # Validate model performance
        y_pred = model.predict(X)
        y_pred_proba = model.predict_proba(X)
        
        performance = {
            'accuracy': accuracy_score(y, y_pred),
            'sensitivity': recall_score(y, y_pred),  # Can we detect deterioration?
            'specificity': recall_score(y, 1-y_pred),  # Do we minimize false alarms?
            'auc_roc': roc_auc_score(y, y_pred_proba[:, 1]),
            'precision': precision_score(y, y_pred)
        }
        
        # Store model
        model_path = f"{self.model_dir}/{patient_cohort}_risk_model.pkl"
        joblib.dump(model, model_path)
        self.risk_models[patient_cohort] = model
        
        return {
            'model': model,
            'performance': performance,
            'feature_names': self._feature_names(),
            'recommendation': 'Approved for clinical use' if performance['sensitivity'] >= 0.85 else 'Needs more training'
        }
    
    def monitor_high_risk_patients(self):
        """
        Continuously monitor all patients and alert clinicians of high-risk cases.
        
        Runs as background job, checking high-risk patients every 5 minutes.
        """
        # Get all patients currently in system
        patients = self.db.query('patients', {})
        
        alerts = []
        for patient in patients:
            # Get last 60 minutes of observations
            observation_history = self.db.query(
                'observations',
                {
                    'patient_id': patient['id'],
                    'timestamp': {'$gte': datetime.utcnow() - timedelta(minutes=60)}
                },
                sort=[('timestamp', -1)]
            )
            
            if len(observation_history) < 10:  # Need minimum observations
                continue
            
            # Calculate risk
            risk_assessment = self.calculate_deterioration_risk(
                patient['id'],
                observation_history
            )
            
            # Alert if high risk
            if risk_assessment['risk_score'] >= 70:  # High risk threshold
                alert = {
                    'type': 'early_warning',
                    'patient_id': patient['id'],
                    'risk_score': risk_assessment['risk_score'],
                    'risk_factors': risk_assessment['risk_factors'],
                    'predicted_time_minutes': risk_assessment['predicted_time_to_critical_minutes'],
                    'actions': risk_assessment['recommended_actions'],
                    'timestamp': datetime.utcnow()
                }
                alerts.append(alert)
                
                # Store and notify
                self.db.insert('early_warning_alerts', alert)
                self._notify_clinician_of_high_risk(alert)
        
        return alerts
    
    def _extract_time_series_features(self, observation_history):
        """
        Extract ML features from time series of vital signs.
        
        Features include:
        - Trend analysis (is glucose dropping? heart rate rising?)
        - Volatility (are vitals becoming more erratic?)
        - Mean/min/max values
        - Rate of change between observations
        """
        glucose = [obs['glucose'] for obs in observation_history if 'glucose' in obs]
        hr = [obs['heart_rate'] for obs in observation_history if 'heart_rate' in obs]
        bp_sys = [obs['systolic_bp'] for obs in observation_history if 'systolic_bp' in obs]
        spo2 = [obs['spo2'] for obs in observation_history if 'spo2' in obs]
        
        features = []
        
        # Glucose features
        if glucose:
            features.extend([
                np.mean(glucose),
                np.min(glucose),
                np.max(glucose),
                np.std(glucose),  # Volatility
                np.polyfit(range(len(glucose)), glucose, 1)[0]  # Trend slope
            ])
        else:
            features.extend([0, 0, 0, 0, 0])
        
        # Heart rate features
        if hr:
            features.extend([
                np.mean(hr),
                np.min(hr),
                np.max(hr),
                np.std(hr),
                np.polyfit(range(len(hr)), hr, 1)[0]
            ])
        else:
            features.extend([0, 0, 0, 0, 0])
        
        # Blood pressure features
        if bp_sys:
            features.extend([
                np.mean(bp_sys),
                np.min(bp_sys),
                np.max(bp_sys),
                np.std(bp_sys),
                np.polyfit(range(len(bp_sys)), bp_sys, 1)[0]
            ])
        else:
            features.extend([0, 0, 0, 0, 0])
        
        # SpO2 features
        if spo2:
            features.extend([
                np.mean(spo2),
                np.min(spo2),
                np.max(spo2),
                np.std(spo2),
                np.polyfit(range(len(spo2)), spo2, 1)[0]
            ])
        else:
            features.extend([0, 0, 0, 0, 0])
        
        return features
    
    def _categorize_risk(self, risk_score):
        """Categorize risk score into clinical levels."""
        if risk_score < 30:
            return 'low'
        elif risk_score < 60:
            return 'moderate'
        elif risk_score < 80:
            return 'high'
        else:
            return 'critical'
    
    def _get_recommended_actions(self, patient_id, risk_score, risk_factors):
        """
        Return recommended clinical actions based on risk assessment.
        """
        actions = []
        
        if risk_score >= 70:
            actions.append('Increase monitoring frequency (every 15 min)')
            actions.append('Notify attending physician')
            actions.append('Consider preemptive intervention')
        
        # Add factor-specific recommendations
        for factor, contribution in risk_factors[:3]:
            if 'glucose_decline' in factor:
                actions.append('Check for insulin injection; consider dextrose')
            elif 'heart_rate_elevation' in factor:
                actions.append('Assess for pain, fever, anxiety; review medications')
            elif 'spo2_decline' in factor:
                actions.append('Check oxygen delivery; assess respiratory effort')
        
        return actions
```

---

## Component 3: Personalized Risk Stratification

```python
# features/predictive_analytics/patient_risk_profiler.py

class PatientRiskProfiler:
    """
    Creates patient-specific risk profiles based on demographics, medical history,
    current status, and longitudinal clinical data.
    
    Uses this profile to:
    - Adjust alert thresholds per patient
    - Predict patient-specific deterioration risk
    - Tailor early warning signals to patient's baseline
    """
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    def create_risk_profile(self, patient_id):
        """
        Create comprehensive risk profile for a patient.
        """
        patient = self.db.query_one('patients', {'id': patient_id})
        
        # Demographic risk factors
        demographic_score = self._calculate_demographic_risk(patient)
        
        # Comorbidity risk factors
        comorbidity_score = self._calculate_comorbidity_risk(patient)
        
        # Current clinical status risk
        recent_observations = self.db.query(
            'observations',
            {'patient_id': patient_id},
            sort=[('timestamp', -1)],
            limit=100
        )
        clinical_status_score = self._calculate_clinical_status_risk(recent_observations)
        
        # Historical risk (past deterioration events, hospitalizations)
        historical_score = self._calculate_historical_risk(patient_id)
        
        # Aggregate risk score
        overall_risk = (0.2 * demographic_score + 
                       0.3 * comorbidity_score + 
                       0.3 * clinical_status_score + 
                       0.2 * historical_score)
        
        return {
            'patient_id': patient_id,
            'overall_risk_score': overall_risk,
            'risk_breakdown': {
                'demographic': demographic_score,
                'comorbidity': comorbidity_score,
                'clinical_status': clinical_status_score,
                'historical': historical_score
            },
            'risk_category': self._categorize_overall_risk(overall_risk),
            'recommended_monitoring_frequency': self._get_monitoring_frequency(overall_risk),
            'personalized_thresholds': self._get_personalized_thresholds(patient, overall_risk),
            'timestamp': datetime.utcnow()
        }
    
    def _calculate_demographic_risk(self, patient):
        """Score risk based on age, gender, occupation."""
        score = 0
        
        # Age risk (U-shaped: very young and very old have higher risk)
        age = patient.get('age', 50)
        if age < 18 or age > 75:
            score += 10
        elif age < 40 or age > 65:
            score += 5
        
        return min(score, 100)
    
    def _calculate_comorbidity_risk(self, patient):
        """Score risk based on comorbidities."""
        score = 0
        comorbidities = patient.get('comorbidities', [])
        
        # High-risk conditions
        if 'diabetes' in comorbidities:
            score += 15
        if 'chronic_heart_disease' in comorbidities:
            score += 15
        if 'chronic_respiratory_disease' in comorbidities:
            score += 15
        if 'cancer' in comorbidities:
            score += 10
        if 'immunosuppression' in comorbidities:
            score += 15
        
        return min(score, 100)
    
    def _calculate_clinical_status_risk(self, recent_observations):
        """Score risk based on current vital signs."""
        score = 0
        
        if not recent_observations:
            return 0
        
        latest = recent_observations[0]
        
        # Abnormal vitals indicate higher current risk
        if latest.get('glucose', 100) < 100:
            score += 5
        if latest.get('heart_rate', 80) > 100:
            score += 5
        if latest.get('spo2', 95) < 94:
            score += 10
        if latest.get('temperature', 37) > 38:
            score += 5
        
        return min(score, 100)
    
    def _calculate_historical_risk(self, patient_id):
        """Score risk based on past deterioration events."""
        score = 0
        
        # Count hospitalizations in past year
        hospitalizations = self.db.query(
            'hospitalization_history',
            {
                'patient_id': patient_id,
                'date': {'$gte': datetime.utcnow() - timedelta(days=365)}
            }
        )
        score += min(len(hospitalizations) * 5, 30)
        
        # Count prior critical alerts
        critical_alerts = self.db.query(
            'alerts',
            {
                'patient_id': patient_id,
                'severity': 'P1',
                'timestamp': {'$gte': datetime.utcnow() - timedelta(days=90)}
            }
        )
        score += min(len(critical_alerts) * 3, 20)
        
        return min(score, 100)
    
    def _get_personalized_thresholds(self, patient, risk_score):
        """
        Adjust alert thresholds based on patient risk profile.
        
        High-risk patients: Lower thresholds (earlier alerts)
        Low-risk patients: Standard thresholds
        """
        if risk_score < 25:
            return {'alert_strictness': 'standard'}
        elif risk_score < 50:
            return {'alert_strictness': 'moderate', 'threshold_adjustment': 0.95}
        elif risk_score < 75:
            return {'alert_strictness': 'strict', 'threshold_adjustment': 0.85}
        else:
            return {'alert_strictness': 'very_strict', 'threshold_adjustment': 0.75}
```

---

## Clinical Validation & Compliance

### Validation Process

1. **Offline Training** (June 2026)
   - Train ML models on Phase 6 test data
   - Validate on holdout test set
   - Physician review of model behavior

2. **Shadow Mode** (July 2026)
   - Deploy ML models running in parallel with existing alerts
   - Capture ML recommendations without affecting clinical care
   - Compare ML recommendations to actual physician actions
   - Measure ML accuracy in real-world setting

3. **Limited Deployment** (August 2026)
   - Deploy ML optimization on subset of patients (pilot)
   - Monitor alert accuracy, false positive rate, clinical outcomes
   - Physician feedback on usefulness

4. **Full Deployment** (September 2026)
   - Roll out to all patients
   - Continuous monitoring of performance
   - Regular retraining as new feedback accumulates

### FDA Regulatory Approach

**Modified Algorithm SOP (Software as a Medical Device):**
- Document that AI/ML is being used to optimize thresholds
- Clearly delineate baseline (FDA-cleared) vs. enhanced (ML-optimized) thresholds
- Commit to quarterly revalidation of ML models
- Establish procedures for rollback if ML degrades performance
- FDA will classify ML optimization as "minor modification" not requiring 510(k) resubmission

**Required Determinations:**
- ML does not change indications for use (still monitoring same patient conditions)
- ML only optimizes thresholds, does not change clinical decision logic
- All optimization is transparent to clinicians (they see which threshold version is active)

---

## Success Criteria for Phase 9A

| Criterion | Target | Validation Method |
|-----------|--------|-------------------|
| **Threshold Optimization** | ≥95% accuracy on test set | Offline validation |
| **Sensitivity Maintained** | ≥99% (no false negatives) | Real-world monitoring |
| **False Positive Reduction** | <5% | Real-world monitoring |
| **Early Warning Sensitivity** | ≥80% detect 2-4h early | Shadow mode validation |
| **Clinician Trust** | ≥80% find ML helpful | Physician feedback survey |
| **FDA Compliance** | Approved for clinical use | FDA determination letter |

---

**Status:** Framework design complete  
**Next Step:** Implementation and clinical validation (June 2026)  
**Blocking Items:** None — Ready to proceed post-FDA clearance
