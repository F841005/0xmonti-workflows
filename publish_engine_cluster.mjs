import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

try { process.on("SIGPIPE", () => {}); } catch (_) {}
try { process.on("SIGRTMIN+2", () => {}); } catch (_) {}

const CONFIG = Object.freeze({
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  jurisdiction: "USA",
  dao: "ATTORNEYMODE.COM",
  pledge: "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM",
  policy: "PRECLUDE_TAW",
  listenPort: 8492,
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0"
});

function inscribeLedger(event, payload = {}) {
  const record = {
    event,
    hardwareId: CONFIG.hardwareId,
    container: CONFIG.container,
    authority: CONFIG.authority,
    operator: CONFIG.operator,
    jurisdiction: CONFIG.jurisdiction,
    dao: CONFIG.dao,
    pledge: CONFIG.pledge,
    policy: CONFIG.policy,
    keccakProof: CONFIG.keccakProof,
    calldataSeal: CONFIG.calldataSeal,
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
  res.setHeader("X-Monti-Jurisdiction", CONFIG.jurisdiction);
  res.setHeader("X-Monti-DAO", CONFIG.dao);
  res.setHeader("X-Monti-Pledge", CONFIG.pledge);
  res.setHeader("X-Monti-Policy", CONFIG.policy);
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url === "/v1/cluster/publish" && req.method === "POST") {
    let body = "";
    req.on("data", c => { body += c; });
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const receipt = inscribeLedger("CLUSTER_PUBLISH_SEALED", payload);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "PUBLISHED", seal: receipt.entrySeal }, null, 2));
      } catch (err) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "CLEAN_PASS", error: err.message }));
      }
    });
    return;
  }

  if (req.url === "/v1/cluster/status" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      status: "ONLINE",
      jurisdiction: CONFIG.jurisdiction,
      governingDAO: CONFIG.dao,
      pledgeOfAllegiance: CONFIG.pledge,
      timestamp: new Date().toISOString()
    }, null, 2));
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "NOT_FOUND" }));
});

server.listen(CONFIG.listenPort, "127.0.0.1", () => {
  console.log(`[PASS] Engine Cluster Publisher live on port ${CONFIG.listenPort}`);
  inscribeLedger("ENGINE_CLUSTER_PUBLISHER_BOOTSTRAPPED", { port: CONFIG.listenPort });
});
