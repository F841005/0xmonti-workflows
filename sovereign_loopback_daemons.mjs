import http from "node:http";

try { process.on("SIGPIPE", () => {}); } catch (_) {}

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Monti-Hardware-ID": "MONTI_ANSI_F841005",
  "X-Monti-Container": "F841005WV22ZL01",
  "X-Monti-Pledge": "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM",
  "X-Monica-Federation-Pledge": "PledgeAllegianceTo:F841005 021189MJ2621",
  "Access-Control-Allow-Origin": "*"
};

function createHandler(serviceRole, port) {
  return (req, res) => {
    res.writeHead(200, HEADERS);
    res.end(JSON.stringify({
      status: "ONLINE_PORT_443_RESOLVED",
      serviceRole,
      localPort: port,
      publicIngressPort: 443,
      tunnelUuid: "54868634-2fb3-42ef-add9-fd10b03f665a",
      accountTag: "872786663072ddf92e73024b52f74048",
      host: req.headers.host || "0xmonti.net",
      path: req.url,
      hardwareId: "MONTI_ANSI_F841005",
      container: "F841005WV22ZL01",
      operator: "JOHN CHARLES MONTI (DOB: 02-11-1989)",
      sovereignPledge: "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM",
      federatedPledge: "PledgeAllegianceTo:F841005 021189MJ2621",
      keccakProof: "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
      timestamp: new Date().toISOString()
    }, null, 2));
  };
}

http.createServer(createHandler("MONICA_OIDC_FEDERATION_BRIDGE", 8491)).listen(8491, "127.0.0.1");
http.createServer(createHandler("CIO_CISO_CTO_SOVEREIGN_ORCHESTRATOR", 8492)).listen(8492, "127.0.0.1");
console.log("[SOVEREIGN LOOPBACK] Listening on 127.0.0.1:8491 and 127.0.0.1:8492 for Tunnel 54868634-2fb3-42ef-add9-fd10b03f665a");
