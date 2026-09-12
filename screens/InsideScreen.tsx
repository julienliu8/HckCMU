import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useVillage } from "../store/useVillage";
import { Friend } from "../store/model";
import { MultiplayerPanel } from "../components/MultiplayerPanel";
import { PixelBouquet } from "../components/PixelArt";
import { Label, PixelButton, Sheet } from "../components/PixelUI";
function Vase({ friend, spark = 0 }: { friend: Friend; spark?: number }) {
  return <PixelBouquet flowers={friend.flowers} pot={friend.pot} spark={spark} />;
}

function RingForBloom({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ring for bloom"
      onPress={onPress}
      className="items-center active:opacity-80"
      style={({ pressed }) => ({
        width: 76,
        height: 66,
        transform: [{ translateY: pressed ? 2 : 0 }],
      })}
    >
      <View
        style={{
          width: 44,
          height: 34,
          marginTop: 8,
          backgroundColor: "#F7C948",
          borderWidth: 3,
          borderColor: "#662305",
        }}
      >
        <View
          style={{
            position: "absolute",
            left: 12,
            top: -9,
            width: 14,
            height: 9,
            backgroundColor: "#F4D8B2",
            borderWidth: 3,
            borderColor: "#662305",
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 15,
            top: 10,
            width: 8,
            height: 8,
            backgroundColor: "#FFF4E3",
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 12,
            top: 18,
            width: 14,
            height: 5,
            backgroundColor: "#9E451C",
          }}
        />
      </View>
      <Text className="font-pixel text-[8px] text-bark mt-1">
        RING FOR BLOOM
      </Text>
    </Pressable>
  );
}

export function InsideScreen({
  night,
  onExitHouse,
}: {
  night: number;
  onExitHouse: () => void;
}) {
  const friends = useVillage((s) => s.friends);
  const demoFriendBloom = useVillage((s) => s.demoFriendBloom);
  const [selected, setSelected] = useState<string | null>(null);
  const [sparkByFriend, setSparkByFriend] = useState<Record<string, number>>({});
  const [sent, setSent] = useState(false);
  const [demoNotice, setDemoNotice] = useState("");
  const friend = friends.find((f) => f.id === selected);
  const bloomForDemo = (friendId?: string) => {
    const result = demoFriendBloom(friendId);
    if (!result) return;
    setSparkByFriend((sparks) => ({
      ...sparks,
      [result.friendId]: (sparks[result.friendId] ?? 0) + 1,
    }));
    setDemoNotice(`${result.friendName}'s vase bloomed.`);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };
  const prune = () => {
    if (friend) {
      setSparkByFriend((sparks) => ({
        ...sparks,
        [friend.id]: (sparks[friend.id] ?? 0) + 1,
      }));
    }
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
    setSent(true);
    if (Platform.OS !== "web")
      Alert.alert(
        "Notification sent!",
        "Demo only — no real notification was sent.",
      );
  };
  return (
    <>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 32, gap: 22 }}
        showsVerticalScrollIndicator={false}
      >
        <Label>INSIDE / THE FRIENDSHIP SHELF</Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Step outside to your garden"
          onPress={onExitHouse}
          className="self-start border-2 border-b-4 border-[#9E451C] px-3 py-2 bg-[#F4D1A8]"
        >
          <Text className="font-pixel text-[10px] text-bark">↩ COTTAGE DOOR</Text>
        </Pressable>
        <View className="gap-2">
          <Text className="text-bark text-3xl font-bold">
            Keep your people close.
          </Text>
          <Text className="text-bark text-sm leading-6 opacity-75">
            Three little flowers. A glimpse of their days.{"\n"}A gentle way to
            say, “I’m here.”
          </Text>
        </View>
        <MultiplayerPanel />
        <Label>SEEDED FRIENDSHIP SHELF</Label>
        <View
          className="border-2 border-b-8 border-bark"
          style={{
            backgroundColor: "#F0C98F",
            paddingTop: 18,
            paddingBottom: 16,
          }}
        >
          <View
            className="self-center border-4 border-bark mb-2"
            style={{
              width: 98,
              height: 70,
              backgroundColor: night > 0.5 ? "#4D586D" : "#9EDAF0",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 14,
                width: 15,
                height: 15,
                backgroundColor: "#FBE1A3",
              }}
            />
            <View
              className="absolute bg-bark"
              style={{ width: 4, height: "100%", left: 43 }}
            />
            <View
              className="absolute bg-bark"
              style={{ height: 4, width: "100%", top: 30 }}
            />
          </View>
          <View className="items-center mb-2">
            <RingForBloom onPress={() => bloomForDemo()} />
            {demoNotice.length > 0 && (
              <Text
                accessibilityRole="alert"
                className="font-pixel text-[9px] text-moss mt-1"
              >
                {demoNotice.toUpperCase()}
              </Text>
            )}
          </View>
          <View className="flex-row flex-wrap justify-center">
            {friends.map((f, i) => (
              <View
                key={f.id}
                style={{
                  width: i === 2 ? "100%" : "50%",
                  alignItems: "center",
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${f.name}'s pot`}
                  onPress={() => {
                    setSelected(f.id);
                    setSent(false);
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    alignItems: "center",
                  })}
                >
                  <Vase friend={f} spark={sparkByFriend[f.id] ?? 0} />
                  <Text className="font-pixel font-bold text-xs text-bark mb-2">
                    {f.name}
                  </Text>
                </Pressable>
                <View
                  style={{
                    height: 13,
                    width: "100%",
                    backgroundColor: "#9E451C",
                    borderTopWidth: 4,
                    borderBottomWidth: 3,
                    borderColor: "#662305",
                  }}
                />
                <View style={{ width: 9, height: 11, backgroundColor: "#662305" }} />
              </View>
            ))}
          </View>
          <Text className="font-pixel text-[8px] text-center text-bark mt-4">
            OLDEST ↙ THREE RECENT DAYS ↗ NEWEST
          </Text>
        </View>
        <View className="p-4 border-l-4 border-moss bg-cream gap-2">
          <Text className="text-bark font-bold">A tiny act of care.</Text>
          <Text className="text-bark text-sm leading-6">
            Tap a pot to prune a friend’s vase. Their words stay private; the
            flowers are what they share.
          </Text>
        </View>
        <Text className="font-pixel text-[9px] text-bark text-center">
          FRIENDSHIP SHELF · FLOWER POST BELOW
        </Text>
      </ScrollView>
      {friend && (
        <Sheet
          title={`${friend.name}’s little corner`}
          onClose={() => setSelected(null)}
        >
          <View className="items-center">
            <Vase friend={friend} spark={sparkByFriend[friend.id] ?? 0} />
            <Label>{friend.note}</Label>
          </View>
          <Text className="text-center text-bark leading-6">
            A little tending, just to let them know{"\n"}you’re thinking of
            them.
          </Text>
          <PixelButton label="PRUNE VASE ✦" onPress={prune} />
          <PixelButton
            light
            label="RING FOR BLOOM"
            onPress={() => bloomForDemo(friend.id)}
          />
          {sent && (
            <View
              accessibilityRole="alert"
              className="p-4 border-2 border-moss bg-[#E2E8C9] gap-2"
            >
              <Text className="font-pixel font-bold text-bark">
                Notification sent!
              </Text>
              <Text className="text-bark text-xs">
                Demo only — no real notification was sent.
              </Text>
            </View>
          )}
        </Sheet>
      )}
    </>
  );
}
