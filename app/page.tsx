"use client";

import { useState, useEffect } from "react";

const initialLatex = `\\documentclass[letterpaper,11pt]{article}

\\begin{document}

\\begin{center}
  {\\Huge \\scshape Avdhesh Kumar Dadhich} \\\\
  \\vspace{4pt}
  \\small Software Engineer \\textbullet\\ Full Stack Developer
\\end{center}

\\section{Professional Summary}

Third-year B.Tech. CSE student with hands-on experience
building full-stack web applications, REST APIs, and developer tools.

\\section{Projects}

\\textbf{Nexora} --- Mentorship \\& Career Growth Platform

\\begin{itemize}
  \\item Built a full-stack mentorship platform.
  \\item Used React, Node.js, Express.js and PostgreSQL.
\\end{itemize}

\\section{Education}

Jodhpur Institute of Engineering and Technology (JIET)

\\end{document}`;

export default function Home() {
  const [latex, setLatex] = useState(initialLatex);
  const [status, setStatus] = useState("Ready");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Clean up object URLs to prevent memory leaks when pdfUrl changes or component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleSave = () => {
    setStatus("Saved");
    setTimeout(() => setStatus("Ready"), 1500);
  };

  const handleCompile = async () => {
    if (isCompiling) return;

    try {
      setIsCompiling(true);
      setStatus("Compiling...");
      setErrorDetails(null);

      const response = await fetch("/api/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latex }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const details =
          errorData.details ||
          errorData.error ||
          "LaTeX compilation failed. Check your source for syntax errors.";

        setErrorDetails(details);
        setStatus(
          pdfUrl
            ? "Compilation failed (showing previous PDF)"
            : "Compilation failed"
        );
        return;
      }

      const pdfBlob = await response.blob();
      const newPdfUrl = URL.createObjectURL(pdfBlob);

      setPdfUrl(newPdfUrl);
      setStatus("Compiled successfully");
    } catch (error) {
      console.error("Compile error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Compilation failed";
      setErrorDetails(errorMessage);
      setStatus(
        pdfUrl
          ? "Compilation failed (showing previous PDF)"
          : "Compilation failed"
      );
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">ResumeForge</h1>
          <p className="text-xs text-zinc-500">LaTeX Resume Workspace</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="max-w-xs truncate text-sm text-zinc-500"
            title={status}
          >
            {status}
          </span>

          <button
            onClick={handleSave}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label="Save resume draft"
          >
            Save
          </button>

          {pdfUrl && !isCompiling ? (
            <a
              href={pdfUrl}
              download="resume.pdf"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              aria-label="Download compiled PDF resume"
            >
              Download PDF
            </a>
          ) : (
            <button
              disabled
              className="rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-600 opacity-50 cursor-not-allowed"
              aria-label="Download PDF (unavailable)"
            >
              Download PDF
            </button>
          )}

          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label="Compile LaTeX to PDF"
          >
            {isCompiling ? "Compiling..." : "Compile"}
          </button>
        </div>
      </header>

      {/* Workspace */}
      <section className="grid h-[calc(100vh-4rem)] grid-cols-2">
        {/* Editor */}
        <div className="flex min-h-0 flex-col border-r border-zinc-800">
          <div className="border-b border-zinc-800 px-4 py-3">
            <span className="text-sm font-medium">main.tex</span>
          </div>

          <textarea
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none bg-zinc-950 p-5 font-mono text-sm leading-6 text-zinc-300 outline-none"
            aria-label="LaTeX source code editor"
          />
        </div>

        {/* Preview & Error Column */}
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <span className="text-sm font-medium">PDF Preview</span>
            {pdfUrl && errorDetails && (
              <span className="text-xs font-medium text-amber-400">
                Showing last successful PDF (latest compile failed)
              </span>
            )}
            {pdfUrl && !errorDetails && (
              <span className="text-xs text-zinc-500">
                Latest compiled PDF
              </span>
            )}
          </div>

          {/* Error Banner when compilation fails */}
          {errorDetails && (
            <div
              className="border-b border-red-900/60 bg-red-950/40 p-4 text-xs"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center justify-between font-semibold text-red-400">
                <span>Compilation Error</span>
                <button
                  onClick={() => setErrorDetails(null)}
                  className="rounded px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  aria-label="Dismiss error details"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-zinc-300">
                LaTeX compilation failed. Check your LaTeX source code for syntax errors.
              </p>
              <pre className="mt-2.5 max-h-36 overflow-auto rounded border border-red-900/50 bg-zinc-950 p-2.5 font-mono text-[11px] leading-4 text-red-300">
                {errorDetails}
              </pre>
            </div>
          )}

          {/* PDF Viewer Container */}
          <div className="flex flex-1 bg-zinc-900">
            {pdfUrl ? (
              <iframe
                key={pdfUrl}
                src={pdfUrl}
                title="Resume PDF Preview"
                className="h-full w-full border-0"
              />
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-2xl">
                    PDF
                  </div>

                  <h2 className="text-lg font-medium">PDF Preview</h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    Compile your resume to see the PDF here.
                  </p>

                  <p className="mt-4 text-xs text-zinc-600">No PDF loaded</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}