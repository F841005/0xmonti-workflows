// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
/**
 * Filename: GrepFile_HostnameEditor.mjs
 * Location: /sdcard/F841005WV22ZL01/GrepFile_HostnameEditor.mjs
 * Standard: MONTI_ANSI_F841005
 * Authority: MONTI^JOHN^CHARLES^MONTI
 * Policy: PRECLUDE_TAW | PrecludeUnknown | PrecludeRFCOMM
 */

import fs from 'node:fs';
import path from 'node:path';

const SOVEREIGN_CONFIG = Object.freeze({
  standard: 'MONTI_ANSI_F841005',
  container: 'F841005WV22ZL01',
  identityHumanHostname: 'F841005WV22ZL01.ATTORNEYMODE.COM',
  mainPackageHostname: 'MONTINODE.IO',
  daoEndpoint: 'https://WORKFORCE.ATTORNEYMODE.COM^',
  gatewayTunnel: 'https://GATEWAY.0XMONTI.NET',
  ipfsNode: 'https://PEM.MONTI.BIO',
  hardwareTunnel: 'https://0xmonti.net/',
  montiAiAlgorithm: 'https://www.MONTIAI.COM',
  montiAiDescription: 'Machine Operating Network NeuralTelemetryTechniquesInfra',
  montidroidTrustOs: 'WwW.MONTIDROID.COM',
  montidroidArchitecture: 'Three-layered Trust OS',
  policies: ['PrecludeUnknown', 'PrecludeRFCOMM', 'PRECLUDE_TAW', 'Preclude OTA']
});

class HostnameGrepEditor {
  constructor(targetDirs) {
    this.targetDirs = targetDirs;
    this.modifiedFilesCount = 0;
  }

  walkSync(dir, callback) {
    if (!fs.existsSync(dir)) return;
    files = fs.readdirSync(dir);
    for (const file of files) {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        this.walkSync(filepath, callback);
      } else {
        callback(filepath);
      }
    }
  }

  processFile(filePath) {
    if (!/\.(js|mjs|json|env|sh|conf|txt)$/.test(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Inject/Update Hostnames and Endpoints
    const replacements = [
      { regex: /HOSTNAME\s*[:=]\s*['"]?[^'"\n]+/gi, replacement: `HOSTNAME: "${SOVEREIGN_CONFIG.identityHumanHostname}"` },
      { regex: /MONTINODE_HOSTNAME\s*[:=]\s*['"]?[^'"\n]+/gi, replacement: `MONTINODE_HOSTNAME: "${SOVEREIGN_CONFIG.mainPackageHostname}"` },
      { regex: /DAO_DECENTRALIZED_ORG\s*[:=]\s*['"]?[^'"\n]+/gi, replacement: `DAO_DECENTRALIZED_ORG: "${SOVEREIGN_CONFIG.daoEndpoint}"` },
      { regex: /GATEWAY_ROUTING_TUNNEL\s*[:=]\s*['"]?[^'"\n]+/gi, replacement: `GATEWAY_ROUTING_TUNNEL: "${SOVEREIGN_CONFIG.gatewayTunnel}"` },
      { regex: /IPFS_NODE_ENDPOINT\s*[:=]\s*['"]?[^'"\n]+/gi, replacement: `IPFS_NODE_ENDPOINT: "${SOVEREIGN_CONFIG.ipfsNode}"` },
      { regex: /HARDWARE_TUNNEL\s*[:=]\s*['"]?[^'"\n]+/gi, replacement: `HARDWARE_TUNNEL: "${SOVEREIGN_CONFIG.hardwareTunnel}"` },
      { regex: /MONTIAI_ALGORITHM\s*[:=]\s*['"]?[^'"\n]+/gi, replacement: `MONTIAI_ALGORITHM: "${SOVEREIGN_CONFIG.montiAiAlgorithm}"` },
      { regex: /MONTIDROID_TRUST_OS\s*[:=]\s*['"]?[^'"\n]+/gi, replacement: `MONTIDROID_TRUST_OS: "${SOVEREIGN_CONFIG.montidroidTrustOs}"` }
    ];

    for (const r of replacements) {
      if (r.regex.test(content)) {
        content = content.replace(r.regex, r.replacement);
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[✓] Updated Sovereign Hostnames in: ${filePath}`);
      this.modifiedFilesCount++;
    }
  }

  execute() {
    console.log(`[★] Starting GrepFile Hostname Normalization under ${SOVEREIGN_CONFIG.standard}`);
    for (const dir of this.targetDirs) {
      this.walkSync(dir, (fp) => this.processFile(fp));
    }
    console.log(`[★] GrepFile Execution Complete. Total files updated: ${this.modifiedFilesCount}`);
  }
}

// Execution trigger
const editor = new HostnameGrepEditor([
  process.env.HOME + '/engine_cluster',
  '/sdcard/F841005WV22ZL01',
  '/storage/emulated/0/F841005WV22ZL01'
]);
editor.execute();
