import http from 'node:http';
import crypto from 'node:crypto';

const CLUSTER_CONFIG = Object.freeze({
  hardwareId: 'MONTI_ANSI_F841005',
  container: 'F841005WV22ZL01',
  identityAnchor: 'F841005-L7',
  authority: 'MONTI^JOHN^CHARLES^MONTI',
  operator: 'JOHN CHARLES MONTI',
  biometricCode: 'F841005 DD 021189MJ2911',
  committeeDomain: 'attorneymode.com',
  services: {
    'attorneymode.com (Apex Gateway)': 8088,
    'legal.attorneymode.com (Statutory Arbiter)': 8472,
    'telemetry.attorneymode.com (Biometric Health)': 8475,
    'cialabs.attorneymode.com (Research Matrix)': 8496
  },
  secretKey: process.env.MONTI_HMAC_KEY || '0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369'
});

function startService(port, designation) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-AttorneyMode-Domain', CLUSTER_CONFIG.committeeDomain);
    res.setHeader('X-Monti-Hardware-ID', CLUSTER_CONFIG.hardwareId);
    res.setHeader('X-Monti-Container', CLUSTER_CONFIG.container);
    res.setHeader('X-Monti-Authority', CLUSTER_CONFIG.authority);

    // GET Identity & Health Route
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/v1/identity')) {
      const payload = {
        status: 'ONLINE',
        service: designation,
        domain: CLUSTER_CONFIG.committeeDomain,
        hardwareId: CLUSTER_CONFIG.hardwareId,
        container: CLUSTER_CONFIG.container,
        identityAnchor: CLUSTER_CONFIG.identityAnchor,
        authority: CLUSTER_CONFIG.authority,
        operator: CLUSTER_CONFIG.operator,
        biometricHealthAnchor: {
          code: CLUSTER_CONFIG.biometricCode,
          state: 'VERIFIED_OPTIMAL_HEALTHY'
        },
        timestamp: new Date().toISOString()
      };
      res.writeHead(200);
      return res.end(JSON.stringify(payload, null, 2));
    }

    // POST Cryptographic Token Verification Route
    if (req.method === 'POST' && (url.pathname === '/v1/verify' || url.pathname === '/v1/update')) {
      let body = '';
      for await (const chunk of req) body += chunk;

      try {
        const parsed = JSON.parse(body);
        const token = parsed.token || '';
        const parts = token.split(':');
        
        if (parts.length < 5) {
          res.writeHead(400);
          return res.end(JSON.stringify({ status: 'REJECTED', reason: 'INVALID_TOKEN_STRUCTURE' }));
        }

        const [protocol, version, container, tokenBody, providedHmac] = parts;

        if (container !== CLUSTER_CONFIG.container) {
          res.writeHead(401);
          return res.end(JSON.stringify({ status: 'REJECTED', reason: 'CONTAINER_MISMATCH', got: container }));
        }

        const message = `${protocol}:${version}:${container}:${tokenBody}`;
        const expectedHmac = crypto.createHmac('sha256', CLUSTER_CONFIG.secretKey).update(message).digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(providedHmac, 'hex'), Buffer.from(expectedHmac, 'hex'))) {
          res.writeHead(401);
          return res.end(JSON.stringify({ status: 'REJECTED', reason: 'CRYPTOGRAPHIC_SIGNATURE_MISMATCH' }));
        }

        const successPayload = {
          status: 'VERIFIED_CRYPTOGRAPHICALLY',
          service: designation,
          hardwareId: CLUSTER_CONFIG.hardwareId,
          container: CLUSTER_CONFIG.container,
          operator: CLUSTER_CONFIG.operator,
          committeeDomain: CLUSTER_CONFIG.committeeDomain,
          timestamp: new Date().toISOString()
        };

        const canonical = JSON.stringify(successPayload, Object.keys(successPayload).sort());
        successPayload.entrySeal = '0x' + crypto.createHash('sha3-256').update(canonical).digest('hex');

        res.writeHead(200);
        return res.end(JSON.stringify(successPayload, null, 2));

      } catch (err) {
        res.writeHead(400);
        return res.end(JSON.stringify({ status: 'BAD_REQUEST', error: err.message }));
      }
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'ROUTE_NOT_FOUND', path: url.pathname, domain: CLUSTER_CONFIG.committeeDomain }));
  });

  server.on('error', (err) => {
    console.error(`[-] Service [${designation}] on port ${port} failed:`, err.message);
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`[✓] AttorneyMode Service [${designation}] active on http://127.0.0.1:${port}`);
  });
}

Object.entries(CLUSTER_CONFIG.services).forEach(([designation, port]) => {
  startService(port, designation);
});
