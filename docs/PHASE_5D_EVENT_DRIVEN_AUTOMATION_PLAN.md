# Phase 5D: Event-Driven Automation

**Status:** Implementation  
**Date:** May 4, 2026  
**Duration:** 1-2 weeks  
**Expected Savings:** 5-15% (reduced manual intervention, faster remediation)

---

## Overview

Event-driven automation reacts automatically to system events, reducing manual intervention and enabling self-healing infrastructure. Built on Phase 5C observability metrics, Phase 5D implements autonomous responses to common operational conditions.

## Architecture

```
Observability Metrics
        ↓
  Event Detector (evaluates conditions)
        ↓
  Event Triggered (meets criteria)
        ↓
  Event Responder (automated action)
        ↓
  Audit Log (tracked for compliance)
```

## Key Events

### 1. Queue Depth Event
**Trigger**: Job queue depth > 20 for > 15 minutes  
**Response**:
- Scale up Kubernetes runners (1 → 5 pods)
- Create GitHub issue for manual review
- Send Slack notification

**Implementation**: 
- Check queue every 5 minutes
- Calculate moving average (15-min window)
- Trigger auto-scale if threshold sustained

### 2. Runner Health Event
**Trigger**: Runner uptime < 95% or offline for > 5 minutes  
**Response**:
- Attempt graceful restart
- Reboot if restart fails
- Create critical issue
- Notify ops team

**Implementation**:
- Monitor runner health from Phase 5C metrics
- Drain in-flight jobs before reboot
- Verify health after recovery

### 3. Cost Spike Event
**Trigger**: Hourly cost > 150% of 24-hour average  
**Response**:
- Create warning issue
- Reduce job parallelism by 50%
- Cancel low-priority queued jobs
- Send cost alert

**Implementation**:
- Track hourly cost aggregates
- Compare against rolling 24-hour average
- Implement circuit breaker pattern

### 4. Disk Space Event
**Trigger**: Disk usage > 85% on any runner  
**Response**:
- Trigger automated cleanup (cache, artifacts)
- Pause new jobs on affected runner
- Create urgent issue
- Alert ops

**Implementation**:
- Monitor /proc/disk on runners
- Run cleanup scripts automatically
- Resume jobs after successful cleanup

### 5. High Failure Rate Event
**Trigger**: Failure rate > 20% in 1-hour window  
**Response**:
- Create incident issue
- Trigger investigation workflow
- Collect logs and metrics
- Alert on-call engineer

**Implementation**:
- Aggregate failure counts hourly
- Trigger automated diagnostics
- Archive logs for later analysis

### 6. Job Duration Regression Event
**Trigger**: Job duration > 2x baseline for 3+ consecutive runs  
**Response**:
- Create issue with regression details
- Disable job optimization flags (if any)
- Capture system profiles for analysis
- Notify development team

**Implementation**:
- Use Phase 5C regression detection
- Profile execution on problematic runs
- Store profiles for analysis

## Implementation Components

### 1. Event Detector Engine (`event-detector.py`)

```python
class EventDetector:
    def __init__(self, metrics_source, rules_file):
        self.metrics = metrics_source
        self.rules = load_rules(rules_file)
    
    def evaluate(self) -> List[Event]:
        """Evaluate all rules, return triggered events"""
        events = []
        for rule in self.rules:
            if self._evaluate_rule(rule):
                events.append(Event(rule))
        return events
    
    def _evaluate_rule(self, rule) -> bool:
        """Check if rule conditions are met"""
        # Compare current metrics against thresholds
        # Support: >, <, ==, changed, trend
        pass
```

**Input**: Aggregated metrics from Phase 5C  
**Output**: List of triggered events with severity and context  
**Key Methods**:
- `evaluate()`: Run all rules, return events
- `_evaluate_rule()`: Test single rule condition
- `_get_metric()`: Extract metric value with lookback window

