import type { GraphNode, GraphEdge, GraphScene, NormalizedScene } from "./types";

/**
 * Convert normalized coordinates (0-1) to pixel coordinates
 */
export function normalizedToPixels(
  nx: number,
  ny: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: nx * canvasWidth,
    y: ny * canvasHeight,
  };
}

/**
 * Convert a normalized scene to a runtime GraphScene with pixel coordinates
 */
export function denormalizeScene(
  normalizedScene: NormalizedScene,
  canvasWidth: number,
  canvasHeight: number
): GraphScene {
  const defaultRadius = normalizedScene.defaults?.nodeRadius ?? 3;
  const defaultMass = normalizedScene.defaults?.nodeMass ?? 1;
  const defaultEdgeWeight = normalizedScene.defaults?.edgeWeight ?? 1;

  const nodes: GraphNode[] = normalizedScene.nodes.map((node) => {
    const { x, y } = normalizedToPixels(
      node.nx,
      node.ny,
      canvasWidth,
      canvasHeight
    );

    // Generate small random velocities for non-fixed nodes
    const isFixed = node.fixed ?? false;
    const vx = isFixed ? 0 : (Math.random() - 0.5) * 0.3;
    const vy = isFixed ? 0 : (Math.random() - 0.5) * 0.3;

    return {
      id: node.id,
      label: node.label,
      type: node.type,
      x,
      y,
      vx,
      vy,
      radius: node.radius ?? defaultRadius,
      mass: node.mass ?? defaultMass,
      fixed: isFixed,
      opacity: node.opacity ?? 1,
      meta: node.meta,
    };
  });

  const edges: GraphEdge[] = normalizedScene.edges.map((edge) => ({
    id: edge.id,
    from: edge.from,
    to: edge.to,
    weight: edge.weight ?? defaultEdgeWeight,
    opacity: edge.opacity ?? 1,
    meta: edge.meta,
  }));

  return {
    id: normalizedScene.id,
    nodes,
    edges,
    camera: normalizedScene.camera,
    ambient: normalizedScene.ambient,
    onEnterPulses: normalizedScene.onEnterPulses,
  };
}

/**
 * Get a node by ID from a scene
 */
export function getNodeById(scene: GraphScene, nodeId: string): GraphNode | undefined {
  return scene.nodes.find((node) => node.id === nodeId);
}

/**
 * Get an edge by ID from a scene
 */
export function getEdgeById(scene: GraphScene, edgeId: string): GraphEdge | undefined {
  return scene.edges.find((edge) => edge.id === edgeId);
}

