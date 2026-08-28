# ResumeForge — Backend Documentation

---

## Current Backend Architecture

The backend is implemented entirely as **Next.js App Router API Route Handlers** running on Node.js.

There is currently:
- **1 API route**: `POST /api/compile`
- **No database**
- **No permanent file storage**
- **No authentication middleware**
- **No queue or worker**

---

## API Route: `app/api/compile/route.ts`

### Purpose

Accepts a multi-file LaTeX project payload containing `.tex` files and binary base64 image assets, validates file paths securely, writes the project structure to a temporary compilation directory, runs `pdflatex main.tex`, and returns the binary PDF (HTTP 200) or structured error JSON (HTTP 500).

### Implementation Details

```
File: app/api/compile/route.ts
Method: POST
Route: /api/compile
```

**Payload Formats Supported:**
- **New Multi-File Payload**:
  ```json
  {
    "files": [
      { "path": "main.tex", "type": "tex", "content": "\\documentclass..." },
      { "path": "sections/experience.tex", "type": "tex", "content": "\\section{..." },
      { "path": "images/profile.png", "type": "image", "content": "data:image/png;base64,..." }
    ]
  }
  ```
- **Legacy Single-File Payload**:
  ```json
  { "latex": "\\documentclass..." }
  ```

**Execution Flow:**
1. Parse JSON body and extract `files` array or legacy `latex` string.
2. Validate payload structure and ensure `main.tex` is present in `files`.
3. **Path Security Check (`resolveSecurePath`)**: Validates every relative path, rejecting absolute paths (`C:\`), path traversal sequences (`../`), or leading slashes with HTTP 400 Bad Request.
4. `fs.mkdtemp(path.join(os.tmpdir(), "resumeforge-"))` → create isolated temp directory.
5. **File Writing Pipeline**:
   - For `.tex` text files: writes UTF-8 text to disk.
   - For `image` files (or base64 `data:image/` content): verifies size limit (5 MB max), strips data URL headers, decodes base64 string into a `Buffer`, creates subfolders (e.g. `images/`), and writes binary image bytes to disk.
6. `execFileAsync(pdflatex, ["-interaction=nonstopmode", "-halt-on-error", "-file-line-error", "main.tex"], { cwd: tempDir, timeout: 30_000, windowsHide: true })` → execute compiler against `main.tex`.
7. `fs.readFile(path.join(tempDir, "main.pdf"))` → read resulting PDF binary.
8. Return `NextResponse` with HTTP 200 OK and `Content-Type: application/pdf`.
9. **Finally Block**: `fs.rm(tempDir, { recursive: true, force: true })` → cleans up temp directory completely.

**Error Handling:**
- Returns structured JSON on compilation failure (HTTP 500):
  ```json
  {
    "error": "Compilation failed.",
    "details": "<full pdfLaTeX console stdout/stderr output>"
  }
  ```

---

## Compiler Configuration

| Property | Current Value |
|----------|--------------|
| Executable | `C:\texlive\2026\bin\windows\pdflatex.exe` |
| Flags | `-interaction=nonstopmode` `-halt-on-error` `-file-line-error` |
| Working directory | Unique temp dir (`%TEMP%\resumeforge-XXXXXX`) |
| Timeout | 30,000ms |
| Window hidden | `windowsHide: true` |
| Max Image Size | 5,242,880 bytes (5 MB per image asset) |

---

## Security Status

> See `SECURITY.md` for full details.

| Risk | Current State |
|------|--------------|
| Path Traversal | **PROTECTED** — `resolveSecurePath` rejects `../` and absolute paths |
| Image File Size Exhaustion | **PROTECTED** — Server rejects image assets larger than 5 MB |
| Arbitrary LaTeX Execution | **No Protection** — LaTeX can execute commands via `\write18` |
| Filesystem Scope | **Isolated Temp Dir** — files cleaned up immediately in finally block |
| Authentication | **No Protection** — Endpoint open to client requests |
