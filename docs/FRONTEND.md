# ResumeForge — Frontend Documentation

---

## Framework & Tooling

- **Next.js 16.3.3** using the **App Router**
- **React 19.2.8**
- **TypeScript 5**
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
lib/
  storage.ts      Isolated localStorage multi-project persistence utility
```

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

**Functions**:
- `loadProjectsData(): StoredProjects | null` — Safely loads saved projects dataset. Checks `resumeforge:projects`. If missing, automatically migrates legacy `resumeforge:document:main` data to `"My Resume"` without data loss.
- `saveProjectsData(data: StoredProjects): boolean` — Writes `StoredProjects` dataset to `localStorage`.
- `createProject(data, name, content)` — Creates new project with unique ID (`crypto.randomUUID()`), adds to list, and sets active.
- `updateActiveProjectContent(data, latex)` — Updates `latex` and `updatedAt` for the active project.
- `renameProject(data, projectId, newName)` — Renames project.
- `duplicateProject(data, projectId)` — Clones project content to `"<Name> Copy"` with a new unique ID.
- `deleteProject(data, projectId)` — Deletes project (guaranteed to leave at least 1 project).
- `sanitizeFilename(name)` — Cleans project name for safe `.tex` / `.pdf` file downloads.

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

**State**:

| State variable | Type | Initial value | Purpose |
|---------------|------|---------------|---------|
| `projectsData` | `StoredProjects \| null` | `null` | Full multi-project dataset |
| `latex` | `string` | `initialLatexSample` | Current LaTeX source in editor |
| `lastSavedLatex` | `string` | `initialLatexSample` | Benchmark LaTeX source matching latest save |
| `status` | `string` | `"Ready"` | Compact status text shown in header |
| `saveStatus` | `SaveStatus` | `"saved"` | Document save state (`saved`, `unsaved`, `saving`, `error`) |
| `lastSavedAt` | `string \| null` | `null` | ISO timestamp of most recent save |
| `pdfUrl` | `string \| null` | `null` | Object URL of latest compiled PDF blob |
| `isCompiling` | `boolean` | `false` | Compilation guard preventing duplicate requests |
| `errorDetails` | `string \| null` | `null` | Detailed LaTeX compiler error output |
| `isDropdownOpen` | `boolean` | `false` | Controls project selector dropdown visibility |
| `isRenameModalOpen` | `boolean` | `false` | Controls rename modal visibility |

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

---

## Import & Export Actions

- **Export `.tex` (`handleExportTex`)**: Generates sanitized `.tex` source download (e.g., `My-Resume.tex`) directly from active editor state.
- **Import `.tex` (`handleImportFile`)**: HTML5 file input (`accept=".tex"`) reads local UTF-8 file via `FileReader`, loads text into active project, persists to `localStorage`, and clears PDF preview.
