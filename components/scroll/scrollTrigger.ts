/**
 * Safe ScrollTrigger registration helper
 * Ensures ScrollTrigger is only registered on the client side
 */

// Type definition for ScrollTrigger
type ScrollTriggerType = {
  create: (vars: any) => { kill: () => void };
  refresh: () => void;
  update: () => void;
};

export function registerScrollTrigger(): ScrollTriggerType | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // Dynamic import to ensure it's only loaded on client
    const gsap = require("gsap");
    const ScrollTrigger = require("gsap/ScrollTrigger").ScrollTrigger as ScrollTriggerType;

    // Register ScrollTrigger plugin
    if (gsap && ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      return ScrollTrigger;
    }

    return null;
  } catch (error) {
    console.warn("Failed to load GSAP ScrollTrigger:", error);
    return null;
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get ScrollTrigger instance (returns null if not available)
 */
export function getScrollTrigger(): ScrollTriggerType | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const ScrollTrigger = require("gsap/ScrollTrigger").ScrollTrigger as ScrollTriggerType;
    return ScrollTrigger || null;
  } catch {
    return null;
  }
}

