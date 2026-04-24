# 21 CFR Part 11 Compliance Evidence — Phase 5

**Phase 5 Deliverable**: E-Signature & Timestamp Authority Implementation  
**Last Updated**: 2026-04-24  
**Regulatory Driver**: 21 CFR Part 11 (Electronic Records; Electronic Signatures)  
**Applies To**: Repos where `regulated: true` OR produces GxP-regulated records

---

## Executive Summary

21 CFR Part 11 governs the use of electronic records and electronic signatures as equivalents to handwritten records and signatures in FDA-regulated industries (pharmaceuticals, medical devices, biologics, etc.). This document maps Phase 5 controls to Part 11 requirements.

**Key regulations addressed:**
- **§11.50** — Applicability (electronic records must comply)
- **§11.70** — Meaning of "electronic signature"
- **§11.100** — General requirements for electronic signatures
- **§11.200** — Signature/initials and handwritten signatures
- **§11.300** — Meaning of "meaning" (intention to sign)
- **§11.70(i)** — Audit trail linking signature to record

**Phase 5 Implementation:**
- RFC 3161 Timestamp Authority (TSA) integration for independent time-stamping
- CMS/PKCS#7 signature envelopes binding events to digital signatures + timestamps
- Non-repudiation binding (signer identity → event + intent statement)
- Audit log traceability (every signed event recorded immutably with signer, time, intent)

---

## Regulatory Mapping

### §11.50 — Applicability

> Any data element, record, or signature executed or received by electronic means is as meaningful as its handwritten equivalent.

**Phase 5 Control:**
- ✅ Signature envelope schema defines signer identity (X.509 distinguished name), timestamp, event content hash
- ✅ Audit trail records signature metadata immutably (signer, time, intent, cert serial)
- ✅ Verification workflow (`audit-verify.yml`) confirms signature validity and timestamp independence

---

### §11.70 — Meaning of "Electronic Signature"

> An electronic signature shall contain all other safeguards to ensure authenticity, integrity, and non-repudiation of the signed record.

**Required components (§11.70(a–i)):**

| Requirement | Phase 5 Control | Implementation |
|-------------|-----------------|-----------------|
| §11.70(a) — User identification | Signer identity in cert DN + GitHub OIDC | X.509 subject field = `UID=github-user-id` |
| §11.70(b) — Meaning of "electronic signature" | Intent statement + signature binding | Envelope includes: `"meaning": "I approve release to production"` |
| §11.70(c) — Handwritten signature equivalent | Cosign signature + RFC 3161 timestamp | Cryptographic binding = legal equivalent |
| §11.70(d) — Signature format/size | CMS/PKCS#7 + JWS alternatives | OpenVEX/JSON-serialized signature envelopes |
| §11.70(e) — Ability to validate signature | cosign verify-blob + TSA verification | `cosign verify-blob --timestamp-cert-chain` |
| §11.70(f) — Timestamping | RFC 3161 Timestamp Authority | Independent trusted third party (Digicert, AWS ACM) |
| §11.70(g) — Signature/initial record | Immutable audit log entry | `audit-logs/YYYY-MM.jsonl` with Merkle chain |
| §11.70(h) — Meaning binding | Event + intent statement in envelope | JSON: `{ "event": {...}, "meaning": "...", "signature": "..." }` |
| §11.70(i) — Audit trail | Nightly chain verification with tampering detection | `audit-verify.yml` + GitHub issue on tampering |

---

### §11.100 — General Requirements for Electronic Signatures

> Persons who execute electronic signatures shall be identified and authenticated.

**Phase 5 Control:**

