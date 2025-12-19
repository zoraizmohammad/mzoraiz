"use client";

import { useEffect, useRef } from "react";
import type { GraphNode, GraphEdge, GraphScene } from "./graph/types";
import { denormalizeScene, getNodeById } from "./graph/normalize";
import { heroScene } from "./graph/scenes";

export default function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sceneRef = useRef<GraphScene | null>(null);
  const isVisibleRef = useRef(true);
  const widthRef = useRef(0);
  const heightRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Load scene (hardcoded to hero for now)
    const currentScene = heroScene;

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
      sceneRef.current = denormalizeScene(
        currentScene,
        displayWidth,
        displayHeight
      );
    };

    // Update node positions (subtle movement for non-fixed nodes)
    const updateNodes = (width: number, height: number) => {
      if (!sceneRef.current) return;

      sceneRef.current.nodes.forEach((node) => {
        // Skip fixed nodes
        if (node.fixed) return;

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < node.radius || node.x > width - node.radius) {
          node.vx *= -1;
          node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
        }
        if (node.y < node.radius || node.y > height - node.radius) {
          node.vy *= -1;
          node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
        }
      });
    };

    // Render the scene
    const render = () => {
      const width = widthRef.current;
      const height = heightRef.current;

      if (width === 0 || height === 0 || !sceneRef.current) return;

      // Clear canvas using CSS pixel dimensions (context is already scaled)
      ctx.clearRect(0, 0, width, height);

      // Update node positions
      updateNodes(width, height);

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

    // Render loop
    const animate = () => {
      if (isVisibleRef.current) {
        render();
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Page Visibility API - pause when tab is hidden
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    // Initial setup with a small delay to ensure DOM is ready
    const init = () => {
      setupCanvas();
      animate();
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

    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
