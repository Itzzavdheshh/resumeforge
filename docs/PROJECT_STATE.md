# ResumeForge — Project State

> **This is the most important file in the project.**
> It must always reflect the CURRENT cumulative state.
> Update it after every task/prompt.
> A new developer or AI agent should be able to read this file and understand the project completely.

---

## Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | ResumeForge |
| **Project Type** | Browser-based LaTeX resume/CV workspace |
| **Repository** | `c:\Users\itzza\Projects\resumeforge` |
| **Framework** | Next.js 16.3.3 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Runtime** | Node.js (Next.js API routes) |

---

## Current Stage

**STAGE: Phase 0 — Foundation**

The project is at the earliest possible stage. A working prototype exists that can compile LaTeX and show a PDF preview, but it is a single-file demo without persistence, user management, error recovery, or production-readiness.

---

## Current Status

| Area | Status |
|------|--------|
| LaTeX editor (textarea) | IMPLEMENTED |
| Compile button → API | IMPLEMENTED |
| Server-side LaTeX compilation (pdfLaTeX) | IMPLEMENTED |
| PDF preview (iframe) | IMPLEMENTED |
| Save button | PARTIALLY IMPLEMENTED (UI only — no persistence) |
| Status indicator | IMPLEMENTED (in-memory only) |
| File management | NOT IMPLEMENTED |
| Persistence / database | NOT IMPLEMENTED |
| Authentication | NOT IMPLEMENTED |
| Multiple resume support | NOT IMPLEMENTED |
| Version history | NOT IMPLEMENTED |
| PDF download | NOT IMPLEMENTED |
| Source download | NOT IMPLEMENTED |
| Import .tex / ZIP | NOT IMPLEMENTED |
| Templates | NOT IMPLEMENTED |
| Autosave | NOT IMPLEMENTED |
| Error display (full log) | NOT IMPLEMENTED |
| Compiler output / logs | NOT IMPLEMENTED |
| Production compiler isolation | NOT IMPLEMENTED |

---

## Completed Features (Prompt 1)

No new features were implemented in Prompt 1. This task was inspection and documentation only.

The following were **already present** before Prompt 1:

- Next.js 16.3.3 project initialized from `create-next-app`
- Tailwind CSS v4 configured
- Single-page React workspace UI (`app/page.tsx`)
- LaTeX editor (HTML `<textarea>`) with initial sample LaTeX content
- Compile button that POSTs to `/api/compile`
- `/api/compile` POST API route that runs pdfLaTeX
- PDF blob response sent to frontend
- `URL.createObjectURL()` used to create a blob URL
- PDF rendered in an `<iframe>`
- Save button (UI-only, no persistence)
- Status text in the header

---

## Currently Working Features

Confirmed working in the current local environment:

1. **LaTeX editing** — User can type/edit LaTeX in the textarea
2. **Compilation** — Clicking Compile sends LaTeX to `/api/compile`, which runs pdfLaTeX on the server
3. **PDF preview** — Successful compilation streams back a PDF blob, shown in an iframe
4. **Status indicator** — Header shows "Ready", "Compiling...", "Compiled successfully", or an error message

---

## Partially Implemented Features

| Feature | What Works | What's Missing |
|---------|-----------|----------------|
| Save | Button exists, toggles status to "Saved" for 1.5s | No actual persistence anywhere |
| Error display | Error message appears in status bar | Full compiler logs not shown to user |

---

## Known Bugs

| # | Bug | Severity | Notes |
|---|-----|----------|-------|
| 1 | `error: any` in route.ts line 65 | Low | ESLint reports `@typescript-eslint/no-explicit-any` on the catch clause |
| 2 | Blob URLs are never revoked | Low | `URL.revokeObjectURL()` is never called; memory leak after multiple compilations |
| 3 | Save button has no effect | Medium | Status flickers to "Saved" but nothing is persisted |
| 4 | Compiler path is hardcoded | High | `C:\texlive\2026\bin\windows\pdflatex.exe` — fails on any other machine |
| 5 | No pdfLaTeX double-pass | Low | Single-pass compilation; references/TOC may be wrong in complex documents |

---

## Known Limitations

- No persistence of any kind (browser refresh = data loss)
- Compiler hardcoded to local Windows TeX Live path — not portable
- No sandbox or isolation for the compiler (arbitrary code execution risk)
- No authentication — anyone with the URL can compile arbitrary LaTeX
- No rate limiting
- No compilation timeout that the user can control (hardcoded 30s)
- LaTeX editor is a plain `<textarea>` — no syntax highlighting, autocomplete, or line numbers
- Error messages are raw pdfLaTeX output (potentially verbose/confusing)
- `layout.tsx` still has default `create-next-app` metadata (title: "Create Next App")
- `README.md` is still the default `create-next-app` README
- No `.env` file or environment variable system
- `public/` contains only default Next.js placeholder SVGs

---

