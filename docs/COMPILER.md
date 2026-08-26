# ResumeForge — Compiler Documentation

---

## CURRENT COMPILER

### Engine

| Property | Value |
|----------|-------|
| Engine | **pdfLaTeX** |
| Distribution | **TeX Live 2026** |
| Platform | **Windows only** (hardcoded path) |
| Path | `C:\texlive\2026\bin\windows\pdflatex.exe` |

---

## How Compilation Currently Works

1. The user types or edits LaTeX in the browser editor
2. The user clicks "Compile"
3. The browser sends a POST request to `/api/compile` with `{ latex: "<source>" }`
4. The Next.js API route handler:
   a. Creates a temp directory: `os.tmpdir()/resumeforge-XXXXXX`
   b. Writes the LaTeX to `main.tex` inside that directory
   c. Calls `execFileAsync(pdflatex, flags, { cwd: tempDir, timeout: 30000 })`
   d. If successful, reads `main.pdf`
   e. Returns the PDF binary with `Content-Type: application/pdf`
   f. Always deletes the temp directory (in `finally` block)
5. The browser receives the PDF binary, creates a blob URL, renders it in an iframe

### Compilation Flags

| Flag | Effect |
|------|--------|
| `-interaction=nonstopmode` | Don't wait for user input on errors |
| `-halt-on-error` | Exit immediately on the first LaTeX error |
| `-file-line-error` | Format errors as `file:line: error text` |

---

## Current Limitations

1. **Single-pass only** — One pdfLaTeX run. Documents using `\ref`, `\cite`, `\tableofcontents`, etc. may have "??" for unresolved references on the first compile. Real editors run pdfLaTeX 2–3 times.

2. **No BibTeX / Biber** — Bibliography processing is not implemented. `\bibliography{}` or `biblatex` will not produce references.

3. **No multi-file support** — Only `main.tex` is written to the temp directory. `\input{}`, `\include{}`, and `\usepackage{}` calls for local files will fail because those files don't exist in the temp dir.

4. **No image support** — Users cannot upload images. `\includegraphics{}` will fail.

5. **No custom packages** — Custom `.cls` or `.sty` files cannot be uploaded.

6. **Windows-only path** — The hardcoded path is specific to the developer's machine. Any other environment requires code changes.

7. **No environment variable support** — The compiler path cannot be configured without editing the source code.

---

## Security Risks

> See `SECURITY.md` for full details.

| Risk | Description |
|------|-------------|
| `\write18` shell escape | pdfLaTeX can be compiled with shell-escape mode, allowing arbitrary OS command execution from LaTeX source |
| Filesystem access | LaTeX can read files from the temp directory and potentially traverse paths |
| CPU exhaustion | Complex or malicious LaTeX (e.g., recursive macros) can use 100% CPU for up to 30 seconds per request |
| Memory exhaustion | No memory limit on the pdfLaTeX process |
| Disk exhaustion | Malicious LaTeX can write large amounts of data (e.g., via `\write`) |

Note: The `-interaction=nonstopmode` flag is used, which means `\write18` shell escapes are **disabled by default** in TeX Live. However, this is a default that can be changed, and is not a guarantee.

---

## Current Environment

| Component | Version |
|-----------|---------|
| Operating System | Windows (developer's machine) |
| TeX Live | 2026 |
| pdfLaTeX | Included in TeX Live 2026 |
| Node.js | Managed by Next.js |

---

## Future Compiler Options

> These are possibilities to be evaluated. No selection has been made.
> Do not implement any of these without a specific approved task.

### pdfLaTeX (Current)
- Widely compatible
- Most LaTeX documents are written for pdfLaTeX
- Does not support OpenType fonts natively

### XeLaTeX
- Full Unicode and OpenType font support
- Required for multilingual resumes or custom fonts
- Slower than pdfLaTeX for simple documents

### LuaLaTeX
- Modern, extensible (Lua scripting)
- Full Unicode and OpenType support
- Slowest of the three
- Best long-term flexibility

### Tectonic
- Rust-based, self-contained TeX engine
- Automatically downloads required packages
- No full TeX Live installation needed on the server
- **Needs evaluation** — not confirmed as a production choice
- Less tested than TeX Live for complex documents

### Decision Needed
Before choosing a production compiler engine, evaluate:
- Compatibility with the most common resume/CV LaTeX packages
- Speed (compilation time affects UX)
- Deployment complexity
- License and distribution constraints
- Package availability

---

## Future Compiler Architecture (PLANNED)

```
Compilation Request
  ↓
Queue (BullMQ / SQS)
  ↓
Worker picks up job
  ↓
Docker container spun up (or warm pool)
  ↓
LaTeX project files copied in
  ↓
Compiler run:
  pass 1: pdflatex / xelatex / lualatex
  pass 2: bibtex / biber (if bibliography)
  pass 3: pdflatex (final references)
  ↓
PDF + log extracted
  ↓
PDF stored in object storage
  ↓
Log stored in object storage
  ↓
Container destroyed or returned to pool
  ↓
Job status updated in database
  ↓
Frontend polls and retrieves PDF URL
```

Key properties of the planned architecture:
- **Network disabled** in the container
- **CPU and memory limits** enforced by Docker
- **Disk quota** per compilation
- **Timeout** enforced at queue level, not just process level
- **Multi-pass** compilation (2–3 runs for references/TOC)
- **BibTeX / Biber** support
