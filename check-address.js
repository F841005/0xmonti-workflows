#!/usr/bin/env node
/**
 * File: ~/io.montinode/check-address.js
 * Purpose: Connect to the 0xmonti.net / montinode.io JSON-RPC Gateway (or fallback RPCs)
 *          to verify addresses and query live blockchain state.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const RPC_ENDPOINTS = [
  process.env.RPC_URL,
  "http://127.0.0.1:8545",
  "https://ethereum-rpc.publicnode.com",
  "https://1rpc.io/eth",
  "https://eth.drpc.org"
].filter(Boolean);

const DEFAULT_ADDRESSES = [
  { label: "MONTI Brave Wallet", address: "0x558Bc5A144326f54b8414680E8962F7ba8F5C7a4" },
  { label: "EVM Treasury", address: "0xb04110847A563E59F3D52d1aFB3304068173830b" },
  { label: "Base L2 Signer", address: "0x9E2F7A1C3D8B0E4F6A2C8D5E9F1B7A3C0D8E2F4A" }
];

function isValidEvmFormat(addr) {
  return typeof addr === "string" && /^0x[0-9a-fA-F]{40}$/.test(addr);
}

function getCaseType(addr) {
  const hex = addr.slice(2);
  if (hex === hex.toLowerCase()) return "all-lowercase";
  if (hex === hex.toUpperCase()) return "all-uppercase";
  return "mixed-case (EIP-55 style)";
}

async function queryRpcWithFailover(address) {
  let lastError = "No RPC endpoints available";
  for (const rpcUrl of RPC_ENDPOINTS) {
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          { jsonrpc: "2.0", id: 1, method: "eth_getBalance", params: [address, "latest"] },
          { jsonrpc: "2.0", id: 2, method: "eth_getTransactionCount", params: [address, "latest"] }
        ]),
        signal: AbortSignal.timeout(6000)
      });

      if (!response.ok) {
        lastError = `${rpcUrl} -> HTTP ${response.status}`;
        continue;
      }

      const results = await response.json();
      const balHex = Array.isArray(results)
        ? results.find(r => r.id === 1)?.result || "0x0"
        : "0x0";
      const txHex = Array.isArray(results)
        ? results.find(r => r.id === 2)?.result || "0x0"
        : "0x0";

      const wei = BigInt(balHex);
      const ethWhole = wei / (10n ** 18n);
      const ethFrac = (wei % (10n ** 18n)).toString().padStart(18, "0").slice(0, 6);

      return {
        online: true,
        endpoint: rpcUrl,
        ingressHeader: response.headers.get("x-ingress-domain") || "direct",
        serviceHeader: response.headers.get("x-blockchain-service") || "upstream",
        balanceWei: wei.toString(),
        balanceEth: `${ethWhole}.${ethFrac} ETH`,
        nonce: Number(BigInt(txHex))
      };
    } catch (err) {
      lastError = `${rpcUrl} -> ${err.message}`;
    }
  }
  return { online: false, error: lastError };
}

function getGitState() {
  try {
    const head = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    const shortHead = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    const prevShort = execSync("git rev-parse --short HEAD~1", { encoding: "utf8" }).trim();
    return { head, transition: `${prevShort}..${shortHead}` };
  } catch {
    return { head: "unknown", transition: "unknown" };
  }
}

async function main() {
  const cliArgs = process.argv.slice(2);
  const targets =
    cliArgs.length > 0
      ? cliArgs.map((addr, i) => ({ label: `CLI Argument #${i + 1}`, address: addr }))
      : DEFAULT_ADDRESSES;

  console.log("================================================================");
  console.log("EVM ADDRESS & JSON-RPC VERIFICATION UTILITY (ESM)");
  console.log(`Node.js Runtime : ${process.version}`);
  console.log(`Working Dir     : ${process.cwd()}`);
  console.log("================================================================\n");

  for (const item of targets) {
    const valid = isValidEvmFormat(item.address);
    console.log(`[Target]  ${item.label}`);
    console.log(`  Address : ${item.address}`);
    console.log(`  Valid   : ${valid ? "YES (20-byte hex)" : "NO (Invalid EVM hex format)"}`);

    if (valid) {
      console.log(`  Casing  : ${getCaseType(item.address)}`);
      const rpcData = await queryRpcWithFailover(item.address);
      if (rpcData.online) {
        console.log(`  RPC     : ${rpcData.endpoint} [${rpcData.ingressHeader} -> ${rpcData.serviceHeader}]`);
        console.log(`  Balance : ${rpcData.balanceEth} (${rpcData.balanceWei} wei)`);
        console.log(`  TxCount : ${rpcData.nonce}`);
      } else {
        console.log(`  RPC     : Offline or unreachable (${rpcData.error})`);
      }
    }
    console.log("----------------------------------------------------------------");
  }

  const gitState = getGitState();
  console.log(`[Repository Git State]`);
  console.log(`  HEAD Commit  : ${gitState.head}`);
  console.log(`  Transition   : ${gitState.transition}`);
}

main();
