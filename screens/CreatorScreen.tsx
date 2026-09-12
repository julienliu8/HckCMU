import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useVillage } from "../store/useVillage";
import { Feeling, flowerShapes, palette, localDay } from "../store/model";
import { PixelFlower, PixelPot } from "../components/PixelArt";
import { PixelButton, Label } from "../components/PixelUI";
import { PotPainter } from "../components/PotPainter";
export function CreatorScreen({ onDone }: { onDone: () => void }) {
  const draft = useVillage((s) => s.draft),
    setDraft = useVillage((s) => s.setDraft),
    pot = useVillage((s) => s.pot),
    plant = useVillage((s) => s.plant),
    history = useVillage((s) => s.history);
  const [painting, setPainting] = useState(false);
  const [error, setError] = useState("");
  const planted = history.some((b) => b.date === localDay());
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        scrollEnabled={!painting}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Label>THE DAILY RITUAL / FLOWER & POT STUDIO</Label>
        <View className="gap-2">
          <Text className="font-pixel text-bark text-3xl font-bold">
            Make room for a feeling.
          </Text>
          <Text className="font-pixel text-bark text-sm leading-6">
            No right color. No perfect words. Just you.
          </Text>
        </View>
        <View className="items-center py-2 bg-[#F4D8B2] border-2 border-[#D6A775]">
          <View style={{ height: 154, width: 130 }}>
            <View style={{ position: "absolute", top: 0, left: 28 }}>
              <PixelFlower
                shape={draft.shape}
                color={draft.color}
                size={76}
                weedy={draft.feeling === "heavy"}
                glow={draft.feeling === "bright"}
              />
            </View>
            <View style={{ position: "absolute", top: 42, left: 6 }}>
              <PixelPot pixels={pot} size={120} />
            </View>
          </View>
          <Text className="font-pixel text-[9px] text-bark mb-3">
            A LITTLE PIECE OF YOU
          </Text>
        </View>
        <View className="gap-3">
          <Label>01 / CHOOSE A FLOWER</Label>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {flowerShapes.map((shape) => (
              <Pressable
                key={shape}
                accessibilityRole="button"
                accessibilityLabel={`${shape} flower`}
                accessibilityState={{ selected: draft.shape === shape }}
                onPress={() => setDraft({ shape })}
                className="items-center border-2 px-5 py-3"
                style={{
                  borderColor: draft.shape === shape ? "#6B8E3B" : "#D8B58A",
                  backgroundColor:
                    draft.shape === shape ? "#E7F2D2" : "#FFF4E3",
                }}
              >
                <PixelFlower shape={shape} color={draft.color} />
                <Text className="font-pixel text-[10px] text-bark mt-2">
                  {shape.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <View className="gap-3">
          <Label>02 / FIND YOUR COLOR</Label>
          <View className="self-center" style={{ width: 220, height: 220 }}>
            {palette.map((color, i) => {
              const angle = (i * 2 * Math.PI) / palette.length - Math.PI / 2;
              return (
                <Pressable
                  key={color}
                  accessibilityRole="button"
                  accessibilityLabel={`Flower color ${color}`}
                  accessibilityState={{ selected: draft.color === color }}
                  onPress={() => setDraft({ color })}
                  style={{
                    position: "absolute",
                    left: 88 + 80 * Math.cos(angle),
                    top: 88 + 80 * Math.sin(angle),
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: color,
                    borderWidth: draft.color === color ? 4 : 2,
                    borderColor: draft.color === color ? "#662305" : "#FFF4E3",
                  }}
                />
              );
            })}
            <View
              pointerEvents="none"
              style={{ position: "absolute", left: 78, top: 78 }}
            >
              <PixelFlower shape={draft.shape} color={draft.color} size={64} />
            </View>
          </View>
        </View>
        <View className="gap-3">
          <Label>03 / HOW DOES TODAY FEEL?</Label>
          <View className="flex-row gap-2">
            {(["bright", "quiet", "heavy"] as Feeling[]).map((feeling) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: draft.feeling === feeling }}
                accessibilityLabel={`${feeling} mood`}
                key={feeling}
                onPress={() => setDraft({ feeling })}
                className="flex-1 py-4 items-center border-2"
                style={{
                  borderColor:
                    draft.feeling === feeling ? "#6B8E3B" : "#D8B58A",
                  backgroundColor:
                    draft.feeling === feeling ? "#E7F2D2" : "#FFF4E3",
                }}
              >
                <Text className="font-pixel text-xs text-bark">{feeling}</Text>
              </Pressable>
            ))}
          </View>
          <Text className="font-pixel text-xs text-bark leading-5 opacity-75">
            Bright flowers glow. Heavy days grow vines you can tend later. Every
            flower stays.
          </Text>
        </View>
        <View className="gap-3">
          <Label>04 / A PAGE JUST FOR YOU</Label>
          <TextInput
            accessibilityLabel="Private journal"
            multiline
            maxLength={2000}
            value={draft.journal}
            onChangeText={(journal) => setDraft({ journal })}
            placeholder="What’s on your mind today?"
            placeholderTextColor="#9E7A5D"
            textAlignVertical="top"
            className="font-pixel border-2 border-[#D8B58A] bg-cream p-4 text-bark text-base"
            style={{ minHeight: 140, lineHeight: 25 }}
          />
          <Text className="font-pixel text-[9px] text-bark">
            PRIVATE ON THIS DEVICE · {draft.journal.length}/2000
          </Text>
        </View>
        <View className="gap-4">
          <Label>05 / PAINT YOUR POT</Label>
          <Text className="font-pixel text-sm text-bark leading-6">
            Pick a brush, then tap or drag over the pixels. Your pot is saved as
            you go.
          </Text>
          <PotPainter onPainting={setPainting} />
        </View>
        {error.length > 0 && (
          <Text accessibilityRole="alert" className="font-pixel text-bark">
            {error}
          </Text>
        )}
        {planted ? (
          <View className="gap-3">
            <Text className="font-pixel text-bark text-sm">
              Today’s flower is already planted. Your pot edits still save.
            </Text>
            <PixelButton label="BACK TO MY GARDEN →" onPress={onDone} />
          </View>
        ) : (
          <PixelButton
            label="PLANT TODAY’S FLOWER +"
            onPress={() => {
              if (plant()) onDone();
              else setError("Today’s flower is already planted.");
            }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
