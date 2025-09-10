import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useTimerStore } from "../../stores/timerStore";
import { useStatsStore } from "@/stores/statsStore";
import { useTimerTypeStore } from "@/stores/timerTypeStore";
import { RefreshCcw, Play, Pause } from "lucide-react";
import GameSummary from "@/components/GameSummary";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { vibrate } from "@/utils/haptics";
import { cn } from "@/lib/utils";
import { usePhaseTransition } from "@/hooks/usePhaseTransition";
import { KeyboardShortcuts } from "../KeyboardShortcuts";
import { GestureHelpDialog } from "../GestureHelpDialog";
import ControlButton from "./ControlButton";
import ConfirmationModal from "./ConfirmationModal";
import { TimerSquare } from "./TimerSquare";
import MobileControls from "./MobileControls";
import { 
  ANIMATION_CSS_CLASSES,
  PerformanceMetrics,
  entranceContainer,
  timerEntranceVariants,
  controlsEntranceDesktop,
  controlsEntranceMobile,
  controlsButtonsContainer,
  controlButtonVariant,
  smoothTween,
  mobileHeightSpring,
  HYSTERESIS_MS,
} from "@/utils/timerAnimations";
import { useOptimizedAnimations } from "@/hooks/useOptimizedAnimations";

interface ChessTimerProps {
  onReset?: () => void;
}

interface ConfirmationState {
  isOpen: boolean;
  type: "checkmate" | "draw" | null;
  player: "white" | "black" | null;
}

