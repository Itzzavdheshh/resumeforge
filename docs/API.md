# ResumeForge — API Reference

---

## CURRENT API

> All current endpoints are IMPLEMENTED unless otherwise stated.

---

### POST `/api/compile`

**Status**: IMPLEMENTED

**Purpose**: Accepts a LaTeX source string, compiles it using pdfLaTeX on the server, and returns the resulting PDF binary.

**Authentication**: NONE (unauthenticated — any caller can use this endpoint)

**Rate Limiting**: NONE

---

#### Request

| Property | Value |
|----------|-------|
| Method | `POST` |
| Path | `/api/compile` |
| Content-Type | `application/json` |

**Body**:
```json
{
  "latex": "\\documentclass{article}\n\\begin{document}\nHello world\n\\end{document}"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `latex` | `string` | Yes | Full LaTeX source to compile |

---

#### Success Response

| Property | Value |
|----------|-------|
| Status | `200 OK` |
| Content-Type | `application/pdf` |
| Content-Disposition | `inline; filename="resume.pdf"` |
| Body | PDF binary (raw bytes) |

---

#### Error Responses

**400 Bad Request** — Missing or invalid `latex` field:
```json
{
  "error": "No LaTeX source provided."
}
```

**500 Internal Server Error** — Compilation failed or system error:
```json
{
  "error": "<pdfLaTeX stderr or stdout output, or error message>"
}
```

---

#### Notes

- Compilation uses a hardcoded path to pdfLaTeX: `C:\texlive\2026\bin\windows\pdflatex.exe`
- A temporary directory is created per request and deleted after completion
- The 30-second timeout applies to the pdfLaTeX process only; the HTTP request itself has no explicit timeout
- Compilation is single-pass — cross-references and TOC may be incomplete in complex documents
- The raw pdfLaTeX log is returned in the error body — it is not parsed or formatted

---

## PLANNED API

> None of the following endpoints exist yet. All are PLANNED.
> Do not implement these unless specifically instructed.

---

### POST `/api/auth/signup` — PLANNED
Register a new user account.

### POST `/api/auth/login` — PLANNED
Authenticate a user, return session token.

### POST `/api/auth/logout` — PLANNED
Invalidate the current session.

---

### GET `/api/projects` — PLANNED
List all projects (resumes) for the authenticated user.

### POST `/api/projects` — PLANNED
Create a new project.

### GET `/api/projects/:id` — PLANNED
Get project metadata and file list.

### PATCH `/api/projects/:id` — PLANNED
Update project metadata (name, settings).

### DELETE `/api/projects/:id` — PLANNED
Delete a project.

---

### GET `/api/projects/:id/files` — PLANNED
List files in a project.

### GET `/api/projects/:id/files/:fileId` — PLANNED
Get a specific file's content.

### PUT `/api/projects/:id/files/:fileId` — PLANNED
Save/update a file's content.

### POST `/api/projects/:id/files` — PLANNED
Upload a new file to a project (e.g., an image, `.cls`, `.sty`).

### DELETE `/api/projects/:id/files/:fileId` — PLANNED
Delete a file from a project.

---

### POST `/api/projects/:id/compile` — PLANNED
Enqueue a compilation job for a project. Returns a job ID.

### GET `/api/projects/:id/compile/:jobId` — PLANNED
Poll the status of a compilation job.

### GET `/api/projects/:id/compile/:jobId/pdf` — PLANNED
Get the compiled PDF (signed URL or inline).

### GET `/api/projects/:id/compile/:jobId/log` — PLANNED
Get the full compiler log for a job.

---

### GET `/api/projects/:id/versions` — PLANNED
List version history for a project.

### GET `/api/projects/:id/versions/:versionId` — PLANNED
Get a specific historical version.

### POST `/api/projects/:id/versions/:versionId/restore` — PLANNED
Restore a project to a specific version.

---

### POST `/api/projects/:id/export` — PLANNED
Export the project as a downloadable `.zip` archive containing source files.

### POST `/api/projects/:id/share` — PLANNED
Create or update a public sharing link for a project.

### DELETE `/api/projects/:id/share` — PLANNED
Remove the public sharing link.

---

### POST `/api/ai/suggest` — PLANNED
Use AI to suggest LaTeX improvements or generate content.
