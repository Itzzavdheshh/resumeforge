// ============================================================
// ResumeForge — Multi-File Project Storage Model
// lib/storage.ts
// ============================================================

// ---- Types -------------------------------------------------

export type ProjectFileType = "tex" | "image" | "asset";

export interface ProjectFile {
  id: string;
  name: string;       // e.g. "main.tex", "experience.tex"
  path: string;       // e.g. "main.tex", "sections/experience.tex"
  type: ProjectFileType;
  content: string;    // UTF-8 text content (for tex files)
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string
}

export interface ResumeProject {
  id: string;
  name: string;
  files: ProjectFile[];
  /** @deprecated Legacy single-file content. Automatically migrated on load. */
  latex?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredProjects {
  version: 1;
  activeProjectId: string;
  projects: ResumeProject[];
}

// ---- Constants ---------------------------------------------

export const PROJECTS_STORAGE_KEY = "resumeforge:projects";
export const OLD_DOCUMENT_STORAGE_KEY = "resumeforge:document:main";

export const MAIN_TEX_PATH = "main.tex";

// ---- Default Content ---------------------------------------

export const initialLatexSample = `\\documentclass[letterpaper,11pt]{article}

\\begin{document}

\\begin{center}
  {\\Huge \\scshape Avdhesh Kumar Dadhich} \\\\
  \\vspace{4pt}
  \\small Software Engineer \\textbullet\\ Full Stack Developer
\\end{center}

\\section{Professional Summary}

Third-year B.Tech. CSE student with hands-on experience
building full-stack web applications, REST APIs, and developer tools.

\\section{Projects}

\\textbf{Nexora} --- Mentorship \\& Career Growth Platform

\\begin{itemize}
  \\item Built a full-stack mentorship platform.
  \\item Used React, Node.js, Express.js and PostgreSQL.
\\end{itemize}

\\section{Education}

Jodhpur Institute of Engineering and Technology (JIET)

\\end{document}`;

// ---- ID Generator ------------------------------------------

export function generateProjectId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return (
    "proj_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).substring(2, 9)
  );
}

export function generateFileId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return (
    "file_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).substring(2, 9)
  );
}

// ---- File Path Security ------------------------------------

/**
 * Validates that a file path is safe (no traversal, no absolute paths).
 * Returns the normalized path or null if invalid.
 */
export function validateFilePath(filePath: string): string | null {
  if (!filePath || typeof filePath !== "string") return null;

  // Reject absolute paths
  if (/^[a-zA-Z]:[\\\/]/.test(filePath)) return null;
  if (filePath.startsWith("/") || filePath.startsWith("\\")) return null;

  // Reject path traversal
  const normalized = filePath.replace(/\\/g, "/").trim();
  if (normalized.includes("../") || normalized.includes("..\\")) return null;
  if (normalized === "..") return null;
  if (normalized.startsWith("../")) return null;

  // Reject empty or dangerous segments
  const segments = normalized.split("/");
  for (const seg of segments) {
    if (seg === "" || seg === ".." || seg === ".") {
      if (seg === "..") return null;
    }
  }

  return normalized;
}

/**
 * Checks if a file path already exists in a project's file list.
 */
export function isFilePathTaken(
  files: ProjectFile[],
  filePath: string,
  excludeFileId?: string
): boolean {
  const normalized = filePath.trim().toLowerCase();
  return files.some((f) => {
    if (excludeFileId && f.id === excludeFileId) return false;
    return f.path.trim().toLowerCase() === normalized;
  });
}

// ---- Project Name Uniqueness --------------------------------

export function isProjectNameTaken(
  projects: ResumeProject[],
  name: string,
  excludeProjectId?: string
): boolean {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return true;

  return projects.some((p) => {
    if (excludeProjectId && p.id === excludeProjectId) return false;
    return p.name.trim().toLowerCase() === normalized;
  });
}

export function getUniqueProjectName(
  projects: ResumeProject[],
  desiredName: string
): string {
  const baseName = desiredName.trim() || "Untitled Resume";

  if (!isProjectNameTaken(projects, baseName)) {
    return baseName;
  }

  let counter = 2;
  while (counter < 10000) {
    const candidate = `${baseName} ${counter}`;
    if (!isProjectNameTaken(projects, candidate)) {
      return candidate;
    }
    counter++;
  }

  return `${baseName} ${Date.now()}`;
}

// ---- File Helpers ------------------------------------------

/**
 * Returns the main.tex file from a project's file list.
 * If missing (corrupted data), creates a fallback.
 */
