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

**STAGE: Phase 1 — Local Document Workspace & Persistence**

The project has completed its baseline compilation pipeline, PDF preview, client-side PDF download feature, manual bug fixes, browser `localStorage` document persistence (`resumeforge:document:main`), debounced autosave (1000ms), typed save states (`saved`, `unsaved`, `saving`, `error`), platform-aware keyboard shortcuts (`Ctrl+S`/`Cmd+S`, `Ctrl+Enter`/`Cmd+Enter`), and updated application metadata. It remains a single-page prototype without cloud persistence, authentication, or Docker sandbox isolation.

---

## Current Status

| Area | Status |
|------|--------|
| LaTeX editor (textarea) | IMPLEMENTED |
| Compile button → API | IMPLEMENTED |
| Server-side LaTeX compilation (pdfLaTeX) | IMPLEMENTED |
| PDF preview (iframe) | IMPLEMENTED |
| PDF download button (`resume.pdf`) | IMPLEMENTED (Prompt 2) |
| Blob URL memory management | IMPLEMENTED (Prompt 2) |
| Compilation state guard (`isCompiling`) | IMPLEMENTED (Prompt 2) |
| Formatted Error Display & Banner | IMPLEMENTED (Prompt 2.1) |
| Structured Compiler Error API (`error`, `details`) | IMPLEMENTED (Prompt 2.1) |
| Independent Save Button (Not disabled by compile) | IMPLEMENTED (Prompt 2.1) |
| Client-side `localStorage` Persistence | IMPLEMENTED (Prompt 3) |
| Document Restore on Page Load | IMPLEMENTED (Prompt 3) |
| Debounced Autosave (1000ms) | IMPLEMENTED (Prompt 3) |
| Document Save Status Badge | IMPLEMENTED (Prompt 3) |
| Keyboard Shortcuts (`Ctrl+S`, `Ctrl+Enter`) | IMPLEMENTED (Prompt 3) |
| Shortcut UI Badges | IMPLEMENTED (Prompt 3) |
| Application Metadata (`app/layout.tsx`) | IMPLEMENTED (Prompt 3) |
| File management | NOT IMPLEMENTED |
| Cloud Persistence / database | NOT IMPLEMENTED |
| Authentication | NOT IMPLEMENTED |
| Multiple resume support | NOT IMPLEMENTED |
| Version history | NOT IMPLEMENTED |
| Source download (.tex / .zip) | NOT IMPLEMENTED |
| Import .tex / ZIP | NOT IMPLEMENTED |
| Templates | NOT IMPLEMENTED |
| Error log inspector | NOT IMPLEMENTED |
| Production compiler isolation | NOT IMPLEMENTED |

---

## Completed Features (Cumulative)

### Pre-Prompt 1 Base
- Next.js 16.3.3 project initialized from `create-next-app`
- Tailwind CSS v4 configured
- Single-page React workspace UI (`app/page.tsx`)
- LaTeX editor (HTML `<textarea>`) with sample resume content
- Compile button that POSTs to `/api/compile`
- `/api/compile` POST API route executing pdfLaTeX
- PDF binary response sent to browser
- PDF rendered in an `<iframe>` via `URL.createObjectURL`

### Prompt 1
- Full repository inspection and 19-document memory system in `docs/`

### Prompt 2 (PDF Download + Lifecycle + UX Hardening)
- Client-side **PDF Download** button in header (`a[download="resume.pdf"]`)
- Contextual state control: Download button is disabled when no PDF exists or during compilation
- **Blob URL Lifecycle Management**: Added `useEffect` cleanup hook to revoke old blob URLs via `URL.revokeObjectURL` on URL change and component unmount
- **Compilation Guard**: Added `isCompiling` boolean state preventing duplicate concurrent requests while compilation is active
- **Retained Last Successful PDF on Failure**: If a compilation attempt fails, the status bar displays the error message, but the previous successfully compiled PDF remains available for preview and download
- **Accessibility & UX**: Added explicit `aria-label` attributes, focus indicators (`ring-2 ring-zinc-400`), and preview header label

