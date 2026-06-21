import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistStore {
  handles: string[];
  toggle: (handle: string) => void;
  has: (handle: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      handles: [],
      toggle: (handle) =>
        set((s) => ({
          handles: s.handles.includes(handle) ? s.handles.filter((h) => h !== handle) : [...s.handles, handle],
        })),
      has: (handle) => get().handles.includes(handle),
      clear: () => set({ handles: [] }),
    }),
    { name: "miravika-wishlist", storage: createJSONStorage(() => localStorage) },
  ),
);
