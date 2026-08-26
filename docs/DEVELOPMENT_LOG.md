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
- **Keyboard Shortcuts**: Added `Ctrl+S` / `Cmd+S` for manual save and `Ctrl+Enter` / `Cmd+Enter` for compile.
- **Shortcut UI Hints**: Rendered `(Ctrl+S)` and `(Ctrl+Enter)` badges on header buttons.
- **App Metadata**: Updated `app/layout.tsx` metadata title to `ResumeForge — LaTeX Resume Workspace`.

---

## Prompt 4 — Multiple Resume Projects & Local Document Management

**Date**: 2026-08-26

**Objective**: Upgrade ResumeForge from a single local document into a local multi-project resume workspace with project CRUD, import/export, data migration, and strict PDF preview isolation.

**What was implemented**:
- **Multi-Project Storage Model (`lib/storage.ts`)**: Schema `StoredProjects` (`{ version: 1, activeProjectId, projects: ResumeProject[] }`) persisted under key `resumeforge:projects`.
- **Automatic Migration**: Checks for Prompt 3 legacy data (`resumeforge:document:main`) on first load and automatically migrates it to a project named `"My Resume"` without data loss.
- **Project Selector Dropdown UI**: Rendered in workspace header with project list, active indicator, and action items (`+ New Resume`, `Rename`, `Duplicate`, `Delete`).
- **Project Lifecycle Operations**:
  - **Create**: Adds a new project with default sample content and sets active.
  - **Rename**: Modal dialog enabling fast project renaming with validation.
  - **Duplicate**: Clones active project to `"<Name> Copy"` with a new unique ID (`crypto.randomUUID()`).
  - **Delete**: Confirmation dialog safeguarding against deleting the last remaining project.
- **Import / Export Actions**:
  - **Export `.tex`**: Generates sanitized file download e.g. `My-Resume.tex`.
  - **Import `.tex`**: HTML file picker loads local `.tex` files directly into active project, saves to `localStorage`, and clears PDF preview.
- **Strict PDF Preview Isolation**: Revokes `pdfUrl` and clears compiler errors whenever project active state changes, ensuring PDF previews never leak between projects.

---

## Prompt 4.1 — Enforce Unique Project Names & Refine Project Management UX

**Date**: 2026-08-26

**Objective**: Enforce strict case-insensitive uniqueness and whitespace trimming for project names in the workspace, with auto-incrementing naming for new projects and duplicates, rename UI validation, and safe legacy name normalization on load.

**What was implemented**:
- **Centralized Unique Name Generator (`lib/storage.ts`)**: Added `isProjectNameTaken()` (case-insensitive & trimmed) and `getUniqueProjectName()`.
- **Auto-Incrementing New Project Names**: Creates `Untitled Resume`, `Untitled Resume 2`, `Untitled Resume 3`, etc.
- **Auto-Incrementing Duplicate Project Names**: Duplicates `My Resume` as `My Resume Copy`, `My Resume Copy 2`, etc.
- **Rename Validation & UI**: Displays clear red error message in Rename Modal if the user submits a blank name (`Project name cannot be empty.`) or a duplicate name (`A project with this name already exists.`). Submitting the current project's name is allowed.
- **Safe Legacy Data Normalization**: `loadProjectsData()` checks loaded projects and automatically uniquifies any duplicate names found in stored data without losing projects, IDs, or LaTeX content.

**Files modified**:
- `lib/storage.ts` — Unique name generator, case-insensitive collision checks, auto-incrementing new/duplicate names, safe load normalization
- `app/page.tsx` — Rename modal error state and UI validation message
- `docs/DECISIONS.md` — Added ADR-012 (Unique User-Facing Project Names)
- `docs/DEVELOPMENT_LOG.md` — Added Prompt 4.1 development log entry

**Tests run**:

| Test | Command / Method | Result | Notes |
|------|------------------|--------|-------|
| Production Build | `npm run build` | PASS | Next.js 16.3.3 Turbopack build succeeds in 2.8s |
| Lint Check | `npm run lint` | PASS | Zero errors, zero warnings |

**Result**: Unique project naming and rename validation implementation complete. Build passes cleanly. Zero lint errors.