### Prompt 2.1 (Manual Testing Bug Fixes)
- **Compilation Error UX Fix**: Replaced raw banner log status in header with a clean compact summary ("Compilation failed").
- **Structured Error Response**: Backend `/api/compile` returns `{ error: "Compilation failed.", details: "<full log>" }`.
- **Secondary Error Banner**: Rendered formatted red error panel in workspace with human-friendly message, scrollable `<pre>` block showing compiler output, and dismiss (`✕`) button.
- **Preview Badge for Last Successful PDF**: Explicitly displays `"Showing last successful PDF (latest compile failed)"` in amber text when previewing a previous PDF after a compile error.
- **Fixed Save Button Interaction**: Removed `disabled={isCompiling}` from Save button. Save button remains clickable at all times.
- **Fixed ESLint Warning**: Resolved `no-explicit-any` warning in `route.ts:65` by typing error as `unknown`.

### Prompt 3 (Persistence + Shortcuts + Workspace Reliability)
- **Isolated Storage Utility (`lib/storage.ts`)**: Safe `localStorage` getter/setter module wrapped in `try...catch` handling SSR, quota errors, and corrupted JSON.
- **Storage Key & Schema**: Uses key `resumeforge:document:main` with structured schema `{ version: 1, latex, savedAt }`.
- **SSR / Hydration Safety**: Page load restoration runs inside `useEffect` (deferred via `queueMicrotask`) ensuring zero hydration errors.
- **Document Save States**: Added `saveStatus` (`saved`, `unsaved`, `saving`, `error`) and `lastSavedAt` timestamp badge in editor tab bar.
- **Debounced Autosave**: Automatically saves source to `localStorage` 1000ms after typing stops without creating autosave loops.
- **Keyboard Shortcuts**: Added platform-aware `Ctrl+S` / `Cmd+S` for Save and `Ctrl+Enter` / `Cmd+Enter` for Compile with `useRef` to prevent event listener churn.
- **Shortcut Hints**: Rendered subtle `(Ctrl+S)` and `(Ctrl+Enter)` badges in header buttons.
- **Updated Metadata**: Updated `app/layout.tsx` metadata title to `ResumeForge — LaTeX Resume Workspace`.

---

## Currently Working Features

Confirmed working in the current local environment:

1. **LaTeX editing** — User can edit LaTeX source in the textarea
2. **Local Persistence** — LaTeX source persists across page refreshes via `localStorage`
3. **Autosave** — Source automatically saves 1000ms after editing stops
4. **Save Status Indicator** — Editor tab displays `"Saved just now"`, `"Saved 2m ago"`, or `"Unsaved changes"`
5. **Keyboard Shortcuts** — `Ctrl+S` / `Cmd+S` saves instantly; `Ctrl+Enter` / `Cmd+Enter` compiles
6. **Compilation** — Clicking Compile or pressing `Ctrl+Enter` triggers `/api/compile`, running pdfLaTeX on server
7. **PDF preview** — Renders the compiled PDF binary in an iframe
8. **PDF download** — Clicking "Download PDF" saves `resume.pdf` directly from blob URL
9. **Clean status & error UI** — Header shows compact status; errors are formatted cleanly in a dedicated panel
10. **Save button** — Always clickable UI & keyboard action showing "Saved" status feedback
11. **Double-click prevention** — Compile button displays "Compiling..." and is disabled while compilation is active
12. **Memory management** — Object URLs are automatically revoked to prevent browser memory leaks

---

## Known Bugs & Issues

