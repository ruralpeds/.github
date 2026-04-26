# Phase 9E: Enterprise Scaling — Multi-Tenant, Custom Rules, Analytics Platform

**Status:** 🚧 ARCHITECTURE DESIGN  
**Target Timeline:** October 2026 — March 2027  
**Deliverables:** Multi-tenant infrastructure, custom alert rule builder, clinical analytics platform

---

## Overview

Phase 9E transforms the platform from single-institution deployment to enterprise-scale multi-tenant SaaS, enabling:
- **Multi-Tenant Architecture:** Multiple hospitals on shared infrastructure with complete data isolation
- **Custom Alert Rules:** No-code/low-code rule builder for clinician-defined alerts
- **Advanced Analytics:** Longitudinal patient data analysis, outcome tracking, clinical research
- **Enterprise Billing:** Per-facility licensing, usage-based billing, contract management

---

## Component 1: Multi-Tenant Architecture

### Tenant Isolation Model

```
┌─────────────────────────────────────────────────────────┐
│              Shared Infrastructure Layer                │
│  (Kubernetes cluster, RDS PostgreSQL, S3, KMS)         │
└────┬──────────────────────────────────────────┬─────────┘
     │                                          │
┌────▼──────────────────────────────────────────▼─────────┐
│           Tenant Router & Isolation Layer                │
│  • Tenant ID extracted from JWT                         │
│  • Routing to tenant-specific resources                 │
│  • Data access control per tenant                       │
└────┬──────────────────────────────────────────┬─────────┘
     │                                          │
┌────▼────────────┐                    ┌───────▼──────────┐
│   Hospital A    │                    │  Hospital B      │
│  (Data Store)   │                    │ (Data Store)     │
│                 │                    │                  │
│ • Patients      │                    │ • Patients       │
│ • Observations  │                    │ • Observations   │
│ • Alerts        │                    │ • Alerts         │
│ • Config        │                    │ • Config         │
└─────────────────┘                    └──────────────────┘
```

### Tenant-Aware Data Model

```python
# app/models/tenant.py

from sqlalchemy import Column, String, Integer, ForeignKey, Index
from sqlalchemy.orm import relationship

class Tenant(Base):
    """
    Represents a hospital/institution using the platform.
    """
    __tablename__ = 'tenants'
    
    id = Column(String(36), primary_key=True)  # UUID
    name = Column(String(255), nullable=False)  # Hospital name
    region = Column(String(50), nullable=False)  # AWS region for data residency
    environment = Column(String(50))  # production, staging
    
    # Billing & licensing
    subscription_tier = Column(String(50))  # basic, professional, enterprise
    license_seats = Column(Integer)  # Number of clinicians licensed
    contract_start = Column(DateTime)
    contract_end = Column(DateTime)
    
    # Configuration
    alert_thresholds = Column(JSON)  # Customized per tenant
    escalation_procedures = Column(JSON)
    
    # Data residency & compliance
    data_region = Column(String(50))  # EU, CA, AU, JP, etc
    encryption_key_id = Column(String(255))  # Tenant-specific KMS key
    
    # Relationships
    patients = relationship('Patient', back_populates='tenant', cascade='all, delete-orphan')
    observations = relationship('Observation', back_populates='tenant')
    users = relationship('ClinicalUser', back_populates='tenant')

class Patient(Base):
    """
    Patient record with tenant isolation.
    """
    __tablename__ = 'patients'
    __table_args__ = (
        Index('idx_tenant_mrn', 'tenant_id', 'mrn'),  # Composite index
        Index('idx_tenant_name', 'tenant_id', 'name'),
    )
    
    id = Column(String(36), primary_key=True)
    tenant_id = Column(String(36), ForeignKey('tenants.id'), nullable=False)
    mrn = Column(String(255), nullable=False)
    
    # Standard fields
    name = Column(String(255))
    dob = Column(DateTime)
    gender = Column(String(10))
    
    # Relationships
    tenant = relationship('Tenant', back_populates='patients')
    observations = relationship('Observation', back_populates='patient', cascade='all')

class Observation(Base):
    """
    Vital sign observation with tenant isolation.
    """
    __tablename__ = 'observations'
    __table_args__ = (
        Index('idx_tenant_patient_time', 'tenant_id', 'patient_id', 'timestamp'),
    )
    
    id = Column(String(36), primary_key=True)
    tenant_id = Column(String(36), ForeignKey('tenants.id'), nullable=False)
    patient_id = Column(String(36), ForeignKey('patients.id'), nullable=False)
    
    # Vital sign data
    observation_type = Column(String(50))  # glucose, heart_rate, etc
    value = Column(Float)
    timestamp = Column(DateTime, index=True)
    
    # Relationships
    tenant = relationship('Tenant', back_populates='observations')
    patient = relationship('Patient', back_populates='observations')
```

