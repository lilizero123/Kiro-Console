#!/usr/bin/env bash

set -euo pipefail

# 鍙€氳繃鐜鍙橀噺瑕嗙洊杩欎簺榛樿鍊?: "${KIRO_CONSOLE_PORT:=8990}"
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

echo "[Kiro Console] 纭绯荤粺渚濊禆..."
if command_exists apt-get; then
  run_sudo apt-get update -y
  run_sudo apt-get install -y ca-certificates curl git
fi

if ! command_exists docker; then
  echo "[Kiro Console] Docker 鏈娴嬪埌锛屽紑濮嬪畨瑁?.."
  run_sudo sh -c "curl -fsSL https://get.docker.com | sh"
fi

if command_exists systemctl; then
  run_sudo systemctl enable docker >/dev/null 2>&1 || true
  run_sudo systemctl start docker >/dev/null 2>&1 || true
fi

echo "[Kiro Console] 鍑嗗閰嶇疆鐩綍 ${KIRO_CONSOLE_CONFIG_DIR}"
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

NEED_BUILD=1
if [[ "${KIRO_CONSOLE_FORCE_BUILD}" == "1" ]]; then
  echo "[Kiro Console] 宸茶缃?KIRO_CONSOLE_FORCE_BUILD=1锛岃烦杩囬暅鍍忔媺鍙栫洿鎺ョ紪璇?
else
  echo "[Kiro Console] 灏濊瘯鎷夊彇棰勬瀯寤洪暅鍍?${KIRO_CONSOLE_IMAGE}"
  if run_sudo docker pull "${KIRO_CONSOLE_IMAGE}" >/dev/null 2>&1; then
    echo "[Kiro Console] 宸茶幏鍙栭暅鍍?${KIRO_CONSOLE_IMAGE}"
    NEED_BUILD=0
  else
    echo "[Kiro Console] 鎷夊彇澶辫触锛屽洖閫€鍒版簮鐮佹瀯寤?
  fi
fi

if [[ "${NEED_BUILD}" == "1" ]]; then
  TMP_DIR="$(mktemp -d)"
  cleanup() {
    rm -rf "${TMP_DIR}"
  }
  trap cleanup EXIT

  echo "[Kiro Console] 鎷夊彇婧愮爜 ${KIRO_CONSOLE_REPO} (${KIRO_CONSOLE_BRANCH})"
  git clone --depth 1 --branch "${KIRO_CONSOLE_BRANCH}" "${KIRO_CONSOLE_REPO}" "${TMP_DIR}/repo"

  echo "[Kiro Console] 鏋勫缓 Docker 闀滃儚 ${KIRO_CONSOLE_IMAGE}"
  run_sudo docker build -t "${KIRO_CONSOLE_IMAGE}" "${TMP_DIR}/repo"
fi

if run_sudo docker ps -a --format '{{.Names}}' | grep -q "^${KIRO_CONSOLE_CONTAINER}\$"; then
  echo "[Kiro Console] 鍋滄鐜版湁瀹瑰櫒 ${KIRO_CONSOLE_CONTAINER}"
  run_sudo docker rm -f "${KIRO_CONSOLE_CONTAINER}" >/dev/null 2>&1 || true
fi

echo "[Kiro Console] 鍚姩瀹瑰櫒 ${KIRO_CONSOLE_CONTAINER}"
run_sudo docker run -d \
  --name "${KIRO_CONSOLE_CONTAINER}" \
  --restart unless-stopped \
  -p "${KIRO_CONSOLE_PORT}:8990" \
  -v "${KIRO_CONSOLE_CONFIG_DIR}:/app/config" \
  "${KIRO_CONSOLE_IMAGE}"

echo
echo "Kiro Console 宸插惎鍔紝璁块棶 http://<鏈嶅姟鍣↖P>:${KIRO_CONSOLE_PORT}/admin 瀹屾垚鍒濆鍖栥€?
echo "閰嶇疆鐩綍鎸傝浇鍦?${KIRO_CONSOLE_CONFIG_DIR}锛屼慨鏀瑰悗鍙墽琛屽悓涓€鍛戒护鑷姩閲嶅缓瀹瑰櫒銆?


