#!/usr/bin/env bash
# ==============================================================================
# SCRIPT       : verify_six_endpoints.sh
# HARDWARE ID  : MONTI_ANSI_F841005
# POLICY       : PRECLUDE_TAW :: ZERO-TRUST NON-ROTATION
# ==============================================================================

DOMAINS=(
  "https://0xmonti.net/v1/identity"
  "https://router.0xmonti.net/v1/identity"
  "https://gateway.0xmonti.net/v1/repo/status"
  "https://firewall.0xmonti.net/v1/firewall/rules"
  "https://oidc.0xmonti.net/.well-known/monti-ansi-f841005-token"
  "https://pem.monti.bio/v1/identity"
)

echo "=== SOVEREIGN 6-ENDPOINT EDGE AUDIT ==="
for URL in "${DOMAINS[@]}"; do
    STATUS=$(curl -k -s -L -o /dev/null -w "%{http_code}" --connect-timeout 5 "$URL" 2>/dev/null || echo "FAILED")
    echo "    --> $URL => HTTP $STATUS"
done
