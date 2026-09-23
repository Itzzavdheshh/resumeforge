# ResumeForge — Development Log

> Chronological record of all changes, tests, and outcomes.
> Add a new entry for every task/prompt.

---

## Prompt 1 — Project Foundation & Documentation
**Date**: 2026-08-26
**Result**: Documentation system established.

---

## Prompt 2 — PDF Download & PDF Lifecycle
**Date**: 2026-08-26
**Result**: Client-side PDF download feature, blob URL lifecycle management.

---

## Prompt 2.1 — Bug Fixes Found During Manual Testing
**Date**: 2026-08-26
**Result**: Structured compile error response, secondary error panel, last successful PDF retention.

---

## Prompt 3 — Document Persistence + Keyboard Workflow + Workspace Reliability
**Date**: 2026-08-26
**Result**: `localStorage` document persistence (`resumeforge:document:main`), debounced autosave, keyboard shortcuts (`Ctrl+S`, `Ctrl+Enter`).

---

## Prompt 4 — Multiple Resume Projects & Local Document Management
**Date**: 2026-08-26
**Result**: Local multi-project storage schema (`resumeforge:projects`), project CRUD, legacy migration.

---

## Prompt 4.1 — Enforce Unique Project Names & Refine Project Management UX
**Date**: 2026-08-26
**Result**: Case-insensitive unique project naming (`getUniqueProjectName`), modal error validation.

---

## Prompt 5 — Professional Monaco LaTeX Code Editor
**Date**: 2026-08-26
**Result**: Integrated `@monaco-editor/react`, `stex` syntax highlighting, line numbers, word wrap, font scaling, search widget.

---

## Prompt 6 — Multi-File LaTeX Project Architecture & File Tree
**Date**: 2026-08-26
**Result**: Multi-file storage model (`project.files`), FileTree sidebar, `main.tex` protection, path security validation, multi-file server compile API.

---

## Prompt 7 — Project Assets, Image Upload & LaTeX Image Compilation
**Date**: 2026-08-28
**Result**: Image asset upload (`.png`, `.jpg`, `.jpeg`), `ImageAssetView` preview panel, one-click `\includegraphics` snippet copying, base64 server decoding.

---

## Prompt 8 — Project ZIP Archives + Compiler Options
**Date**: 2026-08-31
**Result**: `JSZip` export/import, ZIP bomb protection, `CompilerSettingsModal` (Letter/A4 paper size, 1-pass/2-pass options).

---

## Prompt 9 — Monaco Error Highlighting & LaTeX Snippets
**Date**: 2026-08-31
**Result**: pdflatex log error parser (`latexErrors.ts`), Monaco red squiggles & auto cursor jump, categorized LaTeX snippets menu with live instant search.

---

## Prompt 10 — Professional UI/UX Redesign & Workspace Polish
**Date**: 2026-09-07
**Result**: Workspace header extraction (`AppHeader.tsx`), grouped File & Project dropdown menus, IDE file tab bar, PDF empty state card, collapsible diagnostics panel.

---

## Prompt 11 — Docker Compiler Sandbox & Isolation
**Date**: 2026-09-09
**Result**: `resumeforge-compiler:latest` Docker image, container security flags (`--net=none`, `--read-only`, `--tmpfs`, `-m 512m`, `--user 1000:1000`), 15s timeout, 503 fallback.

---

## Prompt 11.1 — Security Audit & Verification
**Date**: 2026-09-11
**Result**: Security audit pass, 17-test automated verification suite, host filesystem & network isolation audit.

---

## Prompt 11.2 — Docker LaTeX Package Compatibility Fix
**Date**: 2026-09-11
**Result**: Container TeX Live package fix (`texlive-latex-extra`, `texlive-fonts-extra`), real resume compilation verified via `/api/compile`.

---

## Prompt 12 — Professional Workspace Layout & Resizable Panels
**Date**: 2026-09-13
**Result**: Resizable/collapsible 3-panel workspace layout (`WorkspaceLayout.tsx`, `PanelDivider.tsx`), `body[data-resizing]` CSS guard, panel state persistence in `resumeforge:layout`.

---

## Prompt 13 — LaTeX Template Gallery & New Project Onboarding
**Date**: 2026-09-14
**Result**: Bundled Template Gallery (`lib/templates.ts`, `components/TemplateGalleryModal.tsx`), 4 built-in templates (Classic, Modern, Minimal, Academic) with vector SVG previews, `createProjectFromTemplate` helper, 31-test automated suite (`scripts/test-templates.ts`).

---

## Prompt 14 — GitHub Integration Foundation & Secure Account Connection

**Date**: 2026-09-15

**Objective**: Build a secure, local-first foundation for optional GitHub account connection using standard GitHub OAuth 2.0 with HTTP-only cookie session storage and CSRF state protection, preserving all existing ResumeForge features.

