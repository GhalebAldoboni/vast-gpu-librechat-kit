# Vast GPU LibreChat Kit

Run LibreChat locally while a rented Vast.ai GPU runs your GGUF model.

This is for people who want the comfort of a ChatGPT-like interface without giving up control of the model, GPU, or runtime.

## Why This Exists

LibreChat already gives you the chat UI, accounts, conversations, presets, web search hooks, and a familiar app experience.

But LibreChat does not natively manage rented SSH GPUs. If your model lives on a Vast.ai machine, you still have to handle the awkward layer yourself:

- start `llama.cpp` on the GPU
- keep the model server private
- expose an OpenAI-compatible endpoint to LibreChat
- reconnect when Vast gives you a different host or SSH port
- swap GGUF models without rebuilding your whole chat setup

This kit packages that missing layer.

## The Idea

Keep LibreChat local. Keep the GPU private. Connect them with SSH.

```text
Browser
  -> LibreChat on localhost:3080
  -> OpenAI-compatible endpoint on localhost:8080/v1
  -> SSH tunnel
  -> llama.cpp on Vast.ai localhost:18080
  -> GGUF model on GPU
```

The remote `llama-server` can stay bound to `127.0.0.1`, so it is not exposed to the public internet.

## What Is Included

- `config/librechat.yaml` - LibreChat custom endpoint config.
- `config/.env.example` - safe environment template.
- `scripts/start-tunnel-template.sh` - local SSH tunnel helper.
- `scripts/remote-llama-server-template.sh` - remote `llama-server` helper.
- `scripts/start-local-mongo.cjs` - local MongoDB launcher for non-Docker setups.
- `scripts/bing-searxng-proxy.mjs` - tiny SearXNG-compatible Bing RSS proxy for LibreChat web search.
- `launchagents/` - macOS LaunchAgent examples.
- `agent-skills/` - reusable `SKILL.md` workflow for compatible coding assistants.

## Requirements

- LibreChat installed locally.
- Node.js installed locally.
- A Vast.ai GPU instance with SSH access.
- `llama.cpp` built on the GPU server.
- A GGUF model available from Hugging Face or local GPU storage.

## Quick Start

### 1. Configure LibreChat

Copy the config:

```bash
cp config/librechat.yaml /path/to/LibreChat/librechat.yaml
```

Create the environment file:

```bash
cp config/.env.example /path/to/LibreChat/.env
```

Edit `.env` and set:

```bash
CONFIG_PATH=/path/to/LibreChat/librechat.yaml
VAST_GPU_BASE_URL=http://127.0.0.1:8080/v1
```

Generate fresh secrets for the placeholder values:

```bash
openssl rand -hex 32
```

### 2. Start The Model On Vast.ai

Copy `scripts/remote-llama-server-template.sh` to the GPU machine, then run it there:

```bash
MODEL_HF='Youssofal/Qwen3.6-35B-A3B-Abliterated-Heretic-GGUF:Q4_K_M' \
./remote-llama-server-template.sh
```

By default, the model server listens privately on the GPU:

```bash
127.0.0.1:18080
```

### 3. Start The Local SSH Tunnel

Run this on your local machine:

```bash
VAST_HOST=<vast-host-or-ip> \
VAST_SSH_PORT=<vast-ssh-port> \
SSH_KEY=~/.ssh/vast_ai_gpu_ed25519 \
./scripts/start-tunnel-template.sh
```

This maps:

```text
local 127.0.0.1:8080 -> remote 127.0.0.1:18080
```

### 4. Start LibreChat

Start LibreChat normally for your install and open:

```bash
http://127.0.0.1:3080
```

If you use the included macOS LaunchAgent examples, replace:

- `/Users/YOUR_USER`
- `YOUR_NODE_VERSION`

Then load the plists from `launchagents/`.

## Switching GPUs

Keep LibreChat pointed at:

```bash
http://127.0.0.1:8080/v1
```

When you rent a different Vast.ai machine, just reconnect the tunnel:

```bash
VAST_HOST=<new-vast-host-or-ip> \
VAST_SSH_PORT=<new-vast-ssh-port> \
./scripts/start-tunnel-template.sh
```

No LibreChat config change is needed if the local port stays `8080`.

## Switching Models

Start the remote server with a different GGUF reference:

```bash
MODEL_HF='<huggingface-repo-or-file-ref>' \
./remote-llama-server-template.sh
```

Then update your active `librechat.yaml`:

```yaml
models:
  default:
    - '<huggingface-repo-or-file-ref>'
```

Restart LibreChat after changing the config.

## Web Search

The included search proxy exposes a small SearXNG-compatible endpoint:

```bash
http://127.0.0.1:3090/search
```

`config/librechat.yaml` points LibreChat web search at:

```bash
SEARXNG_INSTANCE_URL=http://127.0.0.1:3090
```

## Agent Skill

The `agent-skills/vast-gpu-librechat` folder contains a reusable `SKILL.md` workflow for compatible coding assistants.

Use it when you want an assistant to reconnect a new Vast.ai GPU, swap a model, restart services, or troubleshoot this setup without rediscovering the whole architecture.

## Health Checks

Check the model endpoint through the tunnel:

```bash
curl http://127.0.0.1:8080/health
```

Check LibreChat:

```bash
curl -I http://127.0.0.1:3080
```

Check the search proxy:

```bash
curl 'http://127.0.0.1:3090/search?q=test&format=json'
```

## Security Notes

- Do not commit a real `.env`.
- Do not commit SSH private keys.
- Bind `llama-server` to `127.0.0.1` on the GPU.
- Access the model server through SSH instead of exposing it publicly.
- Add authentication and rate limits before any public deployment.
