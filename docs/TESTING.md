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

## Code-Level Verification Results (Prompt 3)

### Build (Production Build)

```powershell
npm run build
```

**Result (Prompt 3)**: PASS. Next.js 16.3.3 Turbopack build succeeds in 1.6s with zero errors.

### Lint Check

```powershell
npm run lint
```

**Result (Prompt 3)**: PASS. Zero errors, zero warnings. (`react-hooks/set-state-in-effect` warning resolved via `queueMicrotask` in mount effect).

### API Endpoint Tests (PowerShell)

**Test 1: Valid LaTeX Compilation**
```powershell
$body = '{"latex":"\\documentclass{article}\n\\begin{document}\nPrompt 3 API Valid Test\n\\end{document}"}'; Invoke-RestMethod -Uri 'http://localhost:3000/api/compile' -Method POST -ContentType 'application/json' -Body $body -OutFile prompt3_test.pdf
```
- **Result**: PASS. Returned HTTP 200 with valid binary PDF (14,644 bytes).

---

## User Manual Browser Testing Checklist (Prompt 3)

The user should perform the following manual tests in the browser at `http://localhost:3000`:

- [ ] **TEST 1 — Existing compile**: Open `http://localhost:3000`. Click Compile. Verify PDF preview appears.
- [ ] **TEST 2 — Existing download**: Click Download PDF. Verify `resume.pdf` downloads successfully.
- [ ] **TEST 3 — Manual Save**: Edit LaTeX text. Click "Save (Ctrl+S)". Verify status shows "Saved" and editor tab badge displays "Saved just now".
- [ ] **TEST 4 — Refresh persistence**: Edit LaTeX text. Click Save. Refresh the browser (`F5` / `Ctrl+R`). Verify exact edited LaTeX source returns!
- [ ] **TEST 5 — Autosave**: Edit LaTeX text. Stop typing and wait 1 second. Verify editor tab badge changes from "Unsaved changes" to "Saved just now". Refresh browser and verify edits persisted.
- [ ] **TEST 6 — Unsaved state**: Type a character in the editor. Verify editor tab badge immediately displays amber badge "Unsaved changes".
- [ ] **TEST 7 — Keyboard shortcut: Ctrl/Cmd + S**: Edit LaTeX. Press `Ctrl+S` (or `Cmd+S` on Mac). Verify Save executes and browser "Save Webpage" dialog does NOT appear.
- [ ] **TEST 8 — Keyboard shortcut: Ctrl/Cmd + Enter**: Edit LaTeX. Press `Ctrl+Enter` (or `Cmd+Enter` on Mac). Verify compilation starts and status changes to "Compiling...".
- [ ] **TEST 9 — Shortcut during compilation**: Press `Ctrl+Enter` multiple times while compiling. Verify `isCompiling` guard prevents duplicate requests.
- [ ] **TEST 10 — Compilation failure**: Enter invalid LaTeX (e.g. `\invalidcommand`). Press `Ctrl+Enter`. Verify error banner appears with compiler log.
- [ ] **TEST 11 — Recovery**: Fix LaTeX. Press `Ctrl+Enter`. Verify error banner disappears and preview updates.
- [ ] **TEST 12 — Existing PDF with unsaved changes**: Compile version A. Type edits to version B without compiling. Verify preview badge still says "Latest compiled PDF" and preview iframe continues to show version A.
- [ ] **TEST 13 — Save while compiling**: Click Compile. While compilation is in progress, click Save. Verify Save is clickable and updates document save state.
- [ ] **TEST 14 — Metadata check**: Inspect browser tab title. Verify it displays `ResumeForge — LaTeX Resume Workspace`.
