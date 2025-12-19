"use client";

import { useEffect, useRef } from "react";
import { registerScrollTrigger, prefersReducedMotion, getScrollTrigger } from "./scrollTrigger";
import { useSceneStore } from "@/store/sceneStore";

export default function PinnedSections() {
  const scrollTriggersRef = useRef<Array<{ kill: () => void }>>([]);
  const lenisRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const { setCurrentSceneId, setSceneProgress, setActiveSectionId } = useSceneStore();

  useEffect(() => {
    // Check for reduced motion - disable pinning if enabled
    if (prefersReducedMotion()) {
      return;
    }

    // Wait for DOM to be ready
    if (typeof window === "undefined") {
      return;
    }

    // Register ScrollTrigger
    const ScrollTrigger = registerScrollTrigger();
    if (!ScrollTrigger) {
      console.warn("ScrollTrigger not available");
      return;
    }

    // Initialize Lenis if available (after ScrollTrigger is registered)
    if (typeof window !== "undefined") {
      try {
        const Lenis = require("lenis").default;
        if (Lenis) {
          lenisRef.current = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
          });

          // Make Lenis available globally for SceneManager
          (window as any).lenis = lenisRef.current;

          // Connect Lenis to ScrollTrigger
          lenisRef.current.on("scroll", () => {
            ScrollTrigger.update();
          });

          // Use requestAnimationFrame for smooth scrolling
          function raf(time: number) {
            lenisRef.current?.raf(time);
            rafRef.current = requestAnimationFrame(raf);
          }
          rafRef.current = requestAnimationFrame(raf);
        }
      } catch (error) {
        console.warn("Lenis not available, using native scroll:", error);
      }
    }

    // Wait a bit for sections to be mounted
    const timeoutId = setTimeout(() => {
      // Pin 1: Hero section (~120vh)
      const heroElement = document.getElementById("hero");
      if (heroElement) {
        const heroTrigger = ScrollTrigger.create({
          trigger: heroElement,
          start: "top top",
          end: "+=120vh",
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self: { progress: number }) => {
            setActiveSectionId("hero");
            setCurrentSceneId("hero");
            setSceneProgress(self.progress);
          },
        });
        scrollTriggersRef.current.push(heroTrigger);
      }

      // Pin 2: Work/Projects section (~250vh to scrub through 5 project hubs)
      const workElement = document.getElementById("work");
      if (workElement) {
        const workTrigger = ScrollTrigger.create({
          trigger: workElement,
          start: "top top",
          end: "+=250vh", // ~250vh to scrub through 5 project hubs
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self: { progress: number }) => {
            setActiveSectionId("work");
            setCurrentSceneId("projects");
            // Map progress to project hub index (0-4)
            const projectIndex = Math.floor(self.progress * 5);
            // Normalize progress to 0-1 for each project
            const normalizedProgress = (self.progress * 5) % 1;
            setSceneProgress(normalizedProgress);
          },
        });
        scrollTriggersRef.current.push(workTrigger);
      }

      // Pin 3: Contact section (~120vh)
      const contactElement = document.getElementById("contact");
      if (contactElement) {
        const contactTrigger = ScrollTrigger.create({
          trigger: contactElement,
          start: "top top",
          end: "+=120vh",
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self: { progress: number }) => {
            setActiveSectionId("contact");
            setCurrentSceneId("contact");
            setSceneProgress(self.progress);
          },
        });
        scrollTriggersRef.current.push(contactTrigger);
      }

      // Refresh ScrollTrigger after creating all pins
      ScrollTrigger.refresh();
    }, 100); // Small delay to ensure DOM is ready

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      
      // Kill all ScrollTriggers
      scrollTriggersRef.current.forEach((trigger) => {
        trigger.kill();
      });
      scrollTriggersRef.current = [];

      // Cleanup Lenis
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        delete (window as any).lenis;
      }

      // Cancel Lenis RAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      // Refresh ScrollTrigger
      const st = getScrollTrigger();
      if (st) {
        st.refresh();
      }
    };
  }, [setCurrentSceneId, setSceneProgress, setActiveSectionId]);

  return null; // This component doesn't render anything
}
