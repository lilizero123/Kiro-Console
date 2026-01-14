#!/usr/bin/env bash

set -euo pipefail

# Allow environment overrides for advanced users
: "${KIRO_CONSOLE_PORT:=8990}"
: "${KIRO_CONSOLE_HOST:=0.0.0.0}"
: "${KIRO_CONSOLE_IMAGE:=kiro-console:latest}"
: "${KIRO_CONSOLE_CONTAINER:=kiro-console}"
: "${KIRO_CONSOLE_CONFIG_DIR:=/var/lib/kiro-console}"
: "${KIRO_CONSOLE_REPO:=https://github.com/lilizero123/Kiro-Console.git}"
: "${KIRO_CONSOLE_BRANCH:=master}"
: "${KIRO_CONSOLE_FORCE_BUILD:=0}"

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

run_sudo() {
  if [ "$(id -u)" -eq 0 ]; then
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
  info "Preparing config directory ${KIRO_CONSOLE_CONFIG_DIR}"
  run_sudo mkdir -p "${KIRO_CONSOLE_CONFIG_DIR}"

  CONFIG_FILE="${KIRO_CONSOLE_CONFIG_DIR}/config.json"
  CREDENTIALS_FILE="${KIRO_CONSOLE_CONFIG_DIR}/credentials.json"

  if [ ! -f "${CONFIG_FILE}" ]; then
    cat <<EOF | run_sudo tee "${CONFIG_FILE}" >/dev/null
{
  "host": "${KIRO_CONSOLE_HOST}",
  "port": ${KIRO_CONSOLE_PORT},
  "apiKey": "sk-kiro-console-qazWSXedcRFV123456",
  "region": "us-east-1"
}
EOF
  fi

  if [ ! -f "${CREDENTIALS_FILE}" ]; then
    echo "[]" | run_sudo tee "${CREDENTIALS_FILE}" >/dev/null
  fi
}

build_or_pull_image() {
  NEED_BUILD=1

  if [[ "${KIRO_CONSOLE_FORCE_BUILD}" == "1" ]]; then
    info "KIRO_CONSOLE_FORCE_BUILD=1, skip pull and force source build"
  else
    info "Trying to pull prebuilt image ${KIRO_CONSOLE_IMAGE}"
    if run_sudo docker pull "${KIRO_CONSOLE_IMAGE}" >/dev/null 2>&1; then
      info "Image ${KIRO_CONSOLE_IMAGE} pulled successfully"
      NEED_BUILD=0
    else
      info "Image pull failed, falling back to local build"
    fi
  fi

  if [[ "${NEED_BUILD}" == "1" ]]; then
    TMP_DIR="$(mktemp -d)"
    cleanup() {
      rm -rf "${TMP_DIR}"
    }
    trap cleanup EXIT

    info "Cloning ${KIRO_CONSOLE_REPO} (${KIRO_CONSOLE_BRANCH})"
    git clone --depth 1 --branch "${KIRO_CONSOLE_BRANCH}" "${KIRO_CONSOLE_REPO}" "${TMP_DIR}/repo"

    info "Building Docker image ${KIRO_CONSOLE_IMAGE}"
    run_sudo docker build -t "${KIRO_CONSOLE_IMAGE}" "${TMP_DIR}/repo"
  fi
}

run_container() {
  if run_sudo docker ps -a --format '{{.Names}}' | grep -q "^${KIRO_CONSOLE_CONTAINER}$"; then
    info "Removing existing container ${KIRO_CONSOLE_CONTAINER}"
    run_sudo docker rm -f "${KIRO_CONSOLE_CONTAINER}" >/dev/null 2>&1 || true
  fi

  info "Starting container ${KIRO_CONSOLE_CONTAINER}"
  run_sudo docker run -d \
    --name "${KIRO_CONSOLE_CONTAINER}" \
    --restart unless-stopped \
    -p "${KIRO_CONSOLE_PORT}:8990" \
    -v "${KIRO_CONSOLE_CONFIG_DIR}:/app/config" \
    "${KIRO_CONSOLE_IMAGE}"

  cat <<EON

------------------------------------------------------------------
Kiro Console is running.
Open   : http://<server-ip>:${KIRO_CONSOLE_PORT}/admin
Config : ${KIRO_CONSOLE_CONFIG_DIR}
Re-run this script to rebuild and restart at any time.
------------------------------------------------------------------
EON
}

ensure_base_packages
ensure_docker
prepare_config
build_or_pull_image
run_container
