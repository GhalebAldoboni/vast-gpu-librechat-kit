# Future GPU And Model Checklist

1. Rent a GPU with enough VRAM for the quantized GGUF model.
2. Add the public key from `~/.ssh/vast_ai_gpu_ed25519.pub` to Vast.ai if needed.
3. Build or install `llama.cpp` on the GPU.
4. Start `llama-server` on remote port `18080`.
5. Start the local SSH tunnel to map local `8080` to remote `18080`.
6. Confirm `curl http://127.0.0.1:8080/health` returns `ok`.
7. Update your LibreChat `librechat.yaml` if the model name changed.
8. Restart LibreChat with `launchctl kickstart -k gui/501/com.librechat.gpu`.
9. Open `http://127.0.0.1:3080`.

Keep the local LibreChat URL and local tunnel port stable when possible. Then only the remote GPU host, SSH port, and model string need to change.
