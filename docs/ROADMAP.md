# ResumeForge — Development Roadmap

---

## Roadmap Philosophy

ResumeForge is built **incrementally, in small testable steps**.

Each phase produces working, testable software. No phase skips ahead to future features until previous phases are solid.

The roadmap is adjusted as the project evolves — it is a plan, not a contract.

---

## PHASE 0 — Foundation
**Status: COMPLETED** (Prompt 1)

Goal: Establish the project baseline, tooling, and documentation.

---

## PHASE 1 — Usable Local Tool
**Status: COMPLETED** (Prompts 2, 2.1 & 3)

Goal: Make the tool genuinely usable as a local development tool with PDF download and localStorage document persistence.

---

## PHASE 2 — Better Editor
**Status: COMPLETED** (Prompt 5)

Goal: Replace plain textareas with Monaco Editor (`@monaco-editor/react`, `stex` syntax highlighting, line numbers, word wrap, search).

---

## PHASE 3 — Local Multi-Project Workspace
**Status: COMPLETED** (Prompts 4 & 4.1)

Goal: Support multiple local resume projects in `localStorage` with project CRUD and unique naming.

---

## PHASE 4 — Multi-File LaTeX Project Architecture
**Status: COMPLETED** (Prompt 6)

Goal: Allow modular multi-file LaTeX projects with a sidebar FileTree.

---

## PHASE 5 — Project Assets & Image Upload
**Status: COMPLETED** (Prompt 7)

Goal: Support image assets (`.png`, `.jpg`, `.jpeg`), image preview panel, and pdfLaTeX image compilation.

---

## PHASE 6 — ZIP Archives & Compiler Settings
**Status: COMPLETED** (Prompt 8)

Goal: Complete project export/import as `.zip` archives and support paper size (Letter/A4) and pass count settings.

---

## PHASE 7 — Monaco Error Highlighting & LaTeX Snippets
**Status: COMPLETED** (Prompt 9)

Goal: Integrate real-time pdflatex error log parsing, line markers, and LaTeX snippet insertion menu.

---

## PHASE 8 — Professional UI/UX Redesign & Workspace Polish
**Status: COMPLETED** (Prompt 10)

Goal: Transform workspace UI with unified application header, grouped menus, editor tab styling, snippets search, collapsible error panel, and polished design system.

---

## PHASE 9 — Docker Compiler Sandbox & Security Audit
**Status: COMPLETED** (Prompts 11, 11.1 & 11.2)

Goal: Isolate LaTeX compilation inside an unprivileged Docker container (`resumeforge-compiler:latest`) with strict security flags, hard timeouts, 503 fallback, and full security audit.

---

## PHASE 10 — Professional Workspace Layout & Resizable Panels
**Status: COMPLETED** (Prompt 12)

Goal: Implement fully resizable and collapsible 3-panel layout system with mouse drag, keyboard accessibility, and `localStorage` state persistence (`resumeforge:layout`).

---

## PHASE 11 — LaTeX Template Gallery & New Project Onboarding
**Status: COMPLETED** (Prompt 13)

Goal: Provide bundled local resume templates (`Classic`, `Modern`, `Minimal`, `Academic`), offline vector SVG visual previews, template project creation flow, and automated test suite (`scripts/test-templates.ts`).

---

## PHASE 12 — GitHub Integration Foundation & Secure Connection
**Status: COMPLETED** (Prompt 14)

Goal: Establish secure, local-first GitHub account connection using OAuth 2.0 with HTTP-only session cookies and CSRF state protection.

| Task | Priority | Status |
|------|----------|--------|
| GitHub OAuth client abstraction (`lib/github.ts`) | HIGH | DONE (Prompt 14) |
| OAuth login redirect & CSRF state (`/api/github/login`) | HIGH | DONE (Prompt 14) |
| OAuth callback & HTTP-only token exchange (`/api/github/callback`) | HIGH | DONE (Prompt 14) |
| Authenticated user endpoint (`/api/github/user`) | HIGH | DONE (Prompt 14) |
| Account disconnect endpoint (`/api/github/logout`) | HIGH | DONE (Prompt 14) |
| GitHub connection modal (`GitHubModal.tsx`) | HIGH | DONE (Prompt 14) |
| AppHeader status indicator & menu action | HIGH | DONE (Prompt 14) |
| Local-first optional integration preservation | HIGH | DONE (Prompt 14) |
| Automated OAuth security test suite (`scripts/test-github.ts`) | HIGH | DONE (Prompt 14) |

---

## PHASE 13 — GitHub Repository Integration & Safe Project Export
**Status: COMPLETED** (Prompt 15)

Goal: Provide repository discovery, creation, path traversal safety, binary image base64 decoding, file overwrite warnings, atomic Git Database commit API, non-secret linked repo metadata, and multi-step UI workspace modal.

| Task | Priority | Status |
|------|----------|--------|
| Scope upgrade to `repo` scope | HIGH | DONE (Prompt 15) |
| Repository listing & creation API (`/api/github/repos`) | HIGH | DONE (Prompt 15) |
| Target repository inspection & overwrite safety (`/api/github/repos/inspect`) | HIGH | DONE (Prompt 15) |
| Atomic Git Database API project export (`/api/github/export`) | HIGH | DONE (Prompt 15) |
| Base64 binary image decoding for image assets | HIGH | DONE (Prompt 15) |
| Path security validation (`../`, absolute paths, `.env.local`, `.git`) | HIGH | DONE (Prompt 15) |
| Non-secret project repository metadata link (`github?: ProjectGitHubMetadata`) | HIGH | DONE (Prompt 15) |
| Multi-step GitHub Workspace UI (`GitHubModal.tsx`) | HIGH | DONE (Prompt 15) |
| Automated export security test suite (`scripts/test-github.ts`, 21/21 PASSED) | HIGH | DONE (Prompt 15) |

---

## FUTURE PHASES (Integrations & Cloud Roadmap)

Goal: Expand ResumeForge with integrations and cloud persistence while preserving local-first capabilities.

### PHASE 14 — GitHub Gist Export & Bidirectional Synchronization (Prompt 16)
- One-click export of main resume file / snippets to GitHub Gist
- GitHub repository pull & diff detection
- Conflict resolution UI (keep local vs overwrite from remote)
- Automatic background commit & sync toggle

### PHASE 15 — Google Drive Integration
- Authorize Google account via OAuth 2.0
- Automatic PDF upload / backup to Google Drive
- Export project ZIP archives directly to Google Drive
- Restore projects from Google Drive backup

### PHASE 16 — Cloud Database & Multi-Device Persistence
- User authentication (NextAuth / Supabase Auth)
- Cloud PostgreSQL persistence (Supabase / Prisma)
- Automatic background sync between local storage and cloud database

### PHASE 17 — Production Security & Infrastructure
- Concurrency rate-limiting middleware & compilation queue
- Production deployment configuration (Vercel / Docker host)

