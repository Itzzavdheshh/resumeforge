# ResumeForge — Database & Storage

---

## CURRENT STATE

**DATABASE: NOT IMPLEMENTED**

**STORAGE: NOT IMPLEMENTED**

There is currently no database, no file storage, no session store, and no persistence mechanism of any kind in the project.

All user data (the current LaTeX source) exists only in React `useState` in memory. It is lost when the browser tab is closed or the page is refreshed.

---

## Why No Database Yet

The current stage is an early local prototype. The compilation pipeline is the first thing that needed to work. Database design requires knowing what data needs to be stored, which requires understanding the feature set — which is still being defined.

---

## PLANNED DATA MODEL

> None of the following exists in code. This is a planning document only.

The following entities are likely to be needed. They will be designed in detail when database implementation begins.

---

### Entity: User

Represents a registered account.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `email` | string | Unique, used for login |
| `name` | string | Display name |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |
| `plan` | enum | `free`, `pro` (for future monetization) |

---

### Entity: Project

Represents a single resume or CV document.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `userId` | UUID | Foreign key → User |
| `name` | string | Display name, e.g. "My Resume 2026" |
| `description` | string | Optional |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |
| `isPublic` | boolean | Whether the project has a public share link |
| `shareSlug` | string? | Unique URL slug for public sharing |
| `compilerEngine` | enum | `pdflatex`, `xelatex`, `lualatex` (future) |
| `mainFile` | string | Filename of the entry point, e.g. `main.tex` |

---

### Entity: ProjectFile

Represents a single file within a project.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `projectId` | UUID | Foreign key → Project |
| `name` | string | Filename, e.g. `main.tex`, `photo.jpg` |
| `path` | string | Relative path within project |
| `content` | text? | Text files stored inline (for `.tex`, `.bib`, etc.) |
| `storageKey` | string? | Object storage key for binary files |
| `mimeType` | string | |
| `size` | int | Bytes |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

---

### Entity: Version

Represents a saved snapshot of a project at a point in time.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `projectId` | UUID | Foreign key → Project |
| `createdAt` | timestamp | When this version was saved |
| `message` | string? | Optional commit-style message |
| `snapshotKey` | string | Object storage key for the version zip |

---

### Entity: CompilationJob

Tracks individual compilation attempts.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `projectId` | UUID | Foreign key → Project |
| `userId` | UUID | Foreign key → User |
| `status` | enum | `queued`, `compiling`, `success`, `failed` |
| `engine` | enum | `pdflatex`, `xelatex`, `lualatex` |
| `startedAt` | timestamp? | |
| `finishedAt` | timestamp? | |
| `pdfKey` | string? | Object storage key of compiled PDF |
| `logKey` | string? | Object storage key of compiler log |
| `errorSummary` | string? | Short description of error |

---

## PLANNED TECHNOLOGY CHOICES

| Concern | Likely Choice | Status |
|---------|--------------|--------|
| Relational database | PostgreSQL | PLANNED |
| ORM / query builder | Prisma | PLANNED |
| Object storage | S3-compatible (AWS S3, Cloudflare R2, Supabase Storage) | PLANNED |
| Session store / cache | Redis | PLANNED |
| Migration system | Prisma Migrate | PLANNED |

**Note**: These choices have not been finalized. Do not implement any database until a specific task is scoped and approved.

---

## Notes for Future Implementation

1. Text-based `.tex` files can be stored in the database itself (as `text` or `varchar`) for simplicity.
2. Binary files (images, PDFs) should be stored in object storage with a reference key in the database.
3. Version history can be implemented as either database snapshots or object storage archives (zip files).
4. The database schema should be designed to support multi-file projects from the start, even if the initial UI only edits one file.
