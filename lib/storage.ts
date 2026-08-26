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
 * Safely load multi-project dataset from browser localStorage.
 * Includes automatic migration from Prompt 3 single-document key.
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
          const activeExists = validProjects.some(
            (p) => p.id === parsed.activeProjectId
          );
          const activeProjectId = activeExists
            ? parsed.activeProjectId
            : validProjects[0].id;

          return {
            version: 1,
            activeProjectId,
            projects: validProjects,
          };
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
 * Create a new resume project, add to storage, and set as active.
 */
export function createProject(
  data: StoredProjects,
  name = "Untitled Resume",
  content = initialLatexSample
): { data: StoredProjects; newProject: ResumeProject } {
  const newId = generateProjectId();
  const now = new Date().toISOString();
  const newProject: ResumeProject = {
    id: newId,
    name: name.trim() || "Untitled Resume",
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
 * Rename a target project.
 */
export function renameProject(
  data: StoredProjects,
  projectId: string,
  newName: string
): StoredProjects {
  const trimmedName = newName.trim();
  if (!trimmedName) return data;

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
  return updatedData;
}

/**
 * Duplicate a project with a new ID and name copy.
 */
export function duplicateProject(
  data: StoredProjects,
  projectId: string
): { data: StoredProjects; newProject: ResumeProject } | null {
  const target = data.projects.find((p) => p.id === projectId);
  if (!target) return null;

  const newId = generateProjectId();
  const now = new Date().toISOString();
  const newProject: ResumeProject = {
    id: newId,
    name: `${target.name} Copy`,
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
