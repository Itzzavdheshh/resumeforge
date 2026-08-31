/**
 * latexErrors.ts
 *
 * Parses raw pdflatex output (produced with -file-line-error flag) into
 * structured LatexError objects for display as Monaco editor markers.
 *
 * pdflatex -file-line-error emits errors in the form:
 *   ./filename.tex:LINE: error message
 *
 * It also emits traditional TeX error lines like:
 *   ! Undefined control sequence.
 *   l.42 \badcommand
 *
 * We handle both formats.
 */

export interface LatexError {
  /** Relative file path, e.g. "main.tex" or "sections/experience.tex" */
  file: string;
  /** 1-indexed line number */
  line: number;
  /** Human-readable error message */
  message: string;
}

/**
 * Parses a pdflatex output string into an array of LatexError objects.
 * Returns an empty array if no parseable errors are found.
 */
export function parseLatexErrors(output: string): LatexError[] {
  if (!output || typeof output !== "string") return [];

  const errors: LatexError[] = [];
  const lines = output.split(/\r?\n/);

  // Pattern 1: file-line-error format
  // Matches: ./path/to/file.tex:LINE: message
  // Also matches: path/to/file.tex:LINE: message (without leading ./)
  const fileLinePattern =
    /^(\.\/)?([^\s:][^:]*\.(?:tex|sty|cls)):(\d+):\s*(.+)$/;

  // Pattern 2: Traditional TeX error with ! prefix
  // Matches: ! Error message text
  const bangPattern = /^!\s+(.+)$/;

  // Pattern 3: Line reference from TeX (l.N text...)
  // Matches: l.42 \badcommand
  const lineRefPattern = /^l\.(\d+)\s/;

  let pendingBangMessage: string | null = null;
  let pendingFile: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Pattern 1: file:line:message — most reliable
    const fileLineMatch = line.match(fileLinePattern);
    if (fileLineMatch) {
      const rawPath = fileLineMatch[2];
      // Normalize path: strip leading ./ and convert backslashes
      const filePath = rawPath.replace(/^\.\//, "").replace(/\\/g, "/");
      const lineNum = parseInt(fileLineMatch[3], 10);
      const message = fileLineMatch[4].trim();

      if (!isNaN(lineNum) && lineNum > 0 && message) {
        errors.push({ file: filePath, line: lineNum, message });
        pendingBangMessage = null;
        pendingFile = filePath;
        continue;
      }
    }

    // Pattern 2: ! Error message
    const bangMatch = line.match(bangPattern);
    if (bangMatch) {
      pendingBangMessage = bangMatch[1].trim();
      // Try to determine current file from context — look back for a file reference
      pendingFile = extractCurrentFile(lines, i) || "main.tex";
      continue;
    }

    // Pattern 3: l.N — line reference that resolves a pending ! error
    if (pendingBangMessage) {
      const lineRefMatch = line.match(lineRefPattern);
      if (lineRefMatch) {
        const lineNum = parseInt(lineRefMatch[1], 10);
        if (!isNaN(lineNum) && lineNum > 0) {
          errors.push({
            file: pendingFile || "main.tex",
            line: lineNum,
            message: pendingBangMessage,
          });
        }
        pendingBangMessage = null;
        pendingFile = null;
        continue;
      }
    }
  }

  // Deduplicate: same file+line, keep first
  const seen = new Set<string>();
  return errors.filter((e) => {
    const key = `${e.file}:${e.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Scans backwards from `fromIndex` in the lines array to find the most
 * recently referenced TeX file name (e.g. from a `(./filename.tex` context line).
 */
function extractCurrentFile(lines: string[], fromIndex: number): string | null {
  // pdflatex prints "(./file.tex" when entering a file
  const fileContextPattern = /\(\.\/([^\s()]+\.(?:tex|sty|cls))/;

  for (let i = fromIndex; i >= Math.max(0, fromIndex - 20); i--) {
    const match = lines[i].match(fileContextPattern);
    if (match) {
      return match[1].replace(/\\/g, "/");
    }
  }
  return null;
}
