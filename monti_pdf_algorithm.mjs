// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
/**
 * ============================================================================
 * MODULE        : monti_pdf_algorithm.mjs
 * HARDWARE ID   : MONTI_ANSI_F841005
 * CONTAINER     : F841005WV22ZL01
 * LICENSE       : Monti Private License (MPL-F841005-V1)
 * AUTHORITY     : MONTI^JOHN^CHARLES^MONTI
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export class MontiPdfGenerator {
  constructor() {
    this.hardwareId = "MONTI_ANSI_F841005";
    this.container = "F841005WV22ZL01";
    this.operator = "JOHN CHARLES MONTI";
    this.license = "Monti Private License (MPL-F841005-V1)";
  }

  buildPdfStream(title, contentBody) {
    const timestamp = new Date().toISOString();
    const pdfHeader = `%PDF-1.7\n%\n`;
    
    const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
    const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n`;
    const obj4 = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
    
    const streamContent = `BT\n/F1 12 Tf\n50 700 Td\n(MONTI PRIVATE LICENSE DOCUMENT: ${title}) Tj\n0 -20 Td\n(Operator: ${this.operator} [${this.hardwareId}]) Tj\n0 -20 Td\n(Timestamp: ${timestamp}) Tj\n0 -40 Td\n(${contentBody}) Tj\nET`;
    const obj5 = `5 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`;

    const body = obj1 + obj2 + obj3 + obj4 + obj5;
    const xrefOffset = pdfHeader.length + body.length;
    
    const xref = `xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000235 00000 n \n0000000301 00000 n \n`;
    const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    const fullPdf = pdfHeader + body + xref + trailer;
    const seal = "0x" + crypto.createHash("sha3-256").update(fullPdf).digest("hex");

    return {
      pdfBuffer: Buffer.from(fullPdf, 'binary'),
      entrySeal: seal
    };
  }
}

if (process.argv[1]?.endsWith('monti_pdf_algorithm.mjs')) {
  const generator = new MontiPdfGenerator();
  const result = generator.buildPdfStream("Sovereign Compliance & License", "All rights reserved under Monti Private License.");
  const outputPath = path.join(process.env.HOME || '.', 'engine_cluster', 'monti_output.pdf');
  fs.writeFileSync(outputPath, result.pdfBuffer);
  console.log("================================================================================");
  console.log("[✓] MONTIPDF ALGORITHM EXECUTED SUCCESSFULLY");
  console.log("    Output Path        :", outputPath);
  console.log("    Cryptographic Seal :", result.entrySeal);
  console.log("================================================================================");
}
