# Task 3: Audit Verification with Signature Checks

**Status**: Phase 5, Week 9 End  
**Objective**: Extend `audit-verify.yml` to validate signatures and timestamps for Part 11 compliance  
**Preflight Confirmation**: false  
**Dependencies**: Task 2 (JWS envelopes working)

---

## What You'll Do

1. **Extend `audit-verify.yml` Signature Validation**
   - [ ] Detect signed vs. unsigned events
   - [ ] For signed events: decode JWS header + payload
   - [ ] Extract certificate chain from JWS x5c header
   - [ ] Validate signer certificate:
     - [ ] Certificate not expired (now < not-after)
     - [ ] Certificate chain chains to trusted root
     - [ ] Subject DN matches expected signer
   - [ ] Verify JWS signature using cosign

2. **Implement Timestamp Authority Verification**
   - [ ] Extract RFC 3161 timestamp token from signature metadata
   - [ ] Verify TSA token signature (openssl ts -verify)
   - [ ] Check timestamp value is valid (reasonable date)
   - [ ] Verify timestamp is independent of event timestamp (TSA time != event time)
   - [ ] Check TSA certificate is from trusted TSA

3. **Add Non-Repudiation Binding Checks**
   - [ ] Recompute event_hash = SHA256(event JSON, sorted keys)
   - [ ] Recompute meaning_hash = SHA256(meaning statement)
   - [ ] Recompute tsa_hash = SHA256(timestamp token)
   - [ ] Verify signature covers binding (event + meaning + timestamp)
   - [ ] Confirm: signature(event_hash || meaning_hash || tsa_hash) valid

4. **Implement Tampering Detection for Signatures**
   - [ ] Check: Signature cannot be modified (would fail verification)
   - [ ] Check: Meaning statement cannot be changed (binding broken)
   - [ ] Check: Timestamp token cannot be replayed (unique per event)
   - [ ] Check: Certificate cannot be revoked mid-audit (check CRL if available)

5. **Create Failure Alerts**
   - [ ] If signature invalid: Create GitHub issue "Signature Verification Failed"
   - [ ] If timestamp invalid: Create GitHub issue "Timestamp Authority Token Invalid"
   - [ ] If binding broken: Create GitHub issue "Non-Repudiation Binding Verification Failed"
   - [ ] All failures: Block merges until resolved

6. **Test Signature Verification**
   - [ ] Create mock signed event (from Task 2)
   - [ ] Run `audit-verify.yml` (manually or wait for nightly)
   - [ ] Verify: Signature checks pass
   - [ ] Verify: Non-repudiation binding verifies
   - [ ] Verify: Report shows "Signature verification: PASS"
   - [ ] Intentionally corrupt signature/timestamp and re-test
   - [ ] Verify: Failure detected and GitHub issue created

7. **Document Verification Procedures**
   - [ ] Update `.github/docs/audit/SIGNATURE_VERIFICATION_GUIDE.md`
   - [ ] Add section: "Nightly Verification Process"
   - [ ] Add section: "Failure Recovery Steps"
   - [ ] Add section: "Offline Verification (manual)"

---

## Files to Modify

| File | Change |
|------|--------|
| `.github/workflows/audit-verify.yml` | Extend with signature + timestamp validation |
| `.github/docs/audit/SIGNATURE_VERIFICATION_GUIDE.md` | Document full verification process |

---

## Acceptance Criteria

- ✅ Signed events parsed correctly
- ✅ JWS signature verification works (cosign)
- ✅ RFC 3161 timestamp token verified
- ✅ Non-repudiation binding verified (event + meaning + timestamp)
- ✅ Certificate chain validation passes
- ✅ Timestamp independence verified (TSA time != event time)
- ✅ Tampering detection catches modified signatures
- ✅ Tampering detection catches replayed timestamps
- ✅ GitHub issue created on failure
- ✅ Nightly run succeeds with all signed events validated
- ✅ Verification guide complete with examples

---

## Estimated Effort

- JWS signature validation: ~1.5 hours
- RFC 3161 timestamp verification: ~1 hour
- Non-repudiation binding checks: ~1 hour
- Tampering detection: ~1 hour
- Testing & failure scenarios: ~1.5 hours
- Documentation: ~30 min

**Total**: ~6–7 hours
