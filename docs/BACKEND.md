# ResumeForge — Backend Documentation

---

## Current Backend Architecture

The backend is implemented as **Next.js App Router API Route Handlers** running on Node.js, featuring Docker-sandboxed pdflatex compilation and secure GitHub OAuth account connection.

Routes implemented:
- `POST /api/compile`: Sandboxed pdflatex compilation endpoint
- `GET /api/github/login`: GitHub OAuth 2.0 authorization redirect with CSRF state generator (`repo` scope)
- `GET /api/github/callback`: GitHub OAuth callback, CSRF validation, and HTTP-only session cookie token exchange
- `GET /api/github/user`: Authenticated GitHub account identity fetcher (reads HTTP-only session cookie)
- `POST /api/github/logout`: Account disconnect endpoint clearing session cookies
- `GET /api/github/repos`: Lists accessible repositories for the authenticated user
- `POST /api/github/repos`: Creates a new GitHub repository (`name`, `description`, `private`)
- `GET /api/github/repos/inspect`: Checks default branch and detects existing files for overwrite safety
- `POST /api/github/export`: Safely exports project files via atomic Git Database API commit (blobs -> tree -> commit -> ref update) with path validation and binary image base64 decoding

---

## GitHub Integration Endpoints (Prompt 14)

### 1. `GET /api/github/login`

**Purpose**: Initiates GitHub OAuth 2.0 authorization flow.

**Execution Flow**:
1. Checks for `GITHUB_CLIENT_ID` in server environment. Returns redirect to `/?github_error=unconfigured` if missing.
2. Generates a cryptographically random UUID `state` (`crypto.randomUUID()`).
3. Constructs GitHub authorization URL requesting minimum scope (`read:user`):
   `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&scope=read:user&state=...`
4. Sets short-lived HTTP-only cookie `github_oauth_state` (`maxAge: 600`) for CSRF state verification.
5. Returns `302 Found` redirect to GitHub.

---

### 2. `GET /api/github/callback`

**Purpose**: Handles OAuth callback, validates state parameter, exchanges authorization code for an access token, and sets an HTTP-only session cookie.

**Execution Flow**:
1. Reads `code` and `state` from URL query parameters.
2. Reads `github_oauth_state` from HTTP-only request cookies.
3. **CSRF State Validation**: Compares `state` against `github_oauth_state` cookie. Rejects mismatches with redirect `/?github_error=state_mismatch` and clears state cookie.
4. **Server-to-Server Token Exchange**: Performs server-side POST request to `https://github.com/login/oauth/access_token` with `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `code`.
5. Sets HTTP-only session cookie `github_access_token` (`httpOnly: true`, `sameSite: "lax"`, `secure` in production, `maxAge: 30 days`).
6. Deletes `github_oauth_state` cookie.
7. Returns `302 Found` redirect to `/?github=connected`.

---

### 3. `GET /api/github/user`

**Purpose**: Fetches the authenticated user's profile identity.

**Execution Flow**:
1. Reads `github_access_token` from HTTP-only cookies. If missing, returns `{ connected: false, configured: true }`.
2. Calls GitHub API `GET https://api.github.com/user` with `Authorization: Bearer <token>`.
3. Returns `{ connected: true, configured: true, user: { login, name, avatar_url, html_url } }`.
4. On `401 Unauthorized` (revoked/expired token), clears `github_access_token` cookie and returns `{ connected: false }`.

---

### 4. `POST /api/github/logout`

**Purpose**: Disconnects GitHub account session.

**Execution Flow**:
1. Deletes `github_access_token` and `github_oauth_state` cookies (`maxAge: 0`).
2. Returns `{ connected: false, configured: !!process.env.GITHUB_CLIENT_ID }`.

---

## Compilation API Route: `app/api/compile/route.ts`

### Purpose

Accepts a multi-file LaTeX project payload, validates paths securely, writes all files to a temp directory, delegates compilation to `compileWithDocker()`, and returns the binary PDF or a structured error.

### Implementation Details

```
File: app/api/compile/route.ts
Method: POST
Route: /api/compile
```

**Payload Formats Supported:**
- **Full Multi-File Payload with Options**:
  ```json
  {
    "files": [
      { "path": "main.tex", "type": "tex", "content": "\\documentclass..." },
      { "path": "sections/experience.tex", "type": "tex", "content": "\\section{..." },
      { "path": "images/profile.png", "type": "image", "content": "data:image/png;base64,..." }
    ],
    "options": {
      "paperSize": "a4",
      "passes": 2
    }
  }
  ```

---

## Docker Compiler Bridge: `lib/dockerCompiler.ts`

### Exported API

| Export | Description |
|--------|-------------|
| `isDockerAvailable()` | Calls `docker info` (8s timeout, augmented Windows PATH). Returns `true`/`false`. |
| `compileWithDocker(tempDir, options)` | Runs pdflatex inside container. Returns `DockerCompileResult`. |

### Security Flags Applied to Every Container

| Flag | Value | Purpose |
|------|-------|---------|
| `--net=none` | — | Disable all network inside container |
| `--read-only` | — | Root filesystem is immutable |
| `--tmpfs /tmp` | `rw,noexec,nosuid,size=100m` | RAM disk for aux files, non-executable |
| `-v <tempDir>:/workspace` | `rw` | Scoped per-request workspace volume |
| `--user` | `1000:1000` | Non-root execution as `latexuser` |
| `-m` | `512m` | Memory cap |
| `--cpus` | `1.5` | CPU quota |
| `--pids-limit` | `64` | Fork bomb prevention |
| `--rm` | — | Auto-remove container on exit |
| `timeout` | `15000ms` | Hard timeout via `docker kill` + `SIGKILL` |
