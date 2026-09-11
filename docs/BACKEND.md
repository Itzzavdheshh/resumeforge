# ResumeForge — Backend Documentation

---

## Current Backend Architecture

The backend is implemented as **Next.js App Router API Route Handlers** running on Node.js, with compilation sandboxed inside a **Docker container**.

There is currently:
- **1 API route**: `POST /api/compile`
- **1 Docker image**: `resumeforge-compiler:latest`
- **No database**
- **No permanent file storage**
- **No authentication middleware**
- **No queue or worker**

---

## Compilation Pipeline

```
POST /api/compile
  → Input validation (path traversal, duplicates, image size, main.tex presence)
  → fs.mkdtemp() — isolated temp directory per request
  → Write .tex files (UTF-8) and image assets (binary from base64)
  → compileWithDocker(tempDir, options)
      → isDockerAvailable() — docker info check (8s timeout)
      → docker run [security flags] resumeforge-compiler:latest pdflatex ...
      → (optional) docker run pass 2 for cross-references
      → read main.pdf from tempDir
  → Return application/pdf binary (HTTP 200)
  → finally: fs.rm(tempDir) — guaranteed cleanup
```

---

## API Route: `app/api/compile/route.ts`

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
- **Legacy Single-File Payload**:
  ```json
  { "latex": "\\documentclass..." }
  ```

**Execution Flow:**
1. Parse JSON body, extract `files` array (or legacy `latex` string) and `options`.
2. Validate payload structure, check for duplicates, ensure `main.tex` is present.
3. **Path Security Check (`resolveSecurePath`)**: Rejects `../`, absolute drives, double-slashes (HTTP 400).
4. `fs.mkdtemp(path.join(os.tmpdir(), "resumeforge-"))` — create isolated temp directory.
5. **File Writing Pipeline**:
   - `.tex` text files: write UTF-8 to disk.
   - `image` files (base64 `data:image/`): verify 5 MB limit, strip data URL header, decode to binary `Buffer`, create subfolders (`images/`), write binary to disk.
6. **Docker Compilation** (`compileWithDocker(tempDir, options)`):
   - Check Docker availability via `isDockerAvailable()`.
   - Run `docker run` with full security hardening flags.
   - Repeat for Pass 2 if requested.
7. Read `main.pdf` from temp directory as `ArrayBuffer`.
8. Return `NextResponse` with HTTP 200 OK and `Content-Type: application/pdf`.
9. **Finally Block**: `fs.rm(tempDir, { recursive: true, force: true })` — guaranteed cleanup.

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 400 | Bad request: missing `main.tex`, path traversal, duplicate paths, missing `content`, oversized image |
| 500 | Compilation error: LaTeX syntax error inside Docker |
| 503 | Docker daemon unavailable and no dev fallback |

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

### Docker Compiler Configuration

| Property | Current Value |
|----------|--------------|
| Docker Image | `resumeforge-compiler:latest` |
| Base Image | `debian:bookworm-slim` |
| TeX packages | `texlive-latex-base`, `texlive-latex-recommended`, `texlive-pictures`, `texlive-fonts-recommended`, `ghostscript` |
| pdflatex flags | `-interaction=nonstopmode` `-halt-on-error` `-file-line-error` |
| Compilation timeout | 15,000ms |
| Container user | `latexuser` (UID 1000, GID 1000) |
| Working directory | `/workspace` (mounted from host `tempDir`) |

---

## Dev-Only Fallback

When `ALLOW_HOST_COMPILER_FALLBACK=true` is set in the environment and Docker is unavailable, the API falls back to direct host `pdflatex` execution. A `[SECURITY WARNING]` is emitted to the server console. This must **never** be enabled in production.

| Property | Dev Fallback Value |
|----------|-------------------|
| Executable | `C:\texlive\2026\bin\windows\pdflatex.exe` |
| Timeout | 30,000ms |
| Window hidden | `windowsHide: true` |

---

## Security Status (Prompt 11)

| Risk | Current State |
|------|--------------|
| Arbitrary LaTeX Code Execution | **SANDBOXED** — runs inside isolated Docker container with `--net=none`, `--read-only`, non-root user |
| Path Traversal | **PROTECTED** — `resolveSecurePath()` rejects `../` and absolute paths |
| Image File Size Exhaustion | **PROTECTED** — server rejects images > 5 MB |
| Memory Exhaustion | **LIMITED** — container capped at 512 MB RAM |
| CPU Exhaustion | **LIMITED** — container capped at 1.5 CPUs |
| Fork Bomb | **LIMITED** — `--pids-limit=64` |
| Compilation Hang | **PROTECTED** — 15s hard timeout with `docker kill` |
| Filesystem Scope | **ISOLATED** — scoped volume mount, cleaned up in `finally` block |
| Authentication | **No Protection** — endpoint open to all requests |
| Rate Limiting | **No Protection** — no per-IP or per-user limiting |
