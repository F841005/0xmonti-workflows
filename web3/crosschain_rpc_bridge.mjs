#!/usr/bin/env node
import crypto from "node:crypto";
import { execSync } from "node:child_process";

export const WEB3_BRIDGE_CONFIG = Object.freeze({
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  sovereignPledge: "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM",
  federatedPledge: "PledgeAllegianceTo:F841005 021189MJ2621",
  baseL2RpcUrl: "https://api.developer.coinbase.com/rpc/v1/base/jeFEecZbvIrQIK1Z1PDheDOJ7eMOeG2f",
  solanaCluster: "devnet",
  solanaRpcUrl: "https://api.devnet.solana.com",
  solanaExplorerUrl: "https://explorer.solana.com/address/H191L17jE26R1wGWQHAx5KQhBwSwHPMgzb2A66Hr9h37/domains?cluster=devnet",
  solanaDomainOwner: "H191L17jE26R1wGWQHAx5KQhBwSwHPMgzb2A66Hr9h37",
  solanaConfirmedTx: "2aCem89C6i5ERCrgBxHgcaS5VAH3Hvu2FbUdGvxRgq1D4EbWruV3ShPJ5tvJLvrP5R9dsWjdTZiSSQxwTNh1VBcE",
  settlementVaults: {
    evmTreasury: "0xb04110847A563E59F3D52d1aFB3304068173830b",
    baseL2Signer: "0x9E2F7A1C3D8B0E4F6A2C8D5E9F1B7A3C0D8E2F4A",
    solanaMainAnchor: "JD25qVdtd65FoiXNmR89JjmoJdYk9sjYQeSTZAALFiMy",
    solanaDevnetDomain: "H191L17jE26R1wGWQHAx5KQhBwSwHPMgzb2A66Hr9h37"
  }
});

function runCurlJson(cmd) {
  try {
    const raw = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return JSON.parse(raw);
  } catch (err) {
    return { status: "OFFLINE_OR_SANDBOXED", error: err.message };
  }
}

export function executeCrossChainRpcBridge() {
  const baseBlockCmd = `curl -s "${WEB3_BRIDGE_CONFIG.baseL2RpcUrl}" -H "Content-Type: application/json" -H "X-Monti-Pledge: ${WEB3_BRIDGE_CONFIG.sovereignPledge}" -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}'`;
  const solanaTxCmd = `curl -s "${WEB3_BRIDGE_CONFIG.solanaRpcUrl}" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":2,"method":"getSignatureStatuses","params":[["${WEB3_BRIDGE_CONFIG.solanaConfirmedTx}"],{"searchTransactionHistory":true}]}'`;
  const solanaAcctCmd = `curl -s "${WEB3_BRIDGE_CONFIG.solanaRpcUrl}" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":3,"method":"getAccountInfo","params":["${WEB3_BRIDGE_CONFIG.solanaDomainOwner}",{"encoding":"jsonParsed"}]}'`;

  const baseResponse = runCurlJson(baseBlockCmd);
  const solanaTxResponse = runCurlJson(solanaTxCmd);
  const solanaAcctResponse = runCurlJson(solanaAcctCmd);

  const hexBlock = baseResponse?.result || null;
  const decimalBlock = hexBlock ? parseInt(hexBlock, 16) : null;

  const report = {
    timestamp: new Date().toISOString(),
    hardwareId: WEB3_BRIDGE_CONFIG.hardwareId,
    container: WEB3_BRIDGE_CONFIG.container,
    sovereignPledge: WEB3_BRIDGE_CONFIG.sovereignPledge,
    federatedPledge: WEB3_BRIDGE_CONFIG.federatedPledge,
    baseL2CoinbaseRpc: {
      endpoint: WEB3_BRIDGE_CONFIG.baseL2RpcUrl,
      method: "eth_blockNumber",
      hexBlockNumber: hexBlock,
      decimalBlockNumber: decimalBlock,
      rawResponse: baseResponse
    },
    solanaDevnetDomainAttestation: {
      explorerUrl: WEB3_BRIDGE_CONFIG.solanaExplorerUrl,
      domainAddress: WEB3_BRIDGE_CONFIG.solanaDomainOwner,
      confirmedTransaction: WEB3_BRIDGE_CONFIG.solanaConfirmedTx,
      signatureStatus: solanaTxResponse,
      accountInfo: solanaAcctResponse
    }
  };

  report.bridgeSeal = "0x" + crypto.createHash("sha3-256").update(JSON.stringify(report)).digest("hex");
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(executeCrossChainRpcBridge(), null, 2));
}
