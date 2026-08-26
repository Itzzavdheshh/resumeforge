# ResumeForge — Product Overview

---

## What is ResumeForge?

ResumeForge is a **browser-based LaTeX resume and CV workspace**. It allows users to write, compile, preview, and download professional LaTeX resumes entirely within the browser — without installing TeX Live, pdfLaTeX, or any LaTeX toolchain on their own computer.

---

## The Problem It Solves

Creating a professional resume in LaTeX is difficult for most people:

1. **Installation barrier** — LaTeX distributions (TeX Live, MiKTeX) are large, complex to install, and platform-specific.
2. **Learning curve** — Even experienced programmers find LaTeX tooling frustrating to configure.
3. **Collaboration** — Sharing a LaTeX resume with others means sharing source files, dependencies, and hoping they have a compatible setup.
4. **Iteration speed** — Compile-edit-preview cycles are manual and slow in desktop tools.
5. **Version fragmentation** — Different TeX versions produce different outputs.

ResumeForge eliminates all of these barriers by providing a fully managed environment in the browser.

---

## Target Users

- **Students and recent graduates** — writing their first serious resume
- **Developers and engineers** — who prefer LaTeX but want a simpler workflow
- **Academics** — who use LaTeX for CVs but don't want toolchain maintenance
- **Anyone** who wants a professional-looking resume without Word or Google Docs

---

## Core Value Proposition

> _Write LaTeX. Click Compile. Download your PDF. No installation required._

---

## What ResumeForge Is NOT

- It is NOT a word processor or WYSIWYG editor
- It is NOT a resume template builder (though templates may be added later)
- It is NOT a general LaTeX compiler for arbitrary documents (focus is resumes/CVs)
- It is NOT a collaboration platform (though sharing may be added later)
- It is NOT a replacement for a full LaTeX IDE like Overleaf — it is focused

---

## MVP Vision

A user should be able to:

1. Open ResumeForge in a browser
2. See a LaTeX editor with a sample resume
3. Edit the LaTeX
4. Click "Compile"
5. See the compiled PDF in a preview panel
6. Download the PDF

This is a functioning local prototype today.

---

## Long-Term Product Vision

A user should be able to:

- Create and manage multiple resumes/CVs
- Edit LaTeX with syntax highlighting, autocomplete, and error indicators
- Compile LaTeX with multiple engines (pdfLaTeX, XeLaTeX, LuaLaTeX)
- Preview the resulting PDF in real time (or near real time)
- Download the PDF
- Download the source as a `.zip`
- Save work with autosave
- View version history and recover previous versions
- Import existing `.tex` files or `.zip` project archives
- Use pre-built resume templates
- Create an account and store resumes in the cloud
- Share a resume publicly via a link
- Connect external storage (Google Drive, GitHub)
- Use AI assistance for resume writing and LaTeX generation
- Compile safely without any local installation

---

## Major Product Areas

| Area | Description | Status |
|------|-------------|--------|
| Editor | LaTeX source editing with syntax support | PARTIALLY IMPLEMENTED (basic textarea only) |
| Compiler | Server-side LaTeX compilation | IMPLEMENTED (local only) |
| Preview | In-browser PDF preview | IMPLEMENTED |
| Download | PDF and source download | NOT IMPLEMENTED |
| Storage | Persistence of resume content | NOT IMPLEMENTED |
| Auth | User accounts | NOT IMPLEMENTED |
| Projects | Multiple resume management | NOT IMPLEMENTED |
| Versioning | History and rollback | NOT IMPLEMENTED |
| Templates | Pre-built resume templates | NOT IMPLEMENTED |
| Import | Upload .tex / .zip files | NOT IMPLEMENTED |
| Sharing | Public resume links | NOT IMPLEMENTED |
| Integrations | Google Drive, GitHub | NOT IMPLEMENTED |
| AI | LaTeX and content assistance | NOT IMPLEMENTED |
