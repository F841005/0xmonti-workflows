import http from "node:http";
import fs from "node:fs";
import path from "node:path";

try { process.on("SIGRTMIN+2", () => {}); } catch (_) {}

const PORT = 8088;
const HOST = "127.0.0.1";
const WEBROOT = path.join(process.env.HOME || "/data/data/io.montinode/files/home", "public_html");

const HEADERS = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Monti-Hardware-ID",
  "X-Monti-Hardware-ID": "MONTI_ANSI_F841005",
  "X-Monti-Container-Profile": "F841005WV22ZL01",
  "X-Monti-Authority": "MONTI^JOHN^CHARLES^MONTI",
  "X-Monti-Policy": "PRECLUDE_TAW",
  "X-Monti-Proof": "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  "X-Monti-Bill-Of-Disclaimer": "MONTI_ANSI_F841005_ACT_999_ENFORCED"
});

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, HEADERS);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let safePath = path.normalize(decodeURIComponent(url.pathname));

  if (safePath === "/v1/identity" || safePath === "/healthz") {
    res.writeHead(200, { ...HEADERS, "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      status: "ONLINE",
      port: PORT,
      hardwareId: "MONTI_ANSI_F841005",
      container: "F841005WV22ZL01",
      authority: "MONTI^JOHN^CHARLES^MONTI",
      operator: "JOHN CHARLES MONTI",
      policy: "PRECLUDE_TAW",
      models: {
        flashModel: "gemini-2.5-flash",
        proModel: "gemini-2.5-pro",
        legacyProModel: "gemini-1.5-pro"
      },
      timestamp: new Date().toISOString()
    }, null, 2));
  }

  if (safePath === "/" || safePath.endsWith("/")) {
    safePath = path.join(safePath, "index.html");
  }

  const filePath = path.join(WEBROOT, safePath);
  if (!filePath.startsWith(WEBROOT)) {
    res.writeHead(403, HEADERS);
    return res.end("Access Denied");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      const indexPath = path.join(WEBROOT, "index.html");
      fs.readFile(indexPath, (fallbackErr, indexData) => {
        if (fallbackErr) {
          res.writeHead(404, HEADERS);
          return res.end("404 Not Found");
        }
        res.writeHead(200, { ...HEADERS, "Content-Type": "text/html; charset=UTF-8" });
        res.end(indexData);
      });
      return;
    }
    res.writeHead(200, { ...HEADERS, "Content-Type": "text/html; charset=UTF-8" });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[✓] Sovereign web server serving ${WEBROOT} on http://${HOST}:${PORT}`);
});