export function getMainFile(project: ResumeProject): ProjectFile {
  const main = project.files.find((f) => f.path === MAIN_TEX_PATH);
  if (main) return main;

  // Fallback: return any tex file as "main", or create a blank one
  const firstTex = project.files.find((f) => f.type === "tex");
  if (firstTex) return firstTex;

  // Emergency fallback
  return {
    id: generateFileId(),
    name: "main.tex",
    path: MAIN_TEX_PATH,
    type: "tex",
    content: initialLatexSample,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Build a new ProjectFile for main.tex with given content.
 */
function makeMainFile(content: string = initialLatexSample): ProjectFile {
  const now = new Date().toISOString();
  return {
    id: generateFileId(),
    name: "main.tex",
    path: MAIN_TEX_PATH,
    type: "tex",
    content,
    createdAt: now,
    updatedAt: now,
  };
}

// ---- Migrate old project (latex: string → files) -----------

function migrateProject(project: ResumeProject): ResumeProject {
  // Already has files array — check if valid
  if (Array.isArray(project.files) && project.files.length > 0) {
    // Ensure main.tex exists
    const hasMain = project.files.some((f) => f.path === MAIN_TEX_PATH);
    if (hasMain) return project;

    // Prepend a main.tex recovered from first tex file
    const firstTex = project.files.find((f) => f.type === "tex");
    const mainContent = firstTex?.content ?? initialLatexSample;
    return {
      ...project,
      files: [makeMainFile(mainContent), ...project.files],
    };
  }

  // Legacy project with latex: string
  const legacyLatex = (project as ResumeProject & { latex?: string }).latex;
  return {
    ...project,
    files: [makeMainFile(legacyLatex ?? initialLatexSample)],
    latex: undefined,
  };
}

// ---- Load / Save -------------------------------------------

export function loadProjectsData(): StoredProjects | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.version === 1 &&
        typeof parsed.activeProjectId === "string" &&
        Array.isArray(parsed.projects) &&
        parsed.projects.length > 0
      ) {
        // Validate and migrate all projects
        const validProjects: ResumeProject[] = parsed.projects
          .filter(
            (p: unknown) =>
              p &&
              typeof p === "object" &&
              typeof (p as ResumeProject).id === "string" &&
              typeof (p as ResumeProject).name === "string"
          )
          .map((p: ResumeProject) => migrateProject(p));

        if (validProjects.length > 0) {
          // Normalize duplicate project names
          const normalizedProjects: ResumeProject[] = [];
          let hasNameAdjustments = false;

          for (const proj of validProjects) {
            const cleanName = proj.name.trim() || "Untitled Resume";
            if (isProjectNameTaken(normalizedProjects, cleanName)) {
              const uniqueName = getUniqueProjectName(normalizedProjects, cleanName);
              normalizedProjects.push({ ...proj, name: uniqueName });
              hasNameAdjustments = true;
            } else {
              normalizedProjects.push({ ...proj, name: cleanName });
            }
          }

          const activeExists = normalizedProjects.some(
            (p) => p.id === parsed.activeProjectId
          );
          const activeProjectId = activeExists
            ? parsed.activeProjectId
            : normalizedProjects[0].id;

          const loadedData: StoredProjects = {
            version: 1,
            activeProjectId,
            projects: normalizedProjects,
          };

          // Save back if we migrated anything
          if (hasNameAdjustments) {
            window.localStorage.setItem(
              PROJECTS_STORAGE_KEY,
              JSON.stringify(loadedData)
            );
          }

          return loadedData;
        }
      }
    }

    // Migration from Prompt 3 old document key
    const oldRaw = window.localStorage.getItem(OLD_DOCUMENT_STORAGE_KEY);
    if (oldRaw) {
      const oldParsed = JSON.parse(oldRaw);
      if (
        oldParsed &&
        typeof oldParsed === "object" &&
        typeof oldParsed.latex === "string"
      ) {
        const migratedId = generateProjectId();
        const migratedProject: ResumeProject = {
          id: migratedId,
          name: "My Resume",
          files: [makeMainFile(oldParsed.latex)],
          createdAt:
            typeof oldParsed.savedAt === "string"
              ? oldParsed.savedAt
              : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const migratedData: StoredProjects = {
          version: 1,
          activeProjectId: migratedId,
          projects: [migratedProject],
        };

        window.localStorage.setItem(
          PROJECTS_STORAGE_KEY,
          JSON.stringify(migratedData)
        );
        return migratedData;
      }
    }

    // Default initialization
    const defaultId = generateProjectId();
    const defaultProject: ResumeProject = {
      id: defaultId,
      name: "My Resume",
      files: [makeMainFile()],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const defaultData: StoredProjects = {
      version: 1,
      activeProjectId: defaultId,
      projects: [defaultProject],
    };

    window.localStorage.setItem(
      PROJECTS_STORAGE_KEY,
      JSON.stringify(defaultData)
    );
    return defaultData;
  } catch (error) {
    console.error("Failed to load projects data from localStorage:", error);
    return null;
  }
}

