import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Bloom,
  Shape,
  Feeling,
  Friend,
  Pixels,
  FriendContact,
  createHistory,
  makePot,
  mockFriends,
  paintPixel,
  localDay,
  palette,
  MAX_FRIENDS,
} from "./model";
type VillageState = {
  history: Bloom[];
  friends: typeof mockFriends;
  profile: FriendContact;
  contacts: FriendContact[];
  pot: Pixels;
  draft: { shape: Shape; color: string; feeling: Feeling; journal: string };
  hydrated: boolean;
  storageError: boolean;
  setHydrated: (error?: boolean) => void;
  setDraft: (patch: Partial<VillageState["draft"]>) => void;
  setProfileName: (name: string) => void;
  addContact: (contact: FriendContact) => boolean;
  removeContact: (id: string) => void;
  paint: (row: number, col: number, color: string | null) => void;
  resetPot: () => void;
  trim: (id: string) => void;
  plant: () => boolean;
  demoFriendBloom: (friendId?: string) => { friendId: string; friendName: string } | null;
};
export const useVillage = create<VillageState>()(
  persist(
    (set, get) => ({
      history: createHistory(),
      friends: mockFriends,
      profile: {
        id: `cottage-${Math.random().toString(36).slice(2, 8)}`,
        name: "My Cottage",
      },
      contacts: [
        { id: "maya-cottage", name: "Maya" },
        { id: "ian-cottage", name: "Ian" },
      ],
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
      setProfileName: (name) =>
        set((s) => ({ profile: { ...s.profile, name: name.trim() || "My Cottage" } })),
      addContact: (contact) => {
        const id = contact.id.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
        const name = contact.name.trim();
        if (!id || !name || id === get().profile.id) return false;
        if (get().contacts.length >= MAX_FRIENDS) return false;
        if (get().contacts.some((c) => c.id === id)) return false;
        set((s) => ({
          contacts: [...s.contacts, { id, name: name.slice(0, 24) }],
        }));
        return true;
      },
      removeContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
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
      demoFriendBloom: (friendId) => {
        const shapes: Shape[] = ["daisy", "tulip", "star"];
        const friends = get().friends;
        const index = friendId
          ? friends.findIndex((friend) => friend.id === friendId)
          : Math.floor(Math.random() * friends.length);
        const friend = friends[index];
        if (!friend) return null;
        const nextFlower = {
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          color: palette[Math.floor(Math.random() * palette.length)],
        };
        set((s) => ({
          friends: s.friends.map((item) =>
            item.id === friend.id
              ? {
                  ...item,
                  flowers: [...item.flowers.slice(1), nextFlower] as Friend["flowers"],
                }
              : item,
          ),
        }));
        return { friendId: friend.id, friendName: friend.name };
      },
    }),
    {
      name: "pruned-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        history: s.history,
        pot: s.pot,
        draft: s.draft,
        profile: s.profile,
        contacts: s.contacts,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (state) state.setHydrated(!!error);
        else useVillage.setState({ hydrated: true, storageError: true });
      },
    },
  ),
);
