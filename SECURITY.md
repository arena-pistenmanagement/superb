# Security Policy

## Supported Versions

Seed4Forest is currently maintained as a continuously updated application rather
than as multiple supported release branches.

| Version                                 | Supported |
| --------------------------------------- | --------- |
| Current `main` branch                   | Yes       |
| Latest published release                | Yes       |
| Older commits, releases, or deployments | No        |

Security fixes are normally applied to the current version only.

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues,
discussions, pull requests, or other public channels.

Use GitHub's private vulnerability reporting feature:

1. Open the **Security** tab of this repository.
2. Select **Advisories**.
3. Select **Report a vulnerability**.
4. Provide the information requested below.

If private vulnerability reporting is unavailable, contact:

`[INSERT SECURITY CONTACT EMAIL]`

Do not publish vulnerability details before the maintainers have had a
reasonable opportunity to investigate and address the issue.

## Information to Include

Please include as much of the following information as possible:

- A description of the vulnerability.
- The affected URL, component, version, release, or commit.
- Steps required to reproduce the issue.
- A minimal proof of concept, where appropriate.
- The potential security impact.
- Whether the issue is already being actively exploited.
- Suggested mitigations or fixes, if known.

Please remove credentials, access tokens, personal data, and other sensitive
information from screenshots, logs, and example files.

## Response Process

The maintainers aim to:

- Acknowledge a report within five business days.
- Provide an initial assessment within ten business days.
- Keep the reporter informed about remediation progress.
- Coordinate the publication of vulnerability details.
- Credit the reporter, unless anonymity is requested.

These targets may vary depending on severity and project resources.

## Scope

Examples of issues that are in scope include:

- Unauthorized access to application data or administrative functionality.
- Path traversal, arbitrary file access, or unintended file disclosure.
- Injection vulnerabilities.
- Cross-site scripting or cross-site request forgery.
- Server-side request forgery.
- Authentication or authorization weaknesses.
- Exposure of credentials, access tokens, personal data, or confidential data.
- Vulnerabilities in report generation, API routes, or file processing.
- Vulnerabilities in the private-to-public repository synchronization workflow.
- Dependency vulnerabilities that can be demonstrated to affect Seed4Forest.

## Out of Scope

The following are generally out of scope:

- Reports without a demonstrable security impact.
- Automated scanner results without verification.
- Denial-of-service or load testing.
- Social engineering or phishing.
- Physical attacks.
- Vulnerabilities exclusively affecting unsupported versions.
- Issues in third-party services that are not caused by Seed4Forest.
- Scientific model accuracy or data-quality concerns without a security impact.

Do not perform testing that disrupts services, accesses data belonging to other
users, modifies production data, or violates applicable law.

## Coordinated Disclosure

Please allow the maintainers reasonable time to investigate and release a fix
before publicly disclosing a vulnerability.

When appropriate, confirmed vulnerabilities and fixes will be documented using
GitHub Security Advisories and release notes.

## Security Updates

Security-related updates may be announced through:

- GitHub Security Advisories
- Repository releases
- Release notes or changelog entries
