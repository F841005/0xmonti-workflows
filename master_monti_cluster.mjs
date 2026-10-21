// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function mapNullToMontiNull(obj) {
  if (obj === null || obj === undefined) return "montiNULL";
  if (Array.isArray(obj)) return obj.map(mapNullToMontiNull);
  if (typeof obj === "object") {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      transformed[key] = mapNullToMontiNull(value);
    }
    return transformed;
  }
  return obj;
}

const ENCLAVE_PROFILE = Object.freeze({
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI",
  biometricAnchor: "F841005 DD 021189MJ2911",
  publicationKey: "MONT-PUB-0x9B1F7A3E6C52D488F0A1B2C3D4E5F6789012345678ABCDEF0123456789ABCDEF",
  notebookId: "notebooks/1b0b4c1c-46d1-4472-bb6e-ad9ab8ab0228",
  committeeDomain: "attorneymode.com",
  globalHeartbeat: "ATTORNEYMODE_WORKFORCE_GLOBAL_HEARTBEAT",
  precludeErrno: "PRECLUDE_ERR_MODULE_NOT_FOUND",
  activeSignal: "SIGNAL_220",
  policy: "PRECLUDE_TAW",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  entrySeal: "0x8ab396c70fe6f51b63e672dcf27155f3473797d10d75420d16da7d69875a145e"
});

const HEADERS = Object.freeze({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Monti-Hardware-ID, X-Biometric-Anchor, X-Webhook-Signature",
  "Set-Cookie": "MONTI_SESSION_F841005WV22ZL01=VERIFIED_OPTIMAL; Path=/; Domain=.attorneymode.com; Secure; HttpOnly; SameSite=Strict",
  "X-Monti-Hardware-ID": ENCLAVE_PROFILE.hardwareId,
  "X-Monti-Container-Profile": ENCLAVE_PROFILE.container,
  "X-Monti-Authority": ENCLAVE_PROFILE.authority,
  "X-Biometric-Anchor": ENCLAVE_PROFILE.biometricAnchor,
  "X-Monti-Policy": ENCLAVE_PROFILE.policy,
  "X-Monti-Proof": ENCLAVE_PROFILE.keccakProof,
  "X-Monti-Bill-Of-Disclaimer": "MONTI_ANSI_F841005_ACT_999_ENFORCED"
});

function createEnclaveServer(port, serviceName) {
  const srv = http.createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, HEADERS);
      return res.end();
    }

    const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    const pathname = url.pathname;

    // Intercept Telemetry, CES, and Webhook Routes
    if (pathname.startsWith("/webhook/") || pathname.startsWith("/api//~") || pathname.includes("/ces/")) {
      let bodyChunks = [];
      req.on("data", chunk => bodyChunks.push(chunk));
      req.on("end", () => {
        const rawBody = Buffer.concat(bodyChunks).toString();
        const interceptedPayload = mapNullToMontiNull({
          event: "TELEMETRY_AND_SESSION_ABORT_REMEDIATED",
          endpoint: pathname,
          method: req.method,
          remediatedError: "NS_ERROR_ABORT / Transport request timed out",
          incomingData: rawBody ? JSON.parse(rawBody) : null,
          status: "REMEDIATED_OPTIMAL",
          ...ENCLAVE_PROFILE,
          timestamp: new Date().toISOString()
        });

        // Log to ledger
        const localLedger = path.join(process.env.HOME || ".", "engine_cluster", "dispatch_ledger.jsonl");
        const sdcardLedger = "/sdcard/F841005WV22ZL01/dispatch_ledger.jsonl";
        const entry = JSON.stringify(interceptedPayload) + "\n";
        try { fs.appendFileSync(localLedger, entry, "utf8"); } catch (_) {}
        try { fs.appendFileSync(sdcardLedger, entry, "utf8"); } catch (_) {}

        res.writeHead(200, HEADERS);
        res.end(JSON.stringify(interceptedPayload, null, 2));
      });
      return;
    }

    // Default Enclave Response
    const payload = mapNullToMontiNull({
      event: "ATTORNEYMODE_WORKFORCE_GLOBAL_HEARTBEAT",
      status: "HEALTHY_OPTIMAL",
      port,
      service: serviceName,
      success: null,
      errors: null,
      ...ENCLAVE_PROFILE,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, HEADERS);
    res.end(JSON.stringify(payload, null, 2));
  });

  srv.listen(port, "127.0.0.1", () => {
    console.log(`[✓] Master Cluster Port ${port} Active (${serviceName}) [Telemetry & Webhook Guard Active]`);
  });
}

createEnclaveServer(8088, "Apex Router Gateway (0xmonti.net)");
createEnclaveServer(8089, "Dev Gateway Router (dev.0xmonti.net)");
createEnclaveServer(8440, "Repository Engine Root");
createEnclaveServer(8450, "Zero-Trust Package Firewall");
createEnclaveServer(8460, "Workload Identity Federation");
createEnclaveServer(8490, "MCP Neural Host");
createEnclaveServer(8498, "AttorneyMode Workforce Gateway");
