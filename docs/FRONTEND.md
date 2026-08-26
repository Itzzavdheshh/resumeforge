# ResumeForge — Frontend Documentation

---

## Framework

- **Next.js 16.3.3** using the **App Router**
- **React 19.2.8**
- **TypeScript 5**
- **Tailwind CSS v4** (configured via `@tailwindcss/postcss`)
- **Geist** and **Geist Mono** fonts loaded via `next/font/google`

---

## File Structure

```
app/
  layout.tsx      Root layout (server component)
  page.tsx        Main workspace page (client component)
  globals.css     Global CSS: Tailwind import + CSS variables
  favicon.ico     Default Next.js favicon
  api/
    compile/
      route.ts    API route for LaTeX compilation
```

---

## Components

### `app/layout.tsx` — Root Layout

**Type**: Server Component (default in App Router)

**Purpose**: HTML root, font loading, global CSS.

---

### `app/page.tsx` — Main Workspace Page

**Type**: Client Component (`"use client"`)

**State**:

| State variable | Type | Initial value | Purpose |
|---------------|------|---------------|---------|
| `latex` | `string` | `initialLatex` (sample resume) | Current LaTeX source in the editor |
| `status` | `string` | `"Ready"` | Status text shown in header |
| `pdfUrl` | `string \| null` | `null` | Object URL of latest compiled PDF blob |
| `isCompiling` | `boolean` | `false` | Compilation guard preventing duplicate requests |
| `errorDetails` | `string \| null` | `null` | Detailed LaTeX compiler error output |

**Event handlers**:

| Handler | Trigger | Behavior |
|---------|---------|---------|
| `handleSave` | Save button click | Sets status to "Saved", resets to "Ready" after 1.5s. Always active (independent of compile state). |
| `handleCompile` | Compile button click | Sets `isCompiling(true)`, clears `errorDetails`, POSTs `{ latex }` to `/api/compile`. On success: creates object URL, sets `pdfUrl`, sets `status("Compiled successfully")`. On error: sets `status("Compilation failed (showing previous PDF)")`, sets `errorDetails`. |

---

## PDF Preview & Download Lifecycle Implementation

### Object URL Creation & Cleanup

```tsx
useEffect(() => {
  return () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
  };
}, [pdfUrl]);
```

- When compilation succeeds, `URL.createObjectURL(pdfBlob)` creates a blob URL.
- Setting `pdfUrl` triggers the `useEffect` cleanup for the previous `pdfUrl` (if any), executing `URL.revokeObjectURL(previousUrl)`.
- When the component unmounts, the final `pdfUrl` is revoked.

### Download Action

- Implemented as an HTML5 anchor element `<a href={pdfUrl} download="resume.pdf">` when a valid PDF is ready.
- Disabled as `<button disabled>` when `pdfUrl` is `null` or `isCompiling` is `true`.
- Uses sensible filename `resume.pdf`.

---

## Error Handling UX (Prompt 2.1 Fix)

- **Header Status**: Compact summary ("Compilation failed (showing previous PDF)" or "Compilation failed").
- **Secondary Error Banner**: If `errorDetails` is present, a formatted red alert banner appears in the workspace with:
  - Title: "Compilation Error"
  - Summary: "LaTeX compilation failed. Check your LaTeX source code for syntax errors."
  - Scrollable `<pre>` block showing compiler output details.
  - Dismiss button (`✕`).
- **Preview Header Badge**: Displays `"Showing last successful PDF (latest compile failed)"` in amber text when previewing a previous PDF after a compilation failure.

---

## Save Button Interaction

- The Save button is independent of compilation state.
- `disabled={isCompiling}` has been removed so users can click Save at any time.
