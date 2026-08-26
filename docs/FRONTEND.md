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

**Current state**:
- Loads `Geist` (sans-serif) and `Geist Mono` (monospace) fonts
- Sets CSS variables `--font-geist-sans` and `--font-geist-mono`
- Contains default `create-next-app` metadata (`title: "Create Next App"`)

**Known issues**:
- Title and description are still the `create-next-app` defaults — they should be updated to ResumeForge branding.

---

### `app/page.tsx` — Main Workspace Page

**Type**: Client Component (`"use client"`)

**Purpose**: The entire application UI lives here. This is a single-page application in a single component.

**State**:

| State variable | Type | Initial value | Purpose |
|---------------|------|---------------|---------|
| `latex` | `string` | `initialLatex` (sample resume) | Current LaTeX source in the editor |
| `status` | `string` | `"Ready"` | Status message shown in header |
| `pdfUrl` | `string \| null` | `null` | Object URL of compiled PDF blob |

**Event handlers**:

| Handler | Trigger | Behavior |
|---------|---------|---------|
| `handleSave` | Save button click | Sets status to "Saved", resets to "Ready" after 1.5s. **No actual persistence.** |
| `handleCompile` | Compile button click | POSTs `{ latex }` to `/api/compile`, receives PDF blob, creates object URL, sets `pdfUrl` |

**Layout structure**:

```
<main>                          full-height, dark bg (zinc-950)
  <header>                      64px height, border-bottom
    <div>                       title + subtitle
      <h1>ResumeForge</h1>
      <p>LaTeX Resume Workspace</p>
    </div>
    <div>                       status + buttons
      <span>{status}</span>
      <button>Save</button>
      <button>Compile</button>
    </div>
  </header>
  <section>                     remaining height, 2-column grid
    <div>                       left: editor panel
      <div>tab bar: "main.tex"</div>
      <textarea>                LaTeX editor
    </div>
    <div>                       right: preview panel
      <div>tab bar: "PDF Preview"</div>
      <div>
        <iframe src={pdfUrl} />   if PDF available
        <div>placeholder</div>    if no PDF
      </div>
    </div>
  </section>
</main>
```

---

## State Management

**Current approach**: Local React `useState` only.

All state is ephemeral — it exists only while the browser tab is open. There is no:
- `localStorage`
- `sessionStorage`
- Server-side state
- Database

**Future approach** (PLANNED): React state for UI + server-side persistence (database, object storage).

---

## PDF Preview Implementation

**Current**: `<iframe>` with a `blob:` URL as `src`.

```tsx
const pdfBlob = await response.blob();
const pdfUrl = URL.createObjectURL(pdfBlob);  // creates blob: URL
setPdfUrl(pdfUrl);
// ...
<iframe key={pdfUrl} src={pdfUrl} />
```

**The `key={pdfUrl}` prop** is used to force the iframe to re-mount when a new PDF is compiled. This ensures the iframe actually reloads even if the URL changes.

**Known issue**: `URL.revokeObjectURL()` is never called. This causes a memory leak — each compilation retains the old blob in memory until the page is closed.

**Limitations**:
- PDF rendering depends on the browser's built-in PDF viewer
- No scroll sync, no page navigation controls
- No zoom controls

---

## Frontend Error Handling

**Current behavior**:
- If the API returns a non-OK response, the error message from `error.error` is shown in the status bar
- If the request itself fails (network error), the error message is shown in the status bar
- No retry logic
- No user-friendly error formatting
- Compiler logs are not displayed to the user

**Future**: A dedicated error panel or log viewer to display full pdfLaTeX output.

---

## LaTeX Editor

**Current implementation**: Plain HTML `<textarea>`

```tsx
<textarea
  value={latex}
  onChange={(e) => setLatex(e.target.value)}
  spellCheck={false}
  className="flex-1 resize-none bg-zinc-950 p-5 font-mono text-sm leading-6 text-zinc-300 outline-none"
/>
```

**Limitations**:
- No syntax highlighting
- No line numbers
- No autocomplete
- No error underlines
- No bracket matching
- No find/replace

**Planned replacement**: Monaco Editor (VS Code's editor) or CodeMirror with LaTeX language support.

---

## Frontend API Communication

**Current**: Native `fetch()` API

```typescript
const response = await fetch("/api/compile", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ latex }),
});
```

- Sends JSON, receives binary PDF
- No abort controller / request cancellation
- No retry on failure
- No loading spinner or progress indication
- Status text is the only feedback during compilation

---

## CSS / Styling

**Framework**: Tailwind CSS v4

**Import**: `@import "tailwindcss"` in `globals.css` (Tailwind v4 syntax)

**Theme**:
- Dark background: `zinc-950` (`#09090b`)
- Borders: `zinc-800`
- Secondary panels: `zinc-900`
- Text: `white` (primary), `zinc-300` (editor), `zinc-500` (secondary)
- Buttons: white (compile), zinc-700 border (save)

**Custom CSS variables**:
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

Note: The dark theme is applied with explicit Tailwind classes (`bg-zinc-950`) rather than the CSS variable system, so the CSS variable dark-mode media query does not affect the workspace appearance.

---

## Current Limitations

1. Entire app is a single file — no component decomposition
2. No code splitting or lazy loading
3. No keyboard shortcuts (Ctrl+S, Ctrl+Enter to compile)
4. No mobile/responsive layout (two-column layout breaks on small screens)
5. No accessibility attributes (`aria-label`, roles, etc.)
6. No loading indicator during compilation
7. Memory leak from unrevoked blob URLs

---

## Future Frontend Architecture

| Concern | Current | Planned |
|---------|---------|---------|
| File organization | Single `page.tsx` | Decomposed components in `components/` |
| Editor | `<textarea>` | Monaco Editor or CodeMirror |
| State | `useState` | React state + server persistence |
| Navigation | None | Multiple pages/routes for auth, dashboard, project |
| Auth UI | None | Login, signup, user profile |
| PDF controls | None | Zoom, page nav, fullscreen |
| Error display | Status bar text | Dedicated compiler log panel |
| Loading states | Status text only | Proper spinner/skeleton |
