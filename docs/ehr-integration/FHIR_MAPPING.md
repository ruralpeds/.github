# FHIR US Core 6.1 Mapping Specification

## Scope

This specification defines bidirectional mappings between local clinical data structures and FHIR US Core 6.1 resources.

Goals:

1. Standardize exchange with external EHR systems.
2. Ensure deterministic transforms with explicit unit and cardinality rules.
3. Enforce security, audit, and retry behavior for production integrations.

In scope resource types:

1. `Patient`
2. `Observation` (vitals and growth)
3. `DocumentReference`
4. `DiagnosticReport`
5. `Encounter`

## Architecture

Data flow:

1. Inbound: EHR -> FHIR API gateway -> mapping engine -> local model store.
2. Outbound: local model store -> mapping engine -> FHIR API client -> EHR.

Transport and auth:

1. TLS 1.3 required for all external calls.
2. SMART on FHIR OAuth 2.0 bearer tokens.
3. Token scopes constrained to least privilege per transaction type.

Traceability and audit:

1. Every transaction must include a correlation id.
2. Every transaction must emit an audit event with outcome status.
3. Retries must preserve idempotency key and correlation id.

## Canonical Local Model

The mapping engine expects these canonical local entities:

1. `local_patient`
2. `local_observation`
3. `local_document`
4. `local_report`
5. `local_encounter`

Every canonical entity must include:

1. `source_system`
2. `source_identifier`
3. `last_updated_utc`
4. `correlation_id`

## Mapping Rules

### 1) Patient

FHIR profile: US Core Patient

Required inbound fields:

1. `Patient.identifier` (at least one trusted identifier)
2. `Patient.name[0].family`
3. `Patient.name[0].given[0]`
4. `Patient.gender`
5. `Patient.birthDate`

Field mapping:

| Local field | FHIR element | Direction | Rule |
|---|---|---|---|
| `local_patient.external_id` | `Patient.identifier.value` | bi-dir | Required, unique per source system |
| `local_patient.mrn_hash` | `Patient.identifier` with system `urn:ruralpeds:mrn-hash` | outbound | Never send raw MRN |
| `local_patient.family_name` | `Patient.name[0].family` | bi-dir | Trim whitespace, title case |
| `local_patient.given_name` | `Patient.name[0].given[0]` | bi-dir | Preserve punctuation |
| `local_patient.dob` | `Patient.birthDate` | bi-dir | ISO date only |
| `local_patient.sex_at_birth` | `Patient.gender` | bi-dir | Map local enum strictly |

Validation rules:

1. Reject if `birthDate` is in the future.
2. Reject if no identifier from allowed systems is present.
3. Reject if `gender` is outside allowed FHIR value set.

### 2) Observation (Growth and Vital Signs)

FHIR profile: US Core Vital Signs

Supported LOINC codes:

1. Weight: `29463-7`
2. Height/Length: `8302-2`
3. Head circumference: `8287-5`

Field mapping:

| Local field | FHIR element | Direction | Rule |
|---|---|---|---|
| `local_observation.patient_external_id` | `Observation.subject.reference` | bi-dir | Resolve to `Patient/{id}` |
| `local_observation.code` | `Observation.code.coding[0].code` | bi-dir | Must be in supported code list |
| `local_observation.value_numeric` | `Observation.valueQuantity.value` | bi-dir | Decimal precision max 3 places |
| `local_observation.unit` | `Observation.valueQuantity.unit` | bi-dir | Normalize to UCUM |
| `local_observation.effective_utc` | `Observation.effectiveDateTime` | bi-dir | RFC3339 UTC |

Unit conversion:

1. Weight accepted inbound: `kg`, `g`. Stored canonical: `kg`.
2. Length accepted inbound: `cm`, `m`. Stored canonical: `cm`.
3. Reject ambiguous or non-UCUM units.

Safety checks:

1. Reject negative values.
2. Reject out-of-range pediatric values using service limits.
3. Flag tenfold anomalies for manual review.

### 3) DocumentReference

FHIR profile: US Core DocumentReference

Field mapping:

| Local field | FHIR element | Direction | Rule |
|---|---|---|---|
| `local_document.patient_external_id` | `DocumentReference.subject.reference` | bi-dir | Must resolve patient |
| `local_document.note_type` | `DocumentReference.type.coding[0]` | bi-dir | Controlled local code set |
| `local_document.content_mime_type` | `DocumentReference.content[0].attachment.contentType` | bi-dir | Required |
| `local_document.content_uri` | `DocumentReference.content[0].attachment.url` | outbound | Signed short-lived URL only |
| `local_document.created_utc` | `DocumentReference.date` | bi-dir | RFC3339 UTC |

Privacy rules:

1. Do not include PHI in metadata fields beyond required clinical context.
2. Content URLs must expire and require authenticated access.

