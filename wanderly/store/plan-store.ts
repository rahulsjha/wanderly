import { create } from 'zustand';

type PlanState = {
  placeIds: string[];
  lastRemoved?: { id: string; index: number };

  isInPlan: (placeId: string) => boolean;
  add: (placeId: string) => void;
  remove: (placeId: string) => void;
  removeAt: (index: number) => void;
  reorder: (next: string[]) => void;
  undoRemove: () => void;
  clearUndo: () => void;
};

export const usePlanStore = create<PlanState>((set, get) => ({
  placeIds: [],

  isInPlan: (placeId) => get().placeIds.includes(placeId),

  add: (placeId) =>
    set((state) => {
      if (state.placeIds.includes(placeId)) return state;
      return { ...state, placeIds: [...state.placeIds, placeId] };
    }),

  remove: (placeId) =>
    set((state) => {
      const index = state.placeIds.indexOf(placeId);
      if (index < 0) return state;
      const next = state.placeIds.filter((id) => id !== placeId);
      return { ...state, placeIds: next, lastRemoved: { id: placeId, index } };
    }),

  removeAt: (index) =>
    set((state) => {
      if (index < 0 || index >= state.placeIds.length) return state;
      const id = state.placeIds[index];
      const next = state.placeIds.slice();
      next.splice(index, 1);
      return { ...state, placeIds: next, lastRemoved: { id, index } };
    }),

  reorder: (next) => set({ placeIds: next }),

  undoRemove: () =>
    set((state) => {
      if (!state.lastRemoved) return state;
      const next = state.placeIds.slice();
      const insertIndex = Math.max(0, Math.min(state.lastRemoved.index, next.length));
      next.splice(insertIndex, 0, state.lastRemoved.id);
      return { ...state, placeIds: next, lastRemoved: undefined };
    }),

  clearUndo: () => set({ lastRemoved: undefined }),
}));
