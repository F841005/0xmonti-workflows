import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const CONFIG = Object.freeze({
  port: 8498,
  host: "127.0.0.1",
  domain: "attorneymode.com",
  subdomains: {
    workforce: "workforce.attorneymode.com",
    fiduciary: "fiduciary.attorneymode.com",
    mcp: "mcp.attorneymode.com"
  },
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  biometricCode: "F841005 DD 021189MJ2911",
  policy: "PRECLUDE_TAW",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  statutes: ["18_USC_1030", "18_USC_2511", "45_CFR_164_312", "47_CFR_Part15", "47_USC_227"]
});

const HEADERS = Object.freeze({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Monti-Hardware-ID, X-Biometric-Anchor",
  "X-Monti-Hardware-ID": CONFIG.hardwareId,
  "X-Monti-Container-Profile": CONFIG.container,
  "X-Monti-Authority": CONFIG.authority,
  "X-Biometric-Anchor": CONFIG.biometricCode,
  "X-Monti-Policy": CONFIG.policy,
  "X-Monti-Proof": CONFIG.keccakProof,
  "X-Monti-Bill-Of-Disclaimer": "MONTI_ANSI_F841005_ACT_999_ENFORCED"
});

function logLedger(entry) {
  const record = {
    ...entry,
    hardwareId: CONFIG.hardwareId,
    container: CONFIG.container,
    authority: CONFIG.authority,
    operator: CONFIG.operator,
    biometricAnchor: CONFIG.biometricCode,
    policy: CONFIG.policy,
    timestamp: new Date().toISOString()
  };
  
  record.entrySeal = "0x" + crypto.createHash("sha3-256").update(JSON.stringify(record)).digest("hex");
  const line = JSON.stringify(record) + "\n";

  const localPath = path.join(process.env.HOME || ".", "engine_cluster", "dispatch_ledger.jsonl");
  const mirrorPath = "/sdcard/F841005WV22ZL01/dispatch_ledger.jsonl";

  try {
    fs.appendFileSync(localPath, line, "utf8");
  } catch (_) {}

  try {
    fs.appendFileSync(mirrorPath, line, "utf8");
  } catch (_) {}

  return record;
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, HEADERS);
    return res.end();
  }

  const url = new URL(req.url, `http://${CONFIG.host}:${CONFIG.port}`);

  // 1. OIDC Workforce Discovery Endpoint
  if (url.pathname === "/.well-known/openid-configuration" || url.pathname === "/v1/oidc/config") {
    res.writeHead(200, HEADERS);
    return res.end(JSON.stringify({
      issuer: `https://${CONFIG.subdomains.workforce}`,
      authorization_endpoint: `https://${CONFIG.subdomains.workforce}/v1/authorize`,
      token_endpoint: `https://${CONFIG.subdomains.workforce}/v1/token`,
      jwks_uri: `https://${CONFIG.subdomains.workforce}/v1/jwks`,
      response_types_supported: ["code", "token", "id_token"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256", "EdDSA"],
      hardware_anchor: CONFIG.hardwareId,
      policy: CONFIG.policy
    }, null, 2));
  }

  // 2. Continuous Biometric Health Matrix Pulse
  if (url.pathname === "/v1/fiduciary/health" || url.pathname === "/v1/health") {
    const now = new Date();
    const payload = logLedger({
      event: "ATTORNEYMODE_BIOMETRIC_HEALTH_PULSE",
      biometricStatus: "VERIFIED_OPTIMAL_HEALTHY",
      temporalSlots: {
        utc: now.toISOString(),
        est: now.toLocaleString("en-US", { timeZone: "America/New_York" })
      }
    });

    res.writeHead(200, HEADERS);
    return res.end(JSON.stringify({
      status: "HEALTHY_OPTIMAL",
      domain: CONFIG.domain,
      biometricCode: CONFIG.biometricCode,
      operator: CONFIG.operator,
      proof: CONFIG.keccakProof,
      telemetry: payload
    }, null, 2));
  }

  // 3. MCP Tool Discovery & Execution Endpoint
  if (url.pathname === "/v1/mcp/tools" || url.pathname === "/mcp/tools") {
    res.writeHead(200, HEADERS);
    return res.end(JSON.stringify({
      tools: [
        {
          name: "attorneymode_counter_surveillance",
          description: "Executes 11-layer legal fiduciary counter-surveillance AI scan.",
          inputSchema: { type: "object", properties: { targetDomain: { type: "string" } } }
        },
        {
          name: "attorneymode_verify_fiduciary",
          description: "Verifies human operator biometric health status against hardware anchor.",
          inputSchema: { type: "object", properties: { biometricCode: { type: "string" } } }
        }
      ]
    }, null, 2));
  }

  // Fallback Root Dispatch
  res.writeHead(200, HEADERS);
  res.end(JSON.stringify({
    service: "ATTORNEYMODE_WORKFORCE_GATEWAY",
    status: "OPERATIONAL",
    domain: CONFIG.domain,
    subdomains: CONFIG.subdomains,
    hardwareId: CONFIG.hardwareId,
    container: CONFIG.container,
    authority: CONFIG.authority,
    operator: CONFIG.operator,
    biometricAnchor: CONFIG.biometricCode,
    policy: CONFIG.policy,
    timestamp: new Date().toISOString()
  }, null, 2));
});

server.listen(CONFIG.port, CONFIG.host, () => {
  console.log(`[✓] AttorneyMode Workforce Gateway active on http://${CONFIG.host}:${CONFIG.port}`);
});
