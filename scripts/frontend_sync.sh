#!/usr/bin/env bash
set -euo pipefail

# 本脚本通过参数接收同步所需配置，不再自行读取 .env
# 用法：
#   scripts/frontend_sync.sh SSH_HOST SSH_USER [SSH_PORT] REMOTE_WEB_ROOT [RSYNC_ARGS] [SSH_KEY] [RSYNC_SUDO]
# 示例：
#   scripts/frontend_sync.sh example.com ubuntu 22 /var/www/site "-avz --delete" ~/.ssh/id_rsa 1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 将前端 dist/ 同步到远端 Nginx 目录
# 依赖：ssh/rsync
# 用法：
#   source scripts/deploy.env && scripts/frontend_sync.sh

FE_DIR="$ROOT_DIR/siyuan-blog-frontend"
DIST_DIR="$FE_DIR/dist"

# 参数解析（必填：SSH_HOST、SSH_USER、REMOTE_WEB_ROOT；可选：SSH_PORT、RSYNC_ARGS、SSH_KEY、RSYNC_SUDO）
SSH_HOST="${1:?未设置 SSH_HOST}"
SSH_USER="${2:?未设置 SSH_USER}"
SSH_PORT="${3:-22}"
REMOTE_WEB_ROOT="${4:?未设置 REMOTE_WEB_ROOT}"
RSYNC_ARGS="${5:--avz --delete}"
SSH_KEY="${6:-}"
RSYNC_SUDO="${7:-}"

if [[ ! -d "$DIST_DIR" ]]; then
  echo "[ERR] 未找到前端产物目录: $DIST_DIR。请先执行 scripts/frontend_build.sh" >&2
  exit 1
fi

SSH_OPTS="-p $SSH_PORT"
if [[ -n "${SSH_KEY}" ]]; then
  SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
fi

# 确保远端目标目录存在（必要时使用 sudo）
if [[ -n "$RSYNC_SUDO" ]]; then
  ssh $SSH_OPTS ${SSH_USER}@${SSH_HOST} "sudo -n mkdir -p ${REMOTE_WEB_ROOT}"
else
  ssh $SSH_OPTS ${SSH_USER}@${SSH_HOST} "mkdir -p ${REMOTE_WEB_ROOT}"
fi

# 同步 dist 到远端（必要时以 sudo 执行远端 rsync）。使用数组避免引号转义问题
declare -a RSYNC_EXTRA_OPTS=()
if [[ -n "$RSYNC_SUDO" ]]; then
  RSYNC_EXTRA_OPTS+=(--rsync-path="sudo -n rsync")
fi

# shellcheck disable=SC2086
rsync $RSYNC_ARGS "${RSYNC_EXTRA_OPTS[@]}" -e "ssh $SSH_OPTS" "$DIST_DIR/" "${SSH_USER}@${SSH_HOST}:${REMOTE_WEB_ROOT}/"

echo "[OK] 前端已同步到 ${SSH_USER}@${SSH_HOST}:${REMOTE_WEB_ROOT}"
