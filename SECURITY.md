# Security Policy

## Supported versions

Only the latest published version of Devflow receives security fixes.

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✓ |

## What Devflow does

Devflow is a file-copy CLI. It reads template files bundled with the npm package and writes them to a target directory on your local filesystem.

- No network requests at runtime
- No code execution beyond file I/O
- No credentials, tokens, or secrets are read or written
- `--force` only overwrites files within known managed paths (`AGENTS.md`, `.cursor`, `.claude`, `.codex`, `.gemini`)

The primary attack surface is the template files themselves. A compromised npm package could install malicious instruction files into your project, which would be read by your AI coding tool.

## Reporting a vulnerability

If you discover a security issue — including a supply-chain concern, a path traversal bug, or a template that could cause an AI tool to behave dangerously — please report it privately.

**Do not open a public GitHub issue for security vulnerabilities.**

Report by email or via [GitHub private vulnerability reporting](https://github.com/mayordomoespejo/devflow/security/advisories/new).

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

You will receive a response within 5 business days. If confirmed, a fix will be released as a patch version and credited in the changelog.
