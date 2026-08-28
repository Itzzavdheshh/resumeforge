# ResumeForge — Frontend Documentation

---

## Framework & Tooling

- **Next.js 16.3.3** using the **App Router**
- **React 19.2.8**
- **TypeScript 5**
- **Monaco Editor 4.7.0** (`@monaco-editor/react`)
- **Tailwind CSS v4** (configured via `@tailwindcss/postcss`)
- **Geist** and **Geist Mono** fonts loaded via `next/font/google`

---

## File Structure

```
app/
  layout.tsx            Root layout (server component — app metadata)
  page.tsx              Main workspace page (client component)
  globals.css           Global CSS: Tailwind import + CSS variables
  favicon.ico           Default Next.js favicon
  api/
    compile/
      route.ts          API route for LaTeX compilation with image asset support
components/
  FileTree.tsx          FileTree sidebar component (.tex + image assets)
  LatexEditor.tsx       Monaco Code Editor component (client component)
  ImageAssetView.tsx    Image preview panel, metadata card, and LaTeX snippet generator
lib/
  storage.ts            Isolated localStorage multi-file & asset persistence utility
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

---

## Multi-File & Asset Storage Architecture (`lib/storage.ts`)

**Storage Key**: `resumeforge:projects` (Legacy key: `resumeforge:document:main`)

**Stored Data Schemas**:
```typescript
export type ProjectFileType = "tex" | "image" | "asset";

export interface ProjectFile {
  id: string;
  name: string;       // e.g. "main.tex", "profile.png"
  path: string;       // e.g. "main.tex", "images/profile.png"
  type: ProjectFileType;
  content: string;    // UTF-8 text for tex, base64 Data URL for images
  mimeType?: string;  // e.g. "image/png", "image/jpeg"
  size?: number;      // File size in bytes
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string
}

export interface ResumeProject {
  id: string;
  name: string;
  files: ProjectFile[];
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
