import type { GraphScene } from "./types";

/**
 * Build an adjacency map from edges
 * Returns a map where each node id maps to an array of connected node ids
 */
export function buildAdjacencyMap(scene: GraphScene): Map<string, string[]> {
  const adjacencyMap = new Map<string, string[]>();

  // Initialize all nodes
  scene.nodes.forEach((node) => {
    adjacencyMap.set(node.id, []);
  });

  // Add edges (bidirectional)
  scene.edges.forEach((edge) => {
    const fromNeighbors = adjacencyMap.get(edge.from) || [];
    const toNeighbors = adjacencyMap.get(edge.to) || [];

    if (!fromNeighbors.includes(edge.to)) {
      fromNeighbors.push(edge.to);
    }
    if (!toNeighbors.includes(edge.from)) {
      toNeighbors.push(edge.from);
    }

    adjacencyMap.set(edge.from, fromNeighbors);
    adjacencyMap.set(edge.to, toNeighbors);
  });

  return adjacencyMap;
}

/**
 * Build an edge lookup map (edge id -> edge)
 */
export function buildEdgeMap(scene: GraphScene): Map<string, { from: string; to: string }> {
  const edgeMap = new Map<string, { from: string; to: string }>();

  scene.edges.forEach((edge) => {
    edgeMap.set(edge.id, { from: edge.from, to: edge.to });
  });

  return edgeMap;
}

/**
 * Get all edges connected to a node
 */
export function getEdgesForNode(
  scene: GraphScene,
  nodeId: string
): Array<{ edgeId: string; otherNodeId: string }> {
  const edges: Array<{ edgeId: string; otherNodeId: string }> = [];

  scene.edges.forEach((edge) => {
    if (edge.from === nodeId) {
      edges.push({ edgeId: edge.id, otherNodeId: edge.to });
    } else if (edge.to === nodeId) {
      edges.push({ edgeId: edge.id, otherNodeId: edge.from });
    }
  });

  return edges;
}

