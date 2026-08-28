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
- **Project Lifecycle Operations**: Create, Rename, Duplicate, Delete.
- **Import / Export Actions**: Export `.tex` download & Import `.tex` file picker.
- **Strict PDF Preview Isolation**: Revokes `pdfUrl` and clears compiler errors whenever project active state changes.

---

## Prompt 4.1 — Enforce Unique Project Names & Refine Project Management UX

**Date**: 2026-08-26

**Objective**: Enforce strict case-insensitive uniqueness and whitespace trimming for project names in the workspace, with auto-incrementing naming for new projects and duplicates, rename UI validation, and safe legacy name normalization on load.

**What was implemented**:
- **Centralized Unique Name Generator (`lib/storage.ts`)**: Added `isProjectNameTaken()` and `getUniqueProjectName()`.
- **Auto-Incrementing Project Names**: Creates `Untitled Resume`, `Untitled Resume 2`, `My Resume Copy`, `My Resume Copy 2`.
- **Rename Validation & UI**: Displays clear red error message in Rename Modal for blank or duplicate names.
- **Safe Legacy Data Normalization**: Automatically uniquifies duplicate names in legacy `localStorage` data on load.

---

## Prompt 5 — Professional Monaco LaTeX Code Editor

**Date**: 2026-08-26

**Objective**: Replace the plain HTML `<textarea>` with Monaco Editor (`@monaco-editor/react`) featuring LaTeX syntax highlighting, line numbers, word wrap options, font size scaling, search, and shortcut command overrides.

**What was implemented**:
- **Monaco Editor Engine (`components/LatexEditor.tsx`)**: Integrated `@monaco-editor/react` with dynamic client-side non-SSR loading.
- **LaTeX Syntax Highlighting**: Enabled `stex` syntax tokenization for commands, comments, braces, and brackets.
- **Line Numbers & Line Wrapping**: Added line numbers, active line highlight, and a `Wrap: On/Off` toggle button.
- **Font Size Scaling**: Added `A−` / `A+` controls scaling editor font size between 11px and 20px.
- **Search Widget**: Bound `Ctrl+F` / `Cmd+F` to Monaco's native search bar.
- **Command Overrides**: Intercepted `Ctrl+S` / `Cmd+S` and `Ctrl+Enter` / `Cmd+Enter` inside Monaco to fire ResumeForge handlers cleanly.
- **Compiler Error Preparation**: Prepared marker architecture (`monaco.editor.setModelMarkers`) for line error highlighting.

---

## Prompt 6 — Multi-File LaTeX Project Architecture & File Tree

**Date**: 2026-08-26

**Objective**: Upgrade ResumeForge from a single-file-per-project architecture (`project.latex: string`) to a multi-file project model (`project.files: ProjectFile[]`), with a file tree sidebar, file-level editor switching, backward-compatible migration, path security validation, and multi-file server-side compilation.

**What was implemented**:
- **Multi-File Storage Model (`lib/storage.ts`)**: Replaced `latex: string` with `files: ProjectFile[]` (`id`, `name`, `path`, `type`, `content`). Added `createProjectFile()`, `deleteProjectFile()`, `renameProjectFile()`, and `updateProjectFile()`.
- **Backward Compatibility & Automatic Migration**: `loadProjectsData()` automatically converts legacy single-file projects (`latex: string`) into `files: [main.tex]` without data or ID loss.
- **Root `main.tex` Protection**: `main.tex` is protected from rename or deletion; fallback logic automatically recovers `main.tex` if corrupted.
- **Multi-File Compile API (`app/api/compile/route.ts`)**: Backend accepts `{ files: [{ path, content }] }` and legacy `{ latex }`. Validates paths against directory traversal (`../`), creates subdirectories (e.g. `sections/`), writes files, compiles `main.tex`, and returns PDF binary.
- **Path Security**: Rejects absolute paths, `../` traversal attempts, or invalid paths with HTTP 400.
- **FileTree Component (`components/FileTree.tsx`)**: Sidebar displaying project files sorted with `main.tex` first, file selection, inline `+ New File` input, rename modal, delete icon, and accessible labels.
- **Workspace Integration (`app/page.tsx`)**: Wired multi-file state (`activeFileId`, `activeFileContent`), file selection, file-level debounced autosave, multi-file compile payload generation, and PDF preview persistence across file switches.

