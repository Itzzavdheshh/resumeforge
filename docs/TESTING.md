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

## Code-Level Verification Results (Prompt 2.1)

### Build (Production Build)

```powershell
npm run build
```

**Result (Prompt 2.1)**: PASS. Next.js 16.3.3 Turbopack build succeeds in 1.3s with zero errors.

### Lint Check

```powershell
npm run lint
```

**Result (Prompt 2.1)**: PASS. Zero errors, zero warnings. (`no-explicit-any` warning in `route.ts:65` fixed).

### API Endpoint Tests (PowerShell)

**Test 1: Valid LaTeX Compilation**
```powershell
$body = '{"latex":"\\documentclass{article}\n\\begin{document}\nPrompt 2.1 API Valid Test\n\\end{document}"}'; Invoke-RestMethod -Uri 'http://localhost:3000/api/compile' -Method POST -ContentType 'application/json' -Body $body -OutFile prompt21_test.pdf
```
- **Result**: PASS. Returned HTTP 200 with valid binary PDF (14,644 bytes).

**Test 2: Invalid LaTeX Structured Error JSON**
```powershell
$body = '{"latex":"\\documentclass{article}\n\\begin{document}\n\\thisCommandDoesNotExist\n\\end{document}"}'; try { Invoke-RestMethod -Uri 'http://localhost:3000/api/compile' -Method POST -ContentType 'application/json' -Body $body } catch { $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $reader.ReadToEnd() }
```
- **Result**: PASS. Returned HTTP 500 JSON: `{"error":"Compilation failed.","details":"This is pdfTeX...\n./main.tex:3: Undefined control sequence.\nl.3 \\thisCommandDoesNotExist\n..."}`.

---

## User Manual Browser Testing Checklist (Prompt 2.1)

The user should perform the following manual tests in the browser at `http://localhost:3000`:

- [ ] **TEST A — Save button**: Open app. Edit LaTeX. Click Save. Confirm "Saved" status appears briefly and Save button is ALWAYS clickable.
- [ ] **TEST B — Save while compiling**: Click Compile. While compilation is in progress, click Save. Confirm Save button is not disabled and triggers "Saved" status feedback.
- [ ] **TEST C — Successful compilation**: Click Compile. Verify status changes to "Compiling...", Compile button shows "Compiling..." and is disabled, status changes to "Compiled successfully", PDF preview appears, Download PDF button becomes active.
- [ ] **TEST D — Intentional compilation error (Test 5 Fix)**: Enter invalid LaTeX (e.g. `\thisCommandDoesNotExist`). Click Compile. Verify header status shows "Compilation failed (showing previous PDF)", error banner expands in workspace showing full log, previous PDF remains visible in iframe, preview tab header displays "Showing last successful PDF (latest compile failed)" in amber, and Download button remains active downloading previous working PDF.
- [ ] **TEST E — Recovery (Test 6 Fix)**: Fix the invalid command in LaTeX. Click Compile. Verify error banner disappears, status updates to "Compiled successfully", preview iframe updates to new PDF, and Download PDF downloads the new version.
- [ ] **TEST F — Repeated compilation**: Click Compile multiple times rapidly. Verify UI remains responsive and double-clicking is prevented by `isCompiling`.
