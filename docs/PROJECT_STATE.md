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

**STAGE: Phase 6 & Phase 7 — ZIP Project Archives & Compiler Settings**

The project has completed its baseline compilation pipeline, PDF preview, client-side PDF download feature, manual bug fixes, browser `localStorage` document persistence (`resumeforge:document:main`), debounced autosave (1000ms), typed save states (`saved`, `unsaved`, `saving`, `error`), platform-aware keyboard shortcuts (`Ctrl+S`/`Cmd+S`, `Ctrl+Enter`/`Cmd+Enter`), updated application metadata, **Prompt 4 Local Multi-Project Workspace** (`resumeforge:projects`), **Prompt 4.1 Unique Project Naming**, **Prompt 5 Professional Monaco LaTeX Code Editor**, **Prompt 6 Multi-File Project Architecture & FileTree**, **Prompt 7 Project Assets & Image Upload**, and **Prompt 8 ZIP Project Archives & Compiler Options** (`.zip` project archive export/import via `JSZip`, path traversal security, ZIP bomb protection, atomic import, paper size setting Letter/A4, single/double pass compilation).

---

## Current Status

| Area | Status |
|------|--------|
| Project Archive Export (.zip) | IMPLEMENTED (Prompt 8) |
| Project Archive Import (.zip) | IMPLEMENTED (Prompt 8) |
| ZIP Bomb Protection & Size Limits | IMPLEMENTED (Prompt 8) |
| Atomic Archive Import | IMPLEMENTED (Prompt 8) |
| Compiler Paper Size Option (Letter / A4) | IMPLEMENTED (Prompt 8) |
| Multi-Pass Compilation Option (1 Pass / 2 Pass) | IMPLEMENTED (Prompt 8) |
| Project-Specific Compiler Settings (`settings`) | IMPLEMENTED (Prompt 8) |
| Project Assets & Image Upload (`.png`, `.jpg`, `.jpeg`) | IMPLEMENTED (Prompt 7) |
| Image Asset View Panel (`ImageAssetView.tsx`) | IMPLEMENTED (Prompt 7) |
| Image Preview & Details Card | IMPLEMENTED (Prompt 7) |
| One-Click Copy LaTeX Snippet (`\includegraphics`) | IMPLEMENTED (Prompt 7) |
| Collision-Safe Image Pathing (`images/photo.png`) | IMPLEMENTED (Prompt 7) |
| Image Size Validation (2 MB LocalStorage / 5 MB API) | IMPLEMENTED (Prompt 7) |
| Server-Side Image Base64 Decoding (`route.ts`) | IMPLEMENTED (Prompt 7) |
| Multi-File Project Architecture (`project.files`) | IMPLEMENTED (Prompt 6) |
| FileTree Sidebar Component (`FileTree.tsx`) | IMPLEMENTED (Prompt 6) |
| Root `main.tex` Protection | IMPLEMENTED (Prompt 6) |
| File-Level Editor & Preview Switching | IMPLEMENTED (Prompt 6) |
| Path Traversal Security Protection | IMPLEMENTED (Prompt 6) |
| Professional Code Editor (Monaco) | IMPLEMENTED (Prompt 5) |
| LaTeX Syntax Highlighting (`stex`) | IMPLEMENTED (Prompt 5) |
| Line Numbers & Active Line Highlight | IMPLEMENTED (Prompt 5) |
| Word Wrap Toggle & Font Size Scaling | IMPLEMENTED (Prompt 5) |
| Search Widget (`Ctrl+F` / `Cmd+F`) | IMPLEMENTED (Prompt 5) |
| Bracket Matching | IMPLEMENTED (Prompt 5) |
| Editor Command Overrides (`Ctrl+S`, `Ctrl+Enter`) | IMPLEMENTED (Prompt 5) |
| Compile button → API | IMPLEMENTED |
| Server-Side LaTeX Compilation (pdfLaTeX) | IMPLEMENTED |
| PDF Preview (iframe) | IMPLEMENTED |
| PDF Download Button (`<project-name>.pdf`) | IMPLEMENTED (Prompt 2) |
| Blob URL Memory Management | IMPLEMENTED (Prompt 2) |
| Compilation State Guard (`isCompiling`) | IMPLEMENTED (Prompt 2) |
| Formatted Error Display & Banner | IMPLEMENTED (Prompt 2.1) |
| Structured Compiler Error API (`error`, `details`) | IMPLEMENTED (Prompt 2.1) |
| Independent Save Button (Not disabled by compile) | IMPLEMENTED (Prompt 2.1) |
| Client-Side `localStorage` Persistence | IMPLEMENTED (Prompt 3) |
| Document Restore on Page Load | IMPLEMENTED (Prompt 3) |
| Debounced Autosave (1000ms) | IMPLEMENTED (Prompt 3) |
| Document Save Status Badge | IMPLEMENTED (Prompt 3) |
| Keyboard Shortcuts (`Ctrl+S`, `Ctrl+Enter`) | IMPLEMENTED (Prompt 3 & 5) |
| Shortcut UI Badges | IMPLEMENTED (Prompt 3) |
| Application Metadata (`app/layout.tsx`) | IMPLEMENTED (Prompt 3) |
| Multi-Project Storage (`resumeforge:projects`) | IMPLEMENTED (Prompt 4) |
| Automatic Prompt 3 Data Migration | IMPLEMENTED (Prompt 4) |
| Project Selector Dropdown UI | IMPLEMENTED (Prompt 4) |
| Case-Insensitive Unique Project Names | IMPLEMENTED (Prompt 4.1) |
| Rename Validation & Error Feedback | IMPLEMENTED (Prompt 4.1) |
| Create / Rename / Duplicate / Delete Projects | IMPLEMENTED (Prompt 4 & 4.1) |
| Export `.tex` Source File Download | IMPLEMENTED (Prompt 4 & 6) |
| Import `.tex` Local File Picker | IMPLEMENTED (Prompt 4) |
| Strict PDF Preview Isolation across Projects | IMPLEMENTED (Prompt 4) |
| Cloud Persistence / database | NOT IMPLEMENTED |
| Authentication | NOT IMPLEMENTED |
| Version history | NOT IMPLEMENTED |
| Production Docker Sandbox Isolation | NOT IMPLEMENTED |

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
- Client-side **PDF Download** button in header (`a[download="<project-name>.pdf"]`)
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

