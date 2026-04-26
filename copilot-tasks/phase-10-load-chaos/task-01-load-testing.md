# Phase 10, Task 1: Load Testing — Baselines & Regression Gates

**Objective:** Create load tests and establish performance baselines for every service.

**Duration:** 7 hours (Week 19)

## Acceptance Criteria

- [ ] k6 load test script for each service (FHIR, CDS, Audit)
- [ ] Baseline metrics committed: perf/baseline_*.json
- [ ] Baseline includes: P50, P95, P99, error rate, max throughput
- [ ] Regression test: PR fails if P95 > baseline × 1.1
- [ ] Load test configuration: ramp-up, sustain, cool-down stages
- [ ] Thresholds: P95 < 500ms, error rate < 1% (FHIR)
- [ ] CI integration: load test runs on-demand (not per-PR, too slow)
- [ ] Documentation: load test procedures

## Implementation

k6 script template:
```javascript
stages: [
  { duration: '2m', target: 10 },     // Ramp up
  { duration: '5m', target: 100 },    // Sustain
  { duration: '2m', target: 0 },      // Ramp down
]

thresholds: {
  'latency_ms': ['p(95)<500', 'p(99)<1000'],
  'errors': ['rate<0.01'],
}
```

Baseline extraction:
```bash
jq '.metrics[] | select(.type=="Trend") | {p50,p95,p99}' load_results.json
```

Regression detection:
```bash
if (( $(echo "$CURRENT_P95 > $BASELINE_P95 * 1.1" | bc -l) )); then
    exit 1  # P95 regressed > 10%
fi
```

## Output

- Load test scripts (tests/load_test_fhir.js, load_test_cds.js, etc.)
- Baseline metrics (perf/baseline_*.json)
- Regression test script (scripts/check_load_regression.sh)
- CI job: run load tests weekly

