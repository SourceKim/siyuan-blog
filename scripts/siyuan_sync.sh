#!/usr/bin/env bash
set -euo pipefail

# 访问思源后端同步服务
# 用法：
#   scripts/siyuan_sync.sh [HOST]
# 优先级：参数 HOST > SIYUAN_SYNC_HOST > SSH_HOST
# 依赖环境变量：
#   SIYUAN_TOKEN       授权 Token（必需）
#   SIYUAN_API_PORT    端口（可选，默认 6806）

HOST="${1:-${SIYUAN_SYNC_HOST:-${SSH_HOST:-}}}"
PORT="${SIYUAN_API_PORT:-6806}"
TOKEN="${SIYUAN_TOKEN:-}"

: "${HOST:?未设置目标主机，请传参或在 .env 设置 SSH_HOST/SIYUAN_SYNC_HOST}"
: "${TOKEN:?未设置 SIYUAN_TOKEN，请在 .env 配置}"

URL="http://${HOST}:${PORT}/api/sync/performSync"

echo "[INFO] POST ${URL}"
echo "[PARAM] AUTH=Token ****** PORT=${PORT}"

curl -fsS -X POST \
  -H "Authorization: Token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"cmd":"sync"}' \
  "${URL}"

echo
echo "[OK] Sync request sent"

