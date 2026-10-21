#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import { syncCloudflarePort443 } from "../cloudflare/cloudflare_dns_443_sync.mjs";
import { executeCrossChainRpcBridge } from "../web3/crosschain_rpc_bridge.mjs";

const ROOT = process.env.MONTINODE_ROOT || path.join(process.env.HOME || process.cwd(), "io.montinode");
const LEDGER = path.join(ROOT, "io_montinode_ledger.jsonl");

const INVARIANTS = Object.freeze({
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  cloudflareAgent: "montiansif841005.ai.studio",
  tunnelUuid: "54868634-2fb3-42ef-add9-fd10b03f665a",
  solanaDomainAddress: "H191L17jE26R1wGWQHAx5KQhBwSwHPMgzb2A66Hr9h37",
  solanaConfirmedTx: "2aCem89C6i5ERCrgBxHgcaS5VAH3Hvu2FbUdGvxRgq1D4EbWruV3ShPJ5tvJLvrP5R9dsWjdTZiSSQxwTNh1VBcE",
  baseL2Rpc: "https://api.developer.coinbase.com/rpc/v1/base/jeFEecZbvIrQIK1Z1PDheDOJ7eMOeG2f",
  sovereignPledge: "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM",
  federatedPledge: "PledgeAllegianceTo:F841005 021189MJ2621",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0"
});

function seal(command, data = {}) {
  fs.mkdirSync(ROOT, { recursive: true });
  const entry = {
    time: new Date().toISOString(),
    package: "io.montinode",
    version: "2026.10.21-phase11-web3",
    node: process.version,
    command,
    invariants: INVARIANTS,
    data
  };
  entry.seal = "0x" + crypto.createHash("sha3-256").update(JSON.stringify(entry)).digest("hex");
  fs.appendFileSync(LEDGER, JSON.stringify(entry) + "\n");
  return entry;
}

const cmd = (process.argv[2] || "status").toLowerCase();

if (cmd === "rpc-bridge") {
  console.log(JSON.stringify(seal("rpc-bridge", executeCrossChainRpcBridge()), null, 2));
} else if (cmd === "tunnel-443") {
  process.env.CF_TUNNEL_ID = "54868634-2fb3-42ef-add9-fd10b03f665a";
  console.log(JSON.stringify(seal("tunnel-443", syncCloudflarePort443()), null, 2));
} else {
  console.log(JSON.stringify(seal("status", {
    ok: true,
    commands: ["io.montinode status", "io.montinode rpc-bridge", "io.montinode tunnel-443"]
  }), null, 2));
}