### Tenant-Aware Query Middleware

```python
# app/middleware/tenant_middleware.py

from fastapi import Request, HTTPException
from functools import wraps
import jwt

class TenantMiddleware:
    """
    Middleware that:
    1. Extracts tenant ID from JWT token
    2. Validates tenant subscription status
    3. Enforces data isolation in all queries
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, request: Request, call_next):
        # Extract tenant ID from JWT
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            raise HTTPException(status_code=401, detail='Missing authentication token')
        
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
            tenant_id = payload.get('tenant_id')
            user_id = payload.get('user_id')
            
            if not tenant_id:
                raise HTTPException(status_code=401, detail='Missing tenant in token')
            
            # Store in request context for use in route handlers
            request.state.tenant_id = tenant_id
            request.state.user_id = user_id
            
            # Verify tenant subscription is active
            db = SessionLocal()
            tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
            
            if not tenant:
                raise HTTPException(status_code=403, detail='Tenant not found')
            
            if datetime.utcnow() > tenant.contract_end:
                raise HTTPException(status_code=403, detail='Subscription expired')
            
            response = await call_next(request)
            return response
        
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail='Invalid token')

# Apply middleware to all routes
app.add_middleware(TenantMiddleware)

# In route handlers, use @get_tenant_id decorator
def get_tenant_id(request: Request) -> str:
    """Extract tenant ID from request context."""
    return request.state.tenant_id

@app.get('/patients')
async def list_patients(request: Request, db: Session = Depends(get_db)):
    tenant_id = get_tenant_id(request)
    
    # Always filter by tenant_id — impossible to query across tenants
    patients = db.query(Patient).filter(
        Patient.tenant_id == tenant_id
    ).all()
    
    return patients
```

### Tenant-Specific Configuration

```python
# features/multi_tenant/tenant_config.py

class TenantConfiguration:
    """
    Per-tenant customization of alert rules, escalation procedures, etc.
    """
    
    def get_alert_thresholds(self, tenant_id: str) -> dict:
        """
        Retrieve customized alert thresholds for tenant.
        Falls back to defaults if not customized.
        """
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        
        if tenant.alert_thresholds:
            return tenant.alert_thresholds
        else:
            # Return system defaults
            return {
                'hypoglycemia': {'threshold': 40, 'severity': 'P1'},
                'hyperglycemia': {'threshold': 350, 'severity': 'P1'},
                'sepsis': {'sirs_criteria': 2, 'severity': 'P1'},
                'respiratory_failure': {'spo2_threshold': 85, 'severity': 'P1'},
                'arrhythmia': {'heart_rate_threshold': 160, 'severity': 'P1'},
                'hypertension': {'sbp_threshold': 200, 'dbp_threshold': 120, 'severity': 'P1'}
            }
    
    def get_escalation_procedure(self, tenant_id: str, severity: str) -> dict:
        """
        Get escalation procedures per severity level and tenant.
        """
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        
        if tenant.escalation_procedures and severity in tenant.escalation_procedures:
            return tenant.escalation_procedures[severity]
        else:
            # Return defaults
            defaults = {
                'P1': {
                    'initial_notify': ['charge_nurse', 'attending'],
                    'page_after_minutes': 5,
                    'escalate_to': ['supervisor', 'hospitalist'],
                    'escalate_after_minutes': 15
                },
                'P2': {
                    'initial_notify': ['charge_nurse'],
                    'page_after_minutes': 30
                },
                'P3': {
                    'initial_notify': ['system_dashboard'],
                    'page_after_minutes': None
                }
            }
            return defaults.get(severity, {})
```

