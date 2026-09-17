import { NextRequest, NextResponse } from "next/server";

/**
 * Validates path security (rejects path traversal, absolute paths, and system files).
 */
function sanitizeExportPath(path: string): string | null {
  if (!path || typeof path !== "string") return null;

  // Reject absolute paths
  if (/^[a-zA-Z]:[\\\/]/.test(path)) return null;
  if (path.startsWith("/") || path.startsWith("\\")) return null;

  const normalized = path.replace(/\\/g, "/").trim();

  // Reject path traversal
  if (normalized.includes("../") || normalized.includes("..\\")) return null;
  if (normalized === ".." || normalized.startsWith("../")) return null;

  // Exclude forbidden local configuration and system files (.env*, .git*)
  const segments = normalized.split("/");
  if (
    segments.some((seg) => {
      const lower = seg.toLowerCase();
      return lower === ".git" || lower === ".env" || lower.startsWith(".env.") || lower === ".gitignore";
    })
  ) {
    return null;
  }

  return normalized;
}

/**
 * POST /api/github/export
 * Safely exports a ResumeForge project to a selected GitHub repository.
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
    const { project, owner, repo, branch = "main", commitMessage, overwriteConfirmed } = body;

    if (!project || !Array.isArray(project.files) || project.files.length === 0) {
      return NextResponse.json({ error: "Invalid or empty project data" }, { status: 400 });
    }

    if (!owner || !repo) {
      return NextResponse.json({ error: "Repository owner and name are required" }, { status: 400 });
    }

    const cleanCommitMessage =
      typeof commitMessage === "string" && commitMessage.trim()
        ? commitMessage.trim()
        : `chore(resumeforge): export ${project.name || "Resume"}`;

    // 1. Sanitize and prepare file payloads
    const exportFiles: Array<{ path: string; content: string; encoding: "utf-8" | "base64" }> = [];

    for (const file of project.files) {
      const safePath = sanitizeExportPath(file.path);
      if (!safePath) {
        return NextResponse.json(
          { error: `Security Error: Invalid or forbidden file path "${file.path}"` },
          { status: 400 }
        );
      }

      if (file.type === "image") {
        // Image files are stored as Base64 Data URLs (e.g. data:image/png;base64,iVBORw0KG...)
        let rawBase64 = file.content || "";
        if (rawBase64.includes(",")) {
          rawBase64 = rawBase64.split(",")[1];
        }
        exportFiles.push({
          path: safePath,
          content: rawBase64,
          encoding: "base64",
        });
      } else {
        // Text / TeX files are standard UTF-8 text strings
        exportFiles.push({
          path: safePath,
          content: file.content || "",
          encoding: "utf-8",
        });
      }
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "ResumeForge",
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    };

    // 2. Check if repository ref exists & detect existing files
    const refRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
      { headers, cache: "no-store" }
    );

    let latestCommitSha: string | null = null;
    let baseTreeSha: string | null = null;

    if (refRes.ok) {
      const refData = await refRes.json();
      latestCommitSha = refData.object.sha;

      // Fetch the latest commit to get its tree SHA
      const commitRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`,
        { headers, cache: "no-store" }
      );

      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      }
    }

    // 3. Overwrite Safety Check
    if (baseTreeSha && !overwriteConfirmed) {
      // Check existing files in the repository tree
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${baseTreeSha}?recursive=1`,
        { headers, cache: "no-store" }
      );

      if (treeRes.ok) {
        const treeData = await treeRes.json();
        const existingPaths: string[] = Array.isArray(treeData.tree)
          ? treeData.tree.map((t: { path: string }) => t.path)
          : [];

        const overlapping = exportFiles
          .map((f) => f.path)
          .filter((p) => existingPaths.includes(p));

        if (overlapping.length > 0) {
          return NextResponse.json(
            {
              error: `The repository "${owner}/${repo}" already contains existing files that would be modified.`,
              requiresOverwriteConfirmation: true,
              existingFiles: overlapping,
            },
            { status: 409 }
          );
        }
      }
    }

    // 4. Create Blobs for each file
    const treeItems: Array<{ path: string; mode: string; type: string; sha: string }> = [];

    for (const file of exportFiles) {
      const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: file.content,
          encoding: file.encoding,
        }),
      });

      if (!blobRes.ok) {
        const blobErr = await blobRes.json().catch(() => ({}));
        return NextResponse.json(
          { error: `Failed to create GitHub blob for file "${file.path}": ${blobErr.message || "API Error"}` },
          { status: blobRes.status }
        );
      }

      const blobData = await blobRes.json();
      treeItems.push({
        path: file.path,
        mode: "100644",
        type: "blob",
        sha: blobData.sha,
      });
    }

    // 5. Create Git Tree
    const treePayload: { tree: typeof treeItems; base_tree?: string } = { tree: treeItems };
    if (baseTreeSha) {
      treePayload.base_tree = baseTreeSha;
    }

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: "POST",
      headers,
      body: JSON.stringify(treePayload),
    });

    if (!treeRes.ok) {
      const treeErr = await treeRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Failed to create Git tree: ${treeErr.message || "API Error"}` },
        { status: treeRes.status }
      );
    }

    const newTreeData = await treeRes.json();
    const newTreeSha = newTreeData.sha;

    // 6. Create Git Commit
    const commitPayload: { message: string; tree: string; parents?: string[] } = {
      message: cleanCommitMessage,
      tree: newTreeSha,
    };
    if (latestCommitSha) {
      commitPayload.parents = [latestCommitSha];
    }

    const createCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: "POST",
      headers,
      body: JSON.stringify(commitPayload),
    });

    if (!createCommitRes.ok) {
      const commitErr = await createCommitRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Failed to create Git commit: ${commitErr.message || "API Error"}` },
        { status: createCommitRes.status }
      );
    }

    const newCommitData = await createCommitRes.json();
    const newCommitSha = newCommitData.sha;

    // 7. Update Branch Ref (or create ref if empty repo)
    if (latestCommitSha) {
      const updateRefRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ sha: newCommitSha }),
        }
      );

      if (!updateRefRes.ok) {
        const refErr = await updateRefRes.json().catch(() => ({}));
        return NextResponse.json(
          { error: `Failed to update branch reference "${branch}": ${refErr.message || "API Error"}` },
          { status: updateRefRes.status }
        );
      }
    } else {
      // Create new branch reference for initial commit
      const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ref: `refs/heads/${branch}`,
          sha: newCommitSha,
        }),
      });

      if (!createRefRes.ok) {
        const refErr = await createRefRes.json().catch(() => ({}));
        return NextResponse.json(
          { error: `Failed to create branch "${branch}": ${refErr.message || "API Error"}` },
          { status: createRefRes.status }
        );
      }
    }

    const commitUrl = `https://github.com/${owner}/${repo}/commit/${newCommitSha}`;

    return NextResponse.json({
      success: true,
      commitSha: newCommitSha,
      commitUrl,
      commitMessage: cleanCommitMessage,
      fileCount: exportFiles.length,
      github: {
        owner,
        repo,
        branch,
        lastExportedSha: newCommitSha,
        lastExportedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to export project to GitHub:", error);
    return NextResponse.json(
      { error: "Internal server error exporting project to GitHub" },
      { status: 500 }
    );
  }
}
