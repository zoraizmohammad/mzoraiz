"use client";

import { useEffect, useRef } from "react";
import type { GraphScene } from "./graph/types";
import { denormalizeScene, getNodeById, normalizedToPixels } from "./graph/normalize";
import { heroScene } from "./graph/scenes";
import { stepPhysics, prefersReducedMotion } from "./sim/physics";

export default function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sceneRef = useRef<GraphScene | null>(null);
  const anchorPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const isVisibleRef = useRef(true);
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(0);
  const isScrollingRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Load scene (hardcoded to hero for now)
    const currentScene = heroScene;

    // Check for reduced motion preference
    reducedMotionRef.current = prefersReducedMotion();

    // Track scrolling for idle detection
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      isScrollingRef.current = true;
      lastScrollTimeRef.current = performance.now();
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150); // Consider idle after 150ms of no scrolling
    };

    // Set up canvas with devicePixelRatio scaling
    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      
      // Use window dimensions as fallback if getBoundingClientRect returns 0
      const rect = canvas.getBoundingClientRect();
      const displayWidth = rect.width || window.innerWidth;
      const displayHeight = rect.height || window.innerHeight;
      
      widthRef.current = displayWidth;
      heightRef.current = displayHeight;
      
      // Set actual size in memory (scaled for device pixel ratio)
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      
      // Set display size (CSS pixels)
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      
      // Reset transform and scale the context
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      
      // Denormalize scene to pixel coordinates
      const denormalizedScene = denormalizeScene(
        currentScene,
        displayWidth,
        displayHeight
      );
      sceneRef.current = denormalizedScene;

      // Store anchor positions for anchor force (based on normalized positions)
      anchorPositionsRef.current.clear();
      currentScene.nodes.forEach((node) => {
        const { x, y } = normalizedToPixels(
          node.nx,
          node.ny,
          displayWidth,
          displayHeight
        );
        anchorPositionsRef.current.set(node.id, { x, y });
      });
    };

    // Render the scene
    const render = () => {
      const width = widthRef.current;
      const height = heightRef.current;

      if (width === 0 || height === 0 || !sceneRef.current) return;

      // Clear canvas using CSS pixel dimensions (context is already scaled)
      ctx.clearRect(0, 0, width, height);

      const scene = sceneRef.current;

      // Draw edges
      scene.edges.forEach((edge) => {
        const fromNode = getNodeById(scene, edge.from);
        const toNode = getNodeById(scene, edge.to);

        if (!fromNode || !toNode) return;

        ctx.strokeStyle = `rgba(230, 228, 223, ${(edge.opacity ?? 1) * 0.15})`;
        ctx.lineWidth = edge.weight * 0.5;
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      });

      // Draw nodes
      scene.nodes.forEach((node) => {
        const opacity = node.opacity ?? 1;
        
        ctx.fillStyle = `rgba(230, 228, 223, ${opacity * 0.2})`;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Render loop with physics
    const animate = (currentTime: number) => {
      if (!isVisibleRef.current || !sceneRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate delta time (in seconds, capped at 0.1s to prevent large jumps)
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      // Calculate physics intensity based on idle state
      // Reduce intensity if not scrolling and no recent activity
      const timeSinceScroll = currentTime - lastScrollTimeRef.current;
      const isIdle = !isScrollingRef.current && timeSinceScroll > 500; // 500ms idle threshold
      const intensity = isIdle ? 0.3 : 1.0; // Reduce to 30% when idle

      // Step physics simulation
      stepPhysics(
        sceneRef.current,
        dt * 60, // Scale dt to ~60fps equivalent
        widthRef.current,
        heightRef.current,
        {
          reducedMotion: reducedMotionRef.current,
          intensity,
        },
        anchorPositionsRef.current,
        currentTime
      );

      // Render
      render();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Page Visibility API - pause when tab is hidden
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        lastTimeRef.current = performance.now();
      }
    };

    // Initial setup with a small delay to ensure DOM is ready
    const init = () => {
      setupCanvas();
      lastTimeRef.current = performance.now();
      lastScrollTimeRef.current = performance.now();
      animate(performance.now());
    };

    // Use requestAnimationFrame to ensure canvas is laid out
    requestAnimationFrame(init);

    // ResizeObserver for efficient resize handling
    const resizeObserver = new ResizeObserver(() => {
      setupCanvas();
    });

    resizeObserver.observe(canvas);

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for scroll events
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleScroll, { passive: true });

    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{ background: "transparent" }}
    />
  );
}
