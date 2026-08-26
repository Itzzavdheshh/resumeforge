# ResumeForge — Future Improvements

> Ideas and enhancements for future consideration.
> These are NOT in scope for the current development phase.
> They are recorded here to avoid losing good ideas.

---

## Functionality

### Core Compilation

- **Multi-pass compilation** — Run pdfLaTeX 2–3 times to resolve cross-references, TOC, and bibliography. Most complex documents require this.
- **BibTeX / Biber support** — Run BibTeX between pdfLaTeX passes for bibliography generation.
- **Engine selection** — Let users choose between pdfLaTeX, XeLaTeX, and LuaLaTeX. Different fonts and packages require different engines.
- **Compilation caching** — Cache compilation results; only recompile if source changed.
- **Compilation history** — Store the last N compilation attempts with their logs and outputs.
- **Watch mode** — Auto-compile when the source changes (with a debounce delay).
- **Incremental compilation** — Reuse cached auxiliary files across compilations.

### Multi-File Support

- **Multiple files per project** — Allow users to have `main.tex`, `sections/experience.tex`, `bibliography.bib`, etc.
- **File tree** — Show project files in a sidebar.
- **Custom `.cls` / `.sty` files** — Allow uploading custom document classes and style files.
- **Image upload** — Allow uploading images referenced by `\includegraphics`.

### Project Management

- **Multiple resumes** — Dashboard to manage multiple projects.
- **Project templates** — Start a new project from a built-in template.
- **Project cloning** — Duplicate an existing project to create a variant.
- **Project settings** — Name, description, compiler engine, main file.

### Version History

- **Autosave snapshots** — Automatic snapshots every N minutes or on each save.
- **Named versions** — Let users label specific versions.
- **Diff viewer** — Side-by-side diff between two versions.
- **Rollback** — Restore any previous version.

### Import / Export

- **Import `.tex` file** — Upload a single `.tex` file to start a new project.
- **Import `.zip` archive** — Upload a multi-file LaTeX project.
- **Export as `.zip`** — Download the full project source.
- **Export to Google Drive** — Save the PDF or source to Google Drive.
- **Export to GitHub** — Push source to a GitHub repository.

---

## UI

- **Resizable panels** — Drag to resize the editor/preview split.
- **Floating toolbar** — Format buttons for common LaTeX commands.
- **Snippet library** — Insert common LaTeX structures (tables, lists, math).
- **Dark/light mode toggle** — Currently forced dark; add light mode option.
- **Full-screen PDF** — View the PDF in full screen.
- **PDF page thumbnail strip** — Navigate long PDFs with a thumbnail strip.
- **Mobile layout** — Responsive layout that works on phones and tablets.
- **Custom fonts** — Let users choose the UI font.
- **Editor themes** — Multiple editor color schemes (Monokai, Solarized, etc.).
- **Custom keyboard shortcuts** — Configurable keybindings.

---

## UX

- **Onboarding flow** — Guide new users through creating their first resume.
- **Template picker** — Show template previews when starting a new project.
- **Error recovery** — If a save fails, offer to retry or export to local file.
- **"Unsaved changes" warning** — Warn before closing the tab with unsaved changes (via `beforeunload`).
- **Smart error messages** — Parse pdfLaTeX errors and show human-readable explanations.
- **Line jump from error** — Click on a compiler error to jump to that line in the editor.
- **Progress indicator** — Show estimated compilation time.
- **Success animation** — Subtle animation when PDF is ready.
- **Tutorial mode** — Annotated walkthrough for first-time users.
- **Keyboard-first navigation** — Full keyboard operability.

---

## Performance

- **Lazy load Monaco Editor** — The editor library is large; load it asynchronously.
- **PDF streaming** — Stream the PDF to the browser as it's generated rather than buffering it fully.
- **Worker thread for compilation** — Move compilation to a worker thread to avoid blocking the Node.js event loop.
- **CDN for static assets** — Serve fonts, SVGs, etc. from a CDN.
- **Service worker** — Cache static assets for faster repeat loads.
- **Redis caching** — Cache recently compiled PDFs for identical source inputs.

