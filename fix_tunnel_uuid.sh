#!/usr/bin/env bash
# ==============================================================================
# SCRIPT       : fix_tunnel_uuid.sh
# TUNNEL UUID  : 54868634-2fb3-42ef-add9-fd10b03f665a
# HARDWARE ID  : MONTI_ANSI_F841005
# ==============================================================================

set -uo pipefail
trap '' 36 2>/dev/null || true

CF_DIR="$HOME/.cloudflared"
ENGINE_DIR="$HOME/engine_cluster"
TUNNEL_UUID="54868634-2fb3-42ef-add9-fd10b03f665a"
TUNNEL_TOKEN="eyJhIjoiODcyNzg2NjYzMDcyZGRmOTJlNzMwMjRiNTJmNzQwNDgiLCJ0IjoiNTQ4Njg2MzQtMmZiMy00MmVmLWFkZDktZmQxMGIwM2Y2NjVhIiwicyI6Ik1UUXdPRFkyTkRZdFpHTXlaQzAwT1dNNExUbGtNRFF0WldFNFlUZGtOVGRrWXpJNFpEbGpOV1ZoTWpVdE1XRTBZaTAwWlRnMkxUZ3pOamN0TURsbVpUQXdZVFV5TkdVMyJ9"

echo "[*] Step 1: Rewriting Ingress Config with Correct Tunnel UUID..."
cat << EOF > "$CF_DIR/config.yml"
tunnel: ${TUNNEL_UUID}
protocol: http2

ingress:
  - hostname: 0xmonti.net
    service: http://127.0.0.1:8088
    originRequest:
      httpHostHeader: 0xmonti.net

  - hostname: router.0xmonti.net
    service: http://127.0.0.1:8088
    originRequest:
      httpHostHeader: router.0xmonti.net

  - hostname: gateway.0xmonti.net
    service: http://127.0.0.1:8440
    originRequest:
      httpHostHeader: gateway.0xmonti.net

  - hostname: firewall.0xmonti.net
    service: http://127.0.0.1:8450
    originRequest:
      httpHostHeader: firewall.0xmonti.net

  - hostname: oidc.0xmonti.net
    service: http://127.0.0.1:8460
    originRequest:
      httpHostHeader: oidc.0xmonti.net

  - hostname: pem.monti.bio
    service: http://127.0.0.1:8088
    originRequest:
      httpHostHeader: pem.monti.bio
      noTLSVerify: true

  - service: http_status:404
EOF

chmod 600 "$CF_DIR/config.yml"

echo "[*] Step 2: Restarting Cloudflare Tunnel Daemon..."
pkill -f "cloudflared" 2>/dev/null || true
sleep 1

nohup cloudflared tunnel --config "$CF_DIR/config.yml" run --token "$TUNNEL_TOKEN" > "$ENGINE_DIR/tunnel.log" 2>&1 &
disown

sleep 3

echo "[*] Step 3: Re-running Endpoint Audit..."
cd "$ENGINE_DIR"
./verify_six_endpoints.sh
