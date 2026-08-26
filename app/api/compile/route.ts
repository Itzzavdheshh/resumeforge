import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  let tempDir = "";

  try {
    const body = await request.json();
    const latex = body.latex;

    if (!latex || typeof latex !== "string") {
      return NextResponse.json(
        { error: "No LaTeX source provided." },
        { status: 400 }
      );
    }

    // Create a temporary folder for this compilation.
    tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "resumeforge-")
    );

    const texFile = path.join(tempDir, "main.tex");

    // Write the user's LaTeX into main.tex.
    await fs.writeFile(texFile, latex, "utf8");

    // TeX Live 2026 on your Windows machine.
    const pdflatex =
      "C:\\texlive\\2026\\bin\\windows\\pdflatex.exe";

    // Compile.
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
    // Delete temporary compilation files.
    if (tempDir) {
      await fs.rm(tempDir, {
        recursive: true,
        force: true,
      }).catch(() => {});
    }
  }
}