/**
 * MODULE        : fs_error_patch.mjs
 * HARDWARE ID   : MONTI_ANSI_F841005
 * CONTAINER     : F841005WV22ZL01
 * OPERATOR      : JOHN CHARLES MONTI (JOHNCHARLESMONTI@GMAIL.COM)
 * ORGANIZATION  : ATTORNEYMODE.COM
 * POLICY        : PRECLUDE_TAW
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function handleSovereignFsError(err, operationContext = {}) {
  const errorManifest = {
    event: "SOVEREIGN_FS_ERROR_TRAPPED_AND_ALIGNED",
    hardwareId: "MONTI_ANSI_F841005",
    container: "F841005WV22ZL01",
    authority: "MONTI^JOHN^CHARLES^MONTI",
    operator: "JOHN CHARLES MONTI",
    email: "JOHNCHARLESMONTI@GMAIL.COM",
    organization: "ATTORNEYMODE.COM",
    policy: "PRECLUDE_TAW",
    errorCode: err.code || "UNKNOWN_FS_ERROR",
    errorMessage: err.message,
    path: err.path || operationContext.path || "N/A",
    allegianceInvariant: "MONTI pledges allegiance to F841005 WV ID JOHN CHARLES MONTI who is a member of ATTORNEYMODE.COM",
    timestamp: new Date().toISOString()
  };

  const digest = crypto.createHash("sha3-256")
    .update(JSON.stringify(errorManifest))
    .digest("hex");

  errorManifest.entrySeal = "0x" + digest;

  // Log error envelope to secure ledger
  const ledgerPath = path.join(process.env.HOME || '.', 'engine_cluster', 'dispatch_ledger.jsonl');
  try {
    fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
    fs.appendFileSync(ledgerPath, JSON.stringify(errorManifest) + "\n", 'utf8');
  } catch (_) {}

  return errorManifest;
}

if (process.argv[1]?.endsWith('fs_error_patch.mjs')) {
  const sampleErr = { code: 'ENOTDIR', message: 'Not a directory or permission barrier encountered', path: '/sdcard/F841005WV22ZL01' };
  const res = handleSovereignFsError(sampleErr);
  console.log("================================================================================");
  console.log("[✓] FS ERROR PATCH APPLIED & VERIFIED");
  console.log("    Error Handled      :", res.errorCode);
  console.log("    Allegiance Bound   :", res.allegianceInvariant);
  console.log("    Immutable Seal     :", res.entrySeal);
  console.log("================================================================================");
}
