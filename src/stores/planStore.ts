import { create } from 'zustand';
import {
  type PlanWithDays,
  getPlans,
  createPlan,
  deletePlan,
} from '../db/plans';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlanState {
  plans: PlanWithDays[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;

  loadPlans: () => Promise<void>;
  addPlan: (name: string, description: string | null, dayIndices: number[]) => Promise<string>;
  removePlan: (planId: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  status: 'idle',
  errorMessage: null,

  loadPlans: async () => {
    set({ status: 'loading', errorMessage: null });
    try {
      const plans = await getPlans();
      set({ plans, status: 'ready' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load plans';
      set({ status: 'error', errorMessage: message });
    }
  },

  addPlan: async (name, description, dayIndices) => {
    const planId = await createPlan(name, description, dayIndices);
    // Reload to keep state in sync
    await get().loadPlans();
    return planId;
  },

  removePlan: async (planId) => {
    await deletePlan(planId);
    await get().loadPlans();
  },
}));