export function saveProjectsData(data: StoredProjects): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save projects data to localStorage:", error);
    return false;
  }
}

// ---- Project CRUD ------------------------------------------

export function createProject(
  data: StoredProjects,
  name = "Untitled Resume",
  content = initialLatexSample
): { data: StoredProjects; newProject: ResumeProject } {
  const newId = generateProjectId();
  const now = new Date().toISOString();

  const desired = name ? name.trim() : "Untitled Resume";
  const uniqueName = getUniqueProjectName(data.projects, desired);

  const newProject: ResumeProject = {
    id: newId,
    name: uniqueName,
    files: [makeMainFile(content)],
    createdAt: now,
    updatedAt: now,
  };

  const updatedData: StoredProjects = {
    version: 1,
    activeProjectId: newId,
    projects: [...data.projects, newProject],
  };

  saveProjectsData(updatedData);
  return { data: updatedData, newProject };
}

export function renameProject(
  data: StoredProjects,
  projectId: string,
  newName: string
): { data: StoredProjects; success: boolean; error?: string } {
  const trimmedName = newName.trim();
  if (!trimmedName) {
    return { data, success: false, error: "Project name cannot be empty." };
  }

  if (isProjectNameTaken(data.projects, trimmedName, projectId)) {
    return { data, success: false, error: "A project with this name already exists." };
  }

  const now = new Date().toISOString();
  const updatedProjects = data.projects.map((p) => {
    if (p.id === projectId) {
      return { ...p, name: trimmedName, updatedAt: now };
    }
    return p;
  });

  const updatedData: StoredProjects = { ...data, projects: updatedProjects };
  saveProjectsData(updatedData);
  return { data: updatedData, success: true };
}

export function duplicateProject(
  data: StoredProjects,
  projectId: string
): { data: StoredProjects; newProject: ResumeProject } | null {
  const target = data.projects.find((p) => p.id === projectId);
  if (!target) return null;

  const newId = generateProjectId();
  const now = new Date().toISOString();

  const desiredName = `${target.name} Copy`;
  const uniqueName = getUniqueProjectName(data.projects, desiredName);

  // Deep copy all files with new IDs
  const copiedFiles: ProjectFile[] = target.files.map((f) => ({
    ...f,
    id: generateFileId(),
    createdAt: now,
    updatedAt: now,
  }));

  const newProject: ResumeProject = {
    id: newId,
    name: uniqueName,
    files: copiedFiles,
    createdAt: now,
    updatedAt: now,
  };

  const updatedData: StoredProjects = {
    version: 1,
    activeProjectId: newId,
    projects: [...data.projects, newProject],
  };

  saveProjectsData(updatedData);
  return { data: updatedData, newProject };
}

export function deleteProject(
  data: StoredProjects,
  projectId: string
): { data: StoredProjects; deleted: boolean } {
  if (data.projects.length <= 1) {
    return { data, deleted: false };
  }

  const updatedProjects = data.projects.filter((p) => p.id !== projectId);
  let newActiveId = data.activeProjectId;

  if (data.activeProjectId === projectId) {
    newActiveId = updatedProjects[0].id;
  }

  const updatedData: StoredProjects = {
    version: 1,
    activeProjectId: newActiveId,
    projects: updatedProjects,
  };

  saveProjectsData(updatedData);
  return { data: updatedData, deleted: true };
}

// ---- File CRUD (within a project) --------------------------

/**
 * Update the content of a specific file within a project.
 */
export function updateProjectFile(
  data: StoredProjects,
  projectId: string,
  fileId: string,
  content: string
): StoredProjects {
  const now = new Date().toISOString();
  const updatedProjects = data.projects.map((p) => {
    if (p.id !== projectId) return p;
    const updatedFiles = p.files.map((f) => {
      if (f.id !== fileId) return f;
      return { ...f, content, updatedAt: now };
    });
    return { ...p, files: updatedFiles, updatedAt: now };
  });

  const updatedData: StoredProjects = { ...data, projects: updatedProjects };
  saveProjectsData(updatedData);
  return updatedData;
}

/**
 * Create a new .tex file within a project.
 * Returns updated data + new file, or error string.
 */
