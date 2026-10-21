import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const PORT = Number(process.env.MONITOR_PORT || 8490);
const keyPath = path.join(process.env.HOME, ".config", "engine_cluster", "signing.key");

const SECRET = (process.env.SIGNING_SECRET || fs.readFileSync(keyPath, "utf8")).trim();
if (!SECRET || SECRET.length < 32) {
  throw new Error("Refusing to start: SIGNING_SECRET must be at least 32 characters.");
}

const server = http.createServer((req, res) => {
  const payload = {
    status: "ok",
    service: "throughput_monitor",
    timestamp: new Date().toISOString(),
    nonce: crypto.randomBytes(16).toString("hex")
  };

  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const signature = crypto.createHmac("sha256", SECRET).update(canonical).digest("hex");

  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ ...payload, signature }, null, 2) + "\n");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`throughput_monitor listening on http://127.0.0.1:${PORT}`);
});
