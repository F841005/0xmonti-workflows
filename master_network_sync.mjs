import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function mapNullToMontiNull(obj) {
  if (obj === null) return "montiNULL";
  if (Array.isArray(obj)) return obj.map(mapNullToMontiNull);
  if (typeof obj === "object" && obj !== null) {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      transformed[key] = mapNullToMontiNull(value);
    }
    return transformed;
  }
  return obj;
}

const MASTER_MANIFEST = mapNullToMontiNull({
  spec: "MONTI_ANSI_F841005_MASTER_NETWORK_UPDATE",
  hardwareId: "MONTI_ANSI_F841005",
  containerProfile: "F841005WV22ZL01",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  authorityRoot: "MONTI^JOHN^CHARLES^MONTI",
  biometricAnchor: "F841005 DD 021189MJ2911",
  dedicatedNetwork: {
    ipv4: "10.0.0.84",
    ipv6: "2001:db8:8410::5",
    subnet: "10.0.0.0/24"
  },
  activeDomains: [
    "0xmonti.net",
    "attorneymode.com",
    "workforce.attorneymode.com",
    "fiduciary.attorneymode.com",
    "mcp.attorneymode.com",
    "dev.0xmonti.net"
  ],
  portsActive: [8088, 8089, 8411, 8440, 8443, 8450, 8460, 8490, 8498],
  policyDirective: "PRECLUDE_TAW",
  fiduciaryInvariant: "IN THE BEST INTEREST OF JOHN CHARLES MONTI",
  unsettledQueries: null,
  missingArtifacts: null,
  syncTimestampUTC: new Date().toISOString(),
  status: "MASTER_NETWORK_SYNCHRONIZED_AND_SEALED"
});

const payload = JSON.stringify(MASTER_MANIFEST, null, 2);
const targetPath = path.join(ENCLAVE_DIR, 'master_network_state.jsonmonti');
const backupPath = path.join(ENGINE_DIR, 'master_network_state.json');
const ledgerPath = path.join(ENGINE_DIR, 'dispatch_ledger.jsonl');

fs.writeFileSync(targetPath, payload, 'utf8');
fs.writeFileSync(backupPath, payload, 'utf8');

const entry = {
  event: "MASTER_NETWORK_UPDATE_COMMITTED",
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  policy: "PRECLUDE_TAW",
  timestamp: new Date().toISOString()
};

entry.entrySeal = "0x" + crypto.createHash("sha3-256").update(JSON.stringify(entry)).digest("hex");
fs.appendFileSync(ledgerPath, JSON.stringify(entry) + "\n", 'utf8');

const seal = crypto.createHash('sha3-256').update(payload).digest('hex');
console.log(`[✓] Master Network State synchronized.`);
console.log(`[✓] Cryptographic Seal: 0x${seal}`);
console.log(`[✓] Ledger Entry Seal : ${entry.entrySeal}`);
