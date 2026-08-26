# ResumeForge — Security Documentation

---

## Overview

The current implementation has **no meaningful security protections** beyond a 30-second compilation timeout.

This is acceptable for a local development prototype running on a developer's machine. It is **NOT acceptable for any public deployment**.

---

## CURRENT PROTECTIONS

| Protection | Status | Notes |
|-----------|--------|-------|
| Compilation timeout (30s) | IMPLEMENTED | The only protection in place |
| `execFile` instead of `exec` | IMPLEMENTED | Prevents shell injection via arguments, but not via LaTeX content |
| Temp directory per request | IMPLEMENTED | Isolates each compilation's files |
| Input type check | IMPLEMENTED | Validates `typeof latex === "string"` |

---

## CURRENT RISKS

### 1. Arbitrary Code Execution via LaTeX

**Severity**: CRITICAL for production

pdfLaTeX supports a feature called "shell escape" (`\write18`) that allows LaTeX source to execute arbitrary OS commands. In TeX Live, this is disabled by default in `nonstopmode`, but:

- The current code does not explicitly pass `--no-shell-escape`
- A custom `texmf.cnf` or environment change could enable it
- There is no validation that the LaTeX source is safe

**What an attacker could do**: Depending on TeX Live configuration, they could potentially read files, execute commands, or exfiltrate data from the server.

**Required fix for production**: Run compilation inside an isolated container (Docker) with no network access and a restricted filesystem.

---

### 2. No Authentication

**Severity**: CRITICAL for production

The `/api/compile` endpoint is completely open. Any person with the URL can:
- Send unlimited compilation requests
- Exhaust CPU resources
- Consume disk space with temp files
- Trigger the compiler 30 seconds at a time, per request, in parallel

**Required fix for production**: Authentication (user accounts, API keys, or session-based auth).

---

### 3. No Rate Limiting

**Severity**: CRITICAL for production

Without rate limiting, a single attacker (or bot) can overwhelm the server with compilation requests:
- No limit on requests per IP
- No limit on requests per user
- No queue or backpressure

**Required fix for production**: Rate limiting middleware (e.g., per-IP, per-user), combined with a proper compilation queue.

---

### 4. No Memory Limit on Compiler

**Severity**: HIGH

The pdfLaTeX process runs without any memory limit. A carefully crafted LaTeX document with recursive macros or extremely large data can exhaust the server's RAM.

**Required fix for production**: Memory limits enforced at the container level (Docker `--memory`).

---

### 5. No CPU Limit on Compiler

**Severity**: HIGH

The 30-second `timeout` option in `execFileAsync` kills the process after 30 seconds, but during those 30 seconds the process can use 100% of one CPU core. Under concurrent requests, this can saturate the server.

**Required fix for production**: CPU limits at the container level (Docker `--cpus`), plus a compilation queue to serialize or throttle jobs.

---

### 6. Disk Exhaustion via LaTeX

**Severity**: MEDIUM

LaTeX can write files to disk via `\write`, `\openout`, etc. (when not in restricted mode). A malicious document could generate very large auxiliary files.

**Required fix for production**: Disk quota per compilation directory (via Docker `--storage-opt` or equivalent), plus quotas on object storage.

---

### 7. Hardcoded Compiler Path

**Severity**: LOW (for security), HIGH (for portability)

The path `C:\texlive\2026\bin\windows\pdflatex.exe` is hardcoded. If this is ever deployed on a different machine:
- Compilation will silently fail
- There is no environment variable override

**Risk for security**: If an attacker could influence this path (e.g., via environment variable injection), they could execute an arbitrary binary. Currently the path is hardcoded in source, so this is not a live risk.

**Fix**: Use an environment variable (`PDFLATEX_PATH`) with a documented default.

---

### 8. Blob URL Memory Leak

**Severity**: LOW (client-side only)

`URL.createObjectURL()` is called on each compilation, but `URL.revokeObjectURL()` is never called. Each compiled PDF's blob remains in browser memory until the tab is closed.

This is a client-side issue only and has no server security implications.

---

## REQUIRED FOR PRODUCTION

The following must be implemented before any public deployment:

| # | Requirement | Priority |
|---|------------|---------|
| 1 | Compiler runs in isolated Docker container | CRITICAL |
| 2 | Network disabled inside container | CRITICAL |
| 3 | Authentication (user accounts or API keys) | CRITICAL |
| 4 | Rate limiting per IP and per user | CRITICAL |
| 5 | CPU and memory limits per container | CRITICAL |
| 6 | Disk quota per compilation | HIGH |
| 7 | Compilation queue (backpressure) | HIGH |
| 8 | Input size limit (max LaTeX bytes) | HIGH |
| 9 | Compilation timeout enforced at queue level | HIGH |
| 10 | `--no-shell-escape` flag passed explicitly | HIGH |
| 11 | Compiler path via environment variable | MEDIUM |
| 12 | Compiler log sanitized before display | MEDIUM |
| 13 | HTTPS enforced | MEDIUM |
| 14 | CORS policy | MEDIUM |
| 15 | CSP headers | MEDIUM |
| 16 | CSRF protection | MEDIUM |

---

## Security Principle for Future Development

> Every feature that involves user-provided content running on the server must be treated as potentially hostile.

LaTeX is a Turing-complete programming language. Treat user-submitted LaTeX source the same way you would treat user-submitted shell scripts: **never execute it outside a fully isolated environment**.
