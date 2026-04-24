# ruralpeds

Clinical software and quality infrastructure for rural and
Critical Access Hospital pediatric care.

## What lives here

- Reusable GitHub Actions workflows consumed by every repo in this org
  (HIPAA compliance gate, audit log, release gate, FDA 510(k) bundle).
- Organization-default community-health files (SECURITY, CONTRIBUTING).
- The public profile page (this README).

## Public repositories

See the tabs above for all public repositories. Clinical decision-support
tooling, scientific computing libraries, and educational materials are
maintained here.

## Governance

- Every repo tagged `clinical-software` enforces HIPAA compliance and
  21 CFR Part 11 electronic-record requirements on every commit.
- Repos destined for FDA 510(k) submission run the bundled documentation
  assembly on release tags.
- All audit metadata is machine-maintained in each repo's
  `.github/AUDIT.yaml`.

