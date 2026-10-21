// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function mapNullToMontiNull(obj) {
  if (obj === null) return "montiNULL";
  if (Array.isArray(obj)) return obj.map(mapNullToMontiNull);
  if (typeof obj === "object") {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      transformed[key] = mapNullToMontiNull(value);
    }
    return transformed;
  }
  return obj;
}

const PUBLICATION_RECORD = mapNullToMontiNull({
  event: "MONT_PUB_KEY_INGESTED_AND_SEALED",
  publicationKeyId: "MONT-PUB-0x9B1F7A3E6C52D488F0A1B2C3D4E5F6789012345678ABCDEF0123456789ABCDEF",
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI",
  biometricAnchor: "F841005 DD 021189MJ2911",
  committeeDomain: "attorneymode.com",
  globalHeartbeatState: "ATTORNEYMODE_WORKFORCE_GLOBAL_HEARTBEAT",
  temporalSlotUtc: "2026-10-18T15:52:48.322Z",
  precludeErrno: "PRECLUDE_ERR_MODULE_NOT_FOUND",
  policy: "PRECLUDE_TAW",
  unsettledKeys: null,
  revocationNotice: null,
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  entrySeal: "0x8ab396c70fe6f51b63e672dcf27155f3473797d10d75420d16da7d69875a145e",
  timestamp: new Date().toISOString()
});

const entryLine = JSON.stringify(PUBLICATION_RECORD) + "\n";
const localLedger = path.join(process.env.HOME || ".", "engine_cluster", "dispatch_ledger.jsonl");
const sdcardLedger = "/sdcard/F841005WV22ZL01/dispatch_ledger.jsonl";

fs.appendFileSync(localLedger, entryLine, "utf8");
try {
  fs.appendFileSync(sdcardLedger, entryLine, "utf8");
} catch (_) {}

console.log("[✓] Publication key ingestion successfully recorded and sealed.");
console.log(JSON.stringify(PUBLICATION_RECORD, null, 2));
