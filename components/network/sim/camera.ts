import type { Camera } from "../graph/types";
import { easeInOutCubic } from "./transition";

export interface CameraState {
  cx: number; // center x in normalized coords (0-1)
  cy: number; // center y in normalized coords (0-1)
  zoom: number;
}

export interface CameraTransition {
  from: CameraState;
  to: CameraState;
  startTime: number;
  duration: number;
  progress: number;
  isActive: boolean;
}

const DEFAULT_CAMERA: CameraState = {
  cx: 0.5,
  cy: 0.5,
  zoom: 1.0,
};

/**
 * Convert scene camera to camera state
 */
export function sceneCameraToState(camera: Camera | undefined): CameraState {
  if (!camera) return DEFAULT_CAMERA;
  return {
    cx: camera.cx,
    cy: camera.cy,
    zoom: camera.zoom,
  };
}

/**
 * Start camera transition
 */
export function startCameraTransition(
  from: CameraState,
  to: CameraState,
  duration: number = 900
): CameraTransition {
  return {
    from,
    to,
    startTime: performance.now(),
    duration,
    progress: 0,
    isActive: true,
  };
}

/**
 * Update camera transition
 */
export function updateCameraTransition(
  transition: CameraTransition,
  nowMs: number
): CameraTransition {
  const elapsed = nowMs - transition.startTime;
  const progress = Math.min(elapsed / transition.duration, 1);
  const easedProgress = easeInOutCubic(progress);

  return {
    ...transition,
    progress: easedProgress,
    isActive: progress < 1,
  };
}

/**
 * Get current camera state from transition
 */
export function getCurrentCamera(transition: CameraTransition | null): CameraState {
  if (!transition || !transition.isActive) {
    return transition?.to || DEFAULT_CAMERA;
  }

  const t = transition.progress;
  return {
    cx: transition.from.cx + (transition.to.cx - transition.from.cx) * t,
    cy: transition.from.cy + (transition.to.cy - transition.from.cy) * t,
    zoom: transition.from.zoom + (transition.to.zoom - transition.from.zoom) * t,
  };
}

/**
 * Apply camera transform to canvas context
 */
export function applyCameraTransform(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Calculate center in pixels
  const centerX = camera.cx * canvasWidth;
  const centerY = camera.cy * canvasHeight;

  // Apply transform: translate to center, scale, translate back
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-centerX, -centerY);
}

