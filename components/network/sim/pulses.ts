import type { Pulse } from "../graph/types";

export interface PulseState {
  pulse: Pulse;
  currentEdgeIndex: number;
  progress: number; // 0-1 progress along current edge
  totalProgress: number; // 0-1 progress through entire path
  active: boolean;
}

/**
 * Create a new pulse
 */
export function createPulse(params: {
  originNodeId: string;
  pathEdgeIds: string[];
  speedPxPerSec: number;
  decay: number;
  color?: string;
  meta?: Record<string, unknown>;
}): Pulse {
  return {
    id: `pulse-${Date.now()}-${Math.random()}`,
    originNodeId: params.originNodeId,
    pathEdgeIds: params.pathEdgeIds,
    speedPxPerSec: params.speedPxPerSec,
    decay: params.decay,
    t0: performance.now(),
    color: params.color,
    meta: params.meta,
  };
}

/**
 * Initialize pulse state from pulse
 */
export function initializePulseState(pulse: Pulse): PulseState {
  return {
    pulse,
    currentEdgeIndex: 0,
    progress: 0,
    totalProgress: 0,
    active: true,
  };
}

/**
 * Update all pulses and return their states
 */
export function updatePulses(
  pulses: Pulse[],
  nowMs: number,
  getEdgeLength: (edgeId: string) => number
): PulseState[] {
  return pulses.map((pulse) => {
    const elapsed = (nowMs - pulse.t0) / 1000; // elapsed time in seconds
    const speed = pulse.speedPxPerSec;

    let currentEdgeIndex = 0;
    let progress = 0;
    let totalDistance = 0;
    let traveledDistance = elapsed * speed;

    // Calculate total path length
    const pathLengths = pulse.pathEdgeIds.map((edgeId) => getEdgeLength(edgeId));
    const totalPathLength = pathLengths.reduce((sum, len) => sum + len, 0);

    // Find current edge and progress
    for (let i = 0; i < pulse.pathEdgeIds.length; i++) {
      const edgeLength = pathLengths[i];
      totalDistance += edgeLength;

      if (traveledDistance <= totalDistance) {
        currentEdgeIndex = i;
        const distanceInCurrentEdge = traveledDistance - (totalDistance - edgeLength);
        progress = edgeLength > 0 ? distanceInCurrentEdge / edgeLength : 0;
        break;
      }
    }

    // Check if pulse has completed
    const active = traveledDistance < totalPathLength;
    const totalProgress = totalPathLength > 0 ? traveledDistance / totalPathLength : 0;

    return {
      pulse,
      currentEdgeIndex: active ? currentEdgeIndex : pulse.pathEdgeIds.length - 1,
      progress: active ? progress : 1,
      totalProgress: Math.min(totalProgress, 1),
      active,
    };
  });
}

/**
 * Get the current position of a pulse along its path
 */
export function getPulsePosition(
  pulseState: PulseState,
  getNodePosition: (nodeId: string) => { x: number; y: number } | null,
  getEdgeLength: (edgeId: string) => number,
  edgeMap: Map<string, { from: string; to: string }>
): { x: number; y: number } | null {
  if (!pulseState.active && pulseState.totalProgress >= 1) {
    // Pulse completed, return destination node position
    const lastEdgeId = pulseState.pulse.pathEdgeIds[pulseState.pulse.pathEdgeIds.length - 1];
    const edge = edgeMap.get(lastEdgeId);
    if (edge) {
      return getNodePosition(edge.to);
    }
    return null;
  }

  const edgeId = pulseState.pulse.pathEdgeIds[pulseState.currentEdgeIndex];
  const edge = edgeMap.get(edgeId);
  if (!edge) return null;

  const fromPos = getNodePosition(edge.from);
  const toPos = getNodePosition(edge.to);
  if (!fromPos || !toPos) return null;

  // Interpolate along current edge
  const x = fromPos.x + (toPos.x - fromPos.x) * pulseState.progress;
  const y = fromPos.y + (toPos.y - fromPos.y) * pulseState.progress;

  return { x, y };
}

/**
 * Get opacity for pulse based on decay and progress
 */
export function getPulseOpacity(pulse: Pulse, totalProgress: number): number {
  return Math.max(0, 1 - totalProgress * pulse.decay);
}

