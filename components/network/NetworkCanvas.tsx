"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import type { GraphScene, Pulse } from "./graph/types";
import { denormalizeScene, getNodeById, normalizedToPixels } from "./graph/normalize";
import { heroScene } from "./graph/scenes";
import { stepPhysics, prefersReducedMotion } from "./sim/physics";
import { buildEdgeMap } from "./graph/index";
import { findPaths, createNodeTypePredicate } from "./graph/path";
import {
  createPulse,
  initializePulseState,
  updatePulses,
  getPulsePosition,
  getPulseOpacity,
  type PulseState,
} from "./sim/pulses";

interface NodeGlow {
  nodeId: string;
  startTime: number;
  duration: number; // in ms
}

export interface NetworkCanvasHandle {
  emitPulse: (originNodeId: string, targetNodeType: string) => void;
}

const NetworkCanvas = forwardRef<NetworkCanvasHandle>((props, ref) => {
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
  const pulsesRef = useRef<Pulse[]>([]);
  const pulseStatesRef = useRef<PulseState[]>([]);
  const nodeGlowsRef = useRef<NodeGlow[]>([]);
  const hasEmittedEnterPulseRef = useRef(false);
  const edgeMapRef = useRef<Map<string, { from: string; to: string }>>(new Map());

  // Expose emitPulse method via ref
  useImperativeHandle(ref, () => ({
    emitPulse: (originNodeId: string, targetNodeType: string) => {
      if (!sceneRef.current) return;

      const paths = findPaths(
        sceneRef.current,
        originNodeId,
        createNodeTypePredicate(targetNodeType as any)
      );

      paths.forEach((pathEdgeIds, targetNodeId) => {
        const pulse = createPulse({
          originNodeId,
          pathEdgeIds,
          speedPxPerSec: 200, // pixels per second
          decay: 0.3,
          color: "#6FA8FF", // accent color
        });

        pulsesRef.current.push(pulse);
        pulseStatesRef.current.push(initializePulseState(pulse));
      });
    },
  }));

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

    // Helper to get edge length
    const getEdgeLength = (edgeId: string): number => {
      if (!sceneRef.current) return 0;
      const edge = sceneRef.current.edges.find((e) => e.id === edgeId);
      if (!edge) return 0;

      const fromNode = getNodeById(sceneRef.current, edge.from);
      const toNode = getNodeById(sceneRef.current, edge.to);
      if (!fromNode || !toNode) return 0;

      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Helper to get node position
    const getNodePosition = (nodeId: string): { x: number; y: number } | null => {
      if (!sceneRef.current) return null;
      const node = getNodeById(sceneRef.current, nodeId);
      if (!node) return null;
      return { x: node.x, y: node.y };
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

      // Build edge map
      edgeMapRef.current = buildEdgeMap(denormalizedScene);

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

      // Reset enter pulse flag on resize
      hasEmittedEnterPulseRef.current = false;
    };

    // Emit scene enter pulse
    const emitSceneEnterPulse = () => {
      if (!sceneRef.current || hasEmittedEnterPulseRef.current) return;
      if (!currentScene.onEnterPulses || currentScene.onEnterPulses.length === 0) return;

      currentScene.onEnterPulses.forEach((pulseConfig) => {
        const originNode = sceneRef.current!.nodes.find(
          (n) => n.id === pulseConfig.originNodeId
        );
        if (!originNode) return;

        const predicate = pulseConfig.toNodeType
          ? createNodeTypePredicate(pulseConfig.toNodeType)
          : () => true;

        const paths = findPaths(
          sceneRef.current!,
          pulseConfig.originNodeId,
          predicate,
          pulseConfig.maxHops
        );

        paths.forEach((pathEdgeIds, targetNodeId) => {
          const pulse = createPulse({
            originNodeId: pulseConfig.originNodeId,
            pathEdgeIds,
            speedPxPerSec: 200,
            decay: 0.3,
            color: "#6FA8FF",
          });

          pulsesRef.current.push(pulse);
          pulseStatesRef.current.push(initializePulseState(pulse));
        });
      });

      hasEmittedEnterPulseRef.current = true;
    };

    // Draw base graph (edges and nodes)
    const drawBaseGraph = () => {
      if (!sceneRef.current) return;

      const scene = sceneRef.current;

      // Draw edges as thin hairlines
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

    // Draw pulses
    const drawPulses = (nowMs: number) => {
      if (pulsesRef.current.length === 0) return;

      // Update pulse states
      pulseStatesRef.current = updatePulses(
        pulsesRef.current,
        nowMs,
        getEdgeLength
      );

      // Draw each pulse
      pulseStatesRef.current.forEach((pulseState) => {
        if (!pulseState.active && pulseState.totalProgress >= 1) {
          // Pulse reached destination, trigger node glow
          const lastEdgeId =
            pulseState.pulse.pathEdgeIds[pulseState.pulse.pathEdgeIds.length - 1];
          const edge = edgeMapRef.current.get(lastEdgeId);
          if (edge) {
            const targetNodeId = edge.to;
            const existingGlow = nodeGlowsRef.current.find((g) => g.nodeId === targetNodeId);
            if (!existingGlow) {
              nodeGlowsRef.current.push({
                nodeId: targetNodeId,
                startTime: nowMs,
                duration: 800, // 800ms glow duration
              });
            }
          }
          return;
        }

        const pulsePos = getPulsePosition(
          pulseState,
          getNodePosition,
          getEdgeLength,
          edgeMapRef.current
        );

        if (!pulsePos) return;

        const opacity = getPulseOpacity(pulseState.pulse, pulseState.totalProgress);
        const color = pulseState.pulse.color || "#6FA8FF";

        // Draw pulse as a bright circle
        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;

        ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(pulsePos.x, pulsePos.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw trail along current edge
        const edgeId = pulseState.pulse.pathEdgeIds[pulseState.currentEdgeIndex];
        const edge = edgeMapRef.current.get(edgeId);
        if (edge) {
          const fromPos = getNodePosition(edge.from);
          const toPos = getNodePosition(edge.to);
          if (fromPos && toPos) {
            ctx.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${opacity * 0.4})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(pulsePos.x, pulsePos.y);
            ctx.stroke();
          }
        }
      });

      // Remove completed pulses
      const activePulses: Pulse[] = [];
      const activePulseStates: PulseState[] = [];
      pulseStatesRef.current.forEach((state, index) => {
        if (state.active || state.totalProgress < 1) {
          activePulses.push(pulsesRef.current[index]);
          activePulseStates.push(state);
        }
      });
      pulsesRef.current = activePulses;
      pulseStatesRef.current = activePulseStates;
    };

    // Draw node glows
    const drawNodeGlows = (nowMs: number) => {
      if (!sceneRef.current) return;

      const activeGlows: NodeGlow[] = [];

      nodeGlowsRef.current.forEach((glow) => {
        const elapsed = nowMs - glow.startTime;
        const progress = Math.min(elapsed / glow.duration, 1);
        const fadeOut = 1 - progress;

        if (fadeOut > 0) {
          const node = getNodeById(sceneRef.current!, glow.nodeId);
          if (node) {
            // Draw outer glow ring
            const glowRadius = node.radius + 5 * (1 - progress);
            ctx.strokeStyle = `rgba(111, 168, 255, ${fadeOut * 0.6})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Draw expanded node
            ctx.fillStyle = `rgba(111, 168, 255, ${fadeOut * 0.3})`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * (1 + progress * 0.5), 0, Math.PI * 2);
            ctx.fill();
          }
          activeGlows.push(glow);
        }
      });

      nodeGlowsRef.current = activeGlows;
    };

    // Render the scene
    const render = (nowMs: number) => {
      const width = widthRef.current;
      const height = heightRef.current;

      if (width === 0 || height === 0 || !sceneRef.current) return;

      // Clear canvas using CSS pixel dimensions (context is already scaled)
      ctx.clearRect(0, 0, width, height);

      // Draw base graph
      drawBaseGraph();

      // Draw pulses
      drawPulses(nowMs);

      // Draw node glows
      drawNodeGlows(nowMs);
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

      // Emit scene enter pulse on first frame
      if (!hasEmittedEnterPulseRef.current) {
        emitSceneEnterPulse();
      }

      // Calculate physics intensity based on idle state
      const timeSinceScroll = currentTime - lastScrollTimeRef.current;
      const isIdle = !isScrollingRef.current && timeSinceScroll > 500;
      const intensity = isIdle ? 0.3 : 1.0;

      // Step physics simulation
      stepPhysics(
        sceneRef.current,
        dt * 60,
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
      render(currentTime);

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
});

NetworkCanvas.displayName = "NetworkCanvas";

export default NetworkCanvas;