### 4) DiagnosticReport

FHIR profile: US Core DiagnosticReport

Field mapping:

| Local field | FHIR element | Direction | Rule |
|---|---|---|---|
| `local_report.patient_external_id` | `DiagnosticReport.subject.reference` | bi-dir | Required |
| `local_report.report_code` | `DiagnosticReport.code.coding[0].code` | bi-dir | Controlled mapping table |
| `local_report.status` | `DiagnosticReport.status` | bi-dir | Strict enum map |
| `local_report.issued_utc` | `DiagnosticReport.issued` | bi-dir | RFC3339 UTC |
| `local_report.summary_text` | `DiagnosticReport.conclusion` | bi-dir | Max length 4000 |

Linking rules:

1. `DiagnosticReport.result[]` should reference source Observation ids when available.
2. Report without source observations is permitted only with explicit reason code.

### 5) Encounter

FHIR profile: US Core Encounter

Field mapping:

| Local field | FHIR element | Direction | Rule |
|---|---|---|---|
| `local_encounter.external_id` | `Encounter.identifier.value` | bi-dir | Required |
| `local_encounter.patient_external_id` | `Encounter.subject.reference` | bi-dir | Required |
| `local_encounter.start_utc` | `Encounter.period.start` | bi-dir | RFC3339 UTC |
| `local_encounter.end_utc` | `Encounter.period.end` | bi-dir | Optional, must be >= start |
| `local_encounter.class_code` | `Encounter.class.code` | bi-dir | Must map to HL7 class set |

Temporal rules:

1. Encounter start required for all records.
2. End time optional for active encounters.

## Transaction Patterns

### Inbound create/update

1. Validate SMART token scope.
2. Validate resource against profile and local constraints.
3. Transform into canonical entity.
4. Upsert by source identifier + source system.
5. Emit audit event with status `success` or `failure`.

### Outbound publish

1. Load canonical entity and related references.
2. Transform to FHIR resource with profile constraints.
3. Attach idempotency key and correlation id headers.
4. Submit with retry policy.
5. Emit audit event with response code and resource id.

## Error Handling and Retry

Retry policy:

1. Retry on `408`, `429`, `500`, `502`, `503`, `504`.
2. Backoff: exponential with jitter.
3. Max attempts: 4.
4. Circuit breaker opens after 5 consecutive failures per endpoint.

Do not retry:

1. `400` profile/validation errors.
2. `401` or `403` authz failures.
3. Semantic conflicts requiring user resolution.

Dead-letter behavior:

1. Failed payloads after max retries go to integration dead-letter queue.
2. Dead-letter entries must include failure reason and correlation id.

## Audit Event Contract

Minimum fields for each transaction event:

1. `timestamp`
2. `event`
3. `service`
4. `correlation_id`
5. `actor_id`
6. `resource_type`
7. `resource_id`
8. `direction` (`inbound` or `outbound`)
9. `status`
10. `error_code` (if applicable)

Event names:

1. `ehr.fhir.transaction.received`
2. `ehr.fhir.transaction.validated`
3. `ehr.fhir.transaction.transformed`
4. `ehr.fhir.transaction.sent`
5. `ehr.fhir.transaction.failed`

## SMART on FHIR Security Requirements

1. OAuth 2.0 Authorization Code flow for user-mediated operations.
2. Client Credentials flow only for trusted backend service exchange.
3. Required scopes by default: `patient/Patient.read`, `patient/Observation.read`, `patient/Observation.write`, `patient/Encounter.read`, `patient/DiagnosticReport.write`.
4. Token introspection or JWT validation must verify issuer, audience, expiry, and signature.
5. Deny by default if required scope is missing.

## Integration Validation Cases

1. Create patient from inbound `Patient` payload.
2. Update patient demographics with valid identifier.
3. Reject patient without trusted identifier.
4. Inbound Observation with valid UCUM conversion.
5. Reject Observation with non-UCUM unit.
6. Outbound DiagnosticReport with linked Observation references.
7. Encounter with missing period start fails validation.
8. Retry on simulated transient `503` then succeed.
9. No retry on simulated `400` profile error.
10. Audit event emitted for success and failure paths.

## Example Correlation and Idempotency Headers

```http
X-Correlation-Id: 43d35dbf-c0d2-4e39-9d4e-4d53af7f3d17
Idempotency-Key: 2d757c95-09f8-41de-b1a0-7b9d0d96d8ea
```

## Change Management

1. Any mapping table update requires version bump in this file.
2. Add regression tests for every changed mapping rule.
3. Backward-incompatible mapping changes require migration note.

## Version

- Version: `1.0.0-draft`
- Last updated: `2026-05-01`
- Initiative: `Q3-2026 Initiative 02`
