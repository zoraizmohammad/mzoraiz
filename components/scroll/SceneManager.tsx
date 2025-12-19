"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSceneStore, type SceneId } from "@/store/sceneStore";

interface SceneManagerProps {
  onEnter?: (sectionId: SceneId) => void;
  onProgress?: (sectionId: SceneId, progress: number) => void;
}

// Section IDs that map to scenes
const SECTION_IDS: SceneId[] = ["hero", "domains", "work", "experience", "proof", "notes", "contact"];

// Map section IDs to scene IDs (some sections share scenes)
const SECTION_SCENE_MAP: Record<SceneId, SceneId> = {
  hero: "hero",
  domains: "domains",
  projects: "projects",
  work: "projects", // work uses projects scene
  experience: "domains",
  proof: "domains",
  notes: "domains",
  contact: "hero", // contact returns to hero scene
};

// Sections that are pinned by ScrollTrigger - SceneManager should not interfere with these
const PINNED_SECTIONS: SceneId[] = ["hero", "work", "contact"];

export default function SceneManager({ onEnter, onProgress }: SceneManagerProps) {
  const sectionsRef = useRef<Map<SceneId, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastActiveSectionRef = useRef<SceneId | null>(null);
  const isPinnedSectionActiveRef = useRef(false);

  const { setCurrentSceneId, setSceneProgress, setActiveSectionId, activeSectionId } = useSceneStore();

  // Register a section element
  const registerSection = useCallback((id: SceneId, element: HTMLElement | null) => {
    if (element) {
      const existing = sectionsRef.current.get(id);
      if (existing !== element) {
        if (existing) {
          observerRef.current?.unobserve(existing);
        }
        sectionsRef.current.set(id, element);
        observerRef.current?.observe(element);
      }
    } else {
      const existing = sectionsRef.current.get(id);
      if (existing) {
        observerRef.current?.unobserve(existing);
        sectionsRef.current.delete(id);
      }
    }
  }, []);

  useEffect(() => {
    // Set up IntersectionObserver for enter/leave detection
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id as SceneId;
            // Skip pinned sections - ScrollTrigger handles them
            if (sectionId && !PINNED_SECTIONS.includes(sectionId) && lastActiveSectionRef.current !== sectionId) {
              lastActiveSectionRef.current = sectionId;
              setActiveSectionId(sectionId);
              
              const sceneId = SECTION_SCENE_MAP[sectionId];
              setCurrentSceneId(sceneId);
              
              onEnter?.(sectionId);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "-20% 0px -20% 0px", // Trigger when section is in middle 60% of viewport
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // Filter out pinned sections from observation (helper function, not used directly but kept for clarity)
    const shouldObserveSection = (sectionId: SceneId) => {
      return !PINNED_SECTIONS.includes(sectionId);
    };

    // Observe all registered sections (excluding pinned ones)
    sectionsRef.current.forEach((element, sectionId) => {
      if (!PINNED_SECTIONS.includes(sectionId)) {
        observerRef.current?.observe(element);
      }
    });

    // Scroll progress tracking with requestAnimationFrame
    const updateScrollProgress = () => {
      // Note: We skip pinned sections in the loop below, so no need to check here

      // Get scroll position from Lenis if available, otherwise use window.scrollY
      let scrollY: number;
      if (typeof window !== "undefined" && (window as any).lenis) {
        // Lenis uses scroll property or scrollY
        scrollY = (window as any).lenis.scroll || (window as any).lenis.scrollY || window.scrollY;
      } else {
        scrollY = window.scrollY;
      }

      const viewportHeight = window.innerHeight;

      // Find the active section (one with most intersection)
      let activeSectionId: SceneId | null = null;
      let activeElement: HTMLElement | null = null;
      let maxIntersection = 0;

      sectionsRef.current.forEach((element, sectionId) => {
        // Skip pinned sections
        if (PINNED_SECTIONS.includes(sectionId)) {
          return;
        }

        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementBottom = elementTop + rect.height;

        // Calculate intersection with viewport
        const viewportTop = scrollY;
        const viewportBottom = scrollY + viewportHeight;

        const intersectionTop = Math.max(elementTop, viewportTop);
        const intersectionBottom = Math.min(elementBottom, viewportBottom);
        const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);
        const intersectionRatio = intersectionHeight / viewportHeight;

        if (intersectionRatio > maxIntersection) {
          maxIntersection = intersectionRatio;
          activeSectionId = sectionId;
          activeElement = element;
        }
      });

      if (activeSectionId !== null && activeElement) {
        const rect = (activeElement as HTMLElement).getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementHeight = rect.height;
        const viewportHeight = window.innerHeight;

        // Calculate progress: 0 when section top enters viewport, 1 when section bottom leaves viewport
        const scrollProgress = Math.max(
          0,
          Math.min(
            1,
            (scrollY + viewportHeight - elementTop) / (elementHeight + viewportHeight)
          )
        );

        setSceneProgress(scrollProgress);
        if (activeSectionId) {
          onProgress?.(activeSectionId, scrollProgress);
        }
      }

      rafRef.current = requestAnimationFrame(updateScrollProgress);
    };

    rafRef.current = requestAnimationFrame(updateScrollProgress);

    return () => {
      if (observerRef.current) {
        sectionsRef.current.forEach((element) => {
          observerRef.current?.unobserve(element);
        });
        observerRef.current.disconnect();
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    }, [onEnter, onProgress, setCurrentSceneId, setSceneProgress, setActiveSectionId, registerSection]);

  // Expose registerSection via global or context - using a simpler approach
  useEffect(() => {
    // Make registerSection available globally for section components
    (window as any).__registerSceneSection = registerSection;
    return () => {
      delete (window as any).__registerSceneSection;
    };
  }, [registerSection]);

  return null; // This component doesn't render anything
}
