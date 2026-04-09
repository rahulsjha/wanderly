import { create } from 'zustand';

import { DEFAULT_START, type TimeOfDay } from '@/lib/time';

type PlanState = {
  placeIds: string[];
  checkLaterIds: string[];
  lastRemoved?: { id: string; index: number };
  journeyStartTime: TimeOfDay;

  isInPlan: (placeId: string) => boolean;
  isCheckLater: (placeId: string) => boolean;
  add: (placeId: string) => void;
  remove: (placeId: string) => void;
  toggleCheckLater: (placeId: string) => void;
  removeCheckLater: (placeId: string) => void;
  removeAt: (index: number) => void;
  reorder: (next: string[]) => void;
  setJourneyStartTime: (next: TimeOfDay) => void;
  undoRemove: () => void;
  clearUndo: () => void;
};

export const usePlanStore = create<PlanState>((set, get) => ({
  placeIds: [],
  checkLaterIds: [],
  journeyStartTime: DEFAULT_START,

  isInPlan: (placeId) => get().placeIds.includes(placeId),
  isCheckLater: (placeId) => get().checkLaterIds.includes(placeId),

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

  toggleCheckLater: (placeId) =>
    set((state) => {
      if (state.checkLaterIds.includes(placeId)) {
        return {
          ...state,
          checkLaterIds: state.checkLaterIds.filter((id) => id !== placeId),
        };
      }

      return {
        ...state,
        checkLaterIds: [...state.checkLaterIds, placeId],
      };
    }),

  removeCheckLater: (placeId) =>
    set((state) => ({
      ...state,
      checkLaterIds: state.checkLaterIds.filter((id) => id !== placeId),
    })),

  removeAt: (index) =>
    set((state) => {
      if (index < 0 || index >= state.placeIds.length) return state;
      const id = state.placeIds[index];
      const next = state.placeIds.slice();
      next.splice(index, 1);
      return { ...state, placeIds: next, lastRemoved: { id, index } };
    }),

  reorder: (next) => set({ placeIds: next }),

  setJourneyStartTime: (next) => set({ journeyStartTime: next }),

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
