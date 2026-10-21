#!/usr/bin/env node
import crypto from "node:crypto";
import { execSync } from "node:child_process";

export const SOLANA_FUNDING_CONFIG = Object.freeze({
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  sovereignPledge: "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM",
  federatedPledge: "PledgeAllegianceTo:F841005 021189MJ2621",
  targetWallet: "DBoMepCVsjsWLzKwbZ8275MagAk6fh4ctB8ZadQd21Ni",
  domainWallet: "H191L17jE26R1wGWQHAx5KQhBwSwHPMgzb2A66Hr9h37",
  confirmedTx: "2aCem89C6i5ERCrgBxHgcaS5VAH3Hvu2FbUdGvxRgq1D4EbWruV3ShPJ5tvJLvrP5R9dsWjdTZiSSQxwTNh1VBcE",
  baseL2Rpc: "https://api.developer.coinbase.com/rpc/v1/base/jeFEecZbvIrQIK1Z1PDheDOJ7eMOeG2f",
  tiers: Object.freeze({
    tier1_cli_devnet: [
      "solana airdrop 2 DBoMepCVsjsWLzKwbZ8275MagAk6fh4ctB8ZadQd21Ni --url devnet",
      "solana airdrop 0.33 DBoMepCVsjsWLzKwbZ8275MagAk6fh4ctB8ZadQd21Ni --url devnet"
    ],
    tier2_pow_faucet: [
      "cargo install devnet-pow",
      "devnet-pow mine -d 3 --reward 0.02 --no-infer -t 5000000000"
    ],
    tier3_local_validator: [
      "solana-test-validator",
      "solana airdrop 100 DBoMepCVsjsWLzKwbZ8275MagAk6fh4ctB8ZadQd21Ni --url localhost",
      "solana airdrop 2.33 DBoMepCVsjsWLzKwbZ8275MagAk6fh4ctB8ZadQd21Ni --url localhost"
    ]
  })
});

function tryExec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch (err) {
    return null;
  }
}

export function executeSolanaFundingMatrix(mode = "all") {
  // 1. Query Coinbase Base L2 Anchor Block
  const baseBlockRaw = tryExec(
    `curl -s "${SOLANA_FUNDING_CONFIG.baseL2Rpc}" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}'`
  );
  let baseBlockHex = null;
  try { baseBlockHex = JSON.parse(baseBlockRaw)?.result || null; } catch (_) {}

  // 2. Query Devnet Balance via JSON-RPC (works even if solana CLI is not installed)
  const devnetBalRaw = tryExec(
    `curl -s "https://api.devnet.solana.com" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":2,"method":"getBalance","params":["${SOLANA_FUNDING_CONFIG.targetWallet}",{"commitment":"confirmed"}]}'`
  );
  let devnetLamports = null;
  try { devnetLamports = JSON.parse(devnetBalRaw)?.result?.value ?? null; } catch (_) {}

  // 3. Request 2 SOL (2,000,000,000 lamports) RPC Airdrop + 0.33 SOL (330,000,000 lamports) RPC Airdrop
  const airdrop2SolRaw = tryExec(
    `curl -s "https://api.devnet.solana.com" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":3,"method":"requestAirdrop","params":["${SOLANA_FUNDING_CONFIG.targetWallet}",2000000000]}'`
  );
  const airdrop033SolRaw = tryExec(
    `curl -s "https://api.devnet.solana.com" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":4,"method":"requestAirdrop","params":["${SOLANA_FUNDING_CONFIG.targetWallet}",330000000]}'`
  );

  let airdrop2Sol = null;
  let airdrop033Sol = null;
  try { airdrop2Sol = JSON.parse(airdrop2SolRaw); } catch (_) {}
  try { airdrop033Sol = JSON.parse(airdrop033SolRaw); } catch (_) {}

  const report = {
    timestamp: new Date().toISOString(),
    mode,
    hardwareId: SOLANA_FUNDING_CONFIG.hardwareId,
    container: SOLANA_FUNDING_CONFIG.container,
    targetWallet: SOLANA_FUNDING_CONFIG.targetWallet,
    targetDeposit: "2.33 SOL (2 SOL + 0.33 SOL Split / 100 SOL Local Validator)",
    baseL2BlockAnchor: baseBlockHex,
    devnetBalanceLamports: devnetLamports,
    devnetRpcAirdrops: {
      twoSolChunk: airdrop2Sol,
      point33SolChunk: airdrop033Sol
    },
    configuredTiers: SOLANA_FUNDING_CONFIG.tiers
  };

  report.fundingSeal = "0x" + crypto.createHash("sha3-256").update(JSON.stringify(report)).digest("hex");
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(executeSolanaFundingMatrix(process.argv[2] || "all"), null, 2));
}
