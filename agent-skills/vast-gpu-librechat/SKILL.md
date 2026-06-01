---
name: vast-gpu-librechat
description: Manage a local LibreChat setup connected to a Vast.ai GPU running llama.cpp with GGUF Hugging Face models. Use when reconnecting or changing Vast.ai GPUs, swapping models or quantizations, starting or verifying an SSH tunnel, restarting local LibreChat services, restoring this kit, troubleshooting the local LibreChat/Vast backend, or explaining how the setup works.
---

# Vast GPU LibreChat

## Core Pattern

Keep LibreChat local and stable. Move only the remote GPU target:

```text
LibreChat -> local 127.0.0.1:8080/v1 -> SSH tunnel -> remote 127.0.0.1:18080 -> llama.cpp
```

Read `references/setup-workflow.md` when the task needs exact commands, config paths, or restore steps.

## Expected Files

- LibreChat config: `/path/to/LibreChat/librechat.yaml`
- LibreChat environment: `/path/to/LibreChat/.env`
- Kit config template: `config/librechat.yaml`
- Kit environment template: `config/.env.example`
- Tunnel helper: `scripts/start-tunnel-template.sh`
- Remote server helper: `scripts/remote-llama-server-template.sh`

## Workflow

1. Preserve user changes. Inspect active `.env`, `librechat.yaml`, service files, and running commands before editing.
2. For a new Vast.ai GPU, keep LibreChat pointed at local `127.0.0.1:8080` when possible. Only change `VAST_HOST` and `VAST_SSH_PORT`.
3. Start or verify the remote llama.cpp server on `127.0.0.1:18080`.
4. Start or verify the local SSH tunnel from `127.0.0.1:8080` to the remote model port.
5. For a new model, update both:
   - the remote `MODEL_HF=<huggingface-repo-or-file-ref>`
   - the model name under `endpoints.custom[].models.default` in `librechat.yaml`
6. Restart LibreChat after config changes.
7. Verify before reporting success:
   - `curl http://127.0.0.1:8080/health`
   - `curl -I http://127.0.0.1:3080`
   - `curl 'http://127.0.0.1:3090/search?q=test&format=json'` when web search is enabled.

## Guardrails

- Do not publish or copy real `.env` secrets into templates.
- Do not publish SSH private keys.
- Do not expose `llama-server` publicly unless the user explicitly asks and accepts the risk.
- Prefer binding the remote model server to `127.0.0.1` and reaching it through SSH.
- If remote port `8080` is occupied on Vast.ai, use remote `18080` for llama.cpp and keep the local tunnel on `8080`.
