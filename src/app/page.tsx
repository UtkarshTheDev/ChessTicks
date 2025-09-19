"use client";

import { useTimerStore } from "@/stores/timerStore";
import { useEffect, useRef, useState } from "react";
import { useTimerTypeStore, TimerMode } from "@/stores/timerTypeStore";
import { ChessTimer } from "@/components/ChessTimer";
import { useStatsStore } from "@/stores/statsStore";
import Silk from "@/Backgrounds/Silk/Silk";
import Header from "@/components/HomePage/Header";
import DurationSelector from "@/components/HomePage/DurationSelector";
import TimerModeSelector, {
  types,
} from "@/components/HomePage/TimerModeSelector";
import StartGameButton from "@/components/HomePage/StartGameButton";
import SeoContent from "@/components/HomePage/SeoContent";
import GitHubButton from "@/components/HomePage/GitHubButton";
import { useCustomTimerStore } from "@/stores/customTimerStore";
import DownloadAppButton from "@/components/HomePage/DownloadAppButton";
import { useAppInstallState } from "@/lib/useAppInstallState";
// Note: Avoid useSearchParams to prevent Suspense requirement during prerender

type GameState = "home" | "playing";

export default function Home() {
  const { initializeTimer, setTimeoutCallback } = useTimerStore();
  const { setConfig } = useTimerTypeStore();
  const [time, setTime] = useState(15);
  const [selectedMode, setSelectedMode] = useState<TimerMode>("SUDDEN_DEATH");
  const [gameState, setGameState] = useState<GameState>("home");
  const { isInstalled } = useAppInstallState();
  // Track last handled URL to prevent duplicate handling within the same lifecycle
  const lastHandledUrlRef = useRef<string | null>(null);
  // Track if we're currently handling a PWA shortcut to adjust logging/behavior
  const handlingShortcutRef = useRef<boolean>(false);

  // When user changes timer mode from the main page, avoid carrying over an arbitrary custom
  // duration (e.g., 50) unless it matches a standard preset. This keeps UX predictable.
  const handleModeSelect = (mode: TimerMode) => {
    setSelectedMode(mode);
    const presetMinutes = [5, 15, 60];
    const isPreset = presetMinutes.includes(time);
    if (!isPreset) {
      // Reset to sensible defaults per mode
      const defaultMinutes = mode === "MULTI_STAGE" ? 90 : 15;
      setTime(defaultMinutes);
    }
  };

  // Setup timer using either provided args or current state (with robust fallbacks)
  const setTimer = (modeArg?: TimerMode, minutesArg?: number) => {
    let modeToUse = modeArg ?? selectedMode;
    let minutesToUse = minutesArg ?? time;

    // Do NOT auto-apply durationMinutes here. The selected time comes from UI (DurationSelector)
    // and is passed explicitly via `time` or `minutesArg`. Applying durationMinutes here would
    // override the user's current selection and cause unexpected starts.

    // Guard minutes
    if (!Number.isFinite(minutesToUse) || minutesToUse <= 0) {
      console.warn("Invalid minutesToUse; falling back to 15", { minutesArg, stateTime: time, modeToUse });
      minutesToUse = 15;
    }

    // Normalize/validate mode
    const validModes: TimerMode[] = [
      "SUDDEN_DEATH",
      "SIMPLE_DELAY",
      "BRONSTEIN_DELAY",
      "FISCHER_INCREMENT",
      "MULTI_STAGE",
    ];
    let appliedMode: TimerMode = modeToUse;
    if (!validModes.includes(appliedMode)) {
      if (handlingShortcutRef.current) {
        console.warn("Invalid shortcut mode; defaulting to Sudden Death", { modeToUse });
      }
      appliedMode = "SUDDEN_DEATH";
    }

    const selectedTypeObj = types.find((t) => t.mode === appliedMode);
    let baseConfig;
    if (selectedTypeObj) {
      baseConfig = selectedTypeObj.config(minutesToUse);
    } else {
      // This should not happen; silently fallback for normal starts, warn for shortcuts
      if (handlingShortcutRef.current) {
        console.warn("Shortcut timer type not found; defaulting to Sudden Death", { modeToUse: appliedMode });
      }
      appliedMode = "SUDDEN_DEATH";
      const fallback = types.find((t) => t.mode === "SUDDEN_DEATH");
      baseConfig = fallback ? fallback.config(minutesToUse) : { mode: "SUDDEN_DEATH", baseMillis: minutesToUse * 60 * 1000 } as any;
    }

    // Apply configuration
    try {
      setConfig(baseConfig);
      initializeTimer(baseConfig);
      // Force-initialize display to base time to avoid any zero-state flash
      try {
        const engine = useTimerStore.getState().engine;
        const baseSecs = Math.max(1, Math.floor((baseConfig.baseMillis || 0) / 1000));
        if (engine && baseSecs > 0) {
          engine.setTime("white", baseSecs);
          engine.setTime("black", baseSecs);
        }
      } catch {}
      if (handlingShortcutRef.current) {
        console.info("Initialized timer via shortcut", { mode: appliedMode, minutes: minutesToUse, baseMillis: baseConfig.baseMillis });
      } else {
        // Keep normal starts quieter to avoid noise
        // console.debug("Initialized timer", { mode: appliedMode, minutes: minutesToUse });
      }
    } catch (e) {
      console.error("Failed to initialize timer", e);
    }

    // Apply asymmetric times if configured via custom store
    try {
      const { overrides, enabled } = useCustomTimerStore.getState();
      const ov = overrides[appliedMode];
      // Apply per-side overrides ONLY when user selected the Custom duration for this mode
      const userChoseCustom = Boolean(ov && ov.durationMinutes !== undefined && ov.durationMinutes === minutesToUse);
      if (enabled && ov && userChoseCustom && (ov.whiteMinutes !== undefined || ov.blackMinutes !== undefined)) {
        const engine = useTimerStore.getState().engine;
        if (engine) {
          const fallbackMinutes = Math.max(1, Math.floor(minutesToUse));
          if (ov.whiteMinutes !== undefined) {
            engine.setTime("white", Math.floor(ov.whiteMinutes * 60));
          } else if (ov.blackMinutes !== undefined) {
            engine.setTime("white", Math.floor(fallbackMinutes * 60));
          }
          if (ov.blackMinutes !== undefined) {
            engine.setTime("black", Math.floor(ov.blackMinutes * 60));
          } else if (ov.whiteMinutes !== undefined) {
            engine.setTime("black", Math.floor(fallbackMinutes * 60));
          }
        }
      }
    } catch (e) {
      console.error("Error applying asymmetric overrides", e);
    }

    setTimeoutCallback((player: "white" | "black") => {
      console.log(`${player} ran out of time!`);
    });

    useStatsStore.getState().startGame();
  };


  const startGame = async (modeArg?: TimerMode, minutesArg?: number) => {
    try {
      if (modeArg) setSelectedMode(modeArg);
      if (typeof minutesArg === "number") setTime(minutesArg);
      setTimer(modeArg, minutesArg);
      setGameState("playing");
    } catch (err) {
      console.error(err);
    }
  };

  const resetGame = () => {
    setGameState("home");
    setTime(15);
    setSelectedMode("SUDDEN_DEATH");
    useTimerStore.getState().resetTimer();
  };

  const renderContent = () => {
    if (gameState === "playing") {
      return <ChessTimer onReset={resetGame} />;
    }

    return (
      <>
        <Header />
        <div className="mt-2 sm:mt-3 flex justify-center">
          <GitHubButton />
        </div>
        <div className="mt-4 flex justify-center items-center w-full flex-col space-y-6">
          <DurationSelector selectedTime={time} onTimeSelect={setTime} currentMode={selectedMode} />
          <TimerModeSelector
            selectedMode={selectedMode}
            onModeSelect={handleModeSelect}
          />
        </div>
        {/* Mobile-only APK Download CTA above StartGameButton (hidden if installed) */}
        {!isInstalled && (
          <div className="sm:hidden fixed bottom-24 left-0 right-0 px-4 z-10">
            <DownloadAppButton apkUrl="/chessticks.apk" />
          </div>
        )}
        <StartGameButton onClick={() => startGame(selectedMode, time)} isInstalled={isInstalled} />
      </>
    );
  };

  // Handle PWA app shortcuts (?mode=blitz|rapid|tournament)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleShortcutIfPresent = () => {
      const currentUrl = window.location.href;
      if (lastHandledUrlRef.current === currentUrl) return; // already handled this URL
      const sp = new URLSearchParams(window.location.search);
      let mode: string | null = sp.get("mode");
      // Also support /launch/<mode> path launched from manifest
      if (!mode) {
        const path = window.location.pathname;
        const launchPrefix = "/launch/";
        if (path.startsWith(launchPrefix)) {
          mode = path.slice(launchPrefix.length);
        }
      }
      if (!mode) return;

      // Map incoming shortcut to internal TimerMode and default duration
      let mappedMode: TimerMode = "SUDDEN_DEATH";
      let minutes = 15;
      switch (mode.toLowerCase()) {
        case "blitz":
          mappedMode = "SUDDEN_DEATH";
          minutes = 5; // 5+0 Blitz by default
          break;
        case "rapid":
          mappedMode = "SUDDEN_DEATH";
          minutes = 15; // 15+0 Rapid by default
          break;
        case "tournament":
          mappedMode = "MULTI_STAGE";
          minutes = 90; // Trigger classical multi-stage config
          break;
        default:
          return;
      }

      lastHandledUrlRef.current = currentUrl;
      // Mark that we're handling a shortcut so logging/behavior adjusts
      handlingShortcutRef.current = true;
      // Start immediately with explicit parameters to avoid async state race
      startGame(mappedMode, minutes);
      // Clean the URL so it doesn't retrigger on navigations
      window.history.replaceState({}, "", "/");
      // Reset shortcut flag
      handlingShortcutRef.current = false;
    };

    // Initial check on mount
    handleShortcutIfPresent();

    // Listen for cases where the OS brings the existing PWA window to foreground
    const onFocus = () => handleShortcutIfPresent();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") handleShortcutIfPresent();
    };
    const onPopState = () => handleShortcutIfPresent();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return (
    <>
      <SeoContent />

      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Silk
          speed={12}
          scale={1}
          color="#242424"
          noiseIntensity={3}
          rotation={6}
        />
      </div>
      <main
        className="flex flex-col items-center min-h-screen px-4 py-5 sm:py-6 sm:px-6 lg:px-8"
        role="main"
        aria-label="Chess Timer Application"
      >
        {renderContent()}
      </main>
    </>
  );
}
