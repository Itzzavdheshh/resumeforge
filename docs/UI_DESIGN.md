# ResumeForge — UI Design Reference

---

## Current Design System

The current UI uses Tailwind CSS v4 utility classes with a custom dark color palette.

---

## Color Palette

| Role | Tailwind Class | Hex Value | Usage |
|------|---------------|-----------|-------|
| Page background | `bg-zinc-950` | `#09090b` | Main page, editor area |
| Panel background | `bg-zinc-900` | `#18181b` | PDF preview panel |
| Component background | `bg-zinc-800` | `#27272a` | Placeholder icon, hover state |
| Primary border | `border-zinc-800` | `#27272a` | Column divider, header border, tab borders |
| Secondary border | `border-zinc-700` | `#3f3f46` | Save button border, placeholder icon border |
| Primary text | `text-white` | `#ffffff` | Headings, button text |
| Editor text | `text-zinc-300` | `#d4d4d8` | LaTeX source in textarea |
| Secondary text | `text-zinc-500` | `#71717a` | Status indicator, subtitle |
| Tertiary text | `text-zinc-600` | `#52525b` | "No PDF loaded" placeholder text |
| Compile button bg | `bg-white` | `#ffffff` | Primary CTA |
| Compile button text | `text-black` | `#000000` | Compile button label |
| Compile button hover | `hover:bg-zinc-200` | `#e4e4e7` | Compile button hover |
| Save button hover | `hover:bg-zinc-800` | `#27272a` | Save button hover |

---

## Typography

| Element | Font | Size | Weight | Class |
|---------|------|------|--------|-------|
| Page title "ResumeForge" | Geist Sans | `text-xl` (20px) | semibold | `text-xl font-semibold tracking-tight` |
| Subtitle "LaTeX Resume Workspace" | Geist Sans | `text-xs` (12px) | normal | `text-xs text-zinc-500` |
| Tab labels ("main.tex", "PDF Preview") | Geist Sans | `text-sm` (14px) | medium | `text-sm font-medium` |
| Status text | Geist Sans | `text-sm` (14px) | normal | `text-sm text-zinc-500` |
| Button text | Geist Sans | `text-sm` (14px) | medium (compile) / normal (save) | |
| LaTeX editor | Geist Mono | `text-sm` (14px) | normal | `font-mono text-sm leading-6` |
| Placeholder heading | Geist Sans | `text-lg` (18px) | medium | `text-lg font-medium` |
| Placeholder body | Geist Sans | `text-sm` (14px) | normal | `text-sm text-zinc-500` |

---

## Layout

### Page Structure

```
┌─────────────────────────────────────────────────────────┐
│ HEADER (h=64px, border-bottom)                          │
│  ResumeForge        [Status]  [Save]  [Compile]         │
├───────────────────────────┬─────────────────────────────┤
│ EDITOR PANEL              │ PREVIEW PANEL               │
│ (50% width)               │ (50% width)                 │
│ ┌─────────────────────┐   │ ┌─────────────────────────┐ │
│ │ main.tex            │   │ │ PDF Preview             │ │
│ │ (tab bar)           │   │ │ (tab bar)               │ │
│ ├─────────────────────┤   │ ├─────────────────────────┤ │
│ │                     │   │ │                         │ │
│ │  <textarea>         │   │ │  <iframe> or            │ │
│ │  (LaTeX source)     │   │ │  placeholder            │ │
│ │                     │   │ │                         │ │
│ └─────────────────────┘   │ └─────────────────────────┘ │
└───────────────────────────┴─────────────────────────────┘
```

### Dimensions

| Element | Size |
|---------|------|
| Header height | `h-16` (64px) |
| Workspace height | `h-[calc(100vh-4rem)]` (remaining viewport height) |
| Column split | `grid-cols-2` (50/50) |
| Header padding | `px-6` (24px horizontal) |
| Editor padding | `p-5` (20px all sides) |
| Tab bar padding | `px-4 py-3` (16px h, 12px v) |
| Button padding | `px-4 py-2` (16px h, 8px v) |
| Button border radius | `rounded-lg` (8px) |
| Placeholder icon | `h-16 w-16 rounded-2xl` (64×64, 16px radius) |

---

## Buttons

### Compile (Primary CTA)

```
Background: white (#ffffff)
Text: black (#000000)
Font weight: medium
Hover: bg-zinc-200 (#e4e4e7)
Border: none
Border radius: rounded-lg
```

### Save (Secondary)

```
Background: transparent
Text: white
Font weight: normal
Border: border border-zinc-700
Hover: bg-zinc-800
Border radius: rounded-lg
```

---

## Empty State (PDF Preview Placeholder)

When no PDF has been compiled, the preview panel shows:

- 64×64 icon box with text "PDF" (Tailwind: `bg-zinc-800`, `border-zinc-700`, `rounded-2xl`)
- Heading: "PDF Preview"
- Body: "Compile your resume to see the PDF here."
- Caption: "No PDF loaded" (zinc-600)

---

## Responsive Behavior

**Current**: The layout uses `grid-cols-2` with no breakpoints. On small screens (<768px), the two columns will be very narrow and unusable.

**There is no mobile layout.** ResumeForge is currently desktop-only by default.

---

## Future Design Direction (PLANNED)

The current design is minimal but usable. Future improvements should consider:

1. **Proper IDE-style layout** — resizable panels (drag to resize editor vs preview)
2. **Status bar** — move status to a bottom bar rather than the header
3. **Toolbar** — format buttons (bold, italic, section), insert snippet menu
4. **Tab system** — support multiple files with tabs
5. **File tree** — left sidebar showing project files
6. **Theme options** — keep dark mode, possibly offer light mode
7. **Syntax highlighting** — Monaco or CodeMirror with LaTeX grammar
8. **Error panel** — collapsible panel at the bottom for compiler logs
9. **Notifications** — toast notifications instead of status text in header
10. **Loading states** — compilation spinner/progress indicator
11. **Responsive design** — mobile-friendly layout (collapsed panels, tab switching)

The core design language (dark zinc palette, clean minimal aesthetic) should be preserved as the product grows.
