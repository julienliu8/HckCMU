import "./global.css";
import React, { useEffect, useState } from "react";
import { Image, Platform, View, Text, Pressable } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
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
type Place = "outside" | "inside" | "creator";
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
                backgroundColor: night > 0.5 ? "#394354" : "#D7F0E8",
              }}
            >
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
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: 60,
                  right: 60,
                  bottom: 0,
                  height: 150,
                  backgroundColor: "#DFA66E",
                  borderLeftWidth: 4,
                  borderRightWidth: 4,
                  borderColor: "#9E451C",
                }}
              />
              {[42, 92, 148, 340, 396, 452].map((left, i) => (
                <View
                  key={left}
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left,
                    bottom: 94 + (i % 2) * 18,
                    width: 16,
                    height: 16,
                    backgroundColor: i % 3 === 0 ? "#F7C948" : "#F5822A",
                    borderWidth: 3,
                    borderColor: "#4C744A",
                  }}
                />
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
                    className="p-2 text-xs text-bark bg-peach"
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
