import { create } from "zustand";

export type SceneId = "hero" | "domains" | "work" | "experience" | "proof" | "notes" | "contact";

interface SceneState {
  currentSceneId: SceneId;
  sceneProgress: number; // 0-1 progress within current scene
  activeSectionId: SceneId | null;
  setCurrentSceneId: (id: SceneId) => void;
  setSceneProgress: (progress: number) => void;
  setActiveSectionId: (id: SceneId | null) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  currentSceneId: "hero",
  sceneProgress: 0,
  activeSectionId: null,
  setCurrentSceneId: (id) => set({ currentSceneId: id }),
  setSceneProgress: (progress) => set({ sceneProgress: Math.max(0, Math.min(1, progress)) }),
  setActiveSectionId: (id) => set({ activeSectionId: id }),
}));