export const ChessTimer = ({ onReset }: ChessTimerProps) => {
  const {
    whiteTimeRemaining,
    blackTimeRemaining,
    isRunning,
    activePlayer,
    switchActivePlayer,
    pauseTimer,
    resumeTimer,
  } = useTimerStore();

  const { getDetailedDisplayName } = useTimerTypeStore();

  const [showSummary, setShowSummary] = useState(false);
  const [showGestureHelp, setShowGestureHelp] = useState(false);
  const [gestureNotification, setGestureNotification] = useState<string | null>(null);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    isOpen: false,
    type: null,
    player: null,
  });

  // Mobile breakpoint state for responsive animations
  const [isMobile, setIsMobile] = useState(false);
  
  // Optimized animation state management with performance monitoring
  // Visual active player with micro-hysteresis to stabilize rapid toggles (mobile)
  const [visualActivePlayer, setVisualActivePlayer] = useState<typeof activePlayer>(activePlayer);

  useEffect(() => {
    let t: number | undefined;
    // Apply hysteresis delay only when switching between players; null follows same delay for consistency
    t = window.setTimeout(() => {
      setVisualActivePlayer(activePlayer);
    }, HYSTERESIS_MS);
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [activePlayer]);

  const { 
    animationState, 
    performanceMetrics, 
    shouldUseReducedMotion 
  } = useOptimizedAnimations(visualActivePlayer, {
    enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
    onPerformanceUpdate: (metrics: PerformanceMetrics) => {
      // Log performance issues in development
      if (!metrics.isPerformant) {
        console.warn('Timer animation performance below target:', metrics);
      }
    },
    useTransformAnimations: true
  });

  const { playMove, playCheck, playGameEnd, playGameStart } = useSoundEffects();
  const { currentPhase } = usePhaseTransition();

  // Handle responsive breakpoint detection for mobile animations
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };

    // Check initial state
    checkIsMobile();

    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Performance monitoring effect
  useEffect(() => {
    if (performanceMetrics && process.env.NODE_ENV === 'development') {
      console.log('Timer Animation Performance:', performanceMetrics);
    }
  }, [performanceMetrics]);

  const handleGameEnd = useCallback(
    (reason: "check" | "checkmate" | "draw" | "timeout") => {
      if (!activePlayer) return;

      pauseTimer();
      const winner = reason === "timeout" ? (activePlayer === "white" ? "black" : "white") : activePlayer;

      useStatsStore.getState().recordMove(
        winner,
        0,
        reason === "checkmate" ? "checkmate" : "normal",
        winner === "white" ? whiteTimeRemaining : blackTimeRemaining
      );

      if (reason === "draw") {
        useStatsStore.getState().setGameSummary("draw", "by agreement");
      } else if (reason === "timeout") {
        useStatsStore.getState().setGameSummary(winner, "timeout");
      } else {
        useStatsStore.getState().setGameSummary(winner, reason);
      }

      setTimeout(() => {
        setShowSummary(true);
        playGameEnd();
        vibrate([200, 100, 200]);
      }, 100);
    },
    [activePlayer, pauseTimer, whiteTimeRemaining, blackTimeRemaining, playGameEnd]
  );

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    }
    setShowSummary(false);
    playGameStart();
    useStatsStore.getState().resetStats();
  }, [onReset, playGameStart]);

  useEffect(() => {
    const store = useTimerStore.getState();
    store.setTimeoutCallback(() => {
      handleGameEnd("timeout");
    });
  }, [handleGameEnd]);

  const handlePlayerMove = useCallback(() => {
    if (activePlayer && isRunning) {
      const lastMoveTime = useTimerStore.getState().lastMoveStartTime;
      const moveTime = lastMoveTime ? (Date.now() - lastMoveTime) / 1000 : 0;
      playMove();
      switchActivePlayer();
      useStatsStore.getState().recordMove(
        activePlayer,
        moveTime,
        "normal",
        activePlayer === "white" ? whiteTimeRemaining : blackTimeRemaining
      );
    }
  }, [activePlayer, isRunning, playMove, switchActivePlayer, whiteTimeRemaining, blackTimeRemaining]);

  const handleCheck = useCallback(() => {
    if (activePlayer && isRunning) {
      const lastMoveTime = useTimerStore.getState().lastMoveStartTime;
      const moveTime = lastMoveTime ? (Date.now() - lastMoveTime) / 1000 : 0;
      playCheck();
      vibrate([100]);
      switchActivePlayer();
      useStatsStore.getState().recordMove(
        activePlayer,
        moveTime,
        "check",
        activePlayer === "white" ? whiteTimeRemaining : blackTimeRemaining
      );
    }
  }, [activePlayer, isRunning, playCheck, switchActivePlayer, whiteTimeRemaining, blackTimeRemaining]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRunning) return;
      const actions: { [key: string]: () => void } = {
        Space: () => handlePlayerMove(),
        Enter: () => handleCheck(),
        Tab: () => {
          e.preventDefault();
          pauseTimer();
          setConfirmationState({ isOpen: true, type: "checkmate", player: activePlayer });
        },
        KeyP: () => (isRunning ? pauseTimer() : resumeTimer()),
      };
      const action = actions[e.code as keyof typeof actions];
      if (action) action();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, handlePlayerMove, handleCheck, pauseTimer, resumeTimer, activePlayer]);

  const showGestureNotification = useCallback((message: string) => {
    setGestureNotification(message);
    setTimeout(() => setGestureNotification(null), 1500);
  }, []);

  const handleSingleTap = useCallback(
    (player: "white" | "black") => {
      if (player === activePlayer && isRunning) {
        showGestureNotification("Normal Move");
        handlePlayerMove();
        vibrate([50]);
      }
    },
    [activePlayer, isRunning, handlePlayerMove, showGestureNotification]
  );

  const handleTwoFingerTap = useCallback(
    (player: "white" | "black") => {
      if (player === activePlayer && isRunning) {
        showGestureNotification("Check Move");
        handleCheck();
        vibrate([100, 50, 100]);
      }
    },
    [activePlayer, isRunning, handleCheck, showGestureNotification]
  );

  const handleLongPress = useCallback(
    (player: "white" | "black") => {
      if (player === activePlayer && isRunning) {
        showGestureNotification("Checkmate");
        setConfirmationState({ isOpen: true, type: "checkmate", player });
        vibrate([200]);
      }
    },
    [activePlayer, isRunning, showGestureNotification]
  );

  const getPhaseInfo = useCallback(() => {
    switch (currentPhase) {
      case "opening": return { color: "#4F46E5", label: "Opening Phase", gradient: "bg-gradient-to-r from-blue-600 to-indigo-600", icon: "♟" };
      case "middlegame": return { color: "#0EA5E9", label: "Middle Game", gradient: "bg-gradient-to-r from-sky-500 to-blue-500", icon: "♞" };
      case "endgame": return { color: "#A855F7", label: "End Game", gradient: "bg-gradient-to-r from-purple-600 to-indigo-600", icon: "♚" };
      default: return { color: "#6B7280", label: "Game", gradient: "bg-gradient-to-r from-gray-600 to-gray-700", icon: "♜" };
    }
  }, [currentPhase]);

  const phaseInfo = getPhaseInfo();

  return (
    <motion.div 
      className="h-screen w-full md:h-[93vh] overflow-hidden"
      variants={!shouldUseReducedMotion ? entranceContainer : undefined}
      initial={!shouldUseReducedMotion ? "hidden" : undefined}
      animate={!shouldUseReducedMotion ? "show" : undefined}
    >
      <div className="relative h-full flex flex-col px-1 sm:px-2 pt-20 md:pt-12 pb-8 md:pb-12">
        {/* Desktop header controls - positioned to not interfere with timer squares */}
        <motion.div 
          className="absolute top-4 left-0 right-0 z-30 flex items-center justify-between px-6"
          variants={!shouldUseReducedMotion ? controlsEntranceDesktop : undefined}
          initial={!shouldUseReducedMotion ? "hidden" : undefined}
          animate={!shouldUseReducedMotion ? "show" : undefined}
        >
          <motion.div className="hidden md:block" variants={!shouldUseReducedMotion ? controlButtonVariant : undefined}>
            <ControlButton onClick={handleReset} icon={<RefreshCcw />} label="Reset" />
          </motion.div>
          <motion.div className="flex-grow flex flex-col items-center gap-2" variants={!shouldUseReducedMotion ? controlsButtonsContainer : undefined}>
            <motion.div variants={!shouldUseReducedMotion ? controlButtonVariant : undefined} className={cn(
              "px-4 py-2 rounded-full text-sm font-medium shadow-lg",
              "flex items-center gap-2 z-30 relative",
              phaseInfo.gradient,
              "border border-white/20 backdrop-blur-sm"
            )}>
              <span className="text-white text-lg">{phaseInfo.icon}</span>
              <span className="text-white">{phaseInfo.label}</span>
            </motion.div>
            <motion.div variants={!shouldUseReducedMotion ? controlButtonVariant : undefined} className="px-3 py-1 rounded-full bg-neutral-900/90 backdrop-blur-sm border border-neutral-700/50 shadow-lg z-30 relative">
              <span className="text-neutral-100 text-xs font-semibold">{getDetailedDisplayName()}</span>
            </motion.div>
          </motion.div>
          <motion.div className="hidden md:block" variants={!shouldUseReducedMotion ? controlButtonVariant : undefined}>
            <ControlButton onClick={isRunning ? pauseTimer : resumeTimer} icon={isRunning ? <Pause /> : <Play />} label={isRunning ? "Pause" : "Play"} />
          </motion.div>
        </motion.div>

        {/* Main timer layout - constrained height on desktop to avoid overlaps */}
        <div className="flex flex-col md:flex-row flex-1 w-full gap-4 md:gap-6 lg:gap-10 items-stretch md:items-center md:justify-center max-h-full md:px-6 md:py-0 md:mt-[3rem]">
          {/* Black timer square - anchored at top, expands downward */}
          <motion.div 
            className={cn(
              "flex items-center justify-center cursor-pointer select-none w-full",
              "md:basis-[49%] md:max-w-[49%] md:h-full md:max-h-[calc(100vh-12rem)] md:mx-auto",
              activePlayer === "black" ? "opacity-100" : "opacity-50",
              isMobile && !shouldUseReducedMotion && ANIMATION_CSS_CLASSES.willChangeTransform,
              "self-start"
            )}
            variants={!shouldUseReducedMotion ? timerEntranceVariants : undefined}
            custom="down"
          >
            {/* Inner wrapper handles mobile height animation only to avoid conflicts with entrance variants */}
            <motion.div
              className="w-full h-full"
              animate={isMobile ? {
                height: animationState.topSquareHeight
              } : undefined}
              transition={isMobile ? mobileHeightSpring : undefined}
              initial={isMobile ? {
                height: animationState.topSquareHeight
              } : undefined}
              style={isMobile ? {
                height: animationState.topSquareHeight,
                minHeight: '150px',
                maxHeight: '58vh',
                alignSelf: 'flex-start',
                transformOrigin: 'top center',
                willChange: 'height',
                overflow: 'hidden',
              } : undefined}
            >
              <TimerSquare
                player="black"
                time={blackTimeRemaining}
                isActive={activePlayer === "black"}
                isRunning={isRunning}
                onSingleTap={handleSingleTap}
                onTwoFingerTap={handleTwoFingerTap}
                onLongPress={handleLongPress}
                onCheck={handleCheck}
                onCheckmate={() => setConfirmationState({ isOpen: true, type: "checkmate", player: "black" })}
                onDraw={() => setConfirmationState({ isOpen: true, type: "draw", player: "black" })}
                isMobile={isMobile}
              />
            </motion.div>
          </motion.div>

          {/* Mobile controls */}
          <motion.div 
            className="md:hidden"
            variants={!shouldUseReducedMotion ? controlsEntranceMobile : undefined}
            initial={!shouldUseReducedMotion ? "hidden" : undefined}
            animate={!shouldUseReducedMotion ? "show" : undefined}
          >
            <MobileControls 
              isRunning={isRunning} 
              onTogglePause={isRunning ? pauseTimer : resumeTimer} 
              onShowHelp={() => setShowGestureHelp(true)} 
              onReset={handleReset}
              animatedPosition={animationState.controlsPosition}
              isMobile={isMobile}
            />
          </motion.div>

          {/* White timer square - anchored at bottom, expands upward */}
          <motion.div 
            className={cn(
              "flex items-center justify-center cursor-pointer select-none w-full",
              "md:basis-[49%] md:max-w-[49%] md:h-full md:max-h-[calc(100vh-12rem)] md:mx-auto",
              activePlayer === "white" ? "opacity-100" : "opacity-50",
              isMobile && !shouldUseReducedMotion && ANIMATION_CSS_CLASSES.willChangeTransform,
              "self-start",
              isMobile && "mb-10"
            )}
            variants={!shouldUseReducedMotion ? timerEntranceVariants : undefined}
            custom="up"
          >
            {/* Inner wrapper handles mobile height animation only to avoid conflicts with entrance variants */}
            <motion.div
              className="w-full h-full"
              animate={isMobile ? {
                height: animationState.bottomSquareHeight
              } : undefined}
              transition={isMobile ? mobileHeightSpring : undefined}
              initial={isMobile ? {
                height: animationState.bottomSquareHeight
              } : undefined}
              style={isMobile ? {
                height: animationState.bottomSquareHeight,
                minHeight: '150px',
                maxHeight: '58vh',
                alignSelf: 'flex-end',
                transformOrigin: 'bottom center',
                willChange: 'height',
                overflow: 'hidden',
              } : undefined}
            >
              <TimerSquare
                player="white"
                time={whiteTimeRemaining}
                isActive={activePlayer === "white"}
                isRunning={isRunning}
                onSingleTap={handleSingleTap}
                onTwoFingerTap={handleTwoFingerTap}
                onLongPress={handleLongPress}
                onCheck={handleCheck}
                onCheckmate={() => setConfirmationState({ isOpen: true, type: "checkmate", player: "white" })}
                onDraw={() => setConfirmationState({ isOpen: true, type: "draw", player: "white" })}
                isMobile={isMobile}
              />
            </motion.div>
          </motion.div>
        </div>
        <AnimatePresence>
          {gestureNotification && (
            <motion.div
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-2 rounded-lg bg-neutral-900/90 border border-neutral-700 text-white font-medium shadow-lg backdrop-blur-md">
                {gestureNotification}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="hidden md:block fixed bottom-3 left-1/2 -translate-x-1/2 z-10">
          <KeyboardShortcuts />
        </div>
        {showGestureHelp && <GestureHelpDialog isOpen={showGestureHelp} onClose={() => setShowGestureHelp(false)} />}
        {confirmationState.isOpen && confirmationState.type && (
          <ConfirmationModal
            type={confirmationState.type}
            onConfirm={() => {
              if (confirmationState.type === "checkmate") handleGameEnd("checkmate");
              else if (confirmationState.type === "draw") handleGameEnd("draw");
              setConfirmationState({ isOpen: false, type: null, player: null });
            }}
            onCancel={() => setConfirmationState({ isOpen: false, type: null, player: null })}
          />
        )}
        {showSummary && (
          <GameSummary
            onNewGame={() => {
              if (onReset) onReset();
              setShowSummary(false);
              playGameStart();
              useStatsStore.getState().resetStats();
            }}
            onExit={() => setShowSummary(false)}
          />
        )}
      </div>
    </motion.div>
  );
};
