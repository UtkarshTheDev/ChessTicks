/**
 * Timer Animation Utilities
 * 
 * This module provides animation configuration constants and height calculation logic
 * for dynamic timer square animations in mobile view.
 * 
 * Performance optimizations:
 * - Uses transform: scaleY() instead of height changes where possible
 * - Includes will-change CSS properties for GPU acceleration
 * - Provides performance monitoring utilities
 */

// Animation configuration interface
export interface AnimationConfig {
  duration: number; // 0.8-1.0 seconds
  easing: string; // "easeInOut" or custom cubic-bezier
  stiffness: number; // Spring physics parameter
  damping: number; // Spring physics parameter
  mass: number; // Spring physics parameter
}

// Animation configuration constants
export const ANIMATION_CONFIG: AnimationConfig = {
  duration: 0.9,
  easing: "easeInOut",
  stiffness: 300,
  damping: 30,
  mass: 0.8
};

// Optimized spring transition configuration for Framer Motion
export const springTransition = {
  type: "spring" as const,
  stiffness: ANIMATION_CONFIG.stiffness,
  damping: ANIMATION_CONFIG.damping,
  mass: ANIMATION_CONFIG.mass,
  duration: ANIMATION_CONFIG.duration
};

// Performance-optimized transition using transform instead of layout properties
export const transformTransition = {
  type: "spring" as const,
  stiffness: 200, // Reduced for smoother motion
  damping: 25, // Increased for less bounce
  mass: 1.2, // Increased for more fluid motion
  duration: 1.2 // Slower for premium feel
};

// Ultra-smooth transition for height animations
export const heightTransition = {
  type: "spring" as const,
  stiffness: 150, // Even smoother
  damping: 30, // Well-damped
  mass: 1.5, // Heavier feel
  duration: 1.5 // Slower, more luxurious
};

// Shared smooth tween easing for consistent, fluid motion across UI
export const SMOOTH_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Reusable tween transition (no spring bounce) for height/position animations
export const smoothTween = {
  type: "tween" as const,
  duration: 1.2,
  ease: SMOOTH_EASE,
};

// Mobile height spring tuned for "slower and luxurious" feel with subtle overshoot
// Use for height-based animations when transform-only is not feasible due to layout needs
export const mobileHeightSpring = {
  type: "spring" as const,
  stiffness: 160, // Even slower, more luxurious response
  damping: 33, // Well-damped with tiny/subtle overshoot
  mass: 1.2, // Heavier feel for premium glide
  restDelta: 0.002,
  restSpeed: 0.01,
};

// Micro-hysteresis to stabilize rapid flip-flops in visual target without delaying input logic
export const HYSTERESIS_MS = 25; // Reduced for a smaller visual delay while retaining stability

// Action box entrance tuning: appear after most of height animation completes (mobile)
// Chosen ~360ms based on current spring feel to align around ~75–80% completion visually
export const ACTION_BOX_DELAY_MS = 320; // Slightly earlier to reduce perceived delay while still post height-anim

export const actionBoxSpring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 28,
  mass: 1.05,
  duration: 0.5
};

// Font scale transition (mobile): tuned to 500ms with material-like easing
export const fontScaleTransition = {
  type: "tween" as const,
  duration: 0.5,
  ease: [0.4, 0.0, 0.2, 1] as [number, number, number, number]
};

// Recommended font scale values for timer text
export const TIMER_FONT_SCALE = {
  active: 1,
  // Scale chosen to approximate previous inactive vs active size ratios across breakpoints
  inactiveMobile: 0.86
} as const;

// Animation state interface
export interface AnimationState {
  topSquareHeight: string;
  bottomSquareHeight: string;
  controlsPosition: 'center' | 'top' | 'bottom';
}

// Height calculation constants - balanced for readability and prominence with proper spacing
const BASE_HEIGHT = 96; // Slightly reduced to account for container padding
const DEFAULT_HEIGHT_RATIO = 0.46; // 46% for each square in default state
const ACTIVE_HEIGHT_RATIO = 0.68; // 68% for active player square (prominent but not overwhelming)
const INACTIVE_HEIGHT_RATIO = 0.22; // 22% for inactive player square (readable and visible)

