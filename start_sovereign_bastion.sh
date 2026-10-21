#!/usr/bin/env bash
# ==============================================================================
# SCRIPT: io.montinode/start_sovereign_bastion.sh
# EXECUTIVE AUTHORITY: JOHN CHARLES MONTI (MONTI_ANSI_F841005)
# ==============================================================================

set -euo pipefail

MONTINODE_DIR="$HOME/io.montinode"
CF_DIR="$HOME/.cloudflared"
TUNNEL_NAME="monti-node-enclave-tunnel"

echo "[+] Terminating any existing daemons..."
pkill -f cloudflared || true
pkill -f server_443.mjs || true

mkdir -p "$CF_DIR"

# 1. Ensure tunnel exists and retrieve UUID
if ! cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    cloudflared tunnel create "$TUNNEL_NAME"
fi

TUNNEL_UUID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
CRED_FILE="$CF_DIR/$TUNNEL_UUID.json"

echo "[+] Enclave Tunnel UUID: $TUNNEL_UUID"
echo "[+] Validated Credentials: $CRED_FILE"

if [ ! -f "$CRED_FILE" ]; then
    echo "[!] Error: Credentials JSON not found at $CRED_FILE"
    exit 1
fi

# 2. Write clean, non-duplicated YAML configuration
cat << EOF > "$CF_DIR/config.yml"
tunnel: $TUNNEL_UUID
credentials-file: $CRED_FILE

warp-routing:
  enabled: true

ingress:
  - hostname: gateway.0xmonti.net
    service: http://localhost:8493
    originRequest:
      noTLSVerify: false
      tlsTimeout: 10s
      connectTimeout: 10s

  - hostname: phantom.johncharlesmonti.com
    service: http://localhost:8493
    originRequest:
      noTLSVerify: false
      tlsTimeout: 10s
      connectTimeout: 10s

  - service: http_status:404
EOF

chmod 600 "$CF_DIR/config.yml"
echo "[+] config.yml secured (600)."

# 3. Register DNS routes
cloudflared tunnel route dns "$TUNNEL_UUID" gateway.0xmonti.net || true
cloudflared tunnel route dns "$TUNNEL_UUID" phantom.johncharlesmonti.com || true

# 4. Launch Node.js Sovereign Gateway Daemon
cd "$MONTINODE_DIR"
node server_443.mjs &
echo "[+] Node.js Sovereign Gateway active on port 8493."

# 5. Launch Cloudflare Tunnel with correct flag placement
cloudflared --config "$CF_DIR/config.yml" tunnel run "$TUNNEL_UUID" &
echo "[SUCCESS] The Digital Bastion Edge Tunnel is fully online."
