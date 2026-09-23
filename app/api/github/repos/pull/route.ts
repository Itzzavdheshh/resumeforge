import { NextRequest, NextResponse } from "next/server";
import { classifyFileChange, FileComparisonItem } from "@/lib/githubCompare";

/**
 * Validates path security (rejects path traversal, absolute paths, and system files).
 */
function sanitizePath(path: string): string | null {
  if (!path || typeof path !== "string") return null;

  if (/^[a-zA-Z]:[\\\/]/.test(path)) return null;
  if (path.startsWith("/") || path.startsWith("\\")) return null;

  const normalized = path.replace(/\\/g, "/").trim();
  if (normalized.includes("../") || normalized.includes("..\\")) return null;
  if (normalized === ".." || normalized.startsWith("../")) return null;

  const segments = normalized.split("/");
  if (
    segments.some((seg) => {
      const lower = seg.toLowerCase();
      return (
        lower === ".git" ||
        lower === ".env" ||
        lower.startsWith(".env.") ||
        lower === ".gitignore"
      );
    })
  ) {
    return null;
  }

  return normalized;
}

/**
 * POST /api/github/repos/pull
 * Inspects a remote GitHub repository and compares its state against the active local project.
 * STRICTLY READ-ONLY: Never writes to local storage or commits/pushes to GitHub.
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
    const { project, owner, repo, branch = "main", lastExportedSha } = body;

    if (!project || !Array.isArray(project.files)) {
      return NextResponse.json({ error: "Invalid project data" }, { status: 400 });
    }

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Repository owner and repo name are required" },
        { status: 400 }
      );
    }

    // Validate owner & repo characters
    if (!/^[a-zA-Z0-9_.-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repo)) {
      return NextResponse.json(
        { error: "Invalid repository owner or repository name format" },
        { status: 400 }
      );
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "ResumeForge",
      Accept: "application/vnd.github.v3+json",
    };

    // 1. Fetch target branch reference
    const refRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
      { headers, cache: "no-store" }
    );

    if (!refRes.ok) {
      if (refRes.status === 404) {
        return NextResponse.json(
          { error: `Repository "${owner}/${repo}" or branch "${branch}" not found` },
          { status: 404 }
        );
      }
      if (refRes.status === 403) {
        return NextResponse.json(
          { error: `Access denied to repository "${owner}/${repo}"` },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `GitHub API error fetching branch ref (${refRes.status})` },
        { status: refRes.status }
      );
    }

    const refData = await refRes.json();
    const latestCommitSha: string = refData.object?.sha || "";

    // 2. Fetch recursive Git tree of latest commit
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${latestCommitSha}?recursive=1`,
      { headers, cache: "no-store" }
    );

    if (!treeRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch Git tree for commit ${latestCommitSha.substring(0, 7)}` },
        { status: treeRes.status }
      );
    }

    const treeData = await treeRes.json();
    const rawTreeItems: Array<{ path: string; type: string; sha: string; size?: number }> =
      Array.isArray(treeData.tree) ? treeData.tree : [];

    // Filter tree items to valid file blobs
    const remoteTreeFiles = rawTreeItems.filter((item) => {
      if (item.type !== "blob") return false;
      return sanitizePath(item.path) !== null;
    });

    // 3. Fetch remote file contents for text/image files
    const remoteFilesMap: Map<string, { content: string; size?: number }> = new Map();

    for (const remoteItem of remoteTreeFiles) {
      const safePath = sanitizePath(remoteItem.path)!;
      try {
        const blobRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/blobs/${remoteItem.sha}`,
          { headers, cache: "no-store" }
        );

        if (blobRes.ok) {
          const blobData = await blobRes.json();
          let decodedContent = "";

          if (blobData.encoding === "base64" && blobData.content) {
            const cleanBase64 = blobData.content.replace(/[\s\r\n]+/g, "");
            const isImage = /\.(png|jpe?g)$/i.test(safePath);
            if (isImage) {
              decodedContent = cleanBase64;
            } else {
              decodedContent = Buffer.from(cleanBase64, "base64").toString("utf-8");
            }
          } else if (typeof blobData.content === "string") {
            decodedContent = blobData.content;
          }

          remoteFilesMap.set(safePath, {
            content: decodedContent,
            size: remoteItem.size,
          });
        }
      } catch (err) {
        console.error(`Failed to fetch remote blob for ${safePath}:`, err);
      }
    }

    // 4. Map Local Files
    const localFilesMap: Map<
      string,
      { content: string; type: "tex" | "image" | "asset"; size?: number }
    > = new Map();

    for (const f of project.files) {
      const safePath = sanitizePath(f.path);
      if (safePath) {
        localFilesMap.set(safePath, {
          content: f.content || "",
          type: (f.type as "tex" | "image" | "asset") || "tex",
          size: f.size ?? f.content.length,
        });
      }
    }

    // 5. Build Union of File Paths
    const allPathsSet = new Set<string>([
      ...Array.from(localFilesMap.keys()),
      ...Array.from(remoteFilesMap.keys()),
    ]);

    const fileSummaries: FileComparisonItem[] = [];
    const hasRemoteChangesSinceExport =
      Boolean(lastExportedSha) && Boolean(latestCommitSha) && lastExportedSha !== latestCommitSha;

    const counts = {
      unchanged: 0,
      localOnly: 0,
      remoteOnly: 0,
      modifiedLocal: 0,
      modifiedRemote: 0,
      conflict: 0,
    };

    for (const filePath of Array.from(allPathsSet)) {
      const localFile = localFilesMap.get(filePath);
      const remoteFile = remoteFilesMap.get(filePath);
      const fileType: "tex" | "image" | "asset" = localFile
        ? localFile.type
        : /\.(png|jpe?g)$/i.test(filePath)
        ? "image"
        : "tex";

      const summary = classifyFileChange({
        path: filePath,
        type: fileType,
        localFile,
        remoteFile,
        lastExportedSha,
        hasLocalChangesSinceExport: localFile ? true : false, // evaluated in comparison engine
        hasRemoteChangesSinceExport,
      });

      fileSummaries.push(summary);

      switch (summary.status) {
        case "UNCHANGED":
          counts.unchanged++;
          break;
        case "LOCAL_ONLY":
          counts.localOnly++;
          break;
        case "REMOTE_ONLY":
          counts.remoteOnly++;
          break;
        case "MODIFIED_LOCAL":
          counts.modifiedLocal++;
          break;
        case "MODIFIED_REMOTE":
          counts.modifiedRemote++;
          break;
        case "CONFLICT":
          counts.conflict++;
          break;
      }
    }

    return NextResponse.json({
      success: true,
      owner,
      repo,
      branch,
      latestCommitSha,
      comparedAt: new Date().toISOString(),
      fileSummaries,
      counts,
    });
  } catch (error) {
    console.error("Failed to pull and compare GitHub repository:", error);
    return NextResponse.json(
      { error: "Internal server error performing remote change inspection" },
      { status: 500 }
    );
  }
}
