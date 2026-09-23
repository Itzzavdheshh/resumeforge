"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  GitHubConnectionStatus,
  GitHubRepo,
  fetchGitHubRepos,
  createGitHubRepo,
  inspectGitHubRepo,
  exportProjectToGitHub,
  pullAndCompareGitHubRepo,
  ExportResult,
  RepoPullResult,
  FileChangeStatus,
} from "@/lib/github";
import { ResumeProject, ProjectGitHubMetadata } from "@/lib/storage";

interface GitHubModalProps {
  status: GitHubConnectionStatus;
  activeProject?: ResumeProject | null;
  onClose: () => void;
  onLogout: () => void;
  onProjectMetadataUpdated?: (metadata: ProjectGitHubMetadata) => void;
  initialTab?: "account" | "repos" | "export" | "pull";
}

export default function GitHubModal({
  status,
  activeProject,
  onClose,
  onLogout,
  onProjectMetadataUpdated,
  initialTab = "export",
}: GitHubModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<"account" | "repos" | "export" | "pull">(
    status.connected ? initialTab : "account"
  );

  // Repositories State
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState<boolean>(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create Repository Form State
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newRepoName, setNewRepoName] = useState<string>("");
  const [newRepoDesc, setNewRepoDesc] = useState<string>("");
  const [newRepoPrivate, setNewRepoPrivate] = useState<boolean>(true);
  const [creatingRepo, setCreatingRepo] = useState<boolean>(false);
  const [createRepoError, setCreateRepoError] = useState<string | null>(null);

  // Export State
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [commitMessage, setCommitMessage] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [overwriteConfirmed, setOverwriteConfirmed] = useState<boolean>(false);
  const [existingFilesWarning, setExistingFilesWarning] = useState<string[]>([]);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);

  // Pull / Compare State
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [pullResult, setPullResult] = useState<RepoPullResult | null>(null);
  const [pullError, setPullError] = useState<string | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Set default commit message when activeProject name changes
  useEffect(() => {
    if (activeProject?.name) {
      queueMicrotask(() => {
        setCommitMessage((prev) => prev || `chore(resumeforge): export ${activeProject.name}`);
      });
    }
  }, [activeProject?.name]);

  const githubOwner = activeProject?.github?.owner;
  const githubRepo = activeProject?.github?.repo;

  // Load repositories on tab switch or connection
  const loadRepos = useCallback(async () => {
    if (!status.connected) return;
    setLoadingRepos(true);
    setRepoError(null);
    const res = await fetchGitHubRepos();
    if (res.error) {
      setRepoError(res.error);
    } else {
      setRepos(res.repos);
      // Auto-select linked repo if existing
      setSelectedRepo((prev) => {
        if (githubOwner && githubRepo) {
          const linked = res.repos.find(
            (r) => r.owner.login === githubOwner && r.name === githubRepo
          );
          if (linked) return linked;
        }
        return prev || (res.repos.length > 0 ? res.repos[0] : null);
      });
    }
    setLoadingRepos(false);
  }, [status.connected, githubOwner, githubRepo]);

  useEffect(() => {
    if (status.connected && (activeTab === "repos" || activeTab === "export" || activeTab === "pull")) {
      queueMicrotask(() => {
        loadRepos();
      });
    }
  }, [status.connected, activeTab, loadRepos]);

  // Inspect repository when selected repo changes
  const selectedRepoOwner = selectedRepo?.owner?.login;
  const selectedRepoName = selectedRepo?.name;
  const selectedRepoBranch = selectedRepo?.default_branch;
  const activeProjectId = activeProject?.id;
  const activeProjectFilePaths = activeProject?.files ? activeProject.files.map((f) => f.path).join(",") : "";

  useEffect(() => {
    let isMounted = true;
    async function checkRepo() {
      if (!selectedRepoOwner || !selectedRepoName) return;
      setIsInspecting(true);
      setExistingFilesWarning([]);
      const inspect = await inspectGitHubRepo(
        selectedRepoOwner,
        selectedRepoName,
        selectedRepoBranch || "main"
      );
      if (isMounted) {
        setIsInspecting(false);
        if (inspect.exists && inspect.existingFiles.length > 0 && activeProjectFilePaths) {
          const projectPaths = activeProjectFilePaths.split(",");
          const overlaps = inspect.existingFiles.filter((p) => projectPaths.includes(p));
          setExistingFilesWarning(overlaps);
        }
      }
    }
    checkRepo();
    return () => {
      isMounted = false;
    };
  }, [selectedRepoOwner, selectedRepoName, selectedRepoBranch, activeProjectId, activeProjectFilePaths]);

  const handleConnect = () => {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/github/login";
  };

  const handleCreateRepoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;
    setCreatingRepo(true);
    setCreateRepoError(null);

    const res = await createGitHubRepo(newRepoName.trim(), newRepoDesc.trim(), newRepoPrivate);
    setCreatingRepo(false);

    if (res.error || !res.repo) {
      setCreateRepoError(res.error || "Failed to create repository");
    } else {
      setRepos((prev) => [res.repo!, ...prev]);
      setSelectedRepo(res.repo);
      setShowCreateForm(false);
      setNewRepoName("");
      setNewRepoDesc("");
      setActiveTab("export");
    }
  };

  const handleExportSubmit = async () => {
    if (!activeProject || !selectedRepo) return;

    setIsExporting(true);
    setExportResult(null);

    const res = await exportProjectToGitHub({
      project: {
        id: activeProject.id,
        name: activeProject.name,
        files: activeProject.files.map((f) => ({
          path: f.path,
          content: f.content,
          type: f.type,
        })),
      },
      owner: selectedRepo.owner.login,
      repo: selectedRepo.name,
      branch: selectedRepo.default_branch || "main",
      commitMessage: commitMessage.trim() || `chore(resumeforge): export ${activeProject.name}`,
      overwriteConfirmed,
    });

    setIsExporting(false);
    setExportResult(res);

    if (res.success && res.github) {
      if (onProjectMetadataUpdated) {
        onProjectMetadataUpdated(res.github);
      }
    } else if (res.requiresOverwriteConfirmation) {
      setExistingFilesWarning(res.existingFiles || []);
    }
  };

  const handlePullCompareSubmit = async () => {
    if (!activeProject || !selectedRepo) return;
    setIsPulling(true);
    setPullError(null);
    setPullResult(null);

    const res = await pullAndCompareGitHubRepo({
      project: {
        id: activeProject.id,
        name: activeProject.name,
        files: activeProject.files.map((f) => ({
          path: f.path,
          content: f.content,
          type: f.type as "tex" | "image" | "asset",
        })),
      },
      owner: selectedRepo.owner.login,
      repo: selectedRepo.name,
      branch: selectedRepo.default_branch || "main",
      lastExportedSha: activeProject.github?.lastExportedSha,
    });

    setIsPulling(false);
    setPullResult(res);
    if (res.error) setPullError(res.error);
  };

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: FileChangeStatus) => {
    switch (status) {
      case "UNCHANGED":
        return <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-800/80">UNCHANGED</span>;
      case "LOCAL_ONLY":
        return <span className="rounded bg-blue-950 px-1.5 py-0.5 text-[10px] font-mono text-blue-400 border border-blue-800/80">LOCAL ONLY</span>;
      case "REMOTE_ONLY":
        return <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-800/80">REMOTE ONLY</span>;
      case "MODIFIED_LOCAL":
        return <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[10px] font-mono text-indigo-400 border border-indigo-800/80">LOCAL MODIFIED</span>;
      case "MODIFIED_REMOTE":
        return <span className="rounded bg-purple-950 px-1.5 py-0.5 text-[10px] font-mono text-purple-400 border border-purple-800/80">REMOTE MODIFIED</span>;
      case "CONFLICT":
        return <span className="rounded bg-red-950 px-1.5 py-0.5 text-[10px] font-mono text-red-400 border border-red-800/80">CONFLICT</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="GitHub Workspace Integration"
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-zinc-100"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold shadow-inner">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                GitHub Repository Workspace
              </h2>
              <p className="text-xs text-zinc-400">
                Export, inspect, and link your ResumeForge projects to GitHub.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500"
            aria-label="Close modal"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation (Connected Only) */}
        {status.connected && status.user && (
          <div className="flex border-b border-zinc-800 mt-3 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("export")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "export"
                  ? "border-emerald-500 text-emerald-400 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🚀 Export Project
            </button>
            <button
              onClick={() => setActiveTab("pull")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "pull"
                  ? "border-emerald-500 text-emerald-400 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🔍 Check Remote
            </button>
            <button
              onClick={() => setActiveTab("repos")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "repos"
                  ? "border-emerald-500 text-emerald-400 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              📁 Repositories ({repos.length})
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "account"
                  ? "border-emerald-500 text-emerald-400 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              👤 Account
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="mt-4 space-y-4">
          {!status.connected ? (
            /* Disconnected View */
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-200">
                Connect your GitHub Account
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect GitHub to list repositories, create new repositories, and export your multi-file LaTeX resume projects directly to GitHub with clean Git commits.
              </p>

              <div className="rounded-lg bg-zinc-950 p-3.5 border border-zinc-800/80 text-[11px] text-zinc-400 font-mono leading-relaxed space-y-1">
                <div className="text-zinc-300 font-semibold flex items-center gap-1.5">
                  <span>🔒</span> Security & Privacy Controls:
                </div>
                <div>• Minimum required OAuth permission (<code className="text-emerald-400">repo</code> scope)</div>
                <div>• HTTP-only cookie storage (tokens never stored in localStorage)</div>
                <div>• ResumeForge remains 100% usable local-first offline</div>
              </div>

              {!status.configured && (
                <div className="rounded-lg border border-amber-900/60 bg-amber-950/30 p-3 text-xs text-amber-300">
                  ⚠️ <strong className="font-semibold">OAuth Configuration Needed:</strong> Set your <code className="font-mono text-[11px] bg-amber-900/40 px-1 py-0.5 rounded">GITHUB_CLIENT_ID</code> in <code className="font-mono text-[11px]">.env.local</code>.
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={!status.configured}
                  className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center gap-2"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>Authorize GitHub</span>
                </button>
              </div>
            </div>
          ) : activeTab === "account" ? (
            /* Account View */
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
              <div className="flex items-center gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={status.user?.avatar_url}
                  alt={status.user?.login}
                  className="h-14 w-14 rounded-full border border-zinc-700 object-cover shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white truncate">
                      {status.user?.name || status.user?.login}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/90 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-800/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </span>
                  </div>
                  <a
                    href={status.user?.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-400 hover:text-blue-400 font-mono transition-colors block truncate mt-0.5"
                  >
                    @{status.user?.login} ↗
                  </a>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-400 leading-relaxed space-y-2">
                <div>
                  <strong>Granted Permissions:</strong> Repository access (<code className="font-mono text-emerald-400">repo</code> scope) for creating repos & committing project files.
                </div>
                <div>
                  <strong>Session Security:</strong> Protected by HTTP-only cookie with 30-day expiration.
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => setActiveTab("export")}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
                >
                  Proceed to Export →
                </button>
                <button
                  onClick={onLogout}
                  className="rounded-lg border border-red-900/60 bg-red-950/30 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/50 hover:text-red-200 transition-colors"
                >
                  Disconnect GitHub
                </button>
              </div>
            </div>
          ) : activeTab === "repos" ? (
            /* Repositories View */
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="Filter repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors flex items-center gap-1"
                >
                  {showCreateForm ? "Cancel" : "＋ New Repo"}
                </button>
              </div>

              {/* Create Repo Form */}
              {showCreateForm && (
                <form onSubmit={handleCreateRepoSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-200">Create New GitHub Repository</h4>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Repository Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. my-resume"
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      placeholder="LaTeX Resume built with ResumeForge"
                      value={newRepoDesc}
                      onChange={(e) => setNewRepoDesc(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newRepoPrivate"
                      checked={newRepoPrivate}
                      onChange={(e) => setNewRepoPrivate(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label htmlFor="newRepoPrivate" className="text-xs text-zinc-300">
                      Private Repository (Recommended)
                    </label>
                  </div>

                  {createRepoError && (
                    <div className="text-[11px] text-red-400 border border-red-900/60 bg-red-950/30 p-2 rounded-lg">
                      {createRepoError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingRepo || !newRepoName.trim()}
                      className="rounded-lg bg-emerald-600 px-3.5 py-1 text-xs font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                    >
                      {creatingRepo ? "Creating..." : "Create & Select"}
                    </button>
                  </div>
                </form>
              )}

              {/* Repo List */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {loadingRepos ? (
                  <div className="py-8 text-center text-xs text-zinc-500">Loading repositories...</div>
                ) : repoError ? (
                  <div className="p-3 text-xs text-red-400 border border-red-900/50 rounded-lg bg-red-950/20">{repoError}</div>
                ) : filteredRepos.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">No repositories found.</div>
                ) : (
                  filteredRepos.map((r) => {
                    const isSelected = selectedRepo?.name === r.name && selectedRepo?.owner.login === r.owner.login;
                    return (
                      <div
                        key={r.full_name}
                        onClick={() => setSelectedRepo(r)}
                        className={`rounded-xl border p-3 flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "border-emerald-500/80 bg-emerald-950/20 shadow-sm"
                            : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700"
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white truncate font-mono">{r.name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                r.private
                                  ? "border-zinc-700 bg-zinc-900 text-zinc-400"
                                  : "border-blue-900/60 bg-blue-950/40 text-blue-400"
                              }`}
                            >
                              {r.private ? "Private" : "Public"}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                            {r.owner.login}/{r.name} • branch: {r.default_branch}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRepo(r);
                            setActiveTab("export");
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                          }`}
                        >
                          {isSelected ? "Selected ✓" : "Select"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : activeTab === "pull" ? (
            /* Check Remote Tab (Prompt 16 - Read Only) */
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-900/60 bg-blue-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Remote Change Detection</span>
                    <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] font-mono text-blue-300 border border-blue-800/80">
                      🔒 Read-Only Inspection
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Inspect how files in your linked GitHub repository differ from your active local project. Local files will not be modified.
                </p>
              </div>

              {/* Target Repo Banner */}
              {selectedRepo ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-mono block">Comparing Against Repository:</span>
                    <span className="text-xs font-semibold text-emerald-400 font-mono">{selectedRepo.full_name} ({selectedRepo.default_branch})</span>
                  </div>
                  <button
                    onClick={handlePullCompareSubmit}
                    disabled={isPulling}
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isPulling ? (
                      <>
                        <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Inspecting...</span>
                      </>
                    ) : (
                      <span>Check Remote Changes 🔄</span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 text-center">
                  <p className="text-xs text-zinc-400 mb-2">Select a target repository first.</p>
                  <button
                    onClick={() => setActiveTab("repos")}
                    className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700"
                  >
                    Select Repository
                  </button>
                </div>
              )}

              {/* Error Display */}
              {pullError && (
                <div className="rounded-xl border border-red-900 bg-red-950/30 p-3 text-xs text-red-300">
                  <strong>Inspection Error:</strong> {pullError}
                </div>
              )}

              {/* Comparison Results */}
              {pullResult && pullResult.success && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {/* Count Badges */}
                  <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                    <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-2 text-center">
                      <span className="text-emerald-400 font-bold block">{pullResult.counts.unchanged}</span>
                      <span className="text-zinc-400">Unchanged</span>
                    </div>
                    <div className="rounded-lg border border-blue-900/60 bg-blue-950/20 p-2 text-center">
                      <span className="text-blue-400 font-bold block">{pullResult.counts.localOnly}</span>
                      <span className="text-zinc-400">Local Only</span>
                    </div>
                    <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 p-2 text-center">
                      <span className="text-amber-400 font-bold block">{pullResult.counts.remoteOnly}</span>
                      <span className="text-zinc-400">Remote Only</span>
                    </div>
                    <div className="rounded-lg border border-indigo-900/60 bg-indigo-950/20 p-2 text-center">
                      <span className="text-indigo-400 font-bold block">{pullResult.counts.modifiedLocal}</span>
                      <span className="text-zinc-400">Local Modified</span>
                    </div>
                    <div className="rounded-lg border border-purple-900/60 bg-purple-950/20 p-2 text-center">
                      <span className="text-purple-400 font-bold block">{pullResult.counts.modifiedRemote}</span>
                      <span className="text-zinc-400">Remote Modified</span>
                    </div>
                    <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-2 text-center">
                      <span className="text-red-400 font-bold block">{pullResult.counts.conflict}</span>
                      <span className="text-zinc-400">Conflicts</span>
                    </div>
                  </div>

                  {/* Grouped File List */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono border-b border-zinc-900 pb-1.5">
                      <span>FILE DIFFERENCES ({pullResult.fileSummaries.length} total)</span>
                      <span>Commit: {pullResult.latestCommitSha?.substring(0, 7)}</span>
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                      {pullResult.fileSummaries.map((f) => (
                        <div
                          key={f.path}
                          className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-2.5 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-white truncate font-semibold">
                              📄 {f.path}
                            </span>
                            {getStatusBadge(f.status)}
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-tight">
                            {f.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Export View */
            <div className="space-y-4">
              {/* Target Project Info */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 block font-mono">Project to Export:</span>
                  <span className="text-sm font-semibold text-white">{activeProject?.name || "Untitled Resume"}</span>
                  <span className="text-xs text-zinc-400 block font-mono">({activeProject?.files.length || 0} files)</span>
                </div>
                {activeProject?.github && (
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-1 rounded-md">
                    Linked: {activeProject.github.owner}/{activeProject.github.repo}
                  </span>
                )}
              </div>

              {/* Target Repository Picker / Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Target GitHub Repository *</label>
                {selectedRepo ? (
                  <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-400 font-mono">{selectedRepo.full_name}</span>
                        <span className="text-[10px] font-mono text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
                          {selectedRepo.default_branch}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("repos")}
                      className="text-xs text-zinc-400 hover:text-white underline font-mono"
                    >
                      Change Repo
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 text-center">
                    <p className="text-xs text-zinc-400 mb-2">No repository selected yet.</p>
                    <button
                      onClick={() => setActiveTab("repos")}
                      className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700"
                    >
                      Select or Create Repository
                    </button>
                  </div>
                )}
              </div>

              {/* Commit Message Input */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-300">Git Commit Message</label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="chore(resumeforge): export project"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              {/* File Preview */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-3 space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Files Included in Export:</span>
                <div className="max-h-28 overflow-y-auto space-y-1 text-xs font-mono text-zinc-300">
                  {activeProject?.files.map((f) => (
                    <div key={f.id} className="flex items-center justify-between text-[11px] border-b border-zinc-900/60 pb-1">
                      <span className="truncate">📄 {f.path}</span>
                      <span className="text-zinc-500 text-[10px]">
                        {f.type === "image" ? "binary (base64 decoded)" : `${f.content.length} chars`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overwrite Warning Box */}
              {existingFilesWarning.length > 0 && (
                <div className="rounded-xl border border-amber-900/80 bg-amber-950/30 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                    <span>⚠️</span>
                    <span>Existing Files Warning ({existingFilesWarning.length} overlapping files)</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-normal">
                    The target repository already contains files with matching paths (<code className="font-mono">{existingFilesWarning.join(", ")}</code>). Exporting will create a commit updating these files.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="overwriteConfirmed"
                      checked={overwriteConfirmed}
                      onChange={(e) => setOverwriteConfirmed(e.target.checked)}
                      className="rounded border-amber-800 bg-amber-950 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="overwriteConfirmed" className="text-xs font-medium text-amber-200 cursor-pointer">
                      I confirm and authorize overwriting existing repository files
                    </label>
                  </div>
                </div>
              )}

              {/* Export Result Display */}
              {exportResult && (
                <div
                  className={`rounded-xl border p-3.5 text-xs space-y-2 ${
                    exportResult.success
                      ? "border-emerald-800 bg-emerald-950/30 text-emerald-200"
                      : "border-red-900 bg-red-950/30 text-red-200"
                  }`}
                >
                  {exportResult.success ? (
                    <>
                      <div className="flex items-center gap-2 font-semibold text-emerald-400">
                        <span>✓</span>
                        <span>Successfully exported to GitHub!</span>
                      </div>
                      <div className="font-mono text-[11px] space-y-1">
                        <div>Commit SHA: <code className="bg-emerald-900/50 px-1 py-0.5 rounded">{exportResult.commitSha?.substring(0, 7)}</code></div>
                        <div>Files Uploaded: {exportResult.fileCount}</div>
                        {exportResult.commitUrl && (
                          <a
                            href={exportResult.commitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-1 text-emerald-400 underline hover:text-emerald-300 font-semibold"
                          >
                            View Commit on GitHub ↗
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <div>
                      <strong>Export Error:</strong> {exportResult.error}
                    </div>
                  )}
                </div>
              )}

              {/* Export Action Button */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  {exportResult?.success ? "Close" : "Cancel"}
                </button>

                <button
                  onClick={handleExportSubmit}
                  disabled={
                    isExporting ||
                    isInspecting ||
                    !selectedRepo ||
                    !activeProject ||
                    (existingFilesWarning.length > 0 && !overwriteConfirmed)
                  }
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Creating Git Commit...</span>
                    </>
                  ) : isInspecting ? (
                    <span>Inspecting Repo...</span>
                  ) : (
                    <span>Export to GitHub →</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