---

## Component 2: Custom Alert Rule Builder

### No-Code Rule Builder Interface

```typescript
// features/custom_rules/RuleBuilder.tsx
// React component for drag-and-drop rule creation

import React, { useState } from 'react';
import { Card, Button, Input, Select, Slider, Checkbox } from '@ui-library';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  conditions: Condition[];
  severity: 'P1' | 'P2' | 'P3';
  enabled: boolean;
}

interface Condition {
  type: 'vital' | 'trend' | 'combination';
  vital?: string;  // glucose, heart_rate, etc
  operator: '<' | '>' | '==' | '!=' | 'sustained_for';
  value: number;
  duration?: number;  // for sustained conditions
}

export function RuleBuilder() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  const handleAddRule = () => {
    const newRule: AlertRule = {
      id: generateUUID(),
      name: 'New Rule',
      description: '',
      conditions: [],
      severity: 'P2',
      enabled: false
    };
    setSelectedRule(newRule);
    setEditMode(true);
  };
  
  const handleSaveRule = async (rule: AlertRule) => {
    // Save to database
    const response = await fetch('/api/custom-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    
    if (response.ok) {
      // Add to local state
      setRules([...rules, rule]);
      setEditMode(false);
    }
  };
  
  const handleTestRule = async (rule: AlertRule) => {
    // Run rule against recent patient data to see how many alerts would fire
    const response = await fetch('/api/custom-rules/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    
    const result = await response.json();
    alert(`Rule would trigger ${result.match_count} alerts on recent data`);
  };
  
  return (
    <div className="rule-builder">
      <h1>Custom Alert Rules</h1>
      
      <Button onClick={handleAddRule}>+ Create New Rule</Button>
      
      {editMode && selectedRule && (
        <RuleEditor
          rule={selectedRule}
          onSave={handleSaveRule}
          onTest={handleTestRule}
          onCancel={() => setEditMode(false)}
        />
      )}
      
      <div className="rules-list">
        {rules.map(rule => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onEdit={() => {
              setSelectedRule(rule);
              setEditMode(true);
            }}
            onDelete={() => {
              // Delete rule
            }}
          />
        ))}
      </div>
    </div>
  );
}

function RuleEditor({ rule, onSave, onTest, onCancel }) {
  const [name, setName] = useState(rule.name);
  const [description, setDescription] = useState(rule.description);
  const [severity, setSeverity] = useState(rule.severity);
  const [conditions, setConditions] = useState(rule.conditions);
  
  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      { type: 'vital', operator: '>', value: 0 }
    ]);
  };
  
  return (
    <Card className="rule-editor">
      <h2>Edit Rule</h2>
      
      <div className="form-group">
        <label>Rule Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Sustained Tachycardia"
        />
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this rule detect?"
        />
      </div>
      
      <div className="form-group">
        <label>Severity</label>
        <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="P1">Critical (P1)</option>
          <option value="P2">High (P2)</option>
          <option value="P3">Medium (P3)</option>
        </Select>
      </div>
      
      <div className="conditions">
        <h3>Conditions (ALL must be true)</h3>
        
        {conditions.map((condition, idx) => (
          <ConditionEditor
            key={idx}
            condition={condition}
            onChange={(updated) => {
              const newConditions = [...conditions];
              newConditions[idx] = updated;
              setConditions(newConditions);
            }}
          />
        ))}
        
        <Button variant="secondary" onClick={handleAddCondition}>
          + Add Condition
        </Button>
      </div>
      
      <div className="actions">
        <Button variant="primary" onClick={() => onSave({ ...rule, name, description, severity, conditions })}>
          Save Rule
        </Button>
        <Button variant="secondary" onClick={() => onTest({ ...rule, name, description, severity, conditions })}>
          Test Rule
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

function ConditionEditor({ condition, onChange }) {
  return (
    <Card className="condition">
      <Select
        value={condition.type}
        onChange={(e) => onChange({ ...condition, type: e.target.value })}
      >
        <option value="vital">Single Vital</option>
        <option value="trend">Trend (e.g., glucose dropping)</option>
        <option value="combination">Multiple Vitals</option>
      </Select>
      
      {condition.type === 'vital' && (
        <>
          <Select
            value={condition.vital || ''}
            onChange={(e) => onChange({ ...condition, vital: e.target.value })}
          >
            <option value="">Select Vital</option>
            <option value="glucose">Glucose (mg/dL)</option>
            <option value="heart_rate">Heart Rate (bpm)</option>
            <option value="systolic_bp">Systolic BP (mmHg)</option>
            <option value="spo2">SpO2 (%)</option>
            <option value="temperature">Temperature (°C)</option>
          </Select>
          
          <Select
            value={condition.operator}
            onChange={(e) => onChange({ ...condition, operator: e.target.value })}
          >
            <option value="<">Less than</option>
            <option value=">">Greater than</option>
            <option value="==">Equals</option>
            <option value="sustained_for">Sustained for</option>
          </Select>
          
          <Input
            type="number"
            value={condition.value}
            onChange={(e) => onChange({ ...condition, value: parseFloat(e.target.value) })}
            placeholder="Value"
          />
          
          {condition.operator === 'sustained_for' && (
            <Input
              type="number"
              value={condition.duration}
              onChange={(e) => onChange({ ...condition, duration: parseInt(e.target.value) })}
              placeholder="Minutes"
            />
          )}
        </>
      )}
    </Card>
  );
}
```

