import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Bloom,
  Shape,
  Feeling,
  Pixels,
  createHistory,
  makePot,
  mockFriends,
  paintPixel,
  localDay,
  palette,
} from "./model";
type VillageState = {
  history: Bloom[];
  friends: typeof mockFriends;
  pot: Pixels;
  draft: { shape: Shape; color: string; feeling: Feeling; journal: string };
  hydrated: boolean;
  storageError: boolean;
  setHydrated: (error?: boolean) => void;
  setDraft: (patch: Partial<VillageState["draft"]>) => void;
  paint: (row: number, col: number, color: string | null) => void;
  resetPot: () => void;
  trim: (id: string) => void;
  plant: () => boolean;
};
export const useVillage = create<VillageState>()(
  persist(
    (set, get) => ({
      history: createHistory(),
      friends: mockFriends,
      pot: makePot(),
      draft: {
        shape: "daisy",
        color: palette[0],
        feeling: "quiet",
        journal: "",
      },
      hydrated: false,
      storageError: false,
      setHydrated: (error = false) =>
        set({ hydrated: true, storageError: error }),
      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      paint: (r, c, color) =>
        set((s) => ({ pot: paintPixel(s.pot, r, c, color) })),
      resetPot: () => set({ pot: makePot() }),
      trim: (id) =>
        set((s) => ({
          history: s.history.map((b) =>
            b.id === id && b.feeling === "heavy" ? { ...b, trimmed: true } : b,
          ),
        })),
      plant: () => {
        const today = localDay();
        if (get().history.some((b) => b.date === today)) return false;
        set((s) => ({
          history: [
            ...s.history,
            { ...s.draft, id: `bloom-${today}`, date: today, trimmed: false },
          ],
          draft: { ...s.draft, journal: "" },
        }));
        return true;
      },
    }),
    {
      name: "bloom-village-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ history: s.history, pot: s.pot, draft: s.draft }),
      onRehydrateStorage: () => (state, error) => {
        if (state) state.setHydrated(!!error);
        else useVillage.setState({ hydrated: true, storageError: true });
      },
    },
  ),
);
