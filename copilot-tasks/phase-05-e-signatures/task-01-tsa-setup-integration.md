# Task 1: RFC 3161 Timestamp Authority Setup

**Status**: Phase 5, Week 9 Start  
**Objective**: Configure RFC 3161 timestamp authority integration for 21 CFR Part 11 compliance  
**Preflight Confirmation**: true (requires AWS/external service decision)  
**Dependencies**: Phase 4 complete, `audit-sign-envelope.yml` workflow in place

---

## What You'll Do

1. **Select TSA Provider**
   - [ ] Digicert (commercial, ~$0.10–1.00/token)
   - [ ] AWS Certificate Manager Private CA (self-hosted, ~$50/month)
   - [ ] Sectigo
   - **Decision**: By end of task, document TSA URL and credentials in `.github/docs/TSA_CONFIG.md`

2. **Configure Credentials**
   - [ ] Create `GITHUB_TSA_URL` secret (repo-level)
   - [ ] If using Digicert: Create `DIGICERT_TSA_API_KEY` secret
   - [ ] If using AWS ACM: Create `AWS_TSA_ROLE_ARN` secret

3. **Update `audit-sign-envelope.yml`**
   - [ ] Replace mock TSA implementation with real requests to chosen TSA
   - [ ] Implement RFC 3161 TimeStampReq/TimeStampToken parsing
   - [ ] Add error handling for TSA unavailability (retry + cache)

4. **Test TSA Integration**
   - [ ] Create test event and request timestamp
   - [ ] Verify TSA token contains valid signature
   - [ ] Verify timestamp is independent of system clock (TSA time > system time by 1–5 sec)
   - [ ] Document test results in `docs/audit/TSA_VERIFICATION_TEST.md`

5. **Document TSA Configuration**
   - [ ] Create `docs/audit/TSA_CONFIG.md` with:
     - Selected provider
     - Integration URL
     - Token format (DER/JWS)
     - Cost estimates
     - Failover strategy
     - Annual refresh/rotation procedure

---

## Files to Modify

| File | Change |
|------|--------|
| `.github/workflows/audit-sign-envelope.yml` | Implement real TSA requests (replace mock token) |
| `.github/docs/TSA_CONFIG.md` | New: Configuration and provider selection |
| `.github/docs/audit/TSA_VERIFICATION_TEST.md` | New: Test results + timestamp validation |

---

## Acceptance Criteria

- ✅ TSA provider selected and documented
- ✅ `audit-sign-envelope.yml` makes real TSA requests
- ✅ Test event receives valid RFC 3161 timestamp
- ✅ Timestamp is cryptographically verifiable (openssl ts -verify)
- ✅ Timestamps are independent (system time ≠ TSA time)
- ✅ TSA failover documented (what happens if TSA down?)
- ✅ Cost documented and reviewed

---

## Estimated Effort

- Digicert integration: ~1 hour (straightforward REST API)
- AWS ACM setup: ~2 hours (IAM, CA configuration)
- Testing & verification: ~1 hour
- Documentation: ~30 min

**Total**: ~2–3 hours
