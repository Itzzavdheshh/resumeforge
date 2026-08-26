# ResumeForge — Development Log

> Chronological record of all changes, tests, and outcomes.
> Add a new entry for every task/prompt.

---

## Prompt 1 — Project Foundation & Documentation

**Date**: 2026-08-26

**Scope**: Inspect existing repository. Establish documentation system. No new product features.

**Result**: Documentation system established. No code changed. Build passes.

---

## Prompt 2 — PDF Download & PDF Lifecycle

**Date**: 2026-08-26

**Objective**: Make the successfully compiled PDF downloadable from ResumeForge and ensure a reliable PDF preview/download lifecycle.

**What was implemented**:
- **PDF Download Feature**: Added a client-side download action in `app/page.tsx` (`<a href={pdfUrl} download="resume.pdf">`).
- **Contextual State Control**: Download button is disabled when no PDF exists or during compilation.
- **Blob URL Lifecycle Management**: Implemented `useEffect` cleanup in `app/page.tsx` revoking previous object URLs (`URL.revokeObjectURL`).
- **Compilation Guard**: Introduced `isCompiling` boolean state preventing duplicate compilation requests.
- **Retained Last Successful PDF on Error**: Retained previous valid PDF in preview and download state if a compile fails.
- **Accessibility & UX**: Added explicit `aria-label` attributes and focus rings.

---

## Prompt 2.1 — Bug Fixes Found During Manual Testing

**Date**: 2026-08-26

**Objective**: Fix issues found during user's manual browser testing (Compilation error UX, Save button interaction, recovery flow).

**What was implemented**:
- **Compilation Error UX Fix**: Removed raw pdfLaTeX banner text from header status bar. Replaced with compact header status ("Compilation failed (showing previous PDF)" / "Compilation failed").
- **Structured Error Response**: Updated `app/api/compile/route.ts` to return JSON `{ error: "Compilation failed.", details: "<full log>" }`. Fixed ESLint `no-explicit-any` warning in `route.ts`.
- **Secondary Error Panel**: Added a formatted red alert banner in workspace displaying "Compilation Error" title, human-friendly summary, scrollable `<pre>` block showing compiler output details, and dismiss (`✕`) button.
- **Preview Badge for Last Successful PDF**: Explicitly displays `"Showing last successful PDF (latest compile failed)"` in amber text when previewing a previous PDF after a compile failure.
- **Independent Save Button Interaction**: Removed `disabled={isCompiling}` from Save button in `app/page.tsx`. Save button remains clickable at all times regardless of compilation state.
- **Recovery Workflow Verified**: Clearing `errorDetails` on new compile attempts ensures recovery workflow works cleanly.

---

## Prompt 3 — Document Persistence + Keyboard Workflow + Workspace Reliability

**Date**: 2026-08-26

**Objective**: Provide browser `localStorage` document persistence across page refreshes, debounced autosave, document save status badges, platform-aware keyboard shortcuts, and updated application metadata.

**What was implemented**:
- **Isolated Storage Utility (`lib/storage.ts`)**: Safe module containing `loadDocument()` and `saveDocument()` with key `resumeforge:document:main` and schema `{ version: 1, latex, savedAt }`.
- **Document Restore on Mount**: Restores saved document on client hydration via `useEffect` and `queueMicrotask` to satisfy React 19 ESLint rules and avoid SSR hydration mismatch.
- **Debounced Autosave (1000ms)**: Automatically persists source code 1000ms after user stops typing.
- **Document Status Badge**: Editor tab displays `"Saved just now"`, `"Saved 2m ago"`, `"Unsaved changes"` (amber), or `"Unable to save locally"` (red).
- **Keyboard Shortcuts**: Added `Ctrl+S` / `Cmd+S` for manual save (intercepting browser default Save Page dialog) and `Ctrl+Enter` / `Cmd+Enter` for compile. Ref pattern (`useRef`) used to prevent event listener churn.
- **Shortcut UI Hints**: Rendered `(Ctrl+S)` and `(Ctrl+Enter)` badges on header buttons.
- **App Metadata**: Updated `app/layout.tsx` metadata title to `ResumeForge — LaTeX Resume Workspace`.

**Files created**:
- `lib/storage.ts` — Isolated `localStorage` utility module

**Files modified**:
- `app/layout.tsx` — Application metadata (title & description)
- `app/page.tsx` — Local document restoration, debounced autosave, save status badges, keyboard shortcuts, UI shortcut hints
- `docs/PROJECT_STATE.md` — Updated cumulative project state through Prompt 3
- `docs/FRONTEND.md` — Documented storage architecture, schema, state, and shortcuts
- `docs/UX.md` — Documented persistence workflows, keyboard shortcuts, and save badges
- `docs/TESTING.md` — Documented Prompt 3 code-level build, lint, and API test results
- `docs/REQUIREMENTS.md` — Updated requirement statuses for persistence, autosave, shortcuts, and metadata
- `docs/ROADMAP.md` — Updated Phase 0 & Phase 1 completed tasks
- `docs/DECISIONS.md` — Added ADR-010 (Client-side localStorage Persistence)
- `docs/DEVELOPMENT_LOG.md` — Added Prompt 3 log entry

**Tests run**:

| Test | Command / Method | Result | Notes |
|------|------------------|--------|-------|
| Production Build | `npm run build` | PASS | Next.js 16.3.3 Turbopack build succeeds in 1.6s |
| Lint Check | `npm run lint` | PASS | Zero errors, zero warnings |
| API Valid Compilation | PowerShell `Invoke-RestMethod` | PASS | Returned HTTP 200 with 14,644 byte PDF binary |

**Result**: Document persistence, autosave, keyboard shortcuts, and app metadata implementation complete. Build passes cleanly. Zero lint errors.
