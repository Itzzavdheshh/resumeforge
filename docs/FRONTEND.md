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
  layout.tsx      Root layout (server component — app metadata)
  page.tsx        Main workspace page (client component)
  globals.css     Global CSS: Tailwind import + CSS variables
  favicon.ico     Default Next.js favicon
  api/
    compile/
      route.ts    API route for LaTeX compilation
components/
  LatexEditor.tsx Monaco Code Editor component (client component)
lib/
  storage.ts      Isolated localStorage multi-project persistence utility
```

---

## Code Editor Architecture (`components/LatexEditor.tsx`)

**Technology**: Monaco Editor (`@monaco-editor/react`) dynamically loaded on the client side via `next/dynamic` (`ssr: false`).

**Features**:
- **Language Tokenization**: `stex` / `latex` syntax highlighting for LaTeX commands (`\documentclass`, `\begin`, `\end`, `\section`, `\textbf`, `\item`), comments (`%`), braces (`{}`), brackets (`[]`), and parameters.
- **Line Numbers & Line Highlights**: Active line highlighting and synchronized line numbers.
- **Word Wrap Toggle**: Header option to toggle between `Wrap: On` and `Wrap: Off`.
- **Font Scaling**: `A−` / `A+` controls to adjust editor font size dynamically between 11px and 20px.
- **Search Widget**: Pressing `Ctrl+F` / `Cmd+F` opens Monaco's native search bar.
- **Command Overrides**: Inside Monaco, `editor.addCommand()` intercepts `Ctrl+S` / `Cmd+S` and `Ctrl+Enter` / `Cmd+Enter`, executing ResumeForge Save and Compile handlers.
- **Diagnostic Markers Preparation**: Monaco model markers (`monaco.editor.setModelMarkers`) prepared for future compiler error line decorations in Prompt 7.

---

## Multi-Project Storage Architecture (`lib/storage.ts`)

**Storage Key**: `resumeforge:projects` (Legacy key: `resumeforge:document:main`)

**Stored Data Schemas**:
```typescript
export interface ResumeProject {
  id: string;
  name: string;
  latex: string;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface StoredProjects {
  version: 1;
  activeProjectId: string;
  projects: ResumeProject[];
}
```

---

## Components

### `app/layout.tsx` — Root Layout

**Type**: Server Component (default in App Router)

**Metadata**:
```typescript
export const metadata: Metadata = {
  title: "ResumeForge — LaTeX Resume Workspace",
  description: "A browser-based LaTeX resume editor and PDF workspace.",
};
```

---

### `app/page.tsx` — Main Workspace Page

**Type**: Client Component (`"use client"`)

---

## PDF Preview Isolation Rule

When switching projects or modifying project identity (create, switch, duplicate, delete, import):
1. Pending editor changes are saved to current project.
2. `activeProjectId` is updated.
3. Target project `latex` source is loaded into editor.
4. **`clearPdfState()` is called immediately**:
   - Revokes previous `pdfUrl` via `URL.revokeObjectURL`.
   - Sets `pdfUrl = null`.
   - Clears `errorDetails = null`.
   - Resets header status to `"Ready"`.
5. Download PDF button is disabled until explicit compilation occurs for the newly active project.
