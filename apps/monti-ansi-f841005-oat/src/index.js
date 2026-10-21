MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Monti-Hardware-ID",
      "X-Monti-Hardware-ID": env.MONTI_HARDWARE_ID || "MONTI_ANSI_F841005",
      "X-Monti-Container-Profile": env.MONTI_CONTAINER_PROFILE || "F841005WV22ZL01",
      "X-Monti-Authority": env.MONTI_AUTHORITY || "MONTI^JOHN^CHARLES^MONTI",
      "X-Monti-Policy": env.MONTI_POLICY || "PRECLUDE_TAW",
      "X-Monti-Proof": env.MONTI_KECCAK256_PROOF || "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === "/v1/identity" || url.pathname === "/healthz" || url.pathname === "/v1/health") {
      return new Response(
        JSON.stringify({
          status: "MONTI_IDENTITY_ACTIVE",
          worker: env.me || "monti-ansi-f841005-oat",
          hardwareId: env.MONTI_HARDWARE_ID || "MONTI_ANSI_F841005",
          containerProfile: env.MONTI_CONTAINER_PROFILE || "F841005WV22ZL01",
          authority: env.MONTI_AUTHORITY || "MONTI^JOHN^CHARLES^MONTI",
          operator: env.MONTI_OPERATOR || "JOHN CHARLES MONTI",
          policy: env.MONTI_POLICY || "PRECLUDE_TAW",
          keccakProof: env.MONTI_KECCAK256_PROOF || "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
          route: "gateway.0xmonti.net/*",
          timestamp: new Date().toISOString()
        }, null, 2),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    if (url.pathname === "/v1/db/ping") {
      if (!env.MONTI_ANSI_F841005) {
        return new Response(
          JSON.stringify({ error: "D1 Database Binding MONTI_ANSI_F841005 missing" }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      try {
        const { results } = await env.MONTI_ANSI_F841005.prepare(
          "SELECT 1 AS active, ? AS hardware_id, ? AS timestamp"
        ).bind(
          env.MONTI_HARDWARE_ID || "MONTI_ANSI_F841005",
          new Date().toISOString()
        ).all();

        return new Response(
          JSON.stringify({ success: true, d1_database: "monti_d1", results }),
          { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }
    }

    if (url.pathname.startsWith("/v1/vpc/")) {
      if (env["$F841005WV22ZL01"]) {
        try {
          const vpcPath = url.pathname.replace("/v1/vpc", "");
          const vpcTarget = `https://0xmonti.internal${vpcPath}${url.search}`;
          return await env["$F841005WV22ZL01"].fetch(new Request(vpcTarget, request));
        } catch (err) {
          return new Response(
            JSON.stringify({ error: "VPC Tunnel Gateway Error", details: err.message }),
            { status: 502, headers: { ...headers, "Content-Type": "application/json" } }
          );
        }
      }
    }

    return new Response(
      `MONTI_ANSI_F841005 Sovereign Gateway Active [${env.me || "monti-ansi-f841005-oat"}] Path: ${url.pathname}`,
      { status: 200, headers: { ...headers, "Content-Type": "text/plain; charset=UTF-8" } }
    );
  }
};
