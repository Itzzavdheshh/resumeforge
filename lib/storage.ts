export interface ResumeProject {
  id: string;
  name: string;
  latex: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface StoredProjects {
  version: 1;
  activeProjectId: string;
  projects: ResumeProject[];
}

export const PROJECTS_STORAGE_KEY = "resumeforge:projects";
export const OLD_DOCUMENT_STORAGE_KEY = "resumeforge:document:main";

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

/**
 * Unique ID generator with crypto.randomUUID and safe fallback.
 */
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

/**
 * Checks if a project name is already used in a case-insensitive manner (trimmed).
 * Optionally excludes a project ID (useful during rename validation).
 */
export function isProjectNameTaken(
  projects: ResumeProject[],
  name: string,
  excludeProjectId?: string
): boolean {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return true;

  return projects.some((p) => {
    if (excludeProjectId && p.id === excludeProjectId) {
      return false;
    }
    return p.name.trim().toLowerCase() === normalized;
  });
}

/**
 * Generates a unique project name by appending numeric suffixes if the desired name exists.
 * E.g. "Untitled Resume" -> "Untitled Resume 2" -> "Untitled Resume 3".
 * E.g. "My Resume Copy" -> "My Resume Copy 2".
 */
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

/**
 * Safely load multi-project dataset from browser localStorage.
 * Includes automatic migration from Prompt 3 single-document key,
 * and safe name-uniquification for legacy data with duplicate names.
 */
export function loadProjectsData(): StoredProjects | null {
  if (typeof window === "undefined") {
    return null;
  }

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
        // Validate array items
        const validProjects: ResumeProject[] = parsed.projects.filter(
          (p: unknown) =>
            p &&
            typeof p === "object" &&
            typeof (p as ResumeProject).id === "string" &&
            typeof (p as ResumeProject).name === "string" &&
            typeof (p as ResumeProject).latex === "string"
        );

        if (validProjects.length > 0) {
          // Normalize names safely if duplicates exist in stored data
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

    // Migration Check: Check for Prompt 3 old document key
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
          latex: oldParsed.latex,
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

    // Default initialization if no existing data exists
    const defaultId = generateProjectId();
    const defaultProject: ResumeProject = {
      id: defaultId,
      name: "My Resume",
      latex: initialLatexSample,
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

/**
 * Safely persist the StoredProjects object to localStorage.
 */
export function saveProjectsData(data: StoredProjects): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save projects data to localStorage:", error);
    return false;
  }
}

/**
 * Create a new resume project, generate a unique name if default exists, add to storage, and set as active.
 */
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
    latex: content,
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

/**
 * Update content of the active project in StoredProjects.
 */
export function updateActiveProjectContent(
  data: StoredProjects,
  latex: string
): StoredProjects {
  const now = new Date().toISOString();
  const updatedProjects = data.projects.map((p) => {
    if (p.id === data.activeProjectId) {
      return { ...p, latex, updatedAt: now };
    }
    return p;
  });

  const updatedData: StoredProjects = {
    ...data,
    projects: updatedProjects,
  };

  saveProjectsData(updatedData);
  return updatedData;
}

/**
 * Rename a target project with validation against duplicate or empty names.
 */
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

  const updatedData: StoredProjects = {
    ...data,
    projects: updatedProjects,
  };

  saveProjectsData(updatedData);
  return { data: updatedData, success: true };
}

/**
 * Duplicate a project with a new ID and a unique name copy.
 */
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

  const newProject: ResumeProject = {
    id: newId,
    name: uniqueName,
    latex: target.latex,
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

/**
 * Delete a project. Ensures at least one project remains.
 */
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

/**
 * Sanitize a string for safe use in file downloads.
 */
export function sanitizeFilename(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9\s_-]/g, "").trim();
  return clean ? clean.replace(/\s+/g, "-") : "resume";
}
