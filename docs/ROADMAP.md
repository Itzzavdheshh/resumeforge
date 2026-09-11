# ResumeForge — Development Roadmap

---

## Roadmap Philosophy

ResumeForge is built **incrementally, in small testable steps**.

Each phase produces working, testable software. No phase skips ahead to future features until previous phases are solid.

The roadmap is adjusted as the project evolves — it is a plan, not a contract.

---

## PHASE 0 — Foundation
**Status: COMPLETED**

Goal: Establish the project baseline, tooling, and documentation.

| Task | Status |
|------|--------|
| Initialize Next.js project | DONE |
| Configure Tailwind CSS | DONE |
| Build basic workspace UI (editor + preview) | DONE |
| Implement `/api/compile` endpoint | DONE |
| Integrate pdfLaTeX compilation | DONE |
| PDF preview in browser | DONE |
| Create documentation system (docs/) | DONE (Prompt 1) |
| Fix ESLint `no-explicit-any` error | DONE (Prompt 2.1) |
| Fix blob URL memory leak | DONE (Prompt 2) |
| Update page metadata (title, description) | DONE (Prompt 3) |
| Configurable compiler path (env variable) | PENDING |

---

## PHASE 1 — Usable Local Tool
**Status: COMPLETED**

Goal: Make the tool genuinely usable as a local development tool. No accounts, no cloud, just a working local LaTeX workspace.

| Task | Priority | Status |
|------|----------|--------|
| PDF download button | HIGH | DONE (Prompt 2) |
| Source download button (.tex) | MEDIUM | DONE (Prompt 4) |
| Compiler path via environment variable | HIGH | PENDING |
| Fix Save button (localStorage persistence) | HIGH | DONE (Prompt 3) |
| Restore saved document on load | HIGH | DONE (Prompt 3) |
| Debounced autosave (1000ms) | HIGH | DONE (Prompt 3) |
| Compile button disabled during compilation | HIGH | DONE (Prompt 2) |
| Loading indicator during compilation | HIGH | DONE (Prompt 2) |
| Keyboard shortcut: Ctrl+Enter to compile | MEDIUM | DONE (Prompt 3) |
| Keyboard shortcut: Ctrl+S to save | MEDIUM | DONE (Prompt 3) |
| Formatted error display (not raw pdfLaTeX log) | HIGH | DONE (Prompt 2.1) |
| Update page title and metadata | LOW | DONE (Prompt 3) |
| Basic README with actual project description | LOW | PENDING |

---

## PHASE 2 — Better Editor
**Status: COMPLETED**

Goal: Replace the plain textarea with a proper code editor.

| Task | Priority | Status |
|------|----------|--------|
| Integrate Monaco Editor or CodeMirror | HIGH | DONE (Prompt 5 Monaco) |
| LaTeX syntax highlighting | HIGH | DONE (Prompt 5 `stex`) |
| Line numbers | HIGH | DONE (Prompt 5) |
| Editor line-wrap options | MEDIUM | DONE (Prompt 5 Wrap Toggle) |
| Find/replace in editor | MEDIUM | DONE (Prompt 5 Monaco Search) |
| Error line highlighting (from compiler output) | MEDIUM | ARCHITECTURE PREPARED |
| Keyboard shortcuts native to the editor | LOW | DONE (Prompt 5 Command Overrides) |
| Insert snippet menu (LaTeX commands) | LOW | PENDING |

---

## PHASE 3 — Local Multi-Project Workspace & Document Management
**Status: COMPLETED (Local Storage)**

Goal: User's work is saved and can be recovered. Support multiple local resumes before adding user accounts.

| Task | Priority | Status |
|------|----------|--------|
| Multiple local resume projects (localStorage) | HIGH | DONE (Prompt 4) |
| Project selector / dropdown UI | HIGH | DONE (Prompt 4) |
| Rename / clone / delete local resume projects | MEDIUM | DONE (Prompt 4) |
| Export `.tex` source file | MEDIUM | DONE (Prompt 4 & 6) |
| Import `.tex` source file | MEDIUM | DONE (Prompt 4) |
| Project settings (name, compiler engine) | LOW | PENDING |
| Database implementation (PostgreSQL + Prisma) | FUTURE | PENDING |

---

## PHASE 4 — Multi-File LaTeX Project Architecture
**Status: COMPLETED**

Goal: Allow modular multi-file LaTeX projects with a sidebar FileTree.

| Task | Priority | Status |
|------|----------|--------|
| Multi-file data model (`project.files`) | HIGH | DONE (Prompt 6) |
| FileTree sidebar UI component | HIGH | DONE (Prompt 6) |
| Root `main.tex` protection | HIGH | DONE (Prompt 6) |
| Multi-file compiler payload (`/api/compile`) | HIGH | DONE (Prompt 6) |
| Path security & directory traversal protection | HIGH | DONE (Prompt 6) |

---

## PHASE 5 — Project Assets & Image Upload
**Status: COMPLETED**

Goal: Support image assets (`.png`, `.jpg`, `.jpeg`), image preview panel, and pdfLaTeX image compilation.

