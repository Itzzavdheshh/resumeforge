# ResumeForge — Development Roadmap

---

## Roadmap Philosophy

ResumeForge is built **incrementally, in small testable steps**.

Each phase produces working, testable software. No phase skips ahead to future features until previous phases are solid.

The roadmap is adjusted as the project evolves — it is a plan, not a contract.

---

## PHASE 0 — Foundation
**Status: IN PROGRESS**

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
| Fix ESLint `no-explicit-any` error | PENDING |
| Fix blob URL memory leak | PENDING |
| Update page metadata (title, description) | PENDING |
| Configurable compiler path (env variable) | PENDING |

---

## PHASE 1 — Usable Local Tool
**Status: NOT STARTED**

Goal: Make the tool genuinely usable as a local development tool. No accounts, no cloud, just a working local LaTeX editor.

| Task | Priority |
|------|---------|
| PDF download button | HIGH |
| Source download button (.tex) | MEDIUM |
| Compiler path via environment variable | HIGH |
| Fix Save button (localStorage at minimum) | HIGH |
| Compile button disabled during compilation | HIGH |
| Loading indicator during compilation | HIGH |
| Keyboard shortcut: Ctrl+Enter to compile | MEDIUM |
| Keyboard shortcut: Ctrl+S to save | MEDIUM |
| Formatted error display (not raw pdfLaTeX log) | HIGH |
| Update page title and metadata | LOW |
| Basic README with actual project description | LOW |

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

## PHASE 3 — Project Persistence
**Status: NOT STARTED**

Goal: User's work is saved and can be recovered. No user accounts yet — projects are browser-local or anonymous.

| Task | Priority |
|------|---------|
| Define data model for projects | HIGH |
| Implement database (PostgreSQL + Prisma) | HIGH |
| Save project to database on change (autosave) | HIGH |
| Load project from database on page load | HIGH |
| Multiple files per project | MEDIUM |
| Multi-file support in compiler | MEDIUM |
| Image/asset upload per project | MEDIUM |
| Project settings (name, compiler engine) | LOW |

---

## PHASE 4 — Better Compilation
**Status: NOT STARTED**

Goal: Make compilation more robust and informative.

| Task | Priority |
|------|---------|
| Multi-pass compilation (2–3 runs) | HIGH |
| BibTeX / Biber support | MEDIUM |
| Full compiler log viewer | HIGH |
| Structured error extraction (file, line, type) | MEDIUM |
| Choice of compiler engine (pdfLaTeX / XeLaTeX / LuaLaTeX) | LOW |
| Compilation history (last N compile attempts) | LOW |

---

## PHASE 5 — User Accounts
**Status: NOT STARTED**

Goal: Users can create accounts, log in, and own their resumes.

| Task | Priority |
|------|---------|
| Authentication system (NextAuth or Clerk) | HIGH |
| User registration and login | HIGH |
| Projects associated with user accounts | HIGH |
| Session management | HIGH |
| Password reset | MEDIUM |
| Email verification | MEDIUM |
| OAuth (Google, GitHub) | LOW |

---

## PHASE 6 — Production Compiler
**Status: NOT STARTED**

Goal: Compilation is safe, isolated, and not tied to the developer's machine.

> This phase is required before any public deployment.

| Task | Priority |
|------|---------|
| Docker-based compilation environment | CRITICAL |
| Network isolation in compiler container | CRITICAL |
| CPU and memory limits | CRITICAL |
| Rate limiting | CRITICAL |
| Compilation queue (BullMQ or equivalent) | HIGH |
| Object storage for PDFs and logs | HIGH |
| Compiler path via environment config | HIGH |
| Compilation timeout at queue level | HIGH |

---

## PHASE 7 — Version History
**Status: NOT STARTED**

Goal: Users can view and restore previous versions of their resumes.

| Task | Priority |
|------|---------|
| Auto-snapshot on save | HIGH |
| Version list UI | HIGH |
| Diff viewer (side-by-side or inline) | MEDIUM |
| Restore to specific version | HIGH |
| Manual version labels ("version 2 — job apps") | LOW |
| Version storage in object storage | HIGH |

---

## PHASE 8 — Templates
**Status: NOT STARTED**

Goal: Users can start from a professional template.

| Task | Priority |
|------|---------|
| Template data model | HIGH |
| Template picker UI on new project | HIGH |
| 3–5 built-in resume templates | HIGH |
| Template preview before use | MEDIUM |
| Community templates (future) | LOW |

---

## PHASE 9 — Import & Export
**Status: NOT STARTED**

Goal: Users can bring in existing work.

| Task | Priority |
|------|---------|
| Import a single `.tex` file | HIGH |
| Import a `.zip` project archive | MEDIUM |
| Export project as `.zip` | MEDIUM |
| Export project to GitHub (push to repo) | LOW |
| Export project to Google Drive | LOW |

---

## PHASE 10 — Sharing
**Status: NOT STARTED**

Goal: Users can share their resumes publicly.

| Task | Priority |
|------|---------|
| Public PDF sharing link | HIGH |
| Shareable HTML resume page | MEDIUM |
| Privacy controls (public/private) | HIGH |
| Custom sharing slug | LOW |

---

## PHASE 11 — AI Assistance
**Status: NOT STARTED**

Goal: AI helps users write better resumes.

| Task | Priority |
|------|---------|
| AI LaTeX generation from prompt | MEDIUM |
| AI resume content suggestions | MEDIUM |
| AI grammar and phrasing improvements | LOW |
| AI ATS (applicant tracking system) optimization | LOW |

---

## Notes

- Phases are ordered by logical dependency, not necessarily by calendar time
- Each phase should be completed incrementally — break it into individual prompts/tasks
- Security (Phase 6) must be completed before any public deployment, even if features from later phases are partially built
- Phase ordering may be adjusted based on user feedback and product priorities
