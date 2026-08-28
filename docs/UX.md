# ResumeForge — User Experience

---

## Current User Workflows

### Workflow 1: Professional Monaco Code Editing & Image Asset Management (Prompt 5 & 7)

```
1. Open http://localhost:3000
2. Workspace displays 3 columns: FileTree Sidebar | Monaco Editor (or Image Preview) | PDF Preview
3. Selecting a .tex file opens Monaco Editor with LaTeX syntax highlighting (stex), line numbers, and word wrap controls
4. Click "+ Img" in FileTree → Select local PNG/JPG image file
5. Image is uploaded to images/ directory (e.g. images/profile.png) with collision-safe pathing
6. Clicking images/profile.png renders ImageAssetView: preview image, size, MIME type, and "Copy LaTeX Snippet" button
7. User clicks "Copy LaTeX Snippet" → Paste \includegraphics[width=0.4\textwidth]{images/profile.png} into main.tex
8. User presses Ctrl+Enter → Project compiles with embedded image → PDF renders image visually!
```

---

### Workflow 2: Multi-Project Navigation & Switching

```
1. Open http://localhost:3000
2. Header displays active project dropdown (e.g., "My Resume ▼")
3. User clicks project selector dropdown
4. Menu displays list of local resume projects + action options (+ New Resume, Rename, Duplicate, Delete)
5. User selects "Backend Resume"
6. Workspace saves current project, loads "Backend Resume" main.tex source into Monaco editor, and CLEARS PDF preview iframe
7. User clicks Compile (or presses Ctrl+Enter) to generate "Backend Resume" PDF preview
```

---

### Workflow 3: Create, Rename, Duplicate & Delete Projects

```
1. Create: Click dropdown → "+ New Resume" → New project created as "Untitled Resume" (or "Untitled Resume 2" if taken) and set active
2. Rename: Click dropdown → "Rename Active Project" → Modal opens → Type new name → Error feedback shown if blank or duplicate → Click Rename
3. Duplicate: Click dropdown → "Duplicate Project" → Clones current project files & images to "<Name> Copy" with unique IDs
4. Delete: Click dropdown → "Delete Active Project" → Confirmation dialog appears → Project deleted → Active project switches to remaining project
```

---

### Workflow 4: Import & Export `.tex` Files

```
1. Export .tex: Click "Export .tex" button in header → Browser downloads active .tex file (e.g., "<project-name>.tex" or "experience.tex")
2. Import .tex: Click "Import .tex" button in header → Choose local .tex file → File contents loaded into main.tex → Saved to active project → PDF preview cleared until compiled
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
| Image asset selected | Displays `ImageAssetView` preview card, file size, MIME type, and snippet generator |
| Oversized image upload | Alerts user: `"Image file exceeds maximum allowed size of 2 MB."` |

---

## Keyboard Shortcuts

- `Ctrl + S` / `Cmd + S`: Manual Save (overrides browser save dialog; works inside Monaco Editor).
- `Ctrl + Enter` / `Cmd + Enter`: Trigger multi-file compilation (works inside Monaco Editor).
- `Ctrl + F` / `Cmd + F`: Open Monaco native search/replace widget.
- Shortcuts are platform-aware (detects macOS vs Windows/Linux).
- Buttons display subtle shortcut badges: `Save (Ctrl+S)` and `Compile (Ctrl+Enter)`.
