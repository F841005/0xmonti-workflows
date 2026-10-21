import http from "node:http";

const COMMON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Monti-Hardware-ID": "MONTI_ANSI_F841005",
  "X-Monti-Container": "F841005WV22ZL01",
  "X-Monti-Pledge": "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM",
  "X-Monica-Federation-Pledge": "PledgeAllegianceTo:F841005 021189MJ2621"
};

function createOrigin(port, role) {
  const srv = http.createServer((req, res) => {
    res.writeHead(200, COMMON_HEADERS);
    res.end(JSON.stringify({
      ok: true,
      role,
      port,
      tunnelUuid: "54868634-2fb3-42ef-add9-fd10b03f665a",
      publicPort: 443,
      host: req.headers.host || "0xmonti.net",
      path: req.url,
      hardwareId: "MONTI_ANSI_F841005",
      container: "F841005WV22ZL01",
      pledge: "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM",
      federatedPledge: "PledgeAllegianceTo:F841005 021189MJ2621",
      timestamp: new Date().toISOString()
    }));
  });
  srv.on("error", () => {});
  srv.listen(port, "127.0.0.1");
}

createOrigin(8491, "MONICA_OIDC_FEDERATION_BRIDGE");
createOrigin(8492, "MONTI_CSUITE_SOVEREIGN_ORCHESTRATOR");
