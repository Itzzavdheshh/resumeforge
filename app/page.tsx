"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  StoredProjects,
  ResumeProject,
  ProjectFile,
  initialLatexSample,
  loadProjectsData,
  saveProjectsData,
  createProject,
  updateProjectFile,
  updateActiveProjectMainTex,
  renameProject,
  duplicateProject,
  deleteProject,
  createProjectFile,
  deleteProjectFile,
  renameProjectFile,
  getMainFile,
  sanitizeFilename,
  MAIN_TEX_PATH,
} from "@/lib/storage";

// Dynamic imports — client-only components
const LatexEditor = dynamic(() => import("@/components/LatexEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-sm text-zinc-500 font-mono">
      Loading LaTeX Editor...
    </div>
  ),
});

const FileTree = dynamic(() => import("@/components/FileTree"), {
  ssr: false,
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
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState(initialLatexSample);
  const [lastSavedContent, setLastSavedContent] = useState(initialLatexSample);
  const [status, setStatus] = useState("Ready");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // UI state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSaveRef = useRef<() => void>(() => {});
  const handleCompileRef = useRef<() => void>(() => {});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Derived: active project
  const activeProject: ResumeProject | undefined = projectsData?.projects.find(
    (p) => p.id === projectsData.activeProjectId
  );

  // Derived: active file object
  const activeFile: ProjectFile | undefined = activeProject?.files.find(
    (f) => f.id === activeFileId
  );

  // ---- Initialization ----------------------------------------

  useEffect(() => {
    const loaded = loadProjectsData();
    if (loaded && loaded.projects.length > 0) {
      queueMicrotask(() => {
        setProjectsData(loaded);
        const active =
          loaded.projects.find((p) => p.id === loaded.activeProjectId) ||
          loaded.projects[0];
        const mainFile = getMainFile(active);
        setActiveFileId(mainFile.id);
        setActiveFileContent(mainFile.content);
        setLastSavedContent(mainFile.content);
        setLastSavedAt(active.updatedAt);
        setSaveStatus("saved");
      });
    }
  }, []);

  // ---- Blob URL cleanup --------------------------------------

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  // ---- Click-outside dropdown --------------------------------

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---- PDF state helpers -------------------------------------

  const clearPdfState = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setErrorDetails(null);
    setStatus("Ready");
  }, [pdfUrl]);

  // ---- Save logic --------------------------------------------

  const executeSave = useCallback(
    (content: string) => {
      if (!projectsData || !activeFileId) return;
      setSaveStatus("saving");

      const updated = updateProjectFile(
        projectsData,
        projectsData.activeProjectId,
        activeFileId,
        content
      );
      setProjectsData(updated);
      setLastSavedContent(content);

      const updatedProject = updated.projects.find(
        (p) => p.id === updated.activeProjectId
      );
      setLastSavedAt(updatedProject?.updatedAt || new Date().toISOString());
      setSaveStatus("saved");
      setStatus("Saved");
      setTimeout(() => {
        setStatus((prev) => (prev === "Saved" ? "Ready" : prev));
      }, 1500);
    },
    [projectsData, activeFileId]
  );

  const handleSave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    executeSave(activeFileContent);
  }, [executeSave, activeFileContent]);

  // ---- Compile logic -----------------------------------------

  const handleCompile = useCallback(async () => {
    if (isCompiling || !activeProject) return;

    try {
      setIsCompiling(true);
      setStatus("Compiling...");
      setErrorDetails(null);

      // Build files payload from entire project (not just active file)
      // Use current in-memory content for active file, stored for others
      const compilationFiles = activeProject.files
        .filter((f) => f.type === "tex")
        .map((f) => ({
          path: f.path,
          content: f.id === activeFileId ? activeFileContent : f.content,
        }));

      const response = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: compilationFiles }),
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
  }, [isCompiling, activeProject, activeFileId, activeFileContent, pdfUrl]);

  // ---- Keep refs updated -------------------------------------

  useEffect(() => {
    handleSaveRef.current = handleSave;
    handleCompileRef.current = handleCompile;
  }, [handleSave, handleCompile]);

  // ---- Editor change handler ---------------------------------

  const handleEditorChange = (newVal: string) => {
    setActiveFileContent(newVal);

    if (newVal === lastSavedContent) {
      setSaveStatus("saved");
    } else {
      setSaveStatus("unsaved");
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        executeSave(newVal);
      }, 1000);
    }
  };

  // ---- Global keyboard shortcuts -----------------------------

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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ---- File tree actions -------------------------------------

  const handleSelectFile = (file: ProjectFile) => {
    if (!projectsData || file.id === activeFileId) return;

    // Save current file's in-memory content before switching
    if (saveStatus === "unsaved") {
      executeSave(activeFileContent);
    }

    // Load the new file's content (from current in-memory project state)
    const currentProject = projectsData.projects.find(
      (p) => p.id === projectsData.activeProjectId
    );
    const targetFile = currentProject?.files.find((f) => f.id === file.id);
    if (!targetFile) return;

    setActiveFileId(targetFile.id);
    setActiveFileContent(targetFile.content);
    setLastSavedContent(targetFile.content);
    setSaveStatus("saved");
    // NOTE: PDF is NOT cleared when switching files within same project
  };

  const handleCreateFile = (name: string) => {
    if (!projectsData) return;

    const result = createProjectFile(
      projectsData,
      projectsData.activeProjectId,
      name
    );
    if ("error" in result) {
      // Surface error to FileTree (FileTree manages its own create error display)
      return;
    }
    setProjectsData(result.data);
    // Switch to new file
    setActiveFileId(result.newFile.id);
    setActiveFileContent(result.newFile.content);
    setLastSavedContent(result.newFile.content);
    setSaveStatus("saved");
  };

  const handleDeleteFile = (file: ProjectFile) => {
    if (!projectsData) return;
    if (file.path === MAIN_TEX_PATH) return;

    const confirmed = window.confirm(
      `Delete "${file.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    const result = deleteProjectFile(
      projectsData,
      projectsData.activeProjectId,
      file.id
    );
    if (!result.deleted) return;

    setProjectsData(result.data);

    // If we deleted the active file, switch to main.tex
    if (file.id === activeFileId) {
      const currentProject = result.data.projects.find(
        (p) => p.id === result.data.activeProjectId
      );
      if (currentProject) {
        const mainFile = getMainFile(currentProject);
        setActiveFileId(mainFile.id);
        setActiveFileContent(mainFile.content);
        setLastSavedContent(mainFile.content);
        setSaveStatus("saved");
      }
    }
  };

  const handleRenameFile = (file: ProjectFile, newName: string) => {
    if (!projectsData) return;

    const result = renameProjectFile(
      projectsData,
      projectsData.activeProjectId,
      file.id,
      newName
    );
    if (!result.success) return;
    setProjectsData(result.data);
  };

  // ---- Project management ------------------------------------

  const handleSwitchProject = (targetId: string) => {
    if (!projectsData || targetId === projectsData.activeProjectId) {
      setIsDropdownOpen(false);
      return;
    }

    // Save pending changes in current file
    if (saveStatus === "unsaved") {
      executeSave(activeFileContent);
    }

    const updatedData: StoredProjects = {
      ...projectsData,
      activeProjectId: targetId,
    };
    saveProjectsData(updatedData);
    setProjectsData(updatedData);

    const targetProject = updatedData.projects.find((p) => p.id === targetId)!;
    const mainFile = getMainFile(targetProject);
    setActiveFileId(mainFile.id);
    setActiveFileContent(mainFile.content);
    setLastSavedContent(mainFile.content);
    setLastSavedAt(targetProject.updatedAt);
    setSaveStatus("saved");

    clearPdfState();
    setIsDropdownOpen(false);
  };

  const handleCreateNewProject = () => {
    if (!projectsData) return;

    if (saveStatus === "unsaved") executeSave(activeFileContent);

    const { data: updatedData, newProject } = createProject(projectsData);
    setProjectsData(updatedData);

    const mainFile = getMainFile(newProject);
    setActiveFileId(mainFile.id);
    setActiveFileContent(mainFile.content);
    setLastSavedContent(mainFile.content);
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

    if (saveStatus === "unsaved") executeSave(activeFileContent);

    const res = duplicateProject(projectsData, activeProject.id);
    if (!res) return;

    setProjectsData(res.data);

    const mainFile = getMainFile(res.newProject);
    setActiveFileId(mainFile.id);
    setActiveFileContent(mainFile.content);
    setLastSavedContent(mainFile.content);
    setLastSavedAt(res.newProject.updatedAt);
    setSaveStatus("saved");

    clearPdfState();
    setIsDropdownOpen(false);
  };

  const handleDeleteProject = () => {
    if (!projectsData || !activeProject || projectsData.projects.length <= 1)
      return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${activeProject.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    const { data: updatedData, deleted } = deleteProject(
      projectsData,
      activeProject.id
    );
    if (!deleted) return;

    setProjectsData(updatedData);
    const newActive = updatedData.projects.find(
      (p) => p.id === updatedData.activeProjectId
    )!;

    const mainFile = getMainFile(newActive);
    setActiveFileId(mainFile.id);
    setActiveFileContent(mainFile.content);
    setLastSavedContent(mainFile.content);
    setLastSavedAt(newActive.updatedAt);
    setSaveStatus("saved");

    clearPdfState();
    setIsDropdownOpen(false);
  };

  // ---- Import / Export ---------------------------------------

  const handleExportTex = () => {
    if (!activeProject || !activeFile) return;

    // Export the currently active file
    const filename =
      activeFile.path === MAIN_TEX_PATH
        ? `${sanitizeFilename(activeProject.name)}.tex`
        : activeFile.name;

    const blob = new Blob([activeFileContent], {
      type: "text/plain;charset=utf-8",
    });
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
      const ok = window.confirm(
        "Importing a file will replace the current unsaved edits in main.tex. Continue?"
      );
      if (!ok) {
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const importedText = event.target?.result;
      if (typeof importedText === "string" && projectsData) {
        // Import replaces main.tex content
        const updated = updateActiveProjectMainTex(projectsData, importedText);
        setProjectsData(updated);

        const updatedProject = updated.projects.find(
          (p) => p.id === updated.activeProjectId
        );
        if (updatedProject) {
          const mainFile = getMainFile(updatedProject);
          setActiveFileId(mainFile.id);
          setActiveFileContent(importedText);
          setLastSavedContent(importedText);
          setLastSavedAt(updatedProject.updatedAt);
        }
        setSaveStatus("saved");
        clearPdfState();
      }
    };

    reader.readAsText(file, "UTF-8");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---- Render ------------------------------------------------

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
                          <span className="text-[11px] font-normal text-zinc-400">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-1 border-t border-zinc-800 pt-1">
                    <button
                      onClick={handleCreateNewProject}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      + New Resume
                    </button>
                    <button
                      onClick={handleOpenRenameModal}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Rename Active Project
                    </button>
                    <button
                      onClick={handleDuplicateProject}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Duplicate Project
                    </button>
                    {projectsData && projectsData.projects.length > 1 && (
                      <button
                        onClick={handleDeleteProject}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300"
                      >
                        Delete Active Project
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label="Import .tex file into main.tex"
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
            aria-label="Export active file as .tex"
          >
            Export .tex
          </button>

          <div className="h-4 w-px bg-zinc-800" />

          <span className="max-w-[140px] truncate text-sm text-zinc-500" title={status}>
            {status}
          </span>

          <button
            onClick={handleSave}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label="Save (Ctrl+S)"
          >
            Save <span className="ml-1 text-xs opacity-60">(Ctrl+S)</span>
          </button>

          {pdfUrl && !isCompiling ? (
            <a
              href={pdfUrl}
              download={`${activeProject ? sanitizeFilename(activeProject.name) : "resume"}.pdf`}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              aria-label="Download compiled PDF"
            >
              Download PDF
            </a>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-600 opacity-50"
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

      {/* Rename Project Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
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

      {/* Workspace: File Tree | Editor | PDF */}
      <section className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* File Tree Sidebar */}
        {activeProject && (
          <FileTree
            files={activeProject.files}
            activeFileId={activeFileId}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
          />
        )}

        {/* Monaco Code Editor */}
        <div className="flex flex-1 min-w-0">
          <LatexEditor
            value={activeFileContent}
            onChange={handleEditorChange}
            onSave={handleSave}
            onCompile={handleCompile}
            saveStatus={saveStatus}
            saveStatusText={formatSavedTime(lastSavedAt)}
            activeFileName={activeFile?.name ?? "main.tex"}
          />
        </div>

        {/* PDF Preview */}
        <div className="flex w-[42%] shrink-0 min-h-0 flex-col border-l border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <span className="text-sm font-medium">PDF Preview</span>
            {pdfUrl && errorDetails && (
              <span className="text-xs font-medium text-amber-400">
                Showing last successful PDF (latest compile failed)
              </span>
            )}
            {pdfUrl && !errorDetails && (
              <span className="text-xs text-zinc-500">Latest compiled PDF</span>
            )}
          </div>

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
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-zinc-300">
                LaTeX compilation failed. Check your source for syntax errors.
              </p>
              <pre className="mt-2.5 max-h-36 overflow-auto rounded border border-red-900/50 bg-zinc-950 p-2.5 font-mono text-[11px] leading-4 text-red-300">
                {errorDetails}
              </pre>
            </div>
          )}

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