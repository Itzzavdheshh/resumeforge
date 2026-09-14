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

---

## PHASE 1 — Usable Local Tool
**Status: COMPLETED**

Goal: Make the tool genuinely usable as a local development tool. No accounts, no cloud, just a working local LaTeX workspace.

---

## PHASE 2 — Better Editor
**Status: COMPLETED**

Goal: Replace the plain textarea with a proper code editor (Monaco Editor).

---

## PHASE 3 — Local Multi-Project Workspace & Document Management
**Status: COMPLETED (Local Storage)**

Goal: Support multiple local resume projects in `localStorage` with CRUD operations.

---

## PHASE 4 — Multi-File LaTeX Project Architecture
**Status: COMPLETED**

Goal: Allow modular multi-file LaTeX projects with a sidebar FileTree.

---

## PHASE 5 — Project Assets & Image Upload
**Status: COMPLETED**

Goal: Support image assets (`.png`, `.jpg`, `.jpeg`), image preview panel, and pdfLaTeX image compilation.

---

## PHASE 6 — ZIP Archives & Compiler Settings
**Status: COMPLETED**

Goal: Complete project export/import as `.zip` archives and support paper size and pass count settings.

---

## PHASE 7 — Monaco Error Highlighting & LaTeX Snippets
**Status: COMPLETED**

Goal: Integrate real-time pdflatex error log parsing, line markers, and LaTeX snippet insertion menu.

---

## PHASE 8 — Professional UI/UX Redesign & Workspace Polish
**Status: COMPLETED**

Goal: Transform workspace UI with unified application header, grouped menus, editor tab styling, snippets search, collapsible error panel, and polished design system.

---

## PHASE 9 — Docker Compiler Sandbox & Security Audit
**Status: COMPLETED**

Goal: Isolate LaTeX compilation inside an unprivileged Docker container (`resumeforge-compiler:latest`) with strict security flags, hard timeouts, 503 fallback, and full security audit.

---

## PHASE 10 — Professional Workspace Layout & Resizable Panels
**Status: COMPLETED (Prompt 12)**

Goal: Implement fully resizable and collapsible 3-panel layout system with mouse drag, keyboard accessibility, and `localStorage` state persistence (`resumeforge:layout`).

---

## PHASE 11 — LaTeX Template Gallery & New Project Onboarding
**Status: COMPLETED (Prompt 13)**

Goal: Provide bundled local resume templates (`Classic`, `Modern`, `Minimal`, `Academic`), offline vector SVG visual previews, template project creation flow, and automated test suite (`scripts/test-templates.ts`).

| Task | Priority | Status |
|------|----------|--------|
| Bundled template definitions (`lib/templates.ts`) | HIGH | DONE (Prompt 13) |
| Offline vector SVG visual preview mockups | HIGH | DONE (Prompt 13) |
| Multi-file template support (`Modern`, `Academic`) | HIGH | DONE (Prompt 13) |
| Template storage integration (`createProjectFromTemplate`) | HIGH | DONE (Prompt 13) |
| Template Gallery Modal (`TemplateGalleryModal.tsx`) | HIGH | DONE (Prompt 13) |
| Category filter tabs (`All`, `Classic`, `Modern`, `Minimal`, `Academic`) | MEDIUM | DONE (Prompt 13) |
| Quick blank project creation option | HIGH | DONE (Prompt 13) |
| Template independence & immutability | HIGH | DONE (Prompt 13) |
| 31-test automated suite & sandboxed LaTeX compilation | HIGH | DONE (Prompt 13) |

---

## FUTURE PHASES (Integrations & Cloud Readiness)

Goal: Prepare ResumeForge for cloud storage, integrations, and public deployment.

| Task | Priority | Target |
|------|----------|--------|
| GitHub Integration (Repo sync, commit/push, Gist export) | HIGH | Next Phase |
| Google Drive Integration (Sync, export PDF/ZIP to Drive) | HIGH | Planned |
| Cloud Database & Persistence (Supabase / PostgreSQL) | HIGH | Planned |
| User Authentication (NextAuth / Supabase Auth) | HIGH | Planned |
| Concurrency Rate-Limiting & Job Queue | HIGH | Planned |
