import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useVillage } from "../store/useVillage";
import { palette } from "../store/model";
import { PixelButton } from "./PixelUI";
export function PotPainter({
  onPainting,
}: {
  onPainting: (active: boolean) => void;
}) {
  const pixels = useVillage((s) => s.pot),
    paint = useVillage((s) => s.paint),
    reset = useVillage((s) => s.resetPot);
  const [brush, setBrush] = useState<string | null>(palette[0]);
  const [width, setWidth] = useState(280);
  const draw = (x: number, y: number) =>
    paint(Math.floor((y / width) * 20), Math.floor((x / width) * 20), brush);
  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap gap-2">
        {[...palette, "#9E451C", "#662305", null].map((c, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={c ? `Paint ${c}` : "Eraser"}
            accessibilityState={{ selected: brush === c }}
            onPress={() => setBrush(c)}
            style={{
              width: 34,
              height: 34,
              backgroundColor: c ?? "#FFF4E3",
              borderWidth: brush === c ? 3 : 1,
              borderColor: "#662305",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!c && <Text className="font-pixel text-bark">×</Text>}
          </Pressable>
        ))}
      </View>
      <View
        className="self-center w-full"
        style={{
          maxWidth: 300,
          aspectRatio: 1,
          borderWidth: 2,
          borderColor: "#9E451C",
          backgroundColor: "#FFF4E3",
        }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width - 4)}
        accessibilityLabel="20 by 20 pot painting canvas. Drag or tap to paint pixels."
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          onPainting(true);
          draw(e.nativeEvent.locationX, e.nativeEvent.locationY);
        }}
        onResponderMove={(e) =>
          draw(e.nativeEvent.locationX, e.nativeEvent.locationY)
        }
        onResponderRelease={() => onPainting(false)}
        onResponderTerminate={() => onPainting(false)}
        onResponderTerminationRequest={() => false}
      >
        <View pointerEvents="none">
          <Svg width={width} height={width} viewBox="0 0 20 20">
            {pixels.flatMap((row, y) =>
              row.map((c, x) => (
                <Rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width="1"
                  height="1"
                  fill={c ?? ((x + y) % 2 ? "#F2E7D2" : "#FFF7EA")}
                  stroke="#D8B58A"
                  strokeWidth=".035"
                />
              )),
            )}
          </Svg>
        </View>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="font-pixel text-[10px] text-bark">
          20 × 20 / saved as you paint
        </Text>
        <Pressable accessibilityRole="button" onPress={reset} className="p-3">
          <Text className="font-pixel text-xs text-bark underline">Reset pot</Text>
        </Pressable>
      </View>
    </View>
  );
}
