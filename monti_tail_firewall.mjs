// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
import fs from 'node:fs';
import path from 'node:path';

const logPath = path.join(process.env.HOME || '.', 'engine_cluster', 'tail_firewall.log');

export function evaluateTailPacket(packet) {
  const isExternal = packet.sourceIp !== '127.0.0.1' && !packet.sourceIp?.startsWith('10.');
  const hasProof = packet.headers?.['x-monti-proof'] === '0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369';

  if (isExternal && !hasProof) {
    const dropRecord = {
      timestamp: new Date().toISOString(),
      action: 'DROP_EXTERNAL_TAIL',
      sourceIp: packet.sourceIp,
      reason: 'UNAUTHENTICATED_EXTERNAL_SOURCE_PREEMPTED'
    };
    fs.appendFileSync(logPath, JSON.stringify(dropRecord) + '\n', 'utf8');
    return false;
  }
  return true;
}

console.log('[✓] MONTI Tail Firewall and 0xmonti port preclusion rules active.');
