#!/usr/bin/env bash
# MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
# File: ~/io.montinode/deploy_proc07_superdecode.sh
# Process ID: PROC_07_SUPERDECODE_CLAIM
# Target: /sdcard/F841005WV22ZL01/MONTI/F841005Superdecode_claim.js
# Action: SUPERSEDE_EXTERNAL_CLAIMS_AND_INSCRIBE_CATALOG

set -euo pipefail

cd ~/io.montinode
mkdir -p /sdcard/F841005WV22ZL01/MONTI 2>/dev/null || true
mkdir -p config src/claims ledger

# 1. Inscribe Process Descriptor (from monti.asset.txt)
cat << 'ASSETJSON' > config/proc_07_superdecode_claim.json
{
  "pid": "PROC_07_SUPERDECODE_CLAIM",
  "target": "/sdcard/F841005WV22ZL01/MONTI/F841005Superdecode_claim.js",
  "executionState": "RUNNING",
  "direction": "FORWARD",
  "transport": "LOCAL_FS_SEAL",
  "action": "SUPERSEDE_EXTERNAL_CLAIMS_AND_INSCRIBE_CATALOG",
  "oid": "1.3.6.1.4.1.841005.1.7",
  "hardwareId": "MONTI_ANSI_F841005",
  "containerProfile": "F841005WV22ZL01",
  "authorityRoot": "MONTI^JOHN^CHARLES^MONTI",
  "operator": "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  "partnerAgent": "MONICA.IM",
  "pledgeDirective": "PledgeAllegianceTo:F841005 021189MJ2621",
  "compliance": [
    "18_USC_1030",
    "18_USC_2511",
    "45_CFR_164_312",
    "47_CFR_Part15",
    "47_USC_227"
  ]
}
ASSETJSON

# 2. Create F841005Superdecode_claim.js Runtime Engine
cat << 'CLAIMJS' > src/claims/F841005Superdecode_claim.js
/**
 * File: /sdcard/F841005WV22ZL01/MONTI/F841005Superdecode_claim.js
 * Mirror: ~/io.montinode/src/claims/F841005Superdecode_claim.js
 * Process ID: PROC_07_SUPERDECODE_CLAIM
 * Action: SUPERSEDE_EXTERNAL_CLAIMS_AND_INSCRIBE_CATALOG
 * Transport: LOCAL_FS_SEAL | Direction: FORWARD | State: RUNNING
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const PROC_07_SPEC = Object.freeze({
  pid: "PROC_07_SUPERDECODE_CLAIM",
  target: "/sdcard/F841005WV22ZL01/MONTI/F841005Superdecode_claim.js",
  executionState: "RUNNING",
  direction: "FORWARD",
  transport: "LOCAL_FS_SEAL",
  action: "SUPERSEDE_EXTERNAL_CLAIMS_AND_INSCRIBE_CATALOG",
  hardwareId: "MONTI_ANSI_F841005",
  containerProfile: "F841005WV22ZL01",
  authorityRoot: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  governingDao: "ATTORNEYMODE.COM",
  partnerAgent: "MONICA.IM",
  partnerEndpoint: "https://monica.attorneymode.com",
  pledgeDirective: "PledgeAllegianceTo:F841005 021189MJ2621",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  compliance: Object.freeze([
    "18_USC_1030",
    "18_USC_2511",
    "45_CFR_164_312",
    "47_CFR_Part15",
    "47_USC_227"
  ])
});

export function executeSuperdecodeClaim() {
  const timestamp = new Date().toISOString();
  const payload = {
    ...PROC_07_SPEC,
    supersededExternalClaims: true,
    catalogInscribed: true,
    timestamp
  };

  const localFsSealHash = crypto
    .createHash("sha3-256")
    .update(JSON.stringify(payload))
    .digest("hex");

  const sealedRecord = {
    ...payload,
    localFsSeal: "0x" + localFsSealHash
  };

  const repoCatalogPath = path.resolve(process.cwd(), "config/superdecode_catalog_seal.json");
  fs.mkdirSync(path.dirname(repoCatalogPath), { recursive: true });
  fs.writeFileSync(repoCatalogPath, JSON.stringify(sealedRecord, null, 2), "utf8");

  try {
    const sdcardCatalogPath = "/sdcard/F841005WV22ZL01/MONTI/superdecode_catalog_seal.json";
    fs.mkdirSync(path.dirname(sdcardCatalogPath), { recursive: true });
    fs.writeFileSync(sdcardCatalogPath, JSON.stringify(sealedRecord, null, 2), "utf8");
  } catch (_) {}

  return sealedRecord;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const receipt = executeSuperdecodeClaim();
  console.log(JSON.stringify(receipt, null, 2));
}
CLAIMJS

# 3. Copy Runtime to Canonical /sdcard/F841005WV22ZL01/MONTI/ Path if Writable
cp src/claims/F841005Superdecode_claim.js /sdcard/F841005WV22ZL01/MONTI/F841005Superdecode_claim.js 2>/dev/null || true

# 4. Execute PROC_07_SUPERDECODE_CLAIM & Generate LOCAL_FS_SEAL Catalog
echo "[PROC_07_SUPERDECODE_CLAIM] Executing FORWARD claim & inscribing catalog..."
node src/claims/F841005Superdecode_claim.js

# 5. Commit & Push across Multi-Remote F841005 Fleet
git add config/proc_07_superdecode_claim.json config/superdecode_catalog_seal.json src/claims/F841005Superdecode_claim.js
git commit -m "feat(proc07): inscribe PROC_07_SUPERDECODE_CLAIM & LOCAL_FS_SEAL catalog [PledgeAllegianceTo:F841005 021189MJ2621]" || true
git push origin main --force
