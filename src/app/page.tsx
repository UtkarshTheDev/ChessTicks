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
  const handledShortcutRef = useRef(false);

  const setTimer = () => {
    const selectedTypeObj = types.find((t) => t.mode === selectedMode);
    if (selectedTypeObj) {
      const config = selectedTypeObj.config(time);
      setConfig(config);
      initializeTimer(config);
      // Apply asymmetric times if configured via custom store
      const { overrides, enabled } = useCustomTimerStore.getState();
      const ov = overrides[selectedMode];
      if (enabled && ov && (ov.whiteMinutes || ov.blackMinutes)) {
        const engine = useTimerStore.getState().engine;
        if (engine) {
          // If only one side is set, default the other side to 15:00 per requirements
          const fallbackMinutes = 15;
          if (ov.whiteMinutes) {
            engine.setTime("white", Math.floor(ov.whiteMinutes * 60));
          }
          if (ov.blackMinutes) {
            engine.setTime("black", Math.floor(ov.blackMinutes * 60));
          }
          if (ov.whiteMinutes === undefined && ov.blackMinutes !== undefined) {
            engine.setTime("white", Math.floor(fallbackMinutes * 60));
          }
          if (ov.blackMinutes === undefined && ov.whiteMinutes !== undefined) {
            engine.setTime("black", Math.floor(fallbackMinutes * 60));
          }
        }
      }
      setTimeoutCallback((player: "white" | "black") => {
        console.log(`${player} ran out of time!`);
      });
    }
    useStatsStore.getState().startGame();
  };


  const startGame = async () => {
    try {
      setTimer();
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
            onModeSelect={setSelectedMode}
          />
        </div>
        {/* Mobile-only APK Download CTA above StartGameButton (hidden if installed) */}
        {!isInstalled && (
          <div className="sm:hidden fixed bottom-24 left-0 right-0 px-4 z-10">
            <DownloadAppButton apkUrl="/chessticks.apk" />
          </div>
        )}
        <StartGameButton onClick={startGame} isInstalled={isInstalled} />
      </>
    );
  };

  // Handle PWA app shortcuts (?mode=blitz|rapid|tournament)
  useEffect(() => {
    if (handledShortcutRef.current) return;
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const mode = sp.get("mode");
    if (!mode) return;

    handledShortcutRef.current = true;

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
        // Unknown value, ignore
        return;
    }

    // Apply selections and auto-start
    setSelectedMode(mappedMode);
    setTime(minutes);
    // Defer start to ensure state updates settle
    setTimeout(() => {
      startGame();
      // Clean the URL so it doesn't retrigger on navigations
      window.history.replaceState({}, "", "/");
    }, 0);
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
