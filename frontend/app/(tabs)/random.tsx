import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { Chip } from "@/src/components/Chip";
import { useToast } from "@/src/components/Toast";
import { api, type KeywordsResponse, type Meal } from "@/src/lib/api";
import { useAuth } from "@/src/context/AuthContext";
import { COLORS, RADIUS, SHADOW } from "@/src/lib/theme";

type SelKw = { countries: string[]; cooking_methods: string[]; carbs: string[]; protein: string[] };

const EMPTY_SEL: SelKw = { countries: [], cooking_methods: [], carbs: [], protein: [] };

const GROUP_TITLES: Record<keyof SelKw, string> = {
  countries: "Countries",
  cooking_methods: "Cooking Methods",
  carbs: "Carbs",
  protein: "Protein",
};

export default function Random() {
  const { me } = useAuth();
  const { show } = useToast();
  const [kw, setKw] = useState<KeywordsResponse | null>(null);
  const [sel, setSel] = useState<SelKw>(EMPTY_SEL);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api<KeywordsResponse>("/keywords").then(setKw).catch(() => {});
  }, []);

  const toggle = useCallback((group: keyof SelKw, v: string) => {
    setSel((s) => ({
      ...s,
      [group]: s[group].includes(v) ? s[group].filter((x) => x !== v) : [...s[group], v],
    }));
  }, []);

  const reset = () => {
    setSel(EMPTY_SEL);
    setMeal(null);
    setExcluded([]);
  };

  const roll = async (reroll = false) => {
    setBusy(true);
    try {
      const m = await api<Meal>("/meals/random", {
        method: "POST",
        body: { keywords: sel, exclude_ids: reroll && meal ? [...excluded, meal.id] : [] },
      });
      setMeal(m);
      if (reroll && meal) setExcluded((e) => [...e, meal.id]);
    } catch (e: any) {
      show(e?.message || "No meal matched", "error");
    } finally {
      setBusy(false);
    }
  };

  const addToToday = async () => {
    if (!meal) return;
    setAdding(true);
    try {
      await api("/logs/add", { method: "POST", body: { meal_id: meal.id } });
      show(`${meal.name} added`, "success");
    } catch (e: any) {
      show(e?.message || "Could not add", "error");
    } finally {
      setAdding(false);
    }
  };

  const purpose = me?.profile.purpose || "random";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.eyebrow}>KEYWORDS · {purpose.toUpperCase()} MODE</Text>
        <Text style={styles.h1}>Build your craving.</Text>
        <Text style={styles.sub}>Tap any chip. Leave blank for total surprise.</Text>

        {kw && (Object.keys(GROUP_TITLES) as (keyof SelKw)[]).map((g) => (
          <View key={g} style={{ marginTop: 18 }}>
            <Text style={styles.groupTitle}>{GROUP_TITLES[g]}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
              style={{ marginTop: 8 }}
            >
              {kw.groups[g].map((v) => (
                <Chip
                  key={v}
                  testID={`kw-${g}-${v}`}
                  label={v}
                  selected={sel[g].includes(v)}
                  onPress={() => toggle(g, v)}
                />
              ))}
            </ScrollView>
          </View>
        ))}

        <View style={{ flexDirection: "row", gap: 10, marginTop: 24 }}>
          <Button
            label="Reset"
            variant="secondary"
            full={false}
            onPress={reset}
            testID="random-reset-button"
            style={{ flex: 1 }}
          />
          <Button
            label={meal ? "Re-roll" : "Randomize"}
            loading={busy}
            onPress={() => roll(!!meal)}
            full={false}
            testID="random-roll-button"
            style={{ flex: 2 }}
          />
        </View>

        {meal && (
          <View style={[styles.card, SHADOW.soft]} testID="meal-card">
            {!!meal.image_url && <Image source={{ uri: meal.image_url }} style={styles.img} />}
            <View style={{ padding: 18, gap: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                </View>
                <View style={styles.calBadge}>
                  <Text style={styles.calBig}>{Math.round(meal.calories)}</Text>
                  <Text style={styles.calUnit}>kcal</Text>
                </View>
              </View>

              {!!meal.description && <Text style={styles.desc}>{meal.description}</Text>}

              <View style={styles.metaRow}>
                <Meta label="Fat" value={`${meal.fat_g}g`} />
                <Meta label="Protein" value={`${meal.protein_g}g`} />
                <Meta label="Carbs" value={`${meal.carbs_g}g`} />
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {[
                  ...meal.keywords.countries,
                  ...meal.keywords.cooking_methods,
                  ...meal.keywords.carbs,
                  ...meal.keywords.protein,
                ].slice(0, 8).map((k) => (
                  <View key={k} style={styles.tag}>
                    <Text style={styles.tagText}>{k}</Text>
                  </View>
                ))}
                {meal.low_fat && (
                  <View style={[styles.tag, { backgroundColor: COLORS.secondary }]}>
                    <Text style={[styles.tagText, { color: "#fff" }]}>low-fat</Text>
                  </View>
                )}
              </View>

              <Button
                label={`Add to Today  +${Math.round(meal.calories)} kcal`}
                onPress={addToToday}
                loading={adding}
                testID="meal-add-button"
                style={{ marginTop: 12 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  eyebrow: { fontSize: 11, color: COLORS.muted, fontWeight: "800", letterSpacing: 3 },
  h1: { fontSize: 30, fontWeight: "900", color: COLORS.text, letterSpacing: -1, marginTop: 4 },
  sub: { color: COLORS.muted, marginTop: 4 },
  groupTitle: { fontSize: 12, fontWeight: "800", color: COLORS.muted, letterSpacing: 2, textTransform: "uppercase" },
  chipRow: { gap: 8, paddingHorizontal: 2, paddingRight: 16 },
  card: {
    marginTop: 28,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  img: { width: "100%", height: 220, resizeMode: "cover" },
  mealName: { fontSize: 22, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  desc: { color: COLORS.muted, fontSize: 13, lineHeight: 20 },
  calBadge: {
    backgroundColor: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
    alignItems: "center",
  },
  calBig: { color: "#fff", fontSize: 18, fontWeight: "900" },
  calUnit: { color: "#fff", fontSize: 10, opacity: 0.8 },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  metaLabel: { fontSize: 10, color: COLORS.muted, fontWeight: "800", letterSpacing: 1.5 },
  metaValue: { fontSize: 14, color: COLORS.text, fontWeight: "700", marginTop: 2 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#F7F2EA", borderRadius: 99 },
  tagText: { fontSize: 11, color: COLORS.text, fontWeight: "600", textTransform: "capitalize" },
});
