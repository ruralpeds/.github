# EHR Sandbox Validation Plan

This plan defines execution and evidence capture for validating the FHIR mapping specification against EHR sandbox environments.

## Target Sandboxes

1. Epic SMART on FHIR sandbox.
2. Cerner SMART on FHIR sandbox.

## Preconditions

1. OAuth client registration complete.
2. Test patient datasets are synthetic only.
3. TLS 1.3 verified for all endpoints.
4. Audit logging enabled for EHR integration service.

## Execution Matrix

| Test ID | Scenario | Epic | Cerner | Expected |
|---|---|---|---|---|
| EHR-01 | Patient create inbound | planned | planned | Local record created with correlation id |
| EHR-02 | Patient read outbound | planned | planned | Valid US Core Patient response |
| EHR-03 | Observation write outbound | planned | planned | Observation accepted, 2xx response |
| EHR-04 | Observation read inbound | planned | planned | Units normalized to canonical form |
| EHR-05 | Encounter synchronization | planned | planned | Encounter period and class map correctly |
| EHR-06 | DiagnosticReport publish | planned | planned | Report linked to source observations |
| EHR-07 | Retry behavior on 503 | planned | planned | Retries occur with capped backoff |
| EHR-08 | No retry on 400 | planned | planned | Single fail and dead-letter entry |
| EHR-09 | Scope enforcement | planned | planned | Unauthorized call denied |
| EHR-10 | Audit trail completeness | planned | planned | All transaction events logged |

## Evidence to Collect

1. Request and response summaries with redacted payload snapshots.
2. Correlation ids and idempotency keys for each test.
3. Audit event extracts for each transaction.
4. Error and retry logs for negative tests.

## Exit Criteria

1. All 10 tests pass in at least one sandbox and no critical failures remain.
2. Security checks pass for token validation and scope enforcement.
3. Audit completeness is 100% for executed tests.
4. Open issues are triaged with owners and due dates.

## Reporting

1. Publish test evidence summary in compliance metrics report.
2. Link defects to remediation backlog.
3. Mark initiative gate as ready for implementation hardening.
