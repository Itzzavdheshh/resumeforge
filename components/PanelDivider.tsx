"use client";

import { useRef, useEffect, useCallback } from "react";

interface PanelDividerProps {
  /** Called during drag with delta px (positive = moved right) */
  onDrag: (deltaPx: number) => void;
  /** Accessible label, e.g. "Resize file panel" */
  ariaLabel: string;
  /** Keyboard arrow nudge amount in px (default 16) */
  keyboardStep?: number;
  id?: string;
}

/**
 * PanelDivider
 *
 * A thin, draggable vertical divider between two panels.
 * Drag logic uses document-level pointermove so it never conflicts
 * with Monaco text selection or FileTree clicks.
 * Keyboard: focus the divider and press ← / → to nudge.
 */
export default function PanelDivider({
  onDrag,
  ariaLabel,
  keyboardStep = 16,
  id,
}: PanelDividerProps) {
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const dividerRef = useRef<HTMLDivElement | null>(null);

  const stopDrag = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.body.removeAttribute("data-resizing");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const delta = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      if (delta !== 0) onDrag(delta);
    },
    [onDrag]
  );

  const onPointerUp = useCallback(() => {
    stopDrag();
  }, [stopDrag]);

  // Attach/detach document-level listeners during drag
  useEffect(() => {
    document.addEventListener("pointermove", onPointerMove, { capture: true });
    document.addEventListener("pointerup", onPointerUp, { capture: true });
    document.addEventListener("pointercancel", onPointerUp, { capture: true });
    return () => {
      document.removeEventListener("pointermove", onPointerMove, { capture: true });
      document.removeEventListener("pointerup", onPointerUp, { capture: true });
      document.removeEventListener("pointercancel", onPointerUp, { capture: true });
      // Ensure cleanup if component unmounts mid-drag
      document.body.removeAttribute("data-resizing");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [onPointerMove, onPointerUp]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
    document.body.setAttribute("data-resizing", "true");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onDrag(-keyboardStep);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onDrag(keyboardStep);
      }
    },
    [onDrag, keyboardStep]
  );

  return (
    <div
      ref={dividerRef}
      id={id}
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className={[
        // Hit zone: 8px wide for easy grabbing
        "relative flex-none w-2 cursor-col-resize shrink-0 select-none",
        "group outline-none",
        // Focus ring for keyboard users
        "focus-visible:ring-1 focus-visible:ring-blue-500/60",
      ].join(" ")}
      title="Drag to resize panels"
    >
      {/* Visual stripe: 1px centered in 8px hit zone */}
      <div
        className={[
          "absolute inset-y-0 left-[3px] w-px",
          "bg-zinc-800/80",
          "transition-colors duration-150",
          "group-hover:bg-zinc-600 group-focus-visible:bg-blue-500/60",
        ].join(" ")}
      />
    </div>
  );
}
