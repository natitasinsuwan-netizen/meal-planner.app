import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/src/components/Button";
import { Chip } from "@/src/components/Chip";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/components/Toast";
import { api, type KeywordsResponse, type Meal, type TodayLog } from "@/src/lib/api";
import { COLORS, RADIUS, SHADOW } from "@/src/lib/theme";

type SelKw = { countries: string[]; cooking_methods: string[]; carbs: string[]; protein: string[] };
const EMPTY_SEL: SelKw = { countries: [], cooking_methods: [], carbs: [], protein: [] };

const GROUP_TITLES: Record<keyof SelKw, string> = {
  countries: "Countries",
  cooking_methods: "Cooking Methods",
  carbs: "Carbs",
  protein: "Protein",
};

function calcAge(birthday?: string | null) {
  if (!birthday) return null;
  const b = new Date(birthday);
  if (Number.isNaN(b.getTime())) return null;
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
}

export default function Home() {
  const { me } = useAuth();
  const { show } = useToast();
  const [today, setToday] = useState<TodayLog | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [kw, setKw] = useState<KeywordsResponse | null>(null);
  const [sel, setSel] = useState<SelKw>(EMPTY_SEL);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [rolling, setRolling] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const t = await api<TodayLog>("/logs/today");
      setToday(t);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { api<KeywordsResponse>("/keywords").then(setKw).catch(() => {}); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const toggle = useCallback((group: keyof SelKw, v: string) => {
    setSel((s) => ({ ...s, [group]: s[group].includes(v) ? s[group].filter((x) => x !== v) : [...s[group], v] }));
  }, []);

  const roll = async () => {
    setRolling(true);
    try {
      const m = await api<Meal>("/meals/random", {
        method: "POST",
        body: { keywords: sel, exclude_ids: meal ? [...excluded, meal.id] : [] },
      });
      if (meal) setExcluded((e) => [...e, meal.id]);
      setMeal(m);
    } catch (e: any) {
      show(e?.message || "No meal matched", "error");
    } finally {
      setRolling(false);
    }
  };

  const addToToday = async () => {
    if (!meal) return;
    setAdding(true);
    try {
      await api("/logs/add", { method: "POST", body: { meal_id: meal.id } });
      show(`${meal.name} added · +${Math.round(meal.calories)} kcal`, "success");
      await load();
      setMeal(null);
    } catch (e: any) {
      show(e?.message || "Could not add", "error");
    } finally {
      setAdding(false);
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

  const clearAll = async () => {
    try {
      await api("/logs/clear", { method: "DELETE" });
      await load();
      show("Today cleared", "success");
    } catch (e: any) {
      show(e?.message || "Could not clear", "error");
    }
  };

  const target = today?.target || 0;
  const consumed = today?.consumed || 0;
  const remaining = today?.remaining ?? null;
  const purpose = today?.purpose || me?.profile.purpose || "random";
  const age = calcAge(me?.profile.birthday);
  const profileLine = [
    me?.profile.sex ? me.profile.sex[0].toUpperCase() + me.profile.sex.slice(1) : null,
    age !== null ? `${age} years` : null,
    me?.profile.weight_kg ? `${me.profile.weight_kg}kg` : null,
    me?.profile.height_cm ? `${me.profile.height_cm}cm` : null,
  ].filter(Boolean).join(", ");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ============== Top card: header + 3 stat tiles ============== */}
        <View style={[styles.card, SHADOW.soft]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Ionicons name="home-outline" size={22} color={COLORS.text} />
              <View style={{ flex: 1 }}>
                <Text style={styles.h1}>{purpose === "diet" ? "Diet Planner" : "Random Meal Generator"}</Text>
                {!!profileLine && <Text style={styles.profileLine}>{profileLine}</Text>}
              </View>
            </View>
            <Pressable
              testID="home-edit-profile"
              onPress={() => router.push("/(tabs)/profile")}
              style={styles.editBtn}
            >
              <Ionicons name="person-outline" size={16} color={COLORS.text} />
              <Text style={styles.editTxt}>Edit{"\n"}Profile</Text>
            </Pressable>
          </View>

          <View style={{ gap: 10, marginTop: 14 }}>
            <StatTile
              label={purpose === "diet" ? "Daily Energy Need (−400)" : "Daily Energy Need"}
              value={target ? `${Math.round(target)}` : "—"}
              unit="calories/day"
              bg={COLORS.tintBlue}
              ink={COLORS.tintBlueInk}
              testID="stat-daily"
            />
            <StatTile
              label="Consumed Today"
              value={`${Math.round(consumed)}`}
              unit="calories"
              bg={COLORS.tintOrange}
              ink={COLORS.tintOrangeInk}
              testID="stat-consumed"
            />
            <StatTile
              label="Remaining"
              value={remaining === null ? "—" : `${Math.max(0, Math.round(remaining))}`}
              unit="calories"
              bg={COLORS.tintGreen}
              ink={COLORS.tintGreenInk}
              testID="stat-remaining"
            />
          </View>
        </View>

        {/* ============== Filter by Keywords ============== */}
        <View style={[styles.card, SHADOW.soft]}>
          <Text style={styles.h2}>Filter by Keywords</Text>
          {kw && (Object.keys(GROUP_TITLES) as (keyof SelKw)[]).map((g) => (
            <View key={g} style={{ marginTop: 14 }}>
              <Text style={styles.groupLabel}>{GROUP_TITLES[g]}</Text>
              <View style={styles.chipWrap}>
                {kw.groups[g].map((v) => (
                  <Chip
                    key={v}
                    testID={`kw-${g}-${v}`}
                    label={v}
                    selected={sel[g].includes(v)}
                    onPress={() => toggle(g, v)}
                  />
                ))}
              </View>
            </View>
          ))}
          {(sel.countries.length + sel.cooking_methods.length + sel.carbs.length + sel.protein.length) > 0 && (
            <Pressable testID="kw-clear" onPress={() => setSel(EMPTY_SEL)} hitSlop={8} style={{ marginTop: 12 }}>
              <Text style={styles.clearTxt}>Clear all filters</Text>
            </Pressable>
          )}
        </View>

        {/* ============== Your Meal ============== */}
        <View style={[styles.card, SHADOW.soft]}>
          <View style={styles.rowBetween}>
            <Text style={styles.h2}>Your Meal</Text>
            <Pressable
              testID="random-roll-button"
              onPress={roll}
              disabled={rolling}
              style={({ pressed }) => [styles.randomBtn, pressed && { transform: [{ scale: 0.97 }] }, rolling && { opacity: 0.6 }]}
            >
              <Ionicons name="shuffle" color="#fff" size={18} />
              <Text style={styles.randomBtnTxt}>{meal ? "Re-roll" : "Random Meal"}</Text>
            </Pressable>
          </View>

          {!meal ? (
            <View style={styles.mealEmpty} testID="meal-empty">
              <Ionicons name="shuffle" size={42} color="#CFCFCF" />
              <Text style={styles.mealEmptyTxt}>Click &quot;Random Meal&quot; to get a suggestion</Text>
            </View>
          ) : (
            <View style={styles.mealCard} testID="meal-card">
              {!!meal.image_url && <Image source={{ uri: meal.image_url }} style={styles.mealImg} />}
              <View style={{ padding: 14, gap: 8 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.mealName} numberOfLines={2}>{meal.name}</Text>
                  <View style={styles.calBadge}>
                    <Text style={styles.calBig}>{Math.round(meal.calories)}</Text>
                    <Text style={styles.calUnit}>kcal</Text>
                  </View>
                </View>
                {!!meal.description && <Text style={styles.desc}>{meal.description}</Text>}
                <View style={styles.macroRow}>
                  <Macro label="Fat" value={`${meal.fat_g}g`} />
                  <Macro label="Protein" value={`${meal.protein_g}g`} />
                  <Macro label="Carbs" value={`${meal.carbs_g}g`} />
                </View>
                <View style={styles.tagRow}>
                  {[
                    ...meal.keywords.countries,
                    ...meal.keywords.cooking_methods,
                    ...meal.keywords.carbs,
                    ...meal.keywords.protein,
                  ].slice(0, 6).map((k) => (
                    <View key={k} style={styles.tag}>
                      <Text style={styles.tagTxt}>{k}</Text>
                    </View>
                  ))}
                  {meal.low_fat && (
                    <View style={[styles.tag, { backgroundColor: COLORS.tintGreen }]}>
                      <Text style={[styles.tagTxt, { color: COLORS.tintGreenInk }]}>low-fat</Text>
                    </View>
                  )}
                </View>
                <Button
                  label={`Add to Today  +${Math.round(meal.calories)} kcal`}
                  onPress={addToToday}
                  loading={adding}
                  testID="meal-add-button"
                  style={{ marginTop: 8 }}
                />
              </View>
            </View>
          )}
        </View>

        {/* ============== Today's meals ============== */}
        <View style={[styles.card, SHADOW.soft]}>
          <View style={styles.rowBetween}>
            <Text style={styles.h2}>Today&apos;s Meals</Text>
            {today && today.entries.length > 0 && (
              <Pressable testID="home-clear-button" onPress={clearAll} hitSlop={8}>
                <Text style={{ color: COLORS.danger, fontWeight: "700", fontSize: 13 }}>Clear all</Text>
              </Pressable>
            )}
          </View>
          {!today || today.entries.length === 0 ? (
            <View style={styles.todayEmpty}>
              <Text style={styles.todayEmptyTitle}>No meals added yet</Text>
              <Text style={styles.todayEmptySub}>Add meals to track your daily intake</Text>
            </View>
          ) : (
            <View style={{ gap: 10, marginTop: 12 }}>
              {today.entries.map((e) => (
                <View key={e.entry_id} style={styles.entry} testID={`entry-${e.entry_id}`}>
                  {e.image_url ? <Image source={{ uri: e.image_url }} style={styles.entryImg} /> : <View style={[styles.entryImg, { backgroundColor: COLORS.border }]} />}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryName} numberOfLines={1}>{e.name}</Text>
                    <Text style={styles.entryCal}>{Math.round(e.calories)} kcal</Text>
                  </View>
                  <Pressable testID={`entry-remove-${e.entry_id}`} onPress={() => removeEntry(e.entry_id)} hitSlop={10} style={styles.removeBtn}>
                    <Ionicons name="close" color={COLORS.muted} size={20} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ label, value, unit, bg, ink, testID }: { label: string; value: string; unit: string; bg: string; ink: string; testID: string }) {
  return (
    <View testID={testID} style={[styles.statTile, { backgroundColor: bg }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: ink }]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </View>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 18,
  },

  // Header
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  headerLeft: { flex: 1, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  h1: { fontSize: 22, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  profileLine: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  editTxt: { fontSize: 12, fontWeight: "700", color: COLORS.text, lineHeight: 14 },

  // Stat tiles
  statTile: { padding: 16, borderRadius: RADIUS.md },
  statLabel: { fontSize: 13, color: COLORS.textSoft, fontWeight: "600" },
  statValue: { fontSize: 32, fontWeight: "900", marginTop: 4, letterSpacing: -0.5 },
  statUnit: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  // Sections
  h2: { fontSize: 18, fontWeight: "900", color: COLORS.text, letterSpacing: -0.3 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  // Filter chips
  groupLabel: { fontSize: 11, color: COLORS.muted, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  clearTxt: { fontSize: 13, color: COLORS.muted, fontWeight: "700", textDecorationLine: "underline" },

  // Random button
  randomBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  randomBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 14 },

  // Meal empty state
  mealEmpty: { alignItems: "center", justifyContent: "center", paddingVertical: 36, gap: 8 },
  mealEmptyTxt: { color: COLORS.muted, fontSize: 14 },

  // Meal card
  mealCard: {
    marginTop: 12,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  mealImg: { width: "100%", height: 200, resizeMode: "cover" },
  mealName: { flex: 1, fontSize: 19, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5, paddingRight: 10 },
  desc: { fontSize: 13, color: COLORS.textSoft, lineHeight: 19 },
  calBadge: { backgroundColor: COLORS.text, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.md, alignItems: "center" },
  calBig: { color: "#fff", fontSize: 16, fontWeight: "900" },
  calUnit: { color: "#fff", fontSize: 10, opacity: 0.8 },
  macroRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  macroLabel: { fontSize: 10, color: COLORS.muted, fontWeight: "800", letterSpacing: 1.5 },
  macroValue: { fontSize: 14, color: COLORS.text, fontWeight: "700", marginTop: 2 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: COLORS.surface, borderRadius: 99, borderWidth: 1, borderColor: COLORS.border },
  tagTxt: { fontSize: 11, color: COLORS.text, fontWeight: "600", textTransform: "capitalize" },

  // Today empty
  todayEmpty: { paddingVertical: 24, alignItems: "center", gap: 4 },
  todayEmptyTitle: { fontSize: 15, fontWeight: "700", color: COLORS.muted },
  todayEmptySub: { fontSize: 13, color: COLORS.muted },

  entry: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: 10, gap: 12 },
  entryImg: { width: 54, height: 54, borderRadius: RADIUS.sm },
  entryName: { fontSize: 14, fontWeight: "800", color: COLORS.text },
  entryCal: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  removeBtn: { padding: 6 },
});
