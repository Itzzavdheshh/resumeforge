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

> Note: `npm run dev` is already running at the time of Prompt 1.

---

## How to Run Checks

### Lint

```powershell
npm run lint
```

**Known result (Prompt 1)**: FAILS with 1 error:
```
C:\Users\itzza\Projects\resumeforge\app\api\compile\route.ts
  65:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
```

### Build (Production Build)

```powershell
npm run build
```

**Known result (Prompt 1)**: PASSES. Output:
```
▲ Next.js 16.3.3 (Turbopack)
✓ Compiled successfully in 9.4s
✓ Generating static pages (5/5)

Route (app)
┌ ○ /
├ ○ /_not-found
└ ƒ /api/compile
```

> Warning observed: `Next.js ignored package-lock.json in C:\Users\itzza because it is outside the current Git repository`. This is a Turbopack configuration note, not a build failure.

---

## How to Test the API Manually

### Test: Compile Valid LaTeX

```powershell
$body = '{"latex":"\\\\documentclass{article}\\n\\\\begin{document}\\nHello world\\n\\\\end{document}"}'
Invoke-WebRequest -Uri "http://localhost:3000/api/compile" -Method POST -ContentType "application/json" -Body $body -OutFile "test_output.pdf"
```

Expected: A valid PDF file saved to `test_output.pdf`.

### Test: Compile with Empty Body

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/compile" -Method POST -ContentType "application/json" -Body "{}"
```

Expected: `400 Bad Request` with `{ "error": "No LaTeX source provided." }`

### Test: Compile with Invalid LaTeX

```powershell
$body = '{"latex":"\\\\documentclass{article}\\n\\\\begin{document}\\nHello \\\\INVALID\\n\\\\end{document}"}'
Invoke-WebRequest -Uri "http://localhost:3000/api/compile" -Method POST -ContentType "application/json" -Body $body
```

Expected: `500 Internal Server Error` with pdfLaTeX error output in `error` field.

---

## Manual Verification Checklist

The following tests should be performed in the browser at `http://localhost:3000`:

- [ ] Page loads without error
- [ ] LaTeX editor shows the sample resume content
- [ ] Status bar shows "Ready"
- [ ] Click "Compile" — status changes to "Compiling..."
- [ ] After compilation, status changes to "Compiled successfully"
- [ ] PDF appears in the right panel
- [ ] Click "Save" — status briefly shows "Saved" then returns to previous state
- [ ] Edit the LaTeX source and recompile — new PDF appears
- [ ] Intentionally break the LaTeX (e.g., delete `\begin{document}`) and compile — error message appears in status

---

## Known Test Gaps

| Area | Gap |
|------|-----|
| Automated tests | **None exist** — zero test files in the repository |
| API unit tests | Not implemented |
| Component tests | Not implemented |
| Integration tests | Not implemented |
| E2E tests | Not implemented |
| CI/CD | Not configured |
| Test runner | Not installed (no jest, vitest, playwright, etc.) |

---

## Automated Tests (PLANNED)

> None of the following exist yet. All are PLANNED.

### Unit Tests
- Test `POST /api/compile` with valid LaTeX → returns PDF
- Test `POST /api/compile` with empty body → returns 400
- Test `POST /api/compile` with invalid LaTeX → returns 500 with error message
- Test cleanup: temp directory is always deleted

### Component Tests
- Render `<Home />`, verify editor and preview panel exist
- Click Compile button, verify fetch is called
- Mock successful response, verify `pdfUrl` state is set and iframe appears

### E2E Tests (Playwright)
- Full workflow: open app, edit LaTeX, compile, verify PDF appears
- Error workflow: break LaTeX, compile, verify error message

### Recommended Testing Stack (PLANNED)

| Type | Library |
|------|---------|
| Unit / integration | Vitest |
| Component | React Testing Library |
| E2E | Playwright |
| API mocking | MSW (Mock Service Worker) |
