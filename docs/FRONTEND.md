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
  page.tsx                  Main workspace page (client component)
  globals.css               Global CSS: Tailwind import + CSS variables
  favicon.ico               Default Next.js favicon
  api/
    compile/
      route.ts              API route for LaTeX compilation with multi-pass & paper size options
components/
  FileTree.tsx              FileTree sidebar component (.tex + image assets)
  LatexEditor.tsx           Monaco Code Editor component (client component)
  ImageAssetView.tsx        Image preview panel, metadata card, and LaTeX snippet generator
  CompilerSettingsModal.tsx Compiler settings modal (paper size, compilation passes)
lib/
  storage.ts                Isolated localStorage multi-file, asset & compiler settings storage
  zip.ts                    Client-side ZIP export and atomic import with security validation
```

---

## Components Architecture

### 1. `components/FileTree.tsx` — Sidebar File Explorer
- **Categories**: Displays `LaTeX Code` files (`📄`) and `Images` (`🖼`) grouped cleanly.
- **Actions**:
  - `+ Tex` button opens inline input for creating `.tex` files.
  - `+ Img` button opens file picker (`accept=".png,.jpg,.jpeg"`).
- **File Management**: Selects active file, displays root badge for `main.tex`, supports rename (`✎`) and delete (`✕`) for secondary `.tex` and image files. `main.tex` is protected from rename/delete.

### 2. `components/LatexEditor.tsx` — Monaco LaTeX Code Editor
- **Engine**: Monaco Editor loaded dynamically on client (`ssr: false`).
- **Features**: `stex` syntax tokenization, line numbers, word wrap toggle (`Wrap: On/Off`), font size scaling (`A−`, `14px`, `A+`), native search (`Ctrl+F`), and keyboard command overrides (`Ctrl+S`, `Ctrl+Enter`).

### 3. `components/ImageAssetView.tsx` — Image Asset Preview Panel
- Rendered in center column when `activeFile.type === "image"`.
- **Image Preview**: Displays centered, responsive preview of the image asset.
- **Metadata Card**: Displays file name, MIME type (`image/png`, `image/jpeg`), and formatted size (`KB`/`MB`).
- **LaTeX Snippet Generator**: Renders copyable snippet `\includegraphics[width=0.4\textwidth]{images/photo.png}` with a `Copy LaTeX Snippet` button providing `Copied ✓` feedback.

### 4. `components/CompilerSettingsModal.tsx` — Compiler Settings Modal
- Modal UI for configuring per-project compiler settings:
  - **Paper Size**: Letter (`8.5" × 11"`) vs A4 (`210mm × 297mm`).
  - **Compilation Passes**: Single Pass (`1 pass`) vs Double Pass (`2 passes`).

---

## ZIP Export & Import Architecture (`lib/zip.ts`)

- **Export (`exportProjectToZip`)**:
  - Iterates through `project.files`.
  - Writes `.tex` text files and converts base64 image Data URLs into binary `Uint8Array` files.
  - Generates binary `.zip` Blob downloaded as `<sanitized-project-name>.zip`.
- **Import (`importProjectFromZip`)**:
  - Validates upload size (< 10 MB).
  - Validates entry paths against path traversal (`../`, absolute paths, leading slashes).
  - Validates file extensions allowlist (`.tex`, `.png`, `.jpg`, `.jpeg`).
  - Enforces archive limits (20 MB max total extracted size, 5 MB max per file, 100 max files).
  - Enforces `main.tex` requirement.
  - Generates unique project name and imports cleanly.

---

## Multi-File, Asset & Settings Storage (`lib/storage.ts`)

**Storage Key**: `resumeforge:projects`

**Stored Data Schemas**:
```typescript
export type ProjectFileType = "tex" | "image" | "asset";

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: ProjectFileType;
  content: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompilerSettings {
  paperSize: "letter" | "a4";
  passes: 1 | 2;
}

export interface ResumeProject {
  id: string;
  name: string;
  files: ProjectFile[];
  settings?: CompilerSettings;
  createdAt: string;
  updatedAt: string;
}

export interface StoredProjects {
  version: 1;
  activeProjectId: string;
  projects: ResumeProject[];
}
```

---

## PDF Preview Isolation Rule

When switching projects or modifying project identity (create, switch, duplicate, delete, import):
1. Pending editor changes are saved to current project.
2. `activeProjectId` is updated.
3. Target project `main.tex` source is loaded into editor.
4. **`clearPdfState()` is called immediately**:
   - Revokes previous `pdfUrl` via `URL.revokeObjectURL`.
   - Sets `pdfUrl = null`.
   - Clears `errorDetails = null`.
   - Resets header status to `"Ready"`.
5. Download PDF button is disabled until explicit compilation occurs for the newly active project.
6. **File Switching Rule**: Switching files inside the SAME project retains the current PDF preview.
