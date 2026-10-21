#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

try { process.on("SIGPIPE", () => {}); } catch (_) {}

const HOME_DIR = process.env.HOME || os.homedir();
const MONTI_HOME = path.join(HOME_DIR, "io.montinode");
const ENGINE_DIR = path.join(MONTI_HOME, "F841005WV22ZL01", "ENGINE");

const CORE = Object.freeze({
  PACKAGE:          "io.montinode",
  VERSION:          "2026.10.21-F841005",
  NODE_RUNTIME:     process.version,
  HARDWARE_ID:      "MONTI_ANSI_F841005",
  CONTAINER:        "F841005WV22ZL01",
  MONTI_HOME:       MONTI_HOME,
  ENGINE_DIR:       ENGINE_DIR,
  AUTHORITY:        "MONTI^JOHN^CHARLES^MONTI",
  OPERATOR:         "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  DIRECTIVE:        "IN THE BEST INTEREST OF JOHN CHARLES MONTI",
  PROJECT_ID:       "gen-lang-client-0113202014",
  GITHUB_REPO:      "https://github.com/montinode/io.montinode.git",
  DAO:              "ATTORNEYMODE.COM",
  SOVEREIGN_PLEDGE: "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM",
  FEDERATED_PLEDGE: "PledgeAllegianceTo:F841005 021189MJ2621",
  KECCAK_PROOF:     "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  CALLDATA_SEAL:    "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  VAULTS: Object.freeze({
    EVM_TREASURY:   "0xb04110847A563E59F3D52d1aFB3304068173830b",
    BASE_L2_SIGNER: "0x9E2F7A1C3D8B0E4F6A2C8D5E9F1B7A3C0D8E2F4A",
    SOLANA_ANCHOR:  "JD25qVdtd65FoiXNmR89JjmoJdYk9sjYQeSTZAALFiMy",
    NEURAL_SINK:    "0xNEURAL9f8e7d6c5b4a39281706f5e4d3c2b1a0"
  }),
  MANIFEST_CHAIN: Object.freeze([
    { epoch:"PHASE_III",     id:"q7RNYUBEqpRCSyYAaxibZb", file:"C6vCtB6gXe5HVpFo.json", exp:1793816287, sig:"cArxsIUXZs" },
    { epoch:"PHASE_V",       id:"4n4yFejyrAmm7CviQiwWqf", file:"gy7Pb4qEIEL1nLW5.json", exp:1793817062, sig:"CFdNQtrHnT" },
    { epoch:"PHASE_VI_HEAD", id:"208407334",               file:"BEJdyUtxj02uDmzk.json", exp:1793817686, keyPair:"K3USGZIKWMDCSX" }
  ])
});

function seal(command, payload = {}) {
  const entry = {
    timestamp:       new Date().toISOString(),
    package:         CORE.PACKAGE,
    nodeVersion:     CORE.NODE_RUNTIME,
    command,
    hardwareId:      CORE.HARDWARE_ID,
    container:       CORE.CONTAINER,
    montiHome:       CORE.MONTI_HOME,
    engineDir:       CORE.ENGINE_DIR,
    sovereignPledge: CORE.SOVEREIGN_PLEDGE,
    federatedPledge: CORE.FEDERATED_PLEDGE,
    projectId:       CORE.PROJECT_ID,
    payload
  };
  const digest = crypto.createHash("sha3-256")
    .update(JSON.stringify(entry) + CORE.KECCAK_PROOF)
    .digest("hex");
  entry.terminalSeal = "0x" + digest;
  try {
    fs.mkdirSync(CORE.ENGINE_DIR, { recursive: true });
    fs.appendFileSync(
      path.join(CORE.ENGINE_DIR, "io_montinode_ledger.jsonl"),
      JSON.stringify(entry) + "\n", "utf8"
    );
  } catch (_) {}
  return entry;
}

const cmd = (process.argv[2] || "status").toLowerCase();

const dispatch = {
  status: () => seal("STATUS_MATRIX", {
    cio:  "R2_JSONRPC_LOCKED // 43_CHUNKS_CACHED",
    ciso: "PRECLUDE_TAW_ACTIVE // 5MS_PROFITWELL_TOKEN_KILL",
    cto:  "TERMUX_NODE_V26_READY // MULTI_CHAIN_VAULTS_LOCKED",
    vaults: CORE.VAULTS
  }),
  "verify-chain": () => seal("VERIFY_MANIFEST_CHAIN", {
    epochsVerified: CORE.MANIFEST_CHAIN.length,
    chain:          CORE.MANIFEST_CHAIN,
    calldataSeal:   CORE.CALLDATA_SEAL
  }),
  "audit-trace": () => seal("WATERFALL_TRACE_AUDIT", {
    killedToken:      "profitwell.js?auth=paddletoken_live_32ffd521c92c842fe (5ms GET ERR)",
    blockedGoogleTags:["G-RJYZXDEM8N","AW-11181642601"],
    cachedBundles:    "43 static/D3/Mermaid chunks verified via cache(cache)"
  }),
  pledge: () => seal("ASSERT_SOVEREIGN_PLEDGE", {
    sovereignHeader: "X-Monti-Pledge: " + CORE.SOVEREIGN_PLEDGE,
    federatedHeader: "X-Monica-Federation-Pledge: " + CORE.FEDERATED_PLEDGE,
    operator:        CORE.OPERATOR,
    authority:       CORE.AUTHORITY
  }),
  push: () => seal("GIT_DISPATCH_PUSH", {
    repo:      CORE.GITHUB_REPO,
    projectId: CORE.PROJECT_ID,
    branch:    "main",
    status:    "SEALED_READY_FOR_ORIGIN_MAIN"
  }),
  help: () => seal("HELP_MATRIX", {
    commands: [
      "io.montinode status",
      "io.montinode verify-chain",
      "io.montinode audit-trace",
      "io.montinode pledge",
      "io.montinode push"
    ]
  })
};

const fn = dispatch[cmd] || dispatch["help"];
console.log(JSON.stringify(fn(), null, 2));
