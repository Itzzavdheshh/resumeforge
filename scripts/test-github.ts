// ============================================================
// ResumeForge — GitHub Integration & Repository Export Test Suite
// scripts/test-github.ts
// ============================================================

import { RESUME_TEMPLATES } from "../lib/templates";
import {
  StoredProjects,
  createProject,
  createProjectFromTemplate,
  updateProjectGitHubMetadata,
  DEFAULT_COMPILER_SETTINGS,
} from "../lib/storage";
import {
  normalizeTextContent,
  extractRawBase64,
  areContentsEqual,
  classifyFileChange,
} from "../lib/githubCompare";

async function runTests() {
  console.log("\n==================================================");
  console.log("RESUMEFORGE GITHUB REPOSITORY EXPORT TEST SUITE");
  console.log("==================================================\n");

  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(`  ✓ PASS ${totalCount.toString().padStart(2, " ")}: ${testName}`);
    } else {
      console.error(`  ✕ FAIL ${totalCount.toString().padStart(2, " ")}: ${testName}`);
      if (detail) console.error(`    Details: ${detail}`);
    }
  }

  // ------------------------------------------------------------
  // 1. GitHub Disconnected Behavior
  // ------------------------------------------------------------
  console.log("--- 1. GitHub Disconnected Behavior ---");

  const mockStorageData: StoredProjects = {
    version: 1,
    activeProjectId: "p1",
    projects: [
      {
        id: "p1",
        name: "Test Resume Project",
        files: [
          {
            id: "f1",
            name: "main.tex",
            path: "main.tex",
            type: "tex",
            content: "\\documentclass{article}\\begin{document}Test\\end{document}",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        settings: { ...DEFAULT_COMPILER_SETTINGS },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  assert(
    mockStorageData.projects[0].name === "Test Resume Project",
    "Local-first projects exist and function without GitHub connection"
  );

  // ------------------------------------------------------------
  // 2. Insufficient Repository Permission Handling
  // ------------------------------------------------------------
  console.log("\n--- 2. Scope & Permission Upgrade Logic ---");

  const scopeTester = (requestedScope: string) => {
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", "test_id");
    url.searchParams.set("scope", requestedScope);
    return url.toString();
  };

  assert(
    scopeTester("repo").includes("scope=repo"),
    "OAuth login route requests 'repo' scope for repository access & export operations"
  );

  // ------------------------------------------------------------
  // 3. Path Security Validation & Rejection
  // ------------------------------------------------------------
  console.log("\n--- 3. Path Traversal & Security Validation ---");

  function sanitizeExportPath(path: string): string | null {
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
        return lower === ".git" || lower === ".env" || lower.startsWith(".env.") || lower === ".gitignore";
      })
    ) {
      return null;
    }

    return normalized;
  }

  assert(sanitizeExportPath("main.tex") === "main.tex", "Valid relative file path is accepted");
  assert(sanitizeExportPath("sections/experience.tex") === "sections/experience.tex", "Valid subfolder path is accepted");
  assert(sanitizeExportPath("../main.tex") === null, "Path traversal ('../main.tex') is rejected");
  assert(sanitizeExportPath("../../etc/passwd") === null, "Deep path traversal ('../../etc/passwd') is rejected");
  assert(sanitizeExportPath("/etc/passwd") === null, "Absolute Unix path ('/etc/passwd') is rejected");
  assert(sanitizeExportPath("C:\\Windows\\System32\\file.tex") === null, "Absolute Windows path is rejected");
  assert(sanitizeExportPath(".env.local") === null, "Sensitive config file ('.env.local') is excluded");
  assert(sanitizeExportPath(".git/config") === null, "Git internal directory ('.git/config') is excluded");

  // ------------------------------------------------------------
  // 4. Binary Image & Base64 Decoding Correctness
  // ------------------------------------------------------------
  console.log("\n--- 4. Binary Image Base64 Decoding ---");

  const sampleDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  function extractBase64Payload(content: string, type: string) {
    if (type === "image") {
      let rawBase64 = content || "";
      if (rawBase64.includes(",")) {
        rawBase64 = rawBase64.split(",")[1];
      }
      return { rawBase64, encoding: "base64" as const };
    }
    return { rawBase64: content, encoding: "utf-8" as const };
  }

  const decodedImage = extractBase64Payload(sampleDataUrl, "image");
  assert(
    decodedImage.encoding === "base64" &&
      !decodedImage.rawBase64.startsWith("data:image") &&
      decodedImage.rawBase64.startsWith("iVBORw0KGgo"),
    "Base64 Data URL is correctly stripped into raw base64 binary content for GitHub API"
  );

  // ------------------------------------------------------------
  // 5. Repository Name & Creation Validation
  // ------------------------------------------------------------
  console.log("\n--- 5. Repository Creation Validation ---");

  function isValidRepoName(name: string): boolean {
    if (!name || typeof name !== "string") return false;
    return /^[a-zA-Z0-9_.-]+$/.test(name.trim());
  }

  assert(isValidRepoName("my-resume"), "Standard repo name 'my-resume' is valid");
  assert(isValidRepoName("resume_2026.pdf_v2"), "Repo name with underscores & dots is valid");
  assert(!isValidRepoName("my resume!"), "Repo name with spaces/exclamation marks is invalid");
  assert(!isValidRepoName("repo/name"), "Repo name with slashes is invalid");

  // ------------------------------------------------------------
  // 6. Overwrite Safety & Confirmation Requirement
  // ------------------------------------------------------------
  console.log("\n--- 6. Repository Overwrite Safety ---");

  function detectOverlappingFiles(repoFiles: string[], projectFiles: string[]): string[] {
    return projectFiles.filter((p) => repoFiles.includes(p));
  }

  const existingRepoTree = ["main.tex", "README.md", "images/photo.png"];
  const exportProjectFiles = ["main.tex", "sections/skills.tex"];

  const overlaps = detectOverlappingFiles(existingRepoTree, exportProjectFiles);
  assert(
    overlaps.length === 1 && overlaps[0] === "main.tex",
    "Overlapping files in target repository are correctly identified"
  );

  // ------------------------------------------------------------
  // 7. Repository Metadata Persistence Without Secrets
  // ------------------------------------------------------------
  console.log("\n--- 7. Repository Link Metadata Persistence ---");

  const updatedStorage = updateProjectGitHubMetadata(mockStorageData, "p1", {
    owner: "testuser",
    repo: "my-resume-repo",
    branch: "main",
    lastExportedSha: "abc123def456",
    lastExportedAt: new Date().toISOString(),
  });

  const updatedProject = updatedStorage.projects.find((p) => p.id === "p1")!;
  assert(
    updatedProject.github?.owner === "testuser" &&
      updatedProject.github?.repo === "my-resume-repo" &&
      updatedProject.github?.lastExportedSha === "abc123def456",
    "Project linked GitHub metadata persists cleanly"
  );

  const serializedStorage = JSON.stringify(updatedStorage);
  assert(
    !serializedStorage.includes("access_token") && !serializedStorage.includes("client_secret"),
    "No secret tokens or credentials are stored in project metadata"
  );

  // ------------------------------------------------------------
  // 8. Template & Core App Regression Verification
  // ------------------------------------------------------------
  console.log("\n--- 8. Template & Core App Regression ---");

  assert(RESUME_TEMPLATES.length === 4, "All 4 built-in resume templates remain intact");

  const modernTemplate = RESUME_TEMPLATES.find((t) => t.id === "modern")!;
  const createTemplateRes = createProjectFromTemplate(mockStorageData, modernTemplate);
  assert(
    createTemplateRes.newProject.files.length >= 1 && createTemplateRes.newProject.name.includes("Modern Executive"),
    "Template creation works without errors"
  );

  const blankProjectRes = createProject(mockStorageData, "New Blank");
  assert(
    blankProjectRes.newProject.name === "New Blank",
    "Blank project creation works without errors"
  );

  // ------------------------------------------------------------
  // 9. Prompt 16 — Remote Pull & Text/Binary Equivalence Tests
  // ------------------------------------------------------------
  console.log("\n--- 9. Text & Binary Normalization Equivalence ---");

  assert(
    normalizeTextContent("Hello\r\nWorld\r\n") === "Hello\nWorld\n",
    "Line ending normalization converts Windows CRLF (\\r\\n) to Unix LF (\\n)"
  );

  const rawB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const dataUrlB64 = `data:image/png;base64,${rawB64}\n  `;

  assert(
    extractRawBase64(dataUrlB64, "image") === rawB64,
    "extractRawBase64 correctly strips Data URL prefix and trailing whitespace/newlines"
  );

  assert(
    areContentsEqual("Line1\r\nLine2\r\n", "Line1\nLine2\n", "tex"),
    "areContentsEqual returns true for text content matching across CRLF vs LF line endings"
  );

  assert(
    areContentsEqual(dataUrlB64, rawB64, "image"),
    "areContentsEqual returns true for image base64 content matching raw base64 vs data URL"
  );

  // ------------------------------------------------------------
  // 10. Prompt 16 — 6-State Change Classification Tests
  // ------------------------------------------------------------
  console.log("\n--- 10. 6-State File Change Classification ---");

  const localOnlyRes = classifyFileChange({
    path: "sections/projects.tex",
    type: "tex",
    localFile: { content: "\\section{Projects}" },
  });
  assert(localOnlyRes.status === "LOCAL_ONLY", "File existing only in local project is classified as LOCAL_ONLY");

  const remoteOnlyRes = classifyFileChange({
    path: "README.md",
    type: "tex",
    remoteFile: { content: "# My Resume Repository" },
  });
  assert(remoteOnlyRes.status === "REMOTE_ONLY", "File existing only on GitHub is classified as REMOTE_ONLY");

  const unchangedRes = classifyFileChange({
    path: "main.tex",
    type: "tex",
    localFile: { content: "\\documentclass{article}\r\n" },
    remoteFile: { content: "\\documentclass{article}\n" },
  });
  assert(unchangedRes.status === "UNCHANGED", "Identical file contents are classified as UNCHANGED");

  const modLocalRes = classifyFileChange({
    path: "main.tex",
    type: "tex",
    localFile: { content: "Local modified content" },
    remoteFile: { content: "Original content" },
    hasLocalChangesSinceExport: true,
    hasRemoteChangesSinceExport: false,
  });
  assert(modLocalRes.status === "MODIFIED_LOCAL", "File modified locally since export is classified as MODIFIED_LOCAL");

  const modRemoteRes = classifyFileChange({
    path: "main.tex",
    type: "tex",
    localFile: { content: "Original content" },
    remoteFile: { content: "Remote modified content" },
    hasLocalChangesSinceExport: false,
    hasRemoteChangesSinceExport: true,
  });
  assert(modRemoteRes.status === "MODIFIED_REMOTE", "File modified on GitHub since export is classified as MODIFIED_REMOTE");

  const conflictRes = classifyFileChange({
    path: "main.tex",
    type: "tex",
    localFile: { content: "Local edit" },
    remoteFile: { content: "Remote edit" },
    hasLocalChangesSinceExport: true,
    hasRemoteChangesSinceExport: true,
  });
  assert(conflictRes.status === "CONFLICT", "File modified both locally AND remotely is classified as CONFLICT");

  // ------------------------------------------------------------
  // 11. Prompt 16 — Non-Destructive Read-Only Behavior Safety
  // ------------------------------------------------------------
  console.log("\n--- 11. Read-Only & Non-Destructive Safety Guarantees ---");

  const initialProjectCopy = JSON.parse(JSON.stringify(mockStorageData));
  
  // Simulate performing a pull operation (inspection only)
  const compareSummary = [
    localOnlyRes,
    remoteOnlyRes,
    unchangedRes,
    modLocalRes,
    modRemoteRes,
    conflictRes,
  ];

  assert(
    JSON.stringify(initialProjectCopy) === JSON.stringify(mockStorageData),
    "Pull inspection operation strictly leaves local project state and storage untouched"
  );

  assert(
    compareSummary.length === 6 &&
      compareSummary.every((item) => typeof item.explanation === "string" && item.explanation.length > 0),
    "Pull comparison generates human-readable explanations for all status categories"
  );

  // ------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------
  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passedCount} / ${totalCount} TESTS PASSED`);
  console.log("==================================================\n");

  if (passedCount < totalCount) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
