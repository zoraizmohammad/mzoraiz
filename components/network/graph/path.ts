import type { GraphScene, NodeType } from "./types";
import { buildAdjacencyMap, buildEdgeMap } from "./index";

type NodePredicate = (nodeId: string, nodeType: NodeType) => boolean;

/**
 * Find shortest paths from origin node to all nodes matching predicate using BFS
 * Returns a map of destination node id -> ordered list of edge ids
 */
export function findPaths(
  scene: GraphScene,
  originNodeId: string,
  predicate: NodePredicate,
  maxHops?: number
): Map<string, string[]> {
  const paths = new Map<string, string[]>();
  const adjacencyMap = buildAdjacencyMap(scene);
  const edgeMap = buildEdgeMap(scene);
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; pathEdgeIds: string[]; hops: number }> = [];

  // Initialize queue with origin node
  queue.push({ nodeId: originNodeId, pathEdgeIds: [], hops: 0 });
  visited.add(originNodeId);

  while (queue.length > 0) {
    const { nodeId, pathEdgeIds, hops } = queue.shift()!;

    // Check if current node matches predicate (and is not the origin)
    if (nodeId !== originNodeId) {
      const node = scene.nodes.find((n) => n.id === nodeId);
      if (node && predicate(nodeId, node.type)) {
        paths.set(nodeId, [...pathEdgeIds]);
      }
    }

    // Stop if max hops reached
    if (maxHops !== undefined && hops >= maxHops) {
      continue;
    }

    // Explore neighbors
    const neighbors = adjacencyMap.get(nodeId) || [];
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);

        // Find the edge connecting current node to neighbor
        let edgeId: string | undefined;
        for (const [eid, edge] of edgeMap.entries()) {
          if (
            (edge.from === nodeId && edge.to === neighborId) ||
            (edge.to === nodeId && edge.from === neighborId)
          ) {
            edgeId = eid;
            break;
          }
        }

        if (edgeId) {
          queue.push({
            nodeId: neighborId,
            pathEdgeIds: [...pathEdgeIds, edgeId],
            hops: hops + 1,
          });
        }
      }
    }
  }

  return paths;
}

/**
 * Helper to create a predicate for node type
 */
export function createNodeTypePredicate(targetType: NodeType): NodePredicate {
  return (nodeId: string, nodeType: NodeType) => nodeType === targetType;
}

/**
 * Helper to create a predicate for multiple node types
 */
export function createNodeTypesPredicate(targetTypes: NodeType[]): NodePredicate {
  return (nodeId: string, nodeType: NodeType) => targetTypes.includes(nodeType);
}

