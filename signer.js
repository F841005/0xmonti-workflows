// File: $HOME/engine_cluster/signer.js
import crypto from "node:crypto";

export class PayloadSigner {
  constructor(secretKey) {
    if (!secretKey || secretKey.length < 32) {
      throw new Error("A secret key of at least 32 characters is required.");
    }
    this.secretKey = secretKey;
  }

  // Canonicalize object keys so property order does not break verification
  canonicalize(payload) {
    if (typeof payload === "string") return payload;
    return JSON.stringify(payload, Object.keys(payload).sort());
  }

  sign(payload) {
    const data = this.canonicalize(payload);
    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(data)
      .digest("hex");

    return { payload, signature };
  }

  verify(payload, signature) {
    const expected = this.sign(payload).signature;
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }
}

// Self-test when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const secret = process.env.SIGNING_SECRET || crypto.randomBytes(32).toString("hex");
  const signer = new PayloadSigner(secret);

  const sample = { task: "inference_routing", model: "local-test" };
  const signed = signer.sign(sample);

  console.log("Signed output:", signed);
  console.log("Verification:", signer.verify(sample, signed.signature));
}