### Rule Storage & Validation

```python
# features/custom_rules/rule_engine.py

class CustomRuleEngine:
    """
    Evaluates patient observations against custom alert rules.
    """
    
    def __init__(self, db: Session, tenant_id: str):
        self.db = db
        self.tenant_id = tenant_id
    
    def load_rules(self) -> List[AlertRule]:
        """
        Load all enabled rules for tenant.
        """
        return self.db.query(AlertRule).filter(
            AlertRule.tenant_id == self.tenant_id,
            AlertRule.enabled == True
        ).all()
    
    def evaluate_observation(self, observation: dict) -> List[dict]:
        """
        Evaluate a new observation against all custom rules.
        Returns list of alerts that should fire.
        """
        rules = self.load_rules()
        triggered_alerts = []
        
        for rule in rules:
            # Evaluate all conditions
            conditions_met = True
            
            for condition in rule.conditions:
                if not self._evaluate_condition(condition, observation):
                    conditions_met = False
                    break
            
            # If all conditions met, fire alert
            if conditions_met:
                alert = {
                    'rule_id': rule.id,
                    'rule_name': rule.name,
                    'severity': rule.severity,
                    'patient_id': observation['patient_id'],
                    'trigger_value': observation['value'],
                    'timestamp': datetime.utcnow()
                }
                triggered_alerts.append(alert)
        
        return triggered_alerts
    
    def _evaluate_condition(self, condition: dict, observation: dict) -> bool:
        """
        Evaluate a single condition against observation.
        """
        if condition['type'] == 'vital':
            if condition['operator'] == '>':
                return observation.get(condition['vital'], 0) > condition['value']
            elif condition['operator'] == '<':
                return observation.get(condition['vital'], 0) < condition['value']
            elif condition['operator'] == '==':
                return observation.get(condition['vital'], 0) == condition['value']
            elif condition['operator'] == 'sustained_for':
                # Check if vital sustained for N minutes
                return self._check_sustained(
                    condition['vital'],
                    condition['value'],
                    condition['duration'],
                    observation['patient_id']
                )
        
        return False
    
    def _check_sustained(self, vital_type: str, threshold: float, duration_minutes: int, 
                        patient_id: str) -> bool:
        """
        Check if vital has been above/below threshold for duration.
        """
        cutoff_time = datetime.utcnow() - timedelta(minutes=duration_minutes)
        
        recent_obs = self.db.query(Observation).filter(
            Observation.patient_id == patient_id,
            Observation.tenant_id == self.tenant_id,
            Observation.observation_type == vital_type,
            Observation.timestamp >= cutoff_time
        ).order_by(Observation.timestamp.desc()).all()
        
        if not recent_obs:
            return False
        
        # All observations in window must be above threshold
        for obs in recent_obs:
            if obs.value < threshold:
                return False
        
        return True
    
    def test_rule(self, rule: AlertRule, lookback_days: int = 7) -> dict:
        """
        Test a rule against historical data.
        """
        # Get all observations from past N days
        cutoff_time = datetime.utcnow() - timedelta(days=lookback_days)
        
        observations = self.db.query(Observation).filter(
            Observation.tenant_id == self.tenant_id,
            Observation.timestamp >= cutoff_time
        ).all()
        
        match_count = 0
        for obs in observations:
            alerts = self.evaluate_observation(obs)
            if any(alert['rule_id'] == rule.id for alert in alerts):
                match_count += 1
        
        return {
            'rule_id': rule.id,
            'lookback_days': lookback_days,
            'match_count': match_count,
            'affected_patients': len(set(obs.patient_id for obs in observations))
        }
```

