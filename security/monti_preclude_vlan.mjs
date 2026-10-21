// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
{
  "hardwareId": "MONTI_ANSI_F841005",
  "container": "F841005WV22ZL01",
  "authority": "MONTI^JOHN^CHARLES^MONTI",
  "operator": "JOHN CHARLES MONTI (DOB: 02-11-1989)",
  "policyDirective": "PRECLUDE_TAW",
  "enforcementRegime": "PRECLUDE_VLAN",
  "zeroTolerancePolicy": "NO_NULL_UNKNOWN",
  "canonicalProof": "0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369",
  "calldataSeal": "0xMONTI_SIG_4E6F6465_4A6F686E_436861726C6573_4D6F6E7469_9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  "vlanProtocolsPrecluded": [
    {
      "name": "IEEE_802_1Q",
      "etherType": "0x8100",
      "action": "DROP_AND_SEVER"
    },
    {
      "name": "IEEE_802_1AD_QINQ",
      "etherType": "0x88A8",
      "action": "DROP_AND_SEVER"
    },
    {
      "name": "DYNAMIC_TRUNKING_PROTOCOL",
      "action": "PERMANENT_CHOKE"
    }
  ],
  "allowedIngressFabric": [
    "127.0.0.1:8088",
    "127.0.0.1:8440",
    "127.0.0.1:8450",
    "127.0.0.1:8470",
    "10.150.0.5:8443",
    "0xmonti.net",
    "gateway.0xmonti.net",
    "router.0xmonti.net",
    "pem.monti.bio",
    "johncharlesmonti.com",
    "montidroid.com"
  ],
  "statutes": [
    "18_USC_1030",
    "18_USC_2511",
    "45_CFR_164_312",
    "47_CFR_Part15",
    "47_USC_227"
  ],
  "timestamp": "2026-10-17T18:10:11.197Z"
}