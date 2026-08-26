# ResumeForge — Testing Guide

---

## How to Run the Project

### Prerequisites

- Node.js (version compatible with Next.js 16)
- npm
- **TeX Live 2026** installed at `C:\texlive\2026\` (required for compilation — Windows only, hardcoded path)

### Start Development Server

```powershell
cd C:\Users\itzza\Projects\resumeforge
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Code-Level Verification Results (Prompt 5)

### Build (Production Build)

```powershell
npm run build
```

**Result (Prompt 5)**: PASS. Next.js 16.3.3 Turbopack build succeeds in 2.1s with zero errors.

### Lint Check

```powershell
npm run lint
```

**Result (Prompt 5)**: PASS. Zero errors, zero warnings.

---

## User Manual Browser Testing Checklist (Prompt 5)

The user should perform the following manual tests in the browser at `http://localhost:3000`:

- [ ] **TEST 1 — Monaco Editor Load**: Open `http://localhost:3000`. Confirm Monaco code editor loads with LaTeX syntax highlighting, line numbers, and dark theme.
- [ ] **TEST 2 — Word Wrap Toggle**: Click `Wrap: On / Off` in editor tab bar. Confirm lines wrap or extend horizontally accordingly.
- [ ] **TEST 3 — Font Size Scaling**: Click `A−` and `A+` in editor tab bar. Confirm font size scales smoothly between 11px and 20px.
- [ ] **TEST 4 — Search Widget**: Focus inside Monaco editor. Press `Ctrl+F` (or `Cmd+F` on Mac). Confirm Monaco's native search bar opens.
- [ ] **TEST 5 — Text Editing & Autosave**: Type LaTeX commands (e.g. `\section{Experience}`). Confirm editor tab displays "Unsaved changes", followed by "Saved just now" after 1 second of inactivity.
- [ ] **TEST 6 — Shortcut Ctrl+S inside Monaco**: Type changes. Press `Ctrl+S` (or `Cmd+S`) while cursor is focused inside Monaco editor text area. Confirm document saves instantly without browser Save Webpage dialog.
- [ ] **TEST 7 — Shortcut Ctrl+Enter inside Monaco**: Press `Ctrl+Enter` (or `Cmd+Enter`) while cursor is focused inside Monaco editor text area. Confirm compilation triggers and PDF preview renders.
- [ ] **TEST 8 — Undo / Redo**: Edit text. Press `Ctrl+Z` / `Ctrl+Y` inside Monaco. Confirm undo/redo operates properly.
- [ ] **TEST 9 — Project Switch Source Load**: Create Project B. Switch back and forth between Project A and Project B. Confirm Monaco editor re-renders target LaTeX source without cursor artifacts.
- [ ] **TEST 10 — Unique Project Naming**: Create new projects. Confirm names auto-increment (`Untitled Resume`, `Untitled Resume 2`, etc.).
- [ ] **TEST 11 — Rename Duplicate Validation**: Try renaming active project to an existing project name (case-insensitive). Confirm red error message appears: `"A project with this name already exists."`.
- [ ] **TEST 12 — Import `.tex` into Monaco**: Click "Import .tex" → Select local `.tex` file. Confirm file content populates Monaco editor and saves.
- [ ] **TEST 13 — Export `.tex` from Monaco**: Click "Export .tex". Confirm downloaded `.tex` file contains exact current Monaco editor text.
- [ ] **TEST 14 — Compilation Error Banner**: Enter invalid LaTeX (e.g. `\invalidcmd`). Press `Ctrl+Enter`. Confirm red compilation error panel expands in workspace.
- [ ] **TEST 15 — PDF Download**: Click Download PDF after compilation. Confirm PDF downloads as `<project-name>.pdf`.