### 2. Event Responder Workflow (prototype retired during GAP-002 cleanup)

```yaml
on:
  workflow_dispatch:
    inputs:
      event_type: [queue_depth, runner_health, cost_spike, disk_space, failure_rate, regression]

jobs:
  route-event:
    runs-on: ubuntu-latest
    steps:
      - name: Route to handler
        run: |
          case ${{ inputs.event_type }} in
            queue_depth) workflow_dispatch scale-runners ;;
            runner_health) workflow_dispatch recover-runner ;;
            cost_spike) workflow_dispatch cost-controls ;;
            disk_space) workflow_dispatch cleanup-disk ;;
          esac
```

**Responses**:
- `scale-runners.yml`: Auto-scale Kubernetes pods (1 → 5)
- `recover-runner.yml`: Attempt health recovery, restart if needed
- `cost-controls.yml`: Reduce parallelism, cancel low-priority jobs
- `cleanup-disk.yml`: Run cleanup scripts, verify space
- `create-incident.yml`: Create issue with context, notify team

### 3. Event Rules Configuration (`config/event-rules.json`)

```json
{
  "queue_depth": {
    "metric": "queue_depth",
    "threshold": 20,
    "window_minutes": 15,
    "action": "scale_runners",
    "scale_target": 5,
    "enabled": true
  },
  "runner_health": {
    "metric": "runner_uptime_percent",
    "threshold": 95,
    "comparison": "less_than",
    "window_minutes": 5,
    "action": "recover_runner",
    "retry_count": 3,
    "enabled": true
  }
}
```

### 4. Automation Workflows

#### a. Scale Runners (`scale-runners.yml`)
```yaml
name: Auto-Scale Runners

on:
  workflow_dispatch:
    inputs:
      target_replicas:
        type: number
        default: 5

jobs:
  scale:
    runs-on: ubuntu-latest
    steps:
      - name: Scale Kubernetes deployment
        run: |
          kubectl scale deployment actions-runner \
            --replicas=${{ inputs.target_replicas }} \
            -n actions-runner-system
      
      - name: Wait for runners
        run: |
          kubectl rollout status deployment/actions-runner \
            -n actions-runner-system
      
      - name: Notify
        run: |
          gh issue create --title "Auto-scaled runners to ${{ inputs.target_replicas }}" \
            --label "automation:scaling"
```

#### b. Recover Runner (`recover-runner.yml`)
```yaml
name: Recover Runner Health

on:
  workflow_dispatch:
    inputs:
      runner_id:
        type: string

jobs:
  drain-jobs:
    runs-on: ubuntu-latest
    steps:
      - name: Drain in-flight jobs
        run: |
          # Wait for running jobs to complete
          # Signal runner to stop accepting new jobs
          
      - name: Restart runner
        run: |
          # SSH/API call to restart runner
          # Verify it comes back online
          # Re-enable job acceptance
```

#### c. Cost Controls (`cost-controls.yml`)
```yaml
name: Apply Cost Controls

jobs:
  reduce-parallelism:
    runs-on: ubuntu-latest
    steps:
      - name: Update workflow configs
        run: |
          # Reduce max-parallel from 10 to 5
          # Update matrix job count
          # Check in changes
      
      - name: Cancel low-priority jobs
        run: |
          # Find queued jobs with "low-priority" label
          # Cancel them to free capacity
```

#### d. Cleanup Disk (`cleanup-disk.yml`)
```yaml
name: Cleanup Disk Space

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Run cleanup script
        run: |
          # Remove old artifacts
          # Clear package caches
          # Compress old logs
          
      - name: Verify space
        run: |
          # Check disk usage < 80%
          # If not, escalate alert
```

### 5. Monitoring & Audit

**Event Log** (`audit-log/events/events.jsonl`):
```json
{
  "timestamp": "2026-05-04T10:30:00Z",
  "event_type": "queue_depth",
  "severity": "warning",
  "metric_value": 25,
  "threshold": 20,
  "response_action": "scale_runners",
  "response_status": "success",
  "affected_component": "kubernetes",
  "outcome": "scaled 1 → 5 pods"
}
```

