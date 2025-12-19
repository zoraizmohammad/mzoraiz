"use client";

import { useRef, useEffect } from "react";
import NetworkCanvas, { type NetworkCanvasHandle } from "./NetworkCanvas";

export default function NetworkCanvasWrapper() {
  const canvasRef = useRef<NetworkCanvasHandle>(null);

  // Expose canvas ref globally for components to trigger pulses
  useEffect(() => {
    (window as any).__networkCanvasRef = canvasRef;
    return () => {
      delete (window as any).__networkCanvasRef;
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    // Debug: emit pulse from "you" node to all "domain" nodes
    // (Changed from "project" since hero scene only has domain nodes)
    if (canvasRef.current) {
      canvasRef.current.emitPulse("you", "domain");
    }
  };

  return (
    <>
      <NetworkCanvas ref={canvasRef} />
      {/* Invisible click handler overlay - debug only (can be removed in production) */}
      <div
        className="fixed inset-0 z-[5] pointer-events-auto"
        onClick={handleClick}
        style={{ background: "transparent" }}
        aria-hidden="true"
      />
    </>
  );
}

