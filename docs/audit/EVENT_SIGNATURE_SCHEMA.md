# Audit Event Signature Schema

**Phase 5 Deliverable**: Digital signature envelope specification for Part 11 compliance  
**Last Updated**: 2026-04-24  
**Format Variants**: JWS (JSON Web Signature), CMS/PKCS#7 (Cryptographic Message Syntax)

---

## Overview

Each audit event that represents a GxP-regulated action (release approval, safety-critical configuration change) must be wrapped in a digital signature envelope with an RFC 3161 timestamp. This document specifies the envelope structure and signature format.

### When Signatures Are Required

| Event Type | Signature Required | Meaning Statement |
|------------|-------------------|-------------------|
| `release-created` | ✅ YES | "I approve this release for production" |
| `release-approved-for-distribution` | ✅ YES | "I attest this release is safe for clinical use" |
| `safety-critical-config-deployed` | ✅ YES | "I approve this safety-critical configuration change" |
| `hazard-control-verified` | ✅ YES | "I certify this risk control is effective" |
| `code-review-approved` (on device repos) | ⚠️ OPTIONAL | "I reviewed this code and approve for merge" |
| All other events | ❌ NO | N/A |

---

## Signature Envelope Variants

### Variant 1: JWS (JSON Web Signature) — Recommended for simplicity

**Use case:** JSON-native workflows, GitHub Actions, easy verification

**Structure:**

```json
{
  "protected": "eyJhbGciOiJSUzI1NiIsImtpZCI6In...",
  "payload": "eyJldmVudF90eXBlIjoicmVsZWFzZS1hcHByb3ZlZCIsI...",
  "signature": "jL9wR0rTZPqX...",
  "timestamp_authority": {
    "url": "http://timestamp.digicert.com",
    "protocol": "RFC 3161",
    "token": "MIIErzCCA5OgAwIBAgIQCXR...",
    "token_timestamp": "2026-04-24T14:30:02Z"
  }
}
```

**Decoding protected header:**
```json
{
  "alg": "RS256",      // RSA with SHA-256
  "typ": "JWT",        // JSON Web Token
  "kid": "rsa-key-001", // Key ID for multi-key support
  "x5c": [             // X.509 certificate chain
    "MIID...",         // Signer certificate
    "MIIE...",         // Intermediate CA
    "MIIF..."          // Root CA
  ],
  "cty": "application/json"  // Content type: JSON
}
```

**Payload (base64url-decoded):**
```json
{
  "event_type": "release-approved-for-distribution",
  "event_id": "REL-2026-04-24-PedNeoSim.jl-v1.2.3",
  "timestamp": "2026-04-24T14:30:00Z",
  "repository": "ruralpeds/PedNeoSim.jl",
  "actor": "timothyhartzog",
  "action": "approve-release",
  
  "meaning": "I approve this release (PedNeoSim.jl v1.2.3) for clinical use in neonatal simulation. All testing, review, and safety controls are complete and verified.",
  "meaning_language": "en-US",
  "meaning_intent": "formal-approval",
  
  "signed_attributes": {
    "signer_id": "github:timothyhartzog",
    "signer_email": "timothyhartzog@gmail.com",
    "signer_name": "Timothy Hartzog",
    "signer_dn": "CN=Timothy Hartzog,OU=ruralpeds,O=ruralpeds,C=US,UID=timothyhartzog",
    "certificate_serial": "AB:CD:EF:01:23:45:67:89:AB:CD",
    "key_algorithm": "RSA",
    "key_size": 2048,
    "signature_algorithm": "RSA-PSS",
    "hash_algorithm": "SHA256"
  },
  
  "signed_payload": {
    "event_type": "release-approved-for-distribution",
    "event_id": "REL-2026-04-24-PedNeoSim.jl-v1.2.3",
    "timestamp": "2026-04-24T14:30:00Z",
    "repository": "ruralpeds/PedNeoSim.jl",
    "release_version": "v1.2.3",
    "release_tag": "v1.2.3",
    "release_commit": "a1b2c3d4e5f6...",
    "release_artifacts": {
      "sbom": "s3://bucket/releases/PedNeoSim.jl/v1.2.3/sbom.json",
      "vex": "s3://bucket/releases/PedNeoSim.jl/v1.2.3/vex.json",
      "provenance": "s3://bucket/releases/PedNeoSim.jl/v1.2.3/provenance.intoto.jsonl"
    },
    "approvals": [
      {
        "approver": "reviewer-1",
        "approval_timestamp": "2026-04-24T14:00:00Z",
        "approval_type": "code-review"
      },
      {
        "approver": "reviewer-2",
        "approval_timestamp": "2026-04-24T14:15:00Z",
        "approval_type": "code-review"
      },
      {
        "approver": "timothyhartzog",
        "approval_timestamp": "2026-04-24T14:30:00Z",
        "approval_type": "release-approval",
        "approval_meaning": "formal-approval-for-clinical-use"
      }
    ],
    "test_results": {
      "ci_passed": true,
      "coverage": 0.87,
      "security_scan_passed": true,
      "sbom_generated": true,
      "vex_generated": true
    },
    "safety_attestations": [
      {
        "assertion": "All unit tests passed",
        "verified_timestamp": "2026-04-24T13:45:00Z"
      },
      {
        "assertion": "Hazard analysis updated for v1.2.3",
        "verified_timestamp": "2026-04-24T13:50:00Z"
      },
      {
        "assertion": "Risk residual severity <= acceptable",
        "verified_timestamp": "2026-04-24T13:55:00Z"
      }
    ]
  },
  
  "merkle_chain": {
    "previous_event_hash": "sha256:abc123def456...",
    "event_hash": "sha256:def456ghi789...",
    "chain_position": 42847
  }
}
```

