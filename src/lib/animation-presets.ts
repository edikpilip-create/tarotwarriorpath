export const animationDurations = {
  instant: 0,
  fast: 180,
  base: 520,
  slow: 900,
  ambient: 7200,
} as const;

export const animationDelays = {
  none: 0,
  short: 80,
  medium: 160,
  long: 280,
} as const;

export const animationEasings = {
  entrance: "cubic-bezier(0.23, 1, 0.32, 1)",
  movement: "cubic-bezier(0.77, 0, 0.175, 1)",
  ambient: "cubic-bezier(0.45, 0, 0.55, 1)",
  linear: "linear",
} as const;

export const animationStagger = {
  groupDelay: 120,
  itemDelay: 64,
  maxItems: 8,
} as const;

export const reducedMotionSettings = {
  disableTransforms: true,
  disableLoopingMotion: true,
  keepOpacityTransitions: true,
  opacityDuration: 180,
} as const;

export type MotionTier = "full" | "simplified" | "minimal" | "reduced";

export type MotionTierInput = {
  width: number;
  prefersReducedMotion: boolean;
};

type AnimationFrame = {
  opacity?: number;
  transform?: string;
};

type AnimationVariant = {
  from: AnimationFrame;
  to: AnimationFrame;
  duration: number;
  easing: string;
};

export const animationVariants = {
  fadeUp: {
    from: { opacity: 0, transform: "translate3d(0, 18px, 0)" },
    to: { opacity: 1, transform: "translate3d(0, 0, 0)" },
    duration: animationDurations.base,
    easing: animationEasings.entrance,
  },
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: animationDurations.base,
    easing: animationEasings.entrance,
  },
  scaleIn: {
    from: { opacity: 0, transform: "scale(0.96)" },
    to: { opacity: 1, transform: "scale(1)" },
    duration: animationDurations.base,
    easing: animationEasings.entrance,
  },
  slideLeft: {
    from: { opacity: 0, transform: "translate3d(24px, 0, 0)" },
    to: { opacity: 1, transform: "translate3d(0, 0, 0)" },
    duration: animationDurations.base,
    easing: animationEasings.entrance,
  },
  slideRight: {
    from: { opacity: 0, transform: "translate3d(-24px, 0, 0)" },
    to: { opacity: 1, transform: "translate3d(0, 0, 0)" },
    duration: animationDurations.base,
    easing: animationEasings.entrance,
  },
  staggerChildren: {
    from: { opacity: 1 },
    to: { opacity: 1 },
    duration: animationDurations.base,
    easing: animationEasings.entrance,
  },
  slowFloat: {
    from: { opacity: 1, transform: "translate3d(0, 0, 0)" },
    to: { opacity: 1, transform: "translate3d(0, -18px, 0)" },
    duration: animationDurations.ambient,
    easing: animationEasings.ambient,
  },
  softPulse: {
    from: { opacity: 0.72, transform: "scale(0.985)" },
    to: { opacity: 1, transform: "scale(1)" },
    duration: animationDurations.slow,
    easing: animationEasings.ambient,
  },
} as const satisfies Record<string, AnimationVariant>;

export type AnimationVariantName = keyof typeof animationVariants;
export type RevealVariantName = Exclude<AnimationVariantName, "slowFloat" | "softPulse" | "staggerChildren">;

export function getMotionTier({ width, prefersReducedMotion }: MotionTierInput): MotionTier {
  if (prefersReducedMotion) {
    return "reduced";
  }

  if (width < 768) {
    return "minimal";
  }

  if (width < 1024) {
    return "simplified";
  }

  return "full";
}
