import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS } from "@/src/lib/theme";

export function Chip({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipActive]}
      hitSlop={6}
    >
      <Text style={[styles.label, selected && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  chipActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  label: { color: COLORS.text, fontSize: 13, fontWeight: "600", textTransform: "capitalize" },
  labelActive: { color: "#FFFFFF" },
});