---

## Prompt 7 — Project Assets, Image Upload & LaTeX Image Compilation

**Date**: 2026-08-28

**Objective**: Extend multi-file architecture to support image assets (`.png`, `.jpg`, `.jpeg`), image preview panel (`ImageAssetView.tsx`), one-click LaTeX snippet copying (`\includegraphics`), server-side base64 image decoding, and pdfLaTeX image compilation.

**What was implemented**:
- **Image Asset Upload**: Users can upload `.png`, `.jpg`, and `.jpeg` image files up to 2 MB per file into project `images/` directory.
- **ImageAssetView Component (`components/ImageAssetView.tsx`)**: Displays responsive image preview, metadata card (file name, MIME type, size in KB/MB), path display, and a one-click `Copy LaTeX Snippet` button (`\includegraphics[width=0.4\textwidth]{images/profile.png}`) providing `Copied ✓` feedback.
- **Collision-Safe Image Naming**: Automatically appends numeric suffixes if an image name collision occurs (e.g. `images/profile.png`, `images/profile-2.png`).
- **Server Base64 Image Decoding (`app/api/compile/route.ts`)**: Decodes base64 payload into binary Buffers and writes image files into temporary compilation directory before executing `pdflatex main.tex`.
- **pdfLaTeX Image Compilation**: `\includegraphics{images/logo.png}` compiles successfully in pdfLaTeX with `\usepackage{graphicx}` and renders embedded images inside the generated PDF binary output.
- **FileTree Categories**: FileTree sidebar cleanly separates `LaTeX Code` (`📄`) and `Images` (`🖼`) with `+ Tex` and `+ Img` action controls.

**Files modified**:
- `lib/storage.ts` — MAX_IMAGE_SIZE_BYTES (2 MB), ALLOWED_IMAGE_MIME_TYPES, uploadProjectImageFile, image collision-safe path generator, asset deep duplication
- `app/api/compile/route.ts` — Image asset base64 decoding, size limits (5 MB max on server), binary file writing inside temp directory
- `components/FileTree.tsx` — Added + Upload Image action, LaTeX vs Images categories, image icons, and accessible labels
- `components/ImageAssetView.tsx` — Image asset preview panel, metadata card, and LaTeX snippet generator
- `app/page.tsx` — Image upload FileReader handler, dynamic ImageAssetView rendering, and multi-file compile payload generation
- `docs/DECISIONS.md` — Added ADR-015 (Project Asset and Image File Architecture)
- `docs/DEVELOPMENT_LOG.md` — Added Prompt 7 entry

**Tests run**:

| Test | Command / Method | Result | Notes |
|------|------------------|--------|-------|
| Production Build | `npm run build` | PASS | Next.js 16.3.3 Turbopack build succeeds in 1.5s |
| Lint Check | `npm run lint` | PASS | Zero errors, zero warnings |
| Image Compile API Test | Node `test_image_compile.js` (`\includegraphics{images/test.png}`) | PASS | Returned HTTP 200 OK with 25,725 byte PDF binary containing embedded image |
| Oversized Image Test | Node `test_image_compile.js` (> 5 MB) | PASS | Returned HTTP 400 Bad Request with size limit error message |
| Path Traversal Test | Node `test_compile.js` (`path: "../hack.png"`) | PASS | Returned HTTP 400 Bad Request with path security message |

**Result**: Project asset and image upload architecture implementation complete. Build passes cleanly. Zero lint errors. All automated API tests passed.
