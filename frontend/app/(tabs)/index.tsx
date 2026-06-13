import { useCallback, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/src/components/Button";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/components/Toast";
import { api, type TodayLog } from "@/src/lib/api";
import { COLORS, RADIUS, SHADOW } from "@/src/lib/theme";

export default function Home() {
  const { me } = useAuth();
  const { show } = useToast();
  const [today, setToday] = useState<TodayLog | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const t = await api<TodayLog>("/logs/today");
      setToday(t);
    } catch (e: any) {
      // ignore at boot
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const clearAll = async () => {
    try {
      await api("/logs/clear", { method: "DELETE" });
      await load();
      show("Today cleared", "success");
    } catch (e: any) {
      show(e?.message || "Could not clear", "error");
    }
  };

  const removeEntry = async (entryId: string) => {
    try {
      await api(`/logs/entry/${entryId}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      show(e?.message || "Could not remove", "error");
    }
  };

  const target = today?.target || 0;
  const consumed = today?.consumed || 0;
  const remaining = today?.remaining ?? null;
  const pct = target ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const purpose = today?.purpose || me?.profile.purpose || "random";
  const accent = purpose === "diet" ? COLORS.dietAccent : COLORS.randomAccent;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Greeting */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.eyebrow}>HELLO {me?.email?.split("@")[0]?.toUpperCase()}</Text>
          <Text style={styles.h1}>Today&apos;s plate.</Text>
        </View>

        {/* Calorie bento */}
        <View style={[styles.bento, SHADOW.soft]}>
          <View style={styles.bentoTop}>
            <View>
              <Text style={styles.bentoLabel}>{purpose === "diet" ? "DIET TARGET (−400)" : "DAILY TARGET"}</Text>
              <Text style={styles.bentoBig}>{target ? `${target.toLocaleString()}` : "—"}</Text>
              <Text style={styles.bentoUnit}>kcal · {purpose === "diet" ? "low-fat focus" : "balanced"}</Text>
            </View>
            <View style={[styles.modeBadge, { backgroundColor: accent }]}>
              <Text style={styles.modeText}>{purpose.toUpperCase()}</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: accent }]} />
          </View>

          <View style={styles.row}>
            <Stat label="Consumed" value={`${consumed.toLocaleString()} kcal`} />
            <Stat
              label="Remaining"
              value={remaining === null ? "—" : `${Math.max(0, remaining).toLocaleString()} kcal`}
              tint={remaining !== null && remaining < 0 ? COLORS.danger : COLORS.success}
            />
          </View>

          {!target && (
            <Text style={styles.warn}>
              Complete your profile to see your daily calorie target.
            </Text>
          )}
        </View>

        {/* Big CTA */}
        <Pressable
          testID="home-randomize-button"
          onPress={() => router.push("/(tabs)/random")}
          style={({ pressed }) => [styles.cta, pressed && { transform: [{ scale: 0.98 }] }]}
        >
          <Ionicons name="dice" color="#fff" size={28} />
          <Text style={styles.ctaText}>Randomize a meal</Text>
        </Pressable>

        {/* Today's meals */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 28, marginBottom: 12 }}>
          <Text style={styles.h2}>Today&apos;s meals</Text>
          {today && today.entries.length > 0 && (
            <Pressable testID="home-clear-button" onPress={clearAll} hitSlop={8}>
              <Text style={{ color: COLORS.danger, fontWeight: "700", fontSize: 13 }}>Clear</Text>
            </Pressable>
          )}
        </View>

        {!today || today.entries.length === 0 ? (
          <View style={[styles.empty, SHADOW.soft]}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>Nothing yet today</Text>
            <Text style={styles.emptySub}>Hit Randomize to find your next meal.</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {today.entries.map((e) => (
              <View key={e.entry_id} style={[styles.entry, SHADOW.soft]} testID={`entry-${e.entry_id}`}>
                {e.image_url ? <Image source={{ uri: e.image_url }} style={styles.entryImg} /> : <View style={[styles.entryImg, { backgroundColor: COLORS.border }]} />}
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryName} numberOfLines={1}>{e.name}</Text>
                  <Text style={styles.entryCal}>{Math.round(e.calories)} kcal</Text>
                </View>
                <Pressable
                  testID={`entry-remove-${e.entry_id}`}
                  onPress={() => removeEntry(e.entry_id)}
                  hitSlop={10}
                  style={styles.removeBtn}
                >
                  <Ionicons name="close" color={COLORS.muted} size={20} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, tint ? { color: tint } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  eyebrow: { fontSize: 11, color: COLORS.muted, fontWeight: "800", letterSpacing: 3 },
  h1: { fontSize: 32, fontWeight: "900", color: COLORS.text, letterSpacing: -1, marginTop: 4 },
  h2: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  bento: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  bentoTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  bentoLabel: { fontSize: 11, color: COLORS.muted, fontWeight: "700", letterSpacing: 2 },
  bentoBig: { fontSize: 44, fontWeight: "900", color: COLORS.text, letterSpacing: -1.5, marginTop: 4 },
  bentoUnit: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  modeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.pill },
  modeText: { color: "#fff", fontWeight: "800", fontSize: 11, letterSpacing: 2 },
  progressTrack: { height: 8, backgroundColor: COLORS.border, borderRadius: 99, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 99 },
  row: { flexDirection: "row", gap: 16 },
  statLabel: { fontSize: 11, color: COLORS.muted, fontWeight: "700", letterSpacing: 2 },
  statValue: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginTop: 4 },
  warn: { color: COLORS.warning, fontSize: 12, fontWeight: "600" },
  cta: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  ctaText: { color: "#fff", fontSize: 19, fontWeight: "900", letterSpacing: -0.3 },
  empty: {
    padding: 28,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: COLORS.text },
  emptySub: { color: COLORS.muted, marginTop: 4 },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 12,
  },
  entryImg: { width: 60, height: 60, borderRadius: RADIUS.md, backgroundColor: COLORS.border },
  entryName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  entryCal: { color: COLORS.muted, marginTop: 2, fontSize: 13 },
  removeBtn: { padding: 6 },
});
