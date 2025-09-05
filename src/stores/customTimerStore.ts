import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimerMode } from "@/stores/timerTypeStore";

export type ModeOverride = {
  // If set, overrides baseMinutes for both players
  durationMinutes?: number;
  // If set, overrides white/black separately (wins over durationMinutes)
  whiteMinutes?: number;
  blackMinutes?: number;
  // Mode-specific controls
  incrementSeconds?: number; // Fischer / Multi-Stage base inc
  delaySeconds?: number; // Simple Delay / Bronstein
};

interface CustomTimerState {
  enabled: boolean;
  overrides: Partial<Record<TimerMode, ModeOverride>>;

  // UI flags (consumed by UI to open editors)
  editorModeOpen: TimerMode | null;
  durationEditorOpen: boolean;

  // Actions
  setEnabled: (enabled: boolean) => void;
  openModeEditor: (mode: TimerMode | null) => void;
  openDurationEditor: (open: boolean) => void;
  setOverride: (mode: TimerMode, values: Partial<ModeOverride>) => void;
  resetOverride: (mode: TimerMode) => void;
}

// Clamp helpers
function clampMinutes(mins: number | undefined): number | undefined {
  if (mins === undefined) return undefined;
  const v = Math.max(1, Math.min(1440, Math.floor(mins)));
  return v;
}

function clampSeconds(secs: number | undefined): number | undefined {
  if (secs === undefined) return undefined;
  const v = Math.max(0, Math.min(600, Math.floor(secs))); // allow up to 10 minutes if desired
  return v;
}

export const useCustomTimerStore = create<CustomTimerState>()(
  persist(
    (set, get) => ({
      enabled: true,
      overrides: {},
      editorModeOpen: null,
      durationEditorOpen: false,

      setEnabled: (enabled) => set({ enabled }),
      openModeEditor: (mode) => set({ editorModeOpen: mode }),
      openDurationEditor: (open) => set({ durationEditorOpen: open }),

      setOverride: (mode, values) => {
        const current = get().overrides[mode] || {};
        const next: ModeOverride = {
          ...current,
          ...values,
        };
        // Clamp values
        if (next.durationMinutes !== undefined) next.durationMinutes = clampMinutes(next.durationMinutes);
        if (next.whiteMinutes !== undefined) next.whiteMinutes = clampMinutes(next.whiteMinutes);
        if (next.blackMinutes !== undefined) next.blackMinutes = clampMinutes(next.blackMinutes);
        if (next.incrementSeconds !== undefined) next.incrementSeconds = clampSeconds(next.incrementSeconds);
        if (next.delaySeconds !== undefined) next.delaySeconds = clampSeconds(next.delaySeconds);

        set({ overrides: { ...get().overrides, [mode]: next } });
      },

      resetOverride: (mode) => {
        const { overrides } = get();
        if (!overrides[mode]) return;
        const copy = { ...overrides };
        delete copy[mode];
        set({ overrides: copy });
      },
    }),
    {
      name: "chessticks-custom-timer", // localStorage key
      partialize: (state) => ({ enabled: state.enabled, overrides: state.overrides }),
    }
  )
);