---

## Component 3: Clinical Analytics Platform

### Longitudinal Patient Analytics

```python
# features/analytics/patient_analytics.py

class PatientAnalytics:
    """
    Analyze patient data over time to assess outcomes and trends.
    """
    
    def __init__(self, db: Session, tenant_id: str):
        self.db = db
        self.tenant_id = tenant_id
    
    def get_patient_timeline(self, patient_id: str, days: int = 30) -> dict:
        """
        Retrieve complete patient timeline: observations, alerts, interventions, outcomes.
        """
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        
        # Get all observations
        observations = self.db.query(Observation).filter(
            Observation.patient_id == patient_id,
            Observation.tenant_id == self.tenant_id,
            Observation.timestamp >= cutoff_time
        ).order_by(Observation.timestamp.asc()).all()
        
        # Get all alerts
        alerts = self.db.query(Alert).filter(
            Alert.patient_id == patient_id,
            Alert.tenant_id == self.tenant_id,
            Alert.timestamp >= cutoff_time
        ).order_by(Alert.timestamp.asc()).all()
        
        # Get all interventions
        interventions = self.db.query(ClinicalIntervention).filter(
            ClinicalIntervention.patient_id == patient_id,
            ClinicalIntervention.timestamp >= cutoff_time
        ).order_by(ClinicalIntervention.timestamp.asc()).all()
        
        # Build timeline
        timeline = []
        timeline.extend([{
            'type': 'observation',
            'timestamp': obs.timestamp,
            'data': obs
        } for obs in observations])
        timeline.extend([{
            'type': 'alert',
            'timestamp': alert.timestamp,
            'data': alert
        } for alert in alerts])
        timeline.extend([{
            'type': 'intervention',
            'timestamp': intervention.timestamp,
            'data': intervention
        } for intervention in interventions])
        
        timeline.sort(key=lambda x: x['timestamp'])
        
        return {
            'patient_id': patient_id,
            'date_range': {'start': cutoff_time, 'end': datetime.utcnow()},
            'timeline': timeline,
            'summary': {
                'observation_count': len(observations),
                'alert_count': len(alerts),
                'intervention_count': len(interventions)
            }
        }
    
    def calculate_patient_outcomes(self, patient_id: str) -> dict:
        """
        Calculate clinical outcomes for patient.
        """
        alerts = self.db.query(Alert).filter(
            Alert.patient_id == patient_id,
            Alert.tenant_id == self.tenant_id
        ).all()
        
        interventions = self.db.query(ClinicalIntervention).filter(
            ClinicalIntervention.patient_id == patient_id
        ).all()
        
        # Metrics
        metrics = {
            'total_alerts': len(alerts),
            'alert_breakdown': {
                'P1': len([a for a in alerts if a.severity == 'P1']),
                'P2': len([a for a in alerts if a.severity == 'P2']),
                'P3': len([a for a in alerts if a.severity == 'P3'])
            },
            'intervention_rate': len(interventions) / max(len(alerts), 1),  # How many alerts had interventions?
            'average_response_time_minutes': self._calculate_avg_response_time(alerts, interventions)
        }
        
        return metrics
    
    def _calculate_avg_response_time(self, alerts: List[Alert], interventions: List[ClinicalIntervention]) -> float:
        """Calculate average time from alert to intervention."""
        response_times = []
        
        for alert in alerts:
            # Find first intervention after this alert
            subsequent_interventions = [
                i for i in interventions 
                if i.timestamp > alert.timestamp 
                and (i.timestamp - alert.timestamp).total_seconds() < 3600  # Within 1 hour
            ]
            
            if subsequent_interventions:
                first_intervention = min(subsequent_interventions, key=lambda x: x.timestamp)
                response_time = (first_intervention.timestamp - alert.timestamp).total_seconds() / 60
                response_times.append(response_time)
        
        if response_times:
            return sum(response_times) / len(response_times)
        else:
            return 0

class InstanceAnalytics:
    """
    Analyze system-wide metrics across all patients in institution.
    """
    
    def __init__(self, db: Session, tenant_id: str):
        self.db = db
        self.tenant_id = tenant_id
    
    def get_dashboard_metrics(self, days: int = 7) -> dict:
        """
        Get institution-wide metrics for dashboard.
        """
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        
        alerts = self.db.query(Alert).filter(
            Alert.tenant_id == self.tenant_id,
            Alert.timestamp >= cutoff_time
        ).all()
        
        patients_with_alerts = len(set(a.patient_id for a in alerts))
        
        return {
            'date_range_days': days,
            'total_alerts': len(alerts),
            'alerts_by_severity': {
                'P1': len([a for a in alerts if a.severity == 'P1']),
                'P2': len([a for a in alerts if a.severity == 'P2']),
                'P3': len([a for a in alerts if a.severity == 'P3'])
            },
            'unique_patients_with_alerts': patients_with_alerts,
            'average_alerts_per_patient': len(alerts) / max(patients_with_alerts, 1),
            'alerts_by_type': self._breakdown_by_type(alerts),
            'trending': self._calculate_trends(alerts)
        }
    
    def _breakdown_by_type(self, alerts: List[Alert]) -> dict:
        """Breakdown alerts by type."""
        breakdown = {}
        for alert in alerts:
            if alert.alert_type not in breakdown:
                breakdown[alert.alert_type] = 0
            breakdown[alert.alert_type] += 1
        return breakdown
    
    def _calculate_trends(self, alerts: List[Alert]) -> dict:
        """Calculate if alerts are increasing/decreasing."""
        if len(alerts) < 2:
            return {'direction': 'stable'}
        
        # Split into two periods
        midpoint = len(alerts) // 2
        first_period = alerts[:midpoint]
        second_period = alerts[midpoint:]
        
        first_count = len(first_period)
        second_count = len(second_period)
        
        if second_count > first_count * 1.2:
            direction = 'increasing'
        elif second_count < first_count * 0.8:
            direction = 'decreasing'
        else:
            direction = 'stable'
        
        return {
            'direction': direction,
            'change_percent': ((second_count - first_count) / max(first_count, 1)) * 100
        }
```

