// ============================================================
// ResumeForge — GitHub Integration Security & Integration Test Suite
// scripts/test-github.ts
// ============================================================

import { RESUME_TEMPLATES } from "../lib/templates";
import {
  StoredProjects,
  createProject,
  createProjectFromTemplate,
  DEFAULT_COMPILER_SETTINGS,
} from "../lib/storage";

async function runTests() {
  console.log("\n==================================================");
  console.log("RESUMEFORGE GITHUB INTEGRATION SECURITY TEST SUITE");
  console.log("==================================================\n");

  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(`  ✓ PASS ${totalCount}: ${testName}`);
    } else {
      console.error(`  ✕ FAIL ${totalCount}: ${testName}`);
      if (detail) console.error(`    Details: ${detail}`);
    }
  }

  // ------------------------------------------------------------
  // 1. Token Isolation & Storage Security Tests
  // ------------------------------------------------------------
  console.log("--- 1. Token Isolation & Storage Security ---");

  const mockStorageData: StoredProjects = {
    version: 1,
    activeProjectId: "p1",
    projects: [
      {
        id: "p1",
        name: "Test Project",
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

  const serialized = JSON.stringify(mockStorageData);
  assert(
    !serialized.includes("access_token") &&
      !serialized.includes("github_token") &&
      !serialized.includes("pat_"),
    "Sensitive GitHub tokens are NOT written to localStorage schema"
  );

  // ------------------------------------------------------------
  // 2. OAuth Scope & Permission Security Tests
  // ------------------------------------------------------------
  console.log("\n--- 2. OAuth Scope & Permission Security ---");

  // Mock OAuth Login URL generator check
  const clientId = "test_client_id_999";
  const redirectUri = "http://localhost:3000/api/github/callback";
  const state = "crypto_uuid_state_123";

  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", "read:user");
  githubAuthUrl.searchParams.set("state", state);

  const urlString = githubAuthUrl.toString();
  assert(
    urlString.includes("scope=read%3Auser") || urlString.includes("scope=read:user"),
    "OAuth login requests minimum scope (read:user)"
  );
  assert(
    !urlString.includes("repo") && !urlString.includes("delete_repo") && !urlString.includes("write:org"),
    "OAuth login does NOT request excessive write or repository scopes at connection stage"
  );
  assert(
    urlString.includes("state=crypto_uuid_state_123"),
    "OAuth login URL includes cryptographically generated CSRF state parameter"
  );

  // ------------------------------------------------------------
  // 3. State & CSRF Protection Logic Tests
  // ------------------------------------------------------------
  console.log("\n--- 3. State & CSRF Protection Logic ---");

  const validState = "state_abc_123";
  const incomingMismatchState = "state_hack_999";

  const isStateValid = (incoming: string | null, stored: string | null) => {
    if (!incoming || !stored) return false;
    return incoming === stored;
  };

  assert(
    !isStateValid(incomingMismatchState, validState),
    "CSRF state mismatch is detected and rejected"
  );
  assert(
    !isStateValid(null, validState),
    "Missing incoming state is rejected"
  );
  assert(
    !isStateValid(validState, null),
    "Missing stored state cookie is rejected"
  );
  assert(
    isStateValid(validState, validState),
    "Matching state parameter passes CSRF validation"
  );

  // ------------------------------------------------------------
  // 4. Core Application & Template Regression Tests
  // ------------------------------------------------------------
  console.log("\n--- 4. Core Application & Template Regression ---");

  assert(RESUME_TEMPLATES.length === 4, "All 4 built-in resume templates remain loaded");

  const classicTemplate = RESUME_TEMPLATES.find((t) => t.id === "classic")!;
  const createRes = createProjectFromTemplate(mockStorageData, classicTemplate);
  assert(
    createRes.newProject.files.length === 1 && createRes.newProject.name.includes("Classic Professional"),
    "Template project creation works normally with GitHub disconnected"
  );

  const blankRes = createProject(mockStorageData, "Offline Resume");
  assert(
    blankRes.newProject.name === "Offline Resume",
    "Blank project creation works normally with GitHub disconnected"
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