/**
 * Calculates height values and controls position based on active player state
 * Optimized for better space utilization and proper positioning
 * 
 * @param activePlayer - The currently active player ('white', 'black', or null)
 * @returns AnimationState object with height values and controls position
 */
export const calculateHeights = (activePlayer: 'white' | 'black' | null): AnimationState => {
  // Helper function to round and format height values
  const formatHeight = (ratio: number): string => {
    return `${Math.round(BASE_HEIGHT * ratio)}vh`;
  };

  // Default state: both squares at 46% height, controls centered
  if (!activePlayer) {
    return {
      topSquareHeight: formatHeight(DEFAULT_HEIGHT_RATIO), // 44vh
      bottomSquareHeight: formatHeight(DEFAULT_HEIGHT_RATIO), // 44vh
      controlsPosition: 'center'
    };
  }
  
  // Top player (black) active: prominent but balanced
  if (activePlayer === 'black') {
    return {
      topSquareHeight: formatHeight(ACTIVE_HEIGHT_RATIO), // 65vh
      bottomSquareHeight: formatHeight(INACTIVE_HEIGHT_RATIO), // 21vh
      controlsPosition: 'bottom'
    };
  }
  
  // Bottom player (white) active: prominent but balanced
  return {
    topSquareHeight: formatHeight(INACTIVE_HEIGHT_RATIO), // 21vh
    bottomSquareHeight: formatHeight(ACTIVE_HEIGHT_RATIO), // 65vh
    controlsPosition: 'top'
  };
};

// Height variants for Framer Motion (legacy - use transform variants for better performance)
export const heightVariants = {
  default: { height: `${Math.round(BASE_HEIGHT * DEFAULT_HEIGHT_RATIO)}vh` },
  active: { height: `${Math.round(BASE_HEIGHT * ACTIVE_HEIGHT_RATIO)}vh` },
  inactive: { height: `${Math.round(BASE_HEIGHT * INACTIVE_HEIGHT_RATIO)}vh` }
};

// Performance-optimized transform variants using scaleY instead of height changes
export const transformVariants = {
  default: { 
    scaleY: 1, 
    transformOrigin: "center",
    willChange: "transform"
  },
  active: { 
    scaleY: ACTIVE_HEIGHT_RATIO / DEFAULT_HEIGHT_RATIO, // 1.49 (70% / 47%)
    transformOrigin: "center",
    willChange: "transform"
  },
  inactive: { 
    scaleY: INACTIVE_HEIGHT_RATIO / DEFAULT_HEIGHT_RATIO, // 0.49 (23% / 47%)
    transformOrigin: "center",
    willChange: "transform"
  }
};

// Position variants for mobile controls with performance optimizations and better spacing
export const positionVariants = {
  center: { 
    y: 0, 
    opacity: 1,
    willChange: "transform, opacity"
  },
  top: { 
    y: -30, // Increased spacing from timer squares
    opacity: 1,
    willChange: "transform, opacity"
  },
  bottom: { 
    y: 30, // Increased spacing from timer squares
    opacity: 1,
    willChange: "transform, opacity"
  }
};

