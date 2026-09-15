// ============================================================
// ResumeForge — Automated Template & Compilation Test Suite
// scripts/test-templates.ts
// ============================================================

import path from "path";
import os from "os";
import fs from "fs/promises";
import { RESUME_TEMPLATES } from "../lib/templates";
import {
  StoredProjects,
  ResumeProject,
  createProject,
  createProjectFromTemplate,
  validateFilePath,
  DEFAULT_COMPILER_SETTINGS,
} from "../lib/storage";
import { compileWithDocker, isDockerAvailable } from "../lib/dockerCompiler";

async function runTests() {
  console.log("\n==================================================");
  console.log("RESUMEFORGE TEMPLATE & COMPILATION TEST SUITE");
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
  // 1. Template Registry Tests
  // ------------------------------------------------------------
  console.log("--- 1. Template Registry Integrity ---");
  assert(Array.isArray(RESUME_TEMPLATES), "Template registry loads successfully");
  assert(RESUME_TEMPLATES.length >= 4, "At least 4 templates exist in registry", `Found ${RESUME_TEMPLATES.length}`);

  const requiredIds = ["classic", "modern", "minimal", "academic"];
  for (const id of requiredIds) {
    const found = RESUME_TEMPLATES.find((t) => t.id === id);
    assert(!!found, `Template "${id}" exists in registry`);
  }

  for (const template of RESUME_TEMPLATES) {
    assert(
      typeof template.id === "string" &&
        typeof template.name === "string" &&
        typeof template.category === "string" &&
        typeof template.description === "string" &&
        typeof template.recommendedUseCase === "string" &&
        typeof template.previewSvg === "string",
      `Template "${template.id}" has valid metadata structure`
    );

    const hasMain = template.files.some((f) => f.path === "main.tex" && f.type === "tex");
    assert(hasMain, `Template "${template.id}" contains main.tex`);

    let pathsValid = true;
    for (const f of template.files) {
      if (!validateFilePath(f.path) || !f.content || f.content.trim().length === 0) {
        pathsValid = false;
        break;
      }
    }
    assert(pathsValid, `Template "${template.id}" files have valid paths and non-empty content`);
  }

  // ------------------------------------------------------------
  // 2. Project Creation & Template Independence Tests
  // ------------------------------------------------------------
  console.log("\n--- 2. Project Creation & Template Independence ---");

  let mockStorage: StoredProjects = {
    version: 1,
    activeProjectId: "proj_initial",
    projects: [
      {
        id: "proj_initial",
        name: "Initial Project",
        files: [
          {
            id: "file_1",
            name: "main.tex",
            path: "main.tex",
            type: "tex",
            content: "% initial content\n",
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

  // Test 2.1 Blank project creation
  const blankRes = createProject(mockStorage, "Blank Resume");
  assert(
    blankRes.data.projects.length === 2 && blankRes.newProject.name === "Blank Resume",
    "Creating a blank project still works"
  );
  mockStorage = blankRes.data;

  // Test 2.2 Template project creation for each template
  const createdProjects: Record<string, ResumeProject> = {};
  for (const template of RESUME_TEMPLATES) {
    const templateRes = createProjectFromTemplate(mockStorage, template);
    assert(
      templateRes.newProject.files.length === template.files.length,
      `Creating project from template "${template.name}" populates all ${template.files.length} files`
    );
    mockStorage = templateRes.data;
    createdProjects[template.id] = templateRes.newProject;
  }

  // Test 2.3 Template Independence: edit created project, verify template definition unchanged
  const classicProj = createdProjects["classic"];
  const originalClassicTemplate = RESUME_TEMPLATES.find((t) => t.id === "classic")!;
  const originalMainContent = originalClassicTemplate.files[0].content;

  // Mutate created project file
  classicProj.files[0].content = "% CUSTOM EDITED CONTENT";
  assert(
    originalClassicTemplate.files[0].content === originalMainContent,
    "Editing created project does NOT mutate bundled template definition"
  );

  // Test 2.4 Duplicate template project independence
  const classicCopyRes = createProjectFromTemplate(mockStorage, originalClassicTemplate);
  const classicCopy = classicCopyRes.newProject;
  assert(
    classicCopy.id !== classicProj.id && classicCopy.name.includes("Classic Professional 2"),
    "Creating duplicate template projects produces independent projects with unique names"
  );

  // Verify file IDs are unique
  const mainFile1 = classicProj.files.find((f) => f.path === "main.tex")!;
  const mainFile2 = classicCopy.files.find((f) => f.path === "main.tex")!;
  assert(mainFile1.id !== mainFile2.id, "Files in duplicate template projects have independent unique file IDs");

  // Verify initial project remains unchanged
  const initialProjStillExists = mockStorage.projects.some((p) => p.id === "proj_initial");
  assert(initialProjStillExists, "Existing projects remain intact and unchanged");

  // ------------------------------------------------------------
  // 3. LaTeX Sandbox Compilation Tests
  // ------------------------------------------------------------
  console.log("\n--- 3. Sandboxed LaTeX Compilation Tests ---");

  const dockerOnline = await isDockerAvailable();
  console.log(`Docker compiler availability status: ${dockerOnline ? "ONLINE ✓" : "OFFLINE / UNAVAILABLE ✕"}`);

  if (!dockerOnline) {
    console.log("  ⚠️ Docker is not available on host. Marking compilation tests as BLOCKED / Docker Unavailable.");
  } else {
    for (const template of RESUME_TEMPLATES) {
      console.log(`  Testing compilation for template: "${template.name}" (${template.files.length} files)...`);
      
      // Create temporary build folder for test
      const tempBuildDir = await fs.mkdtemp(path.join(os.tmpdir(), "resumeforge-test-"));
      try {
        for (const file of template.files) {
          const targetPath = path.join(tempBuildDir, file.path);
          await fs.mkdir(path.dirname(targetPath), { recursive: true });
          if (file.type === "tex") {
            await fs.writeFile(targetPath, file.content, "utf-8");
          }
        }

        const compileResult = await compileWithDocker(tempBuildDir, template.compilerSettings);
        assert(
          compileResult.success && !!compileResult.pdfBuffer && compileResult.pdfBuffer.length > 0,
          `Template "${template.name}" compiled successfully to PDF (${compileResult.pdfBuffer?.length || 0} bytes)`,
          compileResult.error || compileResult.details
        );
      } finally {
        await fs.rm(tempBuildDir, { recursive: true, force: true }).catch(() => {});
      }
    }
  }

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
