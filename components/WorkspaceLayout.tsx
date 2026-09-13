"use client";

import { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import PanelDivider from "@/components/PanelDivider";
import {
  loadLayout,
  saveLayout,
  LayoutState,
  MIN_LEFT,
  MAX_LEFT,
  MIN_RIGHT,
  MAX_RIGHT_FRACTION,
} from "@/lib/layoutStorage";

// Width of the narrow "tab" shown when a panel is collapsed (px)
const COLLAPSED_STRIP_WIDTH = 32;

interface WorkspaceLayoutProps {
  /** Content for the left (file tree) panel */
  leftPanel: ReactNode;
  /** Content for the center (editor) panel */
  centerPanel: ReactNode;
  /** Content for the right (PDF preview) panel */
  rightPanel: ReactNode;
}

/**
 * WorkspaceLayout
 *
 * Manages the three-panel IDE layout:
 *   [Left | Divider | Center | Divider | Right]
 *
 * - Left and Right panels are resizable via drag handles.
 * - Both panels can be collapsed to a narrow 32px strip with a restore button.
 * - Panel widths and collapsed state persist in localStorage.
 */
export default function WorkspaceLayout({
  leftPanel,
  centerPanel,
  rightPanel,
}: WorkspaceLayoutProps) {
  const [layout, setLayout] = useState<LayoutState>(() => {
    // loadLayout() is safe to call here — lazy init only runs on client.
    // On SSR, typeof window === 'undefined' causes loadLayout() to return defaults.
    return loadLayout();
  });

  // Stores pre-collapse widths so we can restore them
  const preCollapseLeftRef = useRef<number>(layout.leftWidth);
  const preCollapseRightRef = useRef<number>(layout.rightWidth);

  // Debounce persistence timer
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sync collapse refs after mount (no setState — avoids ESLint violation) ───
  useEffect(() => {
    preCollapseLeftRef.current = layout.leftWidth;
    preCollapseRightRef.current = layout.rightWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once — initial ref sync only

  // ── Persist on every layout change (debounced 200ms) ────────────────────────
  const persistLayout = useCallback((next: LayoutState) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveLayout(next), 200);
  }, []);

  // ── Width constraint helper ──────────────────────────────────────────────────
  const maxRight = useCallback(
    () => Math.floor((typeof window !== "undefined" ? window.innerWidth : 1280) * MAX_RIGHT_FRACTION),
    []
  );

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  // ── Left panel drag ──────────────────────────────────────────────────────────
  const handleLeftDrag = useCallback(
    (deltaPx: number) => {
      setLayout((prev) => {
        const next: LayoutState = {
          ...prev,
          leftWidth: clamp(prev.leftWidth + deltaPx, MIN_LEFT, MAX_LEFT),
        };
        persistLayout(next);
        return next;
      });
    },
    [persistLayout]
  );

  // ── Right panel drag ─────────────────────────────────────────────────────────
  const handleRightDrag = useCallback(
    (deltaPx: number) => {
      setLayout((prev) => {
        const next: LayoutState = {
          ...prev,
          // Right divider: dragging right grows right panel (negate delta)
          rightWidth: clamp(prev.rightWidth - deltaPx, MIN_RIGHT, maxRight()),
        };
        persistLayout(next);
        return next;
      });
    },
    [persistLayout, maxRight]
  );

  // ── Collapse / restore left ──────────────────────────────────────────────────
  const toggleLeftCollapse = useCallback(() => {
    setLayout((prev) => {
      if (!prev.leftCollapsed) {
        // Collapsing: save current width for restore
        preCollapseLeftRef.current = prev.leftWidth;
      }
      const next: LayoutState = {
        ...prev,
        leftCollapsed: !prev.leftCollapsed,
        leftWidth: prev.leftCollapsed
          ? preCollapseLeftRef.current // restore
          : prev.leftWidth,
      };
      persistLayout(next);
      return next;
    });
  }, [persistLayout]);

  // ── Collapse / restore right ─────────────────────────────────────────────────
  const toggleRightCollapse = useCallback(() => {
    setLayout((prev) => {
      if (!prev.rightCollapsed) {
        preCollapseRightRef.current = prev.rightWidth;
      }
      const next: LayoutState = {
        ...prev,
        rightCollapsed: !prev.rightCollapsed,
        rightWidth: prev.rightCollapsed
          ? preCollapseRightRef.current // restore
          : prev.rightWidth,
      };
      persistLayout(next);
      return next;
    });
  }, [persistLayout]);

  // ── Cleanup timer on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────────

  // Panel widths: use layout state directly (lazy init handles SSR defaults)
  const leftW = layout.leftCollapsed ? COLLAPSED_STRIP_WIDTH : layout.leftWidth;
  const rightW = layout.rightCollapsed ? COLLAPSED_STRIP_WIDTH : layout.rightWidth;

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden relative">
      {/* ── LEFT PANEL ────────────────────────────────────────────────────── */}
      <div
        style={{ width: leftW, minWidth: leftW, maxWidth: leftW }}
        className="flex flex-col h-full overflow-hidden shrink-0 relative transition-none"
      >
        {layout.leftCollapsed ? (
          /* Collapsed strip */
          <div className="flex flex-col h-full w-full items-center pt-2 gap-1 bg-zinc-950 border-r border-zinc-800/80">
            <button
              onClick={toggleLeftCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              aria-label="Restore file panel"
              aria-expanded={false}
              title="Restore file panel"
            >
              <ChevronRight />
            </button>
            {/* Rotated "FILES" label for collapsed state */}
            <div
              className="mt-3 text-[9px] font-bold uppercase tracking-widest text-zinc-600 select-none"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Files
            </div>
          </div>
        ) : (
          /* Expanded — render left panel content with collapse button injected */
          <LeftPanelWrapper onCollapse={toggleLeftCollapse}>
            {leftPanel}
          </LeftPanelWrapper>
        )}
      </div>

      {/* ── LEFT DIVIDER ──────────────────────────────────────────────────── */}
      {!layout.leftCollapsed && (
        <PanelDivider
          onDrag={handleLeftDrag}
          ariaLabel="Resize file panel. Use left and right arrow keys to adjust."
          id="left-panel-divider"
        />
      )}

      {/* ── CENTER PANEL (Editor) — fills remaining space ─────────────────── */}
      <div className="flex flex-1 min-w-0 h-full overflow-hidden">
        {centerPanel}
      </div>

      {/* ── RIGHT DIVIDER ─────────────────────────────────────────────────── */}
      {!layout.rightCollapsed && (
        <PanelDivider
          onDrag={handleRightDrag}
          ariaLabel="Resize PDF preview panel. Use left and right arrow keys to adjust."
          id="right-panel-divider"
        />
      )}

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
      <div
        style={{ width: rightW, minWidth: rightW, maxWidth: rightW }}
        className="flex flex-col h-full overflow-hidden shrink-0 relative transition-none"
      >
        {layout.rightCollapsed ? (
          /* Collapsed strip */
          <div className="flex flex-col h-full w-full items-center pt-2 gap-1 bg-zinc-950 border-l border-zinc-800/80">
            <button
              onClick={toggleRightCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              aria-label="Restore PDF preview panel"
              aria-expanded={false}
              title="Restore PDF preview panel"
            >
              <ChevronLeft />
            </button>
            <div
              className="mt-3 text-[9px] font-bold uppercase tracking-widest text-zinc-600 select-none"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Preview
            </div>
          </div>
        ) : (
          /* Expanded — render right panel content with collapse button injected */
          <RightPanelWrapper onCollapse={toggleRightCollapse}>
            {rightPanel}
          </RightPanelWrapper>
        )}
      </div>
    </div>
  );
}

// ── Wrappers that inject collapse buttons into panel header areas ────────────

/**
 * LeftPanelWrapper — injects a collapse toggle (chevron left) into the panel.
 * Renders the FileTree children with an additional collapse button overlaid.
 */
function LeftPanelWrapper({
  children,
  onCollapse,
}: {
  children: ReactNode;
  onCollapse: () => void;
}) {
  return (
    <div className="relative flex flex-col h-full w-full">
      {children}
      {/* Collapse button — absolute in top-right corner of the left panel */}
      <button
        onClick={onCollapse}
        className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
        aria-label="Collapse file panel"
        aria-expanded={true}
        title="Collapse file panel"
      >
        <ChevronLeft />
      </button>
    </div>
  );
}

/**
 * RightPanelWrapper — injects a collapse toggle (chevron right) into the panel.
 */
function RightPanelWrapper({
  children,
  onCollapse,
}: {
  children: ReactNode;
  onCollapse: () => void;
}) {
  return (
    <div className="relative flex flex-col h-full w-full">
      {children}
      {/* Collapse button — absolute in top-left corner of the right panel */}
      <button
        onClick={onCollapse}
        className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
        aria-label="Collapse PDF preview panel"
        aria-expanded={true}
        title="Collapse PDF preview panel"
      >
        <ChevronRight />
      </button>
    </div>
  );
}

// ── Minimal inline SVG icon components ─────────────────────────────────────

function ChevronLeft() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.5 2L3.5 6L7.5 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 2L8.5 6L4.5 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
