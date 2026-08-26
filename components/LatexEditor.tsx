"use client";

import { useRef, useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCompile: () => void;
  saveStatus: "saved" | "unsaved" | "saving" | "error";
  saveStatusText: string;
  projectName?: string;
}

export default function LatexEditor({
  value,
  onChange,
  onSave,
  onCompile,
  saveStatus,
  saveStatusText,
  projectName,
}: LatexEditorProps) {
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on");
  const [fontSize, setFontSize] = useState<number>(14);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onSaveRef = useRef(onSave);
  const onCompileRef = useRef(onCompile);

  // Keep refs updated for Monaco command bindings
  useEffect(() => {
    onSaveRef.current = onSave;
    onCompileRef.current = onCompile;
  }, [onSave, onCompile]);

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    // Bind Ctrl+S / Cmd+S inside Monaco to trigger ResumeForge Save
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      () => {
        onSaveRef.current();
      }
    );

    // Bind Ctrl+Enter / Cmd+Enter inside Monaco to trigger ResumeForge Compile
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
      () => {
        onCompileRef.current();
      }
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-zinc-800">
      {/* Editor Tab Bar */}
      <div className="flex h-12 items-center justify-between border-b border-zinc-800 px-4 bg-zinc-950">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">main.tex</span>
          {projectName && (
            <span className="text-xs text-zinc-500 max-w-[150px] truncate">
              ({projectName})
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Editor Options: Wrap & Font Size */}
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-4 text-xs">
            <button
              onClick={() => setWordWrap(wordWrap === "on" ? "off" : "on")}
              className={`rounded px-2 py-1 transition-colors ${
                wordWrap === "on"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Toggle Word Wrap"
              aria-label="Toggle Word Wrap"
            >
              Wrap: {wordWrap === "on" ? "On" : "Off"}
            </button>

            <div className="flex items-center gap-1 text-zinc-500">
              <button
                onClick={() => setFontSize((prev) => Math.max(11, prev - 1))}
                className="rounded px-1.5 py-0.5 hover:bg-zinc-800 hover:text-white"
                title="Decrease Font Size"
                aria-label="Decrease Font Size"
              >
                A−
              </button>
              <span className="text-[11px] font-mono text-zinc-400 w-5 text-center">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize((prev) => Math.min(20, prev + 1))}
                className="rounded px-1.5 py-0.5 hover:bg-zinc-800 hover:text-white"
                title="Increase Font Size"
                aria-label="Increase Font Size"
              >
                A+
              </button>
            </div>
          </div>

          {/* Save Status Indicator */}
          <div className="text-xs">
            {saveStatus === "saving" && (
              <span className="text-zinc-400">Saving...</span>
            )}
            {saveStatus === "unsaved" && (
              <span className="font-medium text-amber-400">Unsaved changes</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-zinc-500">{saveStatusText}</span>
            )}
            {saveStatus === "error" && (
              <span className="font-medium text-red-400">
                Unable to save locally
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 min-h-0 bg-zinc-950">
        <Editor
          height="100%"
          language="stex"
          theme="vs-dark"
          value={value}
          onChange={(v) => onChange(v || "")}
          onMount={handleEditorMount}
          options={{
            fontSize: fontSize,
            lineNumbers: "on",
            wordWrap: wordWrap,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            renderLineHighlight: "all",
            matchBrackets: "always",
            tabSize: 2,
            fontFamily: "Geist Mono, monospace",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
