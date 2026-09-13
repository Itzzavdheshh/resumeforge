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

**STAGE: Phase 12 — Professional Workspace Layout & Resizable Panels**

The project has completed its baseline compilation pipeline, PDF preview, client-side PDF download feature, manual bug fixes, browser `localStorage` document persistence, debounced autosave, typed save states, platform-aware keyboard shortcuts, updated application metadata, **Prompt 4 Local Multi-Project Workspace**, **Prompt 4.1 Unique Project Naming**, **Prompt 5 Professional Monaco LaTeX Code Editor**, **Prompt 6 Multi-File Project Architecture & FileTree**, **Prompt 7 Project Assets & Image Upload**, **Prompt 8 ZIP Project Archives & Compiler Options**, **Prompt 9 Monaco Error Highlighting & LaTeX Snippets**, **Prompt 10 Professional UI/UX Redesign & Workspace Polish**, **Prompt 11 Docker Compiler Sandbox & Isolation**, **Prompt 11.1 Security Audit & Verification**, **Prompt 11.2 Docker LaTeX Package Compatibility Fix**, and **Prompt 12 Professional Workspace Layout & Resizable Panels**.

---

## Current Status

| Area | Status |
|------|--------|
| Resizable Left Panel (FileTree) | IMPLEMENTED (Prompt 12) |
| Resizable Right Panel (PDF Preview) | IMPLEMENTED (Prompt 12) |
| Collapsible Left Panel (FileTree) | IMPLEMENTED (Prompt 12) |
| Collapsible Right Panel (PDF Preview) | IMPLEMENTED (Prompt 12) |
| Panel Collapse Strip (32px restore zone) | IMPLEMENTED (Prompt 12) |
| Drag Resize Handles (PanelDivider) | IMPLEMENTED (Prompt 12) |
| Document-Level Pointer Capture (safe drag) | IMPLEMENTED (Prompt 12) |
| Keyboard Resize (← / → on focused divider) | IMPLEMENTED (Prompt 12) |
| Panel Width Persistence (`resumeforge:layout`) | IMPLEMENTED (Prompt 12) |
| Panel Collapse Persistence | IMPLEMENTED (Prompt 12) |
| Width Constraints (left 160–400px, right 280–65vw) | IMPLEMENTED (Prompt 12) |
| Accessible Dividers (role=separator, aria-label) | IMPLEMENTED (Prompt 12) |
| Resize CSS Guard (body[data-resizing]) | IMPLEMENTED (Prompt 12) |
| Docker Compiler Sandbox Isolation (`resumeforge-compiler:latest`) | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| Container Network Disabling (`--net=none`) | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| Read-Only Root Filesystem (`--read-only`) | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| RAM Temp Disk (`--tmpfs /tmp:rw,noexec,nosuid,size=100m`) | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| Container Resource Limits (`-m 512m`, `--cpus=1.5`, `--pids-limit=64`) | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| Non-Root Container Execution (`--user 1000:1000`) | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| Scoped Host Volume Mounting (`${absoluteTempDir}:/workspace:rw`) | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| Container Auto-Cleanup (`--rm` + forced `docker kill` timer) | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| 15-Second Hard Timeout Enforcement | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| Docker Unavailable 503 Service Unavailable Response | IMPLEMENTED & AUDITED (Prompt 11 & 11.1) |
| Path Traversal Prevention (`resolveSecurePath`) | IMPLEMENTED & AUDITED (Prompt 6, 7 & 11.1) |
| 5 MB Image Size Limit Enforcement | IMPLEMENTED & AUDITED (Prompt 7 & 11.1) |
| Application Header (`AppHeader.tsx`) | IMPLEMENTED (Prompt 10) |
| Grouped File Menu (Import/Export .tex) | IMPLEMENTED (Prompt 10) |
| Grouped Project Menu (Import/Export .zip, Settings) | IMPLEMENTED (Prompt 10) |
| IDE Editor File Tab (`[📄 main.tex] [root]`) | IMPLEMENTED (Prompt 10) |
| Snippets Menu Live Instant Search | IMPLEMENTED (Prompt 10) |
| Collapsible Compiler Diagnostics Error Panel | IMPLEMENTED (Prompt 10) |
| PDF Preview Empty State Card | IMPLEMENTED (Prompt 10) |
| Paper Size & Pass Badges (`LETTER • 1 PASS`) | IMPLEMENTED (Prompt 10) |
| Button Design System (Primary/Secondary/Danger) | IMPLEMENTED (Prompt 10) |
| Modal System Backdrop Blur & Polish | IMPLEMENTED (Prompt 10) |
| Monaco Error Markers (red squiggles) | IMPLEMENTED (Prompt 9) |
| Cursor Auto-Jump to First Error Line | IMPLEMENTED (Prompt 9) |
| LaTeX Snippet Insertion Menu | IMPLEMENTED (Prompt 9) |
| pdflatex Error Log Parser (`latexErrors.ts`) | IMPLEMENTED (Prompt 9) |
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
| Multi-File Project Architecture (`project.files`) | IMPLEMENTED (Prompt 6) |
| FileTree Sidebar Component (`FileTree.tsx`) | IMPLEMENTED (Prompt 6) |
| Root `main.tex` Protection | IMPLEMENTED (Prompt 6) |
| Path Traversal Security Protection | IMPLEMENTED (Prompt 6) |
| Professional Code Editor (Monaco) | IMPLEMENTED (Prompt 5) |
| LaTeX Syntax Highlighting (`stex`) | IMPLEMENTED (Prompt 5) |
| Line Numbers & Active Line Highlight | IMPLEMENTED (Prompt 5) |
| Search Widget (`Ctrl+F` / `Cmd+F`) | IMPLEMENTED (Prompt 5) |
| Editor Command Overrides (`Ctrl+S`, `Ctrl+Enter`) | IMPLEMENTED (Prompt 5) |
| PDF Preview (iframe) | IMPLEMENTED |
| PDF Download Button (`<project-name>.pdf`) | IMPLEMENTED (Prompt 2) |
| Structured Compiler Error API (`error`, `details`) | IMPLEMENTED (Prompt 2.1) |
| Client-Side `localStorage` Persistence | IMPLEMENTED (Prompt 3) |
| Multi-Project Storage (`resumeforge:projects`) | IMPLEMENTED (Prompt 4) |
| Case-Insensitive Unique Project Names | IMPLEMENTED (Prompt 4.1) |
| Cloud Persistence / database | NOT IMPLEMENTED |
| Authentication | NOT IMPLEMENTED |
| Production Concurrency Rate Limiting | NOT IMPLEMENTED |

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

