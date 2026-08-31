"use client";

import { useState, useRef, useEffect } from "react";

export interface LatexSnippet {
  label: string;
  description: string;
  /** The text to insert at the cursor. Use \t for indentation. */
  body: string;
  /** Optional: cursor offset within the body (0-indexed chars from start). */
  cursorOffset?: number;
}

interface SnippetCategory {
  name: string;
  snippets: LatexSnippet[];
}

const SNIPPET_CATEGORIES: SnippetCategory[] = [
  {
    name: "Structure",
    snippets: [
      {
        label: "\\documentclass",
        description: "Document class declaration",
        body: "\\documentclass[11pt]{article}",
      },
      {
        label: "\\begin{document}",
        description: "Document environment",
        body: "\\begin{document}\n\t\n\\end{document}",
        cursorOffset: 17,
      },
      {
        label: "\\section{}",
        description: "Section heading",
        body: "\\section{}",
        cursorOffset: 9,
      },
      {
        label: "\\subsection{}",
        description: "Subsection heading",
        body: "\\subsection{}",
        cursorOffset: 12,
      },
      {
        label: "\\subsubsection{}",
        description: "Subsubsection heading",
        body: "\\subsubsection{}",
        cursorOffset: 15,
      },
      {
        label: "\\usepackage{}",
        description: "Import a package",
        body: "\\usepackage{}",
        cursorOffset: 12,
      },
    ],
  },
  {
    name: "Formatting",
    snippets: [
      {
        label: "\\textbf{}",
        description: "Bold text",
        body: "\\textbf{}",
        cursorOffset: 8,
      },
      {
        label: "\\textit{}",
        description: "Italic text",
        body: "\\textit{}",
        cursorOffset: 8,
      },
      {
        label: "\\underline{}",
        description: "Underlined text",
        body: "\\underline{}",
        cursorOffset: 11,
      },
      {
        label: "\\emph{}",
        description: "Emphasized text",
        body: "\\emph{}",
        cursorOffset: 6,
      },
      {
        label: "\\texttt{}",
        description: "Monospace text",
        body: "\\texttt{}",
        cursorOffset: 8,
      },
      {
        label: "\\small / \\large",
        description: "Font size commands",
        body: "{\\small }",
        cursorOffset: 8,
      },
    ],
  },
  {
    name: "Lists",
    snippets: [
      {
        label: "itemize",
        description: "Bullet list environment",
        body: "\\begin{itemize}\n\t\\item \n\\end{itemize}",
        cursorOffset: 22,
      },
      {
        label: "enumerate",
        description: "Numbered list environment",
        body: "\\begin{enumerate}\n\t\\item \n\\end{enumerate}",
        cursorOffset: 24,
      },
      {
        label: "\\item",
        description: "List item",
        body: "\\item ",
      },
      {
        label: "description",
        description: "Description list",
        body: "\\begin{description}\n\t\\item[Label] \n\\end{description}",
        cursorOffset: 33,
      },
    ],
  },
  {
    name: "Tables",
    snippets: [
      {
        label: "tabular (2 cols)",
        description: "Basic 2-column table",
        body: "\\begin{tabular}{ll}\n\tHeader 1 & Header 2 \\\\\\\\\n\t\\hline\n\tCell 1   & Cell 2 \\\\\\\\\n\\end{tabular}",
      },
      {
        label: "tabular (3 cols)",
        description: "Basic 3-column table",
        body: "\\begin{tabular}{lll}\n\tH1 & H2 & H3 \\\\\\\\\n\t\\hline\n\tA  & B  & C  \\\\\\\\\n\\end{tabular}",
      },
      {
        label: "\\hline",
        description: "Horizontal rule in table",
        body: "\\hline",
      },
      {
        label: "\\multicolumn{}{}{}",
        description: "Span multiple columns",
        body: "\\multicolumn{2}{c}{}",
        cursorOffset: 19,
      },
    ],
  },
  {
    name: "Resume",
    snippets: [
      {
        label: "\\href{}{}",
        description: "Hyperlink",
        body: "\\href{url}{text}",
        cursorOffset: 6,
      },
      {
        label: "\\includegraphics{}",
        description: "Insert image",
        body: "\\includegraphics[width=\\linewidth]{}",
        cursorOffset: 35,
      },
      {
        label: "minipage",
        description: "Side-by-side content",
        body: "\\begin{minipage}{0.5\\linewidth}\n\t\n\\end{minipage}",
        cursorOffset: 33,
      },
      {
        label: "\\vspace{}",
        description: "Vertical space",
        body: "\\vspace{0.5em}",
        cursorOffset: 8,
      },
      {
        label: "\\hspace{}",
        description: "Horizontal space",
        body: "\\hspace{1em}",
        cursorOffset: 8,
      },
      {
        label: "\\noindent",
        description: "No paragraph indent",
        body: "\\noindent ",
      },
      {
        label: "\\newpage",
        description: "Page break",
        body: "\\newpage",
      },
      {
        label: "\\rule{}{}",
        description: "Horizontal rule",
        body: "\\rule{\\linewidth}{0.4pt}",
      },
    ],
  },
  {
    name: "Math",
    snippets: [
      {
        label: "Inline math $...$",
        description: "Inline math mode",
        body: "$",
        cursorOffset: 1,
      },
      {
        label: "Display math $$...$$",
        description: "Display math mode",
        body: "$$\n\t\n$$",
        cursorOffset: 4,
      },
      {
        label: "align environment",
        description: "Multi-line aligned equations",
        body: "\\begin{align}\n\t \n\\end{align}",
        cursorOffset: 16,
      },
      {
        label: "\\frac{}{}",
        description: "Fraction",
        body: "\\frac{}{}",
        cursorOffset: 6,
      },
      {
        label: "\\sqrt{}",
        description: "Square root",
        body: "\\sqrt{}",
        cursorOffset: 6,
      },
    ],
  },
];

