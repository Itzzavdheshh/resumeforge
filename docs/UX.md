# ResumeForge — User Experience

---

## Current User Workflows (Prompt 13)

### Workflow 1: Template Selection & New Project Onboarding
```
1. Click "+ New Resume" in Project dropdown or open Template Gallery
2. Template Gallery Modal opens with backdrop blur:
   - Header: "Create New Resume", category filter tabs (All, Classic, Modern, Minimal, Academic)
   - Grid of template cards displaying SVG thumbnail, template title, category badge, description, recommended use case, and "Use Template →" button
   - "Blank Project" button for starting from scratch
3. Click "Use Template →" on Modern Executive or Academic CV
4. Workspace immediately creates isolated project in localStorage with deep-copied template files, sets compiler settings, and opens main.tex
5. Click "Compile" (Ctrl+Enter) -> pdflatex compiles template -> PDF Preview renders generated resume!
```

### Workflow 2: Clutter-Free Application Header & Grouped Menus
```
1. Open http://localhost:3000
2. Top header features clean organization:
   - Brand title "ResumeForge" + "LaTeX" badge + Project Selector dropdown
   - "File ▾" grouped menu -> Import .tex, Export .tex
   - "Project ▾" grouped menu -> Import Project (.zip), Export Project (.zip), Compiler Settings
   - Action bar -> Save (Ctrl+S) with unsaved indicator dot, Download PDF, Compile (Ctrl+↵)
```

### Workflow 3: Professional Monaco Code Editing & Snippets Search
```
1. Select a .tex file in the FileTree sidebar
2. Editor tab bar renders active IDE tab [📄 main.tex] [root]
3. Click "{}" Snippets dropdown in toolbar -> Search bar input receives focus automatically
4. Type search query (e.g. "table" or "href") -> Snippets list filters instantly across all categories
5. Select snippet -> Text inserts precisely at editor cursor via executeEdits()
6. Press Ctrl+Enter -> Project compiles -> PDF renders preview
```

### Workflow 4: Resizable 3-Panel Layout & Collapsible Error Diagnostics
```
1. Drag panel divider handles between FileTree, Monaco, and PDF Preview to resize
2. Press ‹ / › collapse buttons or double-click divider to collapse side panels to 32px strips
3. Introduce a LaTeX syntax error (e.g. \badcommand)
4. Press Ctrl+Enter -> Status changes to "Compilation failed"
5. PDF Preview header retains last successful PDF with an amber warning badge ("Last successful PDF")
6. Red error panel expands showing error count, dismiss button (✕), and collapsible log toggle ("Compiler Diagnostics (N Errors) ▼")
7. Monaco editor displays red squiggles on the error line and automatically scrolls cursor to line
8. Fix error -> Press Ctrl+Enter -> Error panel closes, Monaco markers clear, PDF updates!
```

---

## Empty & Action States

| State | Behavior |
|-------|----------|
| Template Gallery Open | Modal overlay renders category tabs (`All`, `Classic`, `Modern`, `Minimal`, `Academic`), offline vector SVG previews, and use template actions |
| No PDF compiled yet | Preview displays clean empty state card ("No PDF Compiled Yet") with step-by-step instructions |
| Compile in progress | Status -> "Compiling..."; Compile button displays loading spinner; Save remains active |
| Compilation success | Status -> "Compiled successfully"; Preview iframe rendered; Download PDF active |
| Compilation error | Header status -> "Compilation failed"; Collapsible error panel displayed; Last successful PDF retained |
| Saved document | Editor tab bar displays "Saved just now" or "Saved 2m ago" |
| Unsaved changes | Save button displays amber dot indicator; Editor tab bar displays "Unsaved changes" |
| Storage error | Editor tab bar displays red badge "Unable to save locally" |
| Image asset selected | Displays `ImageAssetView` preview card, file size, MIME type, and snippet generator |

---

## Keyboard Shortcuts

- `Ctrl + S` / `Cmd + S`: Manual Save (works inside Monaco Editor).
- `Ctrl + Enter` / `Cmd + Enter`: Trigger compilation (works inside Monaco Editor).
- `Ctrl + F` / `Cmd + F`: Open Monaco native search widget.
- `Escape`: Closes open dropdown menus, search panels, and modal dialogs (including Template Gallery).
- `Left / Right Arrow`: Nudge active panel divider when focused.
