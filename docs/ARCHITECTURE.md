# ResumeForge — Technical Architecture

---

## CURRENT ARCHITECTURE

> **Status as of Prompt 14 (2026-09-15)**

### High-Level Architecture Overview

```
Browser (Next.js 16.3.3 App Router — Client-Side IDE Application)
  │
  ├── AppHeader (`components/AppHeader.tsx`)
  │     ├── Brand Title & Logo Mark
  │     ├── Project Selector Dropdown (Switch, New, Rename, Duplicate, Delete)
  │     ├── Grouped Menus: File (Import/Export .tex) & Project (Import/Export .zip, Settings, GitHub)
  │     ├── Standalone GitHub Connection Button (@username / GitHub badge)
  │     └── Action Bar (Save status, Save Ctrl+S, Download PDF, Compile Ctrl+Enter)
  │
  ├── 3-Panel IDE Workspace (`app/page.tsx` + `components/WorkspaceLayout.tsx`)
  │     ├── Sidebar FileTree (`components/FileTree.tsx`) — .tex code & image asset explorer
  │     ├── Code / Asset View Column (`components/LatexEditor.tsx` / `ImageAssetView.tsx`)
  │     └── PDF Preview Column with Settings Badges & Collapsible Diagnostics
  │
  ├── Modals Layer
  │     ├── Template Gallery Modal (`components/TemplateGalleryModal.tsx`)
  │     ├── Compiler Settings Modal (`components/CompilerSettingsModal.tsx`)
  │     └── GitHub Account Modal (`components/GitHubModal.tsx`)
  │
  ├── LocalStorage Persistence (`lib/storage.ts` — `resumeforge:projects`, `lib/layoutStorage.ts` — `resumeforge:layout`)
  │
  ├── POST /api/compile → Next.js API Route → Docker Sandbox (`resumeforge-compiler:latest`)
  │
  └── GitHub OAuth API Routes (`lib/github.ts`)
        ├── GET /api/github/login (OAuth redirect & CSRF state cookie)
        ├── GET /api/github/callback (CSRF validation, server-to-server token exchange, HTTP-only cookie)
        ├── GET /api/github/user (Reads HTTP-only session cookie, fetches identity from api.github.com)
        └── POST /api/github/logout (Clears HTTP-only session cookies)
```

### Current Workspace Components

| Component | Type | File | Description |
|-----------|------|------|-------------|
| Application Header | React Client Component | `components/AppHeader.tsx` | Brand title, Project Selector dropdown, File/Project menus, GitHub status, Save/Download/Compile actions |
| Workspace Page | React Client Component | `app/page.tsx` | Main 3-panel workspace shell, state orchestration, PDF preview iframe, collapsible error panel |
| Resizable Workspace Layout | React Client Component | `components/WorkspaceLayout.tsx` | 3-panel resizable/collapsible layout manager with persistence in `resumeforge:layout` |
| File Tree Sidebar | React Client Component | `components/FileTree.tsx` | File tree explorer with section categories, root `main.tex` badge, hover rename/delete, file/image upload |
| Code Editor Engine | Client-Side (`monaco-editor`) | `components/LatexEditor.tsx` | Monaco editor with stex syntax tokenization, error line markers, active IDE tab, font size/wrap toggles |
| Template Gallery Modal | React Client Component | `components/TemplateGalleryModal.tsx` | Modal dialog for template selection with category tabs and offline vector SVG preview mockups |
| GitHub Account Modal | React Client Component | `components/GitHubModal.tsx` | Connection status modal displaying connected GitHub account identity, disconnect action, and security notices |
| GitHub Client Abstraction | TypeScript Utility | `lib/github.ts` | Types (`GitHubUser`, `GitHubConnectionStatus`) and client status fetchers |
| GitHub API Handlers | Next.js Route Handlers | `app/api/github/*` | OAuth redirect, callback code exchange, user identity fetcher, and logout handler with HTTP-only cookies |
| Storage & Data Layer | TypeScript Utility | `lib/storage.ts` | LocalStorage persistence, multi-project data model, automatic migrations, `createProjectFromTemplate` helper |
| Docker Compiler Bridge | TypeScript Utility | `lib/dockerCompiler.ts` | Sandboxed compilation bridge: `isDockerAvailable()`, `compileWithDocker()` with full security flags |
| Compile API | Next.js Route Handler | `app/api/compile/route.ts` | Multi-file and image-aware server compilation endpoint routing through Docker sandbox |

---

## SECURITY & STABILITY GUARANTEES

- **GitHub OAuth HTTP-Only Session Cookies**: Access tokens are stored exclusively in HTTP-only cookies (`github_access_token`). Zero credentials or PATs are ever saved in `localStorage` or exposed to client JavaScript.
- **CSRF State Parameter Protection**: Login route generates cryptographically random `state` UUID stored in short-lived HTTP-only cookie (`github_oauth_state`). Mismatches are rejected with HTTP 400.
- **Minimum Permission Scope**: Requests only `read:user` scope during account connection.
- **Docker Sandbox Isolation**: All LaTeX compilation runs inside `resumeforge-compiler:latest` with `--net=none`, `--read-only`, `--user 1000:1000`, `-m 512m`, `--cpus=1.5`, `--pids-limit=64`.
- **15-Second Hard Timeout**: Compilation is killed via `docker kill` + `SIGKILL` if it exceeds 15 seconds.
- **Path Traversal Protection**: Enforces strict relative path resolution, prohibiting `..`, absolute drives, or illegal characters in `/api/compile` and `lib/zip.ts`.