---

### Variant 2: CMS/PKCS#7 (Cryptographic Message Syntax)

**Use case:** Legacy compliance systems, formal notarization, archival

**Binary structure (DER encoding):**

```
SignedData {
  version = 3
  contentInfo {
    contentType = id-data
    content = <audit event JSON>
  }
  certificates {
    cert[0] = <signer X.509 certificate>
    cert[1] = <intermediate CA certificate>
    cert[2] = <root CA certificate>
  }
  signerInfos {
    signerInfo {
      version = 3
      sid = issuerAndSerialNumber {
        issuer = <cert issuer DN>
        serial = <certificate serial number>
      }
      digestAlgorithm = sha256
      signatureAlgorithm = rsassa-pss
      
      signedAttrs {
        // Signed attributes (part of signature)
        contentType = id-data
        messageDigest = <SHA256 hash of content>
        signingTime = 2026-04-24T14:30:00Z
        
        // Custom attributes for Part 11
        meaning = <intent statement>
        tsaUrl = http://timestamp.digicert.com
        
        // Timestamp authority response (RFC 3161 SignatureTimeStampToken)
        signingCertificate = <signer cert fingerprint>
        contentHint = <MIME type of content>
      }
      
      signature = <RSA-PSS signature value>
    }
  }
  
  // RFC 3161 timestamp embedded in signedAttrs
  timestampToken {
    contentType = id-signedData
    content = SignedData {
      signerInfo = <TSA signature over content + messageDigest>
    }
  }
}
```

**Binary-to-JSON representation (for storage in audit log):**

```json
{
  "event_type": "release-approved-for-distribution",
  "event_id": "REL-2026-04-24-PedNeoSim.jl-v1.2.3",
  "timestamp": "2026-04-24T14:30:00Z",
  
  "signature_format": "CMS/PKCS#7",
  "signature_cms_der": "MIIErzCCA5OgAwIBAgIQCXRvhhY8...",  // Base64-encoded DER
  
  "signature_metadata": {
    "signer_dn": "CN=Timothy Hartzog,OU=ruralpeds,O=ruralpeds,C=US",
    "signer_email": "timothyhartzog@gmail.com",
    "signer_certificate_serial": "AB:CD:EF:01:23:45:67:89:AB:CD",
    "signature_algorithm": "RSASSA-PSS",
    "hash_algorithm": "SHA256",
    "signature_timestamp": "2026-04-24T14:30:01Z",
    
    "certificate_chain": [
      {
        "subject": "CN=Timothy Hartzog,OU=ruralpeds,O=ruralpeds,C=US",
        "issuer": "CN=Intermediate CA",
        "serial": "AB:CD:EF:01:23:45:67:89:AB:CD",
        "not_before": "2024-01-01T00:00:00Z",
        "not_after": "2026-01-01T00:00:00Z",
        "pem": "-----BEGIN CERTIFICATE-----\nMIID..."
      },
      {
        "subject": "CN=Intermediate CA",
        "issuer": "CN=Root CA",
        "serial": "12:34:56:78:9A:BC:DE:F0:12:34",
        "pem": "-----BEGIN CERTIFICATE-----\nMIIE..."
      },
      {
        "subject": "CN=Root CA",
        "issuer": "CN=Root CA",  // Self-signed
        "serial": "AA:BB:CC:DD:EE:FF:00:11:22:33",
        "pem": "-----BEGIN CERTIFICATE-----\nMIIF..."
      }
    ]
  },
  
  "timestamp_authority": {
    "url": "http://timestamp.digicert.com",
    "protocol": "RFC 3161",
    "tst_der": "MIIErzCCA5OgAwIBAgIQCXRvhhY8...",  // Base64-encoded RFC 3161 TST
    "tsa_certificate": {
      "subject": "CN=Digicert Timestamp Authority",
      "issuer": "CN=Digicert ECC SHA2 Secure Server CA",
      "pem": "-----BEGIN CERTIFICATE-----\nMIIE..."
    },
    "timestamp_value": "2026-04-24T14:30:02Z",
    "accuracy": "1 second"
  },
  
  "non_repudiation": {
    "method": "RSA-PSS (RSASSA-PSS-SHA256)",
    "binding": "signer_dn + meaning + event_hash + timestamp_token_hash",
    "signature_verified": true,
    "verification_timestamp": "2026-04-24T14:30:03Z",
    "verification_tool": "cosign verify-blob + OpenSSL cms -verify"
  }
}
```

