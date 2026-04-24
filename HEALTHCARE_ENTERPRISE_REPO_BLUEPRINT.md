# Enterprise Healthcare Software Development Blueprint
## Repo-ready build plan for Codex or GitHub Copilot

**Purpose:** This document is written so an AI coding assistant such as Codex or GitHub Copilot can turn it into a production-grade GitHub repository with automated workflows, security controls, observability, browser testing, and healthcare-specific safeguards.

**Primary audience:** platform engineers, healthcare software architects, engineering managers, security teams, QA teams, DevOps/SRE teams, and AI coding agents operating in a governed GitHub repository.

**Scope:** enterprise healthcare applications that may process PHI or ePHI, use HL7 FHIR or adjacent healthcare integration patterns, and require strong controls for confidentiality, integrity, availability, traceability, and operational resilience.

**Important note:** this blueprint is an engineering starting point, not legal advice. If the system is also a regulated medical device or Software as a Medical Device, extend this blueprint with device-specific quality, risk, validation, and regulatory requirements.

---

## 1. Mission for the repository

Build a reusable enterprise healthcare software repository template that bakes in the following capabilities from day one:

1. Secure software development lifecycle controls.
2. Healthcare-specific PHI/ePHI handling safeguards.
3. Strong identity, authorization, and auditability.
4. Structured error handling and operational diagnostics.
5. Automated testing across unit, integration, API, contract, and browser layers.
6. Automated GitHub workflows for CI, security scanning, release governance, and deployment verification.
7. Observable-by-default services using structured logs, traces, metrics, and correlated incident evidence.
8. Performance budgets and automated regression detection.
9. Documentation that enables a coding agent to add features safely without degrading governance.

The repository should be usable as:

- a starter template for new healthcare services,
- a reference implementation for platform standards,
- a paved-road example for internal teams,
- a prompt target for Codex or Copilot.

---

## 2. Healthcare-specific engineering principles

The repository must assume that healthcare data is sensitive by default.

### 2.1 Core principles

- Treat all patient-linked data as sensitive unless explicitly classified otherwise.
- Minimize PHI/ePHI collection, storage, display, and propagation.
- Design around least privilege and role-scoped access.
- Make every privileged or patient-impacting action auditable.
- Ensure every production failure is diagnosable without exposing PHI in logs or debugging artifacts.
- Use standards-based interoperability where possible, especially HL7 FHIR for data exchange.
- Build for safe change: every release must be reviewable, testable, attributable, and reversible.
- Prefer secure defaults over optional controls.

### 2.2 Data handling assumptions

The repository should support the following data states:

- **PHI/ePHI**: full protection required.
- **De-identified data**: permitted only through approved transformation pipelines.
- **Synthetic test data**: preferred for local development and browser automation.
- **Operational metadata**: retained where necessary for security and debugging, but scrubbed of prohibited content.

### 2.3 Minimum healthcare posture

The generated codebase should include patterns for:

- consent-aware access where applicable,
- role-based access control,
- break-glass or emergency access events where applicable,
- immutable audit records for high-risk actions,
- retention configuration,
- security logging and alerting,
- versioned APIs and backward-compatible clinical integrations.

---

## 3. What Codex or Copilot should build in the GitHub repo

The coding agent should create a repository with the following top-level outcomes:

### 3.1 Repository deliverables

- application skeleton
- API layer
- domain layer
- persistence layer
- integration adapters
- FHIR-facing interfaces or placeholder modules
- auth and RBAC scaffolding
- audit logging middleware
- structured error framework
- observability wiring
- test harnesses
- Playwright browser automation
- GitHub Actions workflows
- repo governance files
- secure defaults for secrets and environments
- architecture and operations documentation

### 3.2 Non-functional requirements

The repository must be:

- **secure by default**
- **test-first or test-alongside implementation**
- **observable by default**
- **linted, typed, and formatted**
- **artifact-oriented and release-governed**
- **friendly to small pull requests and automation**
- **structured for long-term maintainability**

---

## 4. Recommended repository layout

Use a structure like the following and adapt to the selected language stack.

```text
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── security.yml
│   │   ├── playwright.yml
│   │   ├── release.yml
│   │   ├── docs.yml
│   │   └── dependency-review.yml
│   ├── CODEOWNERS
│   ├── pull_request_template.md
│   ├── ISSUE_TEMPLATE/
│   └── copilot-instructions.md
├── docs/
│   ├── architecture.md
│   ├── threat-model.md
│   ├── data-classification.md
│   ├── audit-events.md
│   ├── runbooks/
│   └── adr/
├── src/
│   ├── app/
│   ├── api/
│   ├── domain/
│   ├── services/
│   ├── integrations/
│   ├── auth/
│   ├── observability/
│   ├── audit/
│   ├── errors/
│   ├── validation/
│   └── config/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── security/
│   └── fixtures/
├── e2e/
│   ├── playwright/
│   ├── fixtures/
│   └── auth/
├── scripts/
├── infra/
├── db/
│   ├── migrations/
│   └── seeds/
├── sbom/
├── .env.example
├── Makefile
├── README.md
├── AGENTS.md
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
└── CHANGELOG.md
```

