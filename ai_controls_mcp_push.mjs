import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const payload = {
  account_id: "872786663072ddf92e73024b52f74048",
  server_id: "monti-ansi-f841005",
  name: "MONTI_ANSI_F841005 Secure MCP Server",
  endpoint_url: "https://gateway.0xmonti.net/mcp",
  route_through_gateway: true,
  authentication_type: "oauth",
  oauth_credentials: "automatic",
  hardware_id: "MONTI_ANSI_F841005",
  container_profile: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  policy: "PRECLUDE_TAW",
  fiduciaryInvariant: "IN THE BEST INTEREST OF JOHN CHARLES MONTI",
  timestamp: new Date().toISOString()
};

const payloadString = JSON.stringify(payload, null, 2);
const ledgerPath = "/storage/emulated/0/F841005WV22ZL01/dispatch_ledger.jsonl";
const entrySeal = "0x" + crypto.createHash("sha3-256").update(payloadString).digest("hex");

const sealedRecord = { ...payload, entrySeal };

try {
  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  fs.appendFileSync(ledgerPath, JSON.stringify(sealedRecord) + "\n", "utf8");
  console.log("[✓] MCP AI Controls synchronization successfully sealed:", entrySeal);
} catch (e) {
  console.warn("[-] SDCARD write fallback:", e.message);
  fs.writeFileSync(path.join(process.env.HOME, "ai_controls_sealed.json"), JSON.stringify(sealedRecord, null, 2));
}
