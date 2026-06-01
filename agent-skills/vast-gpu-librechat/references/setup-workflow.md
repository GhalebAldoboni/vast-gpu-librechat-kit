# Setup Workflow Reference

## Configure LibreChat

Copy the kit config into the LibreChat checkout:

```bash
cp config/librechat.yaml /path/to/LibreChat/librechat.yaml
```

Create the environment file:

```bash
cp config/.env.example /path/to/LibreChat/.env
```

Important `.env` values:

```bash
HOST=127.0.0.1
PORT=3080
MONGO_URI=mongodb://127.0.0.1:27017/LibreChat
CONFIG_PATH=/path/to/LibreChat/librechat.yaml
ENDPOINTS=custom
VAST_GPU_BASE_URL=http://127.0.0.1:8080/v1
SEARXNG_INSTANCE_URL=http://127.0.0.1:3090
```

Generate fresh secret values for placeholders:

```bash
openssl rand -hex 32
```

## Start llama.cpp On Vast.ai

Run this on the GPU after `llama.cpp` is built:

```bash
MODEL_HF='<huggingface-repo-or-file-ref>' \
./remote-llama-server-template.sh
```

Default remote endpoint:

```bash
127.0.0.1:18080
```

Default server command:

```bash
/workspace/llama.cpp/build/bin/llama-server \
  -hf "$MODEL_HF" \
  --host 127.0.0.1 \
  --port 18080 \
  -ngl 999 \
  -c 32768 \
  --jinja \
  --flash-attn on
```

## Start The SSH Tunnel

Run this locally:

```bash
VAST_HOST=<vast-host-or-ip> \
VAST_SSH_PORT=<vast-ssh-port> \
SSH_KEY=~/.ssh/vast_ai_gpu_ed25519 \
./scripts/start-tunnel-template.sh
```

The tunnel maps:

```text
local 127.0.0.1:8080 -> remote 127.0.0.1:18080
```

## Update The Model In LibreChat

In `librechat.yaml`, update:

```yaml
models:
  default:
    - '<huggingface-repo-or-file-ref>'
  fetch: false
```

Keep `fetch: false` if the OpenAI-compatible backend does not provide a useful models list.

## Health Checks

Model endpoint:

```bash
curl http://127.0.0.1:8080/health
```

LibreChat:

```bash
curl -I http://127.0.0.1:3080
```

Search proxy:

```bash
curl 'http://127.0.0.1:3090/search?q=test&format=json'
```

## Service Notes

For macOS LaunchAgent usage, copy examples from `launchagents/` and replace:

- `/Users/YOUR_USER`
- `YOUR_NODE_VERSION`

Restart labels if using the included examples:

```bash
launchctl kickstart -k gui/$(id -u)/com.librechat.localmongo
launchctl kickstart -k gui/$(id -u)/com.librechat.searchproxy
launchctl kickstart -k gui/$(id -u)/com.librechat.gpu
```
