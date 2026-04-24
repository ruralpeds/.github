#!/usr/bin/env bash
# setup-mac-studio-runner.sh
# Bootstrap a self-hosted GitHub Actions runner on Apple Silicon Mac Studio.
#
# Since ruralpeds is an org, the recommended pattern is:
#   - Register ONE runner at ORG scope for ruralpeds
#   - Put it in a named runner group (e.g., "mac-studio-medical")
#   - Grant that group access to all repos in ruralpeds
#   - Optionally register a second runner at USER scope for timothyhartzog/*
#     personal repos (or migrate those to the org)
#
# Prereqs:
#   - macOS on Apple Silicon (M1/M2/M3)
#   - Homebrew installed at /opt/homebrew
#   - Runner registration token from GitHub:
#       Org:  https://github.com/organizations/ruralpeds/settings/actions/runners/new
#       User: https://github.com/settings/actions/runners/new
#
# Usage:
#   # Primary runner — ruralpeds org
#   ./setup-mac-studio-runner.sh \
#        --scope org \
#        --owner ruralpeds \
#        --name  mac-studio-rp-1 \
#        --token <REG_TOKEN> \
#        --group mac-studio-medical \
#        --labels 'self-hosted,mac-studio,arm64,medical'
#
#   # Secondary runner — personal repos
#   ./setup-mac-studio-runner.sh \
#        --scope user \
#        --owner timothyhartzog \
#        --name  mac-studio-th-1 \
#        --token <REG_TOKEN> \
#        --labels 'self-hosted,mac-studio,arm64'

set -euo pipefail

SCOPE=""; OWNER=""; REPO=""; GROUP=""
NAME="mac-studio-$(date +%s)"
TOKEN=""
LABELS="self-hosted,mac-studio,arm64"
WORK="_work"
RUNNER_VERSION="2.319.1"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope)   SCOPE="$2";  shift 2;;
    --owner)   OWNER="$2";  shift 2;;
    --repo)    REPO="$2";   shift 2;;
    --group)   GROUP="$2";  shift 2;;
    --name)    NAME="$2";   shift 2;;
    --token)   TOKEN="$2";  shift 2;;
    --labels)  LABELS="$2"; shift 2;;
    --version) RUNNER_VERSION="$2"; shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 2;;
  esac
done

[[ -z "$SCOPE" ]] && { echo "--scope required (user|org|repo)" >&2; exit 2; }
[[ -z "$OWNER" ]] && { echo "--owner required"                 >&2; exit 2; }
[[ -z "$TOKEN" ]] && { echo "--token required"                 >&2; exit 2; }
[[ "$SCOPE" == "repo" && -z "$REPO" ]] && { echo "--repo required when --scope=repo" >&2; exit 2; }
[[ "$SCOPE" != "org"  && -n "$GROUP" ]] && { echo "--group only valid with --scope=org" >&2; exit 2; }

case "$SCOPE" in
  user|org) URL="https://github.com/${OWNER}" ;;
  repo)     URL="https://github.com/${OWNER}/${REPO}" ;;
  *) echo "--scope must be user|org|repo" >&2; exit 2;;
esac

BASE="${HOME}/actions-runners/${NAME}"
mkdir -p "$BASE" && cd "$BASE"

ARCHIVE="actions-runner-osx-arm64-${RUNNER_VERSION}.tar.gz"
if [[ ! -f "$ARCHIVE" ]]; then
  echo "==> Downloading runner ${RUNNER_VERSION}"
  curl -o "$ARCHIVE" -L \
    "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${ARCHIVE}"
  tar xzf "$ARCHIVE"
fi

if [[ ! -f .runner ]]; then
  echo "==> Configuring runner ${NAME} at ${URL}"
  CONFIG_ARGS=(
    --unattended
    --url    "$URL"
    --token  "$TOKEN"
    --name   "$NAME"
    --labels "$LABELS"
    --work   "$WORK"
    --replace
  )
  [[ -n "$GROUP" ]] && CONFIG_ARGS+=(--runnergroup "$GROUP")
  ./config.sh "${CONFIG_ARGS[@]}"
fi

PLIST="${HOME}/Library/LaunchAgents/com.github.actions.${NAME}.plist"
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>          <string>com.github.actions.${NAME}</string>
    <key>ProgramArguments</key>
    <array>
      <string>${BASE}/run.sh</string>
    </array>
    <key>WorkingDirectory</key><string>${BASE}</string>
    <key>RunAtLoad</key>      <true/>
    <key>KeepAlive</key>      <true/>
    <key>StandardOutPath</key><string>${BASE}/runner.out.log</string>
    <key>StandardErrorPath</key><string>${BASE}/runner.err.log</string>
    <key>EnvironmentVariables</key>
    <dict>
      <key>PATH</key>
      <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
      <key>HOMEBREW_PREFIX</key><string>/opt/homebrew</string>
      <key>LANG</key><string>en_US.UTF-8</string>
    </dict>
    <key>ProcessType</key><string>Interactive</string>
    <key>Nice</key>       <integer>1</integer>
  </dict>
</plist>
EOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load   "$PLIST"

echo
echo "==> Runner ${NAME} installed."
echo "    Scope:  ${SCOPE}"
echo "    Target: ${URL}"
[[ -n "$GROUP" ]] && echo "    Group:  ${GROUP}"
echo "    Path:   ${BASE}"
echo "    Plist:  ${PLIST}"
echo "    Status: launchctl list | grep ${NAME}"
echo "    Logs:   ${BASE}/runner.{out,err}.log"

if [[ "$SCOPE" == "org" && -n "$GROUP" ]]; then
  echo
  echo "==> Next steps for org runner group:"
  echo "    1. https://github.com/organizations/${OWNER}/settings/actions/runner-groups"
  echo "    2. Open group '${GROUP}'"
  echo "    3. Set 'Repository access' to 'All repositories' (or selected)"
  echo "    4. Optionally restrict to specific workflows"
fi
