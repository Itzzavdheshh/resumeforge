"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { loadDocument, saveDocument } from "@/lib/storage";

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

type SaveStatus = "saved" | "unsaved" | "saving" | "error";

function formatSavedTime(isoString: string | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 10) return "Saved just now";
    if (diffSec < 60) return `Saved ${diffSec}s ago`;
    if (diffSec < 3600) return `Saved ${Math.floor(diffSec / 60)}m ago`;
    return `Saved at ${date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  } catch {
    return "Saved";
  }
}

export default function Home() {
  const [latex, setLatex] = useState(initialLatex);
  const [lastSavedLatex, setLastSavedLatex] = useState(initialLatex);
  const [status, setStatus] = useState("Ready");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSaveRef = useRef<() => void>(() => {});
  const handleCompileRef = useRef<() => void>(() => {});

  // Load saved document from localStorage after client hydration
  useEffect(() => {
    const saved = loadDocument();
    if (saved && saved.latex) {
      queueMicrotask(() => {
        setLatex(saved.latex);
        setLastSavedLatex(saved.latex);
        setLastSavedAt(saved.savedAt);
        setSaveStatus("saved");
      });
    }
  }, []);

  // Clean up object URLs to prevent memory leaks when pdfUrl changes or component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Execute save logic safely to localStorage
  const executeSave = useCallback((contentToSave: string) => {
    setSaveStatus("saving");
    const result = saveDocument(contentToSave);
    if (result) {
      setLastSavedLatex(contentToSave);
      setLastSavedAt(result.savedAt);
      setSaveStatus("saved");
      setStatus("Saved");
      setTimeout(() => {
        setStatus((prev) => (prev === "Saved" ? "Ready" : prev));
      }, 1500);
    } else {
      setSaveStatus("error");
      setStatus("Unable to save locally");
    }
  }, []);

  const handleSave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    executeSave(latex);
  }, [executeSave, latex]);

  const handleCompile = useCallback(async () => {
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
  }, [isCompiling, latex, pdfUrl]);

  // Keep refs updated for global keyboard shortcuts
  useEffect(() => {
    handleSaveRef.current = handleSave;
    handleCompileRef.current = handleCompile;
  }, [handleSave, handleCompile]);

  // Handle textarea editing with debounced autosave
  const handleLatexChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setLatex(newVal);

    if (newVal === lastSavedLatex) {
      setSaveStatus("saved");
    } else {
      setSaveStatus("unsaved");
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      autosaveTimerRef.current = setTimeout(() => {
        executeSave(newVal);
      }, 1000);
    }
  };

  // Register global keyboard shortcuts (Ctrl+S / Cmd+S, Ctrl+Enter / Cmd+Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac =
        typeof navigator !== "undefined" &&
        /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveRef.current();
      }

      if (modifier && e.key === "Enter") {
        e.preventDefault();
        handleCompileRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
            aria-label="Save resume draft (Ctrl+S)"
          >
            Save <span className="ml-1 text-xs opacity-60">(Ctrl+S)</span>
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
            aria-label="Compile LaTeX to PDF (Ctrl+Enter)"
          >
            {isCompiling ? "Compiling..." : "Compile"}{" "}
            <span className="ml-1 text-xs opacity-60">(Ctrl+Enter)</span>
          </button>
        </div>
      </header>

      {/* Workspace */}
      <section className="grid h-[calc(100vh-4rem)] grid-cols-2">
        {/* Editor */}
        <div className="flex min-h-0 flex-col border-r border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <span className="text-sm font-medium">main.tex</span>
            <div className="text-xs">
              {saveStatus === "saving" && (
                <span className="text-zinc-400">Saving...</span>
              )}
              {saveStatus === "unsaved" && (
                <span className="font-medium text-amber-400">Unsaved changes</span>
              )}
              {saveStatus === "saved" && (
                <span className="text-zinc-500">
                  {formatSavedTime(lastSavedAt)}
                </span>
              )}
              {saveStatus === "error" && (
                <span className="font-medium text-red-400">Unable to save locally</span>
              )}
            </div>
          </div>

          <textarea
            value={latex}
            onChange={handleLatexChange}
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