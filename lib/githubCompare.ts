// ============================================================
// ResumeForge — GitHub Remote Change Comparison & Normalization
// lib/githubCompare.ts
// ============================================================

export type FileChangeStatus =
  | "UNCHANGED"
  | "LOCAL_ONLY"
  | "REMOTE_ONLY"
  | "MODIFIED_LOCAL"
  | "MODIFIED_REMOTE"
  | "CONFLICT";

export interface FileComparisonItem {
  path: string;
  type: "tex" | "image" | "asset";
  status: FileChangeStatus;
  localSize?: number;
  remoteSize?: number;
  explanation: string;
}

/**
 * Standardizes text line endings (\r\n -> \n) for accurate string comparison.
 */
export function normalizeTextContent(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/\r\n/g, "\n");
}

/**
 * Extracts raw base64 string from Base64 Data URLs or GitHub base64 blobs,
 * stripping whitespace/newlines for binary equivalence testing.
 */
export function extractRawBase64(content: string, type: string): string {
  if (!content || typeof content !== "string") return "";
  let raw = content.trim();

  // Strip Data URL header if present (e.g. data:image/png;base64,...)
  if (type === "image" && raw.includes(",")) {
    raw = raw.split(",")[1];
  }

  // Remove whitespace and newlines added by base64 formatting
  return raw.replace(/[\s\r\n]+/g, "");
}

/**
 * Determines whether local content and remote content are identical.
 */
export function areContentsEqual(
  localContent: string,
  remoteContent: string,
  type: string
): boolean {
  if (type === "image") {
    const localRaw = extractRawBase64(localContent, "image");
    const remoteRaw = extractRawBase64(remoteContent, "image");
    return localRaw === remoteRaw;
  }

  const normLocal = normalizeTextContent(localContent);
  const normRemote = normalizeTextContent(remoteContent);
  return normLocal === normRemote;
}

/**
 * Classifies a single file path into one of 6 change status categories.
 */
export function classifyFileChange(params: {
  path: string;
  type: "tex" | "image" | "asset";
  localFile?: { content: string; size?: number };
  remoteFile?: { content: string; size?: number };
  lastExportedSha?: string;
  hasLocalChangesSinceExport?: boolean;
  hasRemoteChangesSinceExport?: boolean;
}): FileComparisonItem {
  const {
    path,
    type,
    localFile,
    remoteFile,
    hasLocalChangesSinceExport,
    hasRemoteChangesSinceExport,
  } = params;

  // 1. Exists in local project only
  if (localFile && !remoteFile) {
    return {
      path,
      type,
      status: "LOCAL_ONLY",
      localSize: localFile.size ?? localFile.content.length,
      explanation: "File exists in local ResumeForge project, but is not present in GitHub repository.",
    };
  }

  // 2. Exists in remote repository only
  if (!localFile && remoteFile) {
    return {
      path,
      type,
      status: "REMOTE_ONLY",
      remoteSize: remoteFile.size ?? remoteFile.content.length,
      explanation: "File exists in GitHub repository, but is not present in local ResumeForge project.",
    };
  }

  // File exists in both local & remote
  const isEqual = areContentsEqual(
    localFile?.content || "",
    remoteFile?.content || "",
    type
  );

  const localSize = localFile ? (localFile.size ?? localFile.content.length) : undefined;
  const remoteSize = remoteFile ? (remoteFile.size ?? remoteFile.content.length) : undefined;

  // 3. Content is identical
  if (isEqual) {
    return {
      path,
      type,
      status: "UNCHANGED",
      localSize,
      remoteSize,
      explanation: "Local file and remote GitHub file contents are identical.",
    };
  }

  // 4. Content differs — determine modification origin
  if (hasLocalChangesSinceExport && hasRemoteChangesSinceExport) {
    return {
      path,
      type,
      status: "CONFLICT",
      localSize,
      remoteSize,
      explanation: "Conflict: File has un-exported local modifications AND new remote commits on GitHub.",
    };
  }

  if (hasRemoteChangesSinceExport) {
    return {
      path,
      type,
      status: "MODIFIED_REMOTE",
      localSize,
      remoteSize,
      explanation: "File has been modified remotely on GitHub since the last export.",
    };
  }

  if (hasLocalChangesSinceExport) {
    return {
      path,
      type,
      status: "MODIFIED_LOCAL",
      localSize,
      remoteSize,
      explanation: "File has un-exported local modifications in ResumeForge.",
    };
  }

  // Fallback when baseline commit SHA is not present
  return {
    path,
    type,
    status: "MODIFIED_LOCAL",
    localSize,
    remoteSize,
    explanation: "File content differs between local project and GitHub repository.",
  };
}
