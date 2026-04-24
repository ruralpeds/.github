# Secret Scanning & Push Protection for ruralpeds

This document describes GitHub's secret scanning configuration, custom patterns, and triage procedures for the ruralpeds organization.

## Overview

**Secret scanning** automatically detects commits containing credentials, API keys, tokens, and other secrets. **Push protection** blocks commits that match detected secret patterns *before* they reach the repository, preventing accidental exposure.

Both features are enabled at the **organization level**, meaning every new repository automatically inherits the configuration. Existing repositories can enable them per-repo via their Settings.

| Feature | Scope | Status |
|---------|-------|--------|
| Secret scanning for new private repositories | Org-level | ✅ Enabled |
| Push protection | Org-level | ✅ Enabled |
| GitHub-provided patterns (AWS, GitHub, npm, etc.) | Org-level | ✅ Automatic |
| Custom patterns (Tailscale, Anthropic, WordPress) | Org-level | ✅ Applied |
| Weekly alert report | Automated workflow | ✅ Enabled (see `reusable-secret-scan-report.yml`) |

## Regulatory Drivers

- **NIST SSDF PO.5.1** — Implement supporting toolchains (secret detection is a prerequisite).
- **HIPAA §164.312(a)(2)(i)** — Unique user identification (shared secrets violate this).
- **OpenSSF Scorecard** — Token-Permissions requirement (secret exposure in repos affects score).

## How Secret Scanning Works

### Detection & Blocking

When a contributor pushes code:

1. **Pre-commit phase:** If push protection is on, GitHub scans the commit. If a secret matches any pattern (built-in or custom), the push is rejected immediately.
   - **Error message:** `push declined — secret scanning push protection`
   - **Action:** Developer must remove the secret and force-push (or amend locally and re-push).

2. **Post-merge phase:** For any secret that makes it into the repo (e.g., via historical commits or in public repos without push protection), GitHub adds an alert to the Security tab.
   - **Severity:** Critical (API key, token, signing key), High (credentials), Medium (already rotated).
   - **Alert age:** Includes when the secret was first detected and last detected.

### Built-in Patterns

GitHub provides free, always-on detection for:

- AWS access keys and secrets
- GitHub tokens and deploy keys
- Google API keys
- npm tokens
- SendGrid API keys
- Slack tokens
- Stripe API keys
- And 10+ more

