# ResumeForge — Technical Architecture

---

## CURRENT ARCHITECTURE

> **Status as of Prompt 11 (2026-09-10)**
> This section describes what actually exists in the repository today.

### High-Level Architecture Overview

```
Browser (Next.js 16.3.3 App Router — Client-Side IDE Application)
  │
  ├── AppHeader (`components/AppHeader.tsx`)
  │     ├── Brand Title & Logo Mark
  │     ├── Project Selector Dropdown (Switch, New, Rename, Duplicate, Delete)
  │     ├── Grouped Menus: File (Import/Export .tex) & Project (Import/Export .zip, Settings)
  │     └── Action Bar (Save status, Save Ctrl+S, Download PDF, Compile Ctrl+Enter)
  │
  ├── 3-Panel IDE Workspace (`app/page.tsx`)
  │     ├── Sidebar FileTree (`components/FileTree.tsx`) — .tex code & image asset explorer
  │     ├── Code / Asset View Column (`components/LatexEditor.tsx` / `ImageAssetView.tsx`)
  │     │     ├── Active Editor File Tab (`[📄 main.tex] [root]`)
  │     │     ├── LatexSnippetsMenu with Live Search (`components/LatexSnippetsMenu.tsx`)
  │     │     ├── Wrap Toggle & Font Size Stepper
  │     │     └── Monaco Editor with Syntax Tokens & Error Markers
  │     └── PDF Preview Column
  │           ├── PDF Preview Header & Settings Badges (LETTER/A4 • Passes)
  │           ├── Collapsible Compiler Error Panel (`Compiler Diagnostics (N Errors) ▼`)
  │           ├── PDF Iframe Viewer (retains last successful PDF on error)
  │           └── Empty State Card ("No PDF Compiled Yet")
  │
  ├── Compiler Settings Modal (`components/CompilerSettingsModal.tsx`)
  │
  ├── LocalStorage Persistence (`lib/storage.ts` — key: `resumeforge:projects`)
  │     └── Multi-Project Schema: StoredProjects -> ResumeProject[] -> ProjectFile[]
  │
  └── POST /api/compile
        │  Body: { files: [{ path, type, content, mimeType }], options: { paperSize, passes } }
        ↓
  Next.js 16.3.3 API Route Handler (`app/api/compile/route.ts`)
        │
        ├── 1. Validate security: path traversal, duplicates, image sizes, main.tex presence
        ├── 2. Create isolated temp directory (`fs.mkdtemp()`)
        ├── 3. Write all `.tex` files & decode/write binary image assets (`images/`)
        ├── 4. Call `compileWithDocker()` → lib/dockerCompiler.ts
        │
        ↓
  Docker Bridge (`lib/dockerCompiler.ts`)
        │
        ├── isDockerAvailable(): `docker info` check (8s timeout, augmented PATH for Windows)
        ├── Build `docker run` command with full security flags (see below)
        ├── Execute Pass 1 → `resumeforge-compiler:latest`
        ├── (Optional) Execute Pass 2 for cross-references
        ├── Read output `main.pdf` binary Buffer
        └── Force cleanup `docker rm -f <containerName>` on exit
        │
        ↓
  Docker Container (`resumeforge-compiler:latest` — Debian Bookworm Slim)
        │
        ├── --net=none               (zero network access)
        ├── --read-only              (immutable root filesystem)
        ├── --tmpfs /tmp             (RAM disk for aux files, noexec)
        ├── -v <tempDir>:/workspace  (scoped volume mount, per-request)
        ├── --user 1000:1000         (latexuser — non-root execution)
        ├── -m 512m                  (memory cap)
        ├── --cpus=1.5               (CPU quota)
        ├── --pids-limit=64          (fork bomb prevention)
        ├── --rm                     (auto-cleanup on exit)
        └── pdflatex -interaction=nonstopmode -halt-on-error -file-line-error <input>
        │
        └── If Docker unavailable: returns 503 (structured error)
             │
             └── Dev fallback (ALLOW_HOST_COMPILER_FALLBACK=true env only):
                   Host pdflatex at C:\texlive\2026\bin\windows\pdflatex.exe
                   [SECURITY WARNING emitted to server console]
```

