#!/usr/bin/env bash
set -euo pipefail

# 在远端主机上拉取镜像并以容器方式运行/更新（先停旧容器，再起新容器）
# 读取的环境变量（由上层 package.json 注入）：
#   SSH_HOST / SSH_USER / SSH_PORT / SSH_KEY
#   DOCKER_REGISTRY            e.g. 43.139.177.115:5000
#   BACKEND_IMAGE_REPO         e.g. kim/siyuan-blog-backend
#   BACKEND_IMAGE_TAG          e.g. latest（默认 latest）
#   BACKEND_CONTAINER_NAME     e.g. siyuan-blog-backend（默认 siyuan-blog-backend）
#   BACKEND_CONTAINER_PORT     e.g. 8000（容器内端口，默认 8000）
#   BACKEND_HOST_PORT          e.g. 8000（宿主机映射端口，默认 8000）
#   BACKEND_WORKDIR_REMOTE     e.g. /opt/siyuan-blog/backend（可选，用于持久化 data/log 等）
#   BACKEND_DOCKER_SUDO        若非空，则在远端以 sudo 执行 docker 命令
#   运行时注入的环境变量（由根 .env 提供，可选）：
#     SIYUAN_API_URL / SIYUAN_TOKEN / NODE_ENV / PORT / CORS_ORIGIN / LOG_LEVEL

SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-}"
BACKEND_IMAGE_TAG="${BACKEND_IMAGE_TAG:-latest}"
BACKEND_CONTAINER_NAME="${BACKEND_CONTAINER_NAME:-siyuan-blog-backend}"
BACKEND_CONTAINER_PORT="${BACKEND_CONTAINER_PORT:-8000}"
BACKEND_HOST_PORT="${BACKEND_HOST_PORT:-8000}"

: "${SSH_HOST:?未设置 SSH_HOST}"
: "${SSH_USER:?未设置 SSH_USER}"
: "${DOCKER_REGISTRY:?未设置 DOCKER_REGISTRY}"
: "${BACKEND_IMAGE_REPO:?未设置 BACKEND_IMAGE_REPO}"

IMAGE="${DOCKER_REGISTRY}/${BACKEND_IMAGE_REPO}:${BACKEND_IMAGE_TAG}"
# 远端拉取使用的 Registry（默认使用 127.0.0.1:5000）
BACKEND_PULL_REGISTRY="${BACKEND_PULL_REGISTRY:-127.0.0.1:5000}"
PULL_IMAGE="${BACKEND_PULL_REGISTRY}/${BACKEND_IMAGE_REPO}:${BACKEND_IMAGE_TAG}"

SSH_OPTS=( -p "$SSH_PORT" )
if [[ -n "$SSH_KEY" ]]; then
  SSH_OPTS+=( -i "$SSH_KEY" )
fi

DOCKER_CMD_PREFIX=""
if [[ -n "${BACKEND_DOCKER_SUDO:-}" ]]; then
  DOCKER_CMD_PREFIX="sudo -n "
fi

## 组装要注入到容器内的 -e 环境变量参数，并记录仅键名日志
ENV_INJECTION=""
ENV_KEYS=""
for key in SIYUAN_API_URL SIYUAN_TOKEN NODE_ENV PORT CORS_ORIGIN LOG_LEVEL; do
  val="${!key:-}"
  if [[ -n "$val" ]]; then
    # 安全转义单引号，确保远端 shell 可正确解析
    esc_val=${val//\'/\'"'"\'}
    ENV_INJECTION+=" -e ${key}='${esc_val}'"
    if [[ -z "$ENV_KEYS" ]]; then
      ENV_KEYS="$key"
    else
      ENV_KEYS+=",$key"
    fi
  fi
done

REMOTE_CMDS=(
  "set -euo pipefail"
  "echo '[REMOTE] Start deploy'"
  "echo '[PARAM] IMAGE=$IMAGE'"
  "echo '[PARAM] PULL_IMAGE=$PULL_IMAGE'"
  "echo '[PARAM] PULL_REGISTRY=${BACKEND_PULL_REGISTRY}'"
  "echo '[PARAM] CONTAINER_NAME=${BACKEND_CONTAINER_NAME}'"
  "echo '[PARAM] DOCKER_NETWORK=${BACKEND_DOCKER_NETWORK:-<none>}'"
  "echo '[PARAM] HOST_PORT=${BACKEND_HOST_PORT} CONTAINER_PORT=${BACKEND_CONTAINER_PORT}'"
  "echo '[PARAM] WORKDIR_REMOTE=${BACKEND_WORKDIR_REMOTE:-}'"
  "echo '[PARAM] DOCKER_CMD_PREFIX=${DOCKER_CMD_PREFIX:-<none>}'"
  "echo '[PARAM] ENV_KEYS=${ENV_KEYS:-<none>}'"
  "echo '[STEP] docker pull (from $PULL_IMAGE)'"
  "${DOCKER_CMD_PREFIX}docker pull $PULL_IMAGE"
  "echo '[STEP] docker tag (to $IMAGE)'"
  "${DOCKER_CMD_PREFIX}docker tag $PULL_IMAGE $IMAGE"
  "echo '[STEP] remove existing container if exists'"
  "if ${DOCKER_CMD_PREFIX}docker ps -a --format '{{.Names}}' | grep -q '^${BACKEND_CONTAINER_NAME}$'; then ${DOCKER_CMD_PREFIX}docker rm -f ${BACKEND_CONTAINER_NAME} || true; fi"
  "echo '[STEP] validate network exists if specified'"
  "if [[ -n \"${BACKEND_DOCKER_NETWORK:-}\" ]]; then if ! ${DOCKER_CMD_PREFIX}docker network ls --format '{{.Name}}' | grep -q '^${BACKEND_DOCKER_NETWORK}$'; then echo '[ERR] docker network not found: ${BACKEND_DOCKER_NETWORK}'; exit 1; fi; fi"
  "echo '[STEP] run new container'"
  "${DOCKER_CMD_PREFIX}docker run -d --name ${BACKEND_CONTAINER_NAME} \\
    -p ${BACKEND_HOST_PORT}:${BACKEND_CONTAINER_PORT} \\
    --restart=always \\
    ${BACKEND_DOCKER_NETWORK:+--network ${BACKEND_DOCKER_NETWORK}} \\
    ${ENV_INJECTION} \\
    ${BACKEND_WORKDIR_REMOTE:+-v ${BACKEND_WORKDIR_REMOTE}:/app/workdir} \\
    $IMAGE"
  "echo '[DONE] deploy finished'"
)

echo "[INFO] 远端部署 $IMAGE -> ${SSH_USER}@${SSH_HOST} (${BACKEND_CONTAINER_NAME})"
ssh "${SSH_OPTS[@]}" ${SSH_USER}@${SSH_HOST} "$(printf '%s && ' "${REMOTE_CMDS[@]}") true"

echo "[OK] 已更新容器：${BACKEND_CONTAINER_NAME:-}（镜像：${IMAGE:-}）"

