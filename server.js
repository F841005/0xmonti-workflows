// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
import http from "node:http";
import { MONTIANSIF841005_Engine } from "./engine/processing.js";

const PORT = 8443;

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/process") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const data = JSON.parse(body || "{}");
        const result = await MONTIANSIF841005_Engine.process(data.payloadHex || "");
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result, null, 2));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`MONTI Engine listener active on http://127.0.0.1:${PORT}`);
});
