"use client";

import { useState, useEffect, useRef } from "react";
import { RESUME_TEMPLATES, ResumeTemplate, TemplateCategory } from "@/lib/templates";

interface TemplateGalleryModalProps {
  onSelectTemplate: (template: ResumeTemplate) => void;
  onCreateBlankProject: () => void;
  onClose: () => void;
}

const CATEGORIES: Array<"All" | TemplateCategory> = [
  "All",
  "Classic",
  "Modern",
  "Minimal",
  "Academic",
];

export default function TemplateGalleryModal({
  onSelectTemplate,
  onCreateBlankProject,
  onClose,
}: TemplateGalleryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<"All" | TemplateCategory>("All");
  const modalRef = useRef<HTMLDivElement | null>(null);

  const filteredTemplates =
    selectedCategory === "All"
      ? RESUME_TEMPLATES
      : RESUME_TEMPLATES.filter((t) => t.category === selectedCategory);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Resume Template Gallery"
    >
      <div
        ref={modalRef}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4 shrink-0">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Create New Resume</span>
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                Template Gallery
              </span>
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Choose a professionally formatted LaTeX template or start with a blank document.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label="Close modal"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Category Filters & Blank Option Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1" role="tablist">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  role="tab"
                  aria-selected={isActive}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-1 focus:ring-zinc-400 ${
                    isActive
                      ? "bg-white text-black font-semibold shadow"
                      : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/60"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Blank Project Quick Action */}
          <button
            onClick={() => {
              onCreateBlankProject();
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
          >
            <span className="text-zinc-400 font-bold">+</span>
            <span>Blank Project</span>
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pb-2">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group relative flex flex-col rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-xl"
              >
                {/* SVG Visual Preview Mockup */}
                <div
                  className="aspect-[210/160] w-full rounded-lg overflow-hidden bg-zinc-950 p-2 flex items-center justify-center border border-zinc-800/80 group-hover:border-zinc-700 transition-colors"
                  dangerouslySetInnerHTML={{ __html: template.previewSvg }}
                />

                {/* Info */}
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white tracking-tight">
                        {template.name}
                      </h3>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700/50">
                        {template.category}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {template.description}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                      <span className="text-zinc-400">💡</span>
                      <span className="truncate">{template.recommendedUseCase}</span>
                    </div>

                    {template.files.length > 1 && (
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/40">
                        📁 Multi-file ({template.files.length} files)
                      </div>
                    )}
                  </div>

                  {/* Primary Action Button */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Main: main.tex
                    </span>
                    <button
                      onClick={() => {
                        onSelectTemplate(template);
                        onClose();
                      }}
                      className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition-all hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-[0.98]"
                    >
                      Use Template →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
