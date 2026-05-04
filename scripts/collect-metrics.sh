#!/bin/bash
# collect-metrics.sh
#
# Capture job metrics during GitHub Actions workflow execution.
# Called by workflows to collect performance and health metrics.
# Outputs metrics to STDOUT as JSON for processing by metrics-aggregator.
#
# Usage (in workflow):
#   - name: Collect job metrics
#     run: bash scripts/collect-metrics.sh >> audit-log/observability/daily/metrics-raw.jsonl
#
# Metrics collected:
#   - Job duration (start to end)
#   - Job status (success/failure)
#   - CPU usage (user, system, context switches)
#   - Memory usage (RSS, peak)
#   - Disk I/O (read/write bytes)
#   - Runner health (uptime, load average)

set -e

JOB_NAME="${1:-unknown}"
JOB_ID="${GITHUB_JOB:-unknown}"
RUN_ID="${GITHUB_RUN_ID:-unknown}"
RUN_NUMBER="${GITHUB_RUN_NUMBER:-unknown}"
WORKFLOW_NAME="${GITHUB_WORKFLOW:-unknown}"
REF="${GITHUB_REF:-unknown}"
SHA="${GITHUB_SHA:-unknown}"

# Capture metrics
collect_system_metrics() {
    if [[ -f /proc/self/stat ]]; then
        # Linux: parse /proc/self/stat for CPU metrics
        read -r -a fields < /proc/self/stat
        utime=${fields[11]}
        stime=${fields[12]}
        starttime=${fields[19]}

        # Get current time in jiffies
        now=$(date +%s%N | cut -b1-10)
        elapsed=$((now - starttime / 100))

        echo "\"cpu_user_time\": $utime, \"cpu_system_time\": $stime, \"elapsed_seconds\": $elapsed"
    fi
}

collect_memory_metrics() {
    if [[ -f /proc/self/status ]]; then
        # Linux: parse /proc/self/status for memory metrics
        rss=$(grep "VmRSS" /proc/self/status | awk '{print $2}')
        peak=$(grep "VmPeak" /proc/self/status | awk '{print $2}')

        echo "\"memory_rss_kb\": $rss, \"memory_peak_kb\": $peak"
    fi
}

collect_disk_metrics() {
    if [[ -f /proc/self/io ]]; then
        # Linux: parse /proc/self/io for disk I/O
        read_bytes=$(grep "read_bytes" /proc/self/io | awk '{print $2}')
        write_bytes=$(grep "write_bytes" /proc/self/io | awk '{print $2}')

        echo "\"disk_read_bytes\": $read_bytes, \"disk_write_bytes\": $write_bytes"
    fi
}

collect_system_health() {
    # System load and uptime
    load=$(uptime | awk -F'load average:' '{print $2}')
    uptime=$(uptime -p 2>/dev/null || echo "unknown")

    # Disk usage on working directory
    disk_percent=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')

    echo "\"system_load\": \"$load\", \"system_uptime\": \"$uptime\", \"disk_usage_percent\": $disk_percent"
}

# Runner information
runner_name="${RUNNER_NAME:-unknown}"
runner_os="${RUNNER_OS:-unknown}"
runner_arch="${RUNNER_ARCH:-unknown}"

# Determine job status from environment
job_status="unknown"
if [[ "$runner_os" == "Linux" || "$runner_os" == "macOS" ]]; then
    # This will be set by the workflow after the job completes
    job_status="${JOB_STATUS:-running}"
fi

# Timestamps
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
start_timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build JSON metric object
cat <<EOF
{
  "timestamp": "$timestamp",
  "start_timestamp": "$start_timestamp",
  "job_name": "$JOB_NAME",
  "job_id": "$JOB_ID",
  "run_id": "$RUN_ID",
  "run_number": "$RUN_NUMBER",
  "workflow_name": "$WORKFLOW_NAME",
  "ref": "$REF",
  "sha": "$SHA",
  "job_status": "$job_status",
  "runner_name": "$runner_name",
  "runner_os": "$runner_os",
  "runner_arch": "$runner_arch",
  $(collect_system_metrics),
  $(collect_memory_metrics),
  $(collect_disk_metrics),
  $(collect_system_health)
}
EOF
