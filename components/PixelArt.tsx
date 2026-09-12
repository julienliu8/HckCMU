import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
  ReduceMotion,
} from "react-native-reanimated";
import { Shape, Pixels } from "../store/model";

type BouquetFlower = {
  id?: string;
  shape: Shape;
  color: string;
  note?: string;
};

const defaultBouquetPlacements = [
  { left: 10, top: 50 },
  { left: 30, top: 31 },
  { left: 51, top: 12 },
];
const patterns: Record<Shape, string[]> = {
  daisy: [
    "..PPP..",
    "..PPP..",
    "PPPCPPP",
    "PPCCCPP",
    "PPPCPPP",
    "..PPP..",
    "..PPP..",
  ],
  tulip: [
    "P..P..P",
    "PP.P.PP",
    "PPPPPPP",
    ".PPPPP.",
    "..PPP..",
    "...P...",
    ".......",
  ],
  star: [
    "...P...",
    ".P.P.P.",
    "..PPP..",
    "PPPCPPP",
    "..PPP..",
    ".P.P.P.",
    "...P...",
  ],
  rose: [
    "..PPP..",
    ".PPCP..",
    "PPCCPP.",
    ".PCPPP.",
    "..PP...",
    "...P...",
    ".......",
  ],
  sunflower: [
    ".P.P.P.",
    "PPPCPPP",
    ".PCCCP.",
    "PPCCCPP",
    ".PCCCP.",
    "PPPCPPP",
    ".P.P.P.",
  ],
  lavender: [
    "...P...",
    "..PP...",
    "...PP..",
    "..PP...",
    "...PP..",
    "...P...",
    ".......",
  ],
  peony: [
    ".P.PP.P.",
    "PPPPPPPP",
    "PPPPPPPP",
    "PPPPPPPP",
    "PPPPPPPP",
    ".PPPPPP.",
    "..PPPP..",
  ],
  chamomile: [
    "....PP....",
    "...PPPP...",
    "...PPPP...",
    ".PPPPPPPP.",
    "PPPPPPPPPP",
    "PPPPCCPPPP",
    "PPPPCCPPPP",
    "PPPPPPPPPP",
    "..PPPPPP..",
    "..PPPPPP..",
    "...PPPP...",
  ],
  jasmine: [
    "....PP....",
    "...PPPP...",
    "...PPPP...",
    ".PPPPPPPP.",
    "PPPPCCPPPP",
    "PPPPCCPPPP",
    ".PPPPPPPP.",
    "..PPPPPP..",
    "..PPPPPP..",
    "....PP....",
  ],
  primrose: [
    "....PPPP..",
    "....PPPP..",
    "PPPPPPPP..",
    "PPPPPPPP..",
    "PPPPCCPPPP",
    "PPPPCCPPPP",
    "..PPPPPPPP",
    "..PPPPPPPP",
    "..PPPP....",
    "..PPPP....",
  ],
  buttercup: [
    "...PPPP...",
    "..PPPPPP..",
    "..PPPPPP..",
    "PPPCCCCPPP",
    "PPPCCCCPPP",
    "PPPCCCCPPP",
    "PPPCCCCPPP",
    "..PPPPPP..",
    "..PPPPPP..",
    "...PPPP...",
  ],
};
export function PixelFlower({
  shape,
  color,
  size = 62,
  weedy = false,
  glow = false,
}: {
  shape: Shape;
  color: string;
  size?: number;
  weedy?: boolean;
  glow?: boolean;
}) {
  const weed = useSharedValue(weedy ? 1 : 0),
    scale = useSharedValue(1);
  useEffect(() => {
    weed.value = withTiming(weedy ? 1 : 0, {
      duration: 220,
      reduceMotion: ReduceMotion.System,
    });
    if (!weedy)
      scale.value = withSequence(
        withTiming(1.14, { duration: 110, reduceMotion: ReduceMotion.System }),
        withSpring(1, { damping: 12, reduceMotion: ReduceMotion.System }),
      );
  }, [weedy]);
  const vines = useAnimatedStyle(() => ({
    opacity: weed.value,
    transform: [{ scale: weed.value }],
  }));
  const flower = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const pattern = patterns[shape];
  const headOffsetX = Math.floor((16 - pattern[0].length) / 2);
  const headOffsetY = pattern.length > 7 ? 0 : 1;
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Animated.View style={flower}>
        <Svg width={size} height={size} viewBox="0 0 16 18">
          {glow && (
            <>
              <Rect
                x="1"
                y="1"
                width="14"
                height="10"
                fill={color}
                opacity=".14"
              />
              <Rect
                x="0"
                y="3"
                width="16"
                height="6"
                fill={color}
                opacity=".1"
              />
              <Rect x="1" y="0" width="1" height="1" fill="#FFF1A2" />
              <Rect x="14" y="9" width="1" height="1" fill="#FFF1A2" />
            </>
          )}
          <Rect x="7" y="8" width="2" height="9" fill="#4C744A" />
          <Rect x="4" y="11" width="3" height="2" fill="#799358" />
          <Rect x="3" y="10" width="2" height="2" fill="#94AC6A" />
          <Rect x="9" y="13" width="3" height="2" fill="#799358" />
          {pattern.flatMap((row, y) =>
            row
              .split("")
              .map((p, x) =>
                p === "." ? null : (
                  <Rect
                    key={`${x}-${y}`}
                    x={x + headOffsetX}
                    y={y + headOffsetY}
                    width="1"
                    height="1"
                    fill={p === "C" ? "#FFF0B3" : color}
                  />
                ),
              ),
          )}
        </Svg>
      </Animated.View>
      <Animated.View style={[{ position: "absolute", inset: 0 }, vines]}>
        <Svg width={size} height={size} viewBox="0 0 16 18">
          {[
            [2, 15, 12, 1],
            [3, 12, 2, 4],
            [5, 10, 1, 4],
            [5, 10, 6, 1],
            [11, 7, 1, 4],
            [10, 7, 3, 1],
            [1, 12, 3, 1],
            [9, 13, 1, 4],
          ].map(([x, y, w, h], i) => (
            <Rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={h}
              fill={i % 2 ? "#667446" : "#425638"}
            />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}
export function PixelPot({
  pixels,
  size = 100,
}: {
  pixels: Pixels;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" pointerEvents="none">
      {pixels.flatMap((row, y) =>
        row.map((color, x) =>
          color ? (
            <Rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={color}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}
export function PixelBouquet({
  flowers,
  pot,
  spark = 0,
  width = 120,
  height = 155,
  flowerSize = 65,
  potSize = 100,
  potLeft = 10,
  potTop = 58,
  placements = defaultBouquetPlacements,
}: {
  flowers: BouquetFlower[];
  pot: Pixels;
  spark?: number;
  width?: number;
  height?: number;
  flowerSize?: number;
  potSize?: number;
  potLeft?: number;
  potTop?: number;
  placements?: { left: number; top: number }[];
}) {
  const potRimY = potTop + potSize * 0.35;
  const potCenterX = potLeft + potSize * 0.5;
  return (
    <View style={{ width, height }}>
      {flowers.map((flower, i) => {
        const place = placements[i] ?? placements[placements.length - 1];
        const stemX = place.left + flowerSize * 0.5;
        const stemBottom = place.top + flowerSize * 0.94;
        const stemWidth = Math.max(4, Math.round(flowerSize * 0.08));
        const stemEndY = potRimY + 8;
        const stemTop = Math.min(stemBottom - 2, stemEndY);
        return (
          <View
            key={`stem-${flower.id ?? i}`}
            style={{
              position: "absolute",
              left: stemX - stemWidth / 2,
              top: stemTop,
              width: stemWidth,
              height: stemEndY - stemTop,
              backgroundColor: "#4C744A",
              transform: [
                { translateX: (potCenterX - stemX) * 0.16 },
                { rotate: `${(potCenterX - stemX) * 0.08}deg` },
              ],
            }}
          />
        );
      })}
      {flowers.map((flower, i) => {
        const place = placements[i] ?? placements[placements.length - 1];
        return (
          <View
            key={flower.id ?? `${flower.shape}-${flower.color}-${i}`}
            style={{ position: "absolute", left: place.left, top: place.top }}
          >
            <PixelFlower
              shape={flower.shape}
              color={flower.color}
              size={flowerSize}
            />
          </View>
        );
      })}
      <View style={{ position: "absolute", left: potLeft, top: potTop }}>
        <PixelPot pixels={pot} size={potSize} />
      </View>
      <Spark trigger={spark} />
    </View>
  );
}
export function PixelNoteTag({
  onPress,
  read = false,
}: {
  onPress: () => void;
  read?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={read ? "Open read note" : "Open unread note"}
      onPress={onPress}
      className="items-center justify-center active:opacity-80"
      style={{
        width: 25,
        height: 20,
        backgroundColor: read ? "#EAD3AF" : "#FFF4E3",
        borderWidth: 2,
        borderColor: read ? "#B88D5C" : "#9E451C",
        opacity: read ? 0.72 : 1,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 4,
          left: 5,
          width: 11,
          height: 2,
          backgroundColor: read ? "#B88D5C" : "#D8B58A",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 9,
          left: 5,
          width: 15,
          height: 2,
          backgroundColor: read ? "#B88D5C" : "#D8B58A",
        }}
      />
      {!read && (
        <View
          style={{
            position: "absolute",
            right: -4,
            bottom: -4,
            width: 8,
            height: 8,
            backgroundColor: "#F7C948",
            borderWidth: 2,
            borderColor: "#9E451C",
          }}
        />
      )}
    </Pressable>
  );
}
export function Spark({ trigger }: { trigger: number }) {
  const p = useSharedValue(1);
  useEffect(() => {
    if (trigger) {
      p.value = 0;
      p.value = withTiming(1, {
        duration: 800,
        reduceMotion: ReduceMotion.System,
      });
    }
  }, [trigger]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - p.value,
    transform: [{ scale: 0.6 + p.value * 0.9 }, { translateY: -p.value * 22 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          inset: 0,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Svg width={130} height={130} viewBox="0 0 40 40">
        {[
          [5, 12],
          [30, 6],
          [26, 26],
          [9, 30],
          [18, 3],
        ].map(([x, y], i) => (
          <React.Fragment key={i}>
            <Rect x={x - 1} y={y} width="5" height="1" fill="#FFE49B" />
            <Rect x={x + 1} y={y - 2} width="1" height="5" fill="#FFE49B" />
          </React.Fragment>
        ))}
      </Svg>
    </Animated.View>
  );
}
