import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execFileAsync = promisify(execFile);

export interface CompilerOptions {
  paperSize: "letter" | "a4";
  passes: 1 | 2;
}

export interface DockerCompileResult {
  success: boolean;
  pdfBuffer?: Buffer;
  error?: string;
  details?: string;
  dockerUnavailable?: boolean;
}

const DOCKER_IMAGE_NAME = "resumeforge-compiler:latest";
const DOCKER_TIMEOUT_MS = 15_000; // 15 seconds compile timeout

/**
 * Augmented PATH for Windows: ensures Docker CLI is found by child processes
 * spawned inside the Next.js / Turbopack process tree, where Docker Desktop's
 * bin directory may not be on the inherited PATH.
 */
function getDockerEnv(): NodeJS.ProcessEnv {
  const extraPaths = [
    "C:\\Program Files\\Docker\\Docker\\resources\\bin",
    "C:\\ProgramData\\DockerDesktop\\version-bin",
  ];
  return {
    ...process.env,
    PATH: [...extraPaths, process.env.PATH ?? ""].join(";"),
  };
}

/**
 * Checks if the Docker CLI is installed and the Docker daemon is online and reachable.
 */
export async function isDockerAvailable(): Promise<boolean> {
  try {
    await execFileAsync("docker", ["info"], {
      timeout: 8000,
      env: getDockerEnv(),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Compiles a LaTeX project inside an isolated, unprivileged Docker container.
 *
 * Security controls applied:
 * - --net=none: Disable network access inside container.
 * - --cpus=1.5: CPU allocation quota.
 * - -m 512m: Memory allocation limit.
 * - --pids-limit=64: Process count limit (prevent fork bombs).
 * - --read-only: Root filesystem is read-only.
 * - --tmpfs /tmp: Temporary writable RAM disk for LaTeX build files.
 * - -v <tempDir>:/workspace:rw: Volume mount scoped strictly to request temp directory.
 * - --user 1000:1000: Execute as non-root user.
 * - --rm: Automatically remove container on exit.
 */
export async function compileWithDocker(
  tempDir: string,
  options: CompilerOptions
): Promise<DockerCompileResult> {
  const isAvailable = await isDockerAvailable();
  if (!isAvailable) {
    return {
      success: false,
      dockerUnavailable: true,
      error: "Sandbox compiler unavailable",
      details:
        "Docker daemon is not running on the host system. Please start Docker Desktop to enable sandboxed compilation.",
    };
  }

  const absoluteTempDir = path.resolve(tempDir);
  const containerName = `resumeforge-build-${Date.now()}-${Math.floor(
    Math.random() * 10000
  )}`;

  const paperDimensions =
    options.paperSize === "a4"
      ? "\\pdfpagewidth=210mm \\pdfpageheight=297mm \\input{main.tex}"
      : "\\pdfpagewidth=8.5in \\pdfpageheight=11in \\input{main.tex}";

  const dockerArgs = [
    "run",
    "--name",
    containerName,
    "--rm",
    "--net=none",
    "--cpus=1.5",
    "-m",
    "512m",
    "--pids-limit=64",
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=100m",
    "-v",
    `${absoluteTempDir}:/workspace:rw`,
    "--user",
    "1000:1000",
    DOCKER_IMAGE_NAME,
    "-interaction=nonstopmode",
    "-halt-on-error",
    "-file-line-error",
    "-jobname=main",
    paperDimensions,
  ];

  try {
    // Pass 1
    await runDockerCommand(dockerArgs, DOCKER_TIMEOUT_MS, containerName);

    // Pass 2 if double pass enabled
    if (options.passes === 2) {
      await runDockerCommand(dockerArgs, DOCKER_TIMEOUT_MS, containerName);
    }

    const pdfPath = path.join(absoluteTempDir, "main.pdf");
    const pdfBuffer = await fs.readFile(pdfPath);

    return {
      success: true,
      pdfBuffer,
    };
  } catch (err: unknown) {
    const errorObj = err as { stdout?: string; stderr?: string; message?: string };
    const details =
      errorObj?.stdout ||
      errorObj?.stderr ||
      errorObj?.message ||
      "LaTeX compilation failed inside Docker container.";

    return {
      success: false,
      error: "Compilation failed.",
      details,
    };
  } finally {
    // Force cleanup container if still hanging
    try {
      await execFileAsync("docker", ["rm", "-f", containerName], {
        timeout: 3000,
        env: getDockerEnv(),
      });
    } catch {
      // Ignore cleanup error if container already exited & auto-removed via --rm
    }
  }
}

/**
 * Executes a docker command with explicit timeout and forced termination on hung container.
 */
async function runDockerCommand(
  args: string[],
  timeoutMs: number,
  containerName: string
): Promise<{ stdout: string; stderr: string }> {
  const dockerEnv = getDockerEnv();

  return new Promise((resolve, reject) => {
    let processKilled = false;

    const child = execFile(
      "docker",
      args,
      { timeout: timeoutMs, env: dockerEnv },
      (error, stdout, stderr) => {
        if (error) {
          if (processKilled || error.killed) {
            reject({
              message: `Compilation timed out after ${timeoutMs / 1000} seconds. Container terminated.`,
              stdout,
              stderr,
            });
          } else {
            reject({
              message: error.message,
              stdout,
              stderr,
            });
          }
        } else {
          resolve({ stdout, stderr });
        }
      }
    );

    // Safety timeout timer
    const timer = setTimeout(() => {
      processKilled = true;
      execFileAsync("docker", ["kill", containerName], { env: dockerEnv }).catch(() => {});
      child.kill("SIGKILL");
    }, timeoutMs);

    child.on("exit", () => clearTimeout(timer));
  });
}
