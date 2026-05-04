#!/bin/bash
#
# runner-setup.sh
#
# Automated setup script for GitHub Actions self-hosted runners.
# Installs required tools, configures environment, and validates setup.
#
# Usage:
#   bash scripts/runner-setup.sh [--mac|--linux] [--quick|--full]
#
# Examples:
#   bash scripts/runner-setup.sh --mac --full     # Full setup for Mac
#   bash scripts/runner-setup.sh --linux --quick  # Quick setup for Linux
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
RUNNER_HOME="${RUNNER_HOME:-$HOME/actions-runner}"
OS_TYPE="${OS_TYPE:-}"
SETUP_MODE="${SETUP_MODE:-full}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# =========================================================================
# Helper Functions
# =========================================================================

log_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

log_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS_TYPE="mac"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS_TYPE="linux"
    else
        log_error "Unsupported OS: $OSTYPE"
        exit 1
    fi
    log_info "Detected OS: $OS_TYPE"
}

# =========================================================================
# macOS Setup
# =========================================================================

setup_mac() {
    log_section "Setting up macOS Runner"

    # Check for Homebrew
    if ! command -v brew &> /dev/null; then
        log_info "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        log_info "Homebrew already installed"
    fi

    # Update Homebrew
    log_info "Updating Homebrew..."
    brew update

    # Install required tools
    log_info "Installing required tools..."
    brew install \
        git \
        gh \
        python@3.11 \
        docker \
        --quiet || true

    # Install optional tools
    if [[ "$SETUP_MODE" == "full" ]]; then
        log_info "Installing optional tools..."
        brew install \
            node \
            ruby \
            openjdk \
            --quiet || true
    fi

    # Start Docker daemon if not running
    log_info "Checking Docker daemon..."
    if ! docker ps &> /dev/null; then
        log_info "Starting Docker Desktop..."
        open -a Docker
        sleep 10
    fi

    # Configure runner directory
    log_info "Setting up runner directory: $RUNNER_HOME"
    mkdir -p "$RUNNER_HOME"
    chmod 755 "$RUNNER_HOME"

    # Create .gitconfig for runner if needed
    if [ ! -f "$RUNNER_HOME/.gitconfig" ]; then
        log_info "Creating .gitconfig for runner..."
        git config --global user.name "github-actions-runner"
        git config --global user.email "runner@github.local"
    fi
}

# =========================================================================
# Linux Setup
# =========================================================================

setup_linux() {
    log_section "Setting up Linux Runner"

    # Detect package manager
    if command -v apt-get &> /dev/null; then
        PKG_MGR="apt-get"
        PKG_UPDATE="apt-get update"
        PKG_INSTALL="apt-get install -y"
    elif command -v yum &> /dev/null; then
        PKG_MGR="yum"
        PKG_UPDATE="yum check-update"
        PKG_INSTALL="yum install -y"
    else
        log_error "Unsupported package manager"
        exit 1
    fi

    log_info "Using package manager: $PKG_MGR"

    # Update package manager
    log_info "Updating package manager..."
    sudo $PKG_UPDATE

    # Install required tools
    log_info "Installing required tools..."
    sudo $PKG_INSTALL \
        git \
        python3 \
        python3-pip \
        curl \
        jq \
        ca-certificates

    # Install GitHub CLI
    if ! command -v gh &> /dev/null; then
        log_info "Installing GitHub CLI..."
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | \
            sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y gh
    fi

    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."
        sudo $PKG_INSTALL docker.io
        sudo usermod -aG docker $(whoami)
        sudo systemctl start docker
        sudo systemctl enable docker
    fi

    # Install optional tools
    if [[ "$SETUP_MODE" == "full" ]]; then
        log_info "Installing optional tools..."
        sudo $PKG_INSTALL \
            nodejs \
            ruby \
            openjdk-11-jdk || true
    fi

    # Configure runner directory
    log_info "Setting up runner directory: $RUNNER_HOME"
    sudo mkdir -p "$RUNNER_HOME"
    sudo chown $(whoami):$(whoami) "$RUNNER_HOME"
    chmod 755 "$RUNNER_HOME"
}

# =========================================================================
# Validation & Testing
# =========================================================================

validate_tools() {
    log_section "Validating Tool Installation"

    local required_tools=("git" "gh" "python3" "docker")
    local all_ok=true

    for tool in "${required_tools[@]}"; do
        if command -v "$tool" &> /dev/null; then
            version=$($tool --version 2>&1 | head -1)
            log_info "$tool: $version"
        else
            log_error "$tool: NOT FOUND"
            all_ok=false
        fi
    done

    if [ "$all_ok" = false ]; then
        log_error "Some required tools are missing"
        return 1
    fi
}