### Prompt 4 (Multi-Project Workspace & Document Management)
- **Multi-Project Data Model (`lib/storage.ts`)**: Schema `StoredProjects` (`{ version: 1, activeProjectId, projects: ResumeProject[] }`) saved under `resumeforge:projects`.
- **Automatic Migration**: Automatically checks for Prompt 3 single-document key `resumeforge:document:main` on first load and migrates it to a project named `"My Resume"` without data loss.
- **Project Selector Dropdown**: Rendered in header with project list, active indicator, and action items (`+ New Resume`, `Rename`, `Duplicate`, `Delete`).
- **Project Lifecycle Operations**: Create, Rename, Duplicate, Delete.
- **Import / Export**: Export `.tex` download & Import `.tex` file picker.
- **Strict PDF Preview Isolation**: Revokes `pdfUrl` and clears `errorDetails` whenever project context changes.

### Prompt 4.1 (Unique Project Naming & UX Refinements)
- **Case-Insensitive Uniqueness**: Centralized `isProjectNameTaken()` and `getUniqueProjectName()`.
- **Auto-Incrementing Naming**: New projects create `Untitled Resume`, `Untitled Resume 2`; duplicates create `My Resume Copy`, `My Resume Copy 2`.
- **Rename Modal Validation**: Displays red error text for blank or duplicate names.
- **Safe Load Normalization**: Automatically uniquifies any duplicate names in legacy `localStorage` data without data loss.

