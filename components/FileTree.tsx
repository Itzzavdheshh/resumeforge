"use client";

import { useState, useRef, useEffect } from "react";
import { ProjectFile, MAIN_TEX_PATH } from "@/lib/storage";

interface FileTreeProps {
  files: ProjectFile[];
  activeFileId: string | null;
  onSelectFile: (file: ProjectFile) => void;
  onCreateFile: (name: string) => void;
  onDeleteFile: (file: ProjectFile) => void;
  onRenameFile: (file: ProjectFile, newName: string) => void;
}

export default function FileTree({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}: FileTreeProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  const newFileInputRef = useRef<HTMLInputElement | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus new file input when creating
  useEffect(() => {
    if (isCreating && newFileInputRef.current) {
      newFileInputRef.current.focus();
    }
  }, [isCreating]);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingFileId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingFileId]);

  const handleConfirmCreate = () => {
    const name = newFileName.trim();
    if (!name) {
      setCreateError("File name cannot be empty.");
      return;
    }
    onCreateFile(name);
    setIsCreating(false);
    setNewFileName("");
    setCreateError(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewFileName("");
    setCreateError(null);
  };

  const handleStartRename = (file: ProjectFile) => {
    if (file.path === MAIN_TEX_PATH) return;
    setRenamingFileId(file.id);
    setRenameValue(file.name);
    setRenameError(null);
  };

  const handleConfirmRename = (file: ProjectFile) => {
    const name = renameValue.trim();
    if (!name) {
      setRenameError("File name cannot be empty.");
      return;
    }
    onRenameFile(file, name);
    setRenamingFileId(null);
    setRenameValue("");
    setRenameError(null);
  };

  const handleCancelRename = () => {
    setRenamingFileId(null);
    setRenameValue("");
    setRenameError(null);
  };

  // Sort: main.tex first, then alphabetically
  const sortedFiles = [...files].sort((a, b) => {
    if (a.path === MAIN_TEX_PATH) return -1;
    if (b.path === MAIN_TEX_PATH) return 1;
    return a.path.localeCompare(b.path);
  });

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-zinc-800 bg-zinc-950 w-48 shrink-0">
      {/* File Tree Header */}
      <div className="flex h-12 items-center justify-between border-b border-zinc-800 px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Files
        </span>
        <button
          onClick={() => {
            setIsCreating(true);
            setCreateError(null);
            setNewFileName("");
          }}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          aria-label="Create new file"
          title="New File"
        >
          <span className="text-sm leading-none">+</span>
          <span>New</span>
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 min-h-0 overflow-y-auto py-1">
        {sortedFiles.map((file) => {
          const isActive = file.id === activeFileId;
          const isMain = file.path === MAIN_TEX_PATH;
          const isRenaming = renamingFileId === file.id;

          return (
            <div key={file.id} className="group relative">
              {isRenaming ? (
                <div className="px-2 py-1">
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(e) => {
                      setRenameValue(e.target.value);
                      setRenameError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirmRename(file);
                      if (e.key === "Escape") handleCancelRename();
                    }}
                    className="w-full rounded border border-zinc-600 bg-zinc-900 px-1.5 py-0.5 text-xs text-white outline-none focus:border-zinc-400"
                    aria-label="Rename file"
                  />
                  {renameError && (
                    <p className="mt-0.5 text-[10px] text-red-400">{renameError}</p>
                  )}
                  <div className="mt-1 flex gap-1">
                    <button
                      onClick={() => handleConfirmRename(file)}
                      className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-white hover:bg-zinc-600"
                    >
                      OK
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onSelectFile(file)}
                  className={`flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-xs transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                  aria-label={`Select file ${file.name}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  {/* File Icon */}
                  <span className="shrink-0 text-[10px] text-zinc-600">
                    {file.type === "tex" ? "󰈙" : "󰈤"}
                  </span>
                  <span className="flex-1 truncate font-mono">{file.name}</span>
                  {isMain && (
                    <span className="shrink-0 text-[9px] text-zinc-600">root</span>
                  )}
                </button>
              )}

              {/* Hover Actions: Rename & Delete (not for main.tex) */}
              {!isRenaming && !isMain && (
                <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 group-hover:flex">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartRename(file);
                    }}
                    className="rounded p-0.5 text-[10px] text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
                    aria-label={`Rename ${file.name}`}
                    title="Rename"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file);
                    }}
                    className="rounded p-0.5 text-[10px] text-zinc-500 hover:bg-red-900/40 hover:text-red-400"
                    aria-label={`Delete ${file.name}`}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* New File Input */}
        {isCreating && (
          <div className="px-2 py-1">
            <input
              ref={newFileInputRef}
              value={newFileName}
              onChange={(e) => {
                setNewFileName(e.target.value);
                setCreateError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmCreate();
                if (e.key === "Escape") handleCancelCreate();
              }}
              placeholder="filename.tex"
              className="w-full rounded border border-zinc-600 bg-zinc-900 px-1.5 py-0.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400"
              aria-label="New file name"
            />
            {createError && (
              <p className="mt-0.5 text-[10px] text-red-400">{createError}</p>
            )}
            <div className="mt-1 flex gap-1">
              <button
                onClick={handleConfirmCreate}
                className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-white hover:bg-zinc-600"
              >
                Create
              </button>
              <button
                onClick={handleCancelCreate}
                className="rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
