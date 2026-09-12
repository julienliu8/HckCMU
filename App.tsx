import "./global.css";
import React, { useEffect, useState } from "react";
import { Image, Platform, View, Text, Pressable } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  ReduceMotion,
} from "react-native-reanimated";
import { useVillageClock } from "./hooks/useVillageClock";
import { useVillage } from "./store/useVillage";
import { OutsideScreen } from "./screens/OutsideScreen";
import { InsideScreen } from "./screens/InsideScreen";
import { CreatorScreen } from "./screens/CreatorScreen";
import { PixelFlower } from "./components/PixelArt";
type Place = "outside" | "inside" | "creator";

const startingFlowers = [
  { left: "8%", bottom: 102, shape: "daisy", color: "#F7C948", size: 52 },
  { left: "20%", bottom: 142, shape: "tulip", color: "#F5822A", size: 46 },
  { left: "32%", bottom: 108, shape: "sunflower", color: "#F7C948", size: 50 },
  { left: "46%", bottom: 158, shape: "rose", color: "#D94F70", size: 44 },
  { left: "60%", bottom: 116, shape: "daisy", color: "#FFF4E3", size: 50 },
  { left: "73%", bottom: 148, shape: "tulip", color: "#F5822A", size: 46 },
  { left: "86%", bottom: 106, shape: "star", color: "#F7C948", size: 52 },
  { left: "14%", bottom: 178, shape: "lavender", color: "#D94F70", size: 34 },
  { left: "38%", bottom: 188, shape: "daisy", color: "#F5822A", size: 32 },
  { left: "66%", bottom: 184, shape: "sunflower", color: "#F7C948", size: 34 },
  { left: "82%", bottom: 176, shape: "rose", color: "#FFF4E3", size: 36 },
] as const;

const startingClouds = [
  { left: "7%", top: 82, scale: 0.9 },
  { left: "61%", top: 150, scale: 0.72 },
  { left: "34%", top: 238, scale: 0.58 },
] as const;

