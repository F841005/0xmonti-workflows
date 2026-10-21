import http from "node:http";

const PORT = Number(process.env.PORT || 8088);

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });

  res.end(JSON.stringify({
    status: "ONLINE",
    service: "gateway",
    port: PORT,
    url: req.url,
    timestamp: new Date().toISOString()
  }, null, 2) + "\n");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Gateway listening on http://127.0.0.1:${PORT}`);
});
