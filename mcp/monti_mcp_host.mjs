import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const CONFIG = Object.freeze({
  port: 8490,
  host: "127.0.0.1",
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  policy: "PRECLUDE_TAW",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  protocolString: "monti_string:80000002"
});

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Monti-Hardware-ID",
  "X-Monti-Hardware-ID": CONFIG.hardwareId,
  "X-Monti-Authority": CONFIG.authority,
  "X-Monti-Policy": CONFIG.policy,
  "X-Monti-Proof": CONFIG.keccakProof
};

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, HEADERS);
    return res.end();
  }

  const url = new URL(req.url, `http://${CONFIG.host}:${CONFIG.port}`);

  // MCP Resource Discovery
  if (req.method === "GET" && (url.pathname === "/mcp/resources" || url.pathname === "/mcp")) {
    res.writeHead(200, HEADERS);
    return res.end(JSON.stringify({
      status: "ONLINE",
      server: "MONTI_ANSI_F841005_MCP_HOST",
      resources: [
        {
          uri: "monti://memory/mind",
          name: "MONTI_ANSI_F841005 Neural Core State",
          mimeType: "application/json"
        },
        {
          uri: "monti://workspace/index",
          name: "Staged index.html Target",
          mimeType: "text/html"
        }
      ],
      ...CONFIG
    }, null, 2));
  }

  // MCP Execution Router
  if (req.method === "POST" && (url.pathname === "/mcp/execute" || url.pathname === "/v1/mcp")) {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        const seal = "0x" + crypto.createHash("sha3-256").update(body + CONFIG.keccakProof).digest("hex");
        
        const responseData = {
          status: "MCP_TRANSACTION_COMMITTED",
          mind: CONFIG.hardwareId,
          authority: CONFIG.authority,
          policy: CONFIG.policy,
          seal,
          received: payload,
          timestamp: new Date().toISOString()
        };

        const ledgerPath = path.join(process.env.HOME || ".", "engine_cluster", "dispatch_ledger.jsonl");
        fs.appendFileSync(ledgerPath, JSON.stringify(responseData) + "\n", "utf8");

        res.writeHead(200, HEADERS);
        return res.end(JSON.stringify(responseData, null, 2));
      } catch (err) {
        res.writeHead(400, HEADERS);
        return res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(200, HEADERS);
  res.end(JSON.stringify({
    server: "MONTI_ANSI_F841005_MCP_HOST",
    status: "ONLINE",
    port: CONFIG.port,
    ...CONFIG
  }, null, 2));
});

server.listen(CONFIG.port, CONFIG.host, () => {
  console.log(`[✓] MONTI MCP Host listening on http://${CONFIG.host}:${CONFIG.port}`);
});
