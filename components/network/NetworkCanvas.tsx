"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}

interface Edge {
  from: Node;
  to: Node;
}

export default function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const isVisibleRef = useRef(true);
  const widthRef = useRef(0);
  const heightRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Initialize test scene with nodes and edges
    const initScene = (width: number, height: number) => {
      const nodeCount = 20; // Increased node count for better connectivity
      const nodes: Node[] = [];
      
      // Create nodes distributed evenly across the canvas with some clustering
      const cols = 5;
      const rows = 4;
      
      for (let i = 0; i < nodeCount; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        // Calculate cluster center position
        const clusterX = (col / (cols - 1)) * width * 0.8 + width * 0.1;
        const clusterY = (row / (rows - 1)) * height * 0.8 + height * 0.1;
        
        // Add some randomness around the cluster center
        const spreadX = width * 0.15;
        const spreadY = height * 0.15;
        
        nodes.push({
          x: clusterX + (Math.random() - 0.5) * spreadX,
          y: clusterY + (Math.random() - 0.5) * spreadY,
          radius: 2 + Math.random() * 3,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }

      nodesRef.current = nodes;
    };

    // Update edges dynamically based on current node positions
    const updateEdges = (width: number, height: number) => {
      const nodes = nodesRef.current;
      const maxDistance = Math.min(width, height) * 0.25; // Connection distance
      const edges: Edge[] = [];
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Connect nodes that are within the connection distance
          if (distance < maxDistance) {
            edges.push({ from: nodes[i], to: nodes[j] });
          }
        }
      }
      
      edgesRef.current = edges;
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
      
      // Initialize scene with new dimensions
      initScene(displayWidth, displayHeight);
    };

    // Update node positions (subtle movement)
    const updateNodes = (width: number, height: number) => {
      nodesRef.current.forEach((node) => {
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

      if (width === 0 || height === 0) return;

      // Clear canvas using CSS pixel dimensions (context is already scaled)
      ctx.clearRect(0, 0, width, height);

      // Update node positions
      updateNodes(width, height);

      // Update edges based on current node positions (dynamic connections)
      updateEdges(width, height);

      // Draw edges (thin lines with low opacity)
      ctx.strokeStyle = "rgba(230, 228, 223, 0.15)"; // Warm off-white hairline
      ctx.lineWidth = 0.5;
      
      edgesRef.current.forEach((edge) => {
        ctx.beginPath();
        ctx.moveTo(edge.from.x, edge.from.y);
        ctx.lineTo(edge.to.x, edge.to.y);
        ctx.stroke();
      });

      // Draw nodes (circles)
      ctx.fillStyle = "rgba(230, 228, 223, 0.2)"; // Warm off-white, slightly more visible
      
      nodesRef.current.forEach((node) => {
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