**What was implemented**:
- **GitHub Client Abstraction (`lib/github.ts`)**: Defined `GitHubUser` and `GitHubConnectionStatus` interfaces. Added client helpers `fetchGitHubStatus()` and `logoutGitHub()`.
- **OAuth Login Route (`app/api/github/login/route.ts`)**: `GET /api/github/login` checks server configuration (`GITHUB_CLIENT_ID`), generates cryptographically random `state` parameter using `crypto.randomUUID()`, sets `github_oauth_state` HTTP-only cookie (`maxAge: 600`), and redirects to GitHub authorization page requesting minimum scope (`read:user`).
- **OAuth Callback Route (`app/api/github/callback/route.ts`)**: `GET /api/github/callback` validates returned `state` against `github_oauth_state` cookie. Rejects mismatch with HTTP 400. Performs server-to-server POST to `https://github.com/login/oauth/access_token`. Sets `github_access_token` HTTP-only cookie (`httpOnly: true`, `sameSite: "lax"`, `secure` in production, `maxAge: 30 days`) and redirects to `/?github=connected`.
- **Authenticated User Route (`app/api/github/user/route.ts`)**: `GET /api/github/user` reads `github_access_token` from HTTP-only request cookies, calls `https://api.github.com/user` with Bearer header, and returns `{ connected: true, user: { login, name, avatar_url, html_url } }`. Automatically clears cookie on 401 Unauthorized.
- **Account Disconnect Route (`app/api/github/logout/route.ts`)**: `POST /api/github/logout` clears HTTP-only session cookies and returns `{ connected: false }`.
- **GitHub Account Modal (`components/GitHubModal.tsx`)**: Modal dialog displaying disconnected state (explanation, security notices, OAuth setup guidance if unconfigured, "Connect GitHub" action) and connected state (user avatar, handle `@username`, connection badge, "Disconnect GitHub" action).
- **Workspace Header & App Integration (`components/AppHeader.tsx`, `app/page.tsx`)**: Added `GitHub` menu item in Project dropdown and standalone GitHub connection button in header displaying status (`@username` when connected). Managed URL params (`?github=connected` / `?github_error=...`), displaying status notification and cleaning URL query params.
- **Security & Token Isolation**: Tokens are stored exclusively in HTTP-only cookies managed server-side. No credentials, access tokens, or PATs are ever written to `localStorage`, project files, or client JavaScript bundles.
- **Automated Verification Suite (`scripts/test-github.ts`)**: 11-test automated suite verifying token isolation, minimum `read:user` scope, CSRF state validation, mismatch rejection, logout behavior, and core application regression testing.

**Quality Assurance**:
- `npx tsc --noEmit`: PASS (0 errors)
- `npm run lint`: PASS (0 errors, 0 warnings)
- `npm run build`: PASS (Next.js 16.3.3 build succeeds in 5.1s)
- `scripts/test-github.ts`: PASS (11 / 11 tests passed)
- `scripts/test-templates.ts`: PASS (31 / 31 tests passed)

---

## Prompt 15 — GitHub Repository Integration & Safe ResumeForge Project Export

**Date**: 2026-09-16

**Objective**: Build repository integration and safe one-way ResumeForge project export to GitHub, enabling users to select existing repositories, create new repositories, inspect repository file overlap, decode binary images, and export multi-file LaTeX projects with atomic Git commits.

**What was implemented**:
- **Repository List & Creation API (`app/api/github/repos/route.ts`)**: `GET /api/github/repos` lists accessible repositories using `github_access_token` session cookie. `POST /api/github/repos` creates a new public or private repository with `auto_init: true`.
- **Repository Inspection API (`app/api/github/repos/inspect/route.ts`)**: `GET /api/github/repos/inspect?owner=X&repo=Y&branch=Z` checks default branch and lists existing root files to warn about potential file overwrites before export.
- **Project Export & Git Database Commit API (`app/api/github/export/route.ts`)**: `POST /api/github/export` validates project files and path security (rejects path traversal `../`, absolute paths, `.env.local`, `.git`), decodes Base64 Data URLs for images into raw binary base64 content, checks for file overwrites requiring explicit confirmation, creates blobs -> tree -> commit -> updates branch reference atomically via GitHub Git Database API, and returns commit SHA + HTML URL.
- **Data Model Link (`lib/storage.ts`)**: Added `github?: ProjectGitHubMetadata` to `ResumeProject` model and `updateProjectGitHubMetadata` helper function for persisting non-secret linked repo metadata.
- **Multi-Step GitHub Workspace UI (`components/GitHubModal.tsx`)**: Upgraded modal with tabs: Account, Repositories (search filter, inline create form), Export (project summary, file preview, commit message, overwrite warning checkbox, export progress & commit SHA link).
- **Automated Verification Suite (`scripts/test-github.ts`)**: Expanded to 21 tests covering path traversal rejection, image base64 decoding, repository creation validation, overwrite safety, metadata persistence without secrets, and template/blank project regression.

