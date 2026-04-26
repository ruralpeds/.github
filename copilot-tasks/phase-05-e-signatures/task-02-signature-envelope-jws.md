# Task 2: Digital Signature Envelope (JWS) Generation

**Status**: Phase 5, Week 9 Mid  
**Objective**: Implement JWS signature envelopes with meaning binding for Part 11 compliance  
**Preflight Confirmation**: false  
**Dependencies**: Task 1 (TSA configured)

---

## What You'll Do

1. **Extend `audit-sign-envelope.yml`**
   - [ ] Parse input event (event_type, event_id, meaning statement)
   - [ ] Build JWS protected header with GitHub OIDC certificate chain
   - [ ] Construct JWS payload: event + meaning + signed_payload
   - [ ] Sign with cosign using GitHub OIDC (keyless)
   - [ ] Generate JWS compact form: `header.payload.signature`

2. **Build Signature Envelope Metadata**
   - [ ] Extract signer identity from GitHub OIDC token
   - [ ] Extract certificate details (subject DN, serial, not-before, not-after)
   - [ ] Record signature algorithm (ECDSA-SHA256 from cosign)
   - [ ] Embed RFC 3161 timestamp from Task 1
   - [ ] Construct complete JWS JSON with all metadata

3. **Implement Non-Repudiation Binding**
   - [ ] Compute event_hash = SHA256(event JSON, sorted keys)
   - [ ] Compute meaning_hash = SHA256(meaning statement)
   - [ ] Compute tsa_hash = SHA256(timestamp token)
   - [ ] Create binding: event_hash || meaning_hash || tsa_hash
   - [ ] Verify signature covers binding (non-repudiation proof)

4. **Add Signature Verification (Local)**
   - [ ] Decode JWS header (base64url)
   - [ ] Extract certificate chain from JWS
   - [ ] Verify cosign signature format
   - [ ] Validate certificate chain (issuer → root)
   - [ ] Check certificate dates (not-before < now < not-after)

5. **Test Signature Envelope**
   - [ ] Create mock release event (copy from Phase 4 `release-created` event)
   - [ ] Add meaning: "I approve PedNeoSim.jl v1.2.3 for clinical use"
   - [ ] Trigger `audit-sign-envelope.yml` via manual workflow dispatch
   - [ ] Verify JWS is created and appended to audit log
   - [ ] Manually verify signature: `cosign verify-blob --signature <jws>`
   - [ ] Document verification steps in `docs/audit/SIGNATURE_VERIFICATION_GUIDE.md`

6. **Document JWS Format**
   - [ ] Already created in `EVENT_SIGNATURE_SCHEMA.md`
   - [ ] Add CLI commands for verification to `SIGNATURE_VERIFICATION_GUIDE.md`
   - [ ] Add troubleshooting guide

---

## Files to Modify

| File | Change |
|------|--------|
| `.github/workflows/audit-sign-envelope.yml` | Extend to build complete JWS envelope |
| `.github/docs/audit/SIGNATURE_VERIFICATION_GUIDE.md` | New: CLI commands + troubleshooting |

---

## Acceptance Criteria

- ✅ JWS envelope generated with all required fields
- ✅ Meaning statement present and readable
- ✅ Certificate chain embedded in JWS header
- ✅ RFC 3161 timestamp embedded in envelope
- ✅ Non-repudiation binding verifiable
- ✅ Signed event appended to audit log
- ✅ JWS signature validates with cosign
- ✅ Verification guide complete with examples

---

## Estimated Effort

- JWS generation: ~2 hours
- Metadata extraction: ~1 hour
- Non-repudiation binding: ~1 hour
- Testing & verification: ~1 hour
- Documentation: ~30 min

**Total**: ~5–6 hours
