# ResumeForge — Backend Documentation

---

## Current Backend Architecture

The backend is implemented entirely as **Next.js App Router API Route Handlers** running on Node.js.

There is currently:
- **1 API route**: `POST /api/compile`
- **No database**
- **No file storage**
- **No authentication middleware**
- **No queue or worker**

---

## API Route: `app/api/compile/route.ts`

### Purpose

Accepts a LaTeX source string, compiles it to PDF using pdfLaTeX, and returns the PDF binary (HTTP 200) or structured error JSON (HTTP 500).

### Implementation Details

```
File: app/api/compile/route.ts
Method: POST
Route: /api/compile
```

**Execution flow:**

1. Parse JSON body: extract `latex: string`
2. Validate: if `!latex || typeof latex !== "string"` → return 400 `{ error: "No LaTeX source provided." }`
3. `fs.mkdtemp(path.join(os.tmpdir(), "resumeforge-"))` → create unique temp directory
4. `fs.writeFile(texFile, latex, "utf8")` → write `main.tex` into temp dir
5. `execFileAsync(pdflatex, [args], { cwd: tempDir, timeout: 30_000, windowsHide: true })` → run compiler
6. `fs.readFile(path.join(tempDir, "main.pdf"))` → read compiled PDF
7. Return `new NextResponse(pdf, { status: 200, headers: { "Content-Type": "application/pdf" } })`
8. **Finally block**: `fs.rm(tempDir, { recursive: true, force: true })` → cleanup (always runs)

**Error handling (Prompt 2.1 Update):**
- Structured error JSON response on HTTP 500:
  ```json
  {
    "error": "Compilation failed.",
    "details": "<full pdfLaTeX console stdout/stderr output>"
  }
  ```
- Replaced explicit `any` in catch block with `unknown` type (`catch (error: unknown)`).

---

## Compiler Configuration

| Property | Current Value |
|----------|--------------|
| Executable | `C:\texlive\2026\bin\windows\pdflatex.exe` |
| Flags | `-interaction=nonstopmode` `-halt-on-error` `-file-line-error` |
| Working directory | Unique temp dir (`%TEMP%\resumeforge-XXXXXX`) |
| Timeout | 30,000ms |
| Window hidden | `windowsHide: true` |

---

## Security Concerns

> See `SECURITY.md` for full details.

| Risk | Current State |
|------|--------------|
| Arbitrary LaTeX execution | **No protection** — LaTeX can run shell commands via `\write18` |
| Filesystem read/write | **No protection** — LaTeX runs with server process permissions |
| CPU/memory exhaustion | 30s timeout only |
| No authentication | **CRITICAL** — anyone can hit the API |
| No rate limiting | **CRITICAL** — endpoint can be hammered |
