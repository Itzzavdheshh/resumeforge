"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  StoredProjects,
  ResumeProject,
  initialLatexSample,
  loadProjectsData,
  saveProjectsData,
  createProject,
  updateActiveProjectContent,
  renameProject,
  duplicateProject,
  deleteProject,
  sanitizeFilename,
} from "@/lib/storage";

// Dynamic import for client-only Monaco Editor component
const LatexEditor = dynamic(() => import("@/components/LatexEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-sm text-zinc-500 font-mono">
      Loading LaTeX Editor...
    </div>
  ),
});

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
  const [projectsData, setProjectsData] = useState<StoredProjects | null>(null);
  const [latex, setLatex] = useState(initialLatexSample);
  const [lastSavedLatex, setLastSavedLatex] = useState(initialLatexSample);
  const [status, setStatus] = useState("Ready");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // UI state for project management
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSaveRef = useRef<() => void>(() => {});
  const handleCompileRef = useRef<() => void>(() => {});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Active project helper
  const activeProject: ResumeProject | undefined = projectsData?.projects.find(
    (p) => p.id === projectsData.activeProjectId
  );

  // Load saved multi-project data from localStorage after client hydration
  useEffect(() => {
    const loaded = loadProjectsData();
    if (loaded && loaded.projects.length > 0) {
      queueMicrotask(() => {
        setProjectsData(loaded);
        const active = loaded.projects.find((p) => p.id === loaded.activeProjectId) || loaded.projects[0];
        setLatex(active.latex);
        setLastSavedLatex(active.latex);
        setLastSavedAt(active.updatedAt);
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

  // Close project selector dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset PDF preview and compiler error state when changing active projects
  const clearPdfState = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setErrorDetails(null);
    setStatus("Ready");
  }, [pdfUrl]);

  // Execute save logic for current active project
  const executeSave = useCallback((contentToSave: string) => {
    if (!projectsData) return;
    setSaveStatus("saving");

    const updated = updateActiveProjectContent(projectsData, contentToSave);
    setProjectsData(updated);
    setLastSavedLatex(contentToSave);

    const updatedActive = updated.projects.find((p) => p.id === updated.activeProjectId);
    setLastSavedAt(updatedActive?.updatedAt || new Date().toISOString());
    setSaveStatus("saved");
    setStatus("Saved");

    setTimeout(() => {
      setStatus((prev) => (prev === "Saved" ? "Ready" : prev));
    }, 1500);
  }, [projectsData]);

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

  // Handle editor string value changes with debounced autosave
  const handleLatexChangeValue = (newVal: string) => {
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

  // --- Project Management Actions ---

  const handleSwitchProject = (targetId: string) => {
    if (!projectsData || targetId === projectsData.activeProjectId) {
      setIsDropdownOpen(false);
      return;
    }

    // Save pending changes in current project before switching
    if (saveStatus === "unsaved") {
      updateActiveProjectContent(projectsData, latex);
    }

    const updatedData: StoredProjects = {
      ...projectsData,
      activeProjectId: targetId,
    };
    saveProjectsData(updatedData);
    setProjectsData(updatedData);

    const targetProject = updatedData.projects.find((p) => p.id === targetId)!;
    setLatex(targetProject.latex);
    setLastSavedLatex(targetProject.latex);
    setLastSavedAt(targetProject.updatedAt);
    setSaveStatus("saved");

    // Clear PDF preview & errors for new project
    clearPdfState();
    setIsDropdownOpen(false);
  };

  const handleCreateNewProject = () => {
    if (!projectsData) return;

    if (saveStatus === "unsaved") {
      updateActiveProjectContent(projectsData, latex);
    }

    const { data: updatedData, newProject } = createProject(projectsData);
    setProjectsData(updatedData);

    setLatex(newProject.latex);
    setLastSavedLatex(newProject.latex);
    setLastSavedAt(newProject.updatedAt);
    setSaveStatus("saved");

    clearPdfState();
    setIsDropdownOpen(false);
  };

  const handleOpenRenameModal = () => {
    if (!activeProject) return;
    setRenameInput(activeProject.name);
    setRenameError(null);
    setIsRenameModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleConfirmRename = () => {
    if (!projectsData || !activeProject) return;

    const res = renameProject(projectsData, activeProject.id, renameInput);
    if (!res.success) {
      setRenameError(res.error || "Invalid project name.");
      return;
    }

    setProjectsData(res.data);
    setRenameError(null);
    setIsRenameModalOpen(false);
  };

  const handleDuplicateProject = () => {
    if (!projectsData || !activeProject) return;

    if (saveStatus === "unsaved") {
      updateActiveProjectContent(projectsData, latex);
    }

    const res = duplicateProject(projectsData, activeProject.id);
    if (!res) return;

    setProjectsData(res.data);
    setLatex(res.newProject.latex);
    setLastSavedLatex(res.newProject.latex);
    setLastSavedAt(res.newProject.updatedAt);
    setSaveStatus("saved");

    clearPdfState();
    setIsDropdownOpen(false);
  };

  const handleDeleteProject = () => {
    if (!projectsData || !activeProject || projectsData.projects.length <= 1) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${activeProject.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    const { data: updatedData, deleted } = deleteProject(projectsData, activeProject.id);
    if (!deleted) return;

    setProjectsData(updatedData);
    const newActive = updatedData.projects.find((p) => p.id === updatedData.activeProjectId)!;

    setLatex(newActive.latex);
    setLastSavedLatex(newActive.latex);
    setLastSavedAt(newActive.updatedAt);
    setSaveStatus("saved");

    clearPdfState();
    setIsDropdownOpen(false);
  };

  const handleExportTex = () => {
    if (!activeProject) return;

    const filename = `${sanitizeFilename(activeProject.name)}.tex`;
    const blob = new Blob([latex], { type: "text/plain;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (saveStatus === "unsaved") {
      const confirmReplace = window.confirm(
        "Importing a file will replace your current unsaved edits. Do you want to continue?"
      );
      if (!confirmReplace) {
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const importedText = event.target?.result;
      if (typeof importedText === "string") {
        setLatex(importedText);

        // Immediately update storage for active project
        if (projectsData) {
          const updated = updateActiveProjectContent(projectsData, importedText);
          setProjectsData(updated);
          setLastSavedLatex(importedText);
          const updatedActive = updated.projects.find((p) => p.id === updated.activeProjectId);
          setLastSavedAt(updatedActive?.updatedAt || new Date().toISOString());
        }

        setSaveStatus("saved");
        clearPdfState();
      }
    };

    reader.readAsText(file, "UTF-8");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">ResumeForge</h1>
            <p className="text-xs text-zinc-500">LaTeX Resume Workspace</p>
          </div>

          {/* Project Selector Dropdown */}
          {activeProject && (
            <div className="relative border-l border-zinc-800 pl-4" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                aria-label="Select resume project"
              >
                <span className="max-w-[160px] truncate">{activeProject.name}</span>
                <span className="text-xs opacity-60">▼</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute left-4 top-11 z-50 w-64 rounded-xl border border-zinc-800 bg-zinc-900 py-2 shadow-2xl">
                  <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Resume Projects
                  </div>
                  <div className="max-h-48 overflow-auto py-1">
                    {projectsData?.projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSwitchProject(p.id)}
                        className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-zinc-800 ${
                          p.id === activeProject.id
                            ? "bg-zinc-800/80 font-semibold text-white"
                            : "text-zinc-300"
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {p.id === activeProject.id && (
                          <span className="text-[11px] font-normal text-zinc-400">Active</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-1 border-t border-zinc-800 pt-1">
                    <button
                      onClick={handleCreateNewProject}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      <span>+ New Resume</span>
                    </button>
                    <button
                      onClick={handleOpenRenameModal}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      <span>Rename Active Project</span>
                    </button>
                    <button
                      onClick={handleDuplicateProject}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      <span>Duplicate Project</span>
                    </button>
                    {projectsData && projectsData.projects.length > 1 && (
                      <button
                        onClick={handleDeleteProject}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300"
                      >
                        <span>Delete Active Project</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-3">
          {/* Import / Export Controls */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label="Import .tex file"
          >
            Import .tex
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".tex"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            onClick={handleExportTex}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label="Export LaTeX source (.tex)"
          >
            Export .tex
          </button>

          <div className="h-4 w-px bg-zinc-800" />

          <span
            className="max-w-[140px] truncate text-sm text-zinc-500"
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
              download={`${activeProject ? sanitizeFilename(activeProject.name) : "resume"}.pdf`}
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

      {/* Rename Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-96 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl">
            <h2 className="text-base font-semibold">Rename Project</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Enter a unique name for your resume project.
            </p>
            <input
              type="text"
              value={renameInput}
              onChange={(e) => {
                setRenameInput(e.target.value);
                setRenameError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmRename();
                if (e.key === "Escape") setIsRenameModalOpen(false);
              }}
              autoFocus
              className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              aria-label="Project name input"
            />
            {renameError && (
              <p className="mt-2 text-xs font-medium text-red-400" role="alert">
                {renameError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRename}
                disabled={!renameInput.trim()}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace */}
      <section className="grid h-[calc(100vh-4rem)] grid-cols-2">
        {/* Monaco LaTeX Code Editor */}
        <LatexEditor
          value={latex}
          onChange={handleLatexChangeValue}
          onSave={handleSave}
          onCompile={handleCompile}
          saveStatus={saveStatus}
          saveStatusText={formatSavedTime(lastSavedAt)}
          projectName={activeProject?.name}
        />

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