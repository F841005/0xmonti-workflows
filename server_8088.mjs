import http from 'node:http';

const PORT = process.env.PORT || 8088;
const EXPECTED_CONTAINER = "F841005WV22ZL01";
const HARDWARE_ID = "MONTI_ANSI_F841005";

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Monti-Hardware-ID', HARDWARE_ID);
  res.setHeader('X-Monti-Container-Profile', EXPECTED_CONTAINER);

  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200);
    return res.end(JSON.stringify({ 
      status: 'ONLINE', 
      container: EXPECTED_CONTAINER, 
      hardwareId: HARDWARE_ID,
      timestamp: new Date().toISOString() 
    }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'NOT_FOUND', container: EXPECTED_CONTAINER }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[✓] Monti Sovereign Daemon active on http://127.0.0.1:${PORT}`);
});
