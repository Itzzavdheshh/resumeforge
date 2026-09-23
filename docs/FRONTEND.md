# ResumeForge — Frontend Documentation

---

## Framework & Tooling

- **Next.js 16.3.3** using the **App Router**
- **React 19.2.8**
- **TypeScript 5**
- **Monaco Editor 4.7.0** (`@monaco-editor/react`)
- **JSZip 3.10.1** (`jszip` for client-side ZIP export/import)
- **Tailwind CSS v4** (configured via `@tailwindcss/postcss`)
- **Geist** and **Geist Mono** fonts loaded via `next/font/google`

---

## File Structure

```
app/
  layout.tsx                Root layout (server component — app metadata)
  page.tsx                  Main workspace page (3-panel IDE layout & state orchestrator)
  globals.css               Global CSS: Tailwind import + CSS variables
  favicon.ico               Default Next.js favicon
  api/
    compile/
      route.ts              API route for LaTeX compilation with multi-pass & paper size options
components/
  AppHeader.tsx             Top header with branding, Project Selector, File/Project menus, Save/Download/Compile actions
  FileTree.tsx              FileTree sidebar component (.tex + image assets with crisp IDE hierarchy & hover actions)
  LatexEditor.tsx           Monaco Code Editor component (responsive toolbar, truncated active file tab, error markers, wrap/font toggles) (Prompt 5 & 17)
  LatexSnippetsMenu.tsx     Categorized LaTeX snippet dropdown with live instant search filtering
  ImageAssetView.tsx        Image preview panel, metadata card, and LaTeX snippet generator
  CompilerSettingsModal.tsx Compiler settings modal dialog (paper size, compilation passes)
  TemplateGalleryModal.tsx  Template Gallery dialog & category filters (Prompt 13)
  WorkspaceLayout.tsx       Resizable/collapsible 3-panel layout manager (Prompt 12)
  GitHubModal.tsx           Multi-step GitHub Workspace modal: Account, Repos, Export, Compare/Pull, Viewport-aware layout (Prompt 14, 15, 16, 17)
lib/
  templates.ts              Bundled resume templates & SVG visual previews (Prompt 13)
  githubCompare.ts          Text line ending & image base64 normalization, 6-state file change classification engine (Prompt 16)
  github.ts                 GitHub API abstraction, types, and fetch helpers (Prompt 14, 15, 16)
  storage.ts                Isolated localStorage multi-file, asset, template, compiler settings & github metadata storage
  zip.ts                    Client-side ZIP export and atomic import with security validation
  latexErrors.ts            pdflatex output parser — produces LatexError[] for Monaco markers
  layoutStorage.ts          Workspace panel width & collapse state persistence (Prompt 12)
scripts/
  test-templates.ts        Automated template registry & compilation test runner (Prompt 13)
  test-github.ts           Automated GitHub security, export & read-only pull test runner (Prompt 14, 15, 16, 17)
```

---

## Components Architecture

### 1. `components/TemplateGalleryModal.tsx` — Template Gallery (Prompt 13)
- **Modal Overlay**: Backdrop blur with keyboard focus trap, autoFocus, and Escape key listener.
- **Category Tabs**: Filter templates dynamically by `All`, `Classic`, `Modern`, `Minimal`, or `Academic`.
- **Template Cards**:
  - Offline vector SVG mockup representing document layout structure.
  - Template Name, Category badge, Description, and Recommended Use Case badge.
  - Multi-file indicator badge for structured templates (`Modern`, `Academic`).
  - "Use Template →" primary action button.
- **Blank Project Action**: "Blank Project" button preserving clean document creation option.

### 2. `components/AppHeader.tsx` — Workspace Header
- **Branding**: Displays logo mark ("RF"), title ("ResumeForge"), and "LaTeX" workspace badge.
- **Project Selector Dropdown**: Shows active project name with dropdown listing all projects, active indicator, `+ New Resume`, `Rename Active Project`, `Duplicate Project`, and `Delete Active Project` (with danger styling).
- **Grouped Dropdown Menus**:
  - **File Menu**: `Import .tex` (triggers input), `Export .tex` (triggers single file download).
  - **Project Menu**: `Import Project (.zip)` (triggers archive upload), `Export Project (.zip)` (triggers zip download), `Compiler Settings` (opens modal).
- **Primary Actions & Status**:
  - Status string (`Ready`, `Compiling...`, `Saved`, `Compiled successfully`).
  - Save button with `Ctrl+S` shortcut badge & unsaved indicator dot.
  - Download PDF button (enabled when compiled PDF URL exists).
  - High-contrast Compile action button with spinner & `Ctrl+↵` shortcut badge.

### 3. `components/WorkspaceLayout.tsx` — Resizable 3-Panel Layout (Prompt 12)
- Replaces hardcoded flex layout with a fully resizable and collapsible 3-panel system:
  - Left panel: `FileTree` (resizable 160–400px, collapsible to 32px strip).
  - Center panel: `LatexEditor` / `ImageAssetView` (`flex-1 min-w-0`).
  - Right panel: `PDF Preview` (resizable 280–65% viewport, collapsible to 32px strip).
- Persists widths and collapse states in `resumeforge:layout` key.

---

## PDF Preview & Collapsible Error Diagnostics

- **PDF Header Badges**: Displays paper size and pass setting badges (`LETTER • 1 PASS` / `A4 • 2 PASSES`) and status indicator (`● Compiled PDF`, `● Last successful PDF`).
- **Empty State Card**: When no PDF is compiled yet, displays a clean card with document icon, title "No PDF Compiled Yet", and instructions ("Edit your LaTeX source code and click Compile or press Ctrl+Enter").
- **Collapsible Error Diagnostics**: When compilation fails, renders a top banner with error count and a `Compiler Diagnostics (N Errors) ▼ / ▲` toggle, allowing users to inspect build logs without losing preview visibility.
