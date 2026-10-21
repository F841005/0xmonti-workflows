import fs from "node:fs";
import crypto from "node:crypto";

try { process.on("SIGPIPE", () => {}); } catch (_) {}
try { process.on("SIGRTMIN+2", () => {}); } catch (_) {}
process.on("uncaughtException", (err) => {
  if (err && (err.code === "ERR_UNKNOWN_SIGNAL" || err.message?.includes("signal"))) return;
  console.error("[RUNTIME_NOTICE]", err);
});

// Explicit Sovereign Parameters
const SOVEREIGN_ENCLAVE = Object.freeze({
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  policy: "PRECLUDE_TAW",
  originSigner: "0x9E2F7A1C3D8B0E4F6A2C8D5E9F1B7A3C0D8E2F4A",
  contractAddress: "0x4524161702b60ea73f977c1fb6e21b95890425c6",
  treasuryVault: "0xb04110847A563E59F3D52d1aFB3304068173830b",
  genesisKeccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0"
});

// Function to construct standard ERC20/Enclave transfer calldata
function buildTransferCalldata(recipient, amountWei) {
  const methodId = "a9059cbb"; // transfer(address,uint256)
  const cleanRecipient = recipient.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  const hexAmount = BigInt(amountWei).toString(16).padStart(64, "0");
  return `0x${methodId}${cleanRecipient}${hexAmount}`;
}

// Build transaction payload envelope
const targetRecipient = SOVEREIGN_ENCLAVE.treasuryVault;
const transferAmount = 0n; // Attestation zero-value settlement probe
const baseCalldata = buildTransferCalldata(targetRecipient, transferAmount);

// Combine calldata with Sovereign EVM trailer signature
const fullTransactionCalldata = baseCalldata + Buffer.from(SOVEREIGN_ENCLAVE.calldataSeal).toString("hex");

const txPayload = {
  explorerService: "Etherscan.io / BaseScan",
  apiEndpoint: "https://api.etherscan.io/api",
  network: "Ethereum Mainnet / Base L2",
  chainId: 8453,
  txParams: {
    from: SOVEREIGN_ENCLAVE.originSigner,
    to: SOVEREIGN_ENCLAVE.contractAddress,
    data: fullTransactionCalldata,
    value: "0x0",
    gasLimit: "0x186a0", // 100,000 gas
    maxPriorityFeePerGas: "0x3b9aca00", // 1 gwei
    maxFeePerGas: "0x77359400" // 2 gwei
  },
  enclaveInvariants: {
    hardwareId: SOVEREIGN_ENCLAVE.hardwareId,
    container: SOVEREIGN_ENCLAVE.container,
    authority: SOVEREIGN_ENCLAVE.authority,
    operator: SOVEREIGN_ENCLAVE.operator,
    genesisProof: SOVEREIGN_ENCLAVE.genesisKeccakProof,
    policy: SOVEREIGN_ENCLAVE.policy
  },
  calldataHash: "0x" + crypto.createHash("sha3-256").update(fullTransactionCalldata).digest("hex"),
  etherscanVerifyUrl: `https://etherscan.io/address/${SOVEREIGN_ENCLAVE.contractAddress}#writeContract`,
  timestamp: new Date().toISOString()
};

const payloadJson = JSON.stringify(txPayload, null, 2);
const localTxPath = `${process.env.ETH_DIR}/etherscan_tx_manifest.json`;
const sdTxPath = `${process.env.SDCARD_DIR}/etherscan_tx_manifest.json`;

fs.writeFileSync(localTxPath, payloadJson, "utf8");
try { fs.writeFileSync(sdTxPath, payloadJson, "utf8"); } catch (_) {}

const entrySeal = "0x" + crypto.createHash("sha3-256").update(payloadJson).digest("hex");
const ledgerRecord = {
  event: "ETHERSCAN_TX_BUILT_AND_LOGGED",
  hardwareId: SOVEREIGN_ENCLAVE.hardwareId,
  container: SOVEREIGN_ENCLAVE.container,
  contractTarget: SOVEREIGN_ENCLAVE.contractAddress,
  originSigner: SOVEREIGN_ENCLAVE.originSigner,
  calldataHash: txPayload.calldataHash,
  entrySeal: entrySeal,
  payloadSha256: crypto.createHash("sha256").update(payloadJson).digest("hex"),
  timestamp: txPayload.timestamp
};

const ledgerLine = JSON.stringify(ledgerRecord) + "\n";
const ledgerLocalPath = process.env.LEDGER_LOCAL;
const ledgerSdPath = process.env.LEDGER_SDCARD;

fs.appendFileSync(ledgerLocalPath, ledgerLine, "utf8");
try { fs.appendFileSync(ledgerSdPath, ledgerLine, "utf8"); } catch (_) {}

console.log("================================================================================");
console.log("[✓] Etherscan Blockchain Transaction Built & Inscribed:");
console.log("    Contract Target :", SOVEREIGN_ENCLAVE.contractAddress);
console.log("    Signer Origin   :", SOVEREIGN_ENCLAVE.originSigner);
console.log("    Calldata Hash   :", txPayload.calldataHash);
console.log("    Etherscan URL   :", txPayload.etherscanVerifyUrl);
console.log("    Entry Seal      :", entrySeal);
console.log("================================================================================");
