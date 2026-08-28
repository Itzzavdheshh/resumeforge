"use client";

import { useState } from "react";
import { ProjectFile } from "@/lib/storage";

interface ImageAssetViewProps {
  file: ProjectFile;
  onDeleteFile: (file: ProjectFile) => void;
}

export default function ImageAssetView({ file, onDeleteFile }: ImageAssetViewProps) {
  const [copied, setCopied] = useState(false);

  const snippet = `\\includegraphics[width=0.4\\textwidth]{${file.path}}`;

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API fails
      setCopied(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Header Tab Bar */}
      <div className="flex h-12 items-center justify-between border-b border-zinc-800 px-4 bg-zinc-950">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Image Asset:</span>
          <span className="text-sm font-medium text-white font-mono">{file.name}</span>
        </div>
        <button
          onClick={() => onDeleteFile(file)}
          className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300"
          aria-label={`Delete ${file.name}`}
        >
          Delete Image
        </button>
      </div>

      {/* Image Preview & Details Panel */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col items-center text-center shadow-xl">
          {/* Image Display */}
          <div className="relative mb-6 flex max-h-64 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.content}
              alt={file.name}
              className="max-h-56 max-w-full object-contain rounded"
            />
          </div>

          {/* Asset Metadata */}
          <h3 className="text-base font-semibold text-white font-mono mb-1">{file.name}</h3>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mb-4">
            <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px]">
              {file.mimeType || "image"}
            </span>
            <span>•</span>
            <span>{formatFileSize(file.size)}</span>
          </div>

          {/* Path Info */}
          <div className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-left mb-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              LaTeX Include Path
            </div>
            <code className="text-xs text-zinc-300 font-mono select-all block break-all">
              {file.path}
            </code>
          </div>

          {/* LaTeX Snippet Generator & Copy Action */}
          <div className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-left">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                LaTeX Code Snippet
              </span>
              {copied && (
                <span className="text-[11px] font-medium text-emerald-400">
                  Copied ✓
                </span>
              )}
            </div>
            <code className="text-xs text-amber-300 font-mono select-all block break-all mb-3 bg-zinc-900/80 p-2 rounded border border-zinc-800">
              {snippet}
            </code>
            <button
              onClick={handleCopySnippet}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5"
              aria-label="Copy LaTeX Snippet"
            >
              <span>📋</span>
              <span>{copied ? "Copied to Clipboard!" : "Copy LaTeX Snippet"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
