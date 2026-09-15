"use client";

import { useEffect, useRef } from "react";
import { GitHubConnectionStatus } from "@/lib/github";

interface GitHubModalProps {
  status: GitHubConnectionStatus;
  onClose: () => void;
  onLogout: () => void;
}

export default function GitHubModal({
  status,
  onClose,
  onLogout,
}: GitHubModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);

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

  const handleConnect = () => {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/github/login";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="GitHub Account Connection"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-white font-bold">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                GitHub Integration
              </h2>
              <p className="text-xs text-zinc-400">
                Optional account connection for repository sync & Gists.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label="Close modal"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {status.connected && status.user ? (
            /* Connected State */
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={status.user.avatar_url}
                  alt={status.user.login}
                  className="h-12 w-12 rounded-full border border-zinc-700 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate">
                      {status.user.name || status.user.login}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-800/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Connected
                    </span>
                  </div>
                  <a
                    href={status.user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-400 hover:text-blue-400 font-mono transition-colors block truncate"
                  >
                    @{status.user.login} ↗
                  </a>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 leading-relaxed">
                Your GitHub account is safely authorized. Future updates will allow exporting and syncing your resume projects directly to GitHub repositories.
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={onLogout}
                  className="rounded-lg border border-red-900/60 bg-red-950/30 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/50 hover:text-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Disconnect GitHub
                </button>
              </div>
            </div>
          ) : (
            /* Disconnected State */
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="text-sm font-semibold text-zinc-200">
                Connect your GitHub Account
              </h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Authorize ResumeForge with your GitHub account. Connecting GitHub allows future repository synchronization, version backups, and Gist exports.
              </p>

              <div className="mt-3 rounded-lg bg-zinc-950 p-3 border border-zinc-800/80 text-[11px] text-zinc-400 font-mono leading-normal">
                🔒 <strong className="text-zinc-300">Security Note:</strong> ResumeForge uses OAuth 2.0 with HTTP-only cookie storage. Tokens are never saved in browser localStorage or exposed to client JavaScript.
              </div>

              {!status.configured && (
                <div className="mt-3 rounded-lg border border-amber-900/60 bg-amber-950/30 p-3 text-xs text-amber-300">
                  ⚠️ <strong className="font-semibold">OAuth Configuration Needed:</strong> To enable GitHub connection locally, copy <code className="font-mono text-[11px] bg-amber-900/40 px-1 py-0.5 rounded">.env.example</code> to <code className="font-mono text-[11px] bg-amber-900/40 px-1 py-0.5 rounded">.env.local</code> and set your <code className="font-mono text-[11px]">GITHUB_CLIENT_ID</code>.
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={!status.configured}
                  className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>Connect GitHub</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
