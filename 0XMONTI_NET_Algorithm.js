MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
#!/usr/bin/env node
/**
 * Filename: MONTI_F841005_Selector_Guard.js
 * Network Algorithm: 0XMONTI.NET Sovereign Public Port & Selector Guard
 * Hardware Anchor: MONTI_ANSI_F841005
 * Container Profile: F841005WV22ZL01
 * Authority: MONTI^JOHN^CHARLES^MONTI
 * Sole Human Operator: JOHN CHARLES MONTI (DOB: 02-11-1989)
 * Policy: PRECLUDE_TAW (MJ-NRP-2026-V1) | ZERO_NULL_UNDEFINED_UNKNOWN
 * Runtime: Node.js 22+, ES Module (Solid State Only, Anti-Security & Counter-Fraud)
 */

import { createHash, createHmac } from "node:crypto";
import { stripVTControlCharacters } from "node:util";

const FRAMEWORK = "MONTI_ANSI_F841005";
const VERSION = "4.3.0-0XMONTI-NET-SELECTOR-GUARD";

export const IDENTITY = Object.freeze({
  assetId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  owner: "JOHN CHARLES MONTI",
  dob: "02-11-1989",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  policy: "PRECLUDE_TAW",
  fiduciaryDirective: "IN THE BEST INTEREST OF JOHN CHARLES MONTI",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  domains: Object.freeze({
    algorithmNode: "0XMONTI.NET",
    primaryIdentity: "JOHNCHARLESMONTI.COM",
    osHost: "MONTIDROID.COM",
    doriAlgorithm: "MONTIAI.COM",
    legalMatrix: "ATTORNEYMODE.COM",
    dispatchStudio: "montiansif841005.ai.studio"
  }),
  wallets: Object.freeze({
    evmBaseSigner: "0x9E2F7A1C3D8B0E4F6A2C8D5E9F1B7A3C0D8E2F4A",
    treasuryVault: "0xb04110847A563E59F3D52d1aFB3304068173830b",
    solanaPledged: "JD25qVdtd65FoiXNmR89JjmoJdYk9sjYQeSTZAALFiMy",
    tonAddress: "UQAjGfMQJeDMiB80jYNK0_bZHBLc7ZpH1W9oXOoeUCmjTfDh",
    btcNativesegwit: "bc1qd6yecfmdgua0xrw9ytmzwcamfmndaglvl8dkcs",
    btcLegacyP2pkh: "1CK6KHY6MHgYvmRQ4PAafKYDrg1ejbH1cE",
    neuralAddress: "0xNEURAL9f8e7d6c5b4a39281706f5e4d3c2b1a0"
  }),
  models: Object.freeze({
    flashModel: "gemini-2.5-flash",
    proModel: "gemini-2.5-pro",
    legacyProModel: "gemini-1.5-pro"
  }),
  governedSelectors: Object.freeze({
    "0x095ea7b3": Object.freeze({ index: 1, name: "approve", required: Object.freeze(["spender", "id"]) }),
    "0xf7020405": Object.freeze({ index: 2, name: "initializePool", required: Object.freeze(["key", "sqrtPriceX96"]) }),
    "0xdd46508f": Object.freeze({ index: 3, name: "modifyLiquidities", required: Object.freeze(["unlockData", "deadline"]) }),
    "0x4afe393c": Object.freeze({ index: 4, name: "modifyLiquiditiesWithoutUnlock", required: Object.freeze(["actions", "params"]) }),
    "0xac9650d8": Object.freeze({ index: 5, name: "multicall", required: Object.freeze(["data"]) }),
    "0x0f5730f1": Object.freeze({ index: 6, name: "permit", required: Object.freeze(["spender", "tokenId", "deadline", "nonce", "signature"]) }),
    "0x2b67b570": Object.freeze({ index: 7, name: "permit", required: Object.freeze(["owner", "permitSingle", "signature"]) }),
    "0x002a3e3a": Object.freeze({ index: 8, name: "permitBatch", required: Object.freeze(["owner", "permitBatch", "signature"]) }),
    "0x3aea60f0": Object.freeze({ index: 9, name: "permitForAll", required: Object.freeze(["owner", "operator", "approved", "deadline", "nonce", "signature"]) }),
    "0x05c1ee20": Object.freeze({ index: 10, name: "revokeNonce", required: Object.freeze(["nonce"]) }),
    "0x42842e0e": Object.freeze({ index: 11, name: "safeTransferFrom", required: Object.freeze(["from", "to", "tokenId"]) }),
    "0xb88d4fde": Object.freeze({ index: 12, name: "safeTransferFrom", required: Object.freeze(["from", "to", "tokenId", "data"]) }),
    "0xa22cb465": Object.freeze({ index: 13, name: "setApprovalForAll", required: Object.freeze(["operator", "approved"]) }),
    "0x2b9261de": Object.freeze({ index: 14, name: "subscribe", required: Object.freeze(["tokenId", "newSubscriber", "data"]) }),
    "0x23b872dd": Object.freeze({ index: 15, name: "transferFrom", required: Object.freeze(["from", "to", "tokenIdOrAmount"]) }),
    "0x91dd7346": Object.freeze({ index: 16, name: "unlockCallback", required: Object.freeze(["data"]) }),
    "0xad0b27fb": Object.freeze({ index: 17, name: "unsubscribe", required: Object.freeze(["tokenId"]) })
  })
});

