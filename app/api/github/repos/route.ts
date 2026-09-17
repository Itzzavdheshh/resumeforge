import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/github/repos
 * Lists repositories accessible by the authenticated GitHub user.
 */
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("github_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { error: "GitHub account not connected or session expired" },
      { status: 401 }
    );
  }

  try {
    // Fetch repositories sorted by updated date (up to 100)
    const ghRes = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=100&type=all",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "ResumeForge",
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!ghRes.ok) {
      if (ghRes.status === 401) {
        const res = NextResponse.json(
          { error: "GitHub session expired. Please re-connect." },
          { status: 401 }
        );
        res.cookies.delete("github_access_token");
        return res;
      }

      const errData = await ghRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to fetch repositories from GitHub" },
        { status: ghRes.status }
      );
    }

    const reposData = await ghRes.json();
    if (!Array.isArray(reposData)) {
      return NextResponse.json({ repos: [] });
    }

    interface RawRepoItem {
      name: string;
      full_name: string;
      owner?: { login?: string; avatar_url?: string };
      private?: boolean;
      default_branch?: string;
      html_url: string;
      description?: string | null;
      updated_at: string;
    }

    const repos = (reposData as RawRepoItem[]).map((r) => ({
      name: r.name,
      full_name: r.full_name,
      owner: {
        login: r.owner?.login || "",
        avatar_url: r.owner?.avatar_url || "",
      },
      private: Boolean(r.private),
      default_branch: r.default_branch || "main",
      html_url: r.html_url,
      description: r.description || null,
      updated_at: r.updated_at,
    }));

    return NextResponse.json({ repos });
  } catch (error) {
    console.error("Failed to list GitHub repositories:", error);
    return NextResponse.json(
      { error: "Internal server error fetching repositories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/github/repos
 * Creates a new repository for the authenticated user.
 */
export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("github_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { error: "GitHub account not connected or session expired" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const isPrivate = body.private !== false; // Default to private

    if (!name) {
      return NextResponse.json({ error: "Repository name is required" }, { status: 400 });
    }

    // Validate repository name (GitHub repo name rules: alphanumeric, hyphens, underscores, dots)
    if (!/^[a-zA-Z0-9_.-]+$/.test(name)) {
      return NextResponse.json(
        { error: "Invalid repository name. Use letters, numbers, hyphens, dots, or underscores." },
        { status: 400 }
      );
    }

    const ghRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "ResumeForge",
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true, // Initialize with README so branch refs exist
      }),
    });

    const repoData = await ghRes.json();

    if (!ghRes.ok) {
      return NextResponse.json(
        { error: repoData.message || "Failed to create GitHub repository" },
        { status: ghRes.status }
      );
    }

    return NextResponse.json({
      repo: {
        name: repoData.name,
        full_name: repoData.full_name,
        owner: {
          login: repoData.owner?.login || "",
          avatar_url: repoData.owner?.avatar_url || "",
        },
        private: Boolean(repoData.private),
        default_branch: repoData.default_branch || "main",
        html_url: repoData.html_url,
        description: repoData.description || null,
        updated_at: repoData.updated_at,
      },
    });
  } catch (error) {
    console.error("Failed to create GitHub repository:", error);
    return NextResponse.json(
      { error: "Internal server error creating repository" },
      { status: 500 }
    );
  }
}
