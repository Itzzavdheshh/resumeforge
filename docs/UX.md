# ResumeForge — User Experience

---

## Current User Workflows

### Workflow 1: Multi-Project Navigation & Switching (Prompt 4)

```
1. Open http://localhost:3000
2. Header displays active project dropdown (e.g., "My Resume ▼")
3. User clicks project selector dropdown
4. Menu displays list of local resume projects + action options (+ New Resume, Rename, Duplicate, Delete)
5. User selects "Backend Resume"
6. Workspace saves current project, loads "Backend Resume" LaTeX source, and CLEARS PDF preview iframe
7. User clicks Compile (or presses Ctrl+Enter) to generate "Backend Resume" PDF preview
```

---

### Workflow 2: Create, Rename, Duplicate & Delete Projects (Prompt 4)

```
1. Create: Click dropdown → "+ New Resume" → New project created as "Untitled Resume" and set active
2. Rename: Click dropdown → "Rename Active Project" → Modal opens → Type new name → Click Rename
3. Duplicate: Click dropdown → "Duplicate Project" → Clones current LaTeX to "<Name> Copy" with unique ID
4. Delete: Click dropdown → "Delete Active Project" → Confirmation dialog appears → Project deleted → Active project switches to remaining project
```

---

### Workflow 3: Import & Export `.tex` Files (Prompt 4)

```
1. Export .tex: Click "Export .tex" button in header → Browser downloads "<project-name>.tex" file directly
2. Import .tex: Click "Import .tex" button in header → Choose local .tex file → File contents loaded into editor → Saved to active project → PDF preview cleared until compiled
```

---

### Workflow 4: Manual Save & Keyboard Shortcut

```
1. User edits LaTeX source
2. User presses Ctrl+S (or Cmd+S on macOS) OR clicks "Save (Ctrl+S)"
3. Default browser "Save Webpage" dialog is intercepted and prevented
4. Source is written to localStorage for the active project
5. Header status flickers "Saved" for 1.5 seconds; Editor tab bar displays "Saved just now"
```

---

### Workflow 5: Compile via Button or Keyboard

```
1. User presses Ctrl+Enter (or Cmd+Enter on macOS) OR clicks "Compile (Ctrl+Enter)"
2. Status changes to "Compiling...", Compile button disabled during request
3a. [Success] Status → "Compiled successfully", PDF preview updates, Download PDF active
3b. [Failure] Status → "Compilation failed (showing previous PDF)", Error banner displays log
```

---

## Empty & Action States

| State | Behavior |
|-------|----------|
| No PDF compiled yet / Project switched | Preview placeholder box shown; Download PDF button visually disabled |
| Compile in progress | Status → "Compiling..."; Compile button disabled ("Compiling..."); Save active |
| Compilation success | Status → "Compiled successfully"; Preview iframe rendered; Download PDF active |
| Compilation error | Header status → "Compilation failed..."; Error banner displayed; Last successful PDF retained |
| Saved document | Editor tab displays `"Saved just now"` or `"Saved 2m ago"` |
| Unsaved changes | Editor tab displays amber badge `"Unsaved changes"` |
| Storage error | Editor tab displays red badge `"Unable to save locally"` |

---

## Keyboard Shortcuts

- `Ctrl + S` / `Cmd + S`: Manual Save (overrides browser save dialog).
- `Ctrl + Enter` / `Cmd + Enter`: Trigger compilation.
- Shortcuts are platform-aware (detects macOS vs Windows/Linux).
- Buttons display subtle shortcut badges: `Save (Ctrl+S)` and `Compile (Ctrl+Enter)`.