interface LatexSnippetsMenuProps {
  onInsert: (text: string) => void;
}

export default function LatexSnippetsMenu({ onInsert }: LatexSnippetsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close on click-outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isOpen]);

  const handleInsert = (snippet: LatexSnippet) => {
    onInsert(snippet.body);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`rounded px-2 py-1 text-xs transition-colors flex items-center gap-1 ${
          isOpen
            ? "bg-zinc-700 text-white"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        }`}
        title="Insert LaTeX Snippet"
        aria-label="Insert LaTeX Snippet"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        id="snippets-menu-button"
      >
        <span className="font-mono text-[11px]">{"{}"}</span>
        <span>Snippets</span>
        <span className="text-[9px] opacity-60">▾</span>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-9 z-50 flex w-[480px] rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden"
          role="menu"
          aria-label="LaTeX Snippets"
          id="snippets-menu-panel"
        >
          {/* Category sidebar */}
          <div className="flex w-36 shrink-0 flex-col border-r border-zinc-800 py-2">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              Category
            </div>
            {SNIPPET_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(idx)}
                className={`px-3 py-1.5 text-left text-xs transition-colors ${
                  activeCategory === idx
                    ? "bg-zinc-800 font-semibold text-white"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                }`}
                role="menuitem"
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Snippet list */}
          <div className="flex-1 overflow-y-auto py-2 max-h-72">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              {SNIPPET_CATEGORIES[activeCategory].name}
            </div>
            {SNIPPET_CATEGORIES[activeCategory].snippets.map((snippet) => (
              <button
                key={snippet.label}
                onClick={() => handleInsert(snippet)}
                className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-zinc-800 focus:outline-none focus:bg-zinc-800"
                role="menuitem"
                title={snippet.body}
              >
                <span className="font-mono text-xs text-emerald-400">
                  {snippet.label}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {snippet.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
