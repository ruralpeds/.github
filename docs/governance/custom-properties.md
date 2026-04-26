# Org Custom Repository Properties

Every repository in `ruralpeds` carries six metadata properties that drive automated governance decisions — rulesets, audit depth, DHF scaffolding, and more. This document explains each property, how to change it, and what happens downstream.

---

## Properties

### `data-classification`

| Value | Meaning |
|---|---|
| `public` | Publicly available; no ePHI, no PII |
| `internal` | Internal use; no ePHI; may contain internal docs/designs |
| `synthetic` | Synthetic test data (Synthea fixtures, mock patients); never real ePHI |
| `phi-capable` | Can process ePHI in principle; not actively doing so today |
| `phi-active` | Actively processes or stores real ePHI in production |

**Downstream effects:**
- `phi-active` → activates the PHI-scan workflow and HIPAA BAA check; `baa-required` should also be `true`.

**Who can change:** Self-serve.

---

### `criticality`

| Value | Meaning |
|---|---|
| `experimental` | Research, prototype, PoC; not used clinically |
| `reference` | Reference docs, educational content |
| `clinical-support` | Supports clinical workflows but not on the critical path |
| `clinical-decision` | Directly influences clinical decisions (alarms, calculators) |
| `device` | Software as a Medical Device (SaMD) under FDA/IEC 62304 |

**Downstream effects:**
- `clinical-decision` → requires HA configuration (phase 8).
- `device` → requires FDA cybersecurity plan, SBOM, and SLSA attestation.

**Who can change:** Self-serve.

---

### `iec62304-class`

| Value | Meaning |
|---|---|
| `not-applicable` | Not a medical device; IEC 62304 does not apply |
| `class-a` | Class A: No injury possible (display-only, informational) |
| `class-b` | Class B: Non-serious injury possible |
| `class-c` | Class C: Death or serious injury possible |

**Downstream effects:**
- `class-b` or `class-c` → activates `reusable-iec62304-traceability.yml` on every PR; the DHF scaffold must be present.

**Who can change:** Requires **clinical-lead** approval — changing class alters regulatory scope and triggers a full DHF review.

---

### `regulated`

| Value | Meaning |
|---|---|
| `true` | Subject to regulatory oversight (FDA, EMA, Health Canada, etc.) |
| `false` | Not regulated |

**Downstream effects:**
- `true` → activates SLSA provenance, SBOM attestation, and the release gate workflow.

**Who can change:** Requires **clinical-lead** approval.

---

### `primary-stack`

| Value | Meaning |
|---|---|
| `julia` | Julia (scientific computing, PedNeoSim) |
| `rust` | Rust (systems, performance-critical) |
| `node` | Node.js / TypeScript |
| `python` | Python |
| `go` | Go |
| `content` | Docs, education, markdown-only |
| `polyglot` | Multiple languages / monorepo |

**Downstream effects:**
- Selects which reusable CI workflow (e.g., `reusable-ci-julia.yml`) is used by consuming repos.

**Who can change:** Self-serve.

---

### `baa-required`

| Value | Meaning |
|---|---|
| `true` | A HIPAA BAA must be on file before production ePHI flows |
| `false` | BAA not required |

**Downstream effects:**
- `true` → compliance automation checks for a BAA record in the org wiki.

**Who can change:** Self-serve (but must be consistent with `data-classification`).

---

## How to Set Properties

### Interactive wizard (recommended)

```bash
export GH_TOKEN=$(gh auth token)
python scripts/set-properties.py ruralpeds/my-repo
```

The wizard will show each property's current value, allowed options, and prompt for a new value. Press Enter to keep the current value.

### Non-interactive (for automation or bulk updates)

```bash
python scripts/set-properties.py \
  --set iec62304-class=class-b \
  --set regulated=true \
  ruralpeds/my-repo
```

Use `--dry-run` to preview changes without applying them:

```bash
python scripts/set-properties.py --dry-run ruralpeds/my-repo
```

### Verify current values

```bash
gh api repos/ruralpeds/my-repo/properties/values | jq
```

### GitHub UI

Organization Settings → Custom Properties → select the repo → edit values.

---

## One-time Setup (Org Owner only)

The six property **definitions** must be created once by an org owner via the GitHub UI or API. The JSON schema at `policies/custom-properties.json` is the canonical definition — use it to recreate the properties if they are ever deleted.

---

## Weekly Audit

The `custom-properties-audit.yml` workflow runs every Monday at 09:00 UTC and opens (or updates) a tracking issue listing any repos missing required properties.

Run manually:

```bash
gh workflow run custom-properties-audit.yml
```

---

## Downstream Phase Dependencies

| Phase | Property dependency |
|---|---|
| Phase 3 — Rulesets | `iec62304-class`, `data-classification` |
| Phase 4 — Audit depth | `criticality` |
| Phase 6 — DHF scaffold | `iec62304-class != not-applicable` |
| Phase 8 — HA patterns | `criticality >= clinical-decision` |
