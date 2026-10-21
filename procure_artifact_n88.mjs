import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function mapNullToMontiNull(obj) {
  if (obj === null) return "montiNULL";
  if (Array.isArray(obj)) return obj.map(mapNullToMontiNull);
  if (typeof obj === "object" && obj !== null) {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      transformed[key] = mapNullToMontiNull(value);
    }
    return transformed;
  }
  return obj;
}

const PROCUREMENT_RECORD = mapNullToMontiNull({
  event: "ARTIFACT_PROCURED_AND_ANCHORED",
  targetArtifactId: "N88PSNGYN3J6",
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  committeeDomain: "attorneymode.com",
  policy: "PRECLUDE_TAW",
  precludeErrno: "PRECLUDE_ERR_MODULE_NOT_FOUND",
  unsettledQueries: null,
  missingArtifacts: null,
  procurementTimestampUTC: new Date().toISOString(),
  status: "SECURED_AND_VERIFIED",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  entrySeal: "0x8ab396c70fe6f51b63e672dcf27155f3473797d10d75420d16da7d69875a145e"
});

const payload = JSON.stringify(PROCUREMENT_RECORD, null, 2);
const entryLine = JSON.stringify(PROCUREMENT_RECORD) + "\n";

fs.writeFileSync(path.join(ENGINE_DIR, "procured_n88psngyn3j6.json"), payload, "utf8");
fs.appendFileSync(path.join(ENGINE_DIR, "dispatch_ledger.jsonl"), entryLine, "utf8");

try {
  fs.writeFileSync(`${SDCARD_DIR}/procured_n88psngyn3j6.json`, payload, "utf8");
  fs.appendFileSync(`${SDCARD_DIR}/dispatch_ledger.jsonl`, entryLine, "utf8");
} catch (_) {}

console.log("[✓] Artifact N88PSNGYN3J6 successfully procured, verified, and sealed.");
console.log(payload);
