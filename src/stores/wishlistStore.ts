import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistEntry {
  handle: string;
  variantId: string | null;
}

interface WishlistStore {
  entries: WishlistEntry[];
  handles: string[];
  hydrated: boolean;
  toggle: (handle: string, variantId?: string | null) => void;
  has: (handle: string, variantId?: string | null) => boolean;
  remove: (handle: string, variantId?: string | null) => void;
  setEntries: (entries: WishlistEntry[]) => void;
  setHandles: (handles: string[]) => void;
  setHydrated: (hydrated: boolean) => void;
  clear: () => void;
}

function entryKey(entry: WishlistEntry) {
  return `${entry.handle}::${entry.variantId ?? "product"}`;
}

type PersistedWishlistV0 = {
  handles?: string[];
};

type PersistedWishlistV1 = {
  entries?: WishlistEntry[];
  handles?: string[];
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      entries: [],
      handles: [],
      hydrated: false,

      toggle: (handle, variantId = null) =>
        set((state) => {
          const key = entryKey({ handle, variantId });

          const exists = state.entries.some(
            (entry) => entryKey(entry) === key,
          );

          const entries = exists
            ? state.entries.filter((entry) => entryKey(entry) !== key)
            : [...state.entries, { handle, variantId }];

          return {
            entries,
            handles: [...new Set(entries.map((entry) => entry.handle))],
          };
        }),

      has: (handle, variantId = null) =>
        get().entries.some(
          (entry) => entryKey(entry) === entryKey({ handle, variantId }),
        ),

      remove: (handle, variantId) =>
        set((state) => {
          const entries =
            variantId === undefined
              ? state.entries.filter((entry) => entry.handle !== handle)
              : state.entries.filter(
                  (entry) =>
                    entryKey(entry) !== entryKey({ handle, variantId }),
                );

          return {
            entries,
            handles: [...new Set(entries.map((entry) => entry.handle))],
          };
        }),

      setEntries: (entries) =>
        set({
          entries: entries.filter(
            (entry, index, all) =>
              all.findIndex((candidate) => entryKey(candidate) === entryKey(entry)) ===
              index,
          ),
          handles: [...new Set(entries.map((entry) => entry.handle))],
        }),

      setHandles: (handles) => {
        const uniqueHandles = [...new Set(handles)];

        set({
          entries: uniqueHandles.map((handle) => ({
            handle,
            variantId: null,
          })),
          handles: uniqueHandles,
        });
      },

      setHydrated: (hydrated) => set({ hydrated }),

      clear: () => set({
        entries: [],
        handles: [],
        hydrated: false,
      }),
    }),
    {
      name: "miravika-wishlist",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (version === 0) {
          const legacy = persistedState as PersistedWishlistV0;
          const handles = [...new Set(legacy.handles ?? [])];

          return {
            entries: handles.map((handle) => ({
              handle,
              variantId: null,
            })),
            handles,
          } satisfies PersistedWishlistV1;
        }

        const current = persistedState as PersistedWishlistV1;
        const entries = current.entries ?? [];
        const handles =
          current.handles ??
          [...new Set(entries.map((entry) => entry.handle))];

        return {
          entries,
          handles,
        } satisfies PersistedWishlistV1;
      },
      partialize: (state) => ({
        entries: state.entries,
        handles: state.handles,
      }),
    },
  ),
);
