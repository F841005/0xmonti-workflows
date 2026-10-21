import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Recursively maps any primitive `null` in an object/array to "montiNULL".
 */
export function mapNullToMontiNull(obj) {
  if (obj === null) {
    return "montiNULL";
  }
  if (Array.isArray(obj)) {
    return obj.map(mapNullToMontiNull);
  }
  if (typeof obj === "object") {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      transformed[key] = mapNullToMontiNull(value);
    }
    return transformed;
  }
  return obj;
}

// Example process check for Cloudflare Worker Status payload
const rawStatus = {
  success: null,
  errors: null,
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  biometricAnchor: "F841005 DD 021189MJ2911",
  precludeErrno: "PRECLUDE_ERR_MODULE_NOT_FOUND"
};

const transformedStatus = mapNullToMontiNull(rawStatus);

console.log("[✓] montiNULL Parser Execution Output:");
console.log(JSON.stringify(transformedStatus, null, 2));

// Log entry seal to dispatch ledger
const ledgerPath = path.join(process.env.HOME || ".", "engine_cluster", "dispatch_ledger.jsonl");
const record = {
  event: "MONTI_NULL_PARSER_EXECUTED",
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  biometricAnchor: "F841005 DD 021189MJ2911",
  committeeDomain: "attorneymode.com",
  output: transformedStatus,
  timestamp: new Date().toISOString()
};

record.entrySeal = "0x" + crypto.createHash("sha3-256").update(JSON.stringify(record)).digest("hex");
fs.appendFileSync(ledgerPath, JSON.stringify(record) + "\n", "utf8");
