"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import LatexSnippetsMenu from "@/components/LatexSnippetsMenu";
import { LatexError } from "@/lib/latexErrors";
import { MAIN_TEX_PATH } from "@/lib/storage";

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCompile: () => void;
  saveStatus: "saved" | "unsaved" | "saving" | "error";
  saveStatusText: string;
  activeFileName?: string;
  /** Relative file path of the active file (e.g. "main.tex") */
  activeFilePath?: string;
  /** Parsed compiler errors — used to set Monaco markers */
  errors?: LatexError[];
}

export default function LatexEditor({
  value,
  onChange,
  onSave,
  onCompile,
  saveStatus,
  saveStatusText,
  activeFileName = "main.tex",
  activeFilePath = "main.tex",
  errors = [],
}: LatexEditorProps) {
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on");
  const [fontSize, setFontSize] = useState<number>(14);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const onSaveRef = useRef(onSave);
  const onCompileRef = useRef(onCompile);

  // Keep refs updated for Monaco command bindings
  useEffect(() => {
    onSaveRef.current = onSave;
    onCompileRef.current = onCompile;
  }, [onSave, onCompile]);

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

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

  // ---- Error markers ------------------------------------------

  useEffect(() => {
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    if (!editor || !monacoInstance) return;

    const model = editor.getModel();
    if (!model) return;

    if (!errors || errors.length === 0) {
      // Clear all markers for this editor
      monacoInstance.editor.setModelMarkers(model, "latex", []);
      return;
    }

    // Normalize activeFilePath for comparison (strip leading ./)
    const normalizedActive = activeFilePath
      .replace(/^\.\//, "")
      .replace(/\\/g, "/");

    // Filter errors that belong to the currently active file
    const fileErrors = errors.filter((e) => {
      const normalizedErrorFile = e.file
        .replace(/^\.\//, "")
        .replace(/\\/g, "/");
      return normalizedErrorFile === normalizedActive;
    });

    if (fileErrors.length === 0) {
      monacoInstance.editor.setModelMarkers(model, "latex", []);
      return;
    }

    const lineCount = model.getLineCount();

    const markers: monaco.editor.IMarkerData[] = fileErrors.map((e) => {
      // Clamp line to valid range
      const lineNumber = Math.min(Math.max(e.line, 1), lineCount);
      const lineLength = model.getLineLength(lineNumber);

      return {
        severity: monacoInstance.MarkerSeverity.Error,
        message: e.message,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: Math.max(lineLength + 1, 2),
      };
    });

    monacoInstance.editor.setModelMarkers(model, "latex", markers);

    // Navigate cursor to first error in this file
    const firstError = fileErrors[0];
    const targetLine = Math.min(
      Math.max(firstError.line, 1),
      lineCount
    );
    editor.revealLineInCenter(targetLine);
    editor.setPosition({ lineNumber: targetLine, column: 1 });
    editor.focus();
  }, [errors, activeFilePath]);

  // ---- Snippet insertion --------------------------------------

  const handleSnippetInsert = useCallback((text: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    if (!selection) return;

    // Replace selection (or insert at cursor if no selection)
    editor.executeEdits("latex-snippet", [
      {
        range: selection,
        text: text,
        forceMoveMarkers: true,
      },
    ]);

    editor.focus();
  }, []);

  const isMainTex = activeFilePath === MAIN_TEX_PATH;

  return (
    <div className="flex h-full min-h-0 w-full flex-col border-r border-zinc-800/80 bg-zinc-950">
      {/* Editor Tab & Toolbar Header */}
      <div className="flex h-11 items-center justify-between border-b border-zinc-800/80 px-3 bg-zinc-950 shrink-0 select-none gap-2 overflow-x-auto scrollbar-none">
        {/* Active File IDE Tab */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-2 rounded-t-lg border-t-2 border-t-white bg-zinc-900/90 px-3 py-1.5 border-x border-zinc-800/80 border-b-transparent text-xs font-medium text-white shadow-sm min-w-0">
            <span className="text-zinc-400 text-xs shrink-0">📄</span>
            <span className="font-mono text-zinc-100 truncate max-w-[120px] sm:max-w-[200px]">{activeFileName}</span>
            {isMainTex && (
              <span className="rounded bg-zinc-950 px-1 py-0.2 text-[9px] font-mono text-zinc-500 border border-zinc-800 shrink-0">
                root
              </span>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Snippets Menu */}
          <div className="border-r border-zinc-800/80 pr-2 sm:pr-3">
            <LatexSnippetsMenu onInsert={handleSnippetInsert} />
          </div>

          {/* Editor Options: Wrap & Font Size */}
          <div className="flex items-center gap-1.5 sm:gap-2 border-r border-zinc-800/80 pr-2 sm:pr-3 text-xs">
            <button
              onClick={() => setWordWrap(wordWrap === "on" ? "off" : "on")}
              className={`rounded-md px-1.5 sm:px-2 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                wordWrap === "on"
                  ? "bg-zinc-800/80 text-zinc-200 border border-zinc-700/60"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent"
              }`}
              title="Toggle Word Wrap"
              aria-label="Toggle Word Wrap"
            >
              Wrap: {wordWrap === "on" ? "On" : "Off"}
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1 text-zinc-400">
              <button
                onClick={() => setFontSize((prev) => Math.max(11, prev - 1))}
                className="rounded px-1 sm:px-1.5 py-0.5 text-xs hover:bg-zinc-800 hover:text-white transition-colors"
                title="Decrease Font Size"
                aria-label="Decrease Font Size"
              >
                A−
              </button>
              <span className="text-[11px] font-mono text-zinc-400 w-4 sm:w-5 text-center">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize((prev) => Math.min(20, prev + 1))}
                className="rounded px-1 sm:px-1.5 py-0.5 text-xs hover:bg-zinc-800 hover:text-white transition-colors"
                title="Increase Font Size"
                aria-label="Increase Font Size"
              >
                A+
              </button>
            </div>
          </div>

          {/* Save Status Indicator */}
          <div className="text-xs whitespace-nowrap hidden xs:block sm:block">
            {saveStatus === "saving" && (
              <span className="text-zinc-400 font-mono text-[11px]">Saving...</span>
            )}
            {saveStatus === "unsaved" && (
              <span className="font-medium text-amber-400 text-[11px]">Unsaved</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-zinc-500 font-mono text-[11px]">{saveStatusText}</span>
            )}
            {saveStatus === "error" && (
              <span className="font-medium text-red-400 text-[11px]">
                Save Error
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Monaco Code Editor Container */}
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
