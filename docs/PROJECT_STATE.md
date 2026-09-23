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

**STAGE: Phase 16 — GitHub Repository Pull & Remote Change Detection**

The project has completed its baseline compilation pipeline, PDF preview, client-side PDF download feature, manual bug fixes, browser `localStorage` document persistence, debounced autosave, typed save states, platform-aware keyboard shortcuts, updated application metadata, **Prompt 4 Local Multi-Project Workspace**, **Prompt 4.1 Unique Project Naming**, **Prompt 5 Professional Monaco LaTeX Code Editor**, **Prompt 6 Multi-File Project Architecture & FileTree**, **Prompt 7 Project Assets & Image Upload**, **Prompt 8 ZIP Project Archives & Compiler Options**, **Prompt 9 Monaco Error Highlighting & LaTeX Snippets**, **Prompt 10 Professional UI/UX Redesign & Workspace Polish**, **Prompt 11 Docker Compiler Sandbox & Isolation**, **Prompt 11.1 Security Audit & Verification**, **Prompt 11.2 Docker LaTeX Package Compatibility Fix**, **Prompt 12 Professional Workspace Layout & Resizable Panels**, **Prompt 13 LaTeX Template Gallery & New Project Onboarding**, **Prompt 14 GitHub Integration Foundation & Secure Account Connection**, **Prompt 15 GitHub Repository Integration & Safe Project Export**, and **Prompt 16 GitHub Repository Pull & Remote Change Detection**.

---

## Current Status

