import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

const execFileAsync = promisify(execFile);

const MAX_SERVER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB max image limit on compile API

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

    // Support payload formats:
    // NEW: { files: [{ path, type, content, mimeType }], options?: { paperSize, passes } }
    // OLD (backward compat): { latex: string }

    let compilationFiles: Array<{
      path: string;
      type?: "tex" | "image" | "asset";
      content: string;
      mimeType?: string;
    }> = [];

    if (Array.isArray(body.files) && body.files.length > 0) {
      compilationFiles = body.files;
    } else if (typeof body.latex === "string" && body.latex.trim()) {
      compilationFiles = [{ path: "main.tex", type: "tex", content: body.latex }];
    } else {
      return NextResponse.json(
        { error: "No LaTeX source provided. Supply 'files' array or 'latex' string." },
        { status: 400 }
      );
    }

    // Parse and validate compiler options
    const rawOptions = body.options || {};
    const paperSize: "letter" | "a4" = rawOptions.paperSize === "a4" ? "a4" : "letter";
    const passes: 1 | 2 = rawOptions.passes === 2 ? 2 : 1;

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

    // Write each file (text or binary image) securely
    for (const file of compilationFiles) {
      const resolved = resolveSecurePath(tempDir, file.path);
      if (!resolved) {
        return NextResponse.json(
          { error: `Invalid file path: "${file.path}". Path traversal is not allowed.` },
          { status: 400 }
        );
      }

      // Create parent directories if needed (e.g. sections/ or images/)
      const parentDir = path.dirname(resolved);
      await fs.mkdir(parentDir, { recursive: true });

      const isImage =
        file.type === "image" ||
        file.content.startsWith("data:image/") ||
        /\.(png|jpg|jpeg)$/i.test(file.path);

      if (isImage) {
        let base64Data = file.content;
        const match = base64Data.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
        if (match) {
          base64Data = match[1];
        }

        const buffer = Buffer.from(base64Data, "base64");

        if (buffer.length > MAX_SERVER_IMAGE_SIZE_BYTES) {
          return NextResponse.json(
            { error: `Image "${file.path}" exceeds maximum size limit of 5 MB.` },
            { status: 400 }
          );
        }

        await fs.writeFile(resolved, buffer);
      } else {
        await fs.writeFile(resolved, file.content, "utf8");
      }
    }

    // TeX Live 2026 on Windows
    const pdflatex = "C:\\texlive\\2026\\bin\\windows\\pdflatex.exe";

    // Set paper size command string
    const paperDimensions =
      paperSize === "a4"
        ? "\\pdfpagewidth=210mm \\pdfpageheight=297mm \\input{main.tex}"
        : "\\pdfpagewidth=8.5in \\pdfpageheight=11in \\input{main.tex}";

    const cmdArgs = [
      "-interaction=nonstopmode",
      "-halt-on-error",
      "-file-line-error",
      paperDimensions,
    ];

    // Pass 1 Execution
    await execFileAsync(pdflatex, cmdArgs, {
      cwd: tempDir,
      timeout: 30_000,
      windowsHide: true,
    });

    // Pass 2 Execution if double-pass is enabled
    if (passes === 2) {
      await execFileAsync(pdflatex, cmdArgs, {
        cwd: tempDir,
        timeout: 30_000,
        windowsHide: true,
      });
    }

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