import { motion } from "framer-motion";
import { useState } from "react";
import { useTimerStore } from "../../stores/timerStore";
import { cn } from "@/lib/utils";
import useGestures from "@/hooks/useGestures";
import { ActionButton } from "../ui/ActionButton";
import { Check, Trophy, Handshake } from "lucide-react";
import { getTimeParts } from "./formatTime";
import {
  timerTextVariant,
  fontScaleTransition,
  TIMER_FONT_SCALE,
  ANIMATION_CSS_CLASSES,
  prefersReducedMotion,
} from "@/utils/timerAnimations";

interface TimerSquareProps {
  player: "white" | "black";
  time: number;
  isActive: boolean;
  isRunning: boolean;
  onSingleTap: (player: "white" | "black") => void;
  onTwoFingerTap: (player: "white" | "black") => void;
  onLongPress: (player: "white" | "black") => void;
  onCheck: () => void;
  onCheckmate: () => void;
  onDraw: () => void;
  isMobile?: boolean;
}

export const TimerSquare = ({
  player,
  time,
  isActive,
  isRunning,
  onSingleTap,
  onTwoFingerTap,
  onLongPress,
  onCheck,
  onCheckmate,
  onDraw,
  isMobile = false,
}: TimerSquareProps) => {
  const { initialTime, whiteDisplayInfo, blackDisplayInfo } = useTimerStore();
  const displayInfo = player === "white" ? whiteDisplayInfo : blackDisplayInfo;
  const [isGestureActive, setIsGestureActive] = useState(false);
  const shouldUseReducedMotion = prefersReducedMotion();

  const getTimeBasedBackground = () => {
    const timePercentage = (time / initialTime) * 100;
    if (timePercentage <= 10)
      return "bg-gradient-to-br from-red-500 to-red-700 text-white";
    if (timePercentage <= 50)
      return "bg-gradient-to-br from-amber-400 to-yellow-600 text-black";
    if (timePercentage >= 90)
      return "bg-gradient-to-br from-emerald-400 to-green-600 text-white";
    if (player === "white")
      return "bg-gradient-to-br from-gray-100 to-white text-black";
    return "bg-gradient-to-br from-gray-900 to-black text-white";
  };

  const getPlayerBackground = () => {
    if (player === "white") return "bg-white text-black";
    return "bg-gradient-to-br from-gray-900 to-black text-white";
  };

  const getTimeBasedBorderColor = () => {
    const timePercentage = (time / initialTime) * 100;
    if (timePercentage <= 10) return "border-red-500";
    if (timePercentage <= 50) return "border-yellow-400";
    if (timePercentage >= 90) return "border-green-400";
    return player === "white" ? "border-gray-400" : "border-gray-600";
  };

  const getBorderColor = () => {
    if (!isRunning)
      return player === "white" ? "border-gray-400" : "border-gray-600";
    if (isActive)
      return player === "white" ? "border-white" : "border-gray-300";
    return getTimeBasedBorderColor();
  };

  const getBackground = () => {
    if (!isRunning) return getPlayerBackground();
    if (isActive) return getTimeBasedBackground();
    return getPlayerBackground();
  };

  // Gesture handling moved to useGestures to avoid duplicate event props

  // Fallback gesture handlers for complex gestures
  const gestureHandlers = useGestures({
    onTwoFingerTap: () => onTwoFingerTap(player),
    onLongPress: () => onLongPress(player),
    onGestureStart: () => {
      if (isActive && isRunning) setIsGestureActive(true);
    },
    onGestureEnd: () => {
      setIsGestureActive(false);
    },
    onSingleTap: (e) => {
      // Ignore taps on action buttons
      const target = e.target as HTMLElement;
      const isActionButton =
        target.closest("[data-action-button]") ||
        target.closest(".action-button-container");
      if (!isActionButton) {
        onSingleTap(player);
      }
    },
  });

  return (
    <motion.div
      // Event handlers are routed via useGestures to avoid duplication
      {...gestureHandlers}
      className={cn(
        "w-full h-full relative cursor-pointer rounded-2xl overflow-visible box-border",
        "transition-colors duration-300",
        getBackground(),
        isActive && "z-20",
        isGestureActive && isActive && "shadow-2xl",
        // Keep thicker border on mobile active state, unify to 2px on desktop for both
        isActive ? "border-4 md:border-2" : "border-2 md:border-2",
        getBorderColor(),
        isActive ? (player === "black" ? "ring-1 ring-gray-300/30" : "") : "",
        !isActive && player === "white" ? "ring-1 ring-gray-400/50" : "",
        isGestureActive && isActive ? "shadow-2xl" : "shadow-lg",
        "backdrop-blur-sm",
        // Responsive sizing with proper margins to prevent border cutoff
        "mx-0 md:mx-2",
        // Ensure proper height utilization and clickable area
        "flex flex-col justify-center",
        // Ensure inactive squares are visible above status indicators
        !isActive && "z-10"
      )}
      animate={{
        opacity: isActive ? 1 : 0.9,
        zIndex: isActive ? 20 : 10,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 20,
        mass: 1.5,
        duration: 1.0,
      }}
      // Comprehensive click handling
      style={{
        minHeight: "100%",
        width: "100%",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        position: "relative",
        zIndex: isActive ? 20 : 10,
        // Ensure the entire area is interactive
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full w-full",
          // Better padding for inactive state - more space for larger text
          isActive
            ? player === "white"
              ? "pb-16 sm:pb-20"
              : ""
            : player === "white"
              ? "pb-8 sm:pb-10"
              : "",
          // Ensure content doesn't block clicks but fills entire area
          "pointer-events-none absolute inset-0"
        )}
        style={{
          // Allow clicks to pass through to parent
          pointerEvents: "none",
        }}
      >
        {displayInfo &&
          (displayInfo.delayTime !== undefined ||
            displayInfo.pendingIncrement !== undefined ||
            displayInfo.stageInfo) && (
            <div className="mb-2 text-center">
              {displayInfo.isInDelay && displayInfo.delayTime !== undefined && (
                <div
                  className={cn(
                    "text-sm font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border",
                    player === "white"
                      ? "text-yellow-800 bg-yellow-100/95 border-yellow-300"
                      : "text-yellow-200 bg-yellow-900/90 border-yellow-600"
                  )}
                >
                  Delay: {Math.ceil(displayInfo.delayTime)}s
                </div>
              )}
              {displayInfo.pendingIncrement !== undefined &&
                displayInfo.pendingIncrement > 0 && (
                  <div
                    className={cn(
                      "text-sm font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border mt-1",
                      player === "white"
                        ? "text-green-800 bg-green-100/95 border-green-300"
                        : "text-green-200 bg-green-900/90 border-green-600"
                    )}
                  >
                    +{displayInfo.pendingIncrement}s after move
                  </div>
                )}
              {displayInfo.stageInfo && (
                <div
                  className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border mt-1",
                    player === "white"
                      ? "text-blue-800 bg-blue-100/95 border-blue-300"
                      : "text-blue-200 bg-blue-900/90 border-blue-600"
                  )}
                >
                  {displayInfo.stageInfo}
                </div>
              )}
            </div>
          )}
        {/* Scale wrapper for ultra-smooth font transitions (mobile only) */}
        <motion.div
          className={cn(
            ANIMATION_CSS_CLASSES.gpuAccelerated,
            ANIMATION_CSS_CLASSES.willChangeTransform
          )}
          initial={false}
          animate={
            isMobile && !shouldUseReducedMotion
              ? {
                  scale: isActive
                    ? TIMER_FONT_SCALE.active
                    : TIMER_FONT_SCALE.inactiveMobile,
                }
              : { scale: 1 }
          }
          transition={
            isMobile && !shouldUseReducedMotion
              ? fontScaleTransition
              : { duration: 0 }
          }
          style={{
            // Use centered origin on mobile so scaling doesn't shift vertical alignment
            transformOrigin: isMobile
              ? "center"
              : player === "black"
                ? "top center"
                : "bottom center",
          }}
        >
          {(() => {
            const parts = getTimeParts(time);
            const hasHours = parts.hasHours;
            // Visual constants
            const HOURS_SCALE = 0.6; // 60% height
            const GAP_EM = 0.35; // horizontal gap (legacy, no longer used)
            const V_GAP_EM = 0.6; // vertical gap between hours and MM:SS
            const hourText = hasHours && parts.hours12 !== undefined ? `${parts.hours12}h` : "";

            // Compute size classes to match existing behavior (unchanged across threshold)
            const textSizeClass = isMobile
              ? "text-[6rem] sm:text-[7rem] lg:text-[8.5rem]"
              : (isActive
                  ? "text-[6rem] sm:text-[7rem] lg:text-[8.5rem]"
                  : "text-7xl sm:text-8xl lg:text-9xl");

            const marginTopClass = isMobile
              ? (player === "black" ? "mt-0" : "mt-10 sm:mt-12")
              : (isActive ? "mt-12" : "mt-6");

            // Determine background luminance to choose highlight color
            const timePercentage = (time / initialTime) * 100;
            const isDarkActiveBg =
              player === "black" || timePercentage <= 10 || timePercentage >= 90;

            // Spacing and sizing for stacked layout
            const stackGapClass = isActive ? "gap-y-1 sm:gap-y-1.5" : "gap-y-0 sm:gap-y-0.5";
            const hoursSizeClass = isMobile
              ? "text-[3.7rem] sm:text-[4.5rem] lg:text-[5.4rem]"
              : (isActive
                  ? "text-[3.7rem] sm:text-[4.5rem] lg:text-[5.4rem]"
                  : "text-5xl sm:text-6xl lg:text-7xl");
            const hoursOrderClass = (isMobile && player === "black") ? "order-2" : "order-1";
            const mmssOrderClass = (isMobile && player === "black") ? "order-1" : "order-2";

            return (
              <div className="relative block w-full text-center">
                {/* Wrapper stacks hours and MM:SS in normal flow (no absolute) */}
                <span
                  className={cn(
                    "inline-flex flex-col items-center align-middle",
                    marginTopClass,
                    stackGapClass,
                  )}
                  style={{ rotate: isMobile && player === "black" ? "180deg" : "0deg" }}
                >
                  {/* Minutes:Seconds dominant text */}
                  <motion.span
                    className={cn(
                      "font-unbounded font-bold leading-none select-none",
                      "inline-block",
                      textSizeClass,
                      mmssOrderClass,
                    )}
                    variants={timerTextVariant}
                    initial="hidden"
                    animate={{ ...timerTextVariant.show, scale: hasHours ? 0.92 : 1 }}
                    transition={{ ...fontScaleTransition }}
                    style={{
                      rotate: "0deg",
                      transformOrigin: "center",
                    }}
                  >
                    {`${parts.minutes}:${parts.seconds}`}
                  </motion.span>
                  {/* Hours part: stacked, highlighted only when active */}
                  {hasHours && (
                    <motion.span
                      className={cn(
                        "font-unbounded font-bold leading-none select-none",
                        hoursSizeClass,
                        hoursOrderClass,
                        ANIMATION_CSS_CLASSES.gpuAccelerated,
                        isActive && (isDarkActiveBg
                          ? "text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                          : "text-amber-700 drop-shadow-[0_0_6px_rgba(234,179,8,0.35)]"),
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        pointerEvents: "none",
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                      }}
                    >
                      {hourText}
                    </motion.span>
                  )}
                </span>
              </div>
            );
          })()}
        </motion.div>
      </div>
      <motion.div
        className={cn(
          "absolute inset-x-0 w-fit mx-auto z-40 action-button-container",
          "flex flex-nowrap items-center",
          "gap-2 sm:gap-3 px-2.5 py-2 sm:px-3 sm:py-2.5",
          "rounded-2xl border",
          "max-w-[calc(100%-16px)]",
          isRunning &&
            isActive &&
            (player === "white"
              ? "bg-neutral-900/70 border-black/30 ring-1 ring-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl"
              : "bg-white/15 border-white/25 ring-1 ring-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"),
          isRunning &&
            !isActive &&
            (player === "white"
              ? "bg-gradient-to-tr from-neutral-950/80 to-neutral-800/60 border-neutral-900/40 ring-1 ring-white/10 shadow-[0_6px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl"
              : "bg-white/10 border-white/15 shadow-xl backdrop-blur-md"),
          !isRunning &&
            (player === "white"
              ? "bg-gradient-to-tr from-neutral-950/70 to-neutral-800/50 border-neutral-900/30 ring-1 ring-white/10 shadow-lg backdrop-blur-md"
              : "bg-white/8 border-white/10 shadow-lg backdrop-blur-sm")
        )}
        initial={false}
        animate={{
          opacity: isRunning && isActive ? 1 : 0,
          scale: isRunning && isActive ? 1 : 0.8,
          y: isRunning && isActive ? 0 : (isMobile && player === "black" ? -20 : 20),
          filter: isRunning && isActive ? "saturate(1)" : "saturate(0.5)",
        }}
        transition={{
          // Slower, smoother entrance
          type: "spring",
          stiffness: 220,
          damping: 24,
          mass: 1.2,
          duration: 0.6,
          // Delay on mobile so buttons appear after timer height transitions (~1.8s) + small pause
          delay: isMobile && isRunning && isActive ? 0.8 : 0,
          opacity: {
            duration: 0.45,
            ease: "easeOut",
            delay: isMobile && isRunning && isActive ? 0.8 : 0,
          },
          scale: {
            type: "spring",
            stiffness: 280,
            damping: 24,
            mass: 0.9,
            duration: 0.55,
            delay: isMobile && isRunning && isActive ? 1 : 0,
          },
          y: {
            type: "spring",
            stiffness: 260,
            damping: 24,
            mass: 1.0,
            duration: 0.55,
            delay: isMobile && isRunning && isActive ? 1.2 : 0,
          },
        }}
        data-action-button-container="true"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          // Keep disabled interactions when inactive/not running across both mobile and desktop
          pointerEvents: isRunning && isActive ? "auto" : "none",
          // Keep clear of rounded corners and device safe areas (anchor per player on mobile)
          ...(isMobile && player === "black"
            ? { top: "max(1.25rem, calc(env(safe-area-inset-top, 0px) + 1rem))" }
            : { bottom: "max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))" }),
        }}
      >
        <ActionButton
          variant="check"
          onClick={(e) => {
            e?.preventDefault();
            e?.stopPropagation();
            if (isActive && isRunning) onCheck();
          }}
          disabled={!isActive || !isRunning}
          icon={<Check className="w-5 h-5" />}
          label="Check"
        />
        <ActionButton
          variant="checkmate"
          onClick={(e) => {
            e?.preventDefault();
            e?.stopPropagation();
            if (isActive && isRunning) onCheckmate();
          }}
          disabled={!isActive || !isRunning}
          icon={<Trophy className="w-5 h-5" />}
          label="Mate"
        />
        <ActionButton
          variant="draw"
          onClick={(e) => {
            e?.preventDefault();
            e?.stopPropagation();
            if (isActive && isRunning) onDraw();
          }}
          disabled={!isActive || !isRunning}
          icon={<Handshake className="w-5 h-5" />}
          label="Draw"
        />
      </motion.div>
    </motion.div>
  );
};
