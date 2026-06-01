#!/usr/bin/env bash
set -euo pipefail

: "${VAST_HOST:?Set VAST_HOST, for example the host/IP shown by Vast.ai}"
: "${VAST_SSH_PORT:?Set VAST_SSH_PORT, for example the SSH port shown by Vast.ai}"

SSH_KEY="${SSH_KEY:-$HOME/.ssh/vast_ai_gpu_ed25519}"
LOCAL_HOST="${LOCAL_HOST:-127.0.0.1}"
LOCAL_PORT="${LOCAL_PORT:-8080}"
REMOTE_HOST="${REMOTE_HOST:-127.0.0.1}"
REMOTE_MODEL_PORT="${REMOTE_MODEL_PORT:-18080}"

exec ssh \
  -i "$SSH_KEY" \
  -p "$VAST_SSH_PORT" \
  -N \
  -L "${LOCAL_HOST}:${LOCAL_PORT}:${REMOTE_HOST}:${REMOTE_MODEL_PORT}" \
  "root@${VAST_HOST}"
