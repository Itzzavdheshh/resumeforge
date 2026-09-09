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

**STAGE: Phase 10 — Professional UI/UX Redesign & Workspace Polish**

The project has completed its baseline compilation pipeline, PDF preview, client-side PDF download feature, manual bug fixes, browser `localStorage` document persistence, debounced autosave, typed save states, platform-aware keyboard shortcuts, updated application metadata, **Prompt 4 Local Multi-Project Workspace**, **Prompt 4.1 Unique Project Naming**, **Prompt 5 Professional Monaco LaTeX Code Editor**, **Prompt 6 Multi-File Project Architecture & FileTree**, **Prompt 7 Project Assets & Image Upload**, **Prompt 8 ZIP Project Archives & Compiler Options**, **Prompt 9 Monaco Error Highlighting & LaTeX Snippets**, and **Prompt 10 Professional UI/UX Redesign & Workspace Polish** (`AppHeader` grouped File/Project menus, IDE editor tab styling, `LatexSnippetsMenu` live search, collapsible compiler diagnostics panel, uncompiled PDF empty state cards, paper/pass status badges, button design system, settings modal polish, tooltips, responsive layout).

---

## Current Status

| Area | Status |
|------|--------|
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
| Image Size Validation (2 MB LocalStorage / 5 MB API) | IMPLEMENTED (Prompt 7) |
| Server-Side Image Base64 Decoding (`route.ts`) | IMPLEMENTED (Prompt 7) |
| Multi-File Project Architecture (`project.files`) | IMPLEMENTED (Prompt 6) |
| FileTree Sidebar Component (`FileTree.tsx`) | IMPLEMENTED (Prompt 6) |
| Root `main.tex` Protection | IMPLEMENTED (Prompt 6) |
| File-Level Editor & Preview Switching | IMPLEMENTED (Prompt 6) |
| Path Traversal Security Protection | IMPLEMENTED (Prompt 6) |
| Professional Code Editor (Monaco) | IMPLEMENTED (Prompt 5) |
| LaTeX Syntax Highlighting (`stex`) | IMPLEMENTED (Prompt 5) |
| Line Numbers & Active Line Highlight | IMPLEMENTED (Prompt 5) |
| Word Wrap Toggle & Font Size Scaling | IMPLEMENTED (Prompt 5) |
| Search Widget (`Ctrl+F` / `Cmd+F`) | IMPLEMENTED (Prompt 5) |
| Bracket Matching | IMPLEMENTED (Prompt 5) |
| Editor Command Overrides (`Ctrl+S`, `Ctrl+Enter`) | IMPLEMENTED (Prompt 5) |
| Compile button → API | IMPLEMENTED |
| Server-Side LaTeX Compilation (pdfLaTeX) | IMPLEMENTED |
| PDF Preview (iframe) | IMPLEMENTED |
| PDF Download Button (`<project-name>.pdf`) | IMPLEMENTED (Prompt 2) |
| Blob URL Memory Management | IMPLEMENTED (Prompt 2) |
| Compilation State Guard (`isCompiling`) | IMPLEMENTED (Prompt 2) |
| Structured Compiler Error API (`error`, `details`) | IMPLEMENTED (Prompt 2.1) |
| Client-Side `localStorage` Persistence | IMPLEMENTED (Prompt 3) |
| Document Restore on Page Load | IMPLEMENTED (Prompt 3) |
| Debounced Autosave (1000ms) | IMPLEMENTED (Prompt 3) |
| Keyboard Shortcuts (`Ctrl+S`, `Ctrl+Enter`) | IMPLEMENTED (Prompt 3 & 5) |
| Multi-Project Storage (`resumeforge:projects`) | IMPLEMENTED (Prompt 4) |
| Automatic Prompt 3 Data Migration | IMPLEMENTED (Prompt 4) |
| Case-Insensitive Unique Project Names | IMPLEMENTED (Prompt 4.1) |
| Create / Rename / Duplicate / Delete Projects | IMPLEMENTED (Prompt 4 & 4.1) |
| Export `.tex` Source File Download | IMPLEMENTED (Prompt 4 & 6) |
| Import `.tex` Local File Picker | IMPLEMENTED (Prompt 4) |
| Strict PDF Preview Isolation across Projects | IMPLEMENTED (Prompt 4) |
| Cloud Persistence / database | NOT IMPLEMENTED |
| Authentication | NOT IMPLEMENTED |
| Version history | NOT IMPLEMENTED |
| Production Docker Sandbox Isolation | NOT IMPLEMENTED |

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

---

## Current Task

**Prompt 10** — Professional UI/UX Redesign & Workspace Polish (COMPLETE).
