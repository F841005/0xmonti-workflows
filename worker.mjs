// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
/**
 * CLOUDFLARE WORKER: ATTORNEYMODE FIDUCIARY COUNTER-SURVEILLANCE FILTER
 * Domain: attorneymode.com
 * Hardware Anchor: MONTI_ANSI_F841005
 * Biometric Anchor: F841005 DD 021189MJ2911
 */

const INVARIANTS = Object.freeze({
  authority: "MONTI^JOHN^CHARLES^MONTI",
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  operator: "JOHN CHARLES MONTI",
  biometricCode: "F841005 DD 021189MJ2911",
  policy: "PRECLUDE_TAW",
  proof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369"
});

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Monti-Hardware-ID, X-Biometric-Anchor",
  "X-Monti-Hardware-ID": INVARIANTS.hardwareId,
  "X-Monti-Container-Profile": INVARIANTS.container,
  "X-Monti-Authority": INVARIANTS.authority,
  "X-Biometric-Anchor": INVARIANTS.biometricCode,
  "X-Monti-Policy": INVARIANTS.policy,
  "X-Monti-Proof": INVARIANTS.proof,
  "X-Monti-Bill-Of-Disclaimer": "MONTI_ANSI_F841005_ACT_999_ENFORCED"
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: HEADERS });
    }

    const url = new URL(request.url);

    // Filter non-compliant telemetry or unauthenticated administrative calls
    if (url.pathname.startsWith("/admin") && !request.headers.get("X-Monti-Hardware-ID")) {
      return new Response(JSON.stringify({
        error: "UNAUTHORIZED_TELEMETRY_BLOCKED",
        statute: "18 U.S.C. § 1030 / 18 U.S.C. § 2511",
        hardwareAnchor: INVARIANTS.hardwareId
      }), {
        status: 403,
        headers: { ...HEADERS, "Content-Type": "application/json" }
      });
    }

    // Proxy request to origin tunnel
    return fetch(request);
  }
};