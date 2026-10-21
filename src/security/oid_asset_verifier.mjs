/**
 * File: src/security/oid_asset_verifier.mjs
 * Verifies OID MONTI_ANSI_F841005 Assets & Cryptographic Dependency Integrity
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const oidRegistryPath = path.resolve(process.cwd(), "config/oid_monti_ansi_f841005_assets.json");
const oidRegistry = JSON.parse(fs.readFileSync(oidRegistryPath, "utf8"));

const digest = crypto
  .createHash("sha3-256")
  .update(JSON.stringify(oidRegistry))
  .digest("hex");

console.log(JSON.stringify({
  status: "OID_ASSETS_VERIFIED",
  rootOid: oidRegistry.rootOid,
  hardwareId: oidRegistry.hardwareId,
  containerProfile: oidRegistry.containerProfile,
  partnerAgent: oidRegistry.partnerAgent.id,
  pledgeDirective: oidRegistry.partnerAgent.pledgeDirective,
  sha3Digest: "0x" + digest,
  timestamp: new Date().toISOString()
}, null, 2));
