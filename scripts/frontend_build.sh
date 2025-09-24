#!/usr/bin/env bash
set -euo pipefail

# 前端本地构建（仅 yarn）
# 用法：
#   yarn ci build  (从仓库根目录执行)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FE_DIR="$ROOT_DIR/siyuan-blog-frontend"

if [[ ! -d "$FE_DIR" ]]; then
  echo "[ERR] 前端目录不存在: $FE_DIR" >&2
  exit 1
fi

cd "$FE_DIR"

yarn install --frozen-lockfile

yarn build

echo "[OK] 构建完成，产物目录：$FE_DIR/dist"