| Area | Status |
|------|--------|
| GitHub Remote Inspection & Pull API (`/api/github/repos/pull`) | IMPLEMENTED & VERIFIED (Prompt 16) |
| Line Ending & Base64 Normalization (`lib/githubCompare.ts`) | IMPLEMENTED & VERIFIED (Prompt 16) |
| 6-State Change Classification Engine (`lib/githubCompare.ts`) | IMPLEMENTED & VERIFIED (Prompt 16) |
| Non-Destructive Read-Only Security Boundary | VERIFIED (Prompt 16) |
| Remote Inspection UI & Status Pills (`GitHubModal.tsx`) | IMPLEMENTED & VERIFIED (Prompt 16) |
| GitHub Repository Selection & Creation (`/api/github/repos`) | IMPLEMENTED & VERIFIED (Prompt 15) |
| Target Repository Inspection & Overwrite Safety (`/api/github/repos/inspect`) | IMPLEMENTED & VERIFIED (Prompt 15) |
| Atomic Git Tree & Commit Project Export (`/api/github/export`) | IMPLEMENTED & VERIFIED (Prompt 15) |
| Binary Base64 Image Decoding for GitHub API | IMPLEMENTED & VERIFIED (Prompt 15) |
| Project Repository Metadata Persistence (`github?: ProjectGitHubMetadata`) | IMPLEMENTED & VERIFIED (Prompt 15) |
| Multi-Step GitHub Workspace Modal (`GitHubModal.tsx`) | IMPLEMENTED & VERIFIED (Prompt 15 & 16) |
| GitHub Scope Upgrade (`repo` scope) | IMPLEMENTED & VERIFIED (Prompt 15) |
| Automated Test Suite (`scripts/test-github.ts`, 32/32 PASSED) | VERIFIED (Prompt 16) |
| GitHub Account Connection (`GitHubModal.tsx`) | IMPLEMENTED (Prompt 14) |
| GitHub OAuth 2.0 Flow (`/api/github/login`, `/api/github/callback`) | IMPLEMENTED & VERIFIED (Prompt 14) |
| HTTP-Only Session Cookie Token Storage (`github_access_token`) | IMPLEMENTED & AUDITED (Prompt 14) |
| Local-First Optional GitHub Integration | VERIFIED (Prompt 14, 15, 16) |
| Bundled Resume Template System (`lib/templates.ts`) | IMPLEMENTED (Prompt 13) |
| Template Gallery Modal (`TemplateGalleryModal.tsx`) | IMPLEMENTED (Prompt 13) |
| Resizable 3-Panel Workspace Layout (`WorkspaceLayout.tsx`) | IMPLEMENTED (Prompt 12) |
| Docker Compiler Sandbox Isolation (`resumeforge-compiler:latest`) | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| Multi-Project Storage (`resumeforge:projects`) | IMPLEMENTED (Prompt 4 & 4.1) |
| GitHub Conflict Detection & Side-by-Side Diff | NOT IMPLEMENTED (Planned Prompt 17) |
| Google Drive Integration | NOT IMPLEMENTED (Planned) |
| Cloud Database Persistence | NOT IMPLEMENTED (Planned) |

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
| Prompt 9 | 2026-08-31 | pdflatex error log parser (`latexErrors.ts`), Monaco error markers + cursor jump, LaTeX snippets dropdown menu (`LatexSnippetsMenu.tsx`) |
| Prompt 10 | 2026-09-07 | Application header extraction (`AppHeader.tsx`), File/Project grouped menus, IDE file tab styling, snippets live search, PDF empty state card, collapsible diagnostics panel, design system polish |
| Prompt 11 | 2026-09-09 | Docker compiler sandbox container (`resumeforge-compiler:latest`), container isolation flags (`--net=none`, `--read-only`, `-m 512m`, `--cpus=1.5`, `--pids-limit=64`), non-root execution (`latexuser`), 15s hard timeout, 503 fallback |
| Prompt 11.1 | 2026-09-11 | Security verification audit, 17-test expanded automated test suite, Docker version/image audit (Debian Bookworm TeX Live 2022), host filesystem & network isolation verification, documentation correction pass |
| Prompt 11.2 | 2026-09-11 | Docker LaTeX package fix (`texlive-latex-extra`, `texlive-fonts-extra`), real resume compilation verified through `/api/compile`, base64 data URI stripping fix |
| Prompt 12 | 2026-09-13 | Resizable/collapsible 3-panel workspace layout: `lib/layoutStorage.ts`, `components/PanelDivider.tsx`, `components/WorkspaceLayout.tsx`; `body[data-resizing]` CSS guard; panel width+collapse persistence in dedicated `resumeforge:layout` localStorage key |
| Prompt 13 | 2026-09-14 | LaTeX Template Gallery & New Project Onboarding: `lib/templates.ts`, `components/TemplateGalleryModal.tsx`, `createProjectFromTemplate` storage helper, 4 built-in templates (Classic, Modern, Minimal, Academic) with vector SVG previews, 31-test automated suite (`scripts/test-templates.ts`). |
| Prompt 14 | 2026-09-15 | GitHub Integration Foundation & Secure Account Connection: `lib/github.ts`, `components/GitHubModal.tsx`, `/api/github/login`, `/api/github/callback`, `/api/github/user`, `/api/github/logout`, HTTP-only cookie session storage, CSRF `state` parameter validation, 11-test automated suite (`scripts/test-github.ts`). |
| Prompt 15 | 2026-09-16 | GitHub Repository Integration & Safe ResumeForge Project Export: `GET/POST /api/github/repos`, `GET /api/github/repos/inspect`, `POST /api/github/export`, atomic Git Database API commit creation, base64 binary image decoding, path traversal rejection, existing repo file overwrite protection, non-secret project repo metadata link (`github?: ProjectGitHubMetadata`), multi-step `GitHubModal.tsx`, 21-test automated suite (`scripts/test-github.ts`). |

---

## Current Task

**Prompt 15** — GitHub Repository Integration & Safe ResumeForge Project Export (COMPLETE).

---

## GitHub Security & Architecture (Prompt 14)

The GitHub integration foundation is 100% local-first and optional. Access tokens are stored exclusively in HTTP-only cookies managed server-side. No credentials or PATs are ever saved to `localStorage` or accessible to browser JavaScript.

### Key Endpoint Matrix

| Endpoint | Method | Role | Cookie Operations |
|----------|--------|------|-------------------|
| `/api/github/login` | GET | Initiates OAuth flow, sets CSRF state | Sets `github_oauth_state` (10m TTL) |
| `/api/github/callback` | GET | Validates CSRF state, exchanges code for token | Deletes `github_oauth_state`, Sets `github_access_token` (30d TTL) |
| `/api/github/user` | GET | Reads session cookie, fetches `@username` from GitHub API | Clears `github_access_token` if 401 Unauthorized |
| `/api/github/logout` | POST | Disconnects GitHub session | Deletes `github_access_token` and `github_oauth_state` |