---

## 5. Required skills and capabilities the AI agent must implement

### 5.1 Secure coding skill set

The repo should enforce:

- input validation at the boundary,
- output encoding where relevant,
- parameterized database access,
- secret-free source control,
- explicit authorization checks,
- deny-by-default behavior for privileged operations,
- safe file handling,
- dependency pinning,
- environment-based configuration,
- TLS-aware service integration,
- resilient retry and timeout handling.

### 5.2 Error handling skill set

The repo should include a shared error model with categories such as:

- validation error
- authentication failure
- authorization failure
- resource not found
- conflict / concurrency violation
- dependency timeout
- upstream service failure
- data integrity violation
- rate limit exceeded
- internal unexpected exception

Each error should support:

- stable machine-readable code,
- safe end-user message,
- internal developer message,
- correlation ID,
- retryable flag,
- severity,
- HTTP or transport mapping,
- audit/logging behavior.

### 5.3 Audit and healthcare accountability skill set

The repo must implement audit logging for:

- login and logout
- failed login attempts
- role or permission changes
- break-glass access
- chart or patient record access when required by policy
- export, print, or share actions
- admin configuration changes
- deployment approvals
- data deletion requests
- data correction or merge actions
- API token creation, rotation, and revocation

Audit records should capture at minimum:

- timestamp
- actor ID
- actor type
- patient or subject reference where allowed
- action name
- target resource
- outcome
- request source
- correlation ID
- environment
- justification field where required

### 5.4 Observability skill set

The repo should wire in:

- structured JSON logs
- trace IDs and span IDs
- request correlation
- service name and version tags
- deployment identifiers
- error counters
- latency histograms
- health endpoints
- readiness/liveness checks
- alert-friendly event naming

### 5.5 Testing skill set

The repo should support:

- unit tests
- service tests
- integration tests
- API contract tests
- security-focused negative tests
- Playwright browser tests
- smoke tests for deployment verification
- performance benchmark hooks
- test data factory support
- synthetic healthcare fixtures

### 5.6 Interoperability skill set

The repo should be ready for:

- HL7 FHIR resource validation
- versioned FHIR endpoints or adapters
- external EHR integration boundaries
- idempotent ingestion and outbound events
- schema validation for inbound and outbound healthcare payloads
- terminology or code-set adapter abstraction where needed

---

## 6. Definition of done for the generated repository

A feature or repo milestone is not complete unless all of the following are true:

- code is linted, formatted, and typed,
- tests exist for happy path and failure path,
- security checks pass,
- audit logging exists for privileged or patient-impacting actions,
- logs do not leak PHI/ePHI,
- documentation is updated,
- observability hooks are present,
- workflow gates pass in GitHub Actions,
- deployment artifacts are reproducible,
- rollback path is documented.

---

## 7. GitHub governance files to generate

Codex or Copilot should create and maintain these files.

### 7.1 `AGENTS.md`

This file should tell coding agents:

- architecture boundaries,
- healthcare data safety rules,
- what directories they may change,
- required test additions,
- prohibited shortcuts,
- how to run checks locally,
- what workflows must pass before merge.

### 7.2 `SECURITY.md`

Include:

- vulnerability reporting instructions,
- secrets handling rules,
- supported versions,
- dependency update policy,
- emergency disclosure path.

### 7.3 `CONTRIBUTING.md`

Include:

- local setup,
- code style,
- commit expectations,
- branch naming,
- pull request checklist,
- test requirements,
- documentation requirements.

### 7.4 `docs/data-classification.md`

Include at least:

- PHI/ePHI handling rules,
- log redaction rules,
- allowed synthetic fixture patterns,
- export/reporting policy,
- retention and deletion expectations.

### 7.5 `docs/audit-events.md`

Define a stable catalog of audit event names such as:

- `auth.login.succeeded`
- `auth.login.failed`
- `user.role.changed`
- `patient.record.viewed`
- `patient.record.updated`
- `patient.record.exported`
- `admin.configuration.changed`
- `deployment.production.approved`

---

## 8. GitHub Actions workflows the AI agent must create

The repository should include modular, reusable workflows.

## 8.1 `ci.yml`

**Purpose:** fast pull request quality gate.

