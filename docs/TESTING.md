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

## Code-Level Verification Results (Prompt 4)

### Build (Production Build)

```powershell
npm run build
```

**Result (Prompt 4)**: PASS. Next.js 16.3.3 Turbopack build succeeds in 3.0s with zero errors.

### Lint Check

```powershell
npm run lint
```

**Result (Prompt 4)**: PASS. Zero errors, zero warnings.

### API Endpoint Tests (PowerShell)

**Test 1: Valid LaTeX Compilation**
```powershell
$body = '{"latex":"\\documentclass{article}\n\\begin{document}\nPrompt 4 API Valid Test\n\\end{document}"}'; Invoke-RestMethod -Uri 'http://localhost:3000/api/compile' -Method POST -ContentType 'application/json' -Body $body -OutFile prompt4_test.pdf
```
- **Result**: PASS. Returned HTTP 200 with valid binary PDF (14,729 bytes).

---

## User Manual Browser Testing Checklist (Prompt 4)

The user should perform the following manual tests in the browser at `http://localhost:3000`:

- [ ] **TEST 1 — Prompt 3 Migration**: Open `http://localhost:3000`. Confirm existing Prompt 3 resume migrates safely into project "My Resume".
- [ ] **TEST 2 — Create Project**: Click project selector dropdown → Click "+ New Resume". Confirm new project "Untitled Resume" is created and set active.
- [ ] **TEST 3 — Switch Projects**: Click dropdown → Select "My Resume". Confirm editor loads "My Resume" LaTeX source and PDF preview is cleared.
- [ ] **TEST 4 — Independent Source**: Edit Project A LaTeX. Switch to Project B. Edit Project B. Switch back to Project A. Confirm each project retains its exact edits.
- [ ] **TEST 5 — PDF Isolation**: Compile Project A. Confirm PDF preview renders. Switch to Project B. Confirm Project A's PDF is NOT shown in Project B (resets to empty state).
- [ ] **TEST 6 — Compile Project B**: Click Compile in Project B. Confirm PDF preview renders for Project B.
- [ ] **TEST 7 — Switch Back Isolation**: Switch back to Project A. Confirm Project B's PDF is NOT shown.
- [ ] **TEST 8 — Rename Project**: Click dropdown → "Rename Active Project" → Type "Software Dev CV" → Click Rename. Refresh browser. Confirm renamed name persists.
- [ ] **TEST 9 — Duplicate Project**: Click dropdown → "Duplicate Project". Confirm duplicated project "Software Dev CV Copy" is created with independent ID and identical content.
- [ ] **TEST 10 — Duplicate Independence**: Edit duplicate project source. Switch to original project. Confirm original project is unchanged.
- [ ] **TEST 11 — Delete Project**: Click dropdown → "Delete Active Project" → Confirm dialog. Confirm deleted project disappears and active project switches to remaining project.
- [ ] **TEST 12 — Delete Safeguard**: Delete projects until only 1 project remains. Confirm "Delete Active Project" option is disabled or hidden.
- [ ] **TEST 13 — Export `.tex`**: Click "Export .tex". Confirm browser downloads `<project-name>.tex` file containing exact editor source code.
- [ ] **TEST 14 — Import `.tex`**: Click "Import .tex" → Select local `.tex` file. Confirm file text loads into editor, saves to active project, and PDF preview clears.
- [ ] **TEST 15 — Import Error/Cancel Safety**: Click "Import .tex" → Cancel file picker or select non-file. Confirm application does not crash and current content remains safe.
- [ ] **TEST 16 — Refresh Persistence**: Refresh browser (`F5`). Confirm project list, active project, and LaTeX content persist in `localStorage`.
- [ ] **TEST 17 — Keyboard Shortcut Ctrl+S**: Edit LaTeX. Press `Ctrl+S` (or `Cmd+S` on Mac). Confirm active project saves without browser save dialog.
- [ ] **TEST 18 — Keyboard Shortcut Ctrl+Enter**: Press `Ctrl+Enter` (or `Cmd+Enter` on Mac). Confirm compilation starts and PDF renders.
- [ ] **TEST 19 — Compilation Failure UX**: Enter invalid LaTeX (e.g. `\invalidcmd`). Press `Ctrl+Enter`. Confirm structured error banner appears.
- [ ] **TEST 20 — Recovery After Failure**: Fix LaTeX. Press `Ctrl+Enter`. Confirm error banner disappears and preview updates.
- [ ] **TEST 21 — Save While Compiling**: Click Compile. Click Save while compiling. Confirm Save triggers "Saved" status feedback.
- [ ] **TEST 22 — PDF Download Filename**: Compile project named "My Resume". Click Download PDF. Confirm downloaded file is named `My-Resume.pdf`.