| Task | Priority | Status |
|------|----------|--------|
| Image asset upload (.png, .jpg, .jpeg) | HIGH | DONE (Prompt 7) |
| Image Asset View panel (`ImageAssetView.tsx`) | HIGH | DONE (Prompt 7) |
| One-click Copy LaTeX Snippet (`\includegraphics`) | HIGH | DONE (Prompt 7) |
| Collision-safe `images/` directory storage | HIGH | DONE (Prompt 7) |
| Image size limits (2 MB LocalStorage / 5 MB API) | HIGH | DONE (Prompt 7) |
| Server base64 image decoding in `/api/compile` | HIGH | DONE (Prompt 7) |
| pdfLaTeX image compilation (`\usepackage{graphicx}`) | HIGH | DONE (Prompt 7) |

---

## PHASE 6 — ZIP Archives & Compiler Settings
**Status: COMPLETED**

Goal: Complete project export/import as `.zip` archives and support paper size and pass count settings.

| Task | Priority | Status |
|------|----------|--------|
| ZIP project archive export (`JSZip`) | HIGH | DONE (Prompt 8) |
| ZIP project archive import | HIGH | DONE (Prompt 8) |
| ZIP bomb protection & size limits (10 MB ZIP / 50 files) | HIGH | DONE (Prompt 8) |
| Atomic project archive import | HIGH | DONE (Prompt 8) |
| Compiler settings modal (`CompilerSettingsModal.tsx`) | HIGH | DONE (Prompt 8) |
| Paper size options (Letter / A4) | MEDIUM | DONE (Prompt 8) |
| Multi-pass compilation options (1 Pass / 2 Pass) | MEDIUM | DONE (Prompt 8) |

---

## PHASE 7 — Monaco Error Highlighting & LaTeX Snippets
**Status: COMPLETED**

Goal: Integrate real-time pdflatex error log parsing, line markers, and LaTeX snippet insertion menu.

| Task | Priority | Status |
|------|----------|--------|
| pdflatex error parser (`latexErrors.ts`) | HIGH | DONE (Prompt 9) |
| Monaco error squiggles & markers | HIGH | DONE (Prompt 9) |
| Cursor auto-jump to first error line | HIGH | DONE (Prompt 9) |
| LaTeX snippets dropdown menu (`LatexSnippetsMenu.tsx`) | MEDIUM | DONE (Prompt 9) |

---

## PHASE 8 — Professional UI/UX Redesign & Workspace Polish
**Status: COMPLETED**

Goal: Transform workspace UI with unified application header, grouped menus, editor tab styling, snippets search, collapsible error panel, and polished design system.

| Task | Priority | Status |
|------|----------|--------|
| Application header extraction (`AppHeader.tsx`) | HIGH | DONE (Prompt 10) |
| Grouped File & Project dropdown menus | HIGH | DONE (Prompt 10) |
| IDE editor file tab styling (`[📄 main.tex] [root]`) | MEDIUM | DONE (Prompt 10) |
| Snippets menu live instant search | MEDIUM | DONE (Prompt 10) |
| Collapsible compiler diagnostics error panel | HIGH | DONE (Prompt 10) |
| PDF empty state card & paper/pass status badges | MEDIUM | DONE (Prompt 10) |
| Button design system & modal backdrop blur polish | HIGH | DONE (Prompt 10) |

---

## PHASE 9 — Docker Compiler Sandbox & Security Audit
**Status: COMPLETED**

Goal: Isolate LaTeX compilation inside an unprivileged Docker container (`resumeforge-compiler:latest`) with strict security flags, hard timeouts, and 503 fallback.

| Task | Priority | Status |
|------|----------|--------|
| Docker compiler container image build | HIGH | DONE (Prompt 11) |
| Network disabled (`--net=none`) | HIGH | DONE (Prompt 11 & 11.1) |
| Read-only root filesystem (`--read-only`) | HIGH | DONE (Prompt 11 & 11.1) |
| RAM temp disk (`--tmpfs /tmp:rw,noexec,nosuid,size=100m`) | HIGH | DONE (Prompt 11 & 11.1) |
| Container resource limits (`-m 512m`, `--cpus=1.5`, `--pids-limit=64`) | HIGH | DONE (Prompt 11 & 11.1) |
| Non-root user execution (`latexuser`, `--user 1000:1000`) | HIGH | DONE (Prompt 11 & 11.1) |
| Container auto-cleanup (`--rm` + `docker kill` timer) | HIGH | DONE (Prompt 11 & 11.1) |
| 15-second hard compilation timeout | HIGH | DONE (Prompt 11 & 11.1) |
| Docker unavailable 503 response | HIGH | DONE (Prompt 11 & 11.1) |
| Expanded 17-test verification test suite | HIGH | DONE (Prompt 11.1) |
| Security audit & documentation correction pass | HIGH | DONE (Prompt 11.1) |

---

## FUTURE PHASES (Public Deployment Readiness)

Goal: Prepare ResumeForge for secure public cloud deployment.

| Task | Priority | Status |
|------|----------|--------|
| User authentication (NextAuth / Supabase) | HIGH | PENDING |
| Cloud PostgreSQL database persistence | HIGH | PENDING |
| Concurrency rate-limiting middleware | HIGH | PENDING |
| Compilation job queue & backpressure | HIGH | PENDING |
| Resizable panel layouts | MEDIUM | PENDING |
| Collaborative live editing | LOW | PENDING |

