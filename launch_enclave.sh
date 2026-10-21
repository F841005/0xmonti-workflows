#!/usr/bin/env bash
# MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
# ==============================================================================
# SCRIPT: io.montinode/launch_enclave.sh
# EXECUTIVE AUTHORITY: JOHN CHARLES MONTI (MONTI_ANSI_F841005)
# ==============================================================================

set -euo pipefail

MONTINODE_DIR="$HOME/io.montinode"
CF_DIR="$HOME/.cloudflared"
TUNNEL_NAME="monti-node-enclave-tunnel"

echo "[+] Step 1: Stopping any active cloudflared or node daemons..."
pkill -f cloudflared || true
pkill -f server_443.mjs || true

echo "[+] Step 2: Resolving Tunnel UUID & Credentials..."
mkdir -p "$CF_DIR"

if ! cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    cloudflared tunnel create "$TUNNEL_NAME"
fi

TUNNEL_UUID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
CRED_FILE="$CF_DIR/$TUNNEL_UUID.json"

echo "[+] Tunnel UUID: $TUNNEL_UUID"
echo "[+] Credentials Path: $CRED_FILE"

if [ ! -f "$CRED_FILE" ]; then
    echo "[!] Error: Missing credentials JSON at $CRED_FILE"
    exit 1
fi

echo "[+] Step 3: Writing Strict Config File..."
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

echo "[+] Step 4: Registering DNS Routing..."
cloudflared tunnel route dns "$TUNNEL_UUID" gateway.0xmonti.net || true
cloudflared tunnel route dns "$TUNNEL_UUID" phantom.johncharlesmonti.com || true

echo "[+] Step 5: Launching Node.js Sovereign Gateway Daemon..."
cd "$MONTINODE_DIR"
node server_443.mjs &

echo "[+] Step 6: Launching Cloudflare Edge Tunnel Daemon..."
cloudflared --config "$CF_DIR/config.yml" tunnel run "$TUNNEL_UUID" &

echo "[SUCCESS] The Digital Bastion Network & io.montinode Sovereign Gateway are fully operational!"
