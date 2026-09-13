/**
 * layoutStorage.ts
 *
 * Persists workspace panel layout state (widths, collapsed state) independently
 * from project data. Uses a dedicated localStorage key so layout state never
 * pollutes the resume project schema.
 */

const LAYOUT_KEY = "resumeforge:layout";

export interface LayoutState {
  leftWidth: number; // px — FileTree panel width
  rightWidth: number; // px — PDF Preview panel width
  leftCollapsed: boolean;
  rightCollapsed: boolean;
}

const DEFAULTS: LayoutState = {
  leftWidth: 224,
  rightWidth: 480,
  leftCollapsed: false,
  rightCollapsed: false,
};

const MIN_LEFT = 160;
const MAX_LEFT = 400;
const MIN_RIGHT = 280;
const MAX_RIGHT_FRACTION = 0.65; // max 65% of window width

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function loadLayout(): LayoutState {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<LayoutState>;
    const maxRight = Math.floor(window.innerWidth * MAX_RIGHT_FRACTION);
    return {
      leftWidth: clamp(
        typeof parsed.leftWidth === "number" ? parsed.leftWidth : DEFAULTS.leftWidth,
        MIN_LEFT,
        MAX_LEFT
      ),
      rightWidth: clamp(
        typeof parsed.rightWidth === "number" ? parsed.rightWidth : DEFAULTS.rightWidth,
        MIN_RIGHT,
        maxRight
      ),
      leftCollapsed: typeof parsed.leftCollapsed === "boolean" ? parsed.leftCollapsed : DEFAULTS.leftCollapsed,
      rightCollapsed: typeof parsed.rightCollapsed === "boolean" ? parsed.rightCollapsed : DEFAULTS.rightCollapsed,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveLayout(state: LayoutState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export { MIN_LEFT, MAX_LEFT, MIN_RIGHT, MAX_RIGHT_FRACTION, DEFAULTS as LAYOUT_DEFAULTS };
