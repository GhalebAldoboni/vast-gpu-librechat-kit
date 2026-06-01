# Vast GPU LibreChat Kit

Use a rented Vast.ai GPU for local LibreChat app.

## The Problem

LibreChat is a great ChatGPT-style interface, but it does not natively manage remote SSH GPUs. If your model is running on a Vast.ai machine, you still have to solve the messy parts yourself:

- starting `llama.cpp` on the GPU
- exposing it safely without opening the model server to the public internet
- mapping LibreChat to the remote model
- keeping the same local chat URL when you switch GPUs
- changing GGUF models without rebuilding the whole app setup

## The Solution

This repo turns the setup into a repeatable pattern:

```text
LibreChat -> local OpenAI-compatible URL -> SSH tunnel -> Vast.ai GPU -> llama.cpp
```

LibreChat stays local. The model runs on the rented GPU. The connection happens through an SSH tunnel, so the remote `llama-server` can stay bound to `127.0.0.1` instead of being exposed publicly.

Switching GPUs later becomes simple: change the Vast host and SSH port. Switching models becomes simple: change the Hugging Face GGUF reference and the model name in `librechat.yaml`.

## What You Get

- LibreChat custom endpoint config for a Vast.ai GPU backend.
- A reusable SSH tunnel script.
- A remote `llama-server` startup script.
- A sanitized `.env.example`.
- A lightweight Bing RSS search proxy compatible with LibreChat web search.
- A local MongoDB launcher for non-Docker local LibreChat setups.
- macOS LaunchAgent examples for running the local services.

## Architecture

```text
Browser
  |
  v
LibreChat on localhost:3080
  |
  v
OpenAI-compatible endpoint on localhost:8080/v1
  |
  v
SSH tunnel
  |
  v
llama.cpp server on Vast.ai localhost:18080
  |
  v
GGUF model on GPU
```

## Requirements

- A local LibreChat checkout.
- Node.js installed locally.
- A Vast.ai instance reachable by SSH.
- `llama.cpp` built on the GPU server.
- A GGUF model available through Hugging Face or local GPU storage.

## 1. Configure LibreChat

Copy the LibreChat config:

```bash
cp config/librechat.yaml /path/to/LibreChat/librechat.yaml
```

Create your `.env`:

```bash
cp config/.env.example /path/to/LibreChat/.env
```

Set this value in `.env`:

```bash
CONFIG_PATH=/path/to/LibreChat/librechat.yaml
```

Keep this value unless you change the local tunnel port:

```bash
VAST_GPU_BASE_URL=http://127.0.0.1:8080/v1
```

Generate fresh secrets for the placeholder values:

```bash
openssl rand -hex 32
```

## 2. Start llama.cpp On The GPU

Copy `scripts/remote-llama-server-template.sh` to the Vast.ai GPU, then run:

```bash
MODEL_HF='Youssofal/Qwen3.6-35B-A3B-Abliterated-Heretic-GGUF:Q4_K_M' \
./remote-llama-server-template.sh
```

By default this starts `llama-server` on the GPU at:

```bash
127.0.0.1:18080
```

## 3. Start The SSH Tunnel

On your local machine, run:

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

## 4. Start LibreChat

Start LibreChat normally for your install.

If you use the included macOS LaunchAgent examples, replace:

- `/Users/YOUR_USER`
- `YOUR_NODE_VERSION`

Then install or load the plists from `launchagents/`.

## Change GPUs Later

Keep LibreChat pointed at:

```bash
http://127.0.0.1:8080/v1
```

Then reconnect the tunnel with the new Vast.ai machine details:

```bash
VAST_HOST=<new-vast-host-or-ip> \
VAST_SSH_PORT=<new-vast-ssh-port> \
./scripts/start-tunnel-template.sh
```

No LibreChat config change is needed if the local port stays `8080`.

## Change Models Later

Start the remote server with a different Hugging Face GGUF reference:

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

Restart LibreChat after changing config.

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
- Do not expose `llama-server` publicly unless you add authentication and understand the risk.
- Prefer binding the remote model server to `127.0.0.1` and accessing it only through SSH.
