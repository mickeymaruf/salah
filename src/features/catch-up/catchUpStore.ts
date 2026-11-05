import { create } from 'zustand';
import type { CatchUpItem } from './queue';

// The queue is a snapshot taken when the app opened. Answers are saved to the prayer log as they are given.
interface CatchUpState {
  queue: CatchUpItem[];
  start: (queue: CatchUpItem[]) => void;
  clear: () => void;
}

export const useCatchUpStore = create<CatchUpState>((set) => ({
  queue: [],
  start: (queue) => set({ queue }),
  clear: () => set({ queue: [] }),
}));
