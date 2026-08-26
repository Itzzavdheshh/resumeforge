# ResumeForge — Product Requirements

---

## Requirement Tiers

| Tier | Meaning |
|------|---------|
| **MUST HAVE** | The product cannot function without this |
| **SHOULD HAVE** | Core user value; should be in the MVP |
| **NICE TO HAVE** | Improves the product but is not essential |
| **FUTURE** | Long-term vision; not planned for near-term development |

---

## MUST HAVE

> The product is not usable without these.

| # | Requirement | Status |
|---|-------------|--------|
| M1 | User can type/paste LaTeX source into an editor | IMPLEMENTED |
| M2 | User can trigger compilation | IMPLEMENTED |
| M3 | Compilation runs server-side (no local LaTeX required) | IMPLEMENTED (local dev only — hardcoded path) |
| M4 | Compilation produces a PDF | IMPLEMENTED |
| M5 | User can see the compiled PDF in the browser | IMPLEMENTED |
| M6 | Compilation errors are shown to the user | IMPLEMENTED (Prompt 2.1 formatted red error banner) |
| M7 | User's work is not permanently lost after a browser refresh | IMPLEMENTED (Prompt 3 `localStorage` persistence) |
| M8 | User can download the compiled PDF | IMPLEMENTED (Prompt 2 `resume.pdf` download) |

---

## SHOULD HAVE

> Core value; target for early MVP.

| # | Requirement | Status |
|---|-------------|--------|
| S1 | Editor has syntax highlighting for LaTeX | NOT IMPLEMENTED |
| S2 | Editor has line numbers | NOT IMPLEMENTED |
| S3 | User can save their work (persist locally) | IMPLEMENTED (Prompt 3 `localStorage`) |
| S4 | Autosave (debounced background save) | IMPLEMENTED (Prompt 3 1000ms debounced autosave) |
| S5 | User can download the LaTeX source | NOT IMPLEMENTED |
| S6 | Compilation errors are shown in a formatted, readable way | IMPLEMENTED (Prompt 2.1 workspace error panel) |
| S7 | User can create a new blank document | NOT IMPLEMENTED |
| S8 | Compiler path is configurable (environment variable) | NOT IMPLEMENTED |
| S9 | Page title and metadata reflect ResumeForge branding | IMPLEMENTED (Prompt 3 `app/layout.tsx`) |
| S10 | Compile button is disabled while compiling (no double-submit) | IMPLEMENTED (Prompt 2 `isCompiling` guard) |
| S11 | Loading indicator during compilation | IMPLEMENTED (Prompt 2 `isCompiling` status badge) |
| S12 | Keyboard shortcut to compile (Ctrl+Enter / Cmd+Enter) | IMPLEMENTED (Prompt 3) |
| S13 | Keyboard shortcut to save (Ctrl+S / Cmd+S) | IMPLEMENTED (Prompt 3) |

---

## NICE TO HAVE

> Meaningful improvements; ship after MVP is solid.

| # | Requirement | Status |
|---|-------------|--------|
| N1 | User can import an existing `.tex` file | NOT IMPLEMENTED |
| N2 | User can import a `.zip` project archive | NOT IMPLEMENTED |
| N3 | PDF preview has zoom controls | NOT IMPLEMENTED |
| N4 | PDF preview has page navigation | NOT IMPLEMENTED |
| N5 | Compilation runs 2 passes (resolves cross-references) | NOT IMPLEMENTED |
| N6 | Support for BibTeX / bibliography | NOT IMPLEMENTED |
| N7 | Support for multiple files in a project | NOT IMPLEMENTED |
| N8 | User can upload images and other assets | NOT IMPLEMENTED |
| N9 | Compiler output (full log) is accessible | IMPLEMENTED (Prompt 2.1 scrollable error log box) |
| N10 | Resizable editor/preview panels | NOT IMPLEMENTED |
| N11 | Status bar moved to bottom of screen | NOT IMPLEMENTED |
| N12 | Multiple resumes / project management | NOT IMPLEMENTED |
| N13 | Choice of compiler engine (pdfLaTeX / XeLaTeX / LuaLaTeX) | NOT IMPLEMENTED |

---

## FUTURE

> Long-term product vision; not planned for near-term development.

| # | Requirement | Notes |
|---|-------------|-------|
| F1 | User accounts and authentication | |
| F2 | Cloud persistence (database + file storage) | |
| F3 | Version history and rollback | |
| F4 | Resume templates | |
| F5 | Public sharing via URL | |
| F6 | Google Drive integration | |
| F7 | GitHub integration (push/pull `.tex` files) | |
| F8 | AI writing assistance | |
| F9 | AI LaTeX generation | |
| F10 | Collaborative editing (multiple users) | Complex — likely far future |
| F11 | PDF download in multiple paper sizes | A4, Letter, etc. |
| F12 | Publishable resume page (public HTML version) | |
| F13 | Secure isolated compiler (Docker sandbox) | Required before public launch |
| F14 | Rate limiting and usage quotas | Required before public launch |
| F15 | Mobile-responsive layout | |
| F16 | Analytics and usage tracking | |
| F17 | Custom domain for published resumes | |
