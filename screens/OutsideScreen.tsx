import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useVillage } from "../store/useVillage";
import { PixelFlower } from "../components/PixelArt";
import { PixelButton, Label, Sheet } from "../components/PixelUI";
import { Landscape } from "../components/Landscape";
import { localDay } from "../store/model";
export function OutsideScreen({
  night,
  onCreate,
  onEnterHouse,
}: {
  night: number;
  onCreate: () => void;
  onEnterHouse: () => void;
}) {
  const history = useVillage((s) => s.history),
    prune = useVillage((s) => s.prune);
  const [selected, setSelected] = useState<string | null>(null);
  const bloom = history.find((b) => b.id === selected);
  const hasToday = history.some((b) => b.date === localDay());
  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View className="px-6 pt-5 gap-2">
          <Label>OUTSIDE / YOUR PERMANENT GARDEN</Label>
          <Text className="font-pixel text-bark text-3xl font-bold">
            Welcome back to your garden.
          </Text>
          <Text className="font-pixel text-bark text-sm leading-6 opacity-75">
            Your patch is just as you left it.{"\n"}Tap a flower to revisit it.
          </Text>
        </View>
        <Landscape night={night} onEnterHouse={onEnterHouse} />
        <View
          className="mx-4 p-4 border-2 border-b-8"
          style={{ backgroundColor: "#DFA66E", borderColor: "#9E451C" }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-pixel font-bold text-xs text-bark">
              YOUR LITTLE PATCH
            </Text>
            <Text className="font-pixel text-[10px] text-bark">
              {history.length} DAYS GROWN
            </Text>
          </View>
          <View
            className="flex-row flex-wrap"
            style={{
              backgroundColor: "#C9874C",
              padding: 3,
              borderWidth: 2,
              borderColor: "#9E451C",
            }}
          >
            {history.map((b) => (
              <Pressable
                key={b.id}
                accessibilityRole="button"
                accessibilityLabel={`${b.date}, ${b.feeling}${b.feeling === "heavy" && !b.pruned ? ", weeds to prune" : ""}${b.pruned ? ", pruned" : ""}`}
                onPress={() => setSelected(b.id)}
                style={({ pressed }) => ({
                  width: "14.285714%",
                  minHeight: 78,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: pressed ? "#D69356" : "#CF8A4C",
                  borderWidth: 2,
                  borderColor: "#9E451C",
                })}
              >
                <PixelFlower
                  shape={b.shape}
                  color={b.color}
                  size={42}
                  weedy={b.feeling === "heavy" && !b.pruned}
                  glow={b.feeling === "bright"}
                />
                <Text
                  className="font-pixel text-[9px]"
                  style={{ color: "#FFF4E3" }}
                >
                  {Number(b.date.slice(-2))}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="flex-row justify-between mt-3">
            <Text className="font-pixel text-[9px] text-bark">✦ bright</Text>
            <Text className="font-pixel text-[9px] text-bark">
              ❧ needs tending
            </Text>
            <Text className="font-pixel text-[9px] text-bark">
              tap to reflect
            </Text>
          </View>
        </View>
        <View className="m-6 p-5 gap-4 border-2 border-b-4 border-bark bg-cream">
          <View className="flex-row justify-between">
            <Text className="font-pixel text-bark font-bold text-lg flex-1">
              {hasToday
                ? "Today's flower is planted."
                : "Ready for today's flower?"}
            </Text>
            <Text className="font-pixel text-moss text-xl">✿</Text>
          </View>
          <Text className="font-pixel text-bark text-sm leading-6">
            {hasToday
              ? "Your flower is planted. Tap it to revisit your words, or give your pot a little color."
              : "Choose a flower, add a short entry, and plant it in your patch."}
          </Text>
          <PixelButton
            label={hasToday ? "OPEN POT STUDIO →" : "PLANT TODAY +"}
            onPress={onCreate}
          />
          <PixelButton
            light
            label="VISIT THE COTTAGE →"
            onPress={onEnterHouse}
          />
        </View>
        <Text className="text-center font-pixel text-[9px] text-bark">
          GARDEN READY.
        </Text>
      </ScrollView>
      {bloom && (
        <Sheet
          title="Garden entry"
          onClose={() => setSelected(null)}
        >
          <View className="items-center gap-3">
            <PixelFlower
              size={120}
              shape={bloom.shape}
              color={bloom.color}
              weedy={bloom.feeling === "heavy" && !bloom.pruned}
              glow={bloom.feeling === "bright"}
            />
            <Label>
              {bloom.date} · {bloom.feeling}
            </Label>
          </View>
          <Text className="font-pixel text-bark text-base leading-7">
            {bloom.journal || "No words saved for this day."}
          </Text>
          <Text className="font-pixel text-bark text-xs leading-5 opacity-70">
            This entry stays private on this device. Pruning only updates the
            flower.
          </Text>
          {bloom.feeling === "heavy" && (
            <PixelButton
              label={bloom.pruned ? "PRUNED WITH CARE ✓" : "PRUNE WEEDS ✂"}
              disabled={bloom.pruned}
              onPress={() => prune(bloom.id)}
            />
          )}
        </Sheet>
      )}
    </>
  );
}
