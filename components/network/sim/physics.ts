import type { GraphNode, GraphEdge, GraphScene } from "../graph/types";

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface PhysicsConfig {
  repulsionStrength?: number;
  springStrength?: number;
  damping?: number;
  anchorStrength?: number;
  anchorStrengthMultiplier?: number; // Multiply anchor strength during transitions
  boundaryPadding?: number;
  boundaryStrength?: number;
  ambientDrift?: number;
  ambientWobble?: number;
  reducedMotion?: boolean;
  intensity?: number; // 0-1, for idle reduction
  isTransitioning?: boolean; // If true, increase anchor force
}

const DEFAULT_CONFIG: Required<Omit<PhysicsConfig, 'anchorStrengthMultiplier' | 'isTransitioning'>> & { anchorStrengthMultiplier: number; isTransitioning: boolean } = {
  repulsionStrength: 0.02,
  springStrength: 0.001,
  damping: 0.95,
  anchorStrength: 0.0001, // Reduced anchor strength to allow more natural movement
  anchorStrengthMultiplier: 1.0,
  boundaryPadding: 0.06, // 6% padding
  boundaryStrength: 0.01,
  ambientDrift: 0.0001,
  ambientWobble: 0.0002,
  reducedMotion: false,
  intensity: 1.0,
  isTransitioning: false,
};

/**
 * Calculate bounds with padding
 */
function calculateBounds(
  width: number,
  height: number,
  padding: number
): Bounds {
  const padX = width * padding;
  const padY = height * padding;
  return {
    minX: padX,
    minY: padY,
    maxX: width - padX,
    maxY: height - padY,
  };
}

/**
 * Calculate distance and direction between two nodes
 */
function getDistanceAndDirection(
  node1: GraphNode,
  node2: GraphNode
): { distance: number; dx: number; dy: number } {
  const dx = node2.x - node1.x;
  const dy = node2.y - node1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return { distance, dx, dy };
}

/**
 * Apply repulsion force between nodes (inverse-square with clamp)
 */
function applyRepulsion(
  nodes: GraphNode[],
  strength: number,
  intensity: number
): void {
  const effectiveStrength = strength * intensity;
  const minDistance = 10; // Clamp minimum distance to prevent division by zero

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].fixed) continue;

    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[j].fixed) continue;

      const { distance, dx, dy } = getDistanceAndDirection(nodes[i], nodes[j]);
      const clampedDistance = Math.max(distance, minDistance);

      // Inverse-square repulsion
      const force = effectiveStrength / (clampedDistance * clampedDistance);
      const fx = (dx / clampedDistance) * force;
      const fy = (dy / clampedDistance) * force;

      nodes[i].vx -= fx / nodes[i].mass;
      nodes[i].vy -= fy / nodes[i].mass;
      nodes[j].vx += fx / nodes[j].mass;
      nodes[j].vy += fy / nodes[j].mass;
    }
  }
}

/**
 * Apply spring force along edges (Hooke's law)
 */
function applySprings(
  scene: GraphScene,
  width: number,
  height: number,
  strength: number,
  intensity: number
): void {
  const effectiveStrength = strength * intensity;
  const baseRestLength = Math.min(width, height) * 0.15; // Base rest length

  scene.edges.forEach((edge) => {
    const fromNode = scene.nodes.find((n) => n.id === edge.from);
    const toNode = scene.nodes.find((n) => n.id === edge.to);

    if (!fromNode || !toNode) return;

    const { distance, dx, dy } = getDistanceAndDirection(fromNode, toNode);
    const restLength = baseRestLength * edge.weight;

    // Hooke's law: F = -k * (x - restLength)
    const displacement = distance - restLength;
    const force = effectiveStrength * displacement;

    if (distance > 0.001) {
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      if (!fromNode.fixed) {
        fromNode.vx += fx / fromNode.mass;
        fromNode.vy += fy / fromNode.mass;
      }
      if (!toNode.fixed) {
        toNode.vx -= fx / toNode.mass;
        toNode.vy -= fy / toNode.mass;
      }
    }
  });
}

/**
 * Apply anchor force (pull nodes toward their target positions)
 * Only applies when nodes drift too far from anchor (soft constraint)
 */