| # | Issue | Severity | Status / Notes |
|---|-------|----------|----------------|
| 1 | `error: any` in `route.ts` | **FIXED** | Replaced with `unknown` type in Prompt 2.1 |
| 2 | Save button disabled during compile | **FIXED** | Removed `disabled={isCompiling}` in Prompt 2.1 |
| 3 | Raw pdfLaTeX banner in status bar | **FIXED** | Formatted into error panel & clean status string in Prompt 2.1 |
| 4 | ESLint set-state-in-effect warning | **FIXED** | Defer initial hydration state update via `queueMicrotask` in Prompt 3 |
| 5 | Save button has no persistence | **FIXED** | Implemented `localStorage` persistence in Prompt 3 |
| 6 | Compiler path is hardcoded | High | `C:\texlive\2026\bin\windows\pdflatex.exe` — Windows local path only |
| 7 | No pdfLaTeX double-pass | Low | Single pass; complex cross-references may show "??" |

---

## Tech Stack

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Frontend framework | Next.js (App Router) | 16.3.3 | IMPLEMENTED |
| UI library | React | 19.2.8 | IMPLEMENTED |
| Language | TypeScript | 5.x | IMPLEMENTED |
| Styling | Tailwind CSS | v4 | IMPLEMENTED |
| Fonts | Geist, Geist Mono | — | IMPLEMENTED |
| Persistence | Browser `localStorage` | — | IMPLEMENTED (Prompt 3) |
| LaTeX compiler | pdfLaTeX (TeX Live 2026) | 2026 | IMPLEMENTED (local dev) |
| Database | None | — | NOT IMPLEMENTED |
| Auth | None | — | NOT IMPLEMENTED |

---

## Current Architecture

```
Browser (React client component — app/page.tsx)
  │
  ├── localStorage ("resumeforge:document:main")
  │     ├── loadDocument() on mount
  │     └── saveDocument() on manual Save / debounced Autosave
  │
  │  POST /api/compile { latex: string }
  ↓
Next.js API Route Handler (app/api/compile/route.ts)
  │  fs.mkdtemp() → execFileAsync(pdflatex) → fs.readFile(main.pdf)
  ↓
pdfLaTeX (TeX Live 2026)
  │  Compiles main.tex → main.pdf
  ↓
HTTP Response
  │  200 OK: application/pdf binary
  │  500 Error: { error: string, details: string }
  ↓
Browser (app/page.tsx)
  ├── Success: setPdfUrl(blobUrl) → preview & download active
  ├── Error: setErrorDetails(log) → clean status + formatted error panel
  └── useEffect() → URL.revokeObjectURL(oldUrl) (Memory Cleanup)
```

---

## Testing State

- **Automated tests**: Production build (`npm run build`) passes in 1.6s.
- **Lint**: `npm run lint` passes with **0 errors and 0 warnings**.
- **Direct API verification**:
  - Valid LaTeX: Returns HTTP 200 with 14,644 byte PDF binary.
  - Invalid LaTeX: Returns HTTP 500 JSON `{ error: "Compilation failed.", details: "..." }`.

---

## Completed Tasks

| Prompt | Date | Description |
|--------|------|-------------|
| Prompt 1 | 2026-08-26 | Project inspection, documentation system creation |
| Prompt 2 | 2026-08-26 | PDF download, blob URL lifecycle management, `isCompiling` guard, UX & accessibility hardening |
| Prompt 2.1 | 2026-08-26 | Bug fixes for compilation error UX, structured error JSON, independent Save button, ESLint clean |
| Prompt 3 | 2026-08-26 | Document persistence (`localStorage`), restoration on load, debounced autosave, keyboard shortcuts (`Ctrl+S`, `Ctrl+Enter`), app metadata |

---

## Current Task

**Prompt 3** — Document Persistence + Keyboard Workflow + Workspace Reliability (COMPLETE).

---

## Next Recommended Task

**Prompt 4 — Multiple Resume Projects & Document Management (Local):**
- Create, rename, clone, and delete multiple local resume projects
- Store project metadata and file list in `localStorage`
- Add project selector / dropdown in header or sidebar
- Export resume project as `.tex` source file download
- Import existing `.tex` file from local disk
