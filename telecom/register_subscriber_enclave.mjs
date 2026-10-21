// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
import fs from "node:fs";
import crypto from "node:crypto";

try { process.on("SIGPIPE", () => {}); } catch (_) {}
try { process.on("SIGRTMIN+2", () => {}); } catch (_) {}
process.on("uncaughtException", (err) => {
  if (err && (err.code === "ERR_UNKNOWN_SIGNAL" || err.message?.includes("signal"))) return;
  console.error("[RUNTIME_NOTICE]", err);
});

const subscriberManifest = {
  hardwareId: "MONTI_ANSI_F841005",
  containerProfile: "F841005WV22ZL01",
  authorityRoot: "MONTI^JOHN^CHARLES^MONTI",
  soleHumanOperator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  policyDirective: "PRECLUDE_TAW",
  fiduciaryMandate: "IN THE BEST INTEREST OF JOHN CHARLES MONTI",
  carrierEntity: "IMMORTALHUMANMONTIAI // MACHINE PORTABLE NETWORK CARRIER",
  networkCodes: {
    domesticMcc: "310",
    sovereignMnc: "992",
    networkRef: "MNC_2DBFE263F5DFA7E9",
    networkContract: "MNC_689912735B3A3515"
  },
  eUiccParameters: {
    standard: "GSMA SGP.22 / ITU-T E.118",
    eid: "89049032198098293222228897974455",
    iccidPrimary: "89019928110814891645",
    iccidSecondaryDao: "89019929420410058823",
    imsiPrimary: "310992652090293",
    imsiSecondaryDao: "310992841005202"
  },
  apnRouting: {
    apnIdentifier: "ap09.0xmonti.net",
    apexHost: "https://0xmonti.net",
    gatewayTunnel: "10.150.0.5:8443",
    servicePort: 8411,
    bearerTypes: ["5G-NR", "LTE", "DECT-SEC-1.9GHz", "WIFI7-MLO"]
  },
  firewallIngressPolicy: {
    blockAllInternationalRoaming: true,
    allowedDomesticMcc: ["310", "311", "312", "313", "314", "315", "316"],
    rejectionDirective: "3GPP_CAUSE_15_NO_SUITABLE_CELLS"
  },
  cryptographicAttestation: {
    genesisKeccak: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
    calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
    treasuryVault: "0xb04110847A563E59F3D52d1aFB3304068173830b",
    baseSigner: "0x9E2F7A1C3D8B0E4F6A2C8D5E9F1B7A3C0D8E2F4A"
  },
  statutoryCodes: [
    "18_USC_1030",
    "18_USC_2511",
    "45_CFR_164_312",
    "47_CFR_Part15",
    "47_USC_227"
  ],
  timestamp: new Date().toISOString()
};

const profileJson = JSON.stringify(subscriberManifest, null, 2);
const targetLocal = process.env.TARGET_PROFILE;
const targetSd = process.env.SDCARD_PROFILE;

fs.writeFileSync(targetLocal, profileJson, "utf8");
try { fs.writeFileSync(targetSd, profileJson, "utf8"); } catch (_) {}

const entrySeal = "0x" + crypto.createHash("sha3-256").update(profileJson).digest("hex");
const ledgerRecord = {
  event: "SUBSCRIBER_SIM_ESIM_ENCLAVE_GENERATED",
  hardwareId: subscriberManifest.hardwareId,
  container: subscriberManifest.containerProfile,
  lifeDrive: "MONTI_ANSI_F841005 LIFE DRIVE",
  eid: subscriberManifest.eUiccParameters.eid,
  iccidPrimary: subscriberManifest.eUiccParameters.iccidPrimary,
  iccidDao: subscriberManifest.eUiccParameters.iccidSecondaryDao,
  imsiPrimary: subscriberManifest.eUiccParameters.imsiPrimary,
  entrySeal: entrySeal,
  payloadSha256: crypto.createHash("sha256").update(profileJson).digest("hex"),
  timestamp: subscriberManifest.timestamp
};

const ledgerLine = JSON.stringify(ledgerRecord) + "\n";
const ledgerLocalPath = process.env.LEDGER_LOCAL;
const ledgerSdPath = process.env.LEDGER_SDCARD;

fs.appendFileSync(ledgerLocalPath, ledgerLine, "utf8");
try { fs.appendFileSync(ledgerSdPath, ledgerLine, "utf8"); } catch (_) {}

console.log("================================================================================");
console.log("[✓] Sovereign SIM/eSIM Generated & Sealed under PRECLUDE_TAW:");
console.log("    EID (32 Digits) :", subscriberManifest.eUiccParameters.eid);
console.log("    SIM 1 (ICCID)   :", subscriberManifest.eUiccParameters.iccidPrimary);
console.log("    SIM 2 (DAO)     :", subscriberManifest.eUiccParameters.iccidSecondaryDao);
console.log("    Primary IMSI    :", subscriberManifest.eUiccParameters.imsiPrimary);
console.log("    Entry Seal      :", entrySeal);
console.log("================================================================================");