**Dashboard Updates**:
- Show triggered events in real-time
- Track event frequency by type
- Show response success rate
- Display total manual interventions avoided

## Implementation Timeline

### Week 1
- Day 1-2: Implement `event-detector.py`
- Day 3-4: Create event rules configuration
- Day 5: Implement event responder routing

### Week 2
- Day 1-2: Implement scale-runners automation
- Day 3: Implement runner recovery automation
- Day 4: Implement cost controls
- Day 5: Testing & validation

## Success Criteria

### Functionality
- [ ] All 6 event types detected accurately
- [ ] Automated responses execute without error
- [ ] Event chain testing passes (event A triggers action B)
- [ ] Audit trail captures all events

### Performance
- [ ] Event detection runs every 5 minutes
- [ ] Response execution starts within 1 minute of event
- [ ] No false positives (< 5% alert fatigue rate)

### Reliability
- [ ] 99%+ success rate on automated responses
- [ ] Rollback capability for failed responses
- [ ] Manual override available for all automations
- [ ] Comprehensive error logging for failures

### Cost Impact
- [ ] Reduce manual intervention by 50%
- [ ] Maintain or reduce overall infrastructure cost
- [ ] Track cost of events (e.g., cost spike detection prevents 10x overage)

## Risk Mitigation

### Runaway Scaling
- **Risk**: Event loop triggers excessive scaling
- **Mitigation**: 
  - Max replicas capped at 10
  - Cooldown period between scale actions (10 min)
  - Scale-down happens gradually (1 pod per 30 min)

### Failed Automations
- **Risk**: Automated response fails, makes situation worse
- **Mitigation**:
  - Manual override available
  - Rollback procedure for each action
  - Alert on automation failure
  - Dry-run mode for testing

### Alert Fatigue
- **Risk**: Too many events triggered, reduces effectiveness
- **Mitigation**:
  - Conservative thresholds (e.g., 20 for queue, 95% uptime)
  - Deduplication (aggregate similar events)
  - Aggregation window (15 min for queue depth)
  - Only escalate critical events

## Compliance & Audit

- All events logged to JSONL audit trail
- Immutable event log for compliance
- Event metadata includes: timestamp, actor, action, outcome
- Ability to replay events for incident analysis
- Audit trail retention: 1 year minimum

## Future Extensions

### Phase 5E Integration
- Combine event-driven scaling with container optimization
- Auto-optimize Dockerfiles on cost spike detection
- Trigger profiling on performance regression event

### Machine Learning
- Predict queue depth based on time-of-day patterns
- Anticipatory scaling (scale before peak)
- Anomaly detection for unusual events

### Advanced Orchestration
- Complex event patterns (sequence, correlation)
- Event suppression during maintenance windows
- Priority-based event handling (critical vs. warning)

---

## Component Specifications

### Event Detector
**File**: `scripts/event-detector.py`  
**Lines**: 400-500  
**Language**: Python 3  
**Dependencies**: metrics loader, rule engine, event class  
**Output**: JSON event list

### Event Responder Workflow
**Status**: Prototype workflow retired during GAP-002 cleanup  
**Structure**: dispatch-based with routing to sub-workflows  
**Sub-workflows**: scale-runners, recover-runner, cost-controls, cleanup-disk

### Automation Workflows (4)
**Files**: 
- `.github/workflows/scale-runners.yml` (100 lines)
- `.github/workflows/recover-runner.yml` (150 lines)
- `.github/workflows/cost-controls.yml` (120 lines)
- `.github/workflows/cleanup-disk.yml` (100 lines)

### Configuration
**File**: `config/event-rules.json` (200 lines)

---

**Next Phase:** Phase 5E - Container Workload Optimization
