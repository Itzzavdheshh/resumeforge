"use client";

import { useState } from "react";
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

  const handleConfirmSave = () => {
    onSave({ paperSize, passes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-96 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <h2 className="text-base font-semibold text-white">Compiler Settings</h2>
          <button
            onClick={onClose}
            className="rounded px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Close compiler settings modal"
          >
            ✕
          </button>
        </div>

        {/* Paper Size Option */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Paper Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaperSize("letter")}
              className={`rounded-lg border p-3 text-left transition-colors ${
                paperSize === "letter"
                  ? "border-white bg-zinc-800 text-white font-medium"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <div className="text-xs font-semibold">Letter Paper</div>
              <div className="text-[10px] opacity-60 mt-0.5">8.5″ × 11″ (US Standard)</div>
            </button>

            <button
              type="button"
              onClick={() => setPaperSize("a4")}
              className={`rounded-lg border p-3 text-left transition-colors ${
                paperSize === "a4"
                  ? "border-white bg-zinc-800 text-white font-medium"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <div className="text-xs font-semibold">A4 Paper</div>
              <div className="text-[10px] opacity-60 mt-0.5">210mm × 297mm (ISO Standard)</div>
            </button>
          </div>
        </div>

        {/* Compilation Passes Option */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Compilation Passes
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPasses(1)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                passes === 1
                  ? "border-white bg-zinc-800 text-white font-medium"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <div className="text-xs font-semibold">Single Pass</div>
              <div className="text-[10px] opacity-60 mt-0.5">Fast 1-pass compilation</div>
            </button>

            <button
              type="button"
              onClick={() => setPasses(2)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                passes === 2
                  ? "border-white bg-zinc-800 text-white font-medium"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <div className="text-xs font-semibold">Double Pass</div>
              <div className="text-[10px] opacity-60 mt-0.5">2-pass (resolves \pageref & labels)</div>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSave}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-zinc-200"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