---

## Security

- **Docker sandbox** — Compile LaTeX in an isolated Docker container (required before public launch).
- **`--no-shell-escape` flag** — Explicitly disable shell escape in pdfLaTeX.
- **Network isolation** — Disable all network access inside the compilation container.
- **Memory and CPU limits** — Enforce resource limits per compilation job.
- **Input size limit** — Reject requests where the LaTeX source exceeds a certain size.
- **Rate limiting** — Per-IP and per-user request limits.
- **CAPTCHA** — Challenge suspicious high-volume clients.
- **Content Security Policy** — Add CSP headers to prevent XSS.
- **CORS configuration** — Restrict API access to the application domain.
- **Dependency auditing** — Regular `npm audit` in CI.

---

## Compiler

- **Multiple engine support** — pdfLaTeX, XeLaTeX, LuaLaTeX.
- **Tectonic evaluation** — Assess Tectonic as a self-contained Rust TeX engine.
- **Package pre-warming** — Pre-install commonly used LaTeX packages in the Docker image.
- **Custom TeX Live installation** — Smaller TeX Live subset to reduce container size.
- **Compilation queue** — Async job queue for scalable compilation under load.
- **Real-time log streaming** — Stream the compiler output to the frontend as it runs.

---

## Architecture

- **Monorepo** — Separate frontend and backend into packages if the codebase grows.
- **API versioning** — Version the API (`/api/v1/compile`) before shipping publicly.
- **Background jobs** — Use a job queue for long-running tasks (compilation, exports).
- **Health check endpoint** — `GET /api/health` for monitoring.
- **Metrics** — Track compilation success rates, durations, and error types.
- **Structured logging** — Replace `console.error` with structured logging (e.g., Pino).
- **Error tracking** — Integrate Sentry or similar for error reporting.

---

## Integrations

- **Google Drive** — Save/load projects from Google Drive.
- **GitHub** — Pull `.tex` source from a GitHub repo; push changes back.
- **Overleaf import** — Import projects exported from Overleaf (ZIP format).
- **ORCID** — Link academic identity for researchers.
- **LinkedIn** — Import LinkedIn profile as a starting point for resume content.

---

## AI

- **Resume writing assistant** — AI suggestions for improving resume content.
- **LaTeX generation** — Generate LaTeX code from plain text descriptions.
- **Grammar and style** — Check and improve resume writing.
- **ATS optimization** — Suggest changes to improve applicant tracking system scores.
- **Auto-formatting** — AI that fixes common LaTeX formatting issues.

---

## Accessibility

- **Keyboard navigation** — All interactive elements reachable via keyboard.
- **Screen reader support** — Proper ARIA labels and roles.
- **High contrast mode** — Alternative color scheme for users with visual impairments.
- **Font size controls** — Increase/decrease editor and UI font size.
- **Focus indicators** — Visible focus rings on all interactive elements.

---

## Mobile

- **Responsive layout** — Collapsible panels for small screens.
- **Touch-friendly controls** — Larger tap targets for compile/save buttons.
- **Mobile PDF viewer** — Optimize PDF preview for touch interfaces.
- **iOS / Android PWA** — Progressive web app installable on mobile.

---

## Developer Experience

- **Automated tests** — Unit, integration, and E2E tests.
- **CI/CD pipeline** — GitHub Actions for lint, test, and build on every PR.
- **Docker development environment** — Reproducible local setup via Docker Compose.
- **`.env.example`** — Document all required environment variables.
- **API documentation** — Auto-generated API docs (e.g., via OpenAPI/Swagger).
- **Component Storybook** — Visual component library for UI consistency.
- **Changelog** — Machine-readable changelog (e.g., Keep a Changelog format).
