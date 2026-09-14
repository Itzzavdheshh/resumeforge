"use client";

import { useState, useRef, useEffect } from "react";
import { ResumeProject, ProjectFile } from "@/lib/storage";

interface AppHeaderProps {
  projects: ResumeProject[];
  activeProject?: ResumeProject;
  activeFile?: ProjectFile;
  status: string;
  isCompiling: boolean;
  saveStatus: "saved" | "unsaved" | "saving" | "error";
  pdfUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  zipInputRef: React.RefObject<HTMLInputElement | null>;
  onSwitchProject: (id: string) => void;
  onCreateNewProject: () => void;
  onOpenTemplateGallery?: () => void;
  onOpenRenameModal: () => void;
  onDuplicateProject: () => void;
  onDeleteProject: () => void;
  onOpenSettingsModal: () => void;
  onExportTex: () => void;
  onExportZip: () => void;
  onSave: () => void;
  onCompile: () => void;
}

export default function AppHeader({
  projects,
  activeProject,
  activeFile,
  status,
  isCompiling,
  saveStatus,
  pdfUrl,
  fileInputRef,
  zipInputRef,
  onSwitchProject,
  onCreateNewProject,
  onOpenTemplateGallery,
  onOpenRenameModal,
  onDuplicateProject,
  onDeleteProject,
  onOpenSettingsModal,
  onExportTex,
  onExportZip,
  onSave,
  onCompile,
}: AppHeaderProps) {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);

  const projectDropdownRef = useRef<HTMLDivElement | null>(null);
  const fileMenuRef = useRef<HTMLDivElement | null>(null);
  const projectMenuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProjectDropdownOpen(false);
      }
      if (
        fileMenuRef.current &&
        !fileMenuRef.current.contains(e.target as Node)
      ) {
        setIsFileMenuOpen(false);
      }
      if (
        projectMenuRef.current &&
        !projectMenuRef.current.contains(e.target as Node)
      ) {
        setIsProjectMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProjectDropdownOpen(false);
        setIsFileMenuOpen(false);
        setIsProjectMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950 px-4 text-white shrink-0 select-none">
      {/* LEFT: Branding + Project Selector */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/15 text-white font-bold text-xs tracking-tight">
            RF
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-white">
                ResumeForge
              </span>
              <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-700/50">
                LaTeX
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-800 shrink-0" />

        {/* Project Selector Dropdown */}
        {activeProject && (
          <div className="relative shrink-0" ref={projectDropdownRef}>
            <button
              onClick={() => {
                setIsProjectDropdownOpen(!isProjectDropdownOpen);
                setIsFileMenuOpen(false);
                setIsProjectMenuOpen(false);
              }}
              className={`flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 ${
                isProjectDropdownOpen ? "ring-1 ring-zinc-500 bg-zinc-800 text-white" : ""
              }`}
              aria-label="Select resume project"
              aria-expanded={isProjectDropdownOpen}
              aria-haspopup="menu"
              title="Switch or manage active project"
            >
              <span className="text-zinc-500">📁</span>
              <span className="max-w-[140px] truncate">{activeProject.name}</span>
              <span className="text-[9px] text-zinc-500">▾</span>
            </button>

            {isProjectDropdownOpen && (
              <div
                className="absolute left-0 top-9 z-50 w-64 rounded-xl border border-zinc-800/90 bg-zinc-900/95 py-1.5 shadow-2xl backdrop-blur-md"
                role="menu"
                aria-label="Projects Menu"
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Resume Projects ({projects.length})
                </div>
                <div className="max-h-52 overflow-y-auto py-1">
                  {projects.map((p) => {
                    const isActive = p.id === activeProject.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSwitchProject(p.id);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition-colors hover:bg-zinc-800/80 ${
                          isActive
                            ? "bg-zinc-800/60 font-semibold text-white"
                            : "text-zinc-300"
                        }`}
                        role="menuitem"
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <span className="text-zinc-500 text-[11px]">
                            {isActive ? "✓" : "•"}
                          </span>
                          <span>{p.name}</span>
                        </span>
                        {isActive && (
                          <span className="rounded bg-zinc-700/60 px-1.5 py-0.5 text-[9px] font-normal text-zinc-300">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-1 border-t border-zinc-800/80 pt-1 px-1">
                  <button
                    onClick={() => {
                      if (onOpenTemplateGallery) {
                        onOpenTemplateGallery();
                      } else {
                        onCreateNewProject();
                      }
                      setIsProjectDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    role="menuitem"
                  >
                    <span className="text-zinc-400 font-bold">+</span>
                    <span>New Resume</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenRenameModal();
                      setIsProjectDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    role="menuitem"
                  >
                    <span className="text-zinc-400">✎</span>
                    <span>Rename Active Project</span>
                  </button>
                  <button
                    onClick={() => {
                      onDuplicateProject();
                      setIsProjectDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    role="menuitem"
                  >
                    <span className="text-zinc-400">❐</span>
                    <span>Duplicate Project</span>
                  </button>
                  {projects.length > 1 && (
                    <button
                      onClick={() => {
                        onDeleteProject();
                        setIsProjectDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-red-400 transition-colors hover:bg-red-950/40 hover:text-red-300"
                      role="menuitem"
                    >
                      <span className="text-red-400">✕</span>
                      <span>Delete Active Project</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CENTER: Grouped Menus (File & Project) */}
      <div className="flex items-center gap-1 shrink-0">
        {/* File Dropdown Menu */}
        <div className="relative" ref={fileMenuRef}>
          <button
            onClick={() => {
              setIsFileMenuOpen(!isFileMenuOpen);
              setIsProjectDropdownOpen(false);
              setIsProjectMenuOpen(false);
            }}
            className={`flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-800 hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-1 focus:ring-zinc-500 ${
              isFileMenuOpen ? "bg-zinc-900 text-white border-zinc-800" : ""
            }`}
            aria-label="File menu"
            aria-expanded={isFileMenuOpen}
            aria-haspopup="menu"
            title="Import or Export LaTeX files"
          >
            <span>File</span>
            <span className="text-[9px] text-zinc-500">▾</span>
          </button>

          {isFileMenuOpen && (
            <div
              className="absolute left-0 top-9 z-50 w-48 rounded-xl border border-zinc-800/90 bg-zinc-900/95 py-1.5 shadow-2xl backdrop-blur-md"
              role="menu"
              aria-label="File Actions"
            >
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsFileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                role="menuitem"
              >
                <span className="text-zinc-400">📥</span>
                <span>Import .tex</span>
              </button>
              <button
                onClick={() => {
                  onExportTex();
                  setIsFileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                role="menuitem"
              >
                <span className="text-zinc-400">📤</span>
                <span>Export .tex</span>
              </button>
            </div>
          )}
        </div>

        {/* Project Dropdown Menu */}
        <div className="relative" ref={projectMenuRef}>
          <button
            onClick={() => {
              setIsProjectMenuOpen(!isProjectMenuOpen);
              setIsProjectDropdownOpen(false);
              setIsFileMenuOpen(false);
            }}
            className={`flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-800 hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-1 focus:ring-zinc-500 ${
              isProjectMenuOpen ? "bg-zinc-900 text-white border-zinc-800" : ""
            }`}
            aria-label="Project options menu"
            aria-expanded={isProjectMenuOpen}
            aria-haspopup="menu"
            title="Import/Export ZIP archives or change compiler settings"
          >
            <span>Project</span>
            <span className="text-[9px] text-zinc-500">▾</span>
          </button>

          {isProjectMenuOpen && (
            <div
              className="absolute left-0 top-9 z-50 w-52 rounded-xl border border-zinc-800/90 bg-zinc-900/95 py-1.5 shadow-2xl backdrop-blur-md"
              role="menu"
              aria-label="Project Actions"
            >
              <button
                onClick={() => {
                  zipInputRef.current?.click();
                  setIsProjectMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                role="menuitem"
              >
                <span className="text-zinc-400">📦</span>
                <span>Import Project (.zip)</span>
              </button>
              <button
                onClick={() => {
                  onExportZip();
                  setIsProjectMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                role="menuitem"
              >
                <span className="text-zinc-400">💾</span>
                <span>Export Project (.zip)</span>
              </button>
              <div className="my-1 border-t border-zinc-800/80" />
              <button
                onClick={() => {
                  onOpenSettingsModal();
                  setIsProjectMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                role="menuitem"
              >
                <span className="text-zinc-400">⚙</span>
                <span>Compiler Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Status & Primary Actions (Save, Download, Compile) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Status text */}
        <span
          className="hidden md:inline-block max-w-[150px] truncate text-[11px] font-mono text-zinc-500"
          title={status}
        >
          {status}
        </span>

        <div className="h-4 w-px bg-zinc-800 hidden md:block" />

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={activeFile?.type !== "tex"}
          className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-zinc-500 flex items-center gap-1.5"
          aria-label="Save changes (Ctrl+S)"
          title="Save file (Ctrl+S)"
        >
          {saveStatus === "unsaved" && (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Unsaved changes" />
          )}
          <span>Save</span>
          <kbd className="hidden sm:inline-block rounded bg-zinc-950 px-1 py-0.2 text-[9px] font-mono text-zinc-500 border border-zinc-800">
            Ctrl+S
          </kbd>
        </button>

        {/* Download PDF button */}
        {pdfUrl && !isCompiling ? (
          <a
            href={pdfUrl}
            download={`${
              activeProject ? activeProject.name.replace(/[^a-zA-Z0-9_-]/g, "_") : "resume"
            }.pdf`}
            className="rounded-lg border border-zinc-700/80 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 flex items-center gap-1.5"
            aria-label="Download compiled PDF"
            title="Download compiled PDF file"
          >
            <span>Download PDF</span>
          </a>
        ) : (
          <button
            disabled
            className="cursor-not-allowed rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-1.5 text-xs font-medium text-zinc-600 opacity-50"
            aria-label="Download PDF (unavailable)"
            title="Compile a PDF first to download"
          >
            Download PDF
          </button>
        )}

        {/* Compile Primary Action Button */}
        <button
          onClick={onCompile}
          disabled={isCompiling}
          className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center gap-1.5 shadow-sm"
          aria-label="Compile LaTeX to PDF (Ctrl+Enter)"
          title="Compile LaTeX source (Ctrl+Enter)"
        >
          {isCompiling ? (
            <>
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <span>Compile</span>
              <kbd className="hidden sm:inline-block rounded bg-zinc-200 px-1 py-0.2 text-[9px] font-mono text-zinc-700 border border-zinc-300">
                Ctrl+↵
              </kbd>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
