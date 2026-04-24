# Security Policy — ruralpeds

## Supported versions

The latest commit on `main` in every repo is the supported version.
Older tags are supported only insofar as security issues affect active
clinical deployments; report them anyway.

## Reporting a vulnerability

**Do not file public issues for security vulnerabilities.** Report via
GitHub's private Security Advisory on the affected repository:

```
https://github.com/ruralpeds/<repo>/security/advisories/new
```

For vulnerabilities affecting patient-data handling or clinical
decision-support outputs, mark the advisory as *high severity* and
include:

- affected component and commit SHA
- reproduction steps
- estimated clinical impact (harm pathway, not just technical CVSS)

Expected response: within 3 business days. Remediation timeline varies
by severity; high-severity vulnerabilities in clinical code are
addressed on a hotfix branch within 14 days where feasible.

## Scope

This policy covers code, configuration, and workflows in any `ruralpeds/*`
repository. Third-party dependencies are tracked via the SBOM produced
by each repo's compliance workflow; vulnerabilities there should be
reported to upstream maintainers.