Run on:

- pull requests
- pushes to protected branches

Must include:

- checkout
- dependency install
- lint
- format check
- type check
- unit tests
- integration tests where feasible
- coverage upload or summary
- artifact upload for test reports

Example skeleton:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<pinned-sha>
      - name: Setup runtime
        run: echo "setup runtime here"
      - name: Install dependencies
        run: make install
      - name: Lint
        run: make lint
      - name: Format check
        run: make format-check
      - name: Type check
        run: make typecheck
      - name: Unit tests
        run: make test-unit
      - name: Integration tests
        run: make test-integration
      - name: Coverage
        run: make coverage
```

## 8.2 `security.yml`

**Purpose:** security scanning and governance.

Must include:

- code scanning
- secret scanning or secret-detection stage
- dependency scan
- dependency review on PRs
- lockfile validation where applicable
- SARIF or report upload

Example tasks:

```yaml
- run: make scan-secrets
- run: make scan-dependencies
- run: make scan-sast
```

## 8.3 `playwright.yml`

**Purpose:** browser-based healthcare workflow validation.

Must include:

- deterministic test env setup
- synthetic fixture data load
- Playwright install
- browser tests
- HTML report upload
- trace upload
- screenshot upload
- video upload on failure

Example skeleton:

```yaml
name: Playwright

on:
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<pinned-sha>
      - run: make install
      - run: make seed-test-data
      - run: make test-e2e
      - uses: actions/upload-artifact@<pinned-sha>
        with:
          name: playwright-report
          path: playwright-report/
