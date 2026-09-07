"use client";

import { useState, useEffect } from "react";
import { CompilerSettings, DEFAULT_COMPILER_SETTINGS } from "@/lib/storage";

interface CompilerSettingsModalProps {
  initialSettings?: CompilerSettings;
  onSave: (newSettings: CompilerSettings) => void;
  onClose: () => void;
}

export default function CompilerSettingsModal({
  initialSettings = DEFAULT_COMPILER_SETTINGS,
  onSave,
  onClose,
}: CompilerSettingsModalProps) {
  const [paperSize, setPaperSize] = useState<"letter" | "a4">(
    initialSettings.paperSize || "letter"
  );
  const [passes, setPasses] = useState<1 | 2>(
    initialSettings.passes === 2 ? 2 : 1
  );

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleConfirmSave = () => {
    onSave({ paperSize, passes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md rounded-xl border border-zinc-800/90 bg-zinc-900/95 p-5 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compiler-settings-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">⚙</span>
            <h2 id="compiler-settings-title" className="text-base font-semibold">
              Compiler Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Paper Size Option */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Paper Size
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPaperSize("letter")}
              className={`rounded-lg border p-3 text-left transition-all ${
                paperSize === "letter"
                  ? "border-white bg-zinc-800/90 text-white font-medium shadow-sm"
                  : "border-zinc-800/80 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <div className="text-xs font-semibold">Letter Paper</div>
              <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                8.5″ × 11″ (US Standard)
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaperSize("a4")}
              className={`rounded-lg border p-3 text-left transition-all ${
                paperSize === "a4"
                  ? "border-white bg-zinc-800/90 text-white font-medium shadow-sm"
                  : "border-zinc-800/80 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <div className="text-xs font-semibold">A4 Paper</div>
              <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                210mm × 297mm (ISO)
              </div>
            </button>
          </div>
        </div>

        {/* Compilation Passes Option */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Compilation Passes
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPasses(1)}
              className={`rounded-lg border p-3 text-left transition-all ${
                passes === 1
                  ? "border-white bg-zinc-800/90 text-white font-medium shadow-sm"
                  : "border-zinc-800/80 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <div className="text-xs font-semibold">Single Pass</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Fast 1-pass build
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPasses(2)}
              className={`rounded-lg border p-3 text-left transition-all ${
                passes === 2
                  ? "border-white bg-zinc-800/90 text-white font-medium shadow-sm"
                  : "border-zinc-800/80 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <div className="text-xs font-semibold">Double Pass</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                2-pass (\pageref & labels)
              </div>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/80">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSave}
            className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition-all hover:bg-zinc-200 shadow-sm"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
