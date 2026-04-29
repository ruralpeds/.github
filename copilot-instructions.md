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

### 8. Use the gap-analysis system on every coding session

Every repository under the `ruralpeds` org maintains a `.gap-analysis/`
directory that is the single source of truth for what is being built, what is
in progress, and what has been completed. Coding agents are participants in
this lifecycle, not passive readers.

The full contract for agents lives in
[`docs/CLAUDE_CODE_GAP_PROTOCOL.md`](docs/CLAUDE_CODE_GAP_PROTOCOL.md). The
canonical lifecycle specification is
[`docs/GAP_ANALYSIS_LIFECYCLE.md`](docs/GAP_ANALYSIS_LIFECYCLE.md).

**Mandatory at session start.** Before writing or modifying code in any repo,
agents must read in order:

1. `.gap-analysis/CLAUDE.md` (per-repo agent contract)
2. `.gap-analysis/GAP_ANALYSIS.md` (active and completed gaps)
3. `.gap-analysis/SUGGESTIONS.md` (pending triage queue)

If any of these files are missing, the repo has not been bootstrapped — stop
and notify the user instead of proceeding with ad-hoc work.

**Branch and commit conventions.** All gap-related work must use:

- branch name `gap/NNN-short-kebab-slug` where `NNN` is the zero-padded gap ID
- commit messages with footer `Refs: GAP-NNN` (one per gap touched)
- pull-request titles prefixed with `GAP-NNN: <one-line summary>`
- pull-request bodies that include `Closes: GAP-NNN` for the primary gap and
  `Also closes: GAP-MMM, GAP-PPP` for any additional gaps resolved in the
  same PR

These conventions are not stylistic — the org-level reusable workflow
`reusable-gap-analysis.yml` parses them to drive automatic status transitions
and append events to `.gap-analysis/build-ledger.jsonl`.

**Write permissions for agents.** Agents may freely write to:

- `.gap-analysis/SUGGESTIONS.md` — append new triage entries with
  `sug-YYYY-MM-DD-<author>-NNN` IDs
- the **Status Updates** bullet list inside an active gap entry in
  `GAP_ANALYSIS.md` (newest first, dated)
- the **Acceptance Criteria** checkboxes in the gap the agent is currently
  working on

Agents must **never** write to:

- `.gap-analysis/build-ledger.jsonl` (workflow-only, append-only ledger)
- `.gap-analysis/status.json` (workflow-only, regenerated)
- the **Status** field of any gap (workflow-only — set by branch open, PR open,
  PR merge events)
- the **PRs** or **Branch** fields of any gap (workflow-only)
- any gap in the **Completed Gaps** section (immutable once merged)

**Proposing new work.** When an agent identifies a missing capability, bug,
debt item, or improvement opportunity, the agent does **not** add it directly
to `GAP_ANALYSIS.md`. Instead, the agent appends a triage entry to
`SUGGESTIONS.md` with a brief problem statement, a proposed acceptance
criterion, and an estimated priority. A human operator promotes triaged
suggestions to formal `GAP-NNN` entries.

**Anti-patterns that will fail review.**

- Starting work without a corresponding `GAP-NNN` entry in `Backlog` or
  `In Progress`
- Editing `Status`, `PRs`, or `Branch` fields by hand
- Marking a gap `Completed` in a commit (only merge to `main` may do this)
- Adding new gaps to `GAP_ANALYSIS.md` without going through `SUGGESTIONS.md`
- Working on multiple unrelated gaps in a single branch (split into separate
  `gap/NNN-…` branches)
- Force-pushing or rewriting history on a `gap/*` branch after a PR has been
  opened (breaks ledger consistency)

The weekly audit job (`gap-analysis-audit.yml`) will surface any drift
between `GAP_ANALYSIS.md`, `build-ledger.jsonl`, and the git history of
`main`. Drift caused by manual edits to workflow-managed fields is the most
common audit failure and is treated as a blocking issue for the next PR.

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