### Current Workspace Components

| Component | Type | File | Description |
|-----------|------|------|-------------|
| Application Header | React Client Component | `components/AppHeader.tsx` | Brand title, Project Selector dropdown, File/Project menus, Save/Download/Compile actions |
| Workspace Page | React Client Component | `app/page.tsx` | Main 3-panel workspace shell, state orchestration, PDF preview iframe, collapsible error panel |
| File Tree Sidebar | React Client Component | `components/FileTree.tsx` | File tree explorer with section categories, root `main.tex` badge, hover rename/delete, file/image upload |
| Code Editor Engine | Client-Side (`monaco-editor`) | `components/LatexEditor.tsx` | Monaco editor with stex syntax tokenization, error line markers, active IDE tab, font size/wrap toggles |
| Snippets Menu | React Client Component | `components/LatexSnippetsMenu.tsx` | LaTeX snippets menu with live search input, category hierarchy, cursor offset placement |
| Image Asset View | React Client Component | `components/ImageAssetView.tsx` | Preview panel for uploaded image assets (`.png`, `.jpg`), dimensions, base64 metadata, copy LaTeX snippet button |
| Compiler Settings Modal | React Client Component | `components/CompilerSettingsModal.tsx` | Modal dialog for paper size (Letter vs A4) and compilation passes (Single vs Double Pass) per project |
| Storage & Data Layer | TypeScript Utility | `lib/storage.ts` | LocalStorage persistence, multi-project data model, automatic migrations, unique project naming |
| ZIP Archive Layer | TypeScript Utility | `lib/zip.ts` | Client-side atomic ZIP archive export & import via `JSZip` with strict security limits |
| Error Parser Layer | TypeScript Utility | `lib/latexErrors.ts` | Regex parser converting raw pdfLaTeX log output into structured `LatexError[]` with file paths & line numbers |
| Docker Compiler Bridge | TypeScript Utility | `lib/dockerCompiler.ts` | Sandboxed compilation bridge: `isDockerAvailable()`, `compileWithDocker()`, `runDockerCommand()` with full security flags |
| Compile API | Next.js Route Handler | `app/api/compile/route.ts` | Multi-file and image-aware server compilation endpoint routing through Docker sandbox |
| Docker Image | Container | `compiler/Dockerfile` + `compiler/compile.sh` | Debian Bookworm + TeX Live base image with `latexuser` (UID 1000) and pdflatex entrypoint |

---

## SECURITY & STABILITY GUARANTEES

- **Docker Sandbox Isolation**: All LaTeX compilation runs inside `resumeforge-compiler:latest` with `--net=none`, `--read-only`, `--user 1000:1000`, `-m 512m`, `--cpus=1.5`, `--pids-limit=64`. The host filesystem is never directly exposed.
- **15-Second Hard Timeout**: Compilation is killed via `docker kill` + `SIGKILL` if it exceeds 15 seconds.
- **Path Traversal Protection**: Enforces strict relative path resolution, prohibiting `..`, absolute drives, or illegal characters in `/api/compile` and `lib/zip.ts`.
- **ZIP Import Safety**: Validates file extensions (`.tex`, `.png`, `.jpg`, `.jpeg`), verifies `main.tex` presence, and enforces strict archive limits (10 MB max upload, 20 MB max total extracted, 5 MB max per file, 100 max files).
- **Image Size Enforcement**: Each image asset is validated server-side (5 MB max) before writing to disk.
- **503 Graceful Degradation**: If Docker Desktop is not running, returns a structured 503 error instead of crashing.
- **Blob Memory Cleanup**: Revokes Blob URLs (`URL.revokeObjectURL`) upon component unmount, document switching, or PDF recompilation to prevent browser memory leaks.