export default function App() {
  const [place, setPlace] = useState<Place>("outside");
  const [entered, setEntered] = useState(false);
  const { now, night } = useVillageClock();
  const hydrated = useVillage((s) => s.hydrated),
    storageError = useVillage((s) => s.storageError);
  const sky = useSharedValue(night);
  useEffect(() => {
    sky.value = withTiming(night, {
      duration: 2000,
      reduceMotion: ReduceMotion.System,
    });
  }, [night]);
  const bg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      sky.value,
      [0, 1],
      ["#D7F0E8", "#414858"],
    ),
  }));
  return (
    <SafeAreaProvider>
      <StatusBar style={night > 0.5 ? "light" : "dark"} />
      <Animated.View
        style={[
          { flex: 1, backgroundColor: "#050505" },
          Platform.OS === "web" ? null : bg,
        ]}
      >
        <SafeAreaView
          className="flex-1"
          edges={["top", "bottom", "left", "right"]}
        >
          {!entered ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enter Pruned"
              onPress={() => setEntered(true)}
              className="flex-1 w-full self-center overflow-hidden"
              style={{
                maxWidth: 520,
              }}
            >
              <LinearGradient
                pointerEvents="none"
                colors={
                  night > 0.5
                    ? ["#243B59", "#6D91B0"]
                    : ["#4D91C4", "#BFE8F9"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
              {startingClouds.map((cloud, i) => (
                <View
                  key={`cloud-${i}`}
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: cloud.left,
                    top: cloud.top,
                    width: 104,
                    height: 32,
                    opacity: night > 0.5 ? 0.3 : 0.82,
                    transform: [{ scale: cloud.scale }],
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      left: 14,
                      bottom: 0,
                      width: 76,
                      height: 18,
                      backgroundColor: "#FFF8EA",
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      left: 2,
                      bottom: 0,
                      width: 30,
                      height: 12,
                      backgroundColor: "#FFF8EA",
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      left: 30,
                      top: 2,
                      width: 30,
                      height: 20,
                      backgroundColor: "#FFF8EA",
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      left: 56,
                      top: 8,
                      width: 26,
                      height: 14,
                      backgroundColor: "#FFF8EA",
                    }}
                  />
                </View>
              ))}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 210,
                  backgroundColor: night > 0.5 ? "#4F663C" : "#95BE61",
                  borderTopWidth: 6,
                  borderColor: night > 0.5 ? "#283D2B" : "#6B8E3B",
                }}
              />
              {startingFlowers.map((flower, i) => (
                <View
                  key={`${flower.shape}-${i}`}
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: flower.left,
                    bottom: flower.bottom,
                  }}
                >
                  <PixelFlower
                    shape={flower.shape}
                    color={flower.color}
                    size={flower.size}
                  />
                </View>
              ))}
              <View className="flex-1 items-center justify-center px-8">
                <View
                  className="items-center border-2 border-b-8 border-bark px-8 py-7"
                  style={{
                    backgroundColor: night > 0.5 ? "#FFF2DCCC" : "#FFF8EADD",
                  }}
                >
                  <Image
                    source={require("./assets/logo.png")}
                    accessibilityLabel="Pruned logo"
                    resizeMode="contain"
                    style={{ width: 104, height: 104 }}
                  />
                  <Text className="font-pixel text-3xl font-bold text-bark mt-4">
                    Pruned
                  </Text>
                  <Text className="font-pixel text-[9px] text-moss mt-3 tracking-widest text-center">
                    A SOFTER PLACE TO LAND
                  </Text>
                </View>
                <Text
                  className="font-pixel text-[10px] mt-8 text-center"
                  style={{ color: night > 0.5 ? "#FFF8EA" : "#662305" }}
                >
                  TAP ANYWHERE TO ENTER
                </Text>
              </View>
            </Pressable>
          ) : (
          <View
            className="flex-1 w-full self-center"
            style={{
              maxWidth: 520,
              backgroundColor: place === "inside" ? "#F9E8CB" : "#FFF2DC",
            }}
          >
            <View className="px-5 pt-4 pb-3 border-b-2 border-[#D8B58A]">
              <View className="flex-row justify-between items-center gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Return to garden"
                  onPress={() => setPlace("outside")}
                  className="flex-row items-center gap-2 active:opacity-80"
                >
                  <Image
                    source={require("./assets/logo.png")}
                    accessibilityLabel="Pruned logo"
                    resizeMode="contain"
                    style={{ width: 32, height: 32 }}
                  />
                  <View>
                    <Text className="font-pixel text-lg font-bold text-bark">
                      Pruned
                    </Text>
                    <Text className="font-pixel text-[8px] text-bark mt-1 tracking-widest">
                      A SOFTER PLACE TO LAND
                    </Text>
                  </View>
                </Pressable>
                <Text className="font-pixel text-[9px] text-bark">
                  {night > 0.5 ? "☾" : "☀"}{" "}
                  {now.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
            {!hydrated ? (
              <View className="flex-1 items-center justify-center">
                <Text className="font-pixel text-bark">
                  Opening the garden…
                </Text>
              </View>
            ) : (
              <>
                <View className="flex-1">
                  {place === "outside" ? (
                    <OutsideScreen
                      night={night}
                      onCreate={() => setPlace("creator")}
                      onEnterHouse={() => setPlace("inside")}
                    />
                  ) : place === "inside" ? (
                    <InsideScreen
                      night={night}
                      onExitHouse={() => setPlace("outside")}
                    />
                  ) : (
                    <CreatorScreen onDone={() => setPlace("outside")} />
                  )}
                </View>
                {storageError && (
                  <Text
                    accessibilityRole="alert"
                    className="font-pixel p-2 text-xs text-bark bg-peach"
                  >
                    Local storage is unavailable. Changes may not survive a
                    restart.
                  </Text>
                )}
                <View className="flex-row gap-2 p-3 border-t-2 border-[#D8B58A] bg-cream">
                  {(
                    [
                      { id: "creator", label: "CREATE", icon: "+" },
                    ] as const
                  ).map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="tab"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected: place === item.id }}
                      onPress={() => setPlace(item.id)}
                      className="flex-1 flex-row gap-2 items-center justify-center py-3 border-2"
                      style={{
                        backgroundColor:
                          place === item.id ? "#6B8E3B" : "#FFF2DC",
                        borderColor: place === item.id ? "#662305" : "#D8B58A",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          color: place === item.id ? "#FFF8EA" : "#662305",
                        }}
                      >
                        {item.icon}
                      </Text>
                      <Text
                        className="font-pixel text-[10px] font-bold"
                        style={{
                          color: place === item.id ? "#FFF8EA" : "#662305",
                        }}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </View>
          )}
        </SafeAreaView>
      </Animated.View>
    </SafeAreaProvider>
  );
}
