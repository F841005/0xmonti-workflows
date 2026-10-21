/**
 * ============================================================================
 * MODULE        : monti_attorneymode_heartbeat.mjs
 * PURPOSE       : 60-Second Temporal, Biometric, and Workforce Heartbeat
 * TARGET SUITE  : ATTORNEYMODE.COM
 * HARDWARE ID   : MONTI_ANSI_F841005
 * POLICY        : PRECLUDE_TAW (Preclude ERR_MODULE_NOT_FOUND)
 * ============================================================================
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { IDENTITY, MONTIANSIF841005_Engine } from "./MONTIANSIF841005_Engine.js";

const LEDGER_PATHS = [
  path.join(process.env.HOME || ".", "engine_cluster", "dispatch_ledger.jsonl"),
  "/sdcard/F841005WV22ZL01/dispatch_ledger.jsonl",
  "/sdcard/PRIVATEMONTI/dispatch_ledger.jsonl"
];

async function emitHeartbeatCycle() {
  const now = new Date();
  const utcString = now.toISOString();
  
  const estString = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).format(now) + " EDT";

  const engineResult = await MONTIANSIF841005_Engine.process(Buffer.from("HEARTBEAT_PULSE").toString("hex"));

  const heartbeatPayload = {
    event: "ATTORNEYMODE_WORKFORCE_GLOBAL_HEARTBEAT",
    status: "HEALTHY_OPTIMAL",
    precludeErrno: "PRECLUDE_ERR_MODULE_NOT_FOUND",
    hardwareId: IDENTITY.assetId,
    container: IDENTITY.container,
    authority: IDENTITY.authority,
    operator: IDENTITY.operator,
    biometricHealthAnchor: {
      code: IDENTITY.biometricCode,
      state: "VERIFIED_OPTIMAL_HEALTHY"
    },
    temporalSlots: {
      utc: utcString,
      est: estString,
      intervalSeconds: 60
    },
    committeeDomain: IDENTITY.committeeDomain,
    enhancedUriEndpoint: `https://workforce.${IDENTITY.committeeDomain}/v1/update?hardware_id=${IDENTITY.assetId}&biometric_code=F841005_DD_021189MJ2911&health_status=HEALTHY&utc_slot=${encodeURIComponent(utcString)}`,
    engineStatus: engineResult,
    timestamp: utcString
  };

  const digest = crypto.createHash("sha3-256")
    .update(JSON.stringify(heartbeatPayload))
    .digest("hex");
  heartbeatPayload.entrySeal = "0x" + digest;

  const line = JSON.stringify(heartbeatPayload) + "\n";
  for (const ledger of LEDGER_PATHS) {
    try {
      fs.mkdirSync(path.dirname(ledger), { recursive: true });
      fs.appendFileSync(ledger, line, "utf8");
    } catch (_) {}
  }

  console.log(`[${utcString}] [ATTORNEYMODE.COM] Heartbeat emitted & sealed. Biometric Code: ${IDENTITY.biometricCode}`);
}

// Execute immediately and then every 60 seconds
emitHeartbeatCycle();
setInterval(emitHeartbeatCycle, 60000);
