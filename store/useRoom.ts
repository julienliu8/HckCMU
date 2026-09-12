import { create } from "zustand";
import { Platform } from "react-native";
import { Gift, validateGift } from "./gifting";
const defaultApi =
  process.env.EXPO_PUBLIC_DEMO_API_URL ||
  (Platform.OS === "web" && typeof window !== "undefined"
    ? `http://${window.location.hostname}:8787`
    : "http://localhost:8787");
type RoomState = {
  person: string;
  mode: "local" | "live";
  api: string;
  room: string;
  gifts: Gift[];
  localGifts: Gift[];
  error: string;
  connected: boolean;
  pending: boolean;
  setPerson: (id: string) => void;
  configure: (patch: Partial<Pick<RoomState, "mode" | "api" | "room">>) => void;
  refresh: () => Promise<void>;
  send: (gift: Gift) => Promise<boolean>;
};
let generation = 0;
async function request(api: string, path: string, body?: Gift) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${api.replace(/\/$/, "")}${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Room request failed");
    return data;
  } finally {
    clearTimeout(timer);
  }
}
export const useRoom = create<RoomState>((set, get) => ({
  person: "you",
  mode: "local",
  api: defaultApi,
  room: "hackathon",
  gifts: [],
  localGifts: [],
  error: "",
  connected: false,
  pending: false,
  setPerson: (person) => set({ person }),
  configure: (patch) => {
    generation++;
    set({
      ...patch,
      error: "",
      connected: false,
      gifts: patch.mode === "local" ? get().localGifts : [],
    });
  },
  refresh: async () => {
    const { mode, api, room } = get();
    if (mode !== "live") return;
    const ticket = generation;
    try {
      const data = await request(api, `/api/rooms/${encodeURIComponent(room)}`);
      if (ticket === generation)
        set({
          gifts: data.gifts.map(validateGift),
          connected: true,
          error: "",
        });
    } catch {
      if (ticket === generation)
        set({
          connected: false,
          error:
            "Cannot reach the live room. Start the demo server and check its address, or use This device.",
        });
    }
  },
  send: async (input) => {
    if (get().pending) return false;
    const gift = validateGift(input);
    const { mode, api, room } = get();
    const ticket = generation;
    set({ pending: true, error: "" });
    try {
      if (mode === "local") {
        set((s) => {
          const next = [
            ...s.localGifts.filter((g) => g.id !== gift.id),
            gift,
          ].slice(-100);
          return { localGifts: next, gifts: next };
        });
      } else {
        await request(
          api,
          `/api/rooms/${encodeURIComponent(room)}/gifts`,
          gift,
        );
        if (ticket === generation) await get().refresh();
      }
      return true;
    } catch {
      if (ticket === generation)
        set({
          error:
            "Flower was not confirmed. Check the connection and try again.",
          connected: false,
        });
      return false;
    } finally {
      set({ pending: false });
    }
  },
}));
