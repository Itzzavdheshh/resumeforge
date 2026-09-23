# ResumeForge — Project Structure

---

## Repository Root

```
resumeforge/
├── .git/                   Git repository data
├── .next/                  Next.js build output (gitignored)
├── app/                    Next.js App Router source
│   ├── api/
│   │   ├── compile/
│   │   │   └── route.ts    POST /api/compile — Sandboxed LaTeX compilation endpoint
│   │   └── github/
│   │       ├── callback/route.ts  GET /api/github/callback — OAuth state validator & token exchange
│   │       ├── export/route.ts    POST /api/github/export — Atomic Git Database API project commit export
│   │       ├── login/route.ts     GET /api/github/login — OAuth redirect & CSRF state generator (repo scope)
│   │       ├── logout/route.ts    POST /api/github/logout — Clears GitHub session cookies
│   │       ├── repos/
│   │       │   ├── inspect/route.ts GET /api/github/repos/inspect — Branch & overwrite inspector
│   │       │   ├── pull/route.ts    POST /api/github/repos/pull — Read-only remote Git tree & blob inspector
│   │       │   └── route.ts        GET/POST /api/github/repos — Repo listing & creation endpoint
│   │       └── user/route.ts      GET /api/github/user — Authenticated user identity fetcher
│   ├── favicon.ico         Browser tab icon
│   ├── globals.css         Global CSS (Tailwind import + CSS variables)
│   ├── layout.tsx          Root HTML layout (server component)
│   └── page.tsx            Main workspace page & state orchestrator
├── compiler/               Docker compiler sandbox assets
│   ├── Dockerfile          pdflatex execution container build file
│   └── entrypoint.sh       Container entrypoint execution script
├── components/             UI Components
│   ├── AppHeader.tsx       Top header, branding, project dropdown, menus, & GitHub status
│   ├── CompilerSettingsModal.tsx  Paper size & pass options modal
│   ├── FileTree.tsx        Left panel multi-file tree sidebar & actions
│   ├── GitHubModal.tsx     GitHub workspace management modal (Prompt 14, 15, 16)
│   ├── ImageAssetView.tsx  Image asset preview & snippet generator panel
│   ├── LatexEditor.tsx     Monaco editor wrapper & error line decorations
│   ├── LatexSnippetsMenu.tsx  Instant live-searchable LaTeX snippet insertion dropdown
│   ├── PanelDivider.tsx    Draggable & keyboard-accessible panel divider strip
│   ├── TemplateGalleryModal.tsx  Template Gallery dialog & category filters
│   └── WorkspaceLayout.tsx Resizable/collapsible 3-panel layout manager
├── docs/                   Project documentation
├── lib/                    Shared core utilities
│   ├── dockerCompiler.ts   Docker container spawn & security isolation manager
│   ├── github.ts           GitHub integration client abstraction & types (Prompt 14, 15, 16)
│   ├── githubCompare.ts    Text line ending & base64 normalization, 6-state change engine (Prompt 16)
│   ├── latexErrors.ts      pdflatex log parser & diagnostic extractor
│   ├── layoutStorage.ts    Workspace panel width & collapse state persistence
│   ├── storage.ts          Multi-file project storage CRUD & template helpers
│   ├── templates.ts        Bundled resume templates & SVG visual previews
│   └── zip.ts              JSZip project archive export & import utilities
├── scripts/                Automated test scripts
│   ├── test-github.ts     Automated GitHub OAuth security & integration runner (Prompt 14)
│   └── test-templates.ts  Automated template registry & compilation test runner
├── .env.example            Environment configuration template (Prompt 14)
├── .gitignore              Git ignore rules
├── AGENTS.md               AI agent instructions
├── eslint.config.mjs       ESLint configuration
├── next.config.ts          Next.js configuration
├── package.json            Project manifest and scripts
├── postcss.config.mjs      PostCSS configuration for Tailwind v4
└── tsconfig.json           TypeScript configuration
```

---

## Key Directories

### `app/api/github/`

Contains GitHub OAuth 2.0 API routes:
- `login/route.ts`: Initiates OAuth authorization flow and sets CSRF `github_oauth_state` HTTP-only cookie.
- `callback/route.ts`: Validates state, exchanges code for token, and sets `github_access_token` HTTP-only cookie.
- `user/route.ts`: Reads session cookie and returns authenticated profile `{ connected: true, user: { login, name, avatar_url, html_url } }`.
- `logout/route.ts`: Deletes session cookies (`github_access_token`, `github_oauth_state`).

### `lib/`

Contains core business logic:
- `github.ts`: Exported client types and status fetchers (`fetchGitHubStatus`, `logoutGitHub`).
- `storage.ts`: Multi-project CRUD, `localStorage` persistence, unique naming, and `createProjectFromTemplate`.
- `templates.ts`: Defines bundled resume templates with vector SVG previews.
- `dockerCompiler.ts`: Sandboxed Docker execution bridge.
