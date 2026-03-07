---
description: Dependency Security and Supply Chain Hardening
alwaysApply: false
---

# Dependency Security

## Before Adding a Dependency

1. Check maintenance: last commit, open issues, release frequency
2. Check security: known CVEs (npm audit, pip-audit, govulncheck)
3. Check scope: how many transitive dependencies? Fewer = smaller attack surface
4. Check permissions: does it need filesystem, network, or native access?
5. Prefer well-known, widely-audited libraries over obscure alternatives

## Supply Chain Hardening

- Commit lockfiles (package-lock.json, poetry.lock, go.sum)
- Pin base images for containers: node:20.11.0-alpine, not node:latest
- Enable dependency review in CI (GitHub Dependency Review Action, Renovate, Dependabot)
- Generate SBOMs (Software Bill of Materials) for releases
- Verify package integrity: npm uses integrity hashes in lockfiles; verify signatures where available
- Rebuild containers on security advisories, not just code changes

## Automated Scanning Pipeline

Run on every PR:
- Dependency audit (npm audit --audit-level=high / pip-audit / govulncheck)
- Secret detection (gitleaks, trufflehog)
- SAST (semgrep, CodeQL)
- Container scanning (trivy, grype)
- License compliance check

## Responding to Vulnerabilities

- Patch critical/high CVEs within 48 hours
- Evaluate medium CVEs within 1 week
- Document accepted risks with rationale and review date
- Never suppress audit warnings without a tracking issue
