// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
import http from "node:http";

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/" || req.url === "/v1/zerotrust/status") {
    res.writeHead(200);
    return res.end(JSON.stringify({
      status: "OPERATIONAL",
      hostname: "monti.0xmonti.net",
      hardwareId: "MONTI_ANSI_F841005",
      timestamp: new Date().toISOString()
    }));
  }
  res.writeHead(404);
  res.end(JSON.stringify({ error: "NOT_FOUND" }));
});

server.listen(8490, "127.0.0.1", () => {
  console.log("[origin] listening on 127.0.0.1:8490");
});
