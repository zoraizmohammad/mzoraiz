"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import type { GraphScene, Pulse } from "./graph/types";
import { denormalizeScene, getNodeById, normalizedToPixels } from "./graph/normalize";
import { heroScene, domainsScene, projectsScene, scenes } from "./graph/scenes";
import { useSceneStore } from "@/store/sceneStore";
import { stepPhysics, prefersReducedMotion } from "./sim/physics";
import { buildEdgeMap } from "./graph/index";
import {
  startTransition,
  updateTransition,
  createNodeTransitions,
  createEdgeTransitions,
  applyNodeTransitions,
  applyEdgeTransitions,
  getNodesToRemove,
  getEdgesToRemove,
  type TransitionState,
  type NodeTransition,
  type EdgeTransition,
} from "./sim/transition";
import {
  sceneCameraToState,
  startCameraTransition,
  updateCameraTransition,
  getCurrentCamera,
  applyCameraTransform,
  type CameraTransition,
} from "./sim/camera";
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
  const transitionStateRef = useRef<TransitionState | null>(null);
  const nodeTransitionsRef = useRef<Map<string, NodeTransition>>(new Map());
  const edgeTransitionsRef = useRef<Map<string, EdgeTransition>>(new Map());
  const cameraTransitionRef = useRef<CameraTransition | null>(null);
  const lastActiveHubIndexRef = useRef<number | null>(null);
  const pulseDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to scene store
  const { currentSceneId, sceneProgress, highlightNodeIds, ambientMode, activeSectionId } = useSceneStore();

  // Project hub IDs in order (0-4)
  const PROJECT_HUB_IDS = [
    "project-aws",
    "project-cipher",
    "project-sonic",
    "project-fpga",
    "project-ml",
  ];

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

  // Store currentSceneId in ref for access inside useEffect
  const currentSceneIdRef = useRef(currentSceneId);
  useEffect(() => {
    currentSceneIdRef.current = currentSceneId;
  }, [currentSceneId]);

  // Get section-aware opacity multiplier (needs to be accessible in setupCanvas)
  const getSectionOpacity = (): number => {
    if (!activeSectionId) return 0.6; // Default when no section active
    
    // Per-section opacity multipliers
    const sectionOpacityMap: Record<string, number> = {
      hero: 1.0,        // Strong in hero
      domains: 0.8,     // Strong in domains
      work: 0.7,        // Moderate in work
      projects: 0.7,    // Moderate in projects
      experience: 0.5,  // Faded in experience
      proof: 0.4,       // Very faded in proof
      notes: 0.3,       // Almost invisible in notes (calm mode)
      contact: 0.6,     // Moderate in contact
    };
    
    return sectionOpacityMap[activeSectionId] ?? 0.6;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Update canvas opacity and blur based on section
    const sectionOpacity = getSectionOpacity();
    const blurAmount = sectionOpacity < 0.5 ? 2 : 0;
    canvas.style.opacity = String(sectionOpacity);
    canvas.style.filter = blurAmount > 0 ? `blur(${blurAmount}px)` : "none";
    canvas.style.transition = "opacity 0.8s ease-out, filter 0.8s ease-out";
  }, [activeSectionId]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Scene mapping
    const sceneMap: Record<string, typeof heroScene> = {
      hero: heroScene,
      domains: domainsScene,
      projects: projectsScene,
      work: projectsScene, // work section uses projects scene
      experience: domainsScene,
      proof: domainsScene,
      notes: domainsScene,
      contact: heroScene, // contact returns to hero scene
    };

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

    // Start scene transition
    const startSceneTransition = (targetSceneId: string, nowMs: number) => {
      const targetNormalizedScene = sceneMap[targetSceneId];
      if (!targetNormalizedScene || !sceneRef.current) return;

      const targetScene = denormalizeScene(
        targetNormalizedScene,
        widthRef.current,
        heightRef.current
      );

      // Start transition
      transitionStateRef.current = startTransition(
        sceneRef.current,
        targetScene,
        900 // 900ms transition duration
      );

      // Create node and edge transitions
      nodeTransitionsRef.current = createNodeTransitions(sceneRef.current, targetScene);
      edgeTransitionsRef.current = createEdgeTransitions(sceneRef.current, targetScene);

      // Start camera transition if scenes have cameras
      const fromCamera = sceneCameraToState(sceneRef.current.camera);
      const toCamera = sceneCameraToState(targetScene.camera);
      cameraTransitionRef.current = startCameraTransition(fromCamera, toCamera, 900);

      // Add nodes from target that don't exist in current (for spawning)
      targetScene.nodes.forEach((targetNode) => {
        const existingNode = sceneRef.current!.nodes.find((n) => n.id === targetNode.id);
        if (!existingNode) {
          // Spawn new node at target position with 0 opacity
          const newNode = { ...targetNode };
          newNode.opacity = 0;
          sceneRef.current!.nodes.push(newNode);
        }
      });

      // Add edges from target that don't exist in current (for fading in)
      targetScene.edges.forEach((targetEdge) => {
        const existingEdge = sceneRef.current!.edges.find((e) => e.id === targetEdge.id);
        if (!existingEdge) {
          // Spawn new edge with 0 opacity
          const newEdge = { ...targetEdge };
          newEdge.opacity = 0;
          sceneRef.current!.edges.push(newEdge);
        }
      });

      // Update anchor positions to target scene (these guide physics)
      anchorPositionsRef.current.clear();
      targetScene.nodes.forEach((node) => {
        const transition = nodeTransitionsRef.current.get(node.id);
        if (transition) {
          // Use target position from transition
          anchorPositionsRef.current.set(node.id, { x: transition.targetX, y: transition.targetY });
        } else {
          anchorPositionsRef.current.set(node.id, { x: node.x, y: node.y });
        }
      });

      // Reset enter pulse flag when changing scenes
      hasEmittedEnterPulseRef.current = false;
    };

    // Update scene transition
    const updateSceneTransition = (nowMs: number) => {
      if (!transitionStateRef.current || !transitionStateRef.current.isActive) return;

      // Update transition progress
      transitionStateRef.current = updateTransition(transitionStateRef.current, nowMs);

      const progress = transitionStateRef.current.progress;

      // Apply node transitions (opacity)
      applyNodeTransitions(nodeTransitionsRef.current, progress);

      // Apply edge transitions (opacity)
      applyEdgeTransitions(edgeTransitionsRef.current, progress);

      // Update camera transition
      if (cameraTransitionRef.current) {
        cameraTransitionRef.current = updateCameraTransition(cameraTransitionRef.current, nowMs);
      }

      // When transition completes, finalize scene switch
      if (!transitionStateRef.current.isActive) {
        const toScene = transitionStateRef.current.toScene;

        // Remove nodes that don't exist in target
        const nodesToRemove = getNodesToRemove(nodeTransitionsRef.current);
        sceneRef.current!.nodes = sceneRef.current!.nodes.filter(
          (node) => !nodesToRemove.includes(node.id)
        );

        // Remove edges that don't exist in target
        const edgesToRemove = getEdgesToRemove(edgeTransitionsRef.current);
        sceneRef.current!.edges = sceneRef.current!.edges.filter(
          (edge) => !edgesToRemove.includes(edge.id)
        );

        // Switch to target scene
        sceneRef.current = toScene;
        edgeMapRef.current = buildEdgeMap(toScene);

        // Clear transitions
        transitionStateRef.current = null;
        nodeTransitionsRef.current.clear();
        edgeTransitionsRef.current.clear();
        cameraTransitionRef.current = null;
      }
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
      
      // Initialize with current scene
      const initialScene = sceneMap[currentSceneIdRef.current] || heroScene;
      const denormalizedScene = denormalizeScene(
        initialScene,
        displayWidth,
        displayHeight
      );
      sceneRef.current = denormalizedScene;

      // Build edge map
      edgeMapRef.current = buildEdgeMap(denormalizedScene);

      // Store anchor positions for anchor force (based on normalized positions)
      anchorPositionsRef.current.clear();
      initialScene.nodes.forEach((node) => {
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
      const normalizedScene = sceneMap[currentSceneId] || heroScene;
      if (!normalizedScene.onEnterPulses || normalizedScene.onEnterPulses.length === 0) return;

      normalizedScene.onEnterPulses.forEach((pulseConfig) => {
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

    // Calculate active hub index from sceneProgress (for projects scene)
    const getActiveHubIndex = (): number | null => {
      if (currentSceneId !== "projects") return null;
      const index = Math.floor(sceneProgress * PROJECT_HUB_IDS.length);
      return Math.min(index, PROJECT_HUB_IDS.length - 1);
    };

    // Get active hub node ID
    const getActiveHubNodeId = (): string | null => {
      const hubIndex = getActiveHubIndex();
      if (hubIndex === null) return null;
      return PROJECT_HUB_IDS[hubIndex];
    };

    // Get edges connected to a node
    const getEdgesForNode = (nodeId: string): string[] => {
      if (!sceneRef.current) return [];
      return sceneRef.current.edges
        .filter((edge) => edge.from === nodeId || edge.to === nodeId)
        .map((edge) => edge.id);
    };

    // Get section-aware opacity multiplier (local version for drawBaseGraph)
    const getSectionOpacityLocal = (): number => {
      if (!activeSectionId) return 0.6; // Default when no section active
      
      // Per-section opacity multipliers
      const sectionOpacityMap: Record<string, number> = {
        hero: 1.0,        // Strong in hero
        domains: 0.8,     // Strong in domains
        work: 0.7,        // Moderate in work
        projects: 0.7,    // Moderate in projects
        experience: 0.5,  // Faded in experience
        proof: 0.4,       // Very faded in proof
        notes: 0.3,       // Almost invisible in notes (calm mode)
        contact: 0.6,     // Moderate in contact
      };
      
      return sectionOpacityMap[activeSectionId] ?? 0.6;
    };

    // Draw base graph (edges and nodes)
    const drawBaseGraph = () => {
      if (!sceneRef.current) return;

      const scene = sceneRef.current;
      const transitionProgress = transitionStateRef.current?.progress ?? 1;
      const sectionOpacity = getSectionOpacityLocal();
      
      // Calculate active hub for projects scene
      const activeHubNodeId = getActiveHubNodeId();
      const activeHubEdges = activeHubNodeId
        ? getEdgesForNode(activeHubNodeId)
        : [];

      // Draw edges as thin hairlines with transition opacity
      scene.edges.forEach((edge) => {
        const fromNode = getNodeById(scene, edge.from);
        const toNode = getNodeById(scene, edge.to);

        if (!fromNode || !toNode) return;

        // Use edge's opacity (updated by transition system)
        const baseOpacity = 0.15; // Base hairline opacity
        let finalOpacity = baseOpacity * (edge.opacity ?? 1);

        // Edge weight affects opacity subtly
        const weightMultiplier = 0.8 + edge.weight * 0.2;
        finalOpacity = finalOpacity * weightMultiplier;

        // Highlight active hub edges (subtle increase)
        const isActiveHubEdge = activeHubEdges.includes(edge.id);
        if (isActiveHubEdge) {
          finalOpacity = Math.min(finalOpacity * 1.8, 0.4); // Increase opacity but keep it subtle
        }

        // Apply section-aware opacity
        finalOpacity = finalOpacity * sectionOpacity;

        ctx.strokeStyle = `rgba(230, 228, 223, ${finalOpacity})`;
        ctx.lineWidth = edge.weight * 0.5;
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      });

      // Draw nodes with transition opacity and highlighting
      scene.nodes.forEach((node) => {
        const baseOpacity = node.opacity ?? 1;
        const finalOpacity = baseOpacity;
        const isHighlighted = highlightNodeIds.has(node.id);
        const isActiveHub = activeHubNodeId === node.id;
        
        // Draw highlight glow if highlighted or active hub
        if (isHighlighted || isActiveHub) {
          const glowRadius = node.radius + (isActiveHub ? 10 : 8);
          const glowIntensity = isActiveHub ? 0.3 : 0.4; // Subtle glow for active hub
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            node.radius,
            node.x,
            node.y,
            glowRadius
          );
          gradient.addColorStop(0, `rgba(111, 168, 255, ${finalOpacity * glowIntensity})`);
          gradient.addColorStop(1, `rgba(111, 168, 255, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw node with increased opacity for active hub
        let nodeOpacity = finalOpacity * 0.2;
        if (isHighlighted) {
          nodeOpacity = finalOpacity * 0.4;
        } else if (isActiveHub) {
          nodeOpacity = finalOpacity * 0.35; // Subtle increase for active hub
        }
        
        // Apply section-aware opacity
        nodeOpacity = nodeOpacity * sectionOpacity;
        
        ctx.fillStyle = `rgba(230, 228, 223, ${nodeOpacity})`;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw highlight ring if highlighted or active hub
        if (isHighlighted || isActiveHub) {
          const ringOpacity = isActiveHub ? 0.6 : 0.8; // Subtle ring for active hub
          ctx.strokeStyle = `rgba(111, 168, 255, ${finalOpacity * ringOpacity})`;
          ctx.lineWidth = isActiveHub ? 1.5 : 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
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

      // Apply camera transform if active
      const currentCamera = getCurrentCamera(cameraTransitionRef.current);
      const hasCameraTransform = currentCamera.zoom !== 1 || currentCamera.cx !== 0.5 || currentCamera.cy !== 0.5;
      
      if (hasCameraTransform) {
        applyCameraTransform(ctx, currentCamera, width, height);
      }

      // Draw base graph
      drawBaseGraph();

      // Draw pulses
      drawPulses(nowMs);

      // Draw node glows
      drawNodeGlows(nowMs);

      // Restore camera transform if applied
      if (hasCameraTransform) {
        ctx.restore();
      }
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

      // Check for scene changes and trigger transition
      if (sceneRef.current && !transitionStateRef.current?.isActive) {
        const currentSceneIdFromStore = currentSceneIdRef.current;
        const currentRenderedSceneId = sceneRef.current.id;
        if (currentSceneIdFromStore !== currentRenderedSceneId) {
          startSceneTransition(currentSceneIdFromStore, currentTime);
          // Reset active hub index when scene changes
          lastActiveHubIndexRef.current = null;
        }
      }

      // Update scene transition
      updateSceneTransition(currentTime);

      // Handle project hub highlighting and pulse emission
      if (currentSceneId === "projects" && sceneRef.current) {
        const activeHubIndex = getActiveHubIndex();
        
        // Emit pulse when hub index changes (debounced)
        if (
          activeHubIndex !== null &&
          activeHubIndex !== lastActiveHubIndexRef.current
        ) {
          // Clear existing debounce
          if (pulseDebounceTimeoutRef.current) {
            clearTimeout(pulseDebounceTimeoutRef.current);
          }

          // Debounce pulse emission (300ms)
          pulseDebounceTimeoutRef.current = setTimeout(() => {
            const activeHubNodeId = PROJECT_HUB_IDS[activeHubIndex];
            if (activeHubNodeId && sceneRef.current) {
              // Emit soft pulse from active hub to its concept nodes
              const pathsMap = findPaths(
                sceneRef.current,
                activeHubNodeId,
                createNodeTypePredicate("concept"),
                1 // Only immediate connections
              );

              // Emit a single subtle pulse (use first path from map)
              const pathEntries = Array.from(pathsMap.entries());
              if (pathEntries.length > 0) {
                const [, firstPath] = pathEntries[0];
                const pulse = createPulse({
                  originNodeId: activeHubNodeId,
                  pathEdgeIds: firstPath,
                  speedPxPerSec: 150, // Slower, softer pulse
                  decay: 0.5, // Faster decay for subtlety
                  color: "rgba(111, 168, 255, 0.6)", // Softer color
                });

                pulsesRef.current.push(pulse);
                pulseStatesRef.current.push(initializePulseState(pulse));
              }
            }
          }, 300);

          lastActiveHubIndexRef.current = activeHubIndex;
        }
      } else {
        // Reset when not in projects scene
        lastActiveHubIndexRef.current = null;
      }

      // Emit scene enter pulse on first frame or when scene changes (not during transition)
      if (!hasEmittedEnterPulseRef.current && !transitionStateRef.current?.isActive) {
        emitSceneEnterPulse();
      }

      // Calculate physics intensity based on idle state
      const timeSinceScroll = currentTime - lastScrollTimeRef.current;
      const isIdle = !isScrollingRef.current && timeSinceScroll > 500;
      const intensity = isIdle ? 0.3 : 1.0;

      // Step physics simulation (with increased anchor force during transitions)
      const isTransitioning = transitionStateRef.current?.isActive ?? false;
      
      // Adjust ambient motion based on ambientMode
      const ambientMultiplier = ambientMode === "calm" ? 0.2 : 1.0; // Reduce drift/wobble by 80% in calm mode
      
      stepPhysics(
        sceneRef.current,
        dt * 60,
        widthRef.current,
        heightRef.current,
        {
          reducedMotion: reducedMotionRef.current,
          intensity,
          isTransitioning,
          ambientDrift: (sceneRef.current.ambient?.drift ?? 0.0001) * ambientMultiplier,
          ambientWobble: (sceneRef.current.ambient?.wobble ?? 0.0002) * ambientMultiplier,
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
      if (pulseDebounceTimeoutRef.current) {
        clearTimeout(pulseDebounceTimeoutRef.current);
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
      className="fixed inset-0 pointer-events-none z-[2] w-full h-full"
      style={{ background: "transparent" }}
    />
  );
});

NetworkCanvas.displayName = "NetworkCanvas";

export default NetworkCanvas;