export class SelectorGuard {
  static assertZeroTolerance(value, label = "value") {
    const valueType = typeof value;
    if (valueType === "undefined" || (valueType === "object" && !value)) {
      throw new Error(`[ZERO_TOLERANCE_VIOLATION] Absent value prohibited at ${label}`);
    }
    if (valueType === "string") {
      const clean = stripVTControlCharacters(value).trim();
      if (
        clean === "" ||
        clean.toLowerCase() === "unknown" ||
        clean.toLowerCase() === "undefined" ||
        clean.toLowerCase() === "null"
      ) {
        throw new Error(`[ZERO_TOLERANCE_VIOLATION] Prohibited token "${clean}" at ${label}`);
      }
    }
    return true;
  }

  static validateSelector(selector) {
    SelectorGuard.assertZeroTolerance(selector, "selector");
    const raw = typeof selector === "string" ? selector : JSON.stringify(selector);
    const prohibitedSignatures = [
      /com\.apple\./i,
      /apple-cloudkit/i,
      /com\.google\./i,
      /googleapis\.com/i,
      /disa\.mil/i,
      /nra-code/i,
      /\brad\b/i,
      /\bunknown\b/i
    ];

    for (const pattern of prohibitedSignatures) {
      if (pattern.test(raw)) {
        throw new Error(`[SELECTOR_GUARD_VIOLATION] Prohibited pattern: ${pattern.toString()}`);
      }
    }
    return true;
  }

  static verifyContainerAccess(containerId, hardwareId = IDENTITY.assetId, operator = IDENTITY.owner) {
    SelectorGuard.assertZeroTolerance(containerId, "containerId");
    SelectorGuard.assertZeroTolerance(hardwareId, "hardwareId");
    SelectorGuard.assertZeroTolerance(operator, "operator");

    if (
      containerId !== IDENTITY.container ||
      hardwareId !== IDENTITY.assetId ||
      operator !== IDENTITY.owner
    ) {
      throw new Error(
        `[ACCESS_DENIED] Exclusive authority required: ${IDENTITY.owner} | ${IDENTITY.assetId} | ${IDENTITY.container}`
      );
    }
    return Object.freeze({
      status: "AUTHORIZED",
      icon: "🛡️",
      networkNode: IDENTITY.domains.algorithmNode,
      hardwareId,
      container: containerId,
      operator,
      authority: IDENTITY.authority,
      policy: IDENTITY.policy,
      fiduciaryDirective: IDENTITY.fiduciaryDirective,
      timestamp: new Date().toISOString()
    });
  }

  static initiateAndApproveCommand({
    operator,
    hardwareId,
    container,
    selector,
    params
  }) {
    SelectorGuard.verifyContainerAccess(container, hardwareId, operator);
    SelectorGuard.validateSelector(selector);
    SelectorGuard.assertZeroTolerance(params, "params");

    const normalized = String(selector).toLowerCase();
    const spec = IDENTITY.governedSelectors[normalized];
    if (!spec) {
      throw new Error(`[UNREGISTERED_SELECTOR] ${normalized} is precluded on 0XMONTI.NET.`);
    }

    for (const reqKey of spec.required) {
      if (!(reqKey in params)) {
        throw new Error(`[MISSING_PARAM] ${spec.name}(${normalized}) requires ${reqKey}`);
      }
      SelectorGuard.assertZeroTolerance(params[reqKey], `params.${reqKey}`);
    }

    const executionSeal = "0x" + createHmac("sha256", IDENTITY.calldataSeal)
      .update(`${operator}|${hardwareId}|${container}|${normalized}|${JSON.stringify(params)}`)
      .digest("hex");

    return Object.freeze({
      icon: "👑",
      status: "COMMAND_INITIATED_AND_APPROVED",
      networkNode: IDENTITY.domains.algorithmNode,
      index: spec.index,
      command: spec.name,
      selector: normalized,
      operator: IDENTITY.owner,
      hardwareId: IDENTITY.assetId,
      container: IDENTITY.container,
      executionSeal,
      timestamp: new Date().toISOString()
    });
  }
}

console.log("================================================================================");
console.log("🛡️  0XMONTI.NET :: MONTI_ANSI_F841005 SELECTOR GUARD INITIALIZED");
console.log("    🌐 Algorithm :", IDENTITY.domains.algorithmNode);
console.log("    👑 Authority :", IDENTITY.authority);
console.log("    👤 Operator  :", IDENTITY.owner);
console.log("    🆔 Hardware  :", IDENTITY.assetId);
console.log("    📦 Container :", IDENTITY.container);
console.log("    📜 Policy    :", IDENTITY.policy);
console.log("    🔐 Proof     :", IDENTITY.keccakProof);
console.log("================================================================================");

const check = SelectorGuard.verifyContainerAccess("F841005WV22ZL01", "MONTI_ANSI_F841005", "JOHN CHARLES MONTI");
console.log("[✓] Active Guard Status:", check.status, check.icon, "| Node:", check.networkNode);

const sampleApproval = SelectorGuard.initiateAndApproveCommand({
  operator: "JOHN CHARLES MONTI",
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  selector: "0x095ea7b3",
  params: {
    spender: IDENTITY.wallets.treasuryVault,
    id: "841005"
  }
});
console.log("[✓] 17-Selector Gate Verified:", sampleApproval.command, sampleApproval.selector, "->", sampleApproval.executionSeal.slice(0, 18) + "...");