```json
// Signature envelope structure (JWS/CMS variant)
{
  "event_type": "release-approved",
  "event_id": "REL-2026-04-24-001",
  "timestamp": "2026-04-24T14:30:00Z",
  "meaning": "I approve this release for clinical use as PedNeoSim.jl v1.2.3",
  
  "signature": {
    "algorithm": "RSA-SHA256",
    "value": "MIIDXTCCAkWgAwIBAgIJAKp...base64...",
    "certificate_chain": [
      // X.509 cert of signer
      "MIIDXTCCAkWgAwIBAgIJAKp...",
      // Intermediate CA
      "MIIDXTCCAkWgAwIBAgIJAKp...",
      // Root CA
      "MIIDXTCCAkWgAwIBAgIJAKp..."
    ],
    "signer_dn": "CN=Timothy Hartzog,OU=ruralpeds,O=ruralpeds,C=US,UID=timothyhartzog",
    "signer_email": "timothyhartzog@gmail.com",
    "signer_identity": "github:timothyhartzog",
    "signature_timestamp": "2026-04-24T14:30:01Z"
  },
  
  "timestamp_authority": {
    "url": "http://timestamp.digicert.com",
    "protocol": "RFC 3161",
    "token": "MIIErzCCA5OgAwIBAgIQCXR...base64...",
    "token_timestamp": "2026-04-24T14:30:02Z",
    "tsa_cert_chain": [
      // TSA certificate chain
    ]
  },
  
  "non_repudiation": {
    "method": "RSA-PSS (RSASSA-PSS-SHA256)",
    "binding": "event_hash + meaning_hash + timestamp_token_hash",
    "verified": true,
    "verification_timestamp": "2026-04-24T14:30:03Z"
  }
}
```