function applyAnchors(
  nodes: GraphNode[],
  anchorPositions: Map<string, { x: number; y: number }>,
  strength: number,
  intensity: number,
  anchorStrengthMultiplier: number = 1.0,
  isTransitioning: boolean = false
): void {
  // Increase anchor strength during transitions
  const transitionMultiplier = isTransitioning ? 3.0 : 1.0;
  const effectiveStrength = strength * intensity * anchorStrengthMultiplier * transitionMultiplier;
  const maxDrift = isTransitioning ? 10 : 100; // Tighter constraint during transitions

  nodes.forEach((node) => {
    if (node.fixed) return;

    const anchor = anchorPositions.get(node.id);
    if (!anchor) return;

    const dx = anchor.x - node.x;
    const dy = anchor.y - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // During transitions, always apply force; otherwise only if drifted significantly
    if (isTransitioning || distance > maxDrift) {
      const force = effectiveStrength * (isTransitioning ? distance : (distance - maxDrift));
      node.vx += (dx / distance) * force / node.mass;
      node.vy += (dy / distance) * force / node.mass;
    }
  });
}

/**
 * Apply boundary forces (soft push back)
 */
function applyBoundaries(
  nodes: GraphNode[],
  bounds: Bounds,
  strength: number,
  intensity: number
): void {
  const effectiveStrength = strength * intensity;

  nodes.forEach((node) => {
    if (node.fixed) return;

    // Left boundary
    if (node.x < bounds.minX) {
      const push = (bounds.minX - node.x) * effectiveStrength;
      node.vx += push / node.mass;
    }
    // Right boundary
    if (node.x > bounds.maxX) {
      const push = (bounds.maxX - node.x) * effectiveStrength;
      node.vx += push / node.mass;
    }
    // Top boundary
    if (node.y < bounds.minY) {
      const push = (bounds.minY - node.y) * effectiveStrength;
      node.vy += push / node.mass;
    }
    // Bottom boundary
    if (node.y > bounds.maxY) {
      const push = (bounds.maxY - node.y) * effectiveStrength;
      node.vy += push / node.mass;
    }
  });
}

/**
 * Apply damping to prevent jitter
 */
function applyDamping(nodes: GraphNode[], damping: number): void {
  nodes.forEach((node) => {
    if (node.fixed) return;
    node.vx *= damping;
    node.vy *= damping;
  });
}

/**
 * Apply ambient wobble/drift
 */
function applyAmbient(
  nodes: GraphNode[],
  drift: number,
  wobble: number,
  time: number,
  intensity: number
): void {
  const effectiveDrift = drift * intensity;
  const effectiveWobble = wobble * intensity;

  nodes.forEach((node) => {
    if (node.fixed) return;

    // Subtle drift
    node.vx += (Math.random() - 0.5) * effectiveDrift;
    node.vy += (Math.random() - 0.5) * effectiveDrift;

    // Subtle wobble (sine wave based on time and node position)
    const wobbleX = Math.sin(time * 0.001 + node.x * 0.01) * effectiveWobble;
    const wobbleY = Math.cos(time * 0.001 + node.y * 0.01) * effectiveWobble;
    node.vx += wobbleX;
    node.vy += wobbleY;
  });
}

/**
 * Update node positions based on velocities
 */
function updatePositions(nodes: GraphNode[], dt: number): void {
  nodes.forEach((node) => {
    if (node.fixed) return;
    node.x += node.vx * dt;
    node.y += node.vy * dt;
  });
}

/**
 * Main physics step function
 */
export function stepPhysics(
  scene: GraphScene,
  dt: number,
  width: number,
  height: number,
  config: PhysicsConfig = {},
  anchorPositions?: Map<string, { x: number; y: number }>,
  time: number = performance.now()
): void {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const bounds = calculateBounds(width, height, finalConfig.boundaryPadding);

  // Skip physics if reduced motion is enabled
  if (finalConfig.reducedMotion) {
    finalConfig.intensity = 0.1;
    finalConfig.ambientDrift = 0;
    finalConfig.ambientWobble = 0;
  }

  // Apply forces
  applyRepulsion(scene.nodes, finalConfig.repulsionStrength, finalConfig.intensity);
  applySprings(scene, width, height, finalConfig.springStrength, finalConfig.intensity);
  
  if (anchorPositions) {
    applyAnchors(
      scene.nodes,
      anchorPositions,
      finalConfig.anchorStrength,
      finalConfig.intensity,
      finalConfig.anchorStrengthMultiplier ?? 1.0,
      finalConfig.isTransitioning ?? false
    );
  }
  
  applyBoundaries(scene.nodes, bounds, finalConfig.boundaryStrength, finalConfig.intensity);
  
  // Apply ambient effects only if not reduced motion
  if (!finalConfig.reducedMotion && scene.ambient) {
    applyAmbient(
      scene.nodes,
      scene.ambient.drift * finalConfig.ambientDrift,
      scene.ambient.wobble * finalConfig.ambientWobble,
      time,
      finalConfig.intensity
    );
  }
  
  applyDamping(scene.nodes, finalConfig.damping);
  
  // Update positions
  updatePositions(scene.nodes, dt);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

