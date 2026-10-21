// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MontiAISovereignEngine } from './engine/sovereign_gateway_core.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8494;
const engine = new MontiAISovereignEngine();
const PUBLIC_DIR = path.join(__dirname, 'public_html');

// In-memory challenge store with automated 5-minute memory pruning
const sessionChallenges = new Map();
const CHALLENGE_TIMEOUT_MS = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  let pruneCount = 0;
  for (const [userId, sessionData] of sessionChallenges.entries()) {
    if (now - sessionData.timestamp > CHALLENGE_TIMEOUT_MS) {
      sessionChallenges.delete(userId);
      pruneCount++;
    }
  }
  if (pruneCount > 0) {
    console.log(`[CLEANUP] Pruned ${pruneCount} expired WebAuthn validation contexts from heap.`);
  }
}, 60000);

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/api/v1/auth/register-options' && req.method === 'POST') {
        res.setHeader('Content-Type', 'application/json');
        try {
            const userId = crypto.randomBytes(16).toString('hex');
            const options = engine.generateWebAuthnChallenge(userId);
            
            sessionChallenges.set(userId, { 
                challenge: options.challenge, 
                timestamp: Date.now() 
            });

            res.writeHead(200);
            res.end(JSON.stringify({ status: 'SUCCESS', userId, options }));
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ status: 'ERROR', message: err.message }));
        }
        return;
    }

    if (parsedUrl.pathname === '/api/v1/auth/register-response' && req.method === 'POST') {
        res.setHeader('Content-Type', 'application/json');
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const userId = req.headers['x-user-id'];
                const stored = sessionChallenges.get(userId);
                if (!stored) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ status: 'ERROR', message: 'Challenge expired or not found.' }));
                    return;
                }
                sessionChallenges.delete(userId);
                res.writeHead(200);
                res.end(JSON.stringify({ status: 'SUCCESS', message: 'Hardware anchor verified under PRECLUDE_TAW.' }));
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ status: 'ERROR', message: err.message }));
            }
        });
        return;
    }

    if (parsedUrl.pathname === '/api/v1/verify') {
        res.setHeader('Content-Type', 'application/json');
        const authHeader = req.headers['authorization'];
        try {
            engine.verifySovereignToken(authHeader);
            res.writeHead(200);
            res.end(JSON.stringify({ status: "SUCCESS", message: "Verified under PRECLUDE_TAW.", anchor: engine.hardwareAnchor }));
        } catch (err) {
            res.writeHead(403);
            res.end(JSON.stringify({ status: "BLOCKED", error: err.message }));
        }
        return;
    }

    let filePath = path.join(PUBLIC_DIR, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Sovereign Node Asset Not Found</h1>');
            return;
        }
        const ext = path.extname(filePath);
        let contentType = 'text/html';
        if (ext === '.js') contentType = 'application/javascript';
        if (ext === '.css') contentType = 'text/css';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[io.montinode] Sovereign Gateway active on port ${PORT}`);
});
