export type NodeType = "you" | "domain" | "project" | "concept" | "proof";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x: number; // pixel position
  y: number; // pixel position
  vx: number; // velocity x
  vy: number; // velocity y
  radius: number;
  mass: number;
  fixed?: boolean; // if true, node doesn't move
  opacity?: number; // 0-1, defaults to 1
  meta?: Record<string, unknown>; // additional metadata
}

export interface GraphEdge {
  id: string;
  from: string; // node id
  to: string; // node id
  weight: number; // edge weight/thickness
  opacity?: number; // 0-1, defaults to 1
  meta?: Record<string, unknown>; // additional metadata
}

export interface Pulse {
  id: string;
  originNodeId: string;
  pathEdgeIds: string[]; // sequence of edge ids the pulse follows
  speedPxPerSec: number;
  decay: number; // how much the pulse fades per unit distance
  t0: number; // start time (timestamp or frame number)
  color?: string; // pulse color, defaults to accent
  meta?: Record<string, unknown>; // additional metadata
}

export interface Camera {
  cx: number; // center x in normalized coords (0-1)
  cy: number; // center y in normalized coords (0-1)
  zoom: number; // zoom level
}

export interface Ambient {
  drift: number; // overall drift speed
  wobble: number; // wobble amplitude
}

export interface OnEnterPulse {
  originNodeId: string;
  toNodeType?: NodeType; // pulse only to nodes of this type
  maxHops?: number; // maximum number of edges to traverse
}

export interface GraphScene {
  id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  camera?: Camera;
  ambient?: Ambient;
  onEnterPulses?: OnEnterPulse[];
}

// Normalized node/edge for scene authoring (0-1 coordinates)
export interface NormalizedNode {
  id: string;
  label: string;
  type: NodeType;
  nx: number; // normalized x (0-1)
  ny: number; // normalized y (0-1)
  radius?: number; // optional, defaults to scene default
  mass?: number; // optional, defaults to scene default
  fixed?: boolean;
  opacity?: number;
  meta?: Record<string, unknown>;
}

export interface NormalizedEdge {
  id: string;
  from: string; // node id
  to: string; // node id
  weight?: number; // optional, defaults to scene default
  opacity?: number;
  meta?: Record<string, unknown>;
}

export interface NormalizedScene {
  id: string;
  nodes: NormalizedNode[];
  edges: NormalizedEdge[];
  camera?: Camera;
  ambient?: Ambient;
  onEnterPulses?: OnEnterPulse[];
  defaults?: {
    nodeRadius?: number;
    nodeMass?: number;
    edgeWeight?: number;
  };
}

