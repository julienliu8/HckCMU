# Bloom Village

Cozy pixel-art journaling prototype built with Expo Managed (SDK 57), React Native, Reanimated 4, Zustand, NativeWind 4, and react-native-safe-area-context.

## Run

Use Node.js 22.18+ (Node 24 recommended). In this folder:

```sh
npm install
npx expo start --clear
```

Scan the QR code with a compatible Expo Go app on your phone. The computer and phone should be on the same Wi-Fi; `npx expo start --tunnel` is an alternative when LAN access is blocked. Expo Go may require matching account sign-in. Press `w` for a browser preview.

For reproducible dependencies, this project includes `pnpm-lock.yaml`: use `pnpm install --frozen-lockfile` if pnpm is available.

## Demo

- **Outside:** 14 preloaded flowers dated to the previous 14 local days. Bright flowers glow, heavy flowers have vines. Tap a flower to open its journal; Trim Weeds animates the vines away and preserves the entry.
- **Inside:** three mock friends and hand-painted pots. Each vase shows exactly three overlapping flowers, ordered oldest bottom-left to newest top-right. Tap the cottage door sign to step back outside.
- **Create:** choose a flower shape, a circular color palette, and a feeling; write a private journal; paint a 20×20 pot by tapping or dragging. Eraser and Reset Pot are available. Plant once per local calendar day.
- **Clock:** live device time updates every 15 seconds and on foregrounding. The sky transitions at dawn (06:00–08:00) and dusk (18:00–20:00). Reduced-motion preferences are respected by animations.

## Files

- `components/`: pixel flowers/pots, scenery, spark effects, modal, button, and pot painter.
- `screens/`: Outside, Inside, and Creator.
- `store/model.ts`: types, seed data, pixel/date/day-night helpers.
- `store/useVillage.ts`: Zustand state, actions, AsyncStorage persistence.
- `hooks/useVillageClock.ts`: device clock and foreground refresh.

## Local data and prototype limits

Garden entries, trimmed plants, painted pot, and creator draft persist locally across reloads through AsyncStorage (browser local storage on web). Friends are mock data. There is no authentication, cloud synchronization, or real notification delivery. Local storage is not encrypted; use sample journal text for demos. The app does not infer anyone's mental health or change a past journal when trimming.

A new install seeds 14 earlier dates once. It does not invent journal entries for subsequent missed days. Stored calendar cells are chronological rather than aligned to weekday columns.

## Checks

```sh
npm run typecheck
npm test
npx expo export --platform web
```

Native haptics, keyboard behavior, and physical device safe areas require an iOS/Android device check. Browser previews do not reproduce all native behavior.

## Multiplayer hackathon demo

Use **Inside → Flower Post**:

- Set your cottage name and share your generated friend code.
- Add friends by name + friend code.
- Send flowers directly to saved friends. The receiver sees the flower and painted pot in their arrivals shelf.

Start the demo server from this folder in two steps:

```sh
npm run demo:build
npm run demo:server
```

Open `http://localhost:8787` on the laptop. For other devices on the same Wi-Fi, use the `Same Wi-Fi` URL printed by the server. Browser clients automatically use the laptop host for the API. In Expo Go, Bloom Village infers the laptop host from Metro and uses port `8787`; if needed, configure `EXPO_PUBLIC_DEMO_API_URL` before starting Expo.

The server serves the web build and gift API on port 8787. The laptop must stay running. Venue Wi-Fi isolation or a firewall may prevent phones connecting; two browser windows on the laptop are a reliable fallback. No cloud deployment or account setup is required.

### A 60-second judging demo

1. Show a heavy flower in Outside and trim its weeds while keeping its journal unchanged.
2. Open Inside in two browser windows.
3. Copy each device's friend code and add each other as friends.
4. Send a flower to your friend from one device.
5. Watch the other device's arrivals shelf fill with the flower and sender's painted pot.
6. Send a flower back. Neither exchange includes journal text.

The receiver displays up to three latest flowers per sender. Server state holds at most 100 gifts in the shared Flower Post room and resets on server restart. There is no authentication, so friend codes are for demo routing only. Use fictional names and sample artwork. This is a hackathon prototype, not a production privacy or notification system. Gift payload validation rejects journal fields and malformed artwork; retries with the same gift ID are deduplicated.


### Windows build note

Metro can fail to index dependencies inside OneDrive even when Node can read them. If you see an unresolved `expo` module despite a successful install, build from an ordinary local folder outside OneDrive. The delivered preview was built from a temporary copy outside OneDrive and its `dist` output copied back here. The source remains in this project. `pnpm-workspace.yaml` selects a hoisted dependency layout for pnpm 11.
