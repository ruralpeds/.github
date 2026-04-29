# Runner Registration — Apple Silicon Self-Hosted Runners

This document describes the two manual commands required to register the org-scoped
Apple Silicon self-hosted runners for `ruralpeds`. These runners carry the
`apple-silicon` label and are used by the gap lifecycle, bootstrap sweep, and
CI gap-tools workflows.

## Prerequisites

1. **Runner registration token** — generate a fresh token from GitHub:
   - Go to **GitHub → ruralpeds org → Settings → Actions → Runners → New self-hosted runner**
   - URL: `https://github.com/organizations/ruralpeds/settings/actions/runners/new`
   - Copy the registration token shown on that page (valid for 1 hour).

2. **Runner group** — ensure a runner group named `mac-studio-medical` exists:
   - URL: `https://github.com/organizations/ruralpeds/settings/actions/runner-groups`
   - If absent, create it and set **Repository access** to **All repositories**.

3. **Script** — `scripts/setup-mac-studio-runner.sh` must be present on the machine.
   Clone the `ruralpeds/.github` repo and `cd` into it before running the commands below.

---

## Machine 1 — Mac Studio (primary org runner)

Register a runner named `mac-studio-rp-1` at org scope with the `apple-silicon` label:

```bash
./scripts/setup-mac-studio-runner.sh \
  --scope  org \
  --owner  ruralpeds \
  --name   mac-studio-rp-1 \
  --token  <REG_TOKEN> \
  --group  mac-studio-medical \
  --labels 'self-hosted,mac-studio,arm64,apple-silicon'
```

The script will:
- Download the macOS arm64 runner binary (`actions-runner-osx-arm64-<version>.tar.gz`).
- Configure the runner against `https://github.com/ruralpeds` with the supplied token.
- Install a `launchd` plist at `~/Library/LaunchAgents/com.github.actions.mac-studio-rp-1.plist`
  so the runner starts automatically on login and restarts on failure.

**Verify** the runner appears at org scope:

```bash
# Via launchctl (on the machine)
launchctl list | grep mac-studio-rp-1

# Via GitHub UI
open https://github.com/organizations/ruralpeds/settings/actions/runners
```

---

## Machine 2 — MacBook Pro (secondary org runner)

Register a runner named `macbook-pro-rp-1` at org scope with the `apple-silicon` label:

```bash
./scripts/setup-mac-studio-runner.sh \
  --scope  org \
  --owner  ruralpeds \
  --name   macbook-pro-rp-1 \
  --token  <REG_TOKEN> \
  --group  mac-studio-medical \
  --labels 'self-hosted,macbook-pro,arm64,apple-silicon'
```

The same script handles MacBook Pro hardware — just supply a distinct `--name` and the
`macbook-pro` label so workflows can target it specifically if needed.

**Verify** the runner appears at org scope:

```bash
# Via launchctl (on the machine)
launchctl list | grep macbook-pro-rp-1

# Via GitHub UI
open https://github.com/organizations/ruralpeds/settings/actions/runners
```

---

## Confirming workflows can reach the runners

After both runners are online, verify they accept jobs from the gap workflows by
triggering a dry-run sweep:

1. Navigate to **GitHub → ruralpeds/.github → Actions → Bootstrap Gaps — Org Sweep**.
2. Click **Run workflow**, set **Dry run** to `true`, leave **repo** blank.
3. Confirm the job is picked up by one of the registered runners and completes green.

---

## Notes

- Both runners join the same `mac-studio-medical` runner group with **All repositories**
  access, so every `ruralpeds/*` repo can use them.
- Labels `self-hosted` and `apple-silicon` are required; `mac-studio` / `macbook-pro`
  are optional fine-grained labels for targeting specific hardware.
- Registration tokens expire after **1 hour**. If configuration fails, generate a new
  token from the URL above and re-run the command.
- Runner logs are written to `~/actions-runners/<name>/runner.{out,err}.log`.
