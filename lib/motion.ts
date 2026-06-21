import { Variants } from "framer-motion";

/**
 * Shared motion primitives — one source of truth so every animated surface
 * shares the same easing and rhythm. Import these instead of hand-rolling
 * `initial`/`animate` objects inline.
 *
 * Only `transform` and `opacity` are animated (GPU-cheap); avoid width/height/top/left.
 */

// Soft, weaving-friendly cubic-bezier. Tuple-typed so it satisfies framer's Easing.
export const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Rise-and-fade with a subtle spring overshoot. The transform springs (bouncy),
// while opacity uses a quick tween — springing opacity overshoots past 1 and
// causes a faint flicker, so they're animated separately.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      y: { type: "spring", stiffness: 200, damping: 20, mass: 0.9 },
      opacity: { duration: 0.4, ease },
    },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease } },
};

// Parent variant: reveals children one after another. Pair with fadeUp/fadeIn children.
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
