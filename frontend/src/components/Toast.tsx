import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADIUS, SHADOW } from "@/src/lib/theme";

type ToastKind = "info" | "success" | "error";
type Ctx = { show: (msg: string, kind?: ToastKind) => void };
const ToastContext = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string>("");
  const [kind, setKind] = useState<ToastKind>("info");
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const show = useCallback((m: string, k: ToastKind = "info") => {
    setMsg(m);
    setKind(k);
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    }, 2200);
  }, [opacity]);

  const bg = kind === "error" ? COLORS.danger : kind === "success" ? COLORS.secondary : COLORS.text;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[styles.wrap, { opacity, top: insets.top + 12 }]}
      >
        <View testID="toast" style={[styles.toast, { backgroundColor: bg }, SHADOW.soft]}>
          <Text style={styles.text}>{msg}</Text>
        </View>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast inside ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  toast: {
    maxWidth: "92%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
  },
  text: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
