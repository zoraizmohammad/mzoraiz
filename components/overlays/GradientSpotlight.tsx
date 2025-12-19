"use client";

export default function GradientSpotlight() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-10"
      style={{
        background: `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(111, 168, 255, 0.05) 0%, transparent 50%)`,
      }}
    />
  );
}

