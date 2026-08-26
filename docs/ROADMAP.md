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
**Status: IN PROGRESS**

Goal: Make the tool genuinely usable as a local development tool. No accounts, no cloud, just a working local LaTeX editor.

| Task | Priority | Status |
|------|----------|--------|
| PDF download button | HIGH | DONE (Prompt 2) |
| Source download button (.tex) | MEDIUM | PENDING |
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
**Status: NOT STARTED**

Goal: Replace the plain textarea with a proper code editor.

| Task | Priority |
|------|---------|
| Integrate Monaco Editor or CodeMirror | HIGH |
| LaTeX syntax highlighting | HIGH |
| Line numbers | HIGH |
| Editor line-wrap options | MEDIUM |
| Find/replace in editor | MEDIUM |
| Error line highlighting (from compiler output) | MEDIUM |
| Keyboard shortcuts native to the editor | LOW |
| Insert snippet menu (LaTeX commands) | LOW |

---

## PHASE 3 — Project Persistence & Multi-Document Management
**Status: NOT STARTED**

Goal: User's work is saved and can be recovered. Support multiple local resumes before adding user accounts.

| Task | Priority |
|------|---------|
| Multiple local resume projects (localStorage) | HIGH |
| Project selector / dropdown UI | HIGH |
| Rename / clone / delete local resume projects | MEDIUM |
| Multi-file support per project | MEDIUM |
| Multi-file support in compiler | MEDIUM |
| Image/asset upload per project | MEDIUM |
| Project settings (name, compiler engine) | LOW |
| Database implementation (PostgreSQL + Prisma) | FUTURE |
