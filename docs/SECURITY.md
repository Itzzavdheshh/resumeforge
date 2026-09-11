# ResumeForge — Security Documentation

---

## Overview

As of **Prompt 11**, LaTeX compilation is **sandboxed inside an isolated Docker container** (`resumeforge-compiler:latest`). The host system no longer executes `pdflatex` directly. All compilation jobs are mediated through `lib/dockerCompiler.ts`, which applies multiple layers of security hardening.

---

## IMPLEMENTED PROTECTIONS (Current State)

| Protection | Status | Implementation |
|-----------|--------|---------------|
| Docker container isolation | ✅ IMPLEMENTED | `lib/dockerCompiler.ts` |
| `--net=none` network isolation | ✅ IMPLEMENTED | Container cannot make any outbound requests |
| `--read-only` root filesystem | ✅ IMPLEMENTED | Container can only write to `/tmp` and `/workspace` |
| `-m 512m` memory limit | ✅ IMPLEMENTED | Container RAM capped at 512 MB |
| `--cpus=1.5` CPU quota | ✅ IMPLEMENTED | Container CPU limited to 1.5 cores |
| `--pids-limit=64` fork bomb protection | ✅ IMPLEMENTED | Process count capped at 64 |
| `--tmpfs /tmp:rw,noexec,nosuid` | ✅ IMPLEMENTED | RAM-backed temp disk, non-executable |
| Non-root user (UID 1000) | ✅ IMPLEMENTED | `latexuser` inside container, `--user 1000:1000` |
| `--rm` automatic container cleanup | ✅ IMPLEMENTED | Containers removed immediately on exit |
| 15-second compilation timeout | ✅ IMPLEMENTED | Hard kill via `docker kill` + `SIGKILL` |
| Path traversal protection | ✅ IMPLEMENTED | `resolveSecurePath()` validates all file paths |
| Input type validation | ✅ IMPLEMENTED | `typeof latex === "string"` + file array checks |
| Duplicate path rejection | ✅ IMPLEMENTED | Checked before file write |
| `main.tex` presence enforcement | ✅ IMPLEMENTED | Returns 400 if not present |
| 5 MB max image size | ✅ IMPLEMENTED | Each image asset validated server-side |
| `execFile` (not `exec`) | ✅ IMPLEMENTED | Prevents shell injection via arguments |
| Per-request temp directory | ✅ IMPLEMENTED | Isolated per compilation, cleaned in `finally` |
| 503 response if Docker down | ✅ IMPLEMENTED | Graceful structured error, no crash |
| Dev-only fallback flag | ✅ IMPLEMENTED | `ALLOW_HOST_COMPILER_FALLBACK=true` env var |
| `-interaction=nonstopmode` | ✅ IMPLEMENTED | Prevents pdflatex from waiting for input |
| `-halt-on-error` | ✅ IMPLEMENTED | Ensures pdflatex exits on first error |
| `-file-line-error` | ✅ IMPLEMENTED | Structured error output for log parsing |

---

## REMAINING RISKS

The following risks still exist and are **acceptable for local/private development** but must be resolved before any public deployment.

### 1. No Authentication

**Severity**: CRITICAL for production

The `/api/compile` endpoint is completely open. Any person with the URL can:
- Send unlimited compilation requests (consuming CPU, RAM, disk)
- Trigger Docker container creation on the host

**Required fix for production**: Authentication (user accounts, API keys, or session-based auth).

---

### 2. No Rate Limiting

**Severity**: CRITICAL for production

Without rate limiting, a single attacker (or bot) can overwhelm the server with parallel container-spawning compilation requests.

**Required fix for production**: Rate limiting middleware (e.g., per-IP, per-user), combined with a proper compilation queue and concurrency limit.

---

### 3. No Disk Quota per Compilation

**Severity**: MEDIUM

While the container root filesystem is read-only, the `/workspace` volume mount and `/tmp` tmpfs can still be written to. A malicious document generating massive aux files could exhaust host disk space in the temp directory.

**Required fix for production**: Disk quota via `--storage-opt size=` or explicit temp directory size monitoring with cleanup on excess.

---

### 4. Compilation Queue / Backpressure

**Severity**: MEDIUM

Under concurrent requests, multiple containers can be spawned in parallel. There is no concurrency cap or queue.

**Required fix for production**: A compilation queue that limits concurrent Docker container runs (e.g., max 4 concurrent compiles).

---

### 5. Compiler Log Sanitization

**Severity**: LOW

pdflatex log output is returned verbatim in the `details` field of error responses. Logs may include file paths from the temp directory.

**Required fix for production**: Strip temp directory paths from logs before returning them to clients.

---

### 6. HTTPS, CORS, CSP, CSRF

**Severity**: MEDIUM (for production)

No HTTPS enforcement, CORS policy, Content Security Policy, or CSRF protection is implemented.

**Required fix for production**: Apply HTTPS via reverse proxy (e.g., nginx), CORS headers in Next.js middleware, CSP headers, and CSRF token for form actions.

---

### 7. Docker Socket Exposure

**Severity**: MEDIUM

The Next.js server communicates with Docker via the host Docker socket (`/var/run/docker.sock` or npipe on Windows). If an attacker could compromise the Next.js process, they could potentially issue Docker commands.

**Mitigation in production**: Run the Next.js server in a container that has only scoped access to Docker (e.g., via a Docker-in-Docker proxy or a dedicated compilation microservice that exposes a limited REST API).

---

## Dev-only Fallback

An **unsafe host fallback** is available for development use when Docker Desktop is not running:

```bash
ALLOW_HOST_COMPILER_FALLBACK=true npm run dev
```

This runs `pdflatex` directly on the host with **no isolation**. A `[SECURITY WARNING]` line is emitted to the server console every time the fallback is triggered. This env flag must **never** be set in production.

---

## Production Readiness Checklist

| # | Requirement | Status |
|---|------------|--------|
| 1 | Compiler runs in isolated Docker container | ✅ DONE (Prompt 11) |
| 2 | Network disabled inside container | ✅ DONE (Prompt 11) |
| 3 | Memory & CPU limits per container | ✅ DONE (Prompt 11) |
| 4 | Non-root user inside container | ✅ DONE (Prompt 11) |
| 5 | 15-second hard timeout with container kill | ✅ DONE (Prompt 11) |
| 6 | Path traversal prevention | ✅ DONE (Prompt 7) |
| 7 | 5 MB image size limit | ✅ DONE (Prompt 7) |
| 8 | Authentication (user accounts or API keys) | ❌ Not implemented |
| 9 | Rate limiting per IP and per user | ❌ Not implemented |
| 10 | Disk quota per compilation | ❌ Not implemented |
| 11 | Compilation queue with concurrency limit | ❌ Not implemented |
| 12 | Compiler log sanitization | ❌ Not implemented |
| 13 | HTTPS enforced | ❌ Not implemented |
| 14 | CORS policy | ❌ Not implemented |
| 15 | CSP headers | ❌ Not implemented |
| 16 | CSRF protection | ❌ Not implemented |

---

## Security Principle

> Every feature that involves user-provided content running on the server must be treated as potentially hostile.

LaTeX is a Turing-complete programming language. Treat user-submitted LaTeX source the same way you would treat user-submitted shell scripts: **never execute it outside a fully isolated environment.** With Prompt 11, ResumeForge now meets this baseline requirement.
