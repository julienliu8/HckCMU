import "./global.css";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
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
      ["#DDE8D8", "#414858"],
    ),
  }));
  return (
    <SafeAreaProvider>
      <StatusBar style={night > 0.5 ? "light" : "dark"} />
      <Animated.View style={[{ flex: 1 }, bg]}>
        <SafeAreaView
          className="flex-1"
          edges={["top", "bottom", "left", "right"]}
        >
          <View
            className="flex-1 w-full self-center"
            style={{
              maxWidth: 520,
              backgroundColor: place === "inside" ? "#EFE0C5" : "#F5ECD7",
            }}
          >
            <View className="px-5 pt-4 pb-3 border-b-2 border-[#CBBF9F]">
              <View className="flex-row justify-between items-center gap-2">
                <View>
                  <Text className="font-pixel text-lg font-bold text-bark">
                    bloom village<Text className="text-moss"> ✿</Text>
                  </Text>
                  <Text className="font-pixel text-[8px] text-bark mt-1 tracking-widest">
                    A SOFTER PLACE TO LAND
                  </Text>
                </View>
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
                      onShare={() => setPlace("inside")}
                    />
                  ) : place === "inside" ? (
                    <InsideScreen night={night} />
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
                <View className="flex-row gap-2 p-3 border-t-2 border-[#CBBF9F] bg-cream">
                  {(
                    [
                      { id: "outside", label: "OUTSIDE", icon: "✿" },
                      { id: "inside", label: "INSIDE", icon: "⌂" },
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
                          place === item.id ? "#536E4D" : "#F5ECD7",
                        borderColor: place === item.id ? "#3E503A" : "#DFD2B3",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          color: place === item.id ? "#FFF4D9" : "#4D3C39",
                        }}
                      >
                        {item.icon}
                      </Text>
                      <Text
                        className="font-pixel text-[10px] font-bold"
                        style={{
                          color: place === item.id ? "#FFF4D9" : "#4D3C39",
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
        </SafeAreaView>
      </Animated.View>
    </SafeAreaProvider>
  );
}
