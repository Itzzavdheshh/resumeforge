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

**STAGE: Phase 13 — LaTeX Template Gallery & New Project Onboarding**

The project has completed its baseline compilation pipeline, PDF preview, client-side PDF download feature, manual bug fixes, browser `localStorage` document persistence, debounced autosave, typed save states, platform-aware keyboard shortcuts, updated application metadata, **Prompt 4 Local Multi-Project Workspace**, **Prompt 4.1 Unique Project Naming**, **Prompt 5 Professional Monaco LaTeX Code Editor**, **Prompt 6 Multi-File Project Architecture & FileTree**, **Prompt 7 Project Assets & Image Upload**, **Prompt 8 ZIP Project Archives & Compiler Options**, **Prompt 9 Monaco Error Highlighting & LaTeX Snippets**, **Prompt 10 Professional UI/UX Redesign & Workspace Polish**, **Prompt 11 Docker Compiler Sandbox & Isolation**, **Prompt 11.1 Security Audit & Verification**, **Prompt 11.2 Docker LaTeX Package Compatibility Fix**, **Prompt 12 Professional Workspace Layout & Resizable Panels**, and **Prompt 13 LaTeX Template Gallery & New Project Onboarding**.

---

## Current Status

| Area | Status |
|------|--------|
| Bundled Resume Template System (`lib/templates.ts`) | IMPLEMENTED (Prompt 13) |
| Template Gallery Modal (`TemplateGalleryModal.tsx`) | IMPLEMENTED (Prompt 13) |
| Classic Professional Template (`classic`) | IMPLEMENTED & VERIFIED (Prompt 13) |
| Modern Executive Multi-File Template (`modern`) | IMPLEMENTED & VERIFIED (Prompt 13) |
| Minimalist Standard Template (`minimal`) | IMPLEMENTED & VERIFIED (Prompt 13) |
| Academic CV Multi-File Template (`academic`) | IMPLEMENTED & VERIFIED (Prompt 13) |
| Offline Vector SVG Mockup Previews | IMPLEMENTED (Prompt 13) |
| Project Creation from Template (`createProjectFromTemplate`) | IMPLEMENTED & VERIFIED (Prompt 13) |
| Template Data Independence (Immutable Templates) | IMPLEMENTED & VERIFIED (Prompt 13) |
| Blank Project Creation Path | PRESERVED & INTEGRATED (Prompt 13) |
| Resizable Left Panel (FileTree) | IMPLEMENTED (Prompt 12) |
| Resizable Right Panel (PDF Preview) | IMPLEMENTED (Prompt 12) |
| Collapsible Left & Right Panels | IMPLEMENTED (Prompt 12) |
| Panel Width & Collapse Persistence (`resumeforge:layout`) | IMPLEMENTED (Prompt 12) |
| Docker Compiler Sandbox Isolation (`resumeforge-compiler:latest`) | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| Path Traversal Prevention (`resolveSecurePath`, `validateFilePath`) | IMPLEMENTED & AUDITED (Prompt 6, 7 & 11.1) |
| Project Asset Upload & Preview | IMPLEMENTED (Prompt 7) |
| Project Archive Export/Import (.zip) | IMPLEMENTED (Prompt 8) |
| Compiler Settings (Letter / A4, 1-Pass / 2-Pass) | IMPLEMENTED (Prompt 8) |
| Monaco LaTeX Code Editor + Error Highlighting | IMPLEMENTED (Prompt 5 & 9) |
| Multi-Project Storage (`resumeforge:projects`) | IMPLEMENTED (Prompt 4 & 4.1) |
| Cloud Persistence / database | NOT IMPLEMENTED |
| Authentication | NOT IMPLEMENTED |

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

---

## Current Task

**Prompt 13** — LaTeX Template Gallery & New Project Onboarding (COMPLETE).

---

## Template System Architecture (Prompt 13)

The template system is 100% local-first and bundled inside the application (`lib/templates.ts`). No remote calls, CDNs, or compilation calls occur when browsing templates.

### Templates

| Template ID | Name | Category | Structure | Recommended Use Case |
|-------------|------|----------|-----------|----------------------|
| `classic` | Classic Professional | Classic | Single file (`main.tex`) | Software Engineering, Business, Corporate |
| `modern` | Modern Executive | Modern | Multi-file (`main.tex` + 4 section files) | Product Management, Tech Leads, Designers |
| `minimal` | Minimalist Standard | Minimal | Single file (`main.tex`) | Systems Engineering, Minimalist aesthetics |
| `academic` | Academic CV | Academic | Multi-file (`main.tex` + 4 section files) | PhD Candidates, Researchers, Professors |

### Template Independence

When a user selects a template:
1. `createProjectFromTemplate(data, template)` deep-copies all template files with newly generated UUIDs and ISO timestamps.
2. The created project is appended to `localStorage` under `resumeforge:projects`.
3. Edits to the created project modify only that project's state. The bundled template definition remains immutable.
