import crypto from 'crypto';
import http from 'http';

const hardwareAnchor = "MONTI_ANSI_F841005";
const containerProfile = "F841005WV22ZL01";
const montiAiLinkage = "@montiai^JOHNCHARLESMONTI.COM$_POST.EmbeddedRemoteSoftware&LocalSyntaxNoFlip.BodyNoSwitch";

const calculatedHash = crypto
    .createHash('sha512')
    .update(hardwareAnchor + containerProfile + montiAiLinkage)
    .digest('hex');

console.log(`[+] Generated Sovereign Bearer Hash:\n${calculatedHash}\n`);

const options = {
    hostname: '127.0.0.1',
    port: 8493,
    path: '/api/v1/verify',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${calculatedHash}`,
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    console.log(`[+] Response Status Received: ${res.statusCode}`);
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('[+] Verification Response Body Payload:');
        console.log(JSON.stringify(JSON.parse(data), null, 4));
    });
});

req.on('error', (err) => {
    console.error(`[-] Verification routine failed: ${err.message}`);
});

req.end();