See [GitHub's secret scanning patterns](https://docs.github.com/en/code-security/secret-scanning/secret-scanning-partners) for the full list.

## Custom Patterns for ruralpeds

ruralpeds adds three custom patterns for secret types not covered by GitHub's built-in detectors:

| Pattern | Regex | Push Protection | Severity | Use Case |
|---------|-------|-----------------|----------|----------|
| **Tailscale auth key** | `tskey-auth-[A-Za-z0-9]{30,}` | Enabled | Critical | Network device auth |
| **Anthropic API key** | `sk-ant-(api03\|admin01)-[A-Za-z0-9_-]{40,}` | Enabled | Critical | Claude API access |
| **WordPress app password** | `[A-Za-z0-9]{4}(?:\s[A-Za-z0-9]{4}){5}` | Disabled | High | REST API / CI access |

### Custom Pattern Details

#### Tailscale Auth Key (`tskey-auth-*`)

- **Pattern:** `tskey-auth-[A-Za-z0-9]{30,}`
- **Example:** `tskey-auth-KDN3P1iQq2R4vWxYzAb5cD6eF7gH8i9j`
- **Risk if exposed:** An attacker can authenticate as your device to the Tailscale network and access all connected devices without further auth. This is **critical**.
- **If found:** Immediately revoke the key in Tailscale admin panel and rotate. See Triage section below.

#### Anthropic API Key (`sk-ant-*`)

- **Pattern:** `sk-ant-(api03|admin01)-[A-Za-z0-9_-]{40,}`
- **Examples:**
  - `sk-ant-api03-abcdefg123456...`
  - `sk-ant-admin01-abcdefg123456...`
- **Risk if exposed:** An attacker can call the Claude API at your quota expense, or (if `admin01` key) manage org billing and user access. **Critical**.
- **If found:** Immediately revoke at [console.anthropic.com](https://console.anthropic.com) and rotate. Audit recent API calls for unauthorized usage.

#### WordPress Application Password

- **Pattern:** `[A-Za-z0-9]{4}(?:\s[A-Za-z0-9]{4}){5}`
- **Example:** `abcd efgh ijkl mnop qrst uvwx`
- **Push protection:** **Disabled** — this pattern matches many generic 4-character sequences and produces high false-positive rates.
- **Triage instead:** When an alert is created for this pattern, a human must review:
  - Is this actually a WordPress password? (look for REST API calls, Postman, CI context).
  - Is it in tests or fixtures? (document in `.gitleaksignore` if safe to ignore).
  - Is it still in use? (if yes, revoke immediately).
- **If found:** Revoke the app password in WordPress Settings → Applications → App Passwords, then generate a new one.

## Enabling & Registering Custom Patterns

Custom patterns are registered **once** at the organization level by someone with:
- GitHub Advanced Security license.
- Organization owner (`@owner` role).

### Registration Steps

1. **Via GitHub UI** (recommended for non-technical reviewers):
   - Go to Organization Settings → Code Security & Analysis → Custom patterns.
   - Click "New custom pattern."
   - Enter pattern name, description, and regex.
   - Toggle "Push protection" if desired.
   - Click "Add custom pattern."

2. **Via GitHub API** (for automation):
   ```bash
   curl -X POST \
     -H "Authorization: token <ORG_OWNER_TOKEN>" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/orgs/ruralpeds/secret-scanning/custom-patterns \
     -d '{
       "name": "Tailscale auth key",
       "description": "Tailscale authentication token (tskey-auth-XXXXXXX...)",
       "pattern": "tskey-auth-[A-Za-z0-9]{30,}",
       "push_protection_enabled": true
     }'
   ```
   See `policies/secret-scanning/custom-patterns.yaml` for full API examples.

3. **Verification:**
   - Push a test branch with a dummy matching token (e.g., `tskey-auth-EXAMPLEFAKE123456789012345`).
   - Verify push is rejected with pattern name shown.
   - Document verification in PR description.

## Triage Process

When a secret scanning alert is created (manually reviewed or from automated report):

### 1. Assess Urgency

| Level | Examples | Response Time |
|-------|----------|----------------|
| **Critical** | API key, auth token, signing key for prod | Immediate (< 1 hour) |
| **High** | Credentials for staging, non-prod service | Within 4 hours |
| **Medium** | Old credential (already rotated out) | Within 1 business day |

### 2. Investigate

- **Who pushed it?** (GitHub: commit author in alert details)
- **When?** (GitHub: "first detected" and "last detected" dates)
- **What service/account?** (context: in which repo, commit message, code review?)
- **Still in use?** (check deployed systems, CI/CD configs, application logs)

### 3. Revoke

**Tailscale:**
1. Log in to [Tailscale admin console](https://login.tailscale.com).
2. Devices → find device → revoke.
3. Generate new key if needed.

**Anthropic:**
1. Log in to [console.anthropic.com](https://console.anthropic.com).
2. Settings → API Keys.
3. Click the key → revoke.
4. Click "Create new secret key."

**WordPress:**
1. Log in to your WordPress site.
2. Settings → Applications → App Passwords.
3. Revoke the exposed password.
4. Create a new one and distribute to authorized systems only.

### 4. Rotate

Update all systems using the old credential:
- **CI/CD:** GitHub Actions secrets, external CI/CD platforms.
- **Application config:** `.env`, config files, Kubernetes secrets.
- **Documentation:** Update team wiki/runbooks with new credentials (but never commit them).

### 5. Close Alert

In GitHub (Repo → Security → Secret scanning alerts):
1. Click the alert.
2. Click "Close as…" and select:
   - **Revoked:** if you revoked the credential.
   - **Used in tests:** if it's in a test fixture and safe to ignore (document in `.gitleaksignore`).
   - **False positive:** if it's not actually a credential (update `.gitleaksignore` with justification).
3. Add a comment with details:
   ```
   Credential was revoked on [DATE] and replaced with new [ID].
   Updated in: [CI/CD platform, docs, etc.]
   Reason: accidentally committed in feature branch.
   ```

## Handling False Positives

If an alert is a false positive (e.g., a test fixture, example token, or non-credential string matching the regex), document it in `.gitleaksignore`:

```
# .gitleaksignore (at repo root)
# Format: <fingerprint> # comment describing why this is safe

# Test fixture: mock API key used in unit tests (never deployed)
12345a6b7c8d9e0f1g2h3i4j5k6l7m8n

# Example in README.md showing format (synthetic value)
87654z9y8x7w6v5u4t3s2r1q0p9o8n7m
```

Each ignore entry **must include a justification comment** above it. Gitleaks generates the fingerprint:

```bash
gitleaks detect --config .gitleaks.toml --report-path findings.json
# Then copy the `Fingerprint` field into .gitleaksignore with a comment
```

**Note:** Gitleaks fingerprints are deterministic, so the same secret at different locations has the same fingerprint. Use fingerprints to block false positives *globally* while still detecting real secrets.

## Weekly Alert Report

The `reusable-secret-scan-report.yml` workflow automatically compiles open secret scanning alerts across all org repositories.

### What It Does

- Runs weekly (Fridays at 9 AM UTC).
- Queries the GitHub API for all `state=open` secret scanning alerts.
- Groups by severity (critical, high, medium).
- Generates a markdown summary:
  - Count of open alerts by severity.
  - Top 10 newest alerts (likely mistakes in recent pushes).
  - Top 10 oldest alerts (likely rotated credentials still needing closure).
  - Links to each alert for triage.
- Uploads summary as a workflow artifact.
- Opens or updates a single tracking issue titled "Weekly secret-scan report" in `ruralpeds/.github`.

### Manual Dispatch

To run the report on-demand:

1. Go to [ruralpeds/.github Actions → Secret scanning report](https://github.com/ruralpeds/.github/actions/workflows/reusable-secret-scan-report.yml).
2. Click "Run workflow."
3. Select branch (usually `main`).
4. Click "Run workflow."

The workflow will execute and produce an artifact within 1–2 minutes.

## On-Call & Escalation

### Critical Alert (API key, active token)

**Response:** Immediate (< 1 hour)
**Actions:**
- Page on-call security engineer (`@ruralpeds/security` team).
- Revoke credential.
- Check system logs for unauthorized use.
- File incident report (issue in `dhf/incidents/`).

### High Alert (old credentials, staging tokens)

**Response:** Within business hours
**Actions:**
- Assign to the team who pushed it.
- Provide remediation steps (link to this doc).
- Track closure via the weekly report.

### Medium Alert (historical, clearly rotated)

**Response:** Within 1 week
**Actions:**
- Add to next sprint as a chore.
- Close with comment explaining rotation.

## Testing

Before deploying code with production credentials, test secret scanning locally:

### Using Gitleaks (recommended)

```bash
# Install gitleaks (macOS)
brew install gitleaks

# Scan your commits
gitleaks detect --source . --report-path findings.json

# View findings
cat findings.json | jq '.[] | {Rule: .Rule, Match: .Match, File: .File, Line: .LineNumber}'
```

### Manual Testing (against push protection)

1. Create a test branch with a dummy secret:
   ```bash
   git checkout -b test/secret-scan
   echo "tskey-auth-EXAMPLEFAKE123456789012345" > dummy.txt
   git add .
   git commit -m "test: dummy Tailscale key for push-protection test"
   ```
2. Push to a private test repo with push protection enabled:
   ```bash
   git push origin test/secret-scan
   ```
3. Expect GitHub to reject the push with:
   ```
   remote: error: push declined — secret scanning push protection
   remote: secret scanning push protection found: Tailscale auth key in the push
   ```
4. Delete the file and retry:
   ```bash
   rm dummy.txt
   git add .
   git commit --amend --no-edit
   git push origin test/secret-scan
   ```

## References

- [GitHub Secret Scanning for your organization](https://docs.github.com/en/code-security/secret-scanning/protecting-pushes-with-secret-scanning)
- [Push Protection for custom patterns](https://docs.github.com/en/code-security/secret-scanning/protecting-pushes-with-secret-scanning#about-push-protection-for-custom-patterns)
- [Custom pattern API](https://docs.github.com/en/rest/secret-scanning/custom-patterns)
- [NIST SP 800-218 (SSDF) PO.5](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218.pdf)
- [HIPAA Security Rule §164.312(a)(2)(i)](https://www.law.cornell.edu/cfr/text/45/164.312)
- [OpenSSF Scorecard: Token-Permissions](https://github.com/ossf/scorecard/blob/main/docs/checks.md#token-permissions)

---

**Last updated:** 2026-04-24  
**Owner:** `@ruralpeds/security`  
**Questions?** Open an issue or contact the security team.
