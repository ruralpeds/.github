---
title: "Enable secret scanning + push protection org-wide"
phase: phase-01
slug: secret-scanning-push-protection
preferred-agent: copilot
preflight-confirmation: false
estimated-complexity: xs

goal: >
  Turn on GitHub secret scanning with push protection at the organization
  level, and document the configuration. This is the single highest-ROI
  security control we can enable and should be the first thing an agent
  touches.

acceptance-criteria:
  - "Org-level 'Enable secret scanning for new private repositories' is ON"
  - "Org-level 'Enable push protection' is ON"
  - "Custom pattern for Tailscale auth keys (tskey-*) added"
  - "Custom pattern for Anthropic API keys (sk-ant-*) added"
  - "Custom pattern for WordPress application passwords added"
  - "docs/security/secret-scanning.md describes the configuration, patterns, and alert triage"
  - "Reusable workflow `reusable-secret-scan-report.yml` produced that compiles a weekly report of open secret alerts across the org"

files-to-touch:
  - "docs/security/secret-scanning.md"
  - ".github/workflows/reusable-secret-scan-report.yml"
  - "policies/secret-scanning/custom-patterns.yaml"

files-not-to-touch:
  - "AGENTS.md"
  - "audit-log/**"
  - ".github/workflows/audit-log.yml"

tests-required: |
  - `actionlint .github/workflows/reusable-secret-scan-report.yml` must pass.
  - Manual verification: push a test branch containing a dummy token matching
    each custom pattern (use `tskey-auth-EXAMPLEFAKE12345` etc.) to a scratch
    repo; each push must be blocked with the pattern name shown. Document the
    verification in the PR description.

standards:
  - "NIST SSDF PO.5.1 — implement supporting toolchains"
  - "HIPAA §164.312(a)(2)(i) — unique user identification (by preventing shared secrets)"
  - "OpenSSF Scorecard: Token-Permissions"

rollback: >
  Secret-scanning and push-protection can be disabled at org level if an
  outage requires it; custom patterns can be deleted individually.

labels:
  - "security"
  - "quick-win"

---

## Context

GitHub's secret scanning finds leaked credentials in pushed commits; push
protection rejects the push before it lands. Both are free for public repos;
paid for private repos as part of GitHub Advanced Security.

Org-level enforcement means every new repo inherits the setting automatically;
the `repo-scanner.yml` workflow already creates new repos with baseline config,
and this task ensures that baseline includes secret-scanning.

## Approach

1. **Enable at org level.** Via `Organization settings → Code security and
   analysis → Secret scanning`: turn on for all private/internal/public repos,
   and enable push protection. (This step is done in the GitHub UI; the agent
   documents in `docs/security/secret-scanning.md` that it has been done, but
   the toggle itself is a human action requiring org-owner permissions.)

2. **Add custom patterns.** The org uses several secret types GitHub's
   detectors don't cover. Create `policies/secret-scanning/custom-patterns.yaml`
   with entries for:

   ```yaml
   patterns:
     - name: "Tailscale auth key"
       regex: 'tskey-auth-[A-Za-z0-9]{30,}'
       push_protection: true
     - name: "Anthropic API key"
       regex: 'sk-ant-(api03|admin01)-[A-Za-z0-9_-]{40,}'
       push_protection: true
     - name: "WordPress application password"
       regex: '[A-Za-z0-9]{4}(?:\s[A-Za-z0-9]{4}){5}'
       push_protection: false    # too many false positives for hard block
   ```

   The agent produces the YAML; a human applies it via the GitHub API or UI.
   (The Custom Patterns API requires GitHub Advanced Security; document the
   API payload equivalent in the markdown doc.)

3. **Produce the weekly report workflow.** `reusable-secret-scan-report.yml`
   calls `GET /orgs/{org}/secret-scanning/alerts?state=open`, formats a
   markdown summary (count by severity, top-10 newest, top-10 oldest),
   uploads as a workflow artifact, and opens or updates a single tracking
   issue titled "Weekly secret-scan report" in `ruralpeds/.github`.

4. **Document.** `docs/security/secret-scanning.md` covers:
   - How the feature works
   - What custom patterns are in place and why
   - Triage process (investigate → revoke → rotate → close alert → document)
   - On-call: who gets paged for a critical-severity alert
   - Links to GitHub's docs

## Verification

After the PR merges:

- Confirm org-level toggles are on via a screenshot linked in the PR body.
- Push a test branch with a fake `tskey-auth-EXAMPLEFAKE123456789012345678901234` in a file. Verify the push is blocked.
- Push a test branch with a fake `sk-ant-api03-EXAMPLE...` value. Verify the push is blocked.
- Confirm the weekly workflow produces output when manually dispatched.

## References

- GitHub docs: Secret scanning for your organization
- GitHub docs: Push protection for custom patterns
- NIST SP 800-218 (SSDF) PO.5
