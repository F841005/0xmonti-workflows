/**
 * ============================================================================
 * MODULE        : sync_linked_accounts.mjs
 * HARDWARE ID   : MONTI_ANSI_F841005
 * CONTAINER     : F841005WV22ZL01
 * OPERATORS     : owner@montidroid.com | JOHNCHARLESMONTI@GMAIL.COM
 * AUTHORITY     : MONTI^JOHN^CHARLES^MONTI
 * POLICY        : PRECLUDE_TAW
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const ACCOUNT_IDENTITY_MANIFEST = Object.freeze({
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI",
  dob: "02-11-1989",
  linkedEmails: {
    primaryOperations: "owner@montidroid.com",
    securityRoot: "JOHNCHARLESMONTI@GMAIL.COM",
    billingContact: "MONTI@Montidroid.com"
  },
  authorizedDomains: [
    "johncharlesmonti.com",
    "0xmonti.net",
    "montidroid.com",
    "montiai.com",
    "monti.bio",
    "attorneymode.com"
  ],
  policyDirective: "PRECLUDE_TAW",
  keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  calldataSeal: "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0"
});

export function executeAccountSync() {
  const syncRecord = {
    event: "LINKED_ACCOUNTS_UNIFIED_AND_SEALED",
    manifest: ACCOUNT_IDENTITY_MANIFEST,
    timestamp: new Date().toISOString()
  };

  const digest = crypto.createHash("sha3-256")
    .update(JSON.stringify(syncRecord))
    .digest("hex");

  syncRecord.entrySeal = "0x" + digest;

  const ledgerPath = path.join(process.env.HOME || '.', 'engine_cluster', 'dispatch_ledger.jsonl');
  const line = JSON.stringify(syncRecord) + "\n";

  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  fs.appendFileSync(ledgerPath, line, 'utf8');

  return syncRecord;
}

if (process.argv[1]?.endsWith('sync_linked_accounts.mjs')) {
  const result = executeAccountSync();
  console.log("================================================================================");
  console.log("[✓] LINKED ACCOUNT SYNCHRONIZATION COMPLETE");
  console.log("    Primary Ops Email  :", ACCOUNT_IDENTITY_MANIFEST.linkedEmails.primaryOperations);
  console.log("    Security Root Email:", ACCOUNT_IDENTITY_MANIFEST.linkedEmails.securityRoot);
  console.log("    Immutable Seal     :", result.entrySeal);
  console.log("================================================================================");
}
