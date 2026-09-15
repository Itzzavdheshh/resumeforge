# ResumeForge — Security Documentation

---

## Overview

ResumeForge enforces defense-in-depth across both execution compilation sandboxing and account authentication:
1. **Docker Compiler Isolation (Prompt 11)**: LaTeX compilation runs inside an unprivileged Docker container (`resumeforge-compiler:latest`) with strict network, filesystem, and resource constraints.
2. **GitHub OAuth & Token Security (Prompt 14)**: GitHub integration uses OAuth 2.0 with HTTP-only cookie session storage, CSRF `state` parameter validation, and minimal scope authorization (`read:user`). No tokens or PATs are ever saved to `localStorage` or exposed to client JavaScript.

---

## IMPLEMENTED PROTECTIONS (Current State)

| Protection | Status | Implementation |
|-----------|--------|---------------|
| HTTP-Only Session Cookie Token Storage | ✅ IMPLEMENTED | `app/api/github/callback/route.ts` (`httpOnly: true`, `sameSite: "lax"`) |
| OAuth CSRF State Parameter Validation | ✅ IMPLEMENTED | `app/api/github/login` & `callback` (`crypto.randomUUID()`) |
| Minimum OAuth Permission Scope (`read:user`) | ✅ IMPLEMENTED | `app/api/github/login/route.ts` |
| Client Secret & Token Isolation | ✅ IMPLEMENTED | Server-to-server token exchange, 0 tokens in `localStorage` |
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
| Path traversal protection | ✅ IMPLEMENTED | `resolveSecurePath()` & `validateFilePath()` |
| Input type validation | ✅ IMPLEMENTED | `typeof latex === "string"` + file array checks |
| Duplicate path rejection | ✅ IMPLEMENTED | Checked before file write |
| `main.tex` presence enforcement | ✅ IMPLEMENTED | Returns 400 if not present |
| 5 MB max image size | ✅ IMPLEMENTED | Each image asset validated server-side |
| `execFile` (not `exec`) | ✅ IMPLEMENTED | Prevents shell injection via arguments |
| Per-request temp directory | ✅ IMPLEMENTED | Isolated per compilation, cleaned in `finally` |
| 503 response if Docker down | ✅ IMPLEMENTED | Graceful structured error, no crash |

---

## GITHUB INTEGRATION SECURITY MODEL (Prompt 14)

### 1. HTTP-Only Cookie Session Storage
OAuth access tokens received from GitHub are stored exclusively in HTTP-only cookies (`github_access_token`):
- `httpOnly: true`: Prevents client-side JavaScript (`document.cookie`, `localStorage`, React state) from reading access tokens, eliminating XSS token theft.
- `sameSite: "lax"`: Prevents cross-site request forgery when sending authenticated requests.
- `secure: true`: Enforced automatically in production environments (`NODE_ENV === "production"`).

### 2. CSRF State Protection
To prevent OAuth login hijacking:
1. `GET /api/github/login` generates a cryptographically random UUID (`crypto.randomUUID()`).
2. Stores `state` in a short-lived HTTP-only cookie (`github_oauth_state`, 10 minutes TTL).
3. `GET /api/github/callback` validates incoming `state` parameter against `github_oauth_state` cookie.
4. If state is missing or mismatched, request is immediately rejected (HTTP 400).

### 3. Server-to-Server Token Exchange
Token exchange occurs entirely server-side between the Next.js API route (`/api/github/callback`) and `https://github.com/login/oauth/access_token`. `GITHUB_CLIENT_SECRET` and access tokens are never sent to or rendered in browser client bundles.

### 4. Minimum Scope Authorization
ResumeForge requests ONLY `read:user` scope during account connection. No repository write access (`repo`, `workflow`) is requested at this stage.

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
| 8 | OAuth HTTP-Only cookie token storage | ✅ DONE (Prompt 14) |
| 9 | OAuth CSRF state protection | ✅ DONE (Prompt 14) |
| 10 | Minimum permission scope (`read:user`) | ✅ DONE (Prompt 14) |
| 11 | Authentication (user accounts or API keys) | ❌ Not implemented |
| 12 | Rate limiting per IP and per user | ❌ Not implemented |
| 13 | Disk quota per compilation | ❌ Not implemented |
| 14 | Compilation queue with concurrency limit | ❌ Not implemented |