```

## 8.4 `release.yml`

**Purpose:** governed release packaging.

Must include:

- version tagging
- immutable build artifact creation
- SBOM generation
- provenance or attestation generation
- release note generation
- protected environment approval hooks
- post-deploy smoke checks

## 8.5 `docs.yml`

**Purpose:** validate documentation quality.

Must include:

- markdown linting
- link checking
- architecture doc presence checks
- audit event catalog validation

## 8.6 `dependency-review.yml`

**Purpose:** prevent unsafe dependency drift.

Must include:

- manifest diff analysis
- license policy hook if required
- vulnerability threshold handling
- action dependency review for `.github/workflows`

---

## 9. Playwright requirements for healthcare UI testing

Healthcare browser testing must be careful with fixtures and debugging evidence.

### 9.1 Playwright standards

- Use only synthetic or approved non-PHI test data.
- Keep login and session helpers isolated.
- Validate critical workflows, not every minor click path.
- Prefer semantic locators and accessibility-based selectors.
- Capture traces, screenshots, console logs, and videos on failure.
- Sanitize artifacts if any sensitive tokens or values are present.

### 9.2 Minimum healthcare browser journeys

The repo should include examples or placeholders for:

- clinician or staff login
- role-based menu visibility
- patient search using synthetic data
- chart or record view with audit event emission
- create or update operation with validation behavior
- restricted action blocked by authorization policy
- export or print action with elevated audit logging
- session timeout and re-authentication flow

### 9.3 Playwright configuration guidance

```ts
use: {
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

---

## 10. Security and privacy rules the AI agent must follow

The coding agent must never generate code that casually logs full healthcare payloads in production.

### 10.1 Prohibited defaults

Do **not**:

- log full patient records,
- log access tokens or secrets,
- place PHI in exception messages,
- store real PHI in test fixtures,
- use unrestricted admin endpoints without authorization middleware,
- hard-code credentials,
- use broad wildcard CORS without justification,
- add bypass flags that disable auth or auditing in production builds.

### 10.2 Required defaults

Always:

- validate input at boundaries,
- redact prohibited fields before logging,
- require authn and authz middleware for protected routes,
- generate correlation IDs,
- emit audit events for privileged actions,
- enforce secure cookie/session settings where relevant,
- support secret injection via environment or secret manager,
- add tests for access denial behavior.

---

## 11. Suggested application capabilities to scaffold

The AI agent should scaffold example modules, even if some are placeholders.

### 11.1 Identity and access

- local auth abstraction
- SSO/OIDC abstraction
- role model
- permission guard middleware
- emergency access event hooks

### 11.2 Patient and clinical data boundaries

- patient lookup module
- encounter or visit placeholder module
- clinical document placeholder
- audit-aware record access service
- de-identification service boundary

### 11.3 Integration boundaries

- FHIR client abstraction
- FHIR resource validator interface
- webhook or event ingestion boundary
- outbound interface queue abstraction
- retry-safe integration wrapper

### 11.4 Admin and governance

- feature flag abstraction
- configuration audit trail
- release metadata endpoint
- health and readiness endpoints
- workflow-driven deployment verification hooks

---

## 12. Recommended docs the agent should generate inside `/docs`

Create these Markdown files:

- `docs/architecture.md`
- `docs/threat-model.md`
- `docs/data-classification.md`
- `docs/testing-strategy.md`
- `docs/observability.md`
- `docs/audit-events.md`
- `docs/incident-response.md`
- `docs/release-process.md`
- `docs/fhir-integration.md`
- `docs/playwright-strategy.md`

Each document should be brief but operational, not ceremonial.

---

## 13. Prompt instructions for Codex or GitHub Copilot

The following prompt can be placed into `AGENTS.md`, `copilot-instructions.md`, or an issue for the coding agent.

### 13.1 Master prompt

```md
You are building an enterprise healthcare software repository template.

Requirements:
- Treat healthcare data as sensitive by default.
- Build a production-grade starter repo, not a toy sample.
- Implement secure defaults for auth, authorization, logging, auditing, and secrets.
- Add structured error handling with stable error codes and correlation IDs.
- Add structured logging and observability hooks.
- Add automated tests: unit, integration, and browser-level Playwright coverage for critical flows.
- Add GitHub Actions workflows for CI, security scanning, Playwright, dependency review, docs validation, and release.
- Use synthetic test data only.
- Add documentation under /docs for architecture, threat model, data classification, observability, and release process.
- Do not log PHI/ePHI in production logs.
- Ensure privileged or patient-impacting operations emit audit events.
- Keep files modular and easy to review.
- Add a Makefile or equivalent task runner.
- Add placeholders for FHIR integration and healthcare interoperability.

Definition of done:
- Repo builds locally.
- Workflows are present and valid.
- All checks pass.
- Example endpoints and browser tests exist.
- Documentation is present.
```

### 13.2 Pull request prompt for the coding agent

```md
For this pull request:
1. Explain the change in plain language.
2. List affected modules.
3. List new audit events.
4. List security implications.
5. List new tests added.
6. Confirm no PHI/ePHI is introduced into logs or fixtures.
7. Confirm GitHub Actions workflows still pass.
```

---

## 14. Initial GitHub issues to create

Codex or Copilot should break work into small, reviewable issues.

### Milestone 1: repo foundation

- create repository skeleton
- add governance files
- add CI workflow
- add lint/type/format tooling
- add testing harness

### Milestone 2: security and healthcare controls

- add auth and RBAC scaffolding
- add error model and correlation IDs
- add audit event middleware
- add data classification documentation
- add secrets and config management pattern

### Milestone 3: observability and browser automation

- add structured logging
- add tracing hooks
- add health endpoints
- add Playwright harness
- add synthetic patient fixtures

### Milestone 4: release governance

- add security workflow
- add dependency review workflow
- add SBOM generation
- add release workflow
- add post-deploy smoke checks

### Milestone 5: interoperability readiness

- add FHIR adapter interfaces
- add contract validation tests
- add integration runbook
- add outbound retry/idempotency pattern

---

## 15. Acceptance criteria for enterprise readiness

The repo can be considered enterprise-ready when it demonstrates all of the following:

- reproducible local setup,
- governed GitHub workflows,
- protected branch compatibility,
- security scanning built in,
- audit event catalog documented,
- synthetic test data strategy,
- browser artifact capture on failure,
- structured logging and trace correlation,
- release artifact generation,
- docs sufficient for another team to adopt the template.

---

## 16. Optional advanced enhancements

The AI agent may add these after the foundation is stable:

- policy-as-code checks for repo governance
- automatic changelog generation
- deployment freeze window checks
- drift detection for infrastructure
- chaos or fault-injection tests for dependencies
- accessibility checks in browser tests
- performance budget gates
- signed container images
- environment promotion workflows
- break-glass review dashboards

---

## 17. Final instruction block

If Codex or GitHub Copilot is asked to build from this document, it should proceed in this order:

1. repository structure
2. governance files
3. local developer tooling
4. core app skeleton
5. auth and authorization scaffolding
6. error handling and audit logging
7. tests and Playwright
8. GitHub Actions workflows
9. documentation
10. release hardening
11. interoperability placeholders

The AI assistant should prefer correctness, security, traceability, and reviewability over speed of feature generation.

---

## 18. Reference standards to align against

Use these as the design baseline when implementing the repo:

- HHS HIPAA Security Rule guidance
- NIST SP 800-66 Rev. 2
- NIST SP 800-218 SSDF
- HL7 FHIR specification
- OWASP ASVS
- OWASP logging, dependency, and secure coding guidance
- GitHub Actions security guidance
- OpenTelemetry guidance for logs, traces, and metrics
- SLSA and SBOM/provenance practices where appropriate

