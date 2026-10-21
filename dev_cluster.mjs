import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function mapNullToMontiNull(obj) {
  if (obj === null) return "montiNULL";
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

const DEV_INVARIANTS = Object.freeze({
  environment: "DEVELOPMENT",
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI",
  biometricHealthAnchor: {
    code: "F841005 DD 021189MJ2911",
    state: "VERIFIED_OPTIMAL_HEALTHY"
  },
  committeeDomain: "attorneymode.com",
  enhancedUriEndpoint: "https://workforce.attorneymode.com/v1/update?hardware_id=MONTI_ANSI_F841005&biometric_code=F841005_DD_021189MJ2911&health_status=HEALTHY&utc_slot=2026-10-18T15%3A52%3A48.322Z",
  engineStatus: {
    status: "PRECLUDE_ERRNO_SUCCESS_NO_MODULE_NOT_FOUND",
    processedDigest: "0xc161b9077ad9e7d8c967450c99803de08ae2710ceb377250b6e874a18c131b6b"
  },
  policy: "PRECLUDE_TAW",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  entrySeal: "0x8ab396c70fe6f51b63e672dcf27155f3473797d10d75420d16da7d69875a145e"
});

const DEV_HEADERS = Object.freeze({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Monti-Hardware-ID, X-Biometric-Anchor",
  "X-Monti-Environment": "DEVELOPMENT",
  "X-Monti-Hardware-ID": DEV_INVARIANTS.hardwareId,
  "X-Monti-Container-Profile": DEV_INVARIANTS.container,
  "X-Monti-Authority": DEV_INVARIANTS.authority,
  "X-Biometric-Anchor": DEV_INVARIANTS.biometricHealthAnchor.code,
  "X-Monti-Policy": DEV_INVARIANTS.policy,
  "X-Monti-Proof": DEV_INVARIANTS.keccakProof,
  "X-Monti-Bill-Of-Disclaimer": "MONTI_ANSI_F841005_ACT_999_ENFORCED"
});

function createDevServer(port, serviceName) {
  const srv = http.createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, DEV_HEADERS);
      return res.end();
    }

    const payload = mapNullToMontiNull({
      event: "MONTI_DEV_CLUSTER_HEARTBEAT",
      status: "DEV_ONLINE_OPTIMAL",
      port,
      service: serviceName,
      success: null,
      errors: null,
      ...DEV_INVARIANTS,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, DEV_HEADERS);
    res.end(JSON.stringify(payload, null, 2));
  });

  srv.listen(port, "127.0.0.1", () => {
    console.log(`[✓] Dev Server Port ${port} Active :: ${serviceName}`);
  });
}

// Bind Development Listeners
createDevServer(8089, "Dev Apex Gateway Router");
createDevServer(8441, "Dev Repository Engine");
createDevServer(8491, "Dev MCP Neural Gateway");
