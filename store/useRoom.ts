import { create } from "zustand";
import { NativeModules, Platform } from "react-native";
import { Gift, validateGift } from "./gifting";

function getDefaultApi() {
  if (process.env.EXPO_PUBLIC_DEMO_API_URL) {
    return process.env.EXPO_PUBLIC_DEMO_API_URL;
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `http://${window.location.hostname}:8787`;
  }

  const scriptUrl = NativeModules.SourceCode?.scriptURL as string | undefined;
  const host = scriptUrl?.match(/^https?:\/\/([^/:]+)/)?.[1];
  return host ? `http://${host}:8787` : "http://localhost:8787";
}

const defaultApi = getDefaultApi();
type RoomState = {
  api: string;
  room: string;
  gifts: Gift[];
  error: string;
  connected: boolean;
  pending: boolean;
  refresh: () => Promise<void>;
  send: (gift: Gift) => Promise<boolean>;
};
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
  refresh: async () => {
    const { api, room } = get();
    try {
      const data = await request(api, `/api/rooms/${encodeURIComponent(room)}`);
      set({
        gifts: data.gifts.map(validateGift),
        connected: true,
        error: "",
      });
    } catch {
      set({
        connected: false,
        error: "",
      });
    }
  },
  send: async (input) => {
    if (get().pending) return false;
    const gift = validateGift(input);
    const { api, room } = get();
    set({ pending: true, error: "" });
    try {
      await request(api, `/api/rooms/${encodeURIComponent(room)}/gifts`, gift);
      await get().refresh();
      return true;
    } catch {
      set({
        error: "The flower post is still waking up. Try again in a moment.",
        connected: false,
      });
      return false;
    } finally {
      set({ pending: false });
    }
  },
}));
