# ResumeForge — Architectural Decisions

> This log records significant technical decisions made during the project.
> For every entry: what was decided, why, what alternatives were considered, and the current status.

---

## Decision Log

---

### ADR-001: Use Next.js App Router

**Date**: Before Prompt 1 (initial setup)

**Decision**: Use Next.js 16 with the App Router for both the frontend and API layer.

**Why**:
- Single framework for both UI (React) and backend (API routes)
- No need to maintain a separate Express/Fastify server for early prototype
- App Router provides server components, simplifying data fetching in future
- Team/developer already using Next.js

**Alternatives considered**:
- Vite + React + separate Express API — more setup, more flexibility
- SvelteKit — less ecosystem support for LaTeX tools
- Plain HTML + Node.js server — too bare-bones

**Status**: ACTIVE

---

### ADR-002: Use pdfLaTeX as the Initial Compiler

**Date**: Before Prompt 1 (initial setup)

**Decision**: Use pdfLaTeX from TeX Live 2026 as the compilation engine.

**Why**:
- The developer's sample resume was written for pdfLaTeX
- pdfLaTeX is the most commonly used LaTeX engine
- TeX Live 2026 was already installed on the developer's machine
- XeLaTeX and LuaLaTeX were not needed for the sample resume

**Alternatives considered**:
- XeLaTeX — better font support, not needed yet
- LuaLaTeX — most extensible, but slowest
- Tectonic — interesting (self-contained, Rust-based), but not yet evaluated

**Future**:
- Engine choice should be reconsidered before production deployment
- XeLaTeX or LuaLaTeX may be needed for multilingual or custom-font resumes
- Tectonic should be evaluated as an alternative (avoids needing full TeX Live on server)
- Do not assume pdfLaTeX is the final production engine

**Status**: ACTIVE for local development. NEEDS REVIEW for production.

---

### ADR-003: Use a Temp Directory Per Compilation Request

**Date**: Before Prompt 1 (initial setup)

**Decision**: Each `/api/compile` request creates a unique temp directory, writes `main.tex` (and any nested subfiles), runs pdfLaTeX with that directory as the working directory, reads the resulting PDF, and deletes the directory.

**Why**:
- Isolates each compilation from others (no file conflicts under concurrent requests)
- Cleanup is straightforward (`fs.rm`)
- No persistent storage needed for the prototype

**Alternatives considered**:
- Fixed directory with request-scoped filenames — race conditions possible
- Object storage (S3) for input/output — overkill for early prototype

**Future**:
- In production, compilation should happen inside a Docker container, not a temp directory on the server host
- The temp directory approach is safe for a local single-developer tool but not for production

**Status**: ACTIVE for local development. NEEDS REPLACEMENT for production.

---

### ADR-004: Return PDF as Inline Binary Response

**Date**: Before Prompt 1 (initial setup)

**Decision**: The `/api/compile` endpoint returns the PDF binary directly as the HTTP response body with `Content-Type: application/pdf`.

**Why**:
- Simplest possible approach
- No object storage needed
- No URL generation or signing needed
- PDF is immediately available in the response

**Alternatives considered**:
- Upload to S3, return signed URL — adds complexity, requires infrastructure
- Store in database as base64 — bad practice for binary files

**Future**:
- In production, the compilation will be asynchronous (queued)
- The PDF will be stored in object storage
- The frontend will poll for completion and retrieve via a signed URL

**Status**: ACTIVE for local development. NEEDS REDESIGN for production async compilation.

---

### ADR-005: Use Tailwind CSS v4

**Date**: Before Prompt 1 (initial setup)

**Decision**: Use Tailwind CSS v4 (configured via `@tailwindcss/postcss`).

**Why**:
- `create-next-app` generated the project with Tailwind v4
- v4 uses a different import syntax (`@import "tailwindcss"`) and PostCSS plugin (`@tailwindcss/postcss`)
- v4 uses a different configuration approach (inline `@theme` blocks instead of `tailwind.config.js`)

**Notes**:
- Tailwind v4 is a major breaking change from v3
- Developers familiar with v3 must read v4 docs before editing Tailwind configuration
- There is no `tailwind.config.js` or `tailwind.config.ts` — configuration is done via CSS `@theme` blocks

**Status**: ACTIVE

---

### ADR-006: No Database in Phase 0

**Date**: Prompt 1 (2026-08-26)

**Decision**: Do not implement a database in the initial prototype.

**Why**:
- Compilation pipeline is the core functionality — it should work first
- Database schema design requires knowing what features will be built
- Adding a database adds infrastructure complexity (connection strings, migrations, etc.)
- The initial goal is a working local tool, not a cloud product

**Alternatives considered**:
- Use SQLite with Prisma for zero-infrastructure persistence — possible but premature
- Use localStorage — does not require a server, but does not scale

**Future**:
- PostgreSQL + Prisma is the likely target for Phase 3
- Decision should be revisited when persistence becomes a requirement

**Status**: ACTIVE (no database implemented). Review when Phase 3 begins.

---

### ADR-007: Hardcoded pdfLaTeX Path (Acknowledged Technical Debt)

**Date**: Prompt 1 (2026-08-26)

**Decision**: The pdfLaTeX path is currently hardcoded as `C:\texlive\2026\bin\windows\pdflatex.exe`.

**Why this happened**:
- Developer's machine has TeX Live at this path
- Early prototype — getting compilation working was the priority

**Why this is wrong**:
- Fails on any other machine
- Fails in CI/CD
- Fails in Docker
- Fails on macOS or Linux

**Required fix**:
- Move to an environment variable: `PDFLATEX_PATH`
- Provide a sensible default or clear error if not set
- Document required environment setup

