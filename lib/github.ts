import type { ProjectGitHubMetadata } from "./storage";
import type {
  FileChangeStatus,
  FileComparisonItem,
} from "./githubCompare";

export type { FileChangeStatus, FileComparisonItem };

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export interface GitHubConnectionStatus {
  connected: boolean;
  user?: GitHubUser;
  configured: boolean;
  error?: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url?: string;
  };
  private: boolean;
  default_branch: string;
  html_url: string;
  description: string | null;
  updated_at: string;
}

export interface InspectRepoResult {
  success: boolean;
  owner: string;
  repo: string;
  branch: string;
  existingFiles: string[];
  isEmpty: boolean;
  latestCommitSha?: string;
  error?: string;
}

export interface ExportResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  branch?: string;
  exportedFilesCount?: number;
  requiresOverwriteConfirmation?: boolean;
  existingFiles?: string[];
  exportedAt?: string;
  error?: string;
}

export interface RepoPullResult {
  success: boolean;
  owner: string;
  repo: string;
  branch: string;
  latestCommitSha?: string;
  comparedAt?: string;
  fileSummaries: FileComparisonItem[];
  counts: {
    unchanged: number;
    localOnly: number;
    remoteOnly: number;
    modifiedLocal: number;
    modifiedRemote: number;
    conflict: number;
  };
  error?: string;
}

export interface RepoInspectResult {
  exists: boolean;
  owner: string;
  repo: string;
  branch: string;
  existingFiles: string[];
  isEmpty: boolean;
  error?: string;
}

export interface ExportResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  commitMessage?: string;
  fileCount?: number;
  existingFiles?: string[];
  requiresOverwriteConfirmation?: boolean;
  github?: ProjectGitHubMetadata;
  error?: string;
}

/**
 * Retrieves the current GitHub connection status from the backend.
 * The server reads the HTTP-only session cookie (`github_access_token`).
 */
export async function fetchGitHubStatus(): Promise<GitHubConnectionStatus> {
  try {
    const res = await fetch("/api/github/user", {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return { connected: false, configured: true };
    }

    const data: GitHubConnectionStatus = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch GitHub connection status:", error);
    return { connected: false, configured: true, error: "Network error checking GitHub status" };
  }
}

/**
 * Disconnects GitHub by calling the server logout endpoint,
 * which clears the HTTP-only session cookies.
 */
export async function logoutGitHub(): Promise<GitHubConnectionStatus> {
  try {
    const res = await fetch("/api/github/logout", {
      method: "POST",
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      return { connected: false, configured: true, error: "Logout failed" };
    }

    const data: GitHubConnectionStatus = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to logout from GitHub:", error);
    return { connected: false, configured: true, error: "Network error during logout" };
  }
}

/**
 * Fetches the user's accessible GitHub repositories.
 */
export async function fetchGitHubRepos(): Promise<{ repos: GitHubRepo[]; error?: string }> {
  try {
    const res = await fetch("/api/github/repos", {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { repos: [], error: data.error || "Failed to fetch repositories" };
    }

    const data = await res.json();
    return { repos: data.repos || [] };
  } catch (error) {
    console.error("Failed to fetch GitHub repos:", error);
    return { repos: [], error: "Network error fetching repositories" };
  }
}

/**
 * Creates a new GitHub repository for the authenticated user.
 */
export async function createGitHubRepo(
  name: string,
  description: string = "",
  isPrivate: boolean = true
): Promise<{ repo?: GitHubRepo; error?: string }> {
  try {
    const res = await fetch("/api/github/repos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ name, description, private: isPrivate }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to create repository" };
    }

    return { repo: data.repo };
  } catch (error) {
    console.error("Failed to create GitHub repository:", error);
    return { error: "Network error creating repository" };
  }
}

/**
 * Inspects a GitHub repository to check if target paths exist before export.
 */
export async function inspectGitHubRepo(
  owner: string,
  repo: string,
  branch?: string
): Promise<RepoInspectResult> {
  try {
    const query = new URLSearchParams({ owner, repo });
    if (branch) query.set("branch", branch);

    const res = await fetch(`/api/github/repos/inspect?${query.toString()}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        exists: false,
        owner,
        repo,
        branch: branch || "main",
        existingFiles: [],
        isEmpty: false,
        error: data.error || "Failed to inspect repository",
      };
    }

    return data;
  } catch (error) {
    console.error("Failed to inspect repository:", error);
    return {
      exists: false,
      owner,
      repo,
      branch: branch || "main",
      existingFiles: [],
      isEmpty: false,
      error: "Network error inspecting repository",
    };
  }
}

/**
 * Exports a ResumeForge project to a selected GitHub repository.
 */
export async function exportProjectToGitHub(params: {
  project: {
    id: string;
    name: string;
    files: Array<{ path: string; content: string; type: string }>;
  };
  owner: string;
  repo: string;
  branch: string;
  commitMessage: string;
  overwriteConfirmed?: boolean;
}): Promise<ExportResult> {
  try {
    const res = await fetch("/api/github/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        requiresOverwriteConfirmation: data.requiresOverwriteConfirmation || false,
        existingFiles: data.existingFiles || [],
        error: data.error || "Failed to export project to GitHub",
      };
    }

    return data;
  } catch (error) {
    console.error("Failed to export project to GitHub:", error);
    return {
      success: false,
      error: "Network error exporting project to GitHub",
    };
  }
}

/**
 * Inspects a remote GitHub repository and compares its files against the local project.
 * STRICTLY READ-ONLY: Never writes to local storage or commits to GitHub.
 */
export async function pullAndCompareGitHubRepo(params: {
  project: {
    id: string;
    name: string;
    files: Array<{ path: string; content: string; type: "tex" | "image" | "asset" }>;
  };
  owner: string;
  repo: string;
  branch?: string;
  lastExportedSha?: string;
}): Promise<RepoPullResult> {
  const fallbackResult: RepoPullResult = {
    success: false,
    owner: params.owner,
    repo: params.repo,
    branch: params.branch || "main",
    fileSummaries: [],
    counts: {
      unchanged: 0,
      localOnly: 0,
      remoteOnly: 0,
      modifiedLocal: 0,
      modifiedRemote: 0,
      conflict: 0,
    },
  };

  try {
    const res = await fetch("/api/github/repos/pull", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        ...fallbackResult,
        error: data.error || "Failed to inspect remote repository changes",
      };
    }

    return data;
  } catch (error) {
    console.error("Failed to inspect remote repository changes:", error);
    return {
      ...fallbackResult,
      error: "Network error inspecting remote repository changes",
    };
  }
}


