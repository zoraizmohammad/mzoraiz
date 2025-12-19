"use client";

export default function VignetteOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-30"
      style={{
        background: `radial-gradient(ellipse at center, transparent 0%, rgba(11, 13, 16, 0.4) 70%, rgba(11, 13, 16, 0.8) 100%)`,
      }}
    />
  );
}

