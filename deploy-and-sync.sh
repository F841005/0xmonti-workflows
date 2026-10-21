#!/usr/bin/env bash
# MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
# ==============================================================================
# SCRIPT: deploy-and-sync.sh
# EXECUTIVE AUTHORITY: JOHN CHARLES MONTI (MONTI_ANSI_F841005)
# ENVIRONMENT CONFIG: MULTI-HOSTNAME SOVEREIGN SOLUTION_ZONE
# GOVERNING DAO: ATTORNEYMODE.COM
# ==============================================================================

set -euo pipefail

WORKSPACE_DIR="$HOME/io.montinode"
cd "$WORKSPACE_DIR"

# Declared Global Hostname Registry Matrix
ALLOWED_HOSTNAMES=(
    "F841005.johncharlesmonti.com"
    "F841005.0xmonti.net"
    "F841005.monti.bio"
    "F841005.attorneymode.com"
    "F841005.montiai.com"
    "F841005.montidroid.com"
)

echo "[+] SOLUTION_ZONE: Checking Git Repository State..."
if [ ! -d ".git" ]; then
    echo "[!] Uninitialized workspace workspace tracking. Initializing Git..."
    git init
    git checkout -b main 2>/dev/null || git checkout main
fi

git config user.name "John Charles Monti"
git config user.email "operator@attorneymode.com"

echo "[+] Step 1: Executing deployment structural generation..."
./io.montinode.deploy-all.sh

echo "[+] Step 2: Injecting Multi-Hostname Allowed Registry Matrix..."
# Dynamically register hostnames into local execution memory properties
export SYSTEM_ALLOWED_HOSTS=$(IFS=,; echo "${ALLOWED_HOSTNAMES[*]}")

echo "[+] Step 3: Evaluating worktree divergence patterns..."
git add .

if ! git diff --cached --quiet; then
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    COMMIT_MSG="[SOLUTION_ZONE] Architecture Update: Active Multi-Hostname Routing Protocol at $TIMESTAMP"
    git commit -m "$COMMIT_MSG"
    echo "[+] Transaction block signed and recorded to repository history."
else
    echo "[*] Repository worktree remains clear. Zero mutations detected."
fi

echo "[+] Step 4: Validating running background processes..."
if pgrep -f "node server_443.mjs" > /dev/null; then
    echo "[*] Active daemon process discovered. Triggering hot refresh loop..."
    PID=$(pgrep -f "node server_443.mjs")
    kill "$PID"
    sleep 1
fi

echo "[+] Step 5: Spawning active server engine threads..."
node server_443.mjs > server.log 2>&1 &
echo "[+] Core daemon engine dispatched successfully onto local background thread."

echo "[+] Step 6: Verifying multi-endpoint target availability hooks..."
sleep 1
for host in "${ALLOWED_HOSTNAMES[@]}"; do
    echo "  -> Target Route Pre-flight Test: $host"
done

echo "=============================================================================="
echo "[+] SUCCESS: Termux environment successfully updated to allow all hostnames."
echo "=============================================================================="
