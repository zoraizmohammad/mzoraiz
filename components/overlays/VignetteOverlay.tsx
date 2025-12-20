"use client";

import { useSceneStore } from "@/store/sceneStore";

export default function VignetteOverlay() {
  const { activeSectionId } = useSceneStore();
  
  // Increase vignette intensity when in contact section
  const isContact = activeSectionId === "contact";
  const vignetteIntensity = isContact ? 0.6 : 0.4; // Increase from 0.4 to 0.6
  const edgeIntensity = isContact ? 0.9 : 0.8; // Increase from 0.8 to 0.9
  
  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-1000"
      style={{
        background: `radial-gradient(ellipse at center, transparent 0%, rgba(11, 13, 16, ${vignetteIntensity}) 70%, rgba(11, 13, 16, ${edgeIntensity}) 100%)`,
      }}
    />
  );
}

