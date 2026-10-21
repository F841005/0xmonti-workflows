import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

try { process.on("SIGPIPE", () => {}); } catch (_) {}
try { process.on("SIGRTMIN+2", () => {}); } catch (_) {}

const CONFIG = Object.freeze({
  fileName: "preclude_cia",
  organization: "ATTORNEYMODE.COM",
  hardwareId: "MONTI_ANSI_F841005",
  containerProfile: "F841005WV22ZL01",
  authorityRoot: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  policyDirective: "PRECLUDE_TAW",
  listenPort: 8498,
  precludedPatterns: ["cia.gov", "www.cia.gov", "cia.mil", "www.cia.mil", "cia", "fetch_cia_labs"]
});

function inscribeLedger(event, details = {}) {
  const record = {
    event,
    file: CONFIG.fileName,
    organization: CONFIG.organization,
    hardwareId: CONFIG.hardwareId,
    authority: CONFIG.authorityRoot,
    details,
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
  res.setHeader("X-Monti-Organization", CONFIG.organization);
  res.setHeader("X-Monti-Hardware-ID", CONFIG.hardwareId);
  res.setHeader("X-Monti-Authority", CONFIG.authorityRoot);
  res.setHeader("X-Monti-Policy", CONFIG.policyDirective);

  const urlLower = req.url.toLowerCase();
  const isCia = CONFIG.precludedPatterns.some(p => urlLower.includes(p));

  if (isCia) {
    inscribeLedger("CIA_MIL_GOV_PRECLUDED_AND_SEVERED", { path: req.url });
    res.writeHead(403, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      status: "PRECLUDED",
      organization: CONFIG.organization,
      reason: "CIA_MIL_AND_CIA_GOV_SEVERED_UNDER_ATTORNEYMODE"
    }));
  }

  if (req.url === "/v1/preclude/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      status: "ONLINE",
      file: CONFIG.fileName,
      organization: CONFIG.organization,
      precludedTargets: CONFIG.precludedPatterns
    }));
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "NOT_FOUND" }));
});

server.listen(CONFIG.listenPort, "127.0.0.1", () => {
  console.log(`[PASS] Module preclude_cia active on port ${CONFIG.listenPort}`);
  inscribeLedger("PRECLUDE_CIA_UPDATED_WITH_CIA_MIL");
});
