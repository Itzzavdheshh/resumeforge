import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/github/repos/inspect?owner=X&repo=Y&branch=Z
 * Inspects a repository to discover branch info and detect existing files for overwrite safety.
 */
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("github_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { error: "GitHub account not connected or session expired" },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const reqBranch = searchParams.get("branch");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Owner and repo parameters are required" },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch Repository Details
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "ResumeForge",
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return NextResponse.json(
          { error: `Repository "${owner}/${repo}" not found or access denied` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `GitHub API error inspecting repository (${repoRes.status})` },
        { status: repoRes.status }
      );
    }

    const repoData = await repoRes.json();
    const defaultBranch = reqBranch || repoData.default_branch || "main";

    // 2. Fetch Contents of Root Directory
    const contentsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents?ref=${defaultBranch}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "ResumeForge",
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    let existingFiles: string[] = [];
    let isEmpty = false;

    if (contentsRes.ok) {
      const contentsData = await contentsRes.json();
      if (Array.isArray(contentsData)) {
        existingFiles = contentsData.map((item: { path: string }) => item.path);
      }
    } else if (contentsRes.status === 404) {
      // Empty repo without commits
      isEmpty = true;
    }

    return NextResponse.json({
      exists: true,
      owner,
      repo,
      branch: defaultBranch,
      existingFiles,
      isEmpty,
    });
  } catch (error) {
    console.error("Failed to inspect repository:", error);
    return NextResponse.json(
      { error: "Internal server error inspecting repository" },
      { status: 500 }
    );
  }
}
