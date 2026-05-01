# Trace Sampling Policy (Q3-2026)

This document defines production trace sampling policy for distributed tracing with OpenTelemetry and Grafana Tempo.

## Objectives

- Capture every failure path for incident triage.
- Preserve statistically meaningful success-path traces at low cost.
- Increase visibility on tail latency without overwhelming storage.

## Sampling Rules

1. Errors: 100% sampling.
2. High latency: 10% sampling when request latency exceeds service threshold.
3. Success path: 1% baseline sampling.

## Thresholds

- Default high-latency threshold: `P99 > 1000ms`.
- Services may override threshold with explicit justification in service docs.
- Clinical calculation services should not exceed `P99 > 500ms` without a tracked exception.

## Recommended OpenTelemetry Collector Tail-Sampling Policy

```yaml
processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 200000
    expected_new_traces_per_sec: 2000
    policies:
      - name: errors-100
        type: status_code
        status_code:
          status_codes: [ERROR]

      - name: latency-10
        type: and
        and:
          and_sub_policy:
            - name: latency-threshold
              type: latency
              latency:
                threshold_ms: 1000
            - name: probabilistic-high-latency
              type: probabilistic
              probabilistic:
                sampling_percentage: 10

      - name: baseline-success-1
        type: probabilistic
        probabilistic:
          sampling_percentage: 1
```

## Validation Checks

Run these checks after deployment:

1. Generate synthetic error traffic and confirm all error traces appear in Tempo.
2. Generate synthetic latency spikes and confirm partial sampling near 10%.
3. Generate healthy traffic and confirm baseline traces near 1%.
4. Confirm no PHI fields are present in span attributes.

## Operational Notes

- Do not include patient identifiers (MRN, names, addresses) in span attributes.
- Keep `trace_id` and `span_id` in logs for correlation.
- Use the distributed tracing dashboard in `infrastructure/grafana/04-distributed-tracing-dashboard.json` for incident response.

## Rollback

If storage or ingestion pressure becomes unstable:

1. Temporarily reduce success path from 1% to 0.5%.
2. Keep error sampling at 100%.
3. Keep high-latency sampling at 10% unless approved by platform lead.
4. Record changes in compliance metrics report for the quarter.
