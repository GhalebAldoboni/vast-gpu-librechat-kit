# Vast GPU LibreChat Kit

Run LibreChat locally while the model runs on a rented Vast.ai GPU through an SSH tunnel. This gives you a ChatGPT-like UI with your own remote `llama.cpp` GGUF model backend.

LibreChat does not manage SSH GPUs natively. This kit provides the missing glue:

```text
LibreChat -> local OpenAI-compatible URL -> SSH tunnel -> Vast.ai GPU -> llama.cpp
```

## Included

- `config/librechat.yaml` - LibreChat custom endpoint config.
- `config/.env.example` - sanitized environment template.
- `scripts/start-tunnel-template.sh` - SSH tunnel helper.
- `scripts/remote-llama-server-template.sh` - remote `llama-server` helper.
- `scripts/start-local-mongo.cjs` - persistent local MongoDB launcher for LibreChat.
- `scripts/bing-searxng-proxy.mjs` - simple SearXNG-compatible Bing RSS proxy for LibreChat web search.
- `launchagents/` - macOS LaunchAgent examples for MongoDB, LibreChat, and the search proxy.

## Requirements

- A local LibreChat checkout.
- Node.js installed locally.
- A Vast.ai instance reachable by SSH.
- `llama.cpp` built on the GPU server.
- A GGUF model available through Hugging Face or local GPU storage.

## 1. Configure LibreChat

Copy `config/librechat.yaml` into your LibreChat checkout:

```bash
cp config/librechat.yaml /path/to/LibreChat/librechat.yaml
```

Create your `.env` from the example:

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

On the Vast.ai GPU, run:

```bash
MODEL_HF='Youssofal/Qwen3.6-35B-A3B-Abliterated-Heretic-GGUF:Q4_K_M' \
./scripts/remote-llama-server-template.sh
```

By default this starts `llama-server` on:

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

Start LibreChat normally for your install. If you use the included macOS LaunchAgent examples, replace:

- `/Users/YOUR_USER`
- `YOUR_NODE_VERSION`

Then install or load the plists from `launchagents/`.

## 5. Change Models Later

Start the remote server with a different Hugging Face GGUF reference:

```bash
MODEL_HF='<huggingface-repo-or-file-ref>' \
./scripts/remote-llama-server-template.sh
```

Then update `config/librechat.yaml` or your active LibreChat `librechat.yaml`:

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
