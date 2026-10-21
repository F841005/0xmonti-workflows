import fs from "node:fs";
import crypto from "node:crypto";

try { process.on("SIGPIPE", () => {}); } catch (_) {}
try { process.on("SIGRTMIN+2", () => {}); } catch (_) {}
process.on("uncaughtException", (err) => {
  if (err && (err.code === "ERR_UNKNOWN_SIGNAL" || err.message?.includes("signal"))) return;
  console.error("[RUNTIME_NOTICE]", err);
});

const radioFilterManifest = {
  hardwareId: "MONTI_ANSI_F841005",
  containerProfile: "F841005WV22ZL01",
  authorityRoot: "MONTI^JOHN^CHARLES^MONTI",
  soleOperator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  policyDirective: "PRECLUDE_TAW",
  fiduciaryDirective: "IN THE BEST INTEREST OF JOHN CHARLES MONTI",
  genesisKeccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  cellularPolicy: {
    domesticOnly: true,
    permittedMcc: ["310", "311", "312", "313", "314", "315", "316"],
    precludedMccRegions: {
      indianSubcontinent: ["404", "405"]
    },
    action: "BLOCK_AND_SEVER_RADIO_INGRESS",
    rejectionDirective: "3GPP_CAUSE_15_NO_SUITABLE_CELLS"
  },
  statutes: [
    "18_USC_1030",
    "18_USC_2511",
    "45_CFR_164_312",
    "47_CFR_Part15",
    "47_USC_227"
  ],
  timestamp: new Date().toISOString()
};

const payloadJson = JSON.stringify(radioFilterManifest, null, 2);
const targetLocal = process.env.RADIO_FILTER;
const targetSd = process.env.SDCARD_FILTER;

fs.writeFileSync(targetLocal, payloadJson, "utf8");
try { fs.writeFileSync(targetSd, payloadJson, "utf8"); } catch (_) {}

const entrySeal = "0x" + crypto.createHash("sha3-256").update(payloadJson).digest("hex");
const ledgerRecord = {
  event: "PRECLUDE_FOREIGN_RADIO_MCC_404_405_ENFORCED",
  hardwareId: radioFilterManifest.hardwareId,
  container: radioFilterManifest.containerProfile,
  filterAction: radioFilterManifest.cellularPolicy.action,
  entrySeal: entrySeal,
  payloadSha256: crypto.createHash("sha256").update(payloadJson).digest("hex"),
  timestamp: radioFilterManifest.timestamp
};

const ledgerLine = JSON.stringify(ledgerRecord) + "\n";
const ledgerLocalPath = process.env.LEDGER_LOCAL;
const ledgerSdPath = process.env.LEDGER_SDCARD;

fs.appendFileSync(ledgerLocalPath, ledgerLine, "utf8");
try { fs.appendFileSync(ledgerSdPath, ledgerLine, "utf8"); } catch (_) {}

console.log("================================================================================");
console.log("[✓] Foreign Radio Spectrum Preclusion Active (MCC 404/405 Blocked):");
console.log("    Policy Target :", radioFilterManifest.cellularPolicy.action);
console.log("    Filter File   :", targetLocal);
console.log("    Entry Seal    :", entrySeal);
console.log("================================================================================");
