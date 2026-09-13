"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import AppHeader from "@/components/AppHeader";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import {
  StoredProjects,
  ResumeProject,
  ProjectFile,
  CompilerSettings,
  initialLatexSample,
  loadProjectsData,
  saveProjectsData,
  createProject,
  updateProjectFile,
  updateActiveProjectMainTex,
  updateProjectSettings,
  renameProject,
  duplicateProject,
  deleteProject,
  createProjectFile,
  uploadProjectImageFile,
  deleteProjectFile,
  renameProjectFile,
  getMainFile,
  sanitizeFilename,
  MAIN_TEX_PATH,
} from "@/lib/storage";
import { exportProjectToZip, importProjectFromZip } from "@/lib/zip";
import { LatexError, parseLatexErrors } from "@/lib/latexErrors";

// Dynamic imports — client-only components
const LatexEditor = dynamic(() => import("@/components/LatexEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-xs text-zinc-500 font-mono">
      Loading LaTeX Editor...
    </div>
  ),
});

const FileTree = dynamic(() => import("@/components/FileTree"), {
  ssr: false,
});

const ImageAssetView = dynamic(() => import("@/components/ImageAssetView"), {
  ssr: false,
});

const CompilerSettingsModal = dynamic(
  () => import("@/components/CompilerSettingsModal"),
  { ssr: false }
);

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
  const [latexErrors, setLatexErrors] = useState<LatexError[]>([]);
  const [isErrorPanelExpanded, setIsErrorPanelExpanded] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // UI modal state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSaveRef = useRef<() => void>(() => {});
  const handleCompileRef = useRef<() => void>(() => {});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const zipInputRef = useRef<HTMLInputElement | null>(null);

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

  // ---- PDF state helpers -------------------------------------

  const clearPdfState = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setErrorDetails(null);
    setLatexErrors([]);
    setStatus("Ready");
  }, [pdfUrl]);

  // ---- Save logic --------------------------------------------

  const executeSave = useCallback(
    (content: string) => {
      if (!projectsData || !activeFileId || !activeFile || activeFile.type !== "tex")
        return;
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
    [projectsData, activeFileId, activeFile]
  );

  const handleSave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    if (activeFile && activeFile.type === "tex") {
      executeSave(activeFileContent);
    }
  }, [executeSave, activeFileContent, activeFile]);

  // ---- Compile logic -----------------------------------------

  const handleCompile = useCallback(async () => {
    if (isCompiling || !activeProject) return;

    try {
      setIsCompiling(true);
      setStatus("Compiling...");
      setErrorDetails(null);

      // Collect all files (.tex and images) from active project
      const compilationFiles = activeProject.files.map((f) => ({
        path: f.path,
        type: f.type,
        content:
          f.type === "tex" && f.id === activeFileId ? activeFileContent : f.content,
        mimeType: f.mimeType,
      }));

      const response = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: compilationFiles,
          options: activeProject.settings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const details =
          errorData.details ||
          errorData.error ||
          "LaTeX compilation failed. Check your source for syntax errors.";
        setErrorDetails(details);
        setLatexErrors(parseLatexErrors(details));
        setIsErrorPanelExpanded(true);
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
      setLatexErrors([]);
      setStatus("Compiled successfully");
    } catch (error) {
      console.error("Compile error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Compilation failed";
      setErrorDetails(errorMessage);
      setIsErrorPanelExpanded(true);
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

    if (saveStatus === "unsaved" && activeFile?.type === "tex") {
      executeSave(activeFileContent);
    }

    const currentProject = projectsData.projects.find(
      (p) => p.id === projectsData.activeProjectId
    );
    const targetFile = currentProject?.files.find((f) => f.id === file.id);
    if (!targetFile) return;

    setActiveFileId(targetFile.id);
    setActiveFileContent(targetFile.content);
    setLastSavedContent(targetFile.content);
    setSaveStatus("saved");
  };

  const handleCreateFile = (name: string) => {
    if (!projectsData) return;

    const result = createProjectFile(
      projectsData,
      projectsData.activeProjectId,
      name
    );
    if ("error" in result) return;

    setProjectsData(result.data);
    setActiveFileId(result.newFile.id);
    setActiveFileContent(result.newFile.content);
    setLastSavedContent(result.newFile.content);
    setSaveStatus("saved");
  };

  const handleUploadImage = (file: File) => {
    if (!projectsData) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl === "string") {
        const result = uploadProjectImageFile(
          projectsData,
          projectsData.activeProjectId,
          file.name,
          dataUrl,
          file.type,
          file.size
        );

        if ("error" in result) {
          alert(result.error);
          return;
        }

        setProjectsData(result.data);
        setActiveFileId(result.newFile.id);
        setActiveFileContent(result.newFile.content);
        setLastSavedContent(result.newFile.content);
        setSaveStatus("saved");
      }
    };
    reader.readAsDataURL(file);
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
    if (!projectsData || targetId === projectsData.activeProjectId) return;

    if (saveStatus === "unsaved" && activeFile?.type === "tex") {
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
  };

  const handleCreateNewProject = () => {
    if (!projectsData) return;

    if (saveStatus === "unsaved" && activeFile?.type === "tex")
      executeSave(activeFileContent);

    const { data: updatedData, newProject } = createProject(projectsData);
    setProjectsData(updatedData);

    const mainFile = getMainFile(newProject);
    setActiveFileId(mainFile.id);
    setActiveFileContent(mainFile.content);
    setLastSavedContent(mainFile.content);
    setLastSavedAt(newProject.updatedAt);
    setSaveStatus("saved");

    clearPdfState();
  };

  const handleOpenRenameModal = () => {
    if (!activeProject) return;
    setRenameInput(activeProject.name);
    setRenameError(null);
    setIsRenameModalOpen(true);
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

    if (saveStatus === "unsaved" && activeFile?.type === "tex")
      executeSave(activeFileContent);

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
  };

  const handleSaveCompilerSettings = (newSettings: CompilerSettings) => {
    if (!projectsData || !activeProject) return;
    const updated = updateProjectSettings(
      projectsData,
      activeProject.id,
      newSettings
    );
    setProjectsData(updated);
  };

  // ---- Import / Export ---------------------------------------

  const handleExportTex = () => {
    if (!activeProject || !activeFile) return;

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

  const handleExportZip = async () => {
    if (!activeProject) return;

    try {
      setStatus("Exporting ZIP...");
      const zipBlob = await exportProjectToZip(activeProject);
      const filename = `${sanitizeFilename(activeProject.name)}.zip`;
      const blobUrl = URL.createObjectURL(zipBlob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      setStatus("Project exported (.zip)");
      setTimeout(() => setStatus((p) => (p === "Project exported (.zip)" ? "Ready" : p)), 1500);
    } catch (err) {
      console.error("Failed to export project ZIP:", err);
      alert("Failed to generate project ZIP archive.");
      setStatus("Ready");
    }
  };

  const handleImportTexFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleImportZipFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectsData) return;

    try {
      setStatus("Importing ZIP...");
      const result = await importProjectFromZip(file, projectsData.projects);

      if ("error" in result && result.error) {
        alert(result.error);
        setStatus("Ready");
        if (zipInputRef.current) zipInputRef.current.value = "";
        return;
      }

      if ("newProject" in result && result.newProject) {
        const newProj = result.newProject;
        const updatedData: StoredProjects = {
          version: 1,
          activeProjectId: newProj.id,
          projects: [...projectsData.projects, newProj],
        };
        saveProjectsData(updatedData);
        setProjectsData(updatedData);

        const mainFile = getMainFile(newProj);
        setActiveFileId(mainFile.id);
        setActiveFileContent(mainFile.content);
        setLastSavedContent(mainFile.content);
        setLastSavedAt(newProj.updatedAt);
        setSaveStatus("saved");

        clearPdfState();
        setStatus("Project imported successfully");
        setTimeout(() => setStatus((p) => (p === "Project imported successfully" ? "Ready" : p)), 1500);
      }
    } catch (err) {
      console.error("ZIP import error:", err);
      alert("Failed to import ZIP archive.");
      setStatus("Ready");
    } finally {
      if (zipInputRef.current) zipInputRef.current.value = "";
    }
  };

  // ---- Render ------------------------------------------------

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-white font-sans">
      {/* Hidden File Inputs for Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".tex"
        onChange={handleImportTexFile}
        className="hidden"
      />
      <input
        type="file"
        ref={zipInputRef}
        accept=".zip"
        onChange={handleImportZipFile}
        className="hidden"
      />

      {/* Top Application Header */}
      <AppHeader
        projects={projectsData?.projects || []}
        activeProject={activeProject}
        activeFile={activeFile}
        status={status}
        isCompiling={isCompiling}
        saveStatus={saveStatus}
        pdfUrl={pdfUrl}
        fileInputRef={fileInputRef}
        zipInputRef={zipInputRef}
        onSwitchProject={handleSwitchProject}
        onCreateNewProject={handleCreateNewProject}
        onOpenRenameModal={handleOpenRenameModal}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onExportTex={handleExportTex}
        onExportZip={handleExportZip}
        onSave={handleSave}
        onCompile={handleCompile}
      />

      {/* Rename Project Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-800/90 bg-zinc-900/95 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-base font-semibold text-white">Rename Project</h2>
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
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRename}
                disabled={!renameInput.trim()}
                className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compiler Settings Modal */}
      {isSettingsModalOpen && activeProject && (
        <CompilerSettingsModal
          initialSettings={activeProject.settings}
          onSave={handleSaveCompilerSettings}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {/* Workspace Body: Resizable 3-Panel IDE Layout */}
      <main className="flex flex-1 min-h-0 overflow-hidden">
        <WorkspaceLayout
          leftPanel={
            activeProject ? (
              <FileTree
                files={activeProject.files}
                activeFileId={activeFileId}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onUploadImage={handleUploadImage}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
              />
            ) : (
              <div className="flex h-full w-full flex-col border-r border-zinc-800/80 bg-zinc-950" />
            )
          }
          centerPanel={
            <div className="flex flex-1 min-w-0 h-full bg-zinc-950">
              {activeFile?.type === "image" ? (
                <ImageAssetView file={activeFile} onDeleteFile={handleDeleteFile} />
              ) : (
                <LatexEditor
                  value={activeFileContent}
                  onChange={handleEditorChange}
                  onSave={handleSave}
                  onCompile={handleCompile}
                  saveStatus={saveStatus}
                  saveStatusText={formatSavedTime(lastSavedAt)}
                  activeFileName={activeFile?.name ?? "main.tex"}
                  activeFilePath={activeFile?.path ?? "main.tex"}
                  errors={latexErrors}
                />
              )}
            </div>
          }
          rightPanel={
            <div className="flex flex-col h-full w-full border-l border-zinc-800/80 bg-zinc-950">
              {/* PDF Preview Header Bar */}
              <div className="flex h-11 items-center justify-between border-b border-zinc-800/80 pl-10 pr-4 bg-zinc-950 shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tracking-tight text-white">
                    PDF Preview
                  </span>
                  {activeProject?.settings && (
                    <span className="text-[9.5px] font-mono rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-400 border border-zinc-800/80">
                      {activeProject.settings.paperSize.toUpperCase()} • {activeProject.settings.passes} PASS{activeProject.settings.passes > 1 ? "ES" : ""}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {pdfUrl && errorDetails && (
                    <span className="text-[11px] font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                      Last successful PDF
                    </span>
                  )}
                  {pdfUrl && !errorDetails && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Compiled PDF</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Collapsible Compiler Diagnostics / Error Panel */}
              {errorDetails && (
                <div
                  className="border-b border-red-900/60 bg-red-950/30 text-xs transition-all shrink-0"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-red-950/50 border-b border-red-900/40 font-medium text-red-300">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold">⚠️</span>
                      <span>Compilation Failed</span>
                      {latexErrors.length > 0 && (
                        <span className="rounded bg-red-900/60 px-1.5 py-0.2 text-[10px] text-red-200 font-mono">
                          {latexErrors.length} {latexErrors.length === 1 ? "error" : "errors"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsErrorPanelExpanded(!isErrorPanelExpanded)}
                        className="text-[11px] text-red-400 hover:text-red-200 font-mono underline underline-offset-2"
                      >
                        {isErrorPanelExpanded ? "Hide Logs ▲" : "Show Logs ▼"}
                      </button>
                      <button
                        onClick={() => {
                          setErrorDetails(null);
                          setLatexErrors([]);
                        }}
                        className="rounded p-0.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        aria-label="Dismiss error panel"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {isErrorPanelExpanded && (
                    <div className="p-3">
                      <p className="text-[11px] text-zinc-300 mb-2">
                        LaTeX build encountered errors. Select an error marker in Monaco or inspect the raw build log below:
                      </p>
                      <pre className="max-h-40 overflow-y-auto rounded-lg border border-red-900/50 bg-zinc-950 p-2.5 font-mono text-[11px] leading-4 text-red-300 select-text">
                        {errorDetails}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* PDF Frame / Empty State */}
              <div className="flex flex-1 bg-zinc-900/90 relative min-h-0">
                {pdfUrl ? (
                  <iframe
                    key={pdfUrl}
                    src={pdfUrl}
                    title="Resume PDF Preview"
                    className="h-full w-full border-0"
                  />
                ) : (
                  <div className="flex flex-1 items-center justify-center p-6 text-center">
                    <div className="max-w-xs">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 text-xl shadow-inner">
                        📄
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-200">
                        No PDF Compiled Yet
                      </h3>
                      <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                        Edit your LaTeX source code and click{" "}
                        <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 border border-zinc-700">
                          Compile
                        </kbd>{" "}
                        or press{" "}
                        <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 border border-zinc-700">
                          Ctrl+Enter
                        </kbd>{" "}
                        to generate your PDF preview.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          }
        />
      </main>
    </div>
  );
}