#!/usr/bin/env bash

set -euo pipefail

# 可通过环境变量覆盖这些默认值
: "${KIRO_CONSOLE_PORT:=8990}"
: "${KIRO_CONSOLE_HOST:=0.0.0.0}"
: "${KIRO_CONSOLE_IMAGE:=kiro-console:latest}"
: "${KIRO_CONSOLE_CONTAINER:=kiro-console}"
: "${KIRO_CONSOLE_CONFIG_DIR:=/var/lib/kiro-console}"
: "${KIRO_CONSOLE_REPO:=https://github.com/lilizero123/Kiro-Console.git}"
: "${KIRO_CONSOLE_BRANCH:=main}"

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

echo "[Kiro Console] 确认系统依赖..."
if command_exists apt-get; then
  run_sudo apt-get update -y
  run_sudo apt-get install -y ca-certificates curl git
fi

if ! command_exists docker; then
  echo "[Kiro Console] Docker 未检测到，开始安装..."
  run_sudo sh -c "curl -fsSL https://get.docker.com | sh"
fi

if command_exists systemctl; then
  run_sudo systemctl enable docker >/dev/null 2>&1 || true
  run_sudo systemctl start docker >/dev/null 2>&1 || true
fi

echo "[Kiro Console] 准备配置目录 ${KIRO_CONSOLE_CONFIG_DIR}"
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

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

echo "[Kiro Console] 拉取源码 ${KIRO_CONSOLE_REPO} (${KIRO_CONSOLE_BRANCH})"
git clone --depth 1 --branch "${KIRO_CONSOLE_BRANCH}" "${KIRO_CONSOLE_REPO}" "${TMP_DIR}/repo"

echo "[Kiro Console] 构建 Docker 镜像 ${KIRO_CONSOLE_IMAGE}"
run_sudo docker build -t "${KIRO_CONSOLE_IMAGE}" "${TMP_DIR}/repo"

if run_sudo docker ps -a --format '{{.Names}}' | grep -q "^${KIRO_CONSOLE_CONTAINER}\$"; then
  echo "[Kiro Console] 停止现有容器 ${KIRO_CONSOLE_CONTAINER}"
  run_sudo docker rm -f "${KIRO_CONSOLE_CONTAINER}" >/dev/null 2>&1 || true
fi

echo "[Kiro Console] 启动容器 ${KIRO_CONSOLE_CONTAINER}"
run_sudo docker run -d \
  --name "${KIRO_CONSOLE_CONTAINER}" \
  --restart unless-stopped \
  -p "${KIRO_CONSOLE_PORT}:8990" \
  -v "${KIRO_CONSOLE_CONFIG_DIR}:/app/config" \
  "${KIRO_CONSOLE_IMAGE}"

echo
echo "Kiro Console 已启动，访问 http://<服务器IP>:${KIRO_CONSOLE_PORT}/admin 完成初始化。"
echo "配置目录挂载在 ${KIRO_CONSOLE_CONFIG_DIR}，修改后可执行同一命令自动重建容器。"
