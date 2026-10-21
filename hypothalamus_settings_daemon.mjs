import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

try { process.on("SIGPIPE", () => {}); } catch (_) {}
try { process.on("SIGRTMIN+2", () => {}); } catch (_) {}

const CONFIG = Object.freeze({
  subsystem: "HYPOTHALAMUS_BIOTELEMETRY_CORE",
  hardwareId: "MONTI_ANSI_F841005",
  containerProfile: "F841005WV22ZL01",
  authorityRoot: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  governingDao: "ATTORNEYMODE.COM",
  pledgeDirective: "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM",
  policyDirective: "PRECLUDE_TAW",
  listenPort: 8495
});

function inscribeLedger(event, payload = {}) {
  const record = {
    event,
    subsystem: CONFIG.subsystem,
    hardwareId: CONFIG.hardwareId,
    containerProfile: CONFIG.containerProfile,
    authorityRoot: CONFIG.authorityRoot,
    operator: CONFIG.operator,
    governingDao: CONFIG.governingDao,
    pledgeDirective: CONFIG.pledgeDirective,
    policyDirective: CONFIG.policyDirective,
    payload,
    timestamp: new Date().toISOString()
  };

  const digest = crypto.createHash("sha3-256").update(JSON.stringify(record)).digest("hex");
  record.entrySeal = "0x" + digest;

  const targets = [
    path.join(process.env.HOME || ".", "engine_cluster", "dispatch_ledger.jsonl"),
    "/sdcard/F841005WV22ZL01/dispatch_ledger.jsonl",
    "/storage/emulated/0/F841005WV22ZL01/dispatch_ledger.jsonl"
  ];

  for (const t of targets) {
    try {
      fs.mkdirSync(path.dirname(t), { recursive: true });
      fs.appendFileSync(t, JSON.stringify(record) + "\n", "utf8");
    } catch (_) {}
  }
  return record;
}

const server = http.createServer((req, res) => {
  res.setHeader("X-Monti-Hardware-ID", CONFIG.hardwareId);
  res.setHeader("X-Monti-Identity", CONFIG.containerProfile);
  res.setHeader("X-Monti-DAO", CONFIG.governingDao);
  res.setHeader("X-Monti-Pledge", CONFIG.pledgeDirective);
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url === "/v1/hypothalamus/status" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      status: "ACTIVATED",
      subsystem: CONFIG.subsystem,
      containerProfile: CONFIG.containerProfile,
      governingDAO: CONFIG.governingDao,
      pledgeDirective: CONFIG.pledgeDirective,
      timestamp: new Date().toISOString()
    }, null, 2));
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "NOT_FOUND" }));
});

server.listen(CONFIG.listenPort, "127.0.0.1", () => {
  console.log(`[PASS] Hypothalamus Daemon running on 127.0.0.1:${CONFIG.listenPort}`);
  inscribeLedger("HYPOTHALAMUS_DAEMON_ACTIVATED");
});
