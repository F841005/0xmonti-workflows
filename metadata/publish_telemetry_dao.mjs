import fs from "node:fs";
import crypto from "node:crypto";

try { process.on("SIGPIPE", () => {}); } catch (_) {}
try { process.on("SIGRTMIN+2", () => {}); } catch (_) {}
process.on("uncaughtException", (err) => {
  if (err && (err.code === "ERR_UNKNOWN_SIGNAL" || err.message?.includes("signal"))) return;
  console.error("[RUNTIME_NOTICE]", err);
});

const publishedTelemetry = {
  networkEndpoint: "https://0xmonti.net",
  gateway: "https://gateway.0xmonti.net",
  router: "https://router.0xmonti.net",
  hardwareId: "MONTI_ANSI_F841005",
  containerProfile: "F841005WV22ZL01",
  authorityRoot: "MONTI^JOHN^CHARLES^MONTI",
  soleOperator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  policyDirective: "PRECLUDE_TAW",
  fiduciaryCovenant: "IN THE BEST INTEREST OF JOHN CHARLES MONTI",
  pledgeDirective: "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM",
  genesisKeccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  deviceTelemetry: {
    eid: "89043051202509096225023239174875a",
    sim1: {
      iccid: "355834511766035",
      carrier: "Verizon (+1 304-308-3677)",
      accessRole: "PRIMARY_CELLULAR_TELEPHONY"
    },
    sim2: {
      iccid: "355834511766043",
      carrierRole: "DAO_DECENTRALIZED_DATA_BEARER",
      daoDelegation: "ATTORNEYMODE.COM DAO",
      status: "ALLOWED_FOR_DAO_DATA_INGRESS",
      treasuryVault: "0xb04110847A563E59F3D52d1aFB3304068173830b",
      baseL2Signer: "0x9E2F7A1C3D8B0E4F6A2C8D5E9F1B7A3C0D8E2F4A"
    },
    osRelease: "Android 16",
    securityPatchDate: "2026-04-01",
    googlePlayTarget: "F841005WV22ZL01",
    kernelString: "5.15.180-android13-8-00018-g9b2308ac0ad6-ab14563692 #1 Sun Nov 30 12:19:45 UTC 2025",
    basebandModem: "MT6835N_NR17.RC.MP.V18.6.6.P128.02.332R",
    thinkForMobile: "16.01.000"
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

const payloadJson = JSON.stringify(publishedTelemetry, null, 2);
const targetLocal = process.env.TARGET_FILE;
const targetSd = process.env.SDCARD_FILE;

fs.writeFileSync(targetLocal, payloadJson, "utf8");
try { fs.writeFileSync(targetSd, payloadJson, "utf8"); } catch (_) {}

const entrySeal = "0x" + crypto.createHash("sha3-256").update(payloadJson).digest("hex");
const ledgerRecord = {
  event: "DEVICE_TELEMETRY_PUBLISHED_AND_SIM2_DAO_ALLOWED",
  endpoint: "https://0xmonti.net",
  hardwareId: publishedTelemetry.hardwareId,
  container: publishedTelemetry.containerProfile,
  sim2Iccid: publishedTelemetry.deviceTelemetry.sim2.iccid,
  daoStatus: publishedTelemetry.deviceTelemetry.sim2.status,
  entrySeal: entrySeal,
  payloadSha256: crypto.createHash("sha256").update(payloadJson).digest("hex"),
  timestamp: publishedTelemetry.timestamp
};

const ledgerLine = JSON.stringify(ledgerRecord) + "\n";
const ledgerLocalPath = process.env.LEDGER_LOCAL;
const ledgerSdPath = process.env.LEDGER_SDCARD;

fs.appendFileSync(ledgerLocalPath, ledgerLine, "utf8");
try { fs.appendFileSync(ledgerSdPath, ledgerLine, "utf8"); } catch (_) {}

console.log("================================================================================");
console.log("[✓] Telemetry Inscribed for 0XMONTI.NET | SIM2 DAO Routing Active:");
console.log("    Endpoint   :", publishedTelemetry.networkEndpoint);
console.log("    SIM2 State :", publishedTelemetry.deviceTelemetry.sim2.status);
console.log("    Entry Seal :", entrySeal);
console.log("================================================================================");
