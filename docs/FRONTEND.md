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
  storage.ts      Isolated localStorage persistence utility
```

---

## Storage Architecture (`lib/storage.ts`)

**Storage Key**: `resumeforge:document:main`

**Stored Data Schema**:
```typescript
export interface StoredDocument {
  version: 1;
  latex: string;
  savedAt: string; // ISO 8601 string
}
```

**Functions**:
- `loadDocument(): StoredDocument | null` — Safely loads and parses saved JSON from `window.localStorage`. Returns `null` if running on server (SSR), storage is disabled, or data is missing/corrupted.
- `saveDocument(latex: string): StoredDocument | null` — Safely stringifies and saves the document to `window.localStorage`. Returns the `StoredDocument` on success or `null` if quota is exceeded or storage is disabled.

---

## Components

### `app/layout.tsx` — Root Layout

**Type**: Server Component (default in App Router)

**Metadata (Prompt 3)**:
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
| `latex` | `string` | `initialLatex` | Current LaTeX source in the editor |
| `lastSavedLatex` | `string` | `initialLatex` | Benchmark LaTeX source matching latest save |
| `status` | `string` | `"Ready"` | Compact status text shown in header |
| `saveStatus` | `SaveStatus` | `"saved"` | Document save state (`saved`, `unsaved`, `saving`, `error`) |
| `lastSavedAt` | `string \| null` | `null` | ISO timestamp of most recent save |
| `pdfUrl` | `string \| null` | `null` | Object URL of latest compiled PDF blob |
| `isCompiling` | `boolean` | `false` | Compilation guard preventing duplicate requests |
| `errorDetails` | `string \| null` | `null` | Detailed LaTeX compiler error output |

**Hydration & Page Load**:
- On client mount (`useEffect`), `loadDocument()` checks `localStorage`.
- If a valid document exists, state is restored asynchronously inside `queueMicrotask` to avoid SSR hydration mismatches and React 19 ESLint warnings.

**Autosave & Change Handler**:
- When user edits `latex`:
  - If `newVal !== lastSavedLatex`, sets `saveStatus("unsaved")`.
  - Sets a 1000ms debounced timer to call `saveDocument(newVal)`.
  - When autosave completes, sets `saveStatus("saved")` and updates `lastSavedAt`.

---

## Keyboard Shortcuts (Prompt 3)

| Shortcut (Win/Linux) | Shortcut (macOS) | Action | Handler |
|----------------------|------------------|--------|---------|
| `Ctrl + S` | `Cmd + S` | Save resume source to `localStorage` | `handleSave` |
| `Ctrl + Enter` | `Cmd + Enter` | Trigger LaTeX compilation to PDF | `handleCompile` |

- Registered globally via `addEventListener("keydown", handleKeyDown)`.
- Uses `useRef` to maintain fresh handler functions without re-binding event listeners on every state render.
- UI hints (`(Ctrl+S)` and `(Ctrl+Enter)`) rendered in header button labels.

---

## Document Status Badges

In the `main.tex` editor tab bar:
- `saveStatus === 'saved'`: Displays relative time badge e.g. `"Saved just now"`, `"Saved 2m ago"`, or `"Saved at 6:14 PM"`.
- `saveStatus === 'unsaved'`: Displays amber badge `"Unsaved changes"`.
- `saveStatus === 'saving'`: Displays `"Saving..."`.
- `saveStatus === 'error'`: Displays red badge `"Unable to save locally"`.
