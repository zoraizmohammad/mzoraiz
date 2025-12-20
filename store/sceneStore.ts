import { create } from "zustand";

export type SceneId = "hero" | "domains" | "projects" | "work" | "experience" | "proof" | "notes" | "contact";
export type DomainId = "agentic-ai" | "privacy-crypto" | "hardware-signals" | "comp-bio-ml" | null;
export type ProjectId = "aws-benchmark" | "ciphershield" | "sonicsync" | "fpga-hologram" | "ml-gene-editing" | null;

export type AmbientMode = "normal" | "calm";

interface SceneState {
  currentSceneId: SceneId;
  sceneProgress: number; // 0-1 progress within current scene
  activeSectionId: SceneId | null;
  activeDomain: DomainId; // Filter for Work section
  activeProjectId: ProjectId; // Currently selected project
  hoverProjectId: ProjectId; // Currently hovered project
  highlightNodeIds: Set<string>; // Node IDs to highlight in canvas
  ambientMode: AmbientMode; // Canvas ambient motion mode
  setCurrentSceneId: (id: SceneId) => void;
  setSceneProgress: (progress: number) => void;
  setActiveSectionId: (id: SceneId | null) => void;
  setActiveDomain: (domain: DomainId) => void;
  setActiveProjectId: (id: ProjectId) => void;
  setHoverProjectId: (id: ProjectId) => void;
  setHighlightNodeIds: (nodeIds: string[]) => void;
  clearHighlightNodeIds: () => void;
  setAmbientMode: (mode: AmbientMode) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  currentSceneId: "hero",
  sceneProgress: 0,
  activeSectionId: null,
  activeDomain: null,
  activeProjectId: null,
  hoverProjectId: null,
  highlightNodeIds: new Set<string>(),
  ambientMode: "normal",
  setCurrentSceneId: (id) => set({ currentSceneId: id }),
  setSceneProgress: (progress) => set({ sceneProgress: Math.max(0, Math.min(1, progress)) }),
  setActiveSectionId: (id) => set({ activeSectionId: id }),
  setActiveDomain: (domain) => set({ activeDomain: domain }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setHoverProjectId: (id) => set({ hoverProjectId: id }),
  setHighlightNodeIds: (nodeIds) => set({ highlightNodeIds: new Set(nodeIds) }),
  clearHighlightNodeIds: () => set({ highlightNodeIds: new Set<string>() }),
  setAmbientMode: (mode) => set({ ambientMode: mode }),
}));

