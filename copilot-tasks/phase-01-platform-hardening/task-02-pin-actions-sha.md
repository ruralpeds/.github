---
title: "Pin all workflow actions to 40-char SHAs"
phase: phase-01
slug: pin-actions-sha
preferred-agent: copilot
preflight-confirmation: false
estimated-complexity: s

goal: >
  Replace every `uses: owner/repo@<tag>` in `.github/workflows/**/*.yml` with
  `uses: owner/repo@<40-char-sha>  # <tag>` so supply-chain posture matches
  NIST SSDF PW.4 and OpenSSF Scorecard Pinned-Dependencies requires.

acceptance-criteria:
  - "Every `uses:` line in `.github/workflows/**/*.yml` references a 40-character commit SHA"
  - "Each pinned line has a trailing ` # <tag>` comment so Dependabot can update it"
  - "actionlint passes against all modified files"
  - "yamllint --strict passes against all modified files"
  - "A new Dependabot config entry exists for the `github-actions` ecosystem with weekly updates"
  - "grep of the workflows returns empty output (see Verification)"

files-to-touch:
  - ".github/workflows/**/*.yml"
  - ".github/dependabot.yml"

files-not-to-touch:
  - "AGENTS.md"
  - "policies/**"
  - "audit-log/**"
  - ".github/workflows/audit-log.yml"

tests-required: |
  - Run `actionlint` against every workflow touched; must output nothing.
  - Run `yamllint --strict` against every workflow touched.
  - Run the verification grep (below); must return empty.
  - Trigger a dispatch of `ci-node.yml` (or any CI) via workflow_dispatch
    on a scratch branch; must complete successfully.

standards:
  - "NIST SSDF PW.4"
  - "OpenSSF Scorecard: Pinned-Dependencies"
  - "SLSA v1.0 — build requirements"

rollback: >
  Revert the merge commit. Dependabot will continue to function with tag refs
  because it handles both forms.

labels:
  - "security"
  - "supply-chain"
  - "quick-win"

---

## Context

Actions resolved by mutable tag (`@v4`, `@main`, `@latest`) can be silently
replaced by the action maintainer. A compromised action can exfiltrate
secrets, poison builds, or inject malicious code into release artifacts.
Pinning to a 40-char commit SHA eliminates this risk; the trailing tag
comment lets Dependabot propose updates.

Current state: most workflows in this repo use tag-based pinning
(`uses: actions/checkout@v4`). This task replaces all of them.

## Approach

1. **Install and run `pin-github-action`** in an ephemeral env:
   ```bash
   npm install --global pin-github-action@1.x
   find .github/workflows -name '*.yml' -print0 | \
     xargs -0 -n1 pin-github-action --allow-empty-actions-list
   ```

2. **Verify the output.** After pinning, these commands must all return
   nothing:
   ```bash
   # No tag refs remaining
   grep -rE 'uses:\s+[^@]+@(v?[0-9]|main|master|latest|HEAD)' .github/workflows/
   # Every uses: line ends with a SHA
   grep -rE 'uses:\s+[^@]+@[a-f0-9]{40}' .github/workflows/ | \
     wc -l  # should equal total number of uses: lines
   ```

3. **Add a Dependabot config** (create or edit `.github/dependabot.yml`):

   ```yaml
   version: 2
   updates:
     - package-ecosystem: "github-actions"
       directory: "/"
       schedule:
         interval: "weekly"
         day: "monday"
         time: "06:00"
       groups:
         actions-minor-patch:
           update-types: ["minor", "patch"]
       labels:
         - "dependencies"
         - "github-actions"
       open-pull-requests-limit: 10
   ```

4. **Run `actionlint`** against every touched file. Fix any new issues the
   pin introduces (e.g., if a SHA now resolves to a version with new
   required inputs — unlikely but possible).

5. **Commit the result** with message:
   ```
   security: pin all workflow actions to SHAs

   Replaces tag-based `uses:` with commit-SHA pins; adds Dependabot config
   to keep them fresh. Closes the last Scorecard Pinned-Dependencies gap.

   Refs: #<issue>
   ```

## Verification

Paste in the PR description the output of:

```bash
echo "=== Tag refs remaining (must be 0 lines) ==="
grep -rcE 'uses:\s+[^@]+@(v?[0-9]|main|master|latest)' .github/workflows/ | \
  awk -F: '$2 > 0'
echo ""
echo "=== Total uses: lines ==="
grep -rE 'uses:\s+' .github/workflows/ | wc -l
echo ""
echo "=== SHA-pinned lines ==="
grep -rE 'uses:\s+[^@]+@[a-f0-9]{40}' .github/workflows/ | wc -l
echo ""
echo "=== actionlint ==="
actionlint
```

The first must show 0 lines. The second and third counts must match.
`actionlint` must return no errors.

## References

- [pin-github-action](https://github.com/mheap/pin-github-action)
- [Scorecard: Pinned-Dependencies](https://github.com/ossf/scorecard/blob/main/docs/checks.md#pinned-dependencies)
- [NIST SP 800-218 PW.4](https://csrc.nist.gov/pubs/sp/800/218/final)
- [GitHub Security Lab: Mitigating Attacks on GitHub Actions](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/)
