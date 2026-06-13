import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { COLORS, RADIUS } from "@/src/lib/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  testID,
  style,
  full = true,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
  full?: boolean;
}) {
  const v = styles[variant];
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        v.bg,
        full && { width: "100%" },
        pressed && { transform: [{ scale: 0.97 }] },
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.txt.color} />
      ) : (
        <Text style={[styles.txt, v.txt]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles: any = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  txt: { fontSize: 16, fontWeight: "700" },
  primary: { bg: { backgroundColor: COLORS.primary }, txt: { color: "#fff" } },
  secondary: {
    bg: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
    txt: { color: COLORS.text },
  },
  ghost: { bg: { backgroundColor: "transparent" }, txt: { color: COLORS.text } },
  danger: { bg: { backgroundColor: COLORS.danger }, txt: { color: "#fff" } },
});