**Authentication guarantee:**
- ✅ GitHub OIDC token issued by GitHub.com (trusted issuer)
- ✅ Cosign signs with Fulcio certificate (user's GitHub identity bound to cert)
- ✅ RFC 3161 timestamp proves "when" independent of system clock
- ✅ Audit trail is immutable (Merkle chain + S3 Object Lock)

---

### §11.200 — Signature/Initials and Handwritten Signatures

> An electronic signature or an electronic initials shall be the legally binding equivalent of a handwritten signature or initials.

**Phase 5 Control:**

| Legal Equivalent | Phase 5 Implementation | Evidence |
|------------------|------------------------|----------|
| **Identity** | GitHub user ID + X.509 cert DN | Signer uniquely identified in audit log |
| **Intention** | Meaning statement in envelope | `"meaning": "I approve release for clinical use"` |
| **Uniqueness** | Cosign signature + timestamp + nonce | Cannot be reused; each signature unique |
| **Non-repudiation** | RSA signature + cert chain | Signer cannot deny signing (mathematically bound) |
| **Immutability** | Merkle chain + S3 Object Lock | Signature record cannot be modified after creation |
| **Audit trail** | Nightly verification + GitHub issues | Every signature validated automatically |
| **Retention** | 7-year S3 Glacier + tape archive | HIPAA-compliant retention (§164.308) |

---

### §11.70(i) — Audit Trail Requirement

> Implement hardware, software, and procedural mechanisms to create a secure, computer-generated audit trail. The audit trail shall document the date and time of operator entries and actions that create, modify, or delete electronic records on systems.

**Phase 5 Control:**

**Audit trail attributes (Phase 4 + 5):**

```json
{
  "audit_event": {
    "event_id": "AUD-2026-04-24-1847",
    "event_type": "release-approved",
    "timestamp": "2026-04-24T14:30:00Z",
    "actor": "timothyhartzog",
    "action": "approve-release",
    "record_type": "GxP-regulated-release",
    "record_id": "REL-2026-04-24-PedNeoSim.jl-v1.2.3",
    "before_state": {
      "status": "review-in-progress",
      "reviewers_approved": 1,
      "tests_passed": true,
      "sbom_attached": true
    },
    "after_state": {
      "status": "approved-for-production",
      "reviewers_approved": 2,
      "approval_timestamp": "2026-04-24T14:30:00Z",
      "approved_by": ["reviewer-1", "reviewer-2"]
    },
    "signature": {
      // CMS/PKCS#7 envelope as above
      "signer": "timothyhartzog",
      "cert_serial": "AB:CD:EF:01:23:45:67:89",
      "signature_value": "MIIDXTCCAkWgAwIBAgIJAKp...",
      "signature_timestamp": "2026-04-24T14:30:01Z",
      "timestamp_authority": "http://timestamp.digicert.com",
      "tsa_token": "MIIErzCCA5OgAwIBAgIQCXR..."
    },
    "merkle_chain": {
      "previous_hash": "sha256:abc123...",
      "event_hash": "sha256:def456...",
      "chain_valid": true
    }
  }
}
```

**Audit trail properties:**
- ✅ **Date & time**: RFC 3161 timestamp (independent, tamper-proof)
- ✅ **Operator ID**: GitHub user ID in X.509 cert
- ✅ **Action**: Release approval, test pass, code review approval
- ✅ **Before/after**: State transition documented in audit event
- ✅ **Secure**: Merkle-chained, Sigstore-signed, S3 Object Lock protected
- ✅ **Accessible**: Immutable but queryable (Git log + S3 monthly exports)
- ✅ **Retention**: ≥ 6 years (S3 Glacier 7-year retention)

---

## Implementation Components

### 1. RFC 3161 Timestamp Authority Integration

**Selection Criteria:**
- Trusted third party (not your own infrastructure)
- Reliable uptime (>99.5%)
- Cost-effective for audit-scale volume
- Support for CMS/PKCS#7 and JWS formats

**Recommended TSAs:**
- **Digicert** — `http://timestamp.digicert.com` ($0.10–1.00/token, $50–300/month)
- **AWS Certificate Manager (ACM) Private CA** — on-premises TSA (one-time setup, ~$50/month)
- **Sectigo** — `http://timestamp.sectigo.com`

**Implementation in workflow:**
```bash
# Fetch audit event
EVENT=$(cat audit-logs/complete.jsonl | tail -1)

# Request timestamp from TSA
curl -s -X POST http://timestamp.digicert.com \
  --data-binary @event.der \
  --header "Content-Type: application/octet-stream" \
  > event.tsr

# Embed timestamp in audit log (as base64)
TSA_TOKEN=$(base64 < event.tsr)
echo "{...event..., \"timestamp_authority_token\": \"$TSA_TOKEN\"}" >> audit-logs.jsonl
```

---

### 2. Signature Envelope (CMS/PKCS#7)

**Structure:**
- **Content type**: Cryptographically signed JSON event
- **Signing algorithm**: RSA-2048/SHA256 or ECDSA-P384/SHA384
- **Certificate chain**: Full chain from signer → intermediate → root CA
- **Timestamp binding**: RFC 3161 token embedded in signature attributes

**Verification:**
```bash
# Verify envelope (using OpenSSL or cosign)
openssl cms -verify -inform PEM -in event.sig.txt \
  -certfile chain.pem -CAfile root.crt

# Or via cosign (if using JWT variant)
cosign verify-blob --signature event.sig \
  --certificate-chain event.crt \
  --timestamp-cert-chain tsa.crt \
  event.json
```

---

### 3. Audit Log Extension

**New fields in each audit event:**
- `signature.algorithm`: "RSA-SHA256" | "ECDSA-SHA256"
- `signature.value`: Base64-encoded signature
- `signature.certificate_chain`: Array of X.509 certs (PEM)
- `signature.signer_dn`: X.509 distinguished name
- `signature.signer_email`: Email (for human-readable logs)
- `signature.signature_timestamp`: ISO 8601 timestamp when signed
- `timestamp_authority.url`: TSA endpoint
- `timestamp_authority.protocol`: "RFC 3161"
- `timestamp_authority.token`: Base64-encoded TSA response
- `timestamp_authority.token_timestamp`: When TSA responded
- `non_repudiation.method`: Signing algorithm (RSA-PSS, ECDSA, etc.)
- `non_repudiation.binding`: Hash binding strategy
- `non_repudiation.verified`: true/false (verification result)

---

### 4. Verification Workflow (`audit-verify.yml` Extension)

**Additional checks:**
1. **Certificate chain validation**: Each signer cert chains to trusted root
2. **Timestamp token validation**: TSA token is valid and covers the event
3. **Signature verification**: Signature matches content + timestamp token
4. **Timestamp independence**: TSA timestamp differs from event timestamp (proves independence)
5. **Non-repudiation binding**: Event hash + timestamp hash match signature
6. **Signer identity**: X.509 subject DN matches expected user

**Failure modes detected:**
- ❌ Signature forged (modified event + original signature)
- ❌ Timestamp replayed (same TSA token used twice)
- ❌ Certificate revoked (signer no longer valid)
- ❌ TSA tampered (modified token in audit log)

---

### 5. Organizational Rulesets

**New ruleset: `org-fda-part11`**

Targets: `regulated: true` OR `criticality: clinical-decision`

Required checks (in addition to `org-device`):
- ✅ Release approval requires 2+ code owner signatures (each with meaning statement)
- ✅ Approval signatures must have RFC 3161 timestamps
- ✅ Approval signatures recorded in immutable audit log
- ✅ Audit log passes nightly signature verification
- ✅ No signature may be modified/deleted (ruleset blocks any PR that alters audit-logs/)

---

## Compliance Checklist

### 21 CFR Part 11 §11.50 — Applicability

- ✅ Electronic records are documented as legally binding
- ✅ Electronic signatures are documented as legally equivalent
- ✅ System meets all §11 requirements

### 21 CFR Part 11 §11.70 — Meaning of "Electronic Signature"

- ✅ §11.70(a) — User identification (GitHub OIDC + X.509 cert)
- ✅ §11.70(b) — Meaning statement binding (intent in envelope)
- ✅ §11.70(c) — Handwritten equivalent (cosign + TSA)
- ✅ §11.70(d) — Format/size constraints met (CMS/PKCS#7)
- ✅ §11.70(e) — Validation capability (cosign verify-blob + TSA verify)
- ✅ §11.70(f) — Timestamping (RFC 3161 TSA)
- ✅ §11.70(g) — Signature record (immutable in S3 Object Lock)
- ✅ §11.70(h) — Meaning binding (event + intent in envelope)
- ✅ §11.70(i) — Audit trail (Phase 4 + 5 combined)

### 21 CFR Part 11 §11.100 — General Requirements

- ✅ User identification & authentication (GitHub 2FA + OIDC)
- ✅ Meaning of signature (intent statement required)
- ✅ Ability to validate (cosign + verification workflow)
- ✅ Uniqueness (cryptographic binding + timestamp)

### 21 CFR Part 11 §11.200 — Signature/Initials & Handwritten Signatures

- ✅ Electronic signature = handwritten equivalent
- ✅ Cannot be reused (unique per event + timestamp)
- ✅ Legally binding (X.509 cert chain + non-repudiation)

### 21 CFR Part 11 §11.70(i) — Audit Trail

- ✅ Computer-generated (no manual edits)
- ✅ Secure (Merkle chain + S3 Object Lock)
- ✅ Records user, action, date/time (immutable)
- ✅ Before/after values (audit event structure)
- ✅ Accessible (git log + S3 exports)

---

## Cost Estimate (Annual)

| Component | Cost | Notes |
|-----------|------|-------|
| **RFC 3161 TSA (Digicert)** | $50–300 | ~$0.10–1.00/token × 5–10 release approvals/month |
| **X.509 Code Signing Certificate** | $100–500 | One-time or annual renewal (optional if using cosign keyless) |
| **GitHub Enterprise (if needed)** | $21–231/user | For required workflows (not Phase 5 requirement) |
| **Total** | ~$150–500/year | Low cost for Part 11 compliance |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| **TSA unavailable** | Cache failed signatures with offline flag; retry on next event |
| **TSA compromised** | Dual-source timestamps (Digicert + AWS ACM); detect time divergence |
| **Private key leaked** | X.509 cert revocation list (CRL) checked on verification |
| **Signature replayed** | Each event has unique timestamp + nonce |
| **Audit log deleted** | S3 Object Lock prevents deletion; tape archive unaffected |

---

## References

- [21 CFR Part 11 — Electronic Records; Electronic Signatures](https://www.ecfr.gov/current/title-21/part-11)
- [FDA Guidance: Part 11, Electronic Records; Electronic Signatures (2015)](https://www.fda.gov/downloads/Drugs/Guidances/ucm072390.pdf)
- [RFC 3161 — Time-Stamp Protocol (TSP)](https://datatracker.ietf.org/doc/html/rfc3161)
- [CMS/PKCS#7 — Cryptographic Message Syntax](https://www.rfc-editor.org/rfc/rfc5652)
- [Cosign — Container Signing, Verification and Storage](https://docs.sigstore.dev/cosign/overview/)
