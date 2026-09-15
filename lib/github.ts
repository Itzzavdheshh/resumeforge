// ============================================================
// ResumeForge — GitHub Integration Abstraction Module
// lib/github.ts
// ============================================================

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

/**
  Retrieves the current GitHub connection status from the backend.
  The server reads the HTTP-only session cookie (`github_access_token`).
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
  Disconnects GitHub by calling the server logout endpoint,
  which clears the HTTP-only session cookies.
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
