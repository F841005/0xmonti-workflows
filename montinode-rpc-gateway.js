cd ~/io.montinode

cat > montinode-rpc-gateway.js <<'EOF'
#!/usr/bin/env node
/**
 * File: ~/io.montinode/montinode-rpc-gateway.js
 * Purpose: JSON-RPC 2.0 Gateway & Broadcast Relay for 0xmonti.net -> montinode.io
 * Listens on 0.0.0.0:8545 so any PC on the network (or via 0xmonti.net tunnel) can connect.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const PORT = Number(process.env.PORT || 8545);
const HOST = process.env.HOST || "0.0.0.0";

// Upstream EVM RPC endpoints used for live state & transaction broadcasting
const UPSTREAM_RPCS = [
  process.env.UPSTREAM_RPC,
  "https://ethereum-rpc.publicnode.com",
  "https://1rpc.io/eth",
  "https://eth.drpc.org"
].filter(Boolean);

// Helper to get local LAN IP addresses so the network PC knows where to connect
function getLanAddresses() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

// Forward standard JSON-RPC calls (including eth_sendRawTransaction) to upstream nodes
async function forwardToUpstream(rpcPayload) {
  let lastError = "All upstream RPC nodes unreachable";
  const bodyStr = JSON.stringify(rpcPayload);

  for (const upstream of UPSTREAM_RPCS) {
    try {
      const res = await fetch(upstream, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
        signal: AbortSignal.timeout(7000)
      });

      if (!res.ok) {
        lastError = `${upstream} returned HTTP ${res.status}`;
        continue;
      }

      const data = await res.json();
      return { ok: true, upstream, data };
    } catch (err) {
      lastError = `${upstream} error: ${err.message}`;
    }
  }

  return { ok: false, error: lastError };
}

// Handle custom monti_* JSON-RPC methods locally
function handleLocalMontiMethod(reqObj) {
  const { id = 1, method } = reqObj;

  if (method === "monti_nodeStatus") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        ingressDomain: "0xmonti.net",
        serviceNode: "montinode.io",
        status: "ONLINE",
        timestamp: new Date().toISOString(),
        registeredWallets: {
          montiBraveWallet: "0x558Bc5A144326f54b8414680E8962F7ba8F5C7a4",
          evmTreasury: "0xb04110847A563E59F3D52d1aFB3304068173830b",
          baseL2Signer: "0x9E2F7A1C3D8B0E4F6A2C8D5E9F1B7A3C0D8E2F4A"
        }
      }
    };
  }

  if (method === "monti_getLifetimeManifest") {
    const manifestPath = path.resolve(process.cwd(), "config/lifetime_history.jsonrpc.json");
    if (fs.existsSync(manifestPath)) {
      const content = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      return { jsonrpc: "2.0", id, result: content };
    }
    return { jsonrpc: "2.0", id, error: { code: -32004, message: "Lifetime manifest not found" } };
  }

  return null;
}

const server = http.createServer(async (req, res) => {
  // Set CORS & domain routing headers for 0xmonti.net / montinode.io
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("X-Ingress-Domain", "0xmonti.net");
  res.setHeader("X-Blockchain-Service", "montinode.io");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Health/status discovery endpoint for browser or curl checks from the network PC
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify(
        {
          ingress: "0xmonti.net",
          service: "montinode.io",
          protocol: "JSON-RPC 2.0",
          status: "ACTIVE",
          listenPort: PORT,
          lanEndpoints: getLanAddresses().map(ip => `http://${ip}:${PORT}`),
          supportedMethods: [
            "monti_nodeStatus",
            "monti_getLifetimeManifest",
            "eth_chainId",
            "eth_blockNumber",
            "eth_getBalance",
            "eth_getTransactionCount",
            "eth_sendRawTransaction",
            "eth_call"
          ]
        },
        null,
        2
      )
    );
  }

  if (req.method === "POST") {
    let rawBody = "";
    req.on("data", chunk => {
      rawBody += chunk;
    });

    req.on("end", async () => {
      let parsed;
      try {
        parsed = JSON.parse(rawBody);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } })
        );
      }

      // Check if it's a single local monti_* call
      if (!Array.isArray(parsed) && parsed.method?.startsWith("monti_")) {
        const localResp = handleLocalMontiMethod(parsed);
        if (localResp) {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify(localResp));
        }
      }

      // Log broadcasts when eth_sendRawTransaction is invoked
      const isBroadcast = Array.isArray(parsed)
        ? parsed.some(r => r.method === "eth_sendRawTransaction")
        : parsed.method === "eth_sendRawTransaction";

      if (isBroadcast) {
        console.log(`[${new Date().toISOString()}] [BROADCAST] Relaying eth_sendRawTransaction via montinode.io...`);
      }

      // Forward single or batch JSON-RPC request to upstream blockchain RPC
      const upstreamResult = await forwardToUpstream(parsed);
      if (upstreamResult.ok) {
        res.setHeader("X-Upstream-RPC", upstreamResult.upstream);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(upstreamResult.data));
      } else {
        res.writeHead(502, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id: parsed?.id || null,
            error: { code: -32603, message: "Upstream RPC unreachable", data: upstreamResult.error }
          })
        );
      }
    });
  }
});

server.listen(PORT, HOST, () => {
  const lanIps = getLanAddresses();
  console.log("================================================================");
  console.log("0XMONTI.NET -> MONTINODE.IO JSON-RPC GATEWAY & BROADCAST RELAY");
  console.log("================================================================");
  console.log(`Local Binding   : http://127.0.0.1:${PORT}`);
  for (const ip of lanIps) {
    console.log(`Network PC URL  : http://${ip}:${PORT}`);
  }
  console.log("================================================================");
});
EOF

chmod +x montinode-rpc-gateway.js
