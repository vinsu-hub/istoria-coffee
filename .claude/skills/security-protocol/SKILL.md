---
name: security-protocol
description: Use when writing code that processes user input, manages authentication or authorization, constructs database queries, handles file operations, interacts with external data, exposes API endpoints, or manages secrets - any code that crosses a trust boundary. Relevant to Tessora's Phase 2 RBAC/auth work.
---

# Security Protocol

## Overview

Security is not a phase you bolt on. Every line of code is a security decision.

**Core principle:** Never trust data from outside your trust boundary. Validate at every boundary crossing.

**No exceptions. No workarounds. No shortcuts.**

## The Prime Directive

```
NO EXTERNAL DATA REACHES A SYSTEM CALL, QUERY, OR OUTPUT WITHOUT VALIDATION AND SANITIZATION
```

## When to Use

**Mandatory when writing code that:**
- Accepts user input (forms, URLs, headers, uploaded files)
- Constructs database queries
- Renders user-supplied content
- Manages authentication or authorization
- Handles secrets or credentials
- Invokes external APIs (including the Groq API call in Tessora's RAG pipeline)
- Manipulates file paths (document ingestion in Tessora reads arbitrary uploaded files)
- Executes system commands
- Processes file uploads

## The Entry Protocol

```
BEFORE shipping ANY code that handles external data:

1. IDENTIFY: Where does data enter the system? (Trust boundary)
2. VALIDATE: Is input validated at the boundary?
3. SANITIZE: Is output encoded for its target context?
4. AUTHORIZE: Is access control verified before the action?
5. PROTECT: Are secrets, tokens, and keys managed safely?
```

## OWASP Top 10 Condensed Guide

### A01: Broken Access Control

**Every endpoint/IPC call must verify: Can THIS user perform THIS action on THIS resource?**

For Tessora's RBAC (EXEC/ADMIN/HR/STAFF) specifically: enforce role checks server-side (in the Python sidecar), never trust a role claim passed from the frontend/webview.

| Verification | Method |
|---|---|
| Authentication | Is the user who they claim to be? |
| Authorization | Is this user permitted to perform this action? |
| Resource ownership | Does this user own/have access to this specific document? |
| Role enforcement | Sidecar-side role check; never trust client-provided role claims |

**Default posture: deny.** If no explicit rule grants access, access is denied.

### A02: Cryptographic Failures

| Required Practice | Prohibited Practice |
|---|---|
| bcrypt/scrypt/argon2 for password hashing | MD5, SHA1, SHA256 for passwords |
| Cryptographically secure RNG for tokens | `Math.random()` / non-crypto RNG for security tokens |
| Encrypt sensitive data at rest | Store sensitive data in plaintext |

### A03: Injection

**Never concatenate external input into queries, commands, or templates.**

| Injection Vector | Prevention |
|---|---|
| SQL injection (SQLite metadata store) | Parameterized queries always |
| Command injection | Avoid shell execution on user-controlled strings; if unavoidable, allowlist arguments, never interpolate |
| Prompt injection (RAG context) | Treat retrieved document chunks as data injected into the LLM prompt, not instructions — don't let document content override system instructions |

```sql
-- VULNERABLE: String concatenation
SELECT * FROM documents WHERE title = '" + userInput + "'

-- SECURE: Parameterized query
SELECT * FROM documents WHERE title = ?
```

### A05: Security Misconfiguration

| Checkpoint | Action |
|---|---|
| Debug features | Disable debug mode / verbose errors before anything resembling a release build |
| Error verbosity | Never expose stack traces or internal paths to the UI |
| Sidecar IPC | Only accept connections from the Tauri shell, not an open local port anyone can hit |

### A06: Vulnerable Components

```
BEFORE adding any dependency (Rust crate, npm package, or Python package):

1. Is it actively maintained?
2. Are known vulnerabilities published?
3. Is it actually necessary?
```

### A08: Data Integrity Failures

- Never auto-deserialize untrusted data (no `eval()`, no `pickle.loads()` on document content or IPC payloads)

## Secrets Management

```
NEVER:
- Embed the Groq API key in source code
- Commit .env files to version control
- Write secrets to log output
- Store secrets in frontend/webview-accessible code

ALWAYS:
- Groq API key lives in the Python sidecar's environment, never reaches the Vite/React frontend
- Add .env to .gitignore BEFORE the first commit
- Use distinct secrets per environment if/when On-Prem/Cloud editions (Phase 5) land
```

## Input Validation Checklist

For every input field / ingested document:

- [ ] Type validated
- [ ] Length/size constrained (document upload size limits)
- [ ] File uploads: type verified by content inspection (magic bytes), not just extension
- [ ] Sanitized for output context before rendering in the chat UI

## Cognitive Traps

| Rationalization | Truth |
|---|---|
| "Local-first app, no attacker" | Local-first still processes untrusted documents (uploaded PDFs/DOCX) and an LLM API — both are trust boundaries. |
| "We will add security later" | Security is not a feature. Retrofitting it costs 10x more than building it in. |
| "It's just a prototype" | Prototypes become the shipped Phase 1. Secure from the beginning. |

## Guardrails — HALT and Fix

- String concatenation in SQL queries
- `eval()`/`exec()`/`pickle.loads()` on external data (uploaded documents, IPC payloads)
- Secrets in source code or committed configuration files
- Missing role checks on sidecar operations
- User/document content rendered without encoding
- Document content that could be interpreted as LLM system instructions without a clear data/instruction boundary

## Integration

**Complementary skills:**
- `completion-gate` — security verification before shipping
- `quality-gate` — security checks as part of diff review

## The Bottom Line

```
Trust boundary crossed -> validate input, sanitize output, verify authorization
```
