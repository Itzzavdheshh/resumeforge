# ResumeForge

> **Browser-based LaTeX Resume & CV Workspace** with Docker-sandboxed pdflatex compilation, multi-file project architecture, Monaco code editor, bundled templates, and GitHub repository integration.

---

## Key Features

- 🛠️ **Monaco Code Editor**: Professional LaTeX code editing with `stex` syntax tokenization, line numbers, word wrap, font scaling, and live pdflatex error diagnostic markers.
- 📁 **Multi-File LaTeX Architecture**: Modular file tree sidebar (`main.tex`, sub-files, section files, assets).
- 🖼️ **Asset & Image Support**: Upload `.png`, `.jpg`, `.jpeg` images with instant LaTeX `\includegraphics` snippet generator.
- 🎨 **LaTeX Template Gallery**: Bundled templates (`Classic`, `Modern`, `Minimal`, `Academic`) with visual SVG previews and one-click project creation.
- 🔒 **Docker Compiler Sandbox**: Sandboxed `pdflatex` compilation container (`resumeforge-compiler:latest`) with strict memory/CPU quotas, non-root execution (`latexuser`), disabled network (`--net=none`), and 15s hard timeout.
- 🐙 **GitHub Integration & Export**: OAuth 2.0 connection with HTTP-only session cookies (`repo` scope), repository listing/creation, path traversal protection, base64 binary image decoding, and atomic Git Database commit project export.
- 🔍 **GitHub Remote Pull & Change Detection**: Read-only inspection of remote GitHub repositories, computing line ending (`\r\n` -> `\n`) and base64-normalized change status breakdowns (`UNCHANGED`, `LOCAL_ONLY`, `REMOTE_ONLY`, `MODIFIED_LOCAL`, `MODIFIED_REMOTE`, `CONFLICT`) without altering local storage.
- 💾 **Local-First Architecture**: Multi-project management in browser `localStorage`. 100% usable offline without external dependencies.

---

## Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables (Optional for GitHub OAuth)**:
   Copy `.env.example` to `.env.local`:
   ```ini
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Run Verification & Test Suites**:
   ```bash
   npx tsx scripts/test-templates.ts
   npx tsx scripts/test-github.ts
   npx tsc --noEmit
   npm run lint
   npm run build
   ```
