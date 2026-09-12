import React from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export function PixelButton({
  label,
  onPress,
  disabled = false,
  light = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  light?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className="border-2 border-b-4 border-bark px-5 py-3 items-center active:opacity-80"
      style={{
        backgroundColor: light ? "#FFF4E3" : "#6B8E3B",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text
        className="font-pixel text-xs font-bold"
        style={{ color: light ? "#662305" : "#FFF8EA" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text className="font-pixel text-[10px] tracking-widest text-moss uppercase">
      {children}
    </Text>
  );
}
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "#20232CCC" }}
      >
        <SafeAreaView
          edges={["top", "bottom", "left", "right"]}
          className="w-full self-center"
          style={{
            maxWidth: 520,
            maxHeight: "95%",
            backgroundColor: "#FFF4E3",
          }}
        >
          <View className="flex-row justify-between items-center px-5 py-4 border-b-2 border-bark">
            <Text className="font-pixel font-bold text-bark text-base flex-1">
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
              onPress={onClose}
              className="w-11 h-11 items-center justify-center"
            >
              <Text className="text-bark text-2xl">×</Text>
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 24, gap: 20 }}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
