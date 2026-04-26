#!/bin/bash
# Phase 6 Week 2: Load Testing & Performance Validation
# Executes complete load testing workflow and generates reports
#
# Usage: ./run_week2_load_test.sh [mode] [patient_count]
#   mode: baseline (500 pts), stress (2000 pts), full (both)
#   patient_count: override patient count
#
# Compliance: IEC 62304 V&V, FDA 510(k) performance validation
# Version: 1.0 (April 25, 2026)

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE=${1:-baseline}
OVERRIDE_PATIENT_COUNT=${2:-}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="$SCRIPT_DIR/results_${TIMESTAMP}"

# Database
export DB_HOST=${DB_HOST:-localhost}
export DB_PORT=${DB_PORT:-5432}
export DB_NAME=${DB_NAME:-audit_trail}
export DB_USER=${DB_USER:-audit_trail_user}
export DB_PASSWORD=${DB_PASSWORD:-}

# API
export PLATFORM_API_URL=${PLATFORM_API_URL:-http://localhost:8080}
export PLATFORM_API_KEY=${PLATFORM_API_KEY:-}

# Logging
LOG_FILE="$OUTPUT_DIR/load_test_${TIMESTAMP}.log"

# ============================================================================
# FUNCTIONS
# ============================================================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_section() {
    echo "" | tee -a "$LOG_FILE"
    echo "════════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
    echo "  $1" | tee -a "$LOG_FILE"
    echo "════════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
}

log_success() {
    echo "✅ $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "❌ ERROR: $1" >&2 | tee -a "$LOG_FILE"
}

check_prerequisites() {
    log_section "CHECKING PREREQUISITES"

    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 not found"
        exit 1
    fi
    log "Python: $(python3 --version)"

    # Check PostgreSQL client
    if ! command -v psql &> /dev/null; then
        log_error "psql not found"
        exit 1
    fi

    # Check database connectivity
    log "Testing database connectivity..."
    python3 << EOF
import psycopg2
try:
    conn = psycopg2.connect(
        host="${DB_HOST}",
        port=${DB_PORT},
        database="${DB_NAME}",
        user="${DB_USER}",
        password="${DB_PASSWORD}",
        connect_timeout=5
    )
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM audit_trail LIMIT 1")
    count = cursor.fetchone()[0]
    conn.close()
    print(f"✅ Database connected ({count} audit entries)")
except Exception as e:
    print(f"❌ Database error: {e}")
    exit(1)
EOF

    # Check API connectivity
    log "Testing API connectivity..."
    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PLATFORM_API_URL/health" || echo "000")
        if [ "$HTTP_CODE" -eq 200 ]; then
            log_success "API is running ($PLATFORM_API_URL)"
        else
            log "⚠️  API returned HTTP $HTTP_CODE (may not be critical)"
        fi
    fi

    log_success "Prerequisites check complete"
}

prepare_synthetic_data() {
    log_section "PREPARING SYNTHETIC DATA"

    SYNTHEA_DIR="$SCRIPT_DIR/../synthea"

    if [ -z "$OVERRIDE_PATIENT_COUNT" ]; then
        if [ "$MODE" = "baseline" ]; then
            PATIENT_COUNT=500
        elif [ "$MODE" = "stress" ]; then
            PATIENT_COUNT=2000
        else
            PATIENT_COUNT=500  # Start with baseline for full mode
        fi
    else
        PATIENT_COUNT=$OVERRIDE_PATIENT_COUNT
    fi

    log "Generating $PATIENT_COUNT synthetic patients..."

    SYNTHETIC_FILE="$OUTPUT_DIR/synthetic_patients_${PATIENT_COUNT}.json"
    python3 "$SYNTHEA_DIR/generate_patients.py" "$PATIENT_COUNT" "$SYNTHETIC_FILE"

    # Also generate adverse events
    log "Generating adverse event scenarios..."
    ADVERSE_FILE="$OUTPUT_DIR/adverse_event_scenarios.json"
    python3 "$SYNTHEA_DIR/adverse_event_scenarios.py" "$ADVERSE_FILE"

    log_success "Synthetic data ready"
    echo "$SYNTHETIC_FILE"
}

run_baseline_load_test() {
    local synthetic_file=$1

    log_section "BASELINE LOAD TEST (500 Patients)"
    log "Loading 500 patients × 336,000 observations..."

    python3 "$SCRIPT_DIR/run_load_test.py" "$synthetic_file" "$OUTPUT_DIR" 2>&1 | tee -a "$LOG_FILE"

    log_success "Baseline load test complete"
}

run_stress_load_test() {
    local synthetic_file=$1

    log_section "STRESS LOAD TEST (2,000 Patients)"
    log "Loading 2,000 patients × 1,344,000 observations..."

    # Adjust batch size for stress test
    export BATCH_SIZE=50

    python3 "$SCRIPT_DIR/run_load_test.py" "$synthetic_file" "$OUTPUT_DIR" 2>&1 | tee -a "$LOG_FILE"

    log_success "Stress load test complete"
}

measure_alert_latencies() {
    log_section "MEASURING ALERT LATENCIES"

    log "Measuring P1/P2/P3 alert response times..."

    python3 "$SCRIPT_DIR/measure_alert_latency.py" "$PLATFORM_API_URL" "$PLATFORM_API_KEY" 2>&1 | tee -a "$LOG_FILE"

    # Move report to output dir
    if [ -f "alert_latency_report.md" ]; then
        mv alert_latency_report.md "$OUTPUT_DIR/alert_latency_report_${TIMESTAMP}.md"
    fi

    log_success "Alert latency measurement complete"
}

