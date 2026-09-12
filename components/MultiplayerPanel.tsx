import React, { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { useRoom } from "../store/useRoom";
import { useVillage } from "../store/useVillage";
import { demoPeople, personName, Gift } from "../store/gifting";
import { Shape, palette } from "../store/model";
import { PixelFlower, PixelPot, Spark } from "./PixelArt";
import { PixelButton, Label, Sheet } from "./PixelUI";
export function MultiplayerPanel() {
  const {
    person,
    mode,
    api,
    room,
    gifts,
    error,
    connected,
    pending,
    setPerson,
    configure,
    refresh,
    send,
  } = useRoom();
  const pot = useVillage((s) => s.pot),
    draft = useVillage((s) => s.draft);
  const [open, setOpen] = useState(false),
    [recipient, setRecipient] = useState("maya");
  const [shape, setShape] = useState<Shape>(draft.shape),
    [color, setColor] = useState(draft.color);
  const [receipt, setReceipt] = useState(""),
    [address, setAddress] = useState(api),
    [code, setCode] = useState(room);
  const [attempt, setAttempt] = useState<Gift | null>(null);
  useEffect(() => {
    if (mode !== "live") return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      await refresh();
      if (active) timer = setTimeout(poll, 1000);
    };
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [mode, api, room]);
  const received = gifts.filter((g) => g.recipient === person);
  const senders = [...new Set(received.map((g) => g.sender))];
  const begin = () => {
    setRecipient(demoPeople.find((p) => p.id !== person)!.id);
    setShape(draft.shape);
    setColor(draft.color);
    setAttempt(null);
    setReceipt("");
    setOpen(true);
  };
  return (
    <View className="border-2 border-moss bg-cream p-4 gap-4">
      <Label>MULTIPLAYER / PASS A LITTLE KINDNESS</Label>
      <View className="flex-row gap-2">
        {(["local", "live"] as const).map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === value }}
            onPress={() => {
              configure({ mode: value });
              setReceipt("");
            }}
            className="flex-1 border-2 p-3 items-center"
            style={{
              borderColor: "#6B8E3B",
              backgroundColor: mode === value ? "#E7F2D2" : "#FFF4E3",
            }}
          >
            <Text className="font-pixel text-[10px] text-bark">
              {value === "local" ? "THIS DEVICE" : "LIVE ROOM"}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text className="text-xs text-bark leading-5">
        {mode === "local"
          ? "Send a flower, then switch to your friend to see it arrive."
          : "Open this app on another screen, choose a different person, and join the same room."}{" "}
        Demo identities apply only to flower exchanges; your journal stays on
        this device.
      </Text>
      {mode === "live" && (
        <View className="gap-2">
          <Text className="font-pixel text-[10px] text-bark">
            {connected ? "● CONNECTED" : "○ NOT CONNECTED"} · {room}
          </Text>
          <TextInput
            accessibilityLabel="Demo server address"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
            autoCorrect={false}
            className="border border-bark p-3 text-bark text-xs"
          />
          <TextInput
            accessibilityLabel="Room code"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={32}
            className="border border-bark p-3 text-bark text-xs"
          />
          <PixelButton
            light
            label="JOIN ROOM"
            disabled={
              !/^[a-zA-Z0-9-]{1,32}$/.test(code) ||
              !/^https?:\/\//.test(address)
            }
            onPress={() => configure({ api: address.trim(), room: code })}
          />
        </View>
      )}
      <Text className="font-pixel text-[10px] text-bark">
        DEMO PERSON: {personName(person).toUpperCase()}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {demoPeople.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={`Play as ${p.name}`}
            accessibilityState={{ selected: person === p.id }}
            onPress={() => {
              setPerson(p.id);
              setReceipt("");
            }}
            className="border px-3 py-3"
            style={{
              borderColor: "#6B8E3B",
              backgroundColor: p.id === person ? "#E7F2D2" : "#FFF4E3",
            }}
          >
            <Text className="text-xs text-bark">{p.name}</Text>
          </Pressable>
        ))}
      </View>
      <PixelButton
        label="SEND A FLOWER →"
        onPress={begin}
        disabled={pending || (mode === "live" && !connected)}
      />
      {receipt.length > 0 && (
        <Text accessibilityRole="alert" className="text-sm text-moss font-bold">
          {receipt}
        </Text>
      )}
      {error.length > 0 && (
        <Text accessibilityRole="alert" className="text-xs text-bark leading-5">
          {error}
        </Text>
      )}
      <View className="border-t border-[#D8B58A] pt-4 gap-3">
        <Text className="font-pixel text-xs text-bark">
          ARRIVALS FOR {personName(person).toUpperCase()} · {received.length}
        </Text>
        {!received.length ? (
          <Text className="text-xs text-bark leading-5">
            Your shelf is waiting. Send a flower from another demo person to
            fill it.
          </Text>
        ) : (
          senders.map((sender) => {
            const blooms = received
              .filter((g) => g.sender === sender)
              .slice(-3);
            const latest = blooms[blooms.length - 1];
            return (
              <View
                key={sender}
                className="flex-row items-center gap-3 bg-[#F4D8B2] p-3"
              >
                <View style={{ width: 112, height: 130 }}>
                  {blooms.map((g, i) => (
                    <View
                      key={g.id}
                      style={{
                        position: "absolute",
                        left: 6 + i * 22,
                        top: 26 - i * 12,
                      }}
                    >
                      <PixelFlower shape={g.shape} color={g.color} size={60} />
                    </View>
                  ))}
                  <View style={{ position: "absolute", left: 7, top: 35 }}>
                    <PixelPot pixels={latest.pot} size={100} />
                  </View>
                  <Spark trigger={Date.parse(latest.createdAt)} />
                </View>
                <View className="flex-1 gap-2">
                  <Text className="text-bark font-bold">
                    From {personName(sender)}
                  </Text>
                  <Text className="text-xs text-bark leading-5">
                    {blooms.length} recent{" "}
                    {blooms.length === 1 ? "flower" : "flowers"} in their
                    painted pot.
                  </Text>
                  <Text className="font-pixel text-[9px] text-moss">
                    {mode === "live"
                      ? "RECEIVED FROM LIVE ROOM"
                      : "RECEIVED IN SIMULATION"}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
      {open && (
        <Sheet
          title={`Send a flower as ${personName(person)}`}
          onClose={() => {
            if (!pending) setOpen(false);
          }}
        >
          <Label>CHOOSE SOMEONE TO BRIGHTEN THEIR DAY</Label>
          <View className="flex-row gap-2 flex-wrap">
            {demoPeople
              .filter((p) => p.id !== person)
              .map((p) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Send to ${p.name}`}
                  accessibilityState={{ selected: recipient === p.id }}
                  key={p.id}
                  disabled={pending}
                  onPress={() => {
                    setRecipient(p.id);
                    setAttempt(null);
                  }}
                  className="border-2 p-3"
                  style={{
                    borderColor: recipient === p.id ? "#6B8E3B" : "#D8B58A",
                    backgroundColor: recipient === p.id ? "#E7F2D2" : "#FFF4E3",
                  }}
                >
                  <Text className="text-bark">{p.name}</Text>
                </Pressable>
              ))}
          </View>
          <View className="flex-row justify-center gap-4">
            {(["daisy", "tulip", "star"] as Shape[]).map((s) => (
              <Pressable
                key={s}
                accessibilityRole="button"
                accessibilityLabel={`Gift ${s}`}
                disabled={pending}
                onPress={() => {
                  setShape(s);
                  setAttempt(null);
                }}
                style={{
                  borderWidth: 2,
                  borderColor: shape === s ? "#6B8E3B" : "transparent",
                }}
              >
                <PixelFlower shape={s} color={color} size={66} />
              </Pressable>
            ))}
          </View>
          <View className="flex-row gap-2 flex-wrap">
            {palette.map((c) => (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={`Gift color ${c}`}
                disabled={pending}
                onPress={() => {
                  setColor(c);
                  setAttempt(null);
                }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: c,
                  borderWidth: color === c ? 3 : 0,
                  borderColor: "#662305",
                }}
              />
            ))}
          </View>
          <Text className="text-bark text-sm leading-6">
            Sharing: this flower and your painted pot.{"\n"}Your journal text
            and past entries are never included.
          </Text>
          <PixelButton
            label={
              pending
                ? "SENDING…"
                : `SEND TO ${personName(recipient).toUpperCase()} →`
            }
            disabled={pending}
            onPress={async () => {
              const gift = attempt ?? {
                id: `gift-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
                sender: person,
                recipient,
                shape,
                color,
                pot: pot.map((row) => [...row]),
                createdAt: new Date().toISOString(),
              };
              setAttempt(gift);
              if (await send(gift)) {
                setReceipt(
                  `Delivered to ${personName(recipient)}! ${mode === "local" ? "Switch to them below to see it." : "Watch their live shelf."}`,
                );
                setOpen(false);
              }
            }}
          />
          {error.length > 0 && (
            <Text accessibilityRole="alert" className="text-bark text-xs">
              {error}
            </Text>
          )}
        </Sheet>
      )}
    </View>
  );
}
