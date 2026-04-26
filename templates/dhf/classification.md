# IEC 62304 Software Classification

**Repository:** `<owner>/<repo>`
**Classification date:** YYYY-MM-DD
**Classified by:** `<github-username>`
**Reviewed by:** `<github-username>` (clinical lead)

---

## Classification decision

| Property | Value |
|---|---|
| IEC 62304 class | `class-b` *(replace with actual class)* |
| Regulated | `true` / `false` |
| Data classification | `phi-active` / `phi-capable` / `internal` |
| Criticality | `clinical-decision` / `clinical-support` |

## Rationale

**Class A** — No injury possible: software failure cannot lead to patient harm, even indirectly.

**Class B** — Non-serious injury possible: software failure could lead to a non-serious injury.

**Class C** — Death or serious injury possible: software failure could lead to death or serious injury.

### Selected: `class-[A/B/C]` because:

*[Replace this section with the reasoning: describe the role this software plays in the clinical
workflow, the worst-case failure mode, and why that failure mode maps to the selected class.
Reference IEC 62304:2006+A1:2015 Table 1 and the relevant ISO 14971 risk analysis.]*

---

## Scope

This classification applies to software components:

- *[List the modules, libraries, or services included in scope]*

The following components are **excluded** from this classification (and their rationale):

- *[e.g., "Test infrastructure (pytest fixtures) — not deployed to production"]*

---

## Change history

| Date | Change | Author |
|---|---|---|
| YYYY-MM-DD | Initial classification | `<username>` |