---

## Verification Process

### Step 1: Envelope Type Detection

```python
if payload has 'protected' and 'signature' keys:
    format = "JWS"
else if payload has 'signature_cms_der':
    format = "CMS/PKCS#7"
else:
    raise ValidationError("Unknown signature format")
```

### Step 2: Certificate Chain Validation

```bash
# JWS variant
openssl x509 -in <cert0.pem> -noout -dates
openssl verify -CAfile root.crt -untrusted intermediate.crt signer.crt

# CMS variant
openssl cms -verify -inform DER -in event.cms \
  -CAfile root.crt -untrusted intermediate.crt
```

### Step 3: Signature Verification

```bash
# JWS variant (using cosign)
cosign verify-blob \
  --signature <JWS compact form> \
  --certificate-chain <cert0> <cert1> <cert2> \
  --timestamp-cert-chain <tsa.cert> \
  event.json

# CMS variant (using OpenSSL)
openssl cms -verify -inform DER -in event.cms \
  -inform DER -certfile chain.pem \
  -out verified-content.json
```

### Step 4: Timestamp Authority Validation

```bash
# Extract TSA token (embedded in signature)
openssl asn1parse -in event.cms -inform DER | grep -A5 "SignatureTimeStampToken"

# Verify TSA token
openssl ts -verify -in event.tsr -data event.json
```

### Step 5: Non-Repudiation Binding Check

```python
# Verify signature covers event + meaning + timestamp
event_hash = sha256(json.dumps(event, sort_keys=True))
meaning_hash = sha256(meaning)
tsa_hash = sha256(tsa_token)
binding_input = event_hash + meaning_hash + tsa_hash

# Signature must cover all three
signature_valid = verify_signature(
    public_key=signer_cert.public_key(),
    message=binding_input,
    signature=sig_value
)
```

---

## Audit Log Integration

### Entry Structure with Signature

```json
{
  "event_type": "release-approved-for-distribution",
  "event_id": "REL-2026-04-24-PedNeoSim.jl-v1.2.3",
  "timestamp": "2026-04-24T14:30:00Z",
  "repository": "ruralpeds/PedNeoSim.jl",
  "actor": "timothyhartzog",
  "action": "approve-release",
  
  "meaning": "I approve this release (PedNeoSim.jl v1.2.3) for clinical use.",
  
  "signature": {
    "format": "JWS",
    "jws_compact": "eyJhbGciOiJSUzI1NiIsImtpZCI6In...",
    
    "signer": {
      "github_id": "timothyhartzog",
      "email": "timothyhartzog@gmail.com",
      "dn": "CN=Timothy Hartzog,OU=ruralpeds,O=ruralpeds,C=US,UID=timothyhartzog",
      "cert_serial": "AB:CD:EF:01:23:45:67:89:AB:CD"
    },
    
    "algorithm": "RS256",
    "signature_timestamp": "2026-04-24T14:30:01Z",
    
    "tsa": {
      "url": "http://timestamp.digicert.com",
      "protocol": "RFC 3161",
      "token": "MIIErzCCA5OgAwIBAgIQCXR...",
      "timestamp": "2026-04-24T14:30:02Z"
    },
    
    "verified": true,
    "verification_timestamp": "2026-04-24T14:30:03Z"
  },
  
  "merkle_chain": {
    "previous_hash": "sha256:abc123...",
    "event_hash": "sha256:def456...",
    "chain_valid": true
  }
}
```

---

## Size Constraints

| Component | Max Size | Rationale |
|-----------|----------|-----------|
| Meaning statement | 1024 chars | Human-readable intent |
| Signature (JWS) | 5 KB | Compact base64 encoding |
| Certificate chain | 10 KB | Full chain + metadata |
| RFC 3161 TSA token | 3 KB | Standard token size |
| Total audit entry | 20 KB | Reasonable for JSON line storage |

---

## Compatibility & Migration

### Phase 4 → Phase 5 Transition

**Phase 4 audit logs** (unsigned):
```json
{"event_type": "release-created", "timestamp": "...", ...}
```

**Phase 5 audit logs** (signed):
```json
{
  "event_type": "release-approved-for-distribution",
  "timestamp": "...",
  "meaning": "I approve...",
  "signature": {...}
}
```

**Verification logic handles both:**
```python
if "signature" in event:
    # Phase 5: verify signature
    verify_jws_signature(event)
else:
    # Phase 4: verify Merkle chain only
    verify_merkle_chain(event)
```

---

## References

- [RFC 3161 — Time-Stamp Protocol (TSP)](https://datatracker.ietf.org/doc/html/rfc3161)
- [RFC 7515 — JSON Web Signature (JWS)](https://tools.ietf.org/html/rfc7515)
- [RFC 5652 — Cryptographic Message Syntax (CMS)](https://tools.ietf.org/html/rfc5652)
- [RFC 7517 — JSON Web Key (JWK)](https://tools.ietf.org/html/rfc7517)
- [Cosign Signature Format](https://docs.sigstore.dev/cosign/signature-formats/)