## Current Tech Stack

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Frontend framework | Next.js (App Router) | 16.3.3 | IMPLEMENTED |
| UI library | React | 19.2.8 | IMPLEMENTED |
| Language | TypeScript | 5.x | IMPLEMENTED |
| Styling | Tailwind CSS | v4 | IMPLEMENTED |
| Fonts | Geist, Geist Mono (Google) | — | IMPLEMENTED |
| LaTeX compiler | pdfLaTeX (TeX Live 2026) | 2026 | IMPLEMENTED (local only) |
| Database | None | — | NOT IMPLEMENTED |
| Auth | None | — | NOT IMPLEMENTED |

---

## Current Compiler

| Field | Value |
|-------|-------|
| **Engine** | pdfLaTeX |
| **Distribution** | TeX Live 2026 |
| **Installation** | Local Windows machine only |
| **Path** | `C:\texlive\2026\bin\windows\pdflatex.exe` (hardcoded) |
| **Flags** | `-interaction=nonstopmode -halt-on-error -file-line-error` |
| **Timeout** | 30 seconds |
| **Isolation** | NONE — runs directly on the server OS |
| **Portability** | NONE — hardcoded path, Windows-only |

---

## Current Architecture

```
Browser (React client component)
  │
  │  POST /api/compile { latex: string }
  ↓
Next.js API Route Handler (Node.js, server-side)
  app/api/compile/route.ts
  │
  │  fs.mkdtemp() → temp dir in OS temp folder
  │  fs.writeFile() → main.tex
  │
  ↓
pdfLaTeX (local TeX Live 2026)
  C:\texlive\2026\bin\windows\pdflatex.exe
  │
  │  Compiles main.tex → main.pdf (in temp dir)
  ↓
Node.js API Route (continues)
  │  fs.readFile(main.pdf) → Buffer
  │  fs.rm(tempDir) → cleanup
  │
  │  Response: application/pdf binary
  ↓
Browser (React client component)
  │  response.blob()
  │  URL.createObjectURL(blob) → blob URL
  │
  ↓
<iframe src={blobUrl} />  (PDF preview)
```

---

## Current API Routes

| Method | Route | Status | Purpose |
|--------|-------|--------|---------|
| POST | `/api/compile` | IMPLEMENTED | Accepts LaTeX string, runs pdfLaTeX, returns PDF |

---

## Important Source Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main workspace page (client component — entire app UI) |
| `app/api/compile/route.ts` | LaTeX compilation API route |
| `app/layout.tsx` | Root layout with fonts and metadata |
| `app/globals.css` | Global CSS (Tailwind import + CSS variables) |
| `next.config.ts` | Next.js configuration (currently empty/default) |
| `tsconfig.json` | TypeScript configuration |
| `postcss.config.mjs` | PostCSS config for Tailwind v4 |
| `eslint.config.mjs` | ESLint config (next + TypeScript rules) |
| `package.json` | Dependencies and scripts |

---

## Current Data / Storage

**NONE.** There is no database, file storage, session storage, or persistence mechanism of any kind. The LaTeX source exists only in React `useState` (in-memory). All data is lost on browser refresh.

---

## Current UI State

- Dark theme (zinc-950 background)
- Two-column layout: editor left, PDF preview right
- Header with title, status, Save and Compile buttons
- Editor: plain `<textarea>` with monospace font (Geist Mono)
- Preview: `<iframe>` when PDF is available, placeholder when not

---

## Security State

| Risk | Current Protection |
|------|-------------------|
| Arbitrary LaTeX execution | NONE |
| Filesystem access via LaTeX | NONE (LaTeX can read/write the filesystem) |
| CPU/memory exhaustion | 30s timeout only |
| Network access via LaTeX | NONE |
| Path traversal | Not applicable (temp dir used) |
| Authentication | NONE |
| Rate limiting | NONE |

**The current implementation is NOT safe for public deployment.**

---

## Testing State

- **Automated tests**: NONE
- **CI/CD**: NONE
- **Manual verification**: Compilation has been confirmed working in the local Windows + TeX Live 2026 environment

Build status (Prompt 1):
- `npm run lint` — FAIL (1 ESLint error: `no-explicit-any` in route.ts:65)
- `npm run build` — PASS (production build succeeds despite the lint error)

---

## Deployment State

Not deployed. Running locally only at `http://localhost:3000` via `npm run dev`.

---

## Completed Tasks

| Prompt | Date | Description |
|--------|------|-------------|
| Prompt 1 | 2026-08-26 | Project inspection, documentation system creation |

---

## Current Task

**Prompt 1** — Inspect repository, establish documentation system, produce comprehensive project state. No code changes beyond documentation. One known lint issue documented (not fixed — out of scope for this task).

---

## Next Recommended Task

**Prompt 2 — Fix known issues and harden the existing implementation:**

Suggested scope (choose ONE narrow task):
- Fix the ESLint `no-explicit-any` error in `route.ts`
- Fix blob URL memory leak (`URL.revokeObjectURL`)
- Add a proper page `<title>` and metadata to `layout.tsx`
- Implement basic PDF download button (no persistence needed, just `a[download]` on the blob URL)

The SMALLEST useful next step would be: **PDF Download Button** — it is additive, testable, and provides real user value without touching the compiler.
