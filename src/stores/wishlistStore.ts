import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistStore {
  handles: string[];
  hydrated: boolean;
  toggle: (handle: string) => void;
  has: (handle: string) => boolean;
  remove: (handle: string) => void;
  setHandles: (handles: string[]) => void;
  setHydrated: (hydrated: boolean) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      handles: [],
      hydrated: false,
      toggle: (handle) =>
        set((s) => ({
          handles: s.handles.includes(handle)
            ? s.handles.filter((h) => h !== handle)
            : [...s.handles, handle],
        })),
      has: (handle) => get().handles.includes(handle),
      remove: (handle) =>
        set((s) => ({
          handles: s.handles.filter((h) => h !== handle),
        })),
      setHandles: (handles) => set({ handles: [...new Set(handles)] }),
      setHydrated: (hydrated) => set({ hydrated }),
      clear: () => set({ handles: [], hydrated: false }),
    }),
    { name: "miravika-wishlist", storage: createJSONStorage(() => localStorage) },
  ),
);
