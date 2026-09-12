import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { useRoom } from "../store/useRoom";
import { useVillage } from "../store/useVillage";
import { Gift } from "../store/gifting";
import { MAX_FRIENDS, Shape, palette } from "../store/model";
import { PixelBouquet, PixelFlower } from "./PixelArt";
import { PixelButton, Label, Sheet } from "./PixelUI";

export function MultiplayerPanel() {
  const { gifts, error, pending, refresh, send } = useRoom();
  const pot = useVillage((s) => s.pot);
  const draft = useVillage((s) => s.draft);
  const profile = useVillage((s) => s.profile);
  const contacts = useVillage((s) => s.contacts);
  const setProfileName = useVillage((s) => s.setProfileName);
  const addContact = useVillage((s) => s.addContact);
  const removeContact = useVillage((s) => s.removeContact);

  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState(contacts[0]?.id ?? "");
  const [shape, setShape] = useState<Shape>(draft.shape);
  const [color, setColor] = useState(draft.color);
  const [receipt, setReceipt] = useState("");
  const [attempt, setAttempt] = useState<Gift | null>(null);
  const [nameInput, setNameInput] = useState(profile.name);
  const [friendName, setFriendName] = useState("");
  const [friendCode, setFriendCode] = useState("");

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      await refresh();
      if (active) timer = setTimeout(poll, 1200);
    };
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [refresh]);

  useEffect(() => {
    if (!contacts.some((c) => c.id === recipient)) {
      setRecipient(contacts[0]?.id ?? "");
    }
  }, [contacts, recipient]);

  const received = useMemo(
    () => gifts.filter((g) => g.recipientId === profile.id),
    [gifts, profile.id],
  );
  const friendLimitReached = contacts.length >= MAX_FRIENDS;

  const senders = [...new Set(received.map((g) => g.senderId))];
  const begin = (id?: string) => {
    const next = id || contacts[0]?.id;
    if (!next) return;
    setRecipient(next);
    setShape(draft.shape);
    setColor(draft.color);
    setAttempt(null);
    setReceipt("");
    setOpen(true);
  };

  const normalizeCode = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32);

  return (
    <View className="border-2 border-moss bg-cream p-4 gap-4">
      <Label>FRIENDS / FLOWER POST</Label>
      <Text className="text-xs text-bark leading-5">
        Add a friend code, then send flowers right from your shelf.
      </Text>

      <View className="gap-2">
        <Text className="font-pixel text-[10px] text-bark">YOUR COTTAGE NAME</Text>
        <TextInput
          accessibilityLabel="Your cottage name"
          value={nameInput}
          onChangeText={setNameInput}
          maxLength={24}
          className="border border-bark p-3 text-bark text-sm"
          onBlur={() => setProfileName(nameInput)}
        />
        <Text className="font-pixel text-[10px] text-bark">
          YOUR FRIEND CODE: {profile.id}
        </Text>
      </View>

      <View className="border-t border-[#D8B58A] pt-4 gap-2">
        <Text className="font-pixel text-xs text-bark">
          YOUR FRIENDS · {contacts.length}/{MAX_FRIENDS}
        </Text>
        {!contacts.length ? (
          <Text className="text-xs text-bark leading-5">
            Add a friend to start sharing flowers across devices.
          </Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {contacts.map((f) => (
              <View
                key={f.id}
                className="border border-[#D8B58A] bg-[#FFF1DA] px-3 py-2"
              >
                <Text className="text-bark text-xs font-bold">{f.name}</Text>
                <Text className="font-pixel text-[9px] text-bark opacity-70">
                  {f.id}
                </Text>
                <View className="flex-row gap-2 mt-2">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Send to ${f.name}`}
                    onPress={() => begin(f.id)}
                    className="border border-moss px-2 py-1 bg-[#E7F2D2]"
                  >
                    <Text className="font-pixel text-[9px] text-bark">SEND</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${f.name}`}
                    onPress={() => removeContact(f.id)}
                    className="border border-[#9E451C] px-2 py-1 bg-[#FAD7B6]"
                  >
                    <Text className="font-pixel text-[9px] text-bark">REMOVE</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
        <View className="gap-2 border-2 border-[#D8B58A] bg-[#FCE7CC] p-3">
          <Text className="font-pixel text-[10px] text-bark">ADD A FRIEND</Text>
          <Text className="text-xs text-bark leading-5">
            {friendLimitReached
              ? `Your shelf has room for ${MAX_FRIENDS} friends. Remove one to make space for someone new.`
              : `There is room for ${MAX_FRIENDS - contacts.length} more ${
                  MAX_FRIENDS - contacts.length === 1 ? "friend" : "friends"
                }.`}
          </Text>
          <TextInput
            accessibilityLabel="Friend name"
            value={friendName}
            onChangeText={setFriendName}
            maxLength={24}
            editable={!friendLimitReached}
            className="border border-bark p-2 text-bark text-xs"
            placeholder="Friend name"
            placeholderTextColor="#866648"
          />
          <TextInput
            accessibilityLabel="Friend code"
            value={friendCode}
            onChangeText={(v) => setFriendCode(normalizeCode(v))}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={32}
            editable={!friendLimitReached}
            className="border border-bark p-2 text-bark text-xs"
            placeholder="friend code"
            placeholderTextColor="#866648"
          />
          <PixelButton
            light
            label={friendLimitReached ? "SHELF FULL" : "SAVE FRIEND +"}
            disabled={friendLimitReached}
            onPress={() => {
              if (addContact({ id: friendCode, name: friendName })) {
                setFriendName("");
                setFriendCode("");
                setReceipt("Friend added. You can send flowers now.");
              } else {
                setReceipt(
                  friendLimitReached
                    ? `Your shelf has room for ${MAX_FRIENDS} friends.`
                    : "Could not add friend. Check name/code and try again.",
                );
              }
            }}
          />
        </View>
      </View>

      <PixelButton
        label="SEND A FLOWER →"
        onPress={() => begin()}
        disabled={pending || contacts.length === 0}
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
          ARRIVALS FOR {profile.name.toUpperCase()} · {received.length}
        </Text>
        {!received.length ? (
          <Text className="text-xs text-bark leading-5">
            Your shelf is waiting for its first flower.
          </Text>
        ) : (
          senders.map((senderId) => {
            const blooms = received.filter((g) => g.senderId === senderId).slice(-3);
            const latest = blooms[blooms.length - 1];
            const senderName = latest.senderName || senderId;
            return (
              <View
                key={senderId}
                className="flex-row items-center gap-3 bg-[#F4D8B2] p-3"
              >
                <PixelBouquet
                  flowers={blooms}
                  pot={latest.pot}
                  spark={Date.parse(latest.createdAt)}
                  width={112}
                  height={130}
                  flowerSize={60}
                  potSize={100}
                  potLeft={7}
                  potTop={35}
                  placements={[
                    { left: 6, top: 26 },
                    { left: 28, top: 14 },
                    { left: 50, top: 2 },
                  ]}
                />
                <View className="flex-1 gap-2">
                  <Text className="text-bark font-bold">From {senderName}</Text>
                  <Text className="text-xs text-bark leading-5">
                    {blooms.length} recent {blooms.length === 1 ? "flower" : "flowers"}.
                  </Text>
                  <Text className="font-pixel text-[9px] text-moss">
                    A LITTLE BLOOM ARRIVED
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {open && (
        <Sheet
          title={`Send a flower as ${profile.name}`}
          onClose={() => {
            if (!pending) setOpen(false);
          }}
        >
          <Label>CHOOSE A FRIEND</Label>
          <View className="flex-row gap-2 flex-wrap">
            {contacts.map((f) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Send to ${f.name}`}
                accessibilityState={{ selected: recipient === f.id }}
                key={f.id}
                disabled={pending}
                onPress={() => {
                  setRecipient(f.id);
                  setAttempt(null);
                }}
                className="border-2 p-3"
                style={{
                  borderColor: recipient === f.id ? "#6B8E3B" : "#D8B58A",
                  backgroundColor: recipient === f.id ? "#E7F2D2" : "#FFF4E3",
                }}
              >
                <Text className="text-bark">{f.name}</Text>
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
            Sharing: this flower and your painted pot.{"\n"}Your journal text stays private.
          </Text>
          <PixelButton
            label={
              pending
                ? "SENDING…"
                : `SEND TO ${(contacts.find((c) => c.id === recipient)?.name || "FRIEND").toUpperCase()} →`
            }
            disabled={pending || !recipient}
            onPress={async () => {
              const gift = attempt ?? {
                id: `gift-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
                senderId: profile.id,
                senderName: profile.name,
                recipientId: recipient,
                shape,
                color,
                pot: pot.map((row) => [...row]),
                createdAt: new Date().toISOString(),
              };
              setAttempt(gift);
              if (await send(gift)) {
                setReceipt(
                  `Delivered to ${contacts.find((c) => c.id === recipient)?.name || "your friend"}!`,
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
