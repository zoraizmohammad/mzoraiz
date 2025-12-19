"use client";

import { useEffect, useRef } from "react";
import type { SceneId } from "@/store/sceneStore";

interface SectionWrapperProps {
  id: SceneId;
  children: React.ReactNode;
  className?: string;
}

export default function SectionWrapper({ id, children, className }: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Register with SceneManager
    const register = (window as any).__registerSceneSection;
    if (register) {
      register(id, element);
    }

    return () => {
      if (register) {
        register(id, null);
      }
    };
  }, [id]);

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}

