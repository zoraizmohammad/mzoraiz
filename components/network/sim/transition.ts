import type { GraphNode, GraphEdge, GraphScene } from "../graph/types";

export interface TransitionState {
  isActive: boolean;
  startTime: number;
  duration: number;
  fromScene: GraphScene | null;
  toScene: GraphScene;
  progress: number; // 0-1
}

export interface NodeTransition {
  node: GraphNode;
  targetX: number;
  targetY: number;
  spawnOpacity: number; // 0-1, for nodes appearing
  fadeOutOpacity: number; // 0-1, for nodes disappearing
  existsInTarget: boolean;
  existsInSource: boolean;
}

export interface EdgeTransition {
  edge: GraphEdge;
  fadeInOpacity: number; // 0-1, for edges appearing
  fadeOutOpacity: number; // 0-1, for edges disappearing
  existsInTarget: boolean;
  existsInSource: boolean;
}

/**
 * Ease in-out cubic function
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Initialize transition state
 */
export function startTransition(
  fromScene: GraphScene | null,
  toScene: GraphScene,
  duration: number = 900
): TransitionState {
  return {
    isActive: true,
    startTime: performance.now(),
    duration,
    fromScene,
    toScene,
    progress: 0,
  };
}

/**
 * Update transition progress
 */
export function updateTransition(state: TransitionState, nowMs: number): TransitionState {
  const elapsed = nowMs - state.startTime;
  const progress = Math.min(elapsed / state.duration, 1);
  const easedProgress = easeInOutCubic(progress);

  return {
    ...state,
    progress: easedProgress,
    isActive: progress < 1,
  };
}

/**
 * Create node transition states
 */
export function createNodeTransitions(
  fromScene: GraphScene | null,
  toScene: GraphScene
): Map<string, NodeTransition> {
  const transitions = new Map<string, NodeTransition>();

  // Create map of target nodes
  const targetNodeMap = new Map<string, GraphNode>();
  toScene.nodes.forEach((node) => {
    targetNodeMap.set(node.id, node);
  });

  // Process nodes from source scene
  if (fromScene) {
    fromScene.nodes.forEach((node) => {
      const targetNode = targetNodeMap.get(node.id);
      transitions.set(node.id, {
        node,
        targetX: targetNode ? targetNode.x : node.x,
        targetY: targetNode ? targetNode.y : node.y,
        spawnOpacity: 1,
        fadeOutOpacity: targetNode ? 1 : 0, // Fade out if not in target
        existsInTarget: !!targetNode,
        existsInSource: true,
      });
    });
  }

  // Process nodes that exist only in target (spawn)
  toScene.nodes.forEach((targetNode) => {
    if (!transitions.has(targetNode.id)) {
      // Node doesn't exist in source, will spawn
      transitions.set(targetNode.id, {
        node: targetNode,
        targetX: targetNode.x,
        targetY: targetNode.y,
        spawnOpacity: 0, // Start invisible, fade in
        fadeOutOpacity: 1,
        existsInTarget: true,
        existsInSource: false,
      });
    }
  });

  return transitions;
}

/**
 * Create edge transition states
 */
export function createEdgeTransitions(
  fromScene: GraphScene | null,
  toScene: GraphScene
): Map<string, EdgeTransition> {
  const transitions = new Map<string, EdgeTransition>();

  // Create map of target edges
  const targetEdgeMap = new Map<string, GraphEdge>();
  toScene.edges.forEach((edge) => {
    targetEdgeMap.set(edge.id, edge);
  });

  // Process edges from source scene
  if (fromScene) {
    fromScene.edges.forEach((edge) => {
      const targetEdge = targetEdgeMap.get(edge.id);
      transitions.set(edge.id, {
        edge,
        fadeInOpacity: 0,
        fadeOutOpacity: targetEdge ? 1 : 0, // Fade out if not in target
        existsInTarget: !!targetEdge,
        existsInSource: true,
      });
    });
  }

  // Process edges that exist only in target (fade in)
  toScene.edges.forEach((targetEdge) => {
    if (!transitions.has(targetEdge.id)) {
      transitions.set(targetEdge.id, {
        edge: targetEdge,
        fadeInOpacity: 0, // Start invisible, fade in
        fadeOutOpacity: 1,
        existsInTarget: true,
        existsInSource: false,
      });
    }
  });

  return transitions;
}

/**
 * Apply node transitions - update node target positions (physics will handle movement)
 * Opacity is updated directly on nodes
 */
export function applyNodeTransitions(
  transitions: Map<string, NodeTransition>,
  progress: number
): void {
  transitions.forEach((transition) => {
    const node = transition.node;

    // Update opacity based on spawn/fade
    if (!transition.existsInSource && transition.existsInTarget) {
      // Spawning node - fade in
      node.opacity = transition.spawnOpacity + (1 - transition.spawnOpacity) * progress;
    } else if (transition.existsInSource && !transition.existsInTarget) {
      // Fading out node - fade out
      node.opacity = transition.fadeOutOpacity * (1 - progress);
    } else {
      // Existing node - maintain opacity
      node.opacity = transition.fadeOutOpacity;
    }
  });
}

/**
 * Apply edge transitions - update edge opacities directly
 */
export function applyEdgeTransitions(
  transitions: Map<string, EdgeTransition>,
  progress: number
): void {
  transitions.forEach((transition) => {
    const edge = transition.edge;

    // Update opacity based on fade in/out
    if (!transition.existsInSource && transition.existsInTarget) {
      // Fading in edge
      edge.opacity = transition.fadeInOpacity + (1 - transition.fadeInOpacity) * progress;
    } else if (transition.existsInSource && !transition.existsInTarget) {
      // Fading out edge
      edge.opacity = transition.fadeOutOpacity * (1 - progress);
    } else {
      // Existing edge - maintain opacity
      edge.opacity = transition.fadeOutOpacity;
    }
  });
}

/**
 * Get edge opacity for rendering (deprecated - use applyEdgeTransitions instead)
 */
export function getEdgeOpacity(
  edgeTransition: EdgeTransition,
  progress: number,
  baseOpacity: number = 1
): number {
  if (!edgeTransition.existsInSource && edgeTransition.existsInTarget) {
    // Fading in edge
    return baseOpacity * (edgeTransition.fadeInOpacity + (1 - edgeTransition.fadeInOpacity) * progress);
  } else if (edgeTransition.existsInSource && !edgeTransition.existsInTarget) {
    // Fading out edge
    return baseOpacity * edgeTransition.fadeOutOpacity * (1 - progress);
  } else {
    // Existing edge
    return baseOpacity * edgeTransition.fadeOutOpacity;
  }
}

/**
 * Get nodes to remove after transition completes
 */
export function getNodesToRemove(transitions: Map<string, NodeTransition>): string[] {
  const toRemove: string[] = [];
  transitions.forEach((transition, nodeId) => {
    if (transition.existsInSource && !transition.existsInTarget) {
      toRemove.push(nodeId);
    }
  });
  return toRemove;
}

/**
 * Get edges to remove after transition completes
 */
export function getEdgesToRemove(transitions: Map<string, EdgeTransition>): string[] {
  const toRemove: string[] = [];
  transitions.forEach((transition, edgeId) => {
    if (transition.existsInSource && !transition.existsInTarget) {
      toRemove.push(edgeId);
    }
  });
  return toRemove;
}

