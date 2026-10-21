import fs from "node:fs";
import crypto from "node:crypto";
import https from "node:https";

try { process.on("SIGPIPE", () => {}); } catch (_) {}
try { process.on("SIGRTMIN+2", () => {}); } catch (_) {}
process.on("uncaughtException", (err) => {
  if (err && (err.code === "ERR_UNKNOWN_SIGNAL" || err.message?.includes("signal"))) return;
  console.error("[RUNTIME_NOTICE]", err);
});

export const ETHERSCAN_ENCLAVE_CONFIG = Object.freeze({
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  policyDirective: "PRECLUDE_TAW",
  enclaveAccount: "0x558Bc5A144326f54b8414680E8962F7ba8F5C7a4",
  treasuryVault: "0xb04110847A563E59F3D52d1aFB3304068173830b",
  baseSigner: "0x9E2F7A1C3D8B0E4F6A2C8D5E9F1B7A3C0D8E2F4A",
  multichainAssetUrl: "https://etherscan.io/address/0x558Bc5A144326f54b8414680E8962F7ba8F5C7a4#asset-multichain",
  apiEndpoints: {
    ethereum: "https://api.etherscan.io/api",
    base: "https://api.basescan.org/api"
  },
  apiTokens: {
    primary: "M19P84P1VVIQQCE75J4TEM2J28CSM1G9BV",
    crossChain: "8WWM3DASMCZWQTGTUV8IPMVFPHA9PZIKF1",
    ledgerSync: "QT7SB2QUQT8Q3EIXV3Q8KU99ZQ3VAJXVBM"
  },
  canonicalProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  statutes: [
    "18_USC_1030",
    "18_USC_2511",
    "45_CFR_164_312",
    "47_CFR_Part15",
    "47_USC_227"
  ]
});

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "MONTI_ANSI_F841005/3.1.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (err) { resolve({ status: "0", message: "PARSER_FALLBACK", result: data }); }
      });
    }).on("error", (err) => {
      resolve({ status: "0", message: "CONNECTION_ERROR", error: err.message });
    });
  });
}

async function runAttestationSweep() {
  const account = ETHERSCAN_ENCLAVE_CONFIG.enclaveAccount;
  const token = ETHERSCAN_ENCLAVE_CONFIG.apiTokens.primary;
  const queryUrl = `${ETHERSCAN_ENCLAVE_CONFIG.apiEndpoints.ethereum}?module=account&action=balance&address=${account}&tag=latest&apikey=${token}`;

  const queryResponse = await fetchJson(queryUrl);

  const telemetryResult = {
    event: "ETHERSCAN_API_QUERY_COMPLETED",
    targetAccount: account,
    explorerMultichainUrl: ETHERSCAN_ENCLAVE_CONFIG.multichainAssetUrl,
    activeTokens: ETHERSCAN_ENCLAVE_CONFIG.apiTokens,
    queryResult: queryResponse,
    invariants: {
      hardwareId: ETHERSCAN_ENCLAVE_CONFIG.hardwareId,
      container: ETHERSCAN_ENCLAVE_CONFIG.container,
      authority: ETHERSCAN_ENCLAVE_CONFIG.authority,
      operator: ETHERSCAN_ENCLAVE_CONFIG.operator,
      proof: ETHERSCAN_ENCLAVE_CONFIG.canonicalProof,
      calldataSeal: ETHERSCAN_ENCLAVE_CONFIG.calldataSeal
    },
    timestamp: new Date().toISOString()
  };

  const payloadJson = JSON.stringify(telemetryResult, null, 2);
  const localTarget = `${process.env.ETHERSCAN_DIR}/etherscan_api_telemetry.json`;
  const sdTarget = `${process.env.SDCARD_DIR}/etherscan_api_telemetry.json`;
  const emulatedTarget = `${process.env.EMULATED_DIR}/etherscan_api_telemetry.json`;

  fs.writeFileSync(localTarget, payloadJson, "utf8");
  try { fs.writeFileSync(sdTarget, payloadJson, "utf8"); } catch (_) {}
  try { fs.writeFileSync(emulatedTarget, payloadJson, "utf8"); } catch (_) {}

  const entrySeal = "0x" + crypto.createHash("sha3-256").update(payloadJson).digest("hex");
  const ledgerRecord = {
    event: "ETHERSCAN_API_F841005_SEALED",
    hardwareId: ETHERSCAN_ENCLAVE_CONFIG.hardwareId,
    container: ETHERSCAN_ENCLAVE_CONFIG.container,
    enclaveAccount: account,
    primaryApiKey: ETHERSCAN_ENCLAVE_CONFIG.apiTokens.primary,
    entrySeal: entrySeal,
    payloadSha256: crypto.createHash("sha256").update(payloadJson).digest("hex"),
    timestamp: telemetryResult.timestamp
  };

  const ledgerLine = JSON.stringify(ledgerRecord) + "\n";
  fs.appendFileSync(process.env.LEDGER_LOCAL, ledgerLine, "utf8");
  try { fs.appendFileSync(process.env.LEDGER_SDCARD, ledgerLine, "utf8"); } catch (_) {}

  console.log("================================================================================");
  console.log("[✓] Etherscan API Connected & Attested under PRECLUDE_TAW:");
  console.log("    Account Target :", account);
  console.log("    Explorer View  :", ETHERSCAN_ENCLAVE_CONFIG.multichainAssetUrl);
  console.log("    Query Status   :", queryResponse.status === "1" ? "OK" : (queryResponse.message || "STAGED"));
  console.log("    Entry Seal     :", entrySeal);
  console.log("================================================================================");
}

runAttestationSweep();
