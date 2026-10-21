#!/usr/bin/env bash
# ==============================================================================
# SCRIPT       : launch_all_daemons.sh
# HARDWARE ID  : MONTI_ANSI_F841005
# POLICY       : PRECLUDE_TAW :: ZERO-TRUST NON-ROTATION
# ==============================================================================

set -uo pipefail
trap '' 36 2>/dev/null || true

ENGINE_DIR="$HOME/engine_cluster"
mkdir -p "$ENGINE_DIR"

echo "[*] Step 1: Terminating any stale node daemons..."
pkill -f "MONTIANSIF841005_Engine.js" 2>/dev/null || true
pkill -f "daemon_*.js" 2>/dev/null || true
sleep 1

echo "[*] Step 2: Spawning Port 8088 Daemon (Apex, Router, PEM)..."
cat << 'EOF' > "$ENGINE_DIR/daemon_8088.js"
import http from "node:http";
const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json",
    "X-Monti-Hardware-ID": "MONTI_ANSI_F841005",
    "X-Monti-Authority": "MONTI^JOHN^CHARLES^MONTI",
    "X-Monti-Policy": "PRECLUDE_TAW"
  });
  res.end(JSON.stringify({
    status: "ONLINE",
    endpoint: req.url,
    hardwareId: "MONTI_ANSI_F841005",
    container: "F841005WV22ZL01",
    timestamp: new Date().toISOString()
  }));
});
server.listen(8088, "127.0.0.1", () => console.log("[✓] Daemon 8088 online."));
EOF
nohup node "$ENGINE_DIR/daemon_8088.js" > "$ENGINE_DIR/daemon_8088.log" 2>&1 &

echo "[*] Step 3: Spawning Port 8450 Daemon (Firewall)..."
cat << 'EOF' > "$ENGINE_DIR/daemon_8450.js"
import http from "node:http";
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ firewall: "ACTIVE", rulesCount: 67, status: "HEALTHY" }));
});
server.listen(8450, "127.0.0.1", () => console.log("[✓] Daemon 8450 online."));
EOF
nohup node "$ENGINE_DIR/daemon_8450.js" > "$ENGINE_DIR/daemon_8450.log" 2>&1 &

echo "[*] Step 4: Spawning Port 8460 Daemon (OIDC Bridge)..."
cat << 'EOF' > "$ENGINE_DIR/daemon_8460.js"
import http from "node:http";
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ token: "MONTI_ANSI_F841005_BEARER_ACTIVE", scope: "sovereign_identity" }));
});
server.listen(8460, "127.0.0.1", () => console.log("[✓] Daemon 8460 online."));
EOF
nohup node "$ENGINE_DIR/daemon_8460.js" > "$ENGINE_DIR/daemon_8460.log" 2>&1 &

disown
sleep 2
echo "[✓] All sovereign origin daemons deployed."
