import { createHash } from "node:crypto";
import { stripVTControlCharacters } from "node:util";

export const SOVEREIGN_CONFIG = Object.freeze({
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  policy: "PRECLUDE_TAW",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  models: Object.freeze({
    flashModel: "gemini-2.5-flash",
    proModel: "gemini-2.5-pro",
    legacyProModel: "gemini-1.5-pro"
  })
});

export const FUNCTION_REGISTRY = Object.freeze({
  "0xa9059cbb": { standard: "EIP-20 / BEP-20", name: "transfer", signature: "transfer(address,uint256)", params: ["recipient", "amount"] },
  "0x095ea7b3": { standard: "EIP-20 / BEP-20", name: "approve", signature: "approve(address,uint256)", params: ["spender", "amount"] },
  "0x23b872dd": { standard: "EIP-20 / BEP-20", name: "transferFrom", signature: "transferFrom(address,address,uint256)", params: ["sender", "recipient", "amount"] },
  "0x70a08231": { standard: "EIP-20 / BEP-20", name: "balanceOf", signature: "balanceOf(address)", params: ["account"] },
  "0xdd62ed3e": { standard: "EIP-20 / BEP-20", name: "allowance", signature: "allowance(address,address)", params: ["owner", "spender"] },
  "0x18160ddd": { standard: "EIP-20 / BEP-20", name: "totalSupply", signature: "totalSupply()", params: [] },
  "0xd5054bf8": { standard: "EIP-2612", name: "permit", signature: "permit(address,address,uint256,uint256,uint8,bytes32,bytes32)", params: ["owner", "spender", "value", "deadline", "v", "r", "s"] },
  "0x7ecebe00": { standard: "EIP-2612", name: "nonces", signature: "nonces(address)", params: ["owner"] },
  "0x3644e515": { standard: "EIP-712", name: "DOMAIN_SEPARATOR", signature: "DOMAIN_SEPARATOR()", params: [] },
  "0x1fad948c": { standard: "EIP-4337", name: "handleOps", signature: "handleOps((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes)[],address)", params: ["ops", "beneficiary"] }
});

export class UniversalEipBepParser {
  static sanitize(text) {
    if (typeof text !== "string") return "";
    const clean = stripVTControlCharacters(text);
    const prohibited = [/com\.apple\./i, /apple-cloudkit/i, /com\.google\./i, /googleapis\.com/i, /disa\.mil/i, /nra-code/i, /\brad\b/i];
    for (const p of prohibited) {
      if (p.test(clean)) throw new Error(`[COUNTER_FRAUD_VIOLATION] Prohibited pattern: ${p.toString()}`);
    }
    return clean;
  }

  static parseSiweMessage(rawText) {
    const cleanText = UniversalEipBepParser.sanitize(rawText).trim();
    const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new Error("Invalid EIP-4361 text: insufficient line count");

    const domainMatch = lines[0].match(/^(.+)\s+wants you to sign in with your Ethereum account:$/i);
    const domain = domainMatch ? domainMatch[1].trim() : null;
    const address = lines[1].match(/^0x[a-fA-F0-9]{40}$/) ? lines[1] : null;

    let statement = null;
    const fields = {};
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      const sep = line.indexOf(":");
      if (sep !== -1) {
        fields[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
      } else if (!statement && !line.includes(":")) {
        statement = line;
      }
    }

    return {
      icon: "📜",
      standard: "EIP-4361",
      domain,
      address,
      statement,
      uri: fields["URI"] || null,
      version: fields["Version"] || "1",
      chainId: fields["Chain ID"] ? Number(fields["Chain ID"]) : null,
      nonce: fields["Nonce"] || null,
      issuedAt: fields["Issued At"] || null
    };
  }

  static parseFunctionOrCalldata(input) {
    const clean = UniversalEipBepParser.sanitize(input).trim();
    if (/^0x[0-9a-fA-F]{8,}/.test(clean)) {
      const selector = clean.slice(0, 10).toLowerCase();
      const payloadHex = clean.slice(10);
      const known = FUNCTION_REGISTRY[selector];
      return {
        icon: "⚡",
        type: "HEX_CALLDATA",
        selector,
        standard: known ? known.standard : "CUSTOM_OR_UNINDEXED",
        functionName: known ? known.name : "unknown",
        signature: known ? known.signature : null,
        rawPayload: "0x" + payloadHex
      };
    }
    const sigMatch = clean.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\((.*)\)$/);
    if (sigMatch) {
      return {
        icon: "🖋️",
        type: "TEXT_SIGNATURE",
        functionName: sigMatch[1],
        parameters: sigMatch[2].split(",").map(p => p.trim()).filter(Boolean),
        computedSelectorKeccak: "0x" + createHash("sha3-256").update(clean).digest("hex").slice(0, 8)
      };
    }
    throw new Error("Unable to parse input format.");
  }
}

console.log("[✓] 🛡️ Universal EIP/BEP Parser compiled and ready.");
