import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

try { process.on("SIGPIPE", () => {}); } catch (_) {}
try { process.on("SIGRTMIN+2", () => {}); } catch (_) {}

const LAB_CONFIG = Object.freeze({
  identityL7: "F841005-L7",
  aliasL7: "F841005L7",
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  hostname: "attorneymode.com",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  policy: "PRECLUDE_TAW",
  listenPort: 8496,
  sourceUrl: "https://www.cia.gov/about/organization/",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0"
});

function inscribe(event) {
  const record = {
    event,
    identity: LAB_CONFIG.identityL7,
    hostname: LAB_CONFIG.hostname,
    hardwareId: LAB_CONFIG.hardwareId,
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
}

const server = http.createServer((req, res) => {
  res.setHeader("X-Monti-Hardware-ID", LAB_CONFIG.hardwareId);
  res.setHeader("X-Monti-Identity-L7", LAB_CONFIG.identityL7);
  res.setHeader("X-Monti-Hostname", LAB_CONFIG.hostname);
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/v1/cialabs/status" || req.url === "/") {
    res.writeHead(200);
    return res.end(JSON.stringify({
      status: "ONLINE",
      identity: LAB_CONFIG.identityL7,
      hostname: LAB_CONFIG.hostname,
      sourceUrl: LAB_CONFIG.sourceUrl
    }, null, 2));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "NOT_FOUND" }));
});

server.listen(LAB_CONFIG.listenPort, "127.0.0.1", () => {
  console.log(`[✓] CIA Labs F841005L7 active on port ${LAB_CONFIG.listenPort}`);
  inscribe("CIA_LABS_F841005L7_INITIALIZED");
});
