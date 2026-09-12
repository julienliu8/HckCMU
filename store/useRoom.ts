import { create } from "zustand";
import { Platform } from "react-native";
import { Gift, validateGift } from "./gifting";
const defaultApi =
  process.env.EXPO_PUBLIC_DEMO_API_URL ||
  (Platform.OS === "web" && typeof window !== "undefined"
    ? `http://${window.location.hostname}:8787`
    : "http://localhost:8787");
type RoomState = {
  api: string;
  room: string;
  gifts: Gift[];
  error: string;
  connected: boolean;
  pending: boolean;
  setApi: (api: string) => void;
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
  api: defaultApi,
  room: "bloom-village",
  gifts: [],
  error: "",
  connected: false,
  pending: false,
  setApi: (api) => {
    generation++;
    set({
      api: api.trim(),
      error: "",
      connected: false,
    });
  },
  refresh: async () => {
    const { api, room } = get();
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
            "Cannot reach the flower post. Start the demo server and check the server address.",
        });
    }
  },
  send: async (input) => {
    if (get().pending) return false;
    const gift = validateGift(input);
    const { api, room } = get();
    const ticket = generation;
    set({ pending: true, error: "" });
    try {
      await request(api, `/api/rooms/${encodeURIComponent(room)}/gifts`, gift);
      if (ticket === generation) await get().refresh();
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
