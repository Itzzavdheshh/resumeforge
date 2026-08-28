import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

const execFileAsync = promisify(execFile);

// ---- Path Security -----------------------------------------

/**
 * Validates a relative file path against traversal attacks.
 * Returns the resolved absolute path within tempDir, or null if invalid.
 */
function resolveSecurePath(tempDir: string, filePath: string): string | null {
  if (!filePath || typeof filePath !== "string") return null;

  // Reject absolute paths
  if (/^[a-zA-Z]:[\\\/]/.test(filePath)) return null;
  if (filePath.startsWith("/") || filePath.startsWith("\\")) return null;

  // Normalize separators
  const normalized = filePath.replace(/\\/g, "/").trim();

  // Reject traversal sequences
  if (normalized.includes("../") || normalized.includes("..\\")) return null;
  if (normalized === "..") return null;

  // Reject segments that are ".."
  const segments = normalized.split("/");
  for (const seg of segments) {
    if (seg === "..") return null;
    if (seg === "") return null; // disallow double slashes or leading slash
  }

  const resolved = path.resolve(tempDir, normalized);

  // Final check: resolved path must be inside tempDir
  if (!resolved.startsWith(path.resolve(tempDir) + path.sep) && resolved !== path.resolve(tempDir)) {
    return null;
  }

  return resolved;
}

// ---- API Handler -------------------------------------------

export async function POST(request: NextRequest) {
  let tempDir = "";

  try {
    const body = await request.json();

    // Support two request formats:
    // NEW: { files: [{ path, content }] }
    // OLD (backward compat): { latex: string }

    let compilationFiles: Array<{ path: string; content: string }> = [];

    if (Array.isArray(body.files) && body.files.length > 0) {
      // New multi-file format
      compilationFiles = body.files;
    } else if (typeof body.latex === "string" && body.latex.trim()) {
      // Legacy single-file format
      compilationFiles = [{ path: "main.tex", content: body.latex }];
    } else {
      return NextResponse.json(
        { error: "No LaTeX source provided. Supply 'files' array or 'latex' string." },
        { status: 400 }
      );
    }

    // Validate all file entries
    for (const file of compilationFiles) {
      if (!file.path || typeof file.path !== "string") {
        return NextResponse.json(
          { error: "Each file must have a 'path' string." },
          { status: 400 }
        );
      }
      if (typeof file.content !== "string") {
        return NextResponse.json(
          { error: `File "${file.path}" must have a 'content' string.` },
          { status: 400 }
        );
      }
    }

    // Validate no duplicate paths
    const seenPaths = new Set<string>();
    for (const file of compilationFiles) {
      const lower = file.path.trim().toLowerCase();
      if (seenPaths.has(lower)) {
        return NextResponse.json(
          { error: `Duplicate file path: "${file.path}".` },
          { status: 400 }
        );
      }
      seenPaths.add(lower);
    }

    // Ensure main.tex is present
    const hasMain = compilationFiles.some(
      (f) => f.path.trim().toLowerCase() === "main.tex"
    );
    if (!hasMain) {
      return NextResponse.json(
        { error: "Project must contain a 'main.tex' file." },
        { status: 400 }
      );
    }

    // Create isolated compilation directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "resumeforge-"));

    // Write each file securely
    for (const file of compilationFiles) {
      const resolved = resolveSecurePath(tempDir, file.path);
      if (!resolved) {
        return NextResponse.json(
          { error: `Invalid file path: "${file.path}". Path traversal is not allowed.` },
          { status: 400 }
        );
      }

      // Create parent directories if needed (e.g. sections/)
      const parentDir = path.dirname(resolved);
      await fs.mkdir(parentDir, { recursive: true });

      // Write the file
      await fs.writeFile(resolved, file.content, "utf8");
    }

    // TeX Live 2026 on Windows
    const pdflatex = "C:\\texlive\\2026\\bin\\windows\\pdflatex.exe";

    // Compile main.tex
    await execFileAsync(
      pdflatex,
      [
        "-interaction=nonstopmode",
        "-halt-on-error",
        "-file-line-error",
        "main.tex",
      ],
      {
        cwd: tempDir,
        timeout: 30_000,
        windowsHide: true,
      }
    );

    const pdfFile = path.join(tempDir, "main.pdf");
    const pdf = await fs.readFile(pdfFile);

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume.pdf"',
      },
    });
  } catch (error: unknown) {
    console.error("LaTeX compilation failed:", error);

    const err = error as { stderr?: string; stdout?: string; message?: string };
    const details =
      err?.stdout ||
      err?.stderr ||
      err?.message ||
      "LaTeX compilation failed. Check your LaTeX source for errors.";

    return NextResponse.json(
      {
        error: "Compilation failed.",
        details: details,
      },
      { status: 500 }
    );
  } finally {
    // Always clean up temp directory
    if (tempDir) {
      await fs
        .rm(tempDir, { recursive: true, force: true })
        .catch(() => {});
    }
  }
}