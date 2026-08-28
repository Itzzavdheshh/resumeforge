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

## Code-Level Verification Results (Prompt 7)

### Build (Production Build)

```powershell
npm run build
```

**Result (Prompt 7)**: PASS. Next.js 16.3.3 Turbopack build succeeds in 1.5s with zero errors.

### Lint Check

```powershell
npm run lint
```

**Result (Prompt 7)**: PASS. Zero errors, zero warnings.

### Automated API Tests (Node.js)

```powershell
node scratch/test_image_compile.js
```

- **Test 1: Image Asset Compilation (`\includegraphics{images/test.png}`)**: PASS (Returned HTTP 200 OK with 25,725 byte binary PDF containing embedded image).
- **Test 2: Oversized Image Rejection (> 5 MB)**: PASS (Returned HTTP 400 Bad Request with size limit error message).
- **Test 3: Path Traversal Security Rejection (`../hack.png`)**: PASS (Returned HTTP 400 Bad Request with path security message).

---

## User Manual Browser Testing Checklist (Prompt 7)

The user should perform the following manual tests in the browser at `http://localhost:3000`:

- [ ] **TEST 1 — Existing Project Migration**: Open `http://localhost:3000`. Confirm existing project files remain intact.
- [ ] **TEST 2 — FileTree Categories**: Confirm FileTree sidebar displays `LaTeX Code` (`📄`) and `Images` (`🖼`) categories.
- [ ] **TEST 3 — Upload PNG Image**: Click `+ Img` in FileTree → Select a local `.png` image file. Confirm image uploads cleanly.
- [ ] **TEST 4 — Image Placement**: Confirm uploaded image appears under `images/` directory in FileTree (e.g. `images/profile.png`).
- [ ] **TEST 5 — Select Image Asset**: Click `images/profile.png` in FileTree. Confirm `ImageAssetView` opens in the middle column.
- [ ] **TEST 6 — Image Details & Preview**: Confirm image preview, size (KB), MIME type (`image/png`), and path information are displayed correctly.
- [ ] **TEST 7 — Copy LaTeX Snippet**: Click "Copy LaTeX Snippet" in `ImageAssetView`. Confirm "Copied ✓" feedback appears.
- [ ] **TEST 8 — Embed Image in LaTeX**: Select `main.tex` → Paste `\includegraphics[width=0.4\textwidth]{images/profile.png}` into the document body.
- [ ] **TEST 9 — Image Compilation**: Click Compile (or press `Ctrl+Enter`). Confirm compilation succeeds with HTTP 200.
- [ ] **TEST 10 — Embedded Image in PDF Preview**: Inspect PDF preview iframe. Confirm uploaded image is visually rendered inside the compiled PDF.
- [ ] **TEST 11 — Collision-Safe Upload**: Upload another file with the same filename (`profile.png`). Confirm filename auto-increments to `profile-2.png` without overwriting original.
- [ ] **TEST 12 — Delete Image Asset**: Hover `images/profile-2.png` → Click delete icon (`✕`) → Confirm deletion dialog. Confirm file is deleted cleanly.
- [ ] **TEST 13 — Refresh Persistence**: Refresh browser (`F5`). Confirm uploaded images, paths, and content persist in `localStorage`.
- [ ] **TEST 14 — Duplicate Project with Images**: Duplicate project containing image assets. Confirm duplicated project has independent copies of all images.
- [ ] **TEST 15 — Delete Duplicated Project**: Delete duplicated project. Confirm original project images remain untouched.
- [ ] **TEST 16 — Oversized Image Rejection**: Try uploading an image > 2 MB. Confirm browser alert displays `"Image file exceeds maximum allowed size of 2 MB."`.
- [ ] **TEST 17 — Invalid File Rejection**: Try uploading a `.pdf` or `.exe` via image upload. Confirm upload is rejected.
- [ ] **TEST 18 — Path Security Validation**: Confirm no file paths can escape the temporary compiler sandbox directory.
- [ ] **TEST 19 — Monaco Stability**: Confirm selecting an image file switches middle column to `ImageAssetView` without crashing Monaco.
- [ ] **TEST 20 — Save Button Disabled for Images**: Select an image asset. Confirm header Save button is disabled (images are auto-persisted on upload).
- [ ] **TEST 21 — PDF Isolation**: Switch to another project. Confirm PDF preview clears. Switch back to original project and compile. Confirm image renders cleanly.
- [ ] **TEST 22 — PDF Download**: Download compiled PDF containing embedded image. Confirm PDF opens locally with rendered image.
- [ ] **TEST 23 — Shortcut Ctrl+S**: Select `main.tex` → Edit code → Press `Ctrl+S`. Confirm project saves.
- [ ] **TEST 24 — Shortcut Ctrl+Enter**: Press `Ctrl+Enter`. Confirm project compiles.
- [ ] **TEST 25 — Compilation Failure Recovery**: Enter invalid LaTeX → Compile (error panel displays) → Fix LaTeX → Compile (previews updated PDF).
- [ ] **TEST 26 — Rename Image Asset**: Hover image asset -> Click rename (`✎`) -> Enter `headshot.png`. Confirm file renames cleanly.
- [ ] **TEST 27 — Export `.tex`**: Select `main.tex` -> Click "Export .tex". Confirm source file downloads.
- [ ] **TEST 28 — Import `.tex`**: Click "Import .tex" -> Select local `.tex` file. Confirm main.tex updates cleanly without destroying project image assets.
