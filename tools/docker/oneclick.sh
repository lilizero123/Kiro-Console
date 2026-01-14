#!/usr/bin/env bash

set -euo pipefail

# Allow environment overrides for advanced users
: ""
: ""
: ""
: ""
: ""
: ""
: ""
: ""

command_exists() {
  command -v "" >/dev/null 2>&1
}

run_sudo() {
  if [ "197609" -eq 0 ]; then
    "$@"
  else
    sudo "$@"
  fi
}

info() {
  printf '[Kiro Console] %s\n' "$*"
}

ensure_base_packages() {
  if command_exists apt-get; then
    info "Updating apt cache and installing curl/git/ca-certificates"
    run_sudo apt-get update -y
    run_sudo apt-get install -y ca-certificates curl git
  fi
}

ensure_docker() {
  if ! command_exists docker; then
    info "Docker not found, installing via get.docker.com"
    run_sudo sh -c "curl -fsSL https://get.docker.com | sh"
  fi

  if command_exists systemctl; then
    run_sudo systemctl enable docker >/dev/null 2>&1 || true
    run_sudo systemctl start docker >/dev/null 2>&1 || true
  fi
}

prepare_config() {
  info "Preparing config directory "
  run_sudo mkdir -p ""

  CONFIG_FILE="/config.json"
  CREDENTIALS_FILE="/credentials.json"

  if [ ! -f "" ]; then
    cat <<EOF | run_sudo tee "" >/dev/null
{
  "host": "",
  "port": ,
  "apiKey": "sk-kiro-console-qazWSXedcRFV123456",
  "region": "us-east-1"
}
EOF
  fi

  if [ ! -f "" ]; then
    echo "[]" | run_sudo tee "" >/dev/null
  fi
}

build_or_pull_image() {
  NEED_BUILD=1

  if [[ "" == "1" ]]; then
    info "KIRO_CONSOLE_FORCE_BUILD=1, skip pull and force source build"
  else
    info "Trying to pull prebuilt image "
    if run_sudo docker pull "" >/dev/null 2>&1; then
      info "Image  pulled successfully"
      NEED_BUILD=0
    else
      info "Image pull failed, falling back to local build"
    fi
  fi

  if [[ "" == "1" ]]; then
    TMP_DIR="/tmp/tmp.TXgcdV54At"
    cleanup() {
      rm -rf ""
    }
    trap cleanup EXIT

    info "Cloning  ()"
    git clone --depth 1 --branch "" "" "/repo"

    info "Building Docker image "
    run_sudo docker build -t "" "/repo"
  fi
}

run_container() {
  if run_sudo docker ps -a --format '{{.Names}}' | grep -q "^$"; then
    info "Removing existing container "
    run_sudo docker rm -f "" >/dev/null 2>&1 || true
  fi

  info "Starting container "
  run_sudo docker run -d \
    --name "" \
    --restart unless-stopped \
    -p ":8990" \
    -v ":/app/config" \
    ""

  cat <<EON

------------------------------------------------------------------
Kiro Console is running.
Open   : http://<server-ip>:/admin
Config : 
Re-run this script to rebuild and restart at any time.
------------------------------------------------------------------
EON
}

ensure_base_packages
ensure_docker
prepare_config
build_or_pull_image
run_container
