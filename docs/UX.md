# ResumeForge — User Experience

---

## Current User Workflows

### Workflow 1: Edit & Local Persistence (Prompt 3)

```
1. Open http://localhost:3000
2. Page restores saved LaTeX from localStorage (or displays default sample if first visit)
3. Editor tab bar displays save status ("Saved just now" or relative timestamp)
4. User edits the LaTeX source
5. Editor tab bar changes to amber badge: "Unsaved changes"
6. After 1000ms of inactivity, debounced autosave persists changes to localStorage
7. Save status updates to "Saved just now"
8. User refreshes browser page — exact LaTeX source is restored seamlessly!
```

---

### Workflow 2: Manual Save & Keyboard Shortcut (Prompt 3)

```
1. User edits LaTeX source
2. User presses Ctrl+S (or Cmd+S on macOS) OR clicks the "Save (Ctrl+S)" header button
3. Default browser "Save Webpage" dialog is intercepted and prevented
4. Source is immediately written to localStorage
5. Header status flickers "Saved" for 1.5 seconds; Editor tab bar displays "Saved just now"
```

---

### Workflow 3: Compile via Button or Keyboard (Prompt 3)

```
1. User presses Ctrl+Enter (or Cmd+Enter on macOS) OR clicks the "Compile (Ctrl+Enter)" header button
2. Status changes to "Compiling...", Compile button is disabled during request
3a. [Success] Status → "Compiled successfully", PDF preview updates, Download PDF becomes active
3b. [Failure] Status → "Compilation failed (showing previous PDF)", Error banner displays compiler log
```

---

### Workflow 4: PDF Download

```
1. Successfully compile a resume (see Workflow 3)
2. "Download PDF" button in header becomes active
3. Click "Download PDF"
4. Browser downloads the compiled PDF binary directly as "resume.pdf"
```

---

## Empty & Action States

| State | Behavior |
|-------|----------|
| No PDF compiled yet | Preview placeholder box shown; Download button visually disabled |
| Compile in progress | Status → "Compiling..."; Compile button disabled ("Compiling..."); Save remains active |
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
