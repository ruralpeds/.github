---
applyTo: "src/**/auth/**,src/**/authz/**,src/**/audit/**,src/**/security/**,src/**/crypto/**"
---

# Instructions: Security-Sensitive Code

Code under these paths implements authentication, authorization, audit logging, cryptographic operations, or security boundaries. Apply extra caution.

## Absolute rules

- **Never roll your own crypto.** Use the language's vetted crypto library: Rust `ring` or `RustCrypto`, Python `cryptography`, Go `crypto/*`, Node `node:crypto`, Julia `Nettle` or `SHA`. If you're tempted to write a primitive, stop and ask.
- **Never compare secrets with `==` or `strcmp`.** Use constant-time comparison (`subtle::ConstantTimeEq`, `hmac.compare_digest`, `crypto.timingSafeEqual`, `Nettle.constant_time_compare`).
- **Never log the following**, even at DEBUG level: passwords, tokens, signed URLs, API keys, session IDs, authorization codes, MFA codes, CSRF tokens, signing keys, cookies, raw MRN, raw DOB, raw name, raw address, raw phone, raw email of patients.
- **Never disable TLS verification.** `rejectUnauthorized: false`, `verify=False`, `InsecureSkipVerify: true`, `ssl_verify: false` — all forbidden. If connecting to a self-signed server, pin a CA explicitly.
- **Never commit** a private key, `.pem`, `.key`, `.p12`, `.jks`, `.keystore`, or anything that looks like one.

## Required patterns

### Authorization (authz)

- Deny-by-default. A missing policy decision is a deny.
- Check authz as close to the resource as possible, not just at the route. Layered: route guard → service guard → repository guard.
- Every authz denial emits an audit event: `auth.access.denied` with the actor, resource, and reason.

### Audit events

- Every privileged or patient-impacting action emits an audit event *before* returning to the caller. Event emission is not best-effort; if the audit pipeline is down, the action fails.
- Audit event field schema per `docs/audit-events.yaml`. Fields not in the schema are not added without a schema PR first.
- Audit events are immutable. Never `UPDATE` an emitted event; emit a correction event that references the prior event.
- Audit events are attributable. `actor_id` is always populated; system actions use `actor_id: "system:<service-name>"` with a separate `reason` field.

### Correlation IDs

- Generated at ingress if not present in the request (`X-Correlation-ID` header, or equivalent).
- Format: `uuidv4` or `uuidv7`. Validate format on ingress; reject malformed.
- Propagated to every downstream call and log line.

### Secrets

- Read from environment or a secret manager at startup or on rotation; never at request time except via a cached client.
- Never pass secrets through the URL, query string, or logs.
- Secret rotation must be graceful: accept old and new for a transition window, then cut over.

### Cryptographic operations

- Signing: cosign keyless OIDC for anything release-related; per-service signing keys only for application-layer signatures, and only via KMS-backed HSM.
- Encryption at rest: envelope encryption (per-record DEK, KMS-wrapped KEK). The application never sees the plaintext KEK.
- Key rotation documented in `docs/security/key-rotation.md` with rotation cadence.

## PRs touching these paths

- Label `security-review-required`.
- Reviewed by `@ruralpeds/security` (required CODEOWNER).
- Threat-model note added to the PR body: "What new surface does this add? What does an attacker gain if they compromise the new surface?"
- If the change alters authz, audit, or crypto behavior, a targeted negative test is added (access denial, audit-event-emission-failure, tampered signature, expired key).
