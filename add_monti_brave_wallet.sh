#!/usr/bin/env bash
# MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
set -euo pipefail

cd ~/io.montinode

WALLET="0x558Bc5A144326f54b8414680E8962F7ba8F5C7a4"
LABEL="MONTI Brave Wallet"

mkdir -p config src/claims /sdcard/F841005WV22ZL01/MONTI 2>/dev/null || true

echo "[wallet] Adding ${LABEL}: ${WALLET}"

# 1. Add/update wallet registry file.
cat > config/monti_brave_wallet.json <<JSON
{
  "walletLabel": "${LABEL}",
  "walletAddress": "${WALLET}",
  "walletType": "EVM",
  "source": "Brave Wallet",
  "linkedProcess": "PROC_07_SUPERDECODE_CLAIM",
  "targetRuntime": "/sdcard/F841005WV22ZL01/MONTI/F841005Superdecode_claim.js",
  "addedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
JSON

# 2. Patch PROC_07 descriptor if present.
if [ -f config/proc_07_superdecode_claim.json ]; then
  node <<'NODE'
const fs = require("fs");
const file = "config/proc_07_superdecode_claim.json";
const wallet = "0x558Bc5A144326f54b8414680E8962F7ba8F5C7a4";

const data = JSON.parse(fs.readFileSync(file, "utf8"));
data.montiBraveWallet = wallet;
data.wallets = {
  ...(data.wallets || {}),
  montiBraveWallet: {
    label: "MONTI Brave Wallet",
    address: wallet,
    type: "EVM",
    source: "Brave Wallet"
  }
};

fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
NODE
else
  echo "[warn] config/proc_07_superdecode_claim.json not found; skipping descriptor patch."
fi

# 3. Patch F841005Superdecode_claim.js by inserting montiBraveWallet after operator if not already present.
if [ -f src/claims/F841005Superdecode_claim.js ]; then
  if ! grep -q "montiBraveWallet" src/claims/F841005Superdecode_claim.js; then
    node <<'NODE'
const fs = require("fs");
const file = "src/claims/F841005Superdecode_claim.js";
const wallet = "0x558Bc5A144326f54b8414680E8962F7ba8F5C7a4";
let s = fs.readFileSync(file, "utf8");

s = s.replace(
  /(\s*operator:\s*"[^"]+",\n)/,
  `$1  montiBraveWallet: "${wallet}",\n`
);

fs.writeFileSync(file, s);
NODE
  else
    echo "[wallet] src/claims/F841005Superdecode_claim.js already contains montiBraveWallet."
  fi

  cp src/claims/F841005Superdecode_claim.js /sdcard/F841005WV22ZL01/MONTI/F841005Superdecode_claim.js 2>/dev/null || true

  echo "[proc07] Re-running superdecode claim to regenerate LOCAL_FS_SEAL..."
  node src/claims/F841005Superdecode_claim.js
else
  echo "[warn] src/claims/F841005Superdecode_claim.js not found; skipping JS patch and seal regeneration."
fi

# 4. Commit and push.
git add config/monti_brave_wallet.json config/proc_07_superdecode_claim.json config/superdecode_catalog_seal.json src/claims/F841005Superdecode_claim.js 2>/dev/null || true

git commit -m "feat(wallet): add MONTI Brave Wallet ${WALLET} to PROC_07" || true

git push origin main --force

echo "[done] MONTI Brave Wallet added and pushed."
