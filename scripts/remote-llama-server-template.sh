#!/usr/bin/env bash
set -euo pipefail

# Run this on the Vast.ai GPU after llama.cpp is built.
MODEL_HF="${MODEL_HF:-Youssofal/Qwen3.6-35B-A3B-Abliterated-Heretic-GGUF:Q4_K_M}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-18080}"
CTX_SIZE="${CTX_SIZE:-32768}"

exec /workspace/llama.cpp/build/bin/llama-server \
  -hf "$MODEL_HF" \
  --host "$HOST" \
  --port "$PORT" \
  -ngl 999 \
  -c "$CTX_SIZE" \
  --jinja \
  --flash-attn on
