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
  LatexEditor.tsx           Monaco Code Editor component (IDE active file tab, error markers, wrap/font toggles)
  LatexSnippetsMenu.tsx     Categorized LaTeX snippet dropdown with live instant search filtering
  ImageAssetView.tsx        Image preview panel, metadata card, and LaTeX snippet generator
  CompilerSettingsModal.tsx Compiler settings modal dialog (paper size, compilation passes)
lib/
  storage.ts                Isolated localStorage multi-file, asset & compiler settings storage
  zip.ts                    Client-side ZIP export and atomic import with security validation
  latexErrors.ts            pdflatex output parser — produces LatexError[] for Monaco markers
```

---

## Components Architecture

### 1. `components/AppHeader.tsx` — Workspace Header
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

### 2. `components/FileTree.tsx` — Sidebar File Explorer
- **Categories**: Displays `LaTeX Code` files (`📄`) and `Images` (`🖼`) grouped cleanly with item counts.
- **Actions Header**:
  - `+ File` button opens inline input for creating `.tex` files.
  - `+ Image` button opens file picker (`accept=".png,.jpg,.jpeg"`).
- **File Management**: Selects active file, displays root badge for `main.tex`, supports rename (`✎`) and delete (`✕`) for secondary `.tex` and image files. `main.tex` is protected from rename/delete. Hover actions stay hidden until item hover.

### 3. `components/LatexEditor.tsx` — Monaco LaTeX Code Editor
- **Engine**: Monaco Editor loaded dynamically on client (`ssr: false`).
- **IDE Tab Header**: Displays active file tab (`[📄 main.tex]` with `root` badge).
- **Toolbar**: `LatexSnippetsMenu` with search input, Word wrap toggle (`Wrap: On/Off`), Font size stepper (`A−`, `14px`, `A+`), and save status badge.
- **Error Markers** (`errors` prop): Accepts `LatexError[]` and maps them to `monaco.editor.IMarkerData` with `MarkerSeverity.Error` red squiggles on the precise error lines. Markers are filtered per-file via `activeFilePath` prop. On first error, the editor scrolls and positions the cursor at the error line automatically.

### 4. `components/LatexSnippetsMenu.tsx` — Live Search LaTeX Snippets
- **Search Header**: Live search input (`🔍 Search snippets...`) filters snippets instantly by label, description, or code across all categories.
- **7 categories**: Structure, Formatting, Lists, Tables, Resume, Math, Misc.
- **~35 snippets** with labels (monospace emerald), descriptions (muted), category tags, and raw body text.
- Click-outside, Escape key, and snippet selection close the menu.

### 5. `components/ImageAssetView.tsx` — Image Asset Preview Panel
- Rendered in center column when `activeFile.type === "image"`.
- **Image Preview**: Displays centered, responsive preview of the image asset.
- **Metadata Card**: Displays file name, MIME type (`image/png`, `image/jpeg`), and formatted size (`KB`/`MB`).
- **LaTeX Snippet Generator**: Renders copyable snippet `\includegraphics[width=0.4\textwidth]{images/photo.png}` with a `Copy LaTeX Snippet` button providing `Copied ✓` feedback.

### 6. `components/CompilerSettingsModal.tsx` — Compiler Settings Modal
- Modal UI with backdrop blur for per-project compiler settings:
  - **Paper Size**: Letter (`8.5" × 11"`) vs A4 (`210mm × 297mm`).
  - **Compilation Passes**: Single Pass (`1 pass`) vs Double Pass (`2 passes`).

---

## PDF Preview & Collapsible Error Diagnostics

- **PDF Header Badges**: Displays paper size and pass setting badges (`LETTER • 1 PASS` / `A4 • 2 PASSES`) and status indicator (`● Compiled PDF`, `● Last successful PDF`).
- **Empty State Card**: When no PDF is compiled yet, displays a clean card with document icon, title "No PDF Compiled Yet", and instructions ("Edit your LaTeX source code and click Compile or press Ctrl+Enter").
- **Collapsible Error Diagnostics**: When compilation fails, renders a top banner with error count and a `Compiler Diagnostics (N Errors) ▼ / ▲` toggle, allowing users to inspect build logs without losing preview visibility.
