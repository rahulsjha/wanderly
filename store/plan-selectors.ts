import type { TimeOfDay } from '@/lib/time';
import type { usePlanStore } from '@/store/plan-store';

type PlanStoreState = ReturnType<typeof usePlanStore.getState>;

export const selectPlaceIds = (s: PlanStoreState) => s.placeIds;
export const selectCheckLaterIds = (s: PlanStoreState) => s.checkLaterIds;
export const selectJourneyStartTime = (s: PlanStoreState): TimeOfDay => s.journeyStartTime;
export const selectLastRemoved = (s: PlanStoreState) => s.lastRemoved;
export const selectAddPlace = (s: PlanStoreState) => s.add;
export const selectRemovePlace = (s: PlanStoreState) => s.remove;
export const selectReorderPlaces = (s: PlanStoreState) => s.reorder;
export const selectRemoveAt = (s: PlanStoreState) => s.removeAt;
export const selectUndoRemove = (s: PlanStoreState) => s.undoRemove;
export const selectClearUndo = (s: PlanStoreState) => s.clearUndo;
export const selectSetJourneyStartTime = (s: PlanStoreState) => s.setJourneyStartTime;
export const selectToggleCheckLater = (s: PlanStoreState) => s.toggleCheckLater;
export const selectRemoveCheckLater = (s: PlanStoreState) => s.removeCheckLater;

export const makeSelectIsInPlan = (placeId: string) => (s: PlanStoreState) => s.placeIds.includes(placeId);
export const makeSelectIsCheckLater = (placeId: string) => (s: PlanStoreState) =>
  s.checkLaterIds.includes(placeId);