### Prompt 5 (Professional Monaco LaTeX Code Editor)
- **Monaco Editor Engine (`components/LatexEditor.tsx`)**: Integrated `@monaco-editor/react` with dynamic non-SSR client loading (`next/dynamic`).
- **LaTeX Syntax Highlighting (`stex`)**: Full syntax tokenization for LaTeX commands (`\documentclass`, `\begin`, `\end`, `\section`, `\textbf`, `\item`), comments (`%`), braces (`{}`), and brackets (`[]`).
- **Line Numbers & Line Wrapping**: Displays synchronized line numbers and current line highlight; features a `Wrap: On/Off` toggle button.
- **Font Size Scaling**: Features font size controls (`A−`, `14px`, `A+` ranging from 11px to 20px).
- **Native Search Widget**: Pressing `Ctrl+F` / `Cmd+F` opens Monaco's native search/find widget.
- **Command Overrides**: Monaco editor commands bound to `onSaveRef` and `onCompileRef`, ensuring `Ctrl+S` / `Cmd+S` and `Ctrl+Enter` / `Cmd+Enter` inside Monaco fire ResumeForge handlers seamlessly.
- **Compiler Error Line Preparation**: Architecture prepared for mapping compiler errors to editor line markers (`monaco.editor.setModelMarkers`).

### Prompt 6 (Multi-File LaTeX Project Architecture & FileTree)
- **Multi-File Data Model**: Replaced single `project.latex` string with `project.files: ProjectFile[]`.
- **Backward Migration**: `loadProjectsData()` converts legacy single-file projects (`latex: string`) to `files: [main.tex]`.
- **Root `main.tex` Protection**: `main.tex` protected from rename or deletion; fallback logic recovers `main.tex` if missing.
- **FileTree Component (`components/FileTree.tsx`)**: Sidebar displaying project files, active file selection, inline `+ New File` input, rename, and delete actions.
- **Multi-File Compile API (`app/api/compile/route.ts`)**: Backend accepts `{ files: [{ path, content }] }`, validates paths, creates subdirectories (e.g. `sections/`), writes files, compiles `main.tex`, and returns PDF binary.
- **Path Security**: Rejects absolute paths, `../` traversal attempts, or invalid paths with HTTP 400 Bad Request.

### Prompt 7 (Project Assets, Image Upload & LaTeX Image Compilation)
- **Image Asset Upload**: Users can upload `.png`, `.jpg`, and `.jpeg` images up to 2 MB into project `images/` directory.
- **Image Asset View Panel (`components/ImageAssetView.tsx`)**: Displays image preview, file metadata (name, size, MIME type), path information, and a one-click `Copy LaTeX Snippet` button (`\includegraphics[width=0.4\textwidth]{images/profile.png}`).
- **Collision-Safe Image Pathing**: Automatically appends numeric suffixes to image filenames if an image with the same name exists (e.g., `images/profile.png`, `images/profile-2.png`).
- **Server-Side Base64 Image Decoding**: `/api/compile` decodes base64 payload into binary Buffer objects and writes image files into the temporary compilation directory before executing `pdflatex main.tex`.
- **Image Compilation Validation**: `\includegraphics{images/logo.png}` compiles successfully in pdfLaTeX and renders embedded images inside the generated PDF binary output.
- **Asset Duplication & Deletion**: Duplicating a project deep-copies all image assets with new file IDs; deleting an image removes it cleanly from project storage.

