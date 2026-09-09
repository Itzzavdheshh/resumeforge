# ResumeForge — User Experience

---

## Current User Workflows (Prompt 10)

### Workflow 1: Clutter-Free Application Header & Grouped Menus
```
1. Open http://localhost:3000
2. Top header features clean organization:
   - Brand title "ResumeForge" + "LaTeX" badge + Project Selector dropdown
   - "File ▾" grouped menu -> Import .tex, Export .tex
   - "Project ▾" grouped menu -> Import Project (.zip), Export Project (.zip), Compiler Settings
   - Action bar -> Save (Ctrl+S) with unsaved indicator dot, Download PDF, Compile (Ctrl+↵)
```

### Workflow 2: Professional Monaco Code Editing & Snippets Search
```
1. Select a .tex file in the FileTree sidebar
2. Editor tab bar renders active IDE tab [📄 main.tex] [root]
3. Click "{}" Snippets dropdown in toolbar -> Search bar input receives focus automatically
4. Type search query (e.g. "table" or "href") -> Snippets list filters instantly across all categories
5. Select snippet -> Text inserts precisely at editor cursor via executeEdits()
6. Press Ctrl+Enter -> Project compiles -> PDF renders preview
```

### Workflow 3: Collapsible Error Diagnostics & PDF Retaining
```
1. Introduce a LaTeX syntax error (e.g. \badcommand)
2. Press Ctrl+Enter -> Status changes to "Compilation failed"
3. PDF Preview header retains last successful PDF with an amber warning badge ("Last successful PDF")
4. Red error panel expands showing error count, dismiss button (✕), and collapsible log toggle ("Compiler Diagnostics (N Errors) ▼")
5. Monaco editor displays red squiggles on the error line and automatically scrolls cursor to line
6. Fix error -> Press Ctrl+Enter -> Error panel closes, Monaco markers clear, PDF updates!
```

---

## Empty & Action States

| State | Behavior |
|-------|----------|
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
- `Escape`: Closes open dropdown menus, search panels, and modal dialogs.
