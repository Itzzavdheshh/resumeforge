# ResumeForge — User Experience

---

## Current User Workflows

### Workflow 1: Compile a Resume

```
1. Open http://localhost:3000
2. See: LaTeX editor on the left, empty PDF preview on the right
3. Download PDF button is visually disabled ("Download PDF")
4. [Optional] Edit the LaTeX source
5. Click "Compile"
6. Status changes to "Compiling...", Compile button changes to "Compiling..." and is disabled
7a. [Success] Status → "Compiled successfully", PDF appears in preview, Download PDF button becomes active
7b. [Failure] Status → "Compilation failed (showing previous PDF)", Error banner appears with compiler log
8. [If success] View the PDF in the iframe preview or click "Download PDF"
```

---

### Workflow 2: Download PDF

```
1. Successfully compile a resume (see Workflow 1)
2. "Download PDF" button in the header becomes active
3. Click "Download PDF"
4. Browser downloads the compiled PDF binary directly as "resume.pdf"
```

---

### Workflow 3: Failed Compilation & Recovery (Prompt 2.1 UX Fix)

```
1. User enters invalid LaTeX (e.g. \invalidcommand) and clicks Compile
2. Header status displays compact message: "Compilation failed (showing previous PDF)"
3. Error banner expands below preview header:
   - Header: "Compilation Error"
   - Summary: "LaTeX compilation failed. Check your LaTeX source code for syntax errors."
   - Scrollable pre block with full pdfLaTeX log details
   - Dismiss button (✕)
4. Preview tab header displays: "Showing last successful PDF (latest compile failed)" in amber text
5. Preview iframe remains visible showing last working PDF
6. Download PDF button remains active downloading last working PDF
7. User fixes LaTeX and clicks Compile again
8. Error banner disappears, header status updates to "Compiled successfully", preview updates to newest PDF
```

---

### Workflow 4: "Save" Action

```
1. User edits LaTeX
2. Click "Save" (Save button is ALWAYS clickable, even while compilation is active)
3. Status briefly shows "Saved" for 1.5 seconds, then returns to previous state
```

---

## Empty & Action States

| State | Behavior |
|-------|----------|
| No PDF compiled yet | Preview placeholder box shown; Download button visually disabled |
| Compile in progress | Status → "Compiling..."; Compile button disabled ("Compiling..."); Save remains active |
| Compilation success | Status → "Compiled successfully"; Preview iframe rendered; Download PDF active |
| Compilation error | Header status → "Compilation failed..."; Error banner displayed; Last successful PDF retained in preview & download |

---

## Accessibility & Keyboard Navigation

- Download action uses standard HTML5 anchor element `<a href={pdfUrl} download="resume.pdf">` when active.
- Error banner uses `role="alert"` and `aria-live="polite"` so screen readers announce compiler errors immediately.
- Dismiss button (`✕`) on error banner allows closing the log view.
- Focus rings (`focus:ring-2 focus:ring-zinc-400`) provided on all interactive buttons.
