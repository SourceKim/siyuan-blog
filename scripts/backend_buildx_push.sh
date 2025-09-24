#!/usr/bin/env bash
set -euo pipefail

# 后端镜像构建并推送到远程镜像仓库
# 依赖：docker buildx（需本机已安装并可用）
# 读取的环境变量（由上层 package.json 注入）：
#   DOCKER_REGISTRY            e.g. 43.139.177.115:5000 （不要带 http://）
#   BACKEND_IMAGE_REPO         e.g. kim/siyuan-blog-backend
#   BACKEND_IMAGE_TAG          e.g. latest（可选，默认 latest）
#   BACKEND_DOCKER_PLATFORM    e.g. linux/amd64（可选，默认 linux/amd64）
#   BACKEND_DOCKER_CONTEXT     e.g. ./siyuan-blog-backend（可选，默认 ./siyuan-blog-backend）

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

: "${DOCKER_REGISTRY:?未设置 DOCKER_REGISTRY}"
: "${BACKEND_IMAGE_REPO:?未设置 BACKEND_IMAGE_REPO}"

BACKEND_IMAGE_TAG="${BACKEND_IMAGE_TAG:-latest}"
BACKEND_DOCKER_PLATFORM="${BACKEND_DOCKER_PLATFORM:-linux/amd64}"
BACKEND_DOCKER_CONTEXT="${BACKEND_DOCKER_CONTEXT:-$ROOT_DIR/siyuan-blog-backend}"

IMAGE="${DOCKER_REGISTRY}/${BACKEND_IMAGE_REPO}:${BACKEND_IMAGE_TAG}"

echo "[INFO] 使用 buildx 构建并推送: $IMAGE (platform=$BACKEND_DOCKER_PLATFORM)"
docker buildx build \
  --platform "$BACKEND_DOCKER_PLATFORM" \
  -t "$IMAGE" \
  --push \
  "$BACKEND_DOCKER_CONTEXT"

echo "[OK] 镜像已推送: $IMAGE"

