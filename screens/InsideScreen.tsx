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
import { PixelFlower, PixelPot, Spark } from "../components/PixelArt";
import { Label, PixelButton, Sheet } from "../components/PixelUI";
function Vase({ friend, spark = 0 }: { friend: Friend; spark?: number }) {
  return (
    <View style={{ width: 120, height: 155 }}>
      <View style={{ position: "absolute", left: 10, top: 50 }}>
        <PixelFlower {...friend.flowers[0]} size={65} />
      </View>
      <View style={{ position: "absolute", left: 30, top: 31 }}>
        <PixelFlower {...friend.flowers[1]} size={65} />
      </View>
      <View style={{ position: "absolute", left: 51, top: 12 }}>
        <PixelFlower {...friend.flowers[2]} size={65} />
      </View>
      <View style={{ position: "absolute", left: 10, top: 58 }}>
        <PixelPot pixels={friend.pot} size={100} />
      </View>
      <Spark trigger={spark} />
    </View>
  );
}
export function InsideScreen({ night }: { night: number }) {
  const friends = useVillage((s) => s.friends);
  const [selected, setSelected] = useState<string | null>(null);
  const [spark, setSpark] = useState(0);
  const [sent, setSent] = useState(false);
  const friend = friends.find((f) => f.id === selected);
  const prune = () => {
    setSpark((s) => s + 1);
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
                  <Vase friend={f} />
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
                <View
                     style={{ width: 9, height: 11, backgroundColor: "#662305" }}
                />
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
          DEMO FRIENDS · SIMULATED NOTIFICATIONS
        </Text>
      </ScrollView>
      {friend && (
        <Sheet
          title={`${friend.name}’s little corner`}
          onClose={() => setSelected(null)}
        >
          <View className="items-center">
            <Vase friend={friend} spark={spark} />
            <Label>{friend.note}</Label>
          </View>
          <Text className="text-center text-bark leading-6">
            A little tending, just to let them know{"\n"}you’re thinking of
            them.
          </Text>
          <PixelButton label="PRUNE VASE ✦" onPress={prune} />
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
