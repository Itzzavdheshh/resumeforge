"use client";

import { useState, useRef, useEffect, useMemo } from "react";

export interface LatexSnippet {
  label: string;
  description: string;
  /** The text to insert at the cursor. Use \t for indentation. */
  body: string;
  /** Optional: cursor offset within the body (0-indexed chars from start). */
  cursorOffset?: number;
  category?: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Focus search input when menu opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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

  // Search results calculation
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const results: LatexSnippet[] = [];
    SNIPPET_CATEGORIES.forEach((cat) => {
      cat.snippets.forEach((s) => {
        if (
          s.label.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.body.toLowerCase().includes(query)
        ) {
          results.push({ ...s, category: cat.name });
        }
      });
    });
    return results;
  }, [searchQuery]);

  const handleInsert = (snippet: LatexSnippet) => {
    onInsert(snippet.body);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium transition-colors flex items-center gap-1.5 ${
          isOpen
            ? "bg-zinc-800 text-white ring-1 ring-zinc-500 border-zinc-700"
            : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
        }`}
        title="Insert LaTeX Snippet"
        aria-label="Insert LaTeX Snippet"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        id="snippets-menu-button"
      >
        <span className="font-mono text-[11px] text-emerald-400 font-bold">{"{}"}</span>
        <span>Snippets</span>
        <span className="text-[9px] opacity-60">▾</span>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-9 z-50 flex w-[500px] flex-col rounded-xl border border-zinc-800/90 bg-zinc-900/95 shadow-2xl backdrop-blur-md overflow-hidden"
          role="menu"
          aria-label="LaTeX Snippets"
          id="snippets-menu-panel"
        >
          {/* Search Header */}
          <div className="p-2 border-b border-zinc-800/80 bg-zinc-950/60">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                🔍
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets (e.g. bold, table, href)..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-mono"
                aria-label="Search snippets"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Search Mode OR Category View */}
          {searchQuery.trim() ? (
            /* Search Results Mode */
            <div className="max-h-72 overflow-y-auto py-2 px-1">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Search Results ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-zinc-500">
                  No snippets found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                searchResults.map((snippet, idx) => (
                  <button
                    key={`${snippet.label}-${idx}`}
                    onClick={() => handleInsert(snippet)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-800/80 focus:outline-none focus:bg-zinc-800/80"
                    role="menuitem"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <span className="font-mono text-xs text-emerald-400 font-medium truncate">
                        {snippet.label}
                      </span>
                      <span className="text-[11px] text-zinc-400 truncate">
                        {snippet.description}
                      </span>
                    </div>
                    {snippet.category && (
                      <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-mono text-zinc-500">
                        {snippet.category}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Normal Category Mode */
            <div className="flex h-72">
              {/* Category sidebar */}
              <div className="flex w-36 shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950/40 py-2">
                <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Categories
                </div>
                {SNIPPET_CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(idx)}
                    className={`px-3 py-1.5 text-left text-xs transition-colors ${
                      activeCategory === idx
                        ? "bg-zinc-800/90 font-semibold text-white border-r-2 border-r-white"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    }`}
                    role="menuitem"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Snippet list */}
              <div className="flex-1 overflow-y-auto py-2 px-1">
                <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {SNIPPET_CATEGORIES[activeCategory].name} Snippets
                </div>
                {SNIPPET_CATEGORIES[activeCategory].snippets.map((snippet) => (
                  <button
                    key={snippet.label}
                    onClick={() => handleInsert(snippet)}
                    className="flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-800/80 focus:outline-none focus:bg-zinc-800/80"
                    role="menuitem"
                    title={snippet.body}
                  >
                    <span className="font-mono text-xs text-emerald-400 font-medium">
                      {snippet.label}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {snippet.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
