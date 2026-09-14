# ResumeForge — Project Structure

---

## Repository Root

```
resumeforge/
├── .git/                   Git repository data
├── .next/                  Next.js build output (gitignored)
├── app/                    Next.js App Router source
│   ├── api/
│   │   └── compile/
│   │       └── route.ts    POST /api/compile — LaTeX compilation endpoint
│   ├── favicon.ico         Browser tab icon
│   ├── globals.css         Global CSS (Tailwind import + CSS variables)
│   ├── layout.tsx          Root HTML layout (server component)
│   └── page.tsx            Main workspace page & Template Gallery integration
├── compiler/               Docker compiler sandbox assets (Prompt 11)
│   ├── Dockerfile          pdflatex execution container build file
│   └── entrypoint.sh       Container entrypoint execution script
├── components/             UI Components
│   ├── AppHeader.tsx       Top header, branding, project dropdown & menus
│   ├── CompilerSettingsModal.tsx  Paper size (Letter/A4) & pass options modal
│   ├── FileTree.tsx        Left panel multi-file tree sidebar & actions
│   ├── ImageAssetView.tsx  Image asset preview & snippet generator panel
│   ├── LatexEditor.tsx     Monaco editor wrapper & error line decorations
│   ├── LatexSnippetsMenu.tsx  Instant live-searchable LaTeX snippet insertion dropdown
│   ├── PanelDivider.tsx    Draggable & keyboard-accessible panel divider strip
│   ├── TemplateGalleryModal.tsx  Template Gallery dialog & category filters (Prompt 13)
│   └── WorkspaceLayout.tsx Resizable/collapsible 3-panel layout manager
├── docs/                   Project documentation
├── lib/                    Shared core utilities
│   ├── dockerCompiler.ts   Docker container spawn & security isolation manager
│   ├── latexErrors.ts      pdflatex log parser & diagnostic extractor
│   ├── layoutStorage.ts    Workspace panel width & collapse state persistence
│   ├── storage.ts          Multi-file project storage CRUD & template helpers
│   ├── templates.ts        Bundled resume templates & SVG visual previews (Prompt 13)
│   └── zip.ts              JSZip project archive export & import utilities
├── scripts/                Automated test scripts
│   └── test-templates.ts  Automated template registry & compilation test runner (Prompt 13)
├── node_modules/           npm dependencies (gitignored)
├── public/                 Static assets served at root
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

### `app/`

The Next.js App Router source directory. Following Next.js conventions:
- `page.tsx` renders the main workspace page, handling template selection and project state.
- `app/api/compile/route.ts` provides the POST endpoint for pdflatex compilation.

### `lib/`

Contains core business logic:
- `storage.ts`: Handles project data CRUD, `localStorage` persistence, unique naming, and `createProjectFromTemplate`.
- `templates.ts`: Defines bundled `Classic`, `Modern`, `Minimal`, and `Academic` templates with SVG previews.
- `dockerCompiler.ts`: Manages secure Docker container compilation.
- `layoutStorage.ts`: Persists panel widths and collapse states in `resumeforge:layout`.

### `scripts/`

Automated test runners for CI and agent verification:
- `scripts/test-templates.ts`: Verifies template definitions, metadata, multi-file structure, independence, and Docker pdflatex compilation.