generate_summary_report() {
    log_section "GENERATING SUMMARY REPORT"

    SUMMARY_FILE="$OUTPUT_DIR/WEEK2_LOAD_TEST_SUMMARY.md"

    cat > "$SUMMARY_FILE" << EOF
# Phase 6 Week 2: Load Testing Results

**Test Date:** $(date)
**Mode:** $MODE
**Output Directory:** $OUTPUT_DIR

## Test Summary

### Configuration
- Database: PostgreSQL ($DB_HOST:$DB_PORT/$DB_NAME)
- API: $PLATFORM_API_URL
- EKS Cluster: platform-cluster
- Node Count: 3 (t3.2xlarge each)

### Results

#### Baseline Test (500 patients)
\`\`\`
Status: $(if grep -q "All SLAs met" "$OUTPUT_DIR"/*.json 2>/dev/null; then echo "✅ PASS"; else echo "⚠️  REVIEW"; fi)
Patient Count: 500
Observations: 336,000
Total Events: 336,500
Expected Duration: ~34 seconds

Database Performance:
  - Insert Rate: [See JSON report]
  - Latency p95: [See JSON report]
  - Status: [PASS/FAIL]

API Performance:
  - Throughput: [See JSON report]
  - Latency p95: [See JSON report]
  - Status: [PASS/FAIL]

Alert Performance:
  - Critical Alerts: [See latency report]
  - High Alerts: [See latency report]
  - Medium Alerts: [See latency report]
\`\`\`

EOF

    if [ "$MODE" = "stress" ] || [ "$MODE" = "full" ]; then
        cat >> "$SUMMARY_FILE" << EOF

#### Stress Test (2,000 patients)
\`\`\`
Status: $(if grep -q "All SLAs met" "$OUTPUT_DIR"/*2000*.json 2>/dev/null; then echo "✅ PASS"; else echo "⚠️  REVIEW"; fi)
Patient Count: 2,000
Observations: 1,344,000
Total Events: 1,344,000
Expected Duration: ~4-5 minutes

Database Performance:
  - Insert Rate: [See JSON report]
  - Latency p95: [See JSON report]
  - Status: [PASS/FAIL]

API Performance:
  - Throughput: [See JSON report]
  - Latency p95: [See JSON report]
  - Status: [PASS/FAIL]

EKS Scaling:
  - Initial Nodes: 3
  - Final Nodes: [Check kubectl get nodes]
  - Auto-scaling Triggered: [YES/NO]
\`\`\`

EOF
    fi

    cat >> "$SUMMARY_FILE" << EOF

## Files Generated

\`\`\`
$OUTPUT_DIR/
├── performance_report_*.json          # Detailed metrics
├── performance_report_*.html          # Visual dashboard
├── alert_latency_report_*.md          # Alert SLA analysis
├── performance_baseline.json          # Baseline for regression testing
└── load_test_*.log                    # Execution log
\`\`\`

## Next Steps: Week 3-4 (Stress Testing)

- [ ] Review performance reports
- [ ] Address any SLA violations
- [ ] Run stress test (2,000 patients)
- [ ] Validate EKS auto-scaling
- [ ] Update performance documentation

## References

- Load Testing Guide: README.md
- Synthea Framework: ../synthea/README.md
- Performance SLAs: README.md#performance-slas

---
**Generated:** $(date)
EOF

    log_success "Summary report: $SUMMARY_FILE"
}

cleanup_and_summary() {
    log_section "LOAD TEST COMPLETE"

    log_success "Results saved to: $OUTPUT_DIR"
    log "Files generated:"
    ls -lh "$OUTPUT_DIR"/ | tail -n +2 | awk '{print "  " $NF " (" $5 ")"}'

    echo ""
    log "Next steps:"
    log "  1. Review: less $OUTPUT_DIR/WEEK2_LOAD_TEST_SUMMARY.md"
    log "  2. View HTML report: open $OUTPUT_DIR/performance_report_*.html"
    log "  3. Check alerts: cat $OUTPUT_DIR/alert_latency_report*.md"
    log "  4. Compare baseline: cat performance_baseline.json"

    echo ""
    log_success "✅ WEEK 2 LOAD TESTING COMPLETE"
}

# ============================================================================
# MAIN WORKFLOW
# ============================================================================

main() {
    mkdir -p "$OUTPUT_DIR"

    log_section "PHASE 6 WEEK 2: LOAD TESTING & PERFORMANCE VALIDATION"
    log "Mode: $MODE | Timestamp: $TIMESTAMP"

    # Execution
    check_prerequisites
    SYNTHETIC_FILE=$(prepare_synthetic_data)

    case "$MODE" in
        baseline)
            run_baseline_load_test "$SYNTHETIC_FILE"
            measure_alert_latencies
            ;;

        stress)
            PATIENT_COUNT=2000
            SYNTHETIC_FILE=$(prepare_synthetic_data)
            run_stress_load_test "$SYNTHETIC_FILE"
            measure_alert_latencies
            ;;

        full)
            run_baseline_load_test "$SYNTHETIC_FILE"
            PATIENT_COUNT=2000
            SYNTHETIC_FILE=$(prepare_synthetic_data)
            run_stress_load_test "$SYNTHETIC_FILE"
            measure_alert_latencies
            ;;

        *)
            log_error "Unknown mode: $MODE"
            echo "Valid modes: baseline, stress, full"
            exit 1
            ;;
    esac

    generate_summary_report
    cleanup_and_summary
}

# Run
main