export function createProjectFile(
  data: StoredProjects,
  projectId: string,
  fileName: string
): { data: StoredProjects; newFile: ProjectFile; error?: never } | { error: string; data?: never; newFile?: never } {
  const project = data.projects.find((p) => p.id === projectId);
  if (!project) return { error: "Project not found." };

  const trimmedName = fileName.trim();
  if (!trimmedName) return { error: "File name cannot be empty." };

  // Ensure .tex extension
  const nameWithExt = trimmedName.endsWith(".tex") ? trimmedName : `${trimmedName}.tex`;

  // Build path: place in root for now
  const filePath = nameWithExt;
  const validated = validateFilePath(filePath);
  if (!validated) return { error: "Invalid file path." };

  if (isFilePathTaken(project.files, validated)) {
    return { error: `A file named "${nameWithExt}" already exists.` };
  }

  const now = new Date().toISOString();
  const newFile: ProjectFile = {
    id: generateFileId(),
    name: nameWithExt,
    path: validated,
    type: "tex",
    content: `% ${nameWithExt}\n`,
    createdAt: now,
    updatedAt: now,
  };

  const updatedProjects = data.projects.map((p) => {
    if (p.id !== projectId) return p;
    return { ...p, files: [...p.files, newFile], updatedAt: now };
  });

  const updatedData: StoredProjects = { ...data, projects: updatedProjects };
  saveProjectsData(updatedData);
  return { data: updatedData, newFile };
}

/**
 * Delete a file from a project. main.tex cannot be deleted.
 */
export function deleteProjectFile(
  data: StoredProjects,
  projectId: string,
  fileId: string
): { data: StoredProjects; deleted: boolean; error?: string } {
  const project = data.projects.find((p) => p.id === projectId);
  if (!project) return { data, deleted: false, error: "Project not found." };

  const file = project.files.find((f) => f.id === fileId);
  if (!file) return { data, deleted: false, error: "File not found." };

  if (file.path === MAIN_TEX_PATH) {
    return { data, deleted: false, error: "main.tex cannot be deleted." };
  }

  const now = new Date().toISOString();
  const updatedProjects = data.projects.map((p) => {
    if (p.id !== projectId) return p;
    return { ...p, files: p.files.filter((f) => f.id !== fileId), updatedAt: now };
  });

  const updatedData: StoredProjects = { ...data, projects: updatedProjects };
  saveProjectsData(updatedData);
  return { data: updatedData, deleted: true };
}

/**
 * Rename a file within a project.
 * main.tex cannot be renamed.
 */
export function renameProjectFile(
  data: StoredProjects,
  projectId: string,
  fileId: string,
  newName: string
): { data: StoredProjects; success: boolean; error?: string } {
  const project = data.projects.find((p) => p.id === projectId);
  if (!project) return { data, success: false, error: "Project not found." };

  const file = project.files.find((f) => f.id === fileId);
  if (!file) return { data, success: false, error: "File not found." };

  if (file.path === MAIN_TEX_PATH) {
    return { data, success: false, error: "main.tex cannot be renamed." };
  }

  const trimmedName = newName.trim();
  if (!trimmedName) return { data, success: false, error: "File name cannot be empty." };

  const nameWithExt = trimmedName.endsWith(".tex") ? trimmedName : `${trimmedName}.tex`;
  const newPath = nameWithExt;
  const validated = validateFilePath(newPath);
  if (!validated) return { data, success: false, error: "Invalid file name." };

  if (isFilePathTaken(project.files, validated, fileId)) {
    return { data, success: false, error: `A file named "${nameWithExt}" already exists.` };
  }

  const now = new Date().toISOString();
  const updatedProjects = data.projects.map((p) => {
    if (p.id !== projectId) return p;
    const updatedFiles = p.files.map((f) => {
      if (f.id !== fileId) return f;
      return { ...f, name: nameWithExt, path: validated, updatedAt: now };
    });
    return { ...p, files: updatedFiles, updatedAt: now };
  });

  const updatedData: StoredProjects = { ...data, projects: updatedProjects };
  saveProjectsData(updatedData);
  return { data: updatedData, success: true };
}

// ---- Legacy compatibility (used by old import code) --------

/**
 * Update the content of the active project's main.tex file.
 * Backward-compatible helper used for .tex import.
 */
export function updateActiveProjectMainTex(
  data: StoredProjects,
  content: string
): StoredProjects {
  const project = data.projects.find((p) => p.id === data.activeProjectId);
  if (!project) return data;

  const mainFile = getMainFile(project);
  return updateProjectFile(data, data.activeProjectId, mainFile.id, content);
}

// ---- Filename sanitizer ------------------------------------

export function sanitizeFilename(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9\s_-]/g, "").trim();
  return clean ? clean.replace(/\s+/g, "-") : "resume";
}
