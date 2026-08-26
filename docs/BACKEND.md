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

Accepts a LaTeX source string, compiles it to PDF using pdfLaTeX, and returns the PDF binary.

### Implementation Details

```
File: app/api/compile/route.ts
Method: POST
Route: /api/compile
```

**Imports used:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";
```

**Step-by-step execution flow:**

1. Parse JSON body: extract `latex: string`
2. Validate: if `!latex || typeof latex !== "string"` → return 400
3. `fs.mkdtemp(path.join(os.tmpdir(), "resumeforge-"))` → create unique temp directory
4. `fs.writeFile(texFile, latex, "utf8")` → write `main.tex` into temp dir
5. `execFileAsync(pdflatex, [args], { cwd: tempDir, timeout: 30_000, windowsHide: true })` → run compiler
6. `fs.readFile(path.join(tempDir, "main.pdf"))` → read compiled PDF
7. Return `new NextResponse(pdf, { status: 200, headers: { "Content-Type": "application/pdf" } })`
8. **Finally block**: `fs.rm(tempDir, { recursive: true, force: true })` → cleanup (always runs)

**Error handling:**
- If input validation fails → `NextResponse.json({ error: "..." }, { status: 400 })`
- If pdfLaTeX throws → catch block returns `NextResponse.json({ error: error.stderr || error.stdout || error.message }, { status: 500 })`
- Cleanup always runs in `finally`

---

## Compiler Configuration

| Property | Current Value |
|----------|--------------|
| Executable | `C:\texlive\2026\bin\windows\pdflatex.exe` |
| Flags | `-interaction=nonstopmode` `-halt-on-error` `-file-line-error` |
| Working directory | Unique temp dir (`%TEMP%\resumeforge-XXXXXX`) |
| Timeout | 30,000ms |
| Window hidden | `windowsHide: true` |

**Flag meanings:**
- `-interaction=nonstopmode` — don't stop for user input even on error
- `-halt-on-error` — exit immediately on the first error
- `-file-line-error` — format error messages as `file:line: error` (easier to parse)

---

## Filesystem Handling

**Temporary directories** are used per compilation:
- Created with `fs.mkdtemp` → unique per request
- Located in `os.tmpdir()` (typically `C:\Users\{user}\AppData\Local\Temp` on Windows)
- Contain: `main.tex`, `main.log`, `main.aux`, `main.pdf` (and other pdfLaTeX auxiliary files)
- Deleted after every request (success or failure) via `finally` block

**Fragility**: If the Node.js process crashes mid-compilation, the `finally` block will not run and the temp directory will be left behind. This is an **orphaned temp file** risk under high load or crash scenarios.

---

## Process Execution

Uses Node.js `child_process.execFile` (promisified):
- `execFile` is safer than `exec` because it does not invoke a shell — the executable is called directly with an array of arguments
- However, this does NOT prevent malicious LaTeX from executing shell commands (via `\write18`, `\input`, etc.)

---

## Error Handling

**Current behavior:**
- Compiler errors (non-zero exit code) are caught and the `error.stderr` or `error.stdout` is returned to the frontend as a JSON error string
- The raw pdfLaTeX log output is returned, which is often verbose and confusing to users
- No log parsing or formatting

**Missing:**
- Structured error extraction (line number, error type)
- Formatted error messages for users
- Distinction between "LaTeX syntax error" and "system/compiler error"

---

## Security Concerns

> See `SECURITY.md` for full details. Summary below.

| Risk | Current State |
|------|--------------|
| Arbitrary LaTeX execution | **No protection** — LaTeX can run shell commands via `\write18` |
| Filesystem read/write via LaTeX | **No protection** — LaTeX runs with server process permissions |
| CPU exhaustion | 30s timeout only |
| Memory exhaustion | No limit |
| Path traversal in temp dir | Not applicable — temp files use system-generated unique names |
| No authentication | **CRITICAL** — anyone can hit the API |
| No rate limiting | **CRITICAL** — endpoint can be hammered |
| Hardcoded compiler path | Works only on the developer's machine |

---

## Current Limitations

1. **Hardcoded compiler path** — fails on any machine without `C:\texlive\2026\bin\windows\pdflatex.exe`
2. **Single-pass compilation** — complex documents with `\ref`, `\cite`, TOC, etc. may have unresolved references
3. **No BibTeX / Biber support** — bibliography compilation not implemented
4. **No multi-file support** — only `main.tex` is written; `\input{}` or `\include{}` to other files will fail
5. **No file upload** — users cannot upload existing `.tex` files or assets (images, `.cls`, `.sty`)
6. **Raw error output** — pdfLaTeX log is passed directly; not parsed or formatted
7. **No persistent output** — PDF is returned inline; not stored anywhere for later retrieval

---

## Future Backend Architecture (PLANNED)

> None of the following exists yet. All is PLANNED.

### Planned API expansion

- Authentication middleware
- Project CRUD endpoints
- File upload endpoints
- Version history endpoints
- Compilation job queue (async)
- Compilation status polling endpoint
- PDF retrieval from storage (signed URLs)

### Planned compiler isolation

- Compiler moved into a Docker container
- Per-job container or ephemeral container per request
- Network disabled inside container
- Filesystem limited to the project directory
- CPU and memory limits enforced at the container level
- BibTeX / multi-pass support

### Planned infrastructure

- Database (PostgreSQL via Prisma)
- Object storage (S3-compatible)
- Queue (BullMQ + Redis, or cloud-native)
- Workers (isolated Node.js processes or Lambda/Cloud Run functions)
