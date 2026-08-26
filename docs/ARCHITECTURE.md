# ResumeForge — Technical Architecture

---

## CURRENT ARCHITECTURE

> **Status as of Prompt 1 (2026-08-26)**
> This section describes what actually exists in the repository today.

### Overview

```
Browser (React Client Component — app/page.tsx)
  │
  │  POST /api/compile
  │  Body: { latex: string }
  ↓
Next.js 16.3.3 App Router
  API Route Handler (Node.js, server-side)
  app/api/compile/route.ts
  │
  │  1. Parse JSON body
  │  2. fs.mkdtemp() → create temp dir in OS tmpdir
  │  3. fs.writeFile() → write main.tex
  │  4. execFileAsync(pdflatex, [...args], { cwd: tempDir })
  │  5. fs.readFile(main.pdf) → Buffer
  │  6. fs.rm(tempDir, { recursive, force }) → cleanup
  │
  │  Response: application/pdf binary
  ↓
Browser
  │  response.blob()
  │  URL.createObjectURL(blob) → object URL
  │
  ↓
<iframe src={objectUrl} />   (PDF preview rendered by browser PDF viewer)
```

### Current Components

| Component | Type | File | Description |
|-----------|------|------|-------------|
| Workspace Page | React Client Component | `app/page.tsx` | Entire UI: editor, preview, header |
| Root Layout | React Server Component | `app/layout.tsx` | Fonts, HTML wrapper |
| Compile API | Next.js Route Handler | `app/api/compile/route.ts` | Receives LaTeX, runs pdfLaTeX, returns PDF |

### Current State Management

All state lives in React `useState` inside `app/page.tsx`:
- `latex: string` — current LaTeX source
- `status: string` — status message in header
- `pdfUrl: string | null` — object URL of the most recently compiled PDF

No server-side state. No database. No session. No local storage.

### Current Compiler Integration

| Property | Value |
|----------|-------|
| Executable | `C:\texlive\2026\bin\windows\pdflatex.exe` (hardcoded absolute path) |
| Flags | `-interaction=nonstopmode`, `-halt-on-error`, `-file-line-error` |
| Working directory | Unique temp dir per request (`os.tmpdir()/resumeforge-XXXXX`) |
| Timeout | 30,000ms (30 seconds) |
| Cleanup | `fs.rm(tempDir, { recursive: true, force: true })` in `finally` block |

### Current Security Model

**There is no security model.** The API is completely open:
- No authentication
- No rate limiting
- No sandboxing of the LaTeX process
- LaTeX can execute arbitrary shell commands, read/write the filesystem, and make network requests
- No input validation beyond checking `typeof latex === "string"`

This is acceptable for local development only.

---

## PLANNED / TARGET ARCHITECTURE

> **Status: PLANNED — not yet implemented**
> This section describes the intended long-term production architecture.
> Do not treat this as existing.

### High-Level Production Vision

```
Browser
  ↓
Next.js Frontend (App Router)
  ↓
REST / API Layer (Next.js API Routes or separate service)
  ↓
Authentication Middleware (future)
  ↓
Compilation Queue (future — e.g., BullMQ or similar)
  ↓
Isolated Compiler Worker (future)
  ↓
Docker Sandbox (future — per-job container)
  ↓
TeX Live (inside container)
  ↓
pdfLaTeX / XeLaTeX / LuaLaTeX
  ↓
PDF output
  ↓
Object/File Storage (future — S3 or equivalent)
  ↓
Signed URL returned to frontend
  ↓
Browser PDF Preview
```

### Planned Component Breakdown

| Component | Technology | Status |
|-----------|-----------|--------|
| Frontend | Next.js + React | IMPLEMENTED (basic) |
| Code Editor | Monaco Editor or CodeMirror | PLANNED |
| Auth | NextAuth.js or Clerk | PLANNED |
| Database | PostgreSQL (likely) via Prisma | PLANNED |
| File Storage | S3-compatible object storage | PLANNED |
| Compilation Queue | BullMQ + Redis | PLANNED |
| Compiler Worker | Isolated Node.js + Docker | PLANNED |
| Compiler Sandbox | Docker container (TeX Live) | PLANNED |
| Caching | Redis | PLANNED |
| CDN | Cloudflare or similar | PLANNED |

### Key Architectural Decisions Pending

1. **Compiler selection** — pdfLaTeX vs XeLaTeX vs LuaLaTeX vs Tectonic (not yet decided; do not assume pdfLaTeX is the final engine)
2. **Queue system** — BullMQ vs cloud-native (SQS, Pub/Sub) vs simple in-memory
3. **Auth provider** — NextAuth, Clerk, Supabase Auth, or self-hosted
4. **Database** — PostgreSQL via Prisma is the likely choice; not yet decided
5. **Storage** — S3, Supabase Storage, Cloudflare R2; not yet decided
6. **Deployment** — Vercel vs self-hosted; not yet decided

---

## Current vs Planned Comparison

| Concern | Current | Planned |
|---------|---------|---------|
| Compiler location | Local Windows machine | Docker container (server-side) |
| Compiler isolation | None | Full container sandbox |
| Compiler path | Hardcoded | Environment variable / config |
| Auth | None | Per-user accounts |
| Persistence | None | PostgreSQL + object storage |
| Queue | None | BullMQ or similar |
| Error reporting | Raw error string in status bar | Full compiler log viewer |
| PDF delivery | Blob URL in iframe | Signed URL from object storage |
