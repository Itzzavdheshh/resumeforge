# ResumeForge — UI Design Reference

---

## Current Design System (Prompt 10)

The UI uses a modern, high-contrast dark developer-tool aesthetic (VS Code / modern online IDE feel) built on Tailwind CSS v4.

---

## Color Palette

| Role | Tailwind Class | Usage |
|------|---------------|-------|
| Page / Shell background | `bg-zinc-950` | Application shell, editor background, sidebar |
| Card / Panel background | `bg-zinc-900` | Header dropdowns, modal card, error panel, preview container |
| Component background | `bg-zinc-800` | Active selection, button hover, tab background |
| Primary border | `border-zinc-800/80` | Panel dividers, header border, file tree border |
| Highlight border | `border-white` / `border-zinc-500` | Active tabs, focus rings, selected options |
| Primary text | `text-white` / `text-zinc-100` | Headings, active file tab, button labels |
| Secondary text | `text-zinc-300` / `text-zinc-400` | Menu options, subtext, file names |
| Muted text | `text-zinc-500` / `text-zinc-600` | Status text, category headers, shortcut badges |
| Primary action CTA | `bg-white text-black hover:bg-zinc-200` | Compile primary action button |
| Secondary CTA | `bg-zinc-900 border border-zinc-800 text-zinc-300` | Save, Download PDF, menu buttons |
| Danger CTA | `text-red-400 hover:bg-red-950/40` | Delete Project / Delete File actions |
| Error panel | `bg-red-950/30 border-red-900/60 text-red-300` | Collapsible compiler error panel |

---

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Brand Title "ResumeForge" | Geist Sans | `text-sm` (14px) | `font-semibold` |
| Subtitle / Badges | Geist Sans | `text-[10px]` / `text-[11px]` | `font-medium` |
| Active Editor Tab | Geist Mono | `text-xs` (12px) | `font-medium` |
| Code Source | Geist Mono | `text-xs` / `text-sm` (11-20px) | `font-mono` |
| FileTree Names | Geist Mono | `text-[11.5px]` | `font-mono` |
| Snippets Search Input | Geist Mono | `text-xs` (12px) | `font-mono` |
| Shortcut Badges | Geist Mono | `text-[9px]` | `font-mono` |

---

## Layout

### 3-Panel IDE Workspace

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (h=56px / h-14)                                                  │
│  [RF] ResumeForge   [Project ▾]   File ▾   Project ▾   Saved (Ctrl+S) [Compile] │
├─────────────────┬──────────────────────────┬────────────────────────────┤
│ PANEL 1         │ PANEL 2                  │ PANEL 3                    │
│ FILE TREE       │ CODE / ASSET COLUMN      │ PDF PREVIEW                │
│ (w-56)          │ (flex-1)                 │ (w-[42%])                  │
│ ┌─────────────┐ │ ┌──────────────────────┐ │ ┌────────────────────────┐ │
│ │ Files + / + │ │ │ [📄 main.tex] [root]  │ │ │ PDF Preview  LETTER • 1 │ │
│ ├─────────────┤ │ ├──────────────────────┤ │ ├────────────────────────┤ │
│ │ LaTeX Code  │ │ │                      │ │ │ [Errors Panel ▼]       │ │
│ │  main.tex   │ │ │  Monaco Editor       │ │ │ ┌────────────────────┐ │ │
│ │  sec/exp.tex│ │ │  Syntax tokens &     │ │ │ │                    │ │ │
│ │ Images      │ │ │  Line error markers  │ │ │ │  PDF iframe or     │ │ │
│ │  profile.png│ │ │                      │ │ │ │  Empty state card  │ │ │
│ └─────────────┘ │ └──────────────────────┘ │ └────────────────────────┘ │
└─────────────────┴──────────────────────────┴─────────────────────────┘
```

---

## Buttons & Components

### Primary CTA (Compile)
`bg-white px-3.5 py-1.5 text-xs font-semibold text-black rounded-lg hover:bg-zinc-200 shadow-sm`

### Secondary CTA (Save, Download PDF, Menu triggers)
`border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-white`

### Snippets Live Search Dropdown (`LatexSnippetsMenu.tsx`)
Includes top search input (`🔍 Search snippets...`) filtering snippets across categories in real time.

### Collapsible Error Diagnostics (`app/page.tsx`)
Top error summary banner with error count and `Compiler Diagnostics (N Errors) ▼ / ▲` log details toggle.

### PDF Preview Empty State
Clean card featuring document icon, title "No PDF Compiled Yet", and step-by-step compilation instructions.
