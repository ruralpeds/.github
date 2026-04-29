# Self-Hosted Runner Registration — ruralpeds Org

This document describes the two manual commands required to register
Apple Silicon runners at org scope so that workflows using
`runs-on: [self-hosted, apple-silicon]` can queue successfully.

Copilot/agents cannot execute commands on physical Mac hardware.
A human with admin access to the Mac Studio and MacBook Pro must run
the commands below exactly once per machine (or after a runner is
de-registered).

---

## Prerequisites

1. **Admin access** to the `ruralpeds` GitHub organisation
   (Settings → Actions → Runners).
2. **Registration token** — generate a fresh one at:
   <https://github.com/organizations/ruralpeds/settings/actions/runners/new>
   Tokens expire after one hour.
3. **Homebrew** installed at `/opt/homebrew` on each Mac.
4. The `scripts/setup-mac-studio-runner.sh` script checked out from this
   repo (`ruralpeds/.github`).

---

## 1. Mac Studio (primary org runner)

Run the following on the Mac Studio:

```bash
cd /path/to/ruralpeds/.github   # wherever you cloned this repo

bash scripts/setup-mac-studio-runner.sh \
  --scope  org \
  --owner  ruralpeds \
  --name   mac-studio-rp-1 \
  --token  <REG_TOKEN> \
  --group  mac-studio-medical \
  --labels "self-hosted,mac-studio,arm64,apple-silicon"
```

Replace `<REG_TOKEN>` with the registration token from the URL above.

### What this does

- Downloads the GitHub Actions runner binary for `osx-arm64`.
- Registers the runner at `https://github.com/ruralpeds` with the
  `apple-silicon` label (plus `self-hosted`, `mac-studio`, `arm64`).
- Places the runner in the `mac-studio-medical` runner group.
- Installs and loads a `launchd` plist so the runner starts on login.

### Verify

```bash
# On the Mac:
launchctl list | grep mac-studio-rp-1

# In GitHub UI:
# https://github.com/organizations/ruralpeds/settings/actions/runners
# Expect status: "Idle" or "Active"
```

### Post-registration (one-time in GitHub UI)

1. Browse to
   <https://github.com/organizations/ruralpeds/settings/actions/runner-groups>.
2. Open group **mac-studio-medical**.
3. Set **Repository access** to **All repositories** (or a specific
   allowlist).
4. Optionally restrict to specific workflow files.

---

## 2. MacBook Pro (secondary org runner)

Run the following on the MacBook Pro:

```bash
cd /path/to/ruralpeds/.github

bash scripts/setup-mac-studio-runner.sh \
  --scope  org \
  --owner  ruralpeds \
  --name   macbook-pro-rp-1 \
  --token  <REG_TOKEN> \
  --group  mac-studio-medical \
  --labels "self-hosted,macbook-pro,arm64,apple-silicon"
```

The MacBook Pro runner joins the same `mac-studio-medical` group and
also carries the `apple-silicon` label, so it will pick up jobs from
any workflow that targets `[self-hosted, apple-silicon]`.

### Verify

```bash
launchctl list | grep macbook-pro-rp-1
```

In the GitHub UI both runners should appear at
<https://github.com/organizations/ruralpeds/settings/actions/runners>.

---

## Labels used by gap-lifecycle workflows

| Workflow | `runs-on` label(s) |
|---|---|
| `reusable-gap-lifecycle.yml` | `self-hosted, apple-silicon` |
| `bootstrap-gaps-sweep.yml` | `self-hosted, apple-silicon` |
| `ci-gap-tools.yml` | `self-hosted, apple-silicon` |

Both registered runners satisfy the `apple-silicon` label, so jobs
will be dispatched to whichever runner is idle first.

---

## Re-registration

If a runner is de-registered (e.g. after a macOS upgrade), re-run the
same command with a new `--token`. The `--replace` flag in the script
will overwrite the existing registration without manual cleanup.
