# ============================================================================
# MONTI 2026 // CLOUDFLARE DNS HARDENING MANIFEST FOR 0xmonti.net
# HARDWARE ID ANCHOR: MONTI_ANSI_F841005
# CONTAINER PROFILE : F841005WV22ZL01
# ============================================================================

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

variable "zone_id" {
  type    = string
  default = "0xmonti_net_zone_id_anchor"
}

# 1. CAA Certificate Pinning
resource "cloudflare_record" "caa_issue" {
  zone_id = var.zone_id
  name    = "@"
  type    = "CAA"
  data {
    flags = "0"
    tag   = "issue"
    value = "letsencrypt.org"
  }
}

resource "cloudflare_record" "caa_issuewild" {
  zone_id = var.zone_id
  name    = "@"
  type    = "CAA"
  data {
    flags = "0"
    tag   = "issuewild"
    value = ";"
  }
}

# 2. Strict SPF & DMARC Enforcement
resource "cloudflare_record" "spf" {
  zone_id = var.zone_id
  name    = "@"
  type    = "TXT"
  value   = "v=spf1 include:_spf.mx.cloudflare.net ip4:10.0.0.0/24 -all"
}

resource "cloudflare_record" "dmarc" {
  zone_id = var.zone_id
  name    = "_dmarc"
  type    = "TXT"
  value   = "v=DMARC1; p=reject; sp=reject; rua=mailto:johncharlesmonti@gmail.com; ruf=mailto:johncharlesmonti@gmail.com; fo=1; pct=100"
}

# 3. Sovereign Enclave Proof Inscription
resource "cloudflare_record" "monti_anchor" {
  zone_id = var.zone_id
  name    = "_monti_anchor"
  type    = "TXT"
  value   = "HARDWARE=MONTI_ANSI_F841005 CONTAINER=F841005WV22ZL01 AUTHORITY=MONTI^JOHN^CHARLES^MONTI VERIFIED=HEALTHY_OPTIMAL"
}
