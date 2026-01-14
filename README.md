# Kiro Console

Kiro Console 是对 `kiro.rs` 的可视化增强版：后端延续 Anthropic API 兼容代理能力，前端提供账号池管理面板，可在浏览器中批量导入/禁用/删除 Claude 凭据、查看额度进度条，并一键设置管理员密钥和对外 API Key。配合一键 Docker 脚本或预构建镜像，即可实现“拉起即用”的部署体验。

## 目录
- [特性亮点](#特性亮点)
- [架构概览](#架构概览)
- [开发环境快速开始](#开发环境快速开始)
- [部署方式](#部署方式)
  - [Docker 一键部署](#docker-一键部署)
  - [手动运行二进制](#手动运行二进制)
- [Admin Console 使用流程](#admin-console-使用流程)
- [配置说明](#配置说明)
- [API 兼容性](#api-兼容性)
- [常见问题](#常见问题)
- [免责声明](#免责声明)

## 特性亮点
- **可视化账号池**：仪表盘可查看凭据总数/可用数量/活跃 ID，支持批量导入 refresh token、禁用、删除及查询额度。
- **统一 API Key 管理**：首次访问 `/admin` 要求设置管理员密钥，之后可在设置面板中随时修改管理员密钥和对外 API Key。
- **多凭据 + 故障转移**：支持单/多凭据文件，按 `priority` 排序自动切换，刷新后的 token 会回写 `credentials.json`。
- **Anthropic 兼容层**：完全兼容 `/v1/messages`、`/v1/models`、`/v1/messages/count_tokens`，包含 SSE 流式响应、thinking mode、tool use。
- **智能重试**：单凭据最多重试 3 次、单请求最多重试 9 次，自动识别配额错误并禁用失效凭据。
- **一键 Docker**：脚本先尝试拉取预构建镜像，失败时再自动克隆源码并构建，减少用户等待时间。

## 架构概览
```
React Admin Console (Vite)
  ├─ 登录/初始化
  ├─ 批量导入凭据
  └─ 额度进度条 & 状态提示
          │ Admin API (HTTPS)
Rust Backend (Axum)
  ├─ Anthropic 兼容路由
  ├─ MultiTokenManager
  ├─ SettingsManager
  └─ 额度查询/回写/禁用
          │ HTTP/HTTPS
上游 Kiro / Anthropic 服务
```

## 开发环境快速开始
1. 安装依赖：Rust 1.72+、Node.js 18+（npm/pnpm）、Docker 24+（可选）。
2. 构建 Admin UI
   ```bash
   cd admin-ui
   npm install
   npm run build
   ```
3. 构建后端
   ```bash
   cargo build --release
   ```
4. 运行
   ```bash
   ./target/release/kiro-console -c config.json --credentials credentials.json
   ```

## 部署方式
### Docker 一键部署
```bash
curl -H 'Cache-Control: no-cache' -fsSL https://raw.githubusercontent.com/lilizero123/Kiro-Console/master/tools/docker/oneclick.sh \
  | sed 's/\r$//' \
  | sudo bash
```
脚本会自动：
1. 安装缺失的 Docker / Git（Ubuntu 环境）。
2. 优先执行 `docker pull ${KIRO_CONSOLE_IMAGE}`（默认 `kiro-console:latest`）。若拉取失败，再克隆 `master` 分支源码并构建。
3. 在 `/var/lib/kiro-console` 写入 `config.json` 与 `credentials.json`（若不存在）。
4. 以 `kiro-console` 为容器名运行 `docker run -d -p 8990:8990 -v /var/lib/kiro-console:/app/config`。

环境变量：

| 变量 | 说明 | 默认 |
|------|------|------|
| `KIRO_CONSOLE_PORT` | 宿主机暴露端口 | `8990` |
| `KIRO_CONSOLE_IMAGE` | 使用/构建的镜像标签 | `kiro-console:latest` |
| `KIRO_CONSOLE_CONTAINER` | 容器名称 | `kiro-console` |
| `KIRO_CONSOLE_CONFIG_DIR` | 配置挂载目录 | `/var/lib/kiro-console` |
| `KIRO_CONSOLE_REPO` | Git 仓库 | `https://github.com/lilizero123/Kiro-Console.git` |
| `KIRO_CONSOLE_BRANCH` | 拉取分支 | `master` |
| `KIRO_CONSOLE_FORCE_BUILD` | 设为 `1` 跳过拉取、强制本地构建 | `0` |

示例：
```bash
curl -fsSL https://raw.githubusercontent.com/lilizero123/Kiro-Console/master/tools/docker/oneclick.sh \
  | sudo env KIRO_CONSOLE_PORT=8080 bash
```

> 可在 CI 或本地执行 `docker build -t <your-registry>/kiro-console:<tag> . && docker push ...` 发布镜像，用户即可直接拉取免编译。

### 手动运行二进制
```bash
docker build -t kiro-console .
mkdir -p /opt/kiro-console
cp config.example.json /opt/kiro-console/config.json
cp credentials.example.multiple.json /opt/kiro-console/credentials.json

docker run -d \
  --name kiro-console \
  --restart unless-stopped \
  -p 8990:8990 \
  -v /opt/kiro-console:/app/config \
  kiro-console:latest
```

## Admin Console 使用流程
1. 首次访问 `/admin`，按照向导设置管理员密钥和（可选）对外 API Key。
2. 仪表盘显示凭据总数、可用数量、活跃 ID，可切换暗色模式、刷新列表、退出登录。
3. 添加凭据支持单条输入或批量导入（social / idc / builder-id），可设置优先级。
4. 在凭据卡片中可查询额度（以进度条展示）、禁用、删除、调整优先级。
5. 设置面板可随时修改对外 API Key 和管理员密钥。

## 配置说明
- `config.json`：包含 `host`、`port`、`apiKey`、`region`、`kiroVersion`、`machineId`、`proxy*`、`countTokens*` 等字段。
- `credentials.json`：支持单对象或数组；数组时按 `priority` 升序轮询，字段包括 `refreshToken`、`expiresAt`、`authMethod`、`clientId`/`clientSecret`、`region`，刷新成功会自动回写。

## API 兼容性
```bash
curl http://127.0.0.1:8990/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk-your-api-key" \
  -d '{
        "model": "claude-3-sonnet-20250219",
        "max_tokens": 1024,
        "messages": [
          {"role": "user", "content": "Hello"}
        ],
        "stream": true,
        "thinking": {"type": "enabled", "budget_tokens": 4096}
      }'
```

## 常见问题
| 问题 | 解决方式 |
|------|----------|
| 脚本 404 | 确认使用 `master` 链接。|
| Admin UI 提示未初始化 | 检查 `settings.json` 是否可写，或使用 `--reset-admin-key` 重新初始化。|
| API 401 | 确认 `config.json` 的 `apiKey` 与请求 Header 一致，并在 UI 中已设置。|
| 额度查询失败 | 账号可能失效，重新导入 token 或禁用该账号。|
| 端口冲突 | 设置 `KIRO_CONSOLE_PORT=<新端口>` 后重跑脚本。|
| 容器报 “加载配置失败：EOF while parsing a value” | 说明 `/var/lib/kiro-console/config.json` 被清空。执行 `sudo docker rm -f kiro-console && sudo rm -f /var/lib/kiro-console/config.json` 后，再运行上面的“一键命令”即可自动重建配置。|

## 免责声明
本项目仅供研究学习使用，与 AWS/KIRO/Anthropic/Claude 等官方无关，使用者需自行承担部署与调用造成的所有风险。