### Prompt 8 (ZIP Project Archives & Compiler Options)
- **ZIP Project Export**: Export complete multi-file project with `.tex` source files and binary image assets into `<project-name>.zip` using `JSZip`.
- **Atomic ZIP Project Import**: Atomically import `.zip` project archives with path traversal validation, extension allowlist (`.tex`, `.png`, `.jpg`, `.jpeg`), size limit validation (10 MB upload max, 20 MB total extracted size max, 5 MB file max, 100 file max), and `main.tex` requirement.
- **Compiler Settings per Project**: Project data model extended with `settings: CompilerSettings` (`paperSize`: Letter vs A4, `passes`: 1 vs 2). Settings persist per project and duplicate cleanly.
- **Compiler Settings UI Modal (`CompilerSettingsModal.tsx`)**: Modal UI for configuring paper size and pass count per project.
- **API Multi-Pass & Paper Size Options**: `/api/compile` updated to accept `options: { paperSize, passes }`. Supports 2-pass compilation execution and paper size parameters.

---

## Tech Stack

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Frontend framework | Next.js (App Router) | 16.3.3 | IMPLEMENTED |
| UI library | React | 19.2.8 | IMPLEMENTED |
| Code Editor | Monaco Editor (`@monaco-editor/react`) | 4.7.0 | IMPLEMENTED (Prompt 5) |
| ZIP Archive Engine | `JSZip` | 3.10.1 | IMPLEMENTED (Prompt 8) |
| Language | TypeScript | 5.x | IMPLEMENTED |
| Styling | Tailwind CSS | v4 | IMPLEMENTED |
| Fonts | Geist, Geist Mono | — | IMPLEMENTED |
| Persistence | Browser `localStorage` | — | IMPLEMENTED (Prompt 4 & 6 Multi-File) |
| LaTeX compiler | pdfLaTeX (TeX Live 2026) | 2026 | IMPLEMENTED (local dev) |
| Database | None | — | NOT IMPLEMENTED |
| Auth | None | — | NOT IMPLEMENTED |

---

## Completed Tasks

| Prompt | Date | Description |
|--------|------|-------------|
| Prompt 1 | 2026-08-26 | Project inspection, documentation system creation |
| Prompt 2 | 2026-08-26 | PDF download, blob URL lifecycle management, `isCompiling` guard, UX & accessibility hardening |
| Prompt 2.1 | 2026-08-26 | Bug fixes for compilation error UX, structured error JSON, independent Save button, ESLint clean |
| Prompt 3 | 2026-08-26 | Document persistence (`localStorage`), restoration on load, debounced autosave, keyboard shortcuts (`Ctrl+S`, `Ctrl+Enter`), app metadata |
| Prompt 4 | 2026-08-26 | Local multi-project storage (`resumeforge:projects`), migration, project dropdown UI, create/rename/duplicate/delete, `.tex` export/import, PDF preview isolation |
| Prompt 4.1 | 2026-08-26 | Unique case-insensitive project naming, auto-incrementing new/duplicate names, rename UI validation, safe legacy normalization |
| Prompt 5 | 2026-08-26 | Monaco LaTeX code editor integration, `stex` syntax highlighting, line numbers, word wrap, font scaling, search, shortcut overrides, diagnostic line preparation |
| Prompt 6 | 2026-08-26 | Multi-file project architecture (`project.files`), FileTree sidebar component, root `main.tex` protection, path security, multi-file server compile API |
| Prompt 7 | 2026-08-28 | Image asset upload (.png, .jpg, .jpeg), ImageAssetView preview panel, LaTeX snippet copying, server base64 decoding, pdfLaTeX image compilation |
| Prompt 8 | 2026-08-31 | ZIP project export/import (`JSZip`), ZIP bomb protection, atomic import, compiler settings UI (`CompilerSettingsModal.tsx`), A4/Letter paper size, double-pass compilation |

---

## Current Task

**Prompt 8** — Project ZIP Archives & Compiler Options (COMPLETE).

---

## Next Recommended Task

**Prompt 9 — Monaco Line Error Highlighting & Visual LaTeX Snippets:**
- Parse pdfLaTeX error logs to extract error line numbers and highlight failing lines directly inside Monaco Editor (`monaco.editor.setModelMarkers`).
- Add a visual LaTeX Snippets insertion menu (formatting, sections, bullet points, tables, images).
