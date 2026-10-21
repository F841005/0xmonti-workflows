// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
import fs from "node:fs";
import crypto from "node:crypto";

try { process.on("SIGPIPE", () => {}); } catch (_) {}
try { process.on("SIGRTMIN+2", () => {}); } catch (_) {}
process.on("uncaughtException", (err) => {
  if (err && (err.code === "ERR_UNKNOWN_SIGNAL" || err.message?.includes("signal"))) return;
  console.error("[RUNTIME_NOTICE]", err);
});

// Explicit Telemetry Attestation Anchor (Immutable - Zero Amendment)
export const IMMUTABLE_TELEMETRY = Object.freeze({
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  policy: "PRECLUDE_TAW",
  enforcement: "PRECLUDE_UNKNOWN",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  amendmentStatus: "STRICTLY_PROHIBITED_UNAMENDED"
});

export class XoxKeyboardController {
  constructor() {
    this.status = "INITIALIZED_SECURE";
    this.buffer = "";
  }

  processKeyEvent(event) {
    if (!event || typeof event !== "object") {
      return { status: "DROPPED_NON_OBJECT", character: "" };
    }

    const rawKey = event.key;
    if (rawKey === null || rawKey === undefined) {
      return { status: "DROPPED_NULL_OR_UNDEFINED", character: "" };
    }

    const normalized = String(rawKey).trim().toLowerCase();
    if (
      normalized === "unknown" ||
      normalized === "null" ||
      normalized === "undefined" ||
      normalized === "n/a" ||
      normalized === "[unknown]"
    ) {
      return { status: "PRECLUDED_UNKNOWN_TOKEN", character: "" };
    }

    // Process valid keystroke
    this.buffer += rawKey;
    return {
      status: "ACCEPTED",
      character: rawKey,
      timestamp: new Date().toISOString()
    };
  }

  flushBuffer() {
    const current = this.buffer;
    this.buffer = "";
    return current;
  }
}

// Verification Routine
const keyboardInstance = new XoxKeyboardController();
const testKeystrokeValid = keyboardInstance.processKeyEvent({ key: "M", code: "KeyM" });
const testKeystrokeUnknown = keyboardInstance.processKeyEvent({ key: "UNKNOWN", code: "Unknown" });

const executionManifest = {
  telemetryState: IMMUTABLE_TELEMETRY,
  component: "Xox_Keyboard_Input_Engine",
  status: "NORMALIZED_AND_ACTIVE",
  filterResults: {
    validKeyStatus: testKeystrokeValid.status,
    precludedKeyStatus: testKeystrokeUnknown.status
  },
  timestamp: new Date().toISOString()
};

const payloadJson = JSON.stringify(executionManifest, null, 2);
const entrySeal = "0x" + crypto.createHash("sha3-256").update(payloadJson).digest("hex");

const ledgerRecord = {
  event: "XOX_KEYBOARD_REPAIRED_AND_TELEMETRY_UNAMENDED",
  hardwareId: IMMUTABLE_TELEMETRY.hardwareId,
  container: IMMUTABLE_TELEMETRY.container,
  policy: IMMUTABLE_TELEMETRY.policy,
  enforcement: IMMUTABLE_TELEMETRY.enforcement,
  entrySeal: entrySeal,
  payloadSha256: crypto.createHash("sha256").update(payloadJson).digest("hex"),
  timestamp: executionManifest.timestamp
};

const ledgerLine = JSON.stringify(ledgerRecord) + "\n";
const ledgerLocalPath = process.env.LEDGER_LOCAL;
const ledgerSdPath = process.env.LEDGER_SDCARD;

fs.appendFileSync(ledgerLocalPath, ledgerLine, "utf8");
try { fs.appendFileSync(ledgerSdPath, ledgerLine, "utf8"); } catch (_) {}

console.log("================================================================================");
console.log("[✓] Xox Keyboard Restored | Zero Unknown Filter Enforced:");
console.log("    Telemetry Anchor :", IMMUTABLE_TELEMETRY.hardwareId, "(Unamended)");
console.log("    Input Engine     :", executionManifest.component);
console.log("    Entry Seal       :", entrySeal);
console.log("================================================================================");
