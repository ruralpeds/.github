# Copilot / Coding Agent Instructions

These instructions apply to all AI coding agents (GitHub Copilot, Codex, or
similar) operating in repositories under `timothyhartzog`. They encode
healthcare safety rules derived from
[`HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md`](HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md).

---

## Non-negotiable safety rules

### 1. No PHI in logs, traces, or artifacts

**Never** emit real or sample patient-linked data in:

- log statements (structured or unstructured),
- trace spans or span attributes,
- error messages returned to clients,
- test fixtures committed to source control,
- CI artifacts or reports.

Use synthetic data (generated, non-real identifiers) for all test fixtures.
Use redaction helpers / log scrubbers for any field that may carry PHI at runtime.

```rust
// ✗ Never do this
log::info!("Patient {} accessed record {}", patient_id, record_id);

// ✓ Use opaque correlation IDs only in logs
log::info!(correlation_id = %correlation_id, action = "record.accessed");
```

```julia
# ✗ Never do this
@info "Patient $(patient_id) viewed record $(record_id)"

# ✓ Correlation ID only
@info "record.accessed" correlation_id=correlation_id
```

---

### 2. Require audit events for privileged actions

Every privileged or patient-impacting action **must** emit an audit event before
returning. The event must be recorded even when the action fails.

Privileged actions include (but are not limited to):

- login / logout
- failed login attempts
- role or permission changes
- patient record access, update, export, deletion
- break-glass / emergency access
- admin configuration changes
- deployment approvals
- API token creation, rotation, revocation
- data merge or correction

Use the catalog in `docs/audit-events.md` as the canonical list of event names.
Do **not** invent new event names without updating the catalog.

```rust
// ✓ Required pattern for privileged actions
audit::emit(AuditEvent {
    event: "patient.record.viewed",
    actor_id: &actor.id,
    correlation_id: &ctx.correlation_id,
    outcome: Outcome::Success,
    ..Default::default()
});
```

```julia
# ✓ Required pattern
Audit.emit(;
    event = "patient.record.viewed",
    actor_id = actor.id,
    correlation_id = ctx.correlation_id,
    outcome = :success,
)
```

---

### 3. Require correlation IDs on every request path

Every inbound request **must** be assigned a correlation ID. The ID must be:

- generated at the entry point if not present in the request,
- propagated through all downstream calls (HTTP headers, message queue headers),
- included in every log line and audit event for that request,
- included in error responses (safe to expose; no PHI).

---

### 4. Tests are required — no exceptions

Every feature, fix, or privilege escalation path must include tests covering:

- happy path,
- failure / error path,
- authorization boundary (at least one test that proves unauthorized access is denied).

The CI gate will fail if tests are missing. Do not bypass CI.

---

### 5. Deny by default for privileged operations

Authorization checks must use deny-by-default logic:

```rust
// ✓ Correct — explicit allow list
if !rbac.has_permission(&actor, Permission::ViewPatientRecord) {
    return Err(AuthzError::Forbidden);
}
```

Never write "allow unless explicitly denied" logic for healthcare data.

---

### 6. No secrets in source code

- Never hard-code API keys, passwords, tokens, or credentials.
- Use `.env.example` to document required environment variables (no values).
- Rotate any secret that was accidentally committed immediately.

---

### 7. Structured errors with correlation IDs

Error responses must:

- include a stable machine-readable error code,
- include the correlation ID,
- **not** include stack traces, internal paths, or PHI in client-facing messages.

---

## Architecture boundaries

| Directory / Module | Owner | Notes |
|---|---|---|
| `src/auth/` | Auth team | RBAC, token validation, break-glass |
| `src/audit/` | Platform | Audit event emission — do not bypass |
| `src/domain/` | Domain teams | Core business logic, no I/O |
| `src/api/` | API team | Entry point; validates input, emits correlation IDs |
| `src/integrations/` | Integration team | FHIR adapters, EHR connectors |
| `docs/` | All | Required files; changes require PR review |
| `.github/workflows/` | Platform | Do not modify CI gates without review |

---

## Prohibited shortcuts

- Do not `#[allow(dead_code)]` or `@suppress` on audit or auth modules.
- Do not skip tests with `#[ignore]` or `@test_skip` unless approved in the PR.
- Do not commit `.env` files with real values.
- Do not merge PRs with failing CI gates.
- Do not add `//nolint` or `#[allow(clippy::...)]` suppressions in auth or audit code.

---

## How to run checks locally

```bash
# Rust
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test

# Julia
julia -e 'using JuliaFormatter; format(".", verbose=true, overwrite=false)'
julia --project=. -e 'using Pkg; Pkg.test()'

# Repo standards
bash scripts/check_repo_standards.sh
bash scripts/check_audit_events_md.sh
```

---

## Required workflows that must pass before merge

| Workflow | Required |
|---|---|
| CI (Rust or Julia) | ✅ Required |
| Security | ✅ Required |
| Repo Standards | ✅ Required |
| Docs | ✅ Required |

---

## Healthcare data classification quick reference

| Data Type | Handling |
|---|---|
| PHI / ePHI | Never log; never include in errors; encrypt at rest and in transit |
| De-identified data | Permitted only via approved pipelines; document in `docs/data-classification.md` |
| Synthetic test data | Preferred for all CI fixtures; label clearly as synthetic |
| Operational metadata | Retain for security/debugging; must be scrubbed of PHI |

See `docs/data-classification.md` for the full classification policy.