---

## Component 4: Enterprise Billing & Licensing

```python
# features/billing/subscription_manager.py

class SubscriptionManager:
    """
    Manage tenant subscriptions, licensing, and billing.
    """
    
    TIER_FEATURES = {
        'basic': {
            'max_patients': 5000,
            'max_users': 25,
            'alert_rules': 'system_only',  # No custom rules
            'analytics': 'basic_only',
            'cost_per_month': 5000
        },
        'professional': {
            'max_patients': 25000,
            'max_users': 100,
            'alert_rules': 'custom_allowed',
            'analytics': 'advanced',
            'cost_per_month': 15000
        },
        'enterprise': {
            'max_patients': 'unlimited',
            'max_users': 'unlimited',
            'alert_rules': 'custom_allowed',
            'analytics': 'advanced_plus_ml',
            'cost_per_month': 'custom',
            'custom_sso': True,
            'dedicated_support': True
        }
    }
    
    def __init__(self, db: Session, payment_processor):
        self.db = db
        self.payment = payment_processor
    
    def create_subscription(self, tenant_id: str, tier: str, contract_months: int) -> dict:
        """
        Create new subscription for tenant.
        """
        if tier not in self.TIER_FEATURES:
            raise ValueError(f"Invalid tier: {tier}")
        
        features = self.TIER_FEATURES[tier]
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        
        if not tenant:
            raise ValueError(f"Tenant not found: {tenant_id}")
        
        # Calculate cost
        monthly_cost = features['cost_per_month']
        if isinstance(monthly_cost, int):
            total_cost = monthly_cost * contract_months
        else:
            # Custom enterprise pricing — handled separately
            total_cost = None
        
        # Create subscription record
        subscription = {
            'tenant_id': tenant_id,
            'tier': tier,
            'features': features,
            'contract_start': datetime.utcnow(),
            'contract_end': datetime.utcnow() + timedelta(days=30*contract_months),
            'total_cost': total_cost,
            'status': 'active'
        }
        
        self.db.insert('subscriptions', subscription)
        
        # Process payment
        if total_cost:
            payment_result = self.payment.charge_card(
                tenant_id=tenant_id,
                amount_cents=int(total_cost * 100),
                description=f'{tier} tier subscription ({contract_months} months)'
            )
            
            if not payment_result['success']:
                raise Exception(f"Payment failed: {payment_result['error']}")
        
        return subscription
    
    def track_usage(self, tenant_id: str) -> dict:
        """
        Track current usage against license limits.
        """
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        subscription = self.db.query('subscriptions').filter_by(tenant_id=tenant_id).first()
        
        # Count patients
        patient_count = self.db.query(Patient).filter(
            Patient.tenant_id == tenant_id
        ).count()
        
        # Count users
        user_count = self.db.query(ClinicalUser).filter(
            ClinicalUser.tenant_id == tenant_id
        ).count()
        
        features = subscription['features']
        
        max_patients = features['max_patients'] if features['max_patients'] != 'unlimited' else float('inf')
        max_users = features['max_users'] if features['max_users'] != 'unlimited' else float('inf')
        
        usage = {
            'subscription_tier': subscription['tier'],
            'patients': {
                'current': patient_count,
                'limit': max_patients,
                'percent_used': (patient_count / max_patients * 100) if max_patients != float('inf') else 0
            },
            'users': {
                'current': user_count,
                'limit': max_users,
                'percent_used': (user_count / max_users * 100) if max_users != float('inf') else 0
            },
            'warnings': self._check_warnings(patient_count, user_count, features)
        }
        
        return usage
    
    def _check_warnings(self, patients: int, users: int, features: dict) -> list:
        """Check if tenant is approaching limits."""
        warnings = []
        
        if features['max_patients'] != 'unlimited':
            if patients > features['max_patients'] * 0.9:
                warnings.append(f"Patient count approaching limit: {patients}/{features['max_patients']}")
        
        if features['max_users'] != 'unlimited':
            if users > features['max_users'] * 0.9:
                warnings.append(f"User count approaching limit: {users}/{features['max_users']}")
        
        return warnings
```

