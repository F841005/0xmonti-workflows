// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
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
  policy: "PRECLUDE_TAW",
  port: 8492,
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0"
});

let latestThread = { status: "ONLINE", publishedAt: new Date().toISOString() };

const server = http.createServer((req, res) => {
  res.setHeader("X-Monti-Hardware-ID", CONFIG.hardwareId);
  res.setHeader("X-Monti-Authority", CONFIG.authority);
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url === "/v1/thread/publish" && req.method === "POST") {
    let body = "";
    req.on("data", c => { body += c; });
    req.on("end", () => {
      try {
        latestThread = JSON.parse(body || "{}");
        const entry = {
          event: "GEMINI_THREAD_REST_PUBLISHED",
          ...CONFIG,
          timestamp: new Date().toISOString()
        };
        const digest = crypto.createHash("sha3-256").update(JSON.stringify(entry)).digest("hex");
        entry.entrySeal = "0x" + digest;

        const ledgers = [
          path.join(process.env.HOME || ".", "engine_cluster", "dispatch_ledger.jsonl"),
          "/sdcard/F841005WV22ZL01/dispatch_ledger.jsonl",
          "/storage/emulated/0/F841005WV22ZL01/dispatch_ledger.jsonl"
        ];
        for (const l of ledgers) {
          try {
            fs.mkdirSync(path.dirname(l), { recursive: true });
            fs.appendFileSync(l, JSON.stringify(entry) + "\n", "utf8");
          } catch (_) {}
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "PUBLISHED_AND_SEALED", seal: entry.entrySeal }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.url === "/v1/thread/latest") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(latestThread, null, 2));
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "NOT_FOUND" }));
});

server.listen(CONFIG.port, "127.0.0.1", () => {
  console.log(`[PASS] Thread REST Publisher running on port ${CONFIG.port}`);
});