---

## Current Task

**Prompt 12** — Professional Workspace Layout & Resizable Panels (COMPLETE).

---

## Workspace Layout Architecture (Prompt 12)

The workspace uses a custom 3-panel layout system. No external panel library is used.

```
┌───────────────┬─┬───────────────────────┬─┬───────────────────┐
│  FileTree     │▌│   Monaco Editor       │▌│   PDF Preview     │
│  (resizable)  │ │   (fills remaining)   │ │   (resizable)     │
│  160–400px    │ │   flex-1 min-w-0      │ │   280–65vw        │
└───────────────┴─┴───────────────────────┴─┴───────────────────┘
                ▲                           ▲
           PanelDivider               PanelDivider
           (draggable)                (draggable)
```

### Files

| File | Role |
|------|------|
| `lib/layoutStorage.ts` | Loads/saves layout state from `localStorage` key `resumeforge:layout`. Separate from project data. Clamps widths on load. |
| `components/PanelDivider.tsx` | Draggable divider strip. Uses document-level `pointermove` capture. Keyboard-navigable (← / → = 16px nudge). `role="separator"`, `aria-orientation="vertical"`. |
| `components/WorkspaceLayout.tsx` | Layout manager. `useState` lazy initializer loads from localStorage (SSR-safe). Debounced save (200ms). Collapse strips are 32px. |

### Panel Constraints

| Panel | Min | Max |
|-------|-----|-----|
| FileTree (left) | 160px | 400px |
| PDF Preview (right) | 280px | 65% of window width |
| Editor (center) | `flex-1 min-w-0` (auto) | auto |

### Collapse Behavior

- Collapsing a panel saves the current width to a ref and reduces the panel to a 32px strip.
- The strip shows a chevron restore button and a rotated panel label.
- Restoring expands the panel back to the saved width.
- Both collapsed state and width are persisted in `resumeforge:layout`.

### CSS Guard

`body[data-resizing]` is set during drag. This forces `col-resize` cursor globally, disables `user-select` and `pointer-events` on all children, preventing Monaco text selection and iframe interaction during drag. The `PanelDivider` element retains pointer events.

### Known Limitations

- No panel resizing below the editor's intrinsic minimum width (Monaco requires ~200px to remain usable — enforced by browser layout, not by explicit constraint).
- On very narrow viewports (< 800px) all three panels will be cramped. This is considered an acceptable degradation for a desktop-primary tool.
- The iframe PDF preview does not receive pointer events during drag (by CSS design) — this is correct behavior.