---

## Deployment Architecture

### Multi-Region Infrastructure

```
┌────────────────────────────────────────────────────────────┐
│         Global Load Balancer (Route 53)                    │
└────┬───────────────────────┬───────────────────────┬───────┘
     │                       │                       │
┌────▼────────┐         ┌────▼────────┐         ┌────▼────────┐
│   US-East   │         │   EU-West   │         │   AP-SE     │
│ (us-east-1) │         │(eu-west-1)  │         │(ap-se1-1)   │
│             │         │             │         │             │
│ - EKS       │         │ - EKS       │         │ - EKS       │
│ - RDS       │         │ - RDS       │         │ - RDS       │
│ - S3        │         │ - S3        │         │ - S3        │
└─────────────┘         └─────────────┘         └─────────────┘

Each region:
- Tenant data routed to appropriate region
- Independent RDS instance per region
- Shared KMS keys per region (data residency)
- Cross-region failover for high availability
```

---

## Success Criteria

| Criterion | Target | Validation |
|-----------|--------|-----------|
| **Multi-Tenant Isolation** | 100% data isolation | Security audit |
| **Custom Rules** | ≥80% adoption | Usage tracking |
| **Analytics Dashboard** | <2s load time | Performance testing |
| **System Scalability** | 1000+ hospitals | Load testing |
| **Billing Accuracy** | 99.99% | Audit trail |

---

**Status:** Architecture complete  
**Next Step:** Implementation (October 2026)  
**Blocking Items:** None — Ready to proceed post-FDA clearance
