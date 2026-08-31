import JSZip from "jszip";
import {
  ResumeProject,
  ProjectFile,
  ProjectFileType,
  DEFAULT_COMPILER_SETTINGS,
  generateProjectId,
  generateFileId,
  getUniqueProjectName,
  validateFilePath,
  MAIN_TEX_PATH,
} from "@/lib/storage";

export const MAX_ZIP_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB limit for ZIP upload
export const MAX_TOTAL_EXTRACTED_SIZE = 20 * 1024 * 1024; // 20 MB total extracted size limit
export const MAX_INDIVIDUAL_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file limit
export const MAX_FILE_COUNT = 100; // Max 100 files in an archive

const ALLOWED_EXTENSIONS = [".tex", ".png", ".jpg", ".jpeg"];

function base64ToUint8Array(base64DataUrl: string): Uint8Array {
  const base64 = base64DataUrl.includes(",")
    ? base64DataUrl.split(",")[1]
    : base64DataUrl;
  const binaryString = typeof window !== "undefined" ? window.atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== "undefined" ? window.btoa(binary) : Buffer.from(binary, "binary").toString("base64");
}

function getMimeTypeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}

/**
 * Export a ResumeProject as a binary .zip Blob with full directory structure.
 */
export async function exportProjectToZip(project: ResumeProject): Promise<Blob> {
  const zip = new JSZip();

  for (const file of project.files) {
    if (file.type === "tex") {
      zip.file(file.path, file.content);
    } else if (file.type === "image") {
      const bytes = base64ToUint8Array(file.content);
      zip.file(file.path, bytes, { binary: true });
    }
  }

  return await zip.generateAsync({ type: "blob" });
}

/**
 * Atomically import a project from a .zip archive File.
 * Performs path traversal protection, ZIP bomb size limits, file extension allowlist validation,
 * and verifies main.tex existence.
 */
export async function importProjectFromZip(
  zipFile: File,
  existingProjects: ResumeProject[]
): Promise<
  | { newProject: ResumeProject; error?: never }
  | { error: string; newProject?: never }
> {
  if (!zipFile) {
    return { error: "No ZIP file provided." };
  }

  if (zipFile.size > MAX_ZIP_UPLOAD_SIZE) {
    return {
      error: `ZIP file exceeds maximum allowed upload size of ${MAX_ZIP_UPLOAD_SIZE / (1024 * 1024)} MB.`,
    };
  }

  try {
    const zip = await JSZip.loadAsync(zipFile);
    const entries = Object.keys(zip.files);

    if (entries.length === 0) {
      return { error: "ZIP archive is empty." };
    }

    // Filter valid files (ignore directories and OS metadata)
    const validEntryKeys = entries.filter((key) => {
      const entry = zip.files[key];
      if (entry.dir) return false;
      if (key.includes("__MACOSX") || key.endsWith(".DS_Store") || key.endsWith("Thumbs.db")) {
        return false;
      }
      return true;
    });

    if (validEntryKeys.length === 0) {
      return { error: "ZIP archive contains no valid files." };
    }

    if (validEntryKeys.length > MAX_FILE_COUNT) {
      return {
        error: `ZIP archive contains ${validEntryKeys.length} files. Maximum allowed is ${MAX_FILE_COUNT}.`,
      };
    }

    let totalExtractedSize = 0;
    const projectFiles: ProjectFile[] = [];
    const seenPaths = new Set<string>();
    const now = new Date().toISOString();

    for (const key of validEntryKeys) {
      const entry = zip.files[key];

      // Validate relative path against traversal
      const validatedPath = validateFilePath(key);
      if (!validatedPath) {
        return {
          error: `Invalid file path in archive: "${key}". Path traversal is not allowed.`,
        };
      }

      const lowerPath = validatedPath.toLowerCase();
      if (seenPaths.has(lowerPath)) {
        return { error: `Duplicate file path in archive: "${validatedPath}".` };
      }
      seenPaths.add(lowerPath);

      // Check extension allowlist
      const extIndex = validatedPath.lastIndexOf(".");
      const ext = extIndex !== -1 ? validatedPath.substring(extIndex).toLowerCase() : "";
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return {
          error: `Unsupported file format in archive: "${validatedPath}". Allowed formats: .tex, .png, .jpg, .jpeg.`,
        };
      }

      const isTex = ext === ".tex";
      const isImage = ext === ".png" || ext === ".jpg" || ext === ".jpeg";

      const fileId = generateFileId();
      const fileName = validatedPath.substring(validatedPath.lastIndexOf("/") + 1);

      if (isTex) {
        const textContent = await entry.async("string");
        const fileSize = new Blob([textContent]).size;

        if (fileSize > MAX_INDIVIDUAL_FILE_SIZE) {
          return {
            error: `File "${validatedPath}" exceeds individual size limit of ${MAX_INDIVIDUAL_FILE_SIZE / (1024 * 1024)} MB.`,
          };
        }

        totalExtractedSize += fileSize;
        if (totalExtractedSize > MAX_TOTAL_EXTRACTED_SIZE) {
          return {
            error: `Archive total extracted size exceeds maximum allowed limit of ${MAX_TOTAL_EXTRACTED_SIZE / (1024 * 1024)} MB.`,
          };
        }

        projectFiles.push({
          id: fileId,
          name: fileName,
          path: validatedPath,
          type: "tex" as ProjectFileType,
          content: textContent,
          createdAt: now,
          updatedAt: now,
        });
      } else if (isImage) {
        const bytes = await entry.async("uint8array");
        const fileSize = bytes.byteLength;

        if (fileSize > MAX_INDIVIDUAL_FILE_SIZE) {
          return {
            error: `Image file "${validatedPath}" exceeds individual size limit of ${MAX_INDIVIDUAL_FILE_SIZE / (1024 * 1024)} MB.`,
          };
        }

        totalExtractedSize += fileSize;
        if (totalExtractedSize > MAX_TOTAL_EXTRACTED_SIZE) {
          return {
            error: `Archive total extracted size exceeds maximum allowed limit of ${MAX_TOTAL_EXTRACTED_SIZE / (1024 * 1024)} MB.`,
          };
        }

        const mimeType = getMimeTypeFromExt(ext);
        const b64 = uint8ArrayToBase64(bytes);
        const dataUrl = `data:${mimeType};base64,${b64}`;

        projectFiles.push({
          id: fileId,
          name: fileName,
          path: validatedPath,
          type: "image" as ProjectFileType,
          content: dataUrl,
          mimeType,
          size: fileSize,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Verify main.tex existence
    const hasMain = projectFiles.some((f) => f.path === MAIN_TEX_PATH);
    if (!hasMain) {
      return { error: "Project archive must contain main.tex." };
    }

    // Derive unique project name from ZIP filename
    const zipBaseName = zipFile.name.replace(/\.zip$/i, "").trim() || "Imported Resume";
    const uniqueProjectName = getUniqueProjectName(existingProjects, zipBaseName);

    const newProject: ResumeProject = {
      id: generateProjectId(),
      name: uniqueProjectName,
      files: projectFiles,
      settings: { ...DEFAULT_COMPILER_SETTINGS },
      createdAt: now,
      updatedAt: now,
    };

    return { newProject };
  } catch (err: unknown) {
    console.error("ZIP import error:", err);
    const message = err instanceof Error ? err.message : "Failed to parse ZIP archive.";
    return { error: `Corrupted or invalid ZIP archive: ${message}` };
  }
}