// Performance monitoring utilities
export interface PerformanceMetrics {
  frameRate: number;
  animationDuration: number;
  droppedFrames: number;
  isPerformant: boolean;
}

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private animationStartTime = 0;
  private targetFrameRate = 60;
  private frameRateThreshold = 55; // Consider performant if above 55fps
  private isMonitoring = false;
  private animationFrameId: number | null = null;

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.animationStartTime = this.lastTime;
    
    const measureFrame = () => {
      if (!this.isMonitoring) return;
      
      this.frameCount++;
      
      // Continue monitoring
      this.animationFrameId = requestAnimationFrame(measureFrame);
    };
    
    this.animationFrameId = requestAnimationFrame(measureFrame);
  }

  stopMonitoring(): PerformanceMetrics {
    this.isMonitoring = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    const endTime = performance.now();
    const duration = (endTime - this.animationStartTime) / 1000; // Convert to seconds
    const frameRate = this.frameCount / duration;
    const expectedFrames = duration * this.targetFrameRate;
    const droppedFrames = Math.max(0, expectedFrames - this.frameCount);
    
    const metrics: PerformanceMetrics = {
      frameRate: Math.round(frameRate),
      animationDuration: Math.round(duration * 1000), // Convert back to ms
      droppedFrames: Math.round(droppedFrames),
      isPerformant: frameRate >= this.frameRateThreshold
    };
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Animation Performance Metrics:', metrics);
      
      if (!metrics.isPerformant) {
        console.warn(`Animation performance below target: ${metrics.frameRate}fps (target: ${this.targetFrameRate}fps)`);
      }
    }
    
    return metrics;
  }

  reset(): void {
    this.stopMonitoring();
    this.frameCount = 0;
    this.lastTime = 0;
    this.animationStartTime = 0;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function to check if reduced motion is preferred
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Entrance animation variants for initial load
// Designed to be subtle, premium, and performant using transforms and blur only
export const entranceContainer = {
  hidden: {},
  show: {
    transition: {
      when: 'beforeChildren',
      // Slightly increased stagger for premium pacing
      staggerChildren: 0.09,
      delayChildren: 0.04,
    }
  }
};

// Timer card entrance with directional hint
// Use with `custom` set to 'up' | 'down' | 'none'
export const timerEntranceVariants = {
  hidden: (dir: 'up' | 'down' | 'none' = 'none') => ({
    y: dir === 'up' ? 12 : dir === 'down' ? -12 : 0,
    opacity: 0,
    scale: 0.985,
    willChange: 'transform, opacity'
  }),
  show: (dir: 'up' | 'down' | 'none' = 'none') => ({
    y: 0,
    opacity: 1,
    // Tiny overshoot only using transform (GPU-friendly)
    scale: [0.995, 1.01, 1],
    willChange: 'transform, opacity',
    transition: {
      type: 'spring',
      stiffness: 220,
      damping: 26,
      mass: 1.0,
      duration: 0.9,
      // Subtle delay to keep white following top slightly
      delay: dir === 'up' ? 0.12 : 0
    }
  })
};

// Controls entrance variants
export const controlsEntranceDesktop = {
  hidden: { x: 16, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    // Brief ready pulse on arrival
    scale: [1, 1.01, 1],
    transition: {
      ...transformTransition,
      scale: { duration: 0.5, ease: 'easeOut' }
    }
  }
};

export const controlsEntranceMobile = {
  hidden: { y: 16, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    scale: [1, 1.01, 1],
    transition: {
      ...transformTransition,
      scale: { duration: 0.5, ease: 'easeOut' }
    }
  }
};

// Staggered entrance for individual control buttons
export const controlsButtonsContainer = {
  hidden: {
    opacity: 0,
    y: 6
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.06,
      delayChildren: 0.08
    }
  }
};

export const controlButtonVariant = {
hidden: { y: 10, opacity: 0, scale: 0.95 },
show: { y: 0, opacity: 1, scale: 1, transition: transformTransition }
};

// Subtle ambient background to enhance premium feel without distraction
export const ambientBackgroundVariant = {
hidden: {
opacity: 0,
scale: 1.02,
filter: 'blur(6px)'
},
show: {
opacity: 1,
scale: 1,
filter: 'blur(0px)',
transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.05 }
}
};

// Time/typography progressive reveal for premium readability
export const timerTextVariant = {
  hidden: {
    opacity: 0,
    y: 6,
    willChange: 'transform, opacity'
  },
  show: {
    opacity: 1,
    y: 0,
    willChange: 'transform, opacity',
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.12 }
  }
};

// CSS class names for will-change optimization
export const ANIMATION_CSS_CLASSES = {
willChangeTransform: 'will-change-transform',
willChangeAuto: 'will-change-auto',
gpuAccelerated: 'transform-gpu'
} as const;