validate_docker() {
    log_section "Validating Docker"

    if docker ps &> /dev/null; then
        log_info "Docker daemon is running"
        docker version --format 'Client: {{.Client.Version}} | Server: {{.Server.Version}}'
    else
        log_error "Docker daemon is not running"
        return 1
    fi
}

validate_github_cli() {
    log_section "Validating GitHub CLI"

    if gh --version &> /dev/null; then
        log_info "GitHub CLI is installed"
        if gh auth status 2>&1 | grep -q "logged in"; then
            log_info "GitHub CLI is authenticated"
        else
            log_warn "GitHub CLI is not authenticated. Run: gh auth login"
        fi
    else
        log_error "GitHub CLI is not installed"
        return 1
    fi
}

validate_disk_space() {
    log_section "Checking Disk Space"

    available_gb=$(df "$RUNNER_HOME" | tail -1 | awk '{print $4}' | awk '{print int($1/1024/1024)}')
    log_info "Available disk space: ${available_gb}GB"

    if [ "$available_gb" -lt 50 ]; then
        log_warn "Low disk space available (< 50GB recommended)"
        return 1
    fi
}

# =========================================================================
# Configuration
# =========================================================================

configure_runner() {
    log_section "Configuring Runner Environment"

    # Create runner config
    mkdir -p "$RUNNER_HOME/config"

    cat > "$RUNNER_HOME/config/.env" << 'EOF'
# GitHub Actions Runner Configuration
# Generated by runner-setup.sh

# Log level (debug, info, warn, error)
ACTIONS_RUNNER_DEBUG=false

# Runner work directory
RUNNER_ALLOW_RUNASROOT=false

# Tool cache
RUNNER_TOOL_CACHE=$RUNNER_HOME/_work/_tool_cache

# Temporary directory
RUNNER_TEMP=$RUNNER_HOME/_work/_temp

# Environment
export PATH="/usr/local/bin:$PATH"
export LANG=en_US.UTF-8
export PYTHONUNBUFFERED=1
EOF

    log_info "Configuration file created: $RUNNER_HOME/config/.env"

    # Create startup script
    cat > "$RUNNER_HOME/start.sh" << 'EOF'
#!/bin/bash
set -e

cd "$HOME/actions-runner"
./run.sh
EOF

    chmod +x "$RUNNER_HOME/start.sh"
    log_info "Startup script created: $RUNNER_HOME/start.sh"
}

# =========================================================================
# Summary & Next Steps
# =========================================================================

print_summary() {
    log_section "Setup Complete"

    echo ""
    echo "✅ Runner setup completed successfully!"
    echo ""
    echo "Next Steps:"
    echo "1. Go to: https://github.com/ruralpeds/.github/settings/actions/runners"
    echo "2. Click 'Add new' > 'New self-hosted runner'"
    echo "3. Follow the registration steps"
    echo "4. Copy the generated config script and run it in $RUNNER_HOME"
    echo "5. Verify runner appears as 'Online' in GitHub settings"
    echo ""
    echo "Verify setup:"
    echo "  bash scripts/runner-setup.sh --${OS_TYPE} --validate"
    echo ""
    echo "Runner directory: $RUNNER_HOME"
    echo "Config directory: $RUNNER_HOME/config"
    echo "Startup script: $RUNNER_HOME/start.sh"
    echo ""
}

# =========================================================================
# Main Entry Point
# =========================================================================

main() {
    echo "🚀 GitHub Actions Self-Hosted Runner Setup"
    echo ""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --mac)
                OS_TYPE="mac"
                shift
                ;;
            --linux)
                OS_TYPE="linux"
                shift
                ;;
            --quick)
                SETUP_MODE="quick"
                shift
                ;;
            --full)
                SETUP_MODE="full"
                shift
                ;;
            --validate)
                SETUP_MODE="validate"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Detect OS if not specified
    if [ -z "$OS_TYPE" ]; then
        detect_os
    fi

    case "$SETUP_MODE" in
        validate)
            validate_tools && validate_docker && validate_github_cli && validate_disk_space
            echo ""
            log_info "All validations passed ✅"
            ;;
        *)
            detect_os
            if [ "$OS_TYPE" == "mac" ]; then
                setup_mac
            elif [ "$OS_TYPE" == "linux" ]; then
                setup_linux
            fi
            configure_runner
            validate_tools
            validate_docker
            print_summary
            ;;
    esac
}

main "$@"