---

## Prompt 16 — GitHub Repository Pull & Remote Change Detection

**Date**: 2026-09-23

**Objective**: Implement read-only remote GitHub repository inspection and change detection, allowing users to inspect linked remote repositories, detect remote modifications/additions/deletions, compute file status breakdown (`UNCHANGED`, `LOCAL_ONLY`, `REMOTE_ONLY`, `MODIFIED_LOCAL`, `MODIFIED_REMOTE`, `CONFLICT`), and display human-readable status explanations without altering local project files or pushing to GitHub.

**What was implemented**:
- **Comparison & Normalization Engine (`lib/githubCompare.ts`)**: Built text line ending normalization (`normalizeTextContent`), binary image base64 extraction (`extractRawBase64`), content equality checking (`areContentsEqual`), and 6-state change classification (`classifyFileChange`).
- **Client Helper & Types (`lib/github.ts`)**: Exported `FileChangeStatus`, `FileComparisonItem`, and `RepoPullResult` data models, and implemented `pullAndCompareGitHubRepo()` client helper.
- **Server Inspection API (`app/api/github/repos/pull/route.ts`)**: Implemented `POST /api/github/repos/pull` endpoint that authenticates via HTTP-only session cookie, validates owner/repo/branch inputs, enforces strict path security (`sanitizePath`), fetches remote branch commit SHA & recursive Git tree via GitHub API, decodes remote blob contents, compares against local project files, and returns structured summary counts and file breakdowns.
- **Remote Inspection UI (`components/GitHubModal.tsx`)**: Extended modal with "Compare / Check Remote" tab featuring a read-only security badge, target repository details, status count pills, loading state indicator, error alerts, and a file list displaying status badges, size comparisons, and detailed explanations.
- **Automated Verification Suite (`scripts/test-github.ts`)**: Expanded test suite to 32 tests covering text line ending normalization, base64 data URL vs raw base64 binary equivalence, all 6 change classifications, path traversal rejection, non-destructive storage isolation, and project template regressions.

**Quality Assurance**:
- `npx tsx scripts/test-github.ts`: PASS (33 / 33 tests passed)
- `npx tsx scripts/test-templates.ts`: PASS (27 / 27 tests passed)
- `npx tsc --noEmit`: PASS (0 errors)
- `npm run lint`: PASS (0 errors, 0 warnings)
- `npm run build`: PASS (Next.js 16.3.3 Turbopack build succeeds)

---

## Prompt 17 — ResumeForge UI Layout & Modal Overflow Fix (UI/UX Stabilization Pass)

**Date**: 2026-09-24

**Objective**: Perform a dedicated UI/UX stabilization pass to eliminate GitHub modal viewport overflow, nested scrollbar chains, inaccessible close buttons, status pill grid density issues, and cramped Monaco editor toolbar controls without modifying backend APIs, storage schemas, or GitHub integration logic.

**What was implemented**:
- **Viewport-Aware Modal Shell (`components/GitHubModal.tsx`)**: Replaced outer `overflow-y-auto` backdrop with `overflow-hidden flex items-center justify-center p-3 sm:p-4` and constrained inner container to `w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden`.
- **Fixed Header & Anchored Close Control**: Fixed modal header and tab bar as `shrink-0` anchored sections at top of modal shell. Fixed close target (`✕`) button size (`h-8 w-8 min-h-[32px] min-w-[32px] rounded-lg`) so it never scrolls off-screen.
- **Single Modal Scroll Region**: Eliminated nested scrollbars (`max-h-60 overflow-y-auto`, `max-h-52 overflow-y-auto`) by wrapping modal body content in a single `flex-1 min-h-0 overflow-y-auto` container.
- **Responsive Status Grid & Truncation**: Replaced 1-row status cards with `grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono` and added `truncate` / `min-w-0` to long file paths and commit SHAs.
- **Editor Toolbar Responsiveness (`components/LatexEditor.tsx`)**: Added `min-w-0 flex-1 overflow-hidden` and `truncate max-w-[120px] sm:max-w-[200px]` to active file tab, and grouped Snippets/Wrap/Font size controls with `shrink-0` to prevent horizontal toolbar overflow down to 768px viewports.
- **Prompt 12 Workspace & Prompt 14/15/16 Preservation**: Verified 100% preservation of 3-panel resizable layout, collapse controls (`‹` / `›`), `+ File`, `+ Image`, and GitHub API integrations.

**Quality Assurance**:
- `npx tsx scripts/test-github.ts`: PASS (33 / 33 tests passed)
- `npx tsx scripts/test-templates.ts`: PASS (27 / 27 tests passed)
- `npx tsc --noEmit`: PASS (0 errors)
- `npm run lint`: PASS (0 errors, 0 warnings)
- `npm run build`: PASS (Next.js 16.3.3 Turbopack build succeeds)



