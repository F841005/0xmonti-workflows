MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
#!/usr/bin/env python3
import os, sys, json, time, base64, hashlib, urllib.request, urllib.error

HARDWARE_ID = "MONTI_ANSI_F841005"
CONTAINER_PROFILE = "F841005WV22ZL01"
AUTHORITY = "MONTI^JOHN^CHARLES^MONTI"
OPERATOR = "JOHN CHARLES MONTI (DOB: 02-11-1989)"
POLICY = "PRECLUDE_TAW"
KECCAK_PROOF = "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369"
CALLDATA_SEAL = "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0"
UNLOCK_TOKEN = "Sr4xqKt3AvXRTkz9BRxOb16BuI01BueIz0DWafjPXZO"
AUTH_SEED = "R03M7SMR3J2UDR0NSIDJ"
LOCAL_RELAY = "http://127.0.0.1:8088"

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')

def derive_keys():
    seed_mat = f"{HARDWARE_ID}:{CONTAINER_PROFILE}:{AUTH_SEED}:{UNLOCK_TOKEN}:{KECCAK_PROOF}".encode('utf-8')
    p_seed = hashlib.sha256(seed_mat).digest()
    try:
        from cryptography.hazmat.primitives.asymmetric import ed25519
        priv = ed25519.Ed25519PrivateKey.from_private_bytes(p_seed)
        return priv, priv.public_key().public_bytes_raw()
    except ImportError:
        return None, hashlib.sha256(b"PUB:" + p_seed).digest()

def get_jwt():
    now = int(time.time())
    priv, pub = derive_keys()
    kid = f"cdp_monti_{b64url(pub[:16])}"
    h = b64url(json.dumps({"alg": "EdDSA", "typ": "JWT", "kid": kid}, separators=(',', ':')).encode('utf-8'))
    p = b64url(json.dumps({
        "iss": "cdp", "nbf": now, "exp": now + 120, "sub": AUTHORITY,
        "hardware_id": HARDWARE_ID, "container": CONTAINER_PROFILE,
        "operator": OPERATOR, "policy": POLICY, "proof": KECCAK_PROOF
    }, separators=(',', ':')).encode('utf-8'))
    signing_input = f"{h}.{p}".encode('utf-8')
    sig = priv.sign(signing_input) if priv else hashlib.sha256(signing_input + UNLOCK_TOKEN.encode('utf-8')).digest()
    return f"{h}.{p}.{b64url(sig)}", kid

if __name__ == "__main__":
    token, kid = get_jwt()
    print("================================================================================")
    print(f"[✓] CDP Hardware Signer Active | Key ID: {kid}")
    print(f"    Policy : {POLICY}")
    print("================================================================================")
    req = urllib.request.Request(
        f"{LOCAL_RELAY}/v1/identity",
        headers={"Authorization": f"Bearer {token}", "X-Monti-Hardware-ID": HARDWARE_ID}
    )
    try:
        with urllib.request.urlopen(req, timeout=2.0) as resp:
            print(f"[✓] Loopback Handshake Verified: HTTP {resp.status}")
    except Exception as e:
        print(f"[*] Loopback probe status: {e}")
