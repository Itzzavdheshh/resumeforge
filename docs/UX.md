# ResumeForge — User Experience

---

## Current User Workflows

### Workflow 1: Compile a Resume

```
1. Open http://localhost:3000
2. See: LaTeX editor on the left, empty PDF preview on the right
3. The editor is pre-filled with a sample resume (Avdhesh Kumar Dadhich)
4. [Optional] Edit the LaTeX source
5. Click "Compile"
6. Status changes to "Compiling..."
7a. [Success] Status → "Compiled successfully", PDF appears in right panel
7b. [Failure] Status → error message from pdfLaTeX
8. [If success] View the PDF in the iframe preview
```

**Issues in this workflow:**
- There is no loading spinner or progress indicator during compilation
- The only feedback is the status text changing
- Error messages are raw pdfLaTeX output — not user-friendly
- There is no way to know how long compilation will take

---

### Workflow 2: Edit and Recompile

```
1. Compile once (see Workflow 1)
2. Edit the LaTeX in the editor
3. Click "Compile" again
4. New PDF replaces the old one in the preview
```

**Issues:**
- Old PDF is briefly visible while recompiling — no "loading" state in the preview
- There is no autosave; the user's changes exist only in memory
- There is no keyboard shortcut to compile (e.g., Ctrl+Enter)

---

### Workflow 3: "Save" (Current — Non-functional)

```
1. Click "Save"
2. Status flickers to "Saved" for 1.5 seconds
3. Status returns to previous state
4. Nothing is actually saved anywhere
```

**This workflow is broken.** The Save button gives false feedback. A new developer or user clicking Save would believe their work is being persisted, but it is not.

---

## Friction Points

| # | Friction Point | Impact | Notes |
|---|----------------|--------|-------|
| 1 | No loading indicator during compile | HIGH | User doesn't know if compile is working or stuck |
| 2 | Error messages are raw pdfLaTeX output | HIGH | Confusing for non-LaTeX-experts |
| 3 | Save button does nothing | HIGH | Creates false sense of security |
| 4 | Page refresh = all work lost | HIGH | No persistence of any kind |
| 5 | No keyboard shortcuts | MEDIUM | Ctrl+Enter for compile, Ctrl+S for save |
| 6 | No autosave | MEDIUM | Manual save with no actual effect |
| 7 | No file upload | MEDIUM | Can't import existing .tex files |
| 8 | No PDF download | MEDIUM | Can't actually get the PDF out of the browser |
| 9 | No zoom or page navigation in PDF viewer | MEDIUM | Depends entirely on browser PDF viewer |
| 10 | Two-column layout is cramped on small screens | LOW | Desktop-only UX |
| 11 | Editor has no syntax highlighting | LOW | Plain textarea — no color cues |
| 12 | Compile button has no disabled state during compiling | LOW | User can spam it during compilation |

---

## Empty States

| State | Current Behavior | Ideal Behavior |
|-------|-----------------|----------------|
| No PDF compiled yet | Placeholder box with "PDF Preview" text | Same — acceptable |
| Compile in progress | No visual change in preview panel | Show a subtle loading/compiling indicator |
| Compilation error | Status bar shows raw error text | Dedicated error panel with formatted output |
| Editor empty | Textarea is blank (user deleted everything) | No protection — could cause confusing errors |

---

## Success States

| State | Current Behavior | Notes |
|-------|-----------------|-------|
| Compilation succeeded | Status → "Compiled successfully", PDF appears | Works correctly |
| Save clicked | Status → "Saved" for 1.5s | Misleading — nothing is saved |

---

## Error UX

**Current error experience:**
1. User clicks Compile
2. pdfLaTeX fails
3. Status bar shows the raw error string (e.g., `! LaTeX Error: File 'foo.sty' not found.` or the full pdfLaTeX log)
4. The error may be truncated or cut off
5. There is no guidance on how to fix the error
6. The old PDF (if any) remains visible — potentially confusing

**Ideal error experience (PLANNED):**
1. Error panel expands below the editor
2. Error is parsed and formatted:
   - Line number highlighted in editor
   - Human-readable explanation
   - Link to documentation if possible
3. Old PDF remains visible with a subtle "stale" indicator
4. User can close the error panel when done

---

## Autosave (PLANNED)

The target UX for autosave:
- User types → changes are saved to the database automatically after a debounce delay (e.g., 2 seconds of inactivity)
- Status shows: "Saving..." → "Saved just now"
- If save fails: "Save failed — retrying..."
- User can also manually save with Ctrl+S

---

## Future UX Goals

### Compile Workflow
- Keyboard shortcut: Ctrl+Enter (or Cmd+Enter on Mac) to compile
- Button disabled during compilation (no double-submit)
- Compile button shows spinner during compilation
- Estimated time remaining (if compilation is tracked)
- Auto-compile on save (optional toggle)

### Editor Workflow
- Syntax highlighting for LaTeX
- Line numbers
- Error squiggles (red underlines) on compilation errors
- Jump-to-error when clicking on an error in the error panel

### Preview Workflow
- Smooth scroll-sync between editor and preview (optional, complex)
- Zoom in/out controls
- Page navigation for multi-page PDFs
- "Stale" indicator when LaTeX has changed since last compile

### Navigation
- Ability to create a new resume from scratch
- Ability to open a previously saved resume
- Project list/dashboard

### Onboarding
- Empty state when no resumes exist (new user)
- "Create your first resume" CTA
- Template picker on first use