**Status**: TECHNICAL DEBT — should be fixed in Phase 1 (Prompt 2 or 3 scope).

---

### ADR-008: Retain Last Successful PDF State on Failed Compilation

**Date**: Prompt 2 & 2.1 (2026-08-26)

**Decision**: If a compilation attempt fails after a previous compilation succeeded, the application retains the previous successfully compiled PDF in preview and download state, while displaying a clear error indicator and amber badge (`"Showing last successful PDF (latest compile failed)"`).

**Why**:
- Prevents destroying the user's visual context when fixing a simple LaTeX typo.
- Ensures the user can still download their last known-good PDF.
- Explicitly labeled in the UI so the user is never misled into thinking the preview represents their broken code.

**Status**: ACTIVE

---

### ADR-009: Separate Header Status Summary from Workspace Error Panel

**Date**: Prompt 2.1 (2026-08-26)

**Decision**: The compact 64px header status indicator displays only short, clean status text (e.g. `"Compilation failed (showing previous PDF)"`). Detailed compiler log output is returned as `{ error: string, details: string }` from `/api/compile` and rendered in a formatted, scrollable, dismissible red error panel in the workspace.

**Why**:
- Putting 200-line raw pdfLaTeX banner text into the header ruined UI readability.
- Separates high-level status summary from technical diagnostic details.
- Allows users to read and scroll through exact LaTeX error tracebacks comfortably.

**Status**: ACTIVE

---

### ADR-010: Client-side Browser localStorage for Document Persistence (Phase 1)

**Date**: Prompt 3 (2026-08-26)

**Decision**: Use browser `localStorage` (via key `resumeforge:document:main`) to persist LaTeX source code locally across browser refreshes and sessions.

**Why**:
- Provides immediate document persistence without introducing database/backend infrastructure complexity.
- Requires zero user accounts, zero authentication, and zero cloud setup.
- Enables debounced autosave (1000ms) and manual save.

**Status**: ACTIVE for Phase 1.

---

### ADR-011: Local Multi-Project Document Storage & Migration (Phase 1)

**Date**: Prompt 4 (2026-08-26)

**Decision**: Replace single-document storage with a multi-project schema (`StoredProjects`: `{ version: 1, activeProjectId, projects: ResumeProject[] }`) saved in `localStorage` under key `resumeforge:projects`. Automatically migrate Prompt 3 single-document data (`resumeforge:document:main`) into a project named `"My Resume"`.

**Why**:
- Upgrades ResumeForge into a full local resume workspace with support for multiple resumes.
- Automatically preserves existing user data during migration without data loss.
- Provides strict PDF preview isolation so PDF previews never leak across projects.
- Keeps all data strictly local in the browser without requiring a database or authentication server.

**Status**: ACTIVE for Phase 1.

---

### ADR-012: Unique User-Facing Project Names

**Date**: Prompt 4.1 (2026-08-26)

**Decision**: Enforce strict case-insensitive uniqueness and whitespace trimming for user-facing project names across the workspace while preserving unique project `id`s.

**Why**:
- Prevents visual ambiguity in the project selector dropdown (e.g. having three projects named "Untitled Resume").
- Automatically appends incrementing numeric suffixes for new projects (`Untitled Resume 2`, `Untitled Resume 3`) and duplicates (`My Resume Copy`, `My Resume Copy 2`).
- Validates project renames in the UI, rejecting duplicate or blank names (`Project name cannot be empty.`, `A project with this name already exists.`).
- Safely normalizes existing `localStorage` data on load without data or ID loss.

**Status**: ACTIVE for Phase 1.

---

### ADR-013: Monaco Editor as Professional LaTeX Code Editor Engine

**Date**: Prompt 5 (2026-08-26)

**Decision**: Use Monaco Editor (via `@monaco-editor/react`) as the code editing engine to replace the plain HTML `<textarea>`.

**Why**:
- Excellent client-side React 19 / Next.js App Router integration using dynamic non-SSR loading (`next/dynamic`).
- Built-in LaTeX / stex syntax tokenization for commands (`\documentclass`, `\begin`, `\end`, `\section`, `\textbf`, `\item`), comments (`%`), braces (`{}`), and brackets (`[]`).
- Native line numbers, active line highlight, bracket matching, search (`Ctrl+F`), replace (`Ctrl+H`), and line wrapping options.
- Clean keyboard shortcut command binding (`editor.addCommand`) ensuring `Ctrl+S` / `Cmd+S` and `Ctrl+Enter` / `Cmd+Enter` inside the editor fire ResumeForge Save and Compile handlers.
- Native marker architecture (`monaco.editor.setModelMarkers`) for mapping compiler errors to editor lines in future prompts.

**Status**: ACTIVE for Phase 2.

---

### ADR-014: Multi-File LaTeX Project Model & File Tree Architecture

**Date**: Prompt 6 (2026-08-26)

**Decision**: Upgrade ResumeForge from a single-file project model (`project.latex: string`) to a multi-file project architecture (`project.files: ProjectFile[]`) with a sidebar file tree, file-level editor switching, and multi-file server-side compilation payload.

**Why**:
- Real-world LaTeX resumes use modular structure (e.g. `main.tex` with `\input{sections/experience}`).
- Provides backward compatibility by automatically migrating legacy single-file projects (`latex: string`) into `files: [main.tex]` on load.
- Guarantees `main.tex` as the immutable root compilation entry point (protected from deletion/renaming).
- Enforces strict path traversal security in `/api/compile` (rejects `../`, absolute paths, or un-normalized paths before writing to temporary compilation directory).
- Defers complex binary ZIP import/export and asset blob storage to dedicated future prompts while laying a clean foundation.

**Status**: ACTIVE for Phase 4.
