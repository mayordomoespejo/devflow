# Security Policy

## Supported Versions

Only the latest published release is supported for security fixes.

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

## Security Model

Devflow is a local file-installation CLI.

At runtime it:

- reads files bundled in `templates/`
- copies those files into a target repository
- does not make network requests
- does not manage credentials or secrets

The primary security concerns are:

- malicious or unsafe template content
- unsafe overwrite behavior
- path handling bugs
- misleading documentation that causes unsafe agent behavior

## Current Safeguards

- `templates/` is the source of truth for installed files
- `--force` only overwrites Devflow-managed paths:
  `AGENTS.md`, `DEVFLOW.md`, `devflow/`, `.cursor/`, `.devflow/`
- template validation checks required install assets
- smoke tests verify the expected install outputs

## Reporting A Vulnerability

Do not report security issues in a public GitHub issue.

Please use GitHub Security Advisories or a private contact channel for responsible disclosure.

Include:

- a clear description of the issue
- affected version
- reproduction steps
- impact
- any suggested mitigation or fix

## Response Expectations

- acknowledgement within 5 business days
- validation and triage as quickly as possible
- a patch release when the issue is confirmed and fixable
