export interface StoredDocument {
  version: 1;
  latex: string;
  savedAt: string; // ISO 8601 string
}

export const STORAGE_KEY = "resumeforge:document:main";

/**
 * Safely load the saved LaTeX document from browser localStorage.
 * Returns null if running on server (SSR), localStorage is unavailable,
 * or the stored data is missing/corrupted.
 */
export function loadDocument(): StoredDocument | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.latex === "string"
    ) {
      return {
        version: 1,
        latex: parsed.latex,
        savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn("Failed to load document from localStorage:", error);
  }

  return null;
}

/**
 * Safely save the LaTeX source string to browser localStorage.
 * Returns the StoredDocument on success or null on error (e.g. storage full).
 */
export function saveDocument(latex: string): StoredDocument | null {
  if (typeof window === "undefined") {
    return null;
  }

  const doc: StoredDocument = {
    version: 1,
    latex,
    savedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    return doc;
  } catch (error) {
    console.error("Failed to save document to localStorage:", error);
    return null;
  }
}
