# Secret Scanning & Push Protection — ruralpeds

## Overview

GitHub's **secret scanning** detects credential patterns in every commit pushed
to any repository in the `ruralpeds` organization. **Push protection** rejects
the push _before_ it lands in the remote, giving contributors a chance to revoke
and replace the leaked credential.

Both features are enabled org-wide. Every new repository inherits the
configuration automatically through the organization settings.

---

## Current configuration

| Setting | State |
|---|---|
| Secret scanning — new private repos | **ON** |
| Secret scanning — existing repos | **ON** (applied retroactively by org owner) |
| Push protection | **ON** |
| Validity checks | **ON** (GitHub periodically pings providers) |

> **How to verify:** Organization owners can confirm the state at
> `github.com/organizations/ruralpeds/settings/security_analysis`.
> A screenshot confirming the toggles are ON should be attached to the PR that
> first enables these controls.

---

## Custom patterns

GitHub's built-in detectors cover 200+ secret types (AWS, GCP, Stripe, etc.)
but do not cover every credential the org uses. The following custom patterns
are defined in
[`policies/secret-scanning/custom-patterns.yaml`](../../policies/secret-scanning/custom-patterns.yaml)
and must be applied via the GitHub UI or API:

### How to apply a custom pattern

```bash
# Requires a token with org:write scope or a GitHub App with security_events write.
curl -X POST \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/orgs/ruralpeds/secret-scanning/custom-patterns \
  --data '{
    "name": "<pattern name>",
    "secret_type": "<slug>",
    "regex": "<PCRE2 regex>",
    "push_protection_enabled": true
  }'
```

### Pattern inventory

| Pattern name | Regex (abbreviated) | Push protection | Reason |
|---|---|---|---|
| Tailscale auth key | `tskey-auth-[A-Za-z0-9]{30,}` | ✅ Hard block | VPN enrollment key; leak = unauthorized device on network |
| Anthropic API key | `sk-ant-(api03\|admin01)-[A-Za-z0-9_-]{40,}` | ✅ Hard block | Unbounded billing exposure if leaked |
| WordPress application password | `[A-Za-z0-9]{4}(?:\s[A-Za-z0-9]{4}){5}` | ⚠️ Alert only | High false-positive rate; pattern overlaps base-32 data |

#### Tailscale auth key

```
tskey-auth-[A-Za-z0-9]{30,}
```

Tailscale authentication keys are used to enroll devices into the
organization's WireGuard overlay network. A leaked key allows any device to
join the VPN without human approval. Push protection is **enabled** — developers
who trigger it should immediately revoke the key in the Tailscale admin console
and generate a new one.

#### Anthropic API key

```
sk-ant-(api03|admin01)-[A-Za-z0-9_-]{40,}
```

Anthropic Claude API keys are used by clinical decision-support tools and
internal tooling. A leaked key allows unrestricted LLM usage billed to the org
and could expose patient-adjacent prompts. Push protection is **enabled**.

#### WordPress application password

```
[A-Za-z0-9]{4}(?:\s[A-Za-z0-9]{4}){5}
```

WordPress application passwords (introduced in WP 5.6) authenticate REST API
requests without exposing the main account password. The pattern has a high
false-positive rate (matches any 24-character base-32 blob with spaces) so push
protection is **disabled**. Alerts are raised for human review only.

---

## Alert triage process

When a secret-scanning alert fires, the responder must complete all five steps:

```
Investigate → Revoke → Rotate → Close alert → Document
```

### 1. Investigate

- Open the alert in GitHub Security → Secret scanning.
- Identify which commit introduced the secret, which branches contain it, and
  whether the secret has already been used from an unexpected location (check
  the provider's access logs).
- Determine the blast radius: who has access to the credential? What services
  does it unlock?

### 2. Revoke

- **Immediately revoke** the credential at the issuing provider regardless of
  whether it appears to have been exploited.
  - Tailscale: Admin console → Keys → Revoke.
  - Anthropic: Console → API keys → Revoke.
  - WordPress: User → Application passwords → Revoke.
  - GitHub tokens: Settings → Developer settings → PATs → Delete.
- Do not wait to confirm exploitation before revoking.

### 3. Rotate

- Generate a replacement credential.
- Store it in the appropriate secret store (GitHub Actions secrets,
  `1Password`, or the org's HashiCorp Vault instance — never in code).
- Update all consumers.

### 4. Close the alert

- In GitHub Security → Secret scanning, mark the alert as:
  - **Revoked** — credential has been revoked and replaced.
  - **False positive** — the pattern matched a non-secret string (document why).
  - **Used in tests** — test fixture with no real value (document and rotate anyway).
- Add a comment on the alert linking to the revocation evidence
  (provider audit log, ticket, or PR).

### 5. Document

- Open a postmortem issue in this repo with label `security` and `postmortem`.
- Include: timeline, root cause, blast-radius assessment, and remediation steps.
- Link the issue to the secret-scanning alert.
- For any alert involving PHI-adjacent credentials (e.g., EHR API keys),
  escalate to the HIPAA Security Officer within 24 hours.

---

## On-call / escalation

| Severity | Who gets paged | SLA |
|---|---|---|
| Critical (active exploitation suspected) | `@ruralpeds/security` (PagerDuty P1) | 15 min acknowledge |
| High (credential exposed, no known use) | `@ruralpeds/security` (PagerDuty P2) | 1 hour |
| Medium / Low | Assigned to next available security team member | Next business day |

Critical severity is declared when:
- GitHub or the provider confirms the credential was used from an unknown IP/UA.
- The credential unlocks PHI-containing systems (EHR, FHIR endpoints, patient databases).
- The credential has admin/root scope.

---

## Weekly report

A GitHub Actions workflow
(`.github/workflows/reusable-secret-scan-report.yml`) runs every Monday at
06:00 UTC. It:

1. Fetches all open secret-scanning alerts across the org via
   `GET /orgs/ruralpeds/secret-scanning/alerts?state=open`.
2. Formats a markdown summary: total count, breakdown by secret type,
   top-10 newest alerts, top-10 oldest (longest-lived) alerts.
3. Uploads the report as a workflow artifact (retained 90 days).
4. Opens or updates a single tracking issue titled **"Weekly secret-scan
   report"** in `ruralpeds/.github`.

Dispatch the workflow manually via Actions → "Secret Scan Weekly Report" →
"Run workflow" to generate an ad-hoc report.

---

## References

- [GitHub docs: About secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [GitHub docs: Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations)
- [GitHub docs: Defining custom patterns for secret scanning](https://docs.github.com/en/code-security/secret-scanning/defining-custom-patterns-for-secret-scanning)
- [NIST SP 800-218 (SSDF) PO.5](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218.pdf)
- [HIPAA §164.312(a)(2)(i)](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)
- [OpenSSF Scorecard — Token-Permissions](https://github.com/ossf/scorecard/blob/main/docs/checks.md#token-permissions)
