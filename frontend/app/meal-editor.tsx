import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/src/components/Button";
import { Chip } from "@/src/components/Chip";
import { api, type KeywordsResponse, type Meal } from "@/src/lib/api";
import { useToast } from "@/src/components/Toast";
import { COLORS, RADIUS, SHADOW } from "@/src/lib/theme";

type Kw = { countries: string[]; cooking_methods: string[]; carbs: string[]; protein: string[] };
const EMPTY_KW: Kw = { countries: [], cooking_methods: [], carbs: [], protein: [] };

export default function MealEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id;
  const { show } = useToast();

  const [busy, setBusy] = useState(false);
  const [kwData, setKwData] = useState<KeywordsResponse | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [calories, setCalories] = useState("");
  const [fat, setFat] = useState("");
  const [protein, setProtein] = useState("");
  const [carbsG, setCarbsG] = useState("");
  const [keywords, setKeywords] = useState<Kw>(EMPTY_KW);
  const [diet, setDiet] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [lowFat, setLowFat] = useState(false);

  useEffect(() => {
    api<KeywordsResponse>("/keywords").then(setKwData).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editing) return;
    api<Meal[]>("/meals").then((list) => {
      const m = list.find((x) => x.id === id);
      if (!m) return;
      setName(m.name);
      setDescription(m.description);
      setImageUrl(m.image_url);
      setCalories(String(m.calories));
      setFat(String(m.fat_g));
      setProtein(String(m.protein_g));
      setCarbsG(String(m.carbs_g));
      setKeywords({ ...EMPTY_KW, ...m.keywords });
      setDiet(m.dietary_tags || []);
      setAllergens(m.allergens || []);
      setLowFat(!!m.low_fat);
    }).catch(() => {});
  }, [editing, id]);

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  const toggleKw = (g: keyof Kw, v: string) =>
    setKeywords((s) => ({ ...s, [g]: s[g].includes(v) ? s[g].filter((x) => x !== v) : [...s[g], v] }));

  const save = async () => {
    if (!name || !calories) {
      show("Name and calories required", "error");
      return;
    }
    const body = {
      name,
      description,
      image_url: imageUrl,
      calories: Number(calories),
      fat_g: Number(fat || 0),
      protein_g: Number(protein || 0),
      carbs_g: Number(carbsG || 0),
      keywords,
      dietary_tags: diet,
      allergens,
      low_fat: lowFat,
    };
    setBusy(true);
    try {
      if (editing) {
        await api<Meal>(`/meals/${id}`, { method: "PUT", body });
        show("Meal updated", "success");
      } else {
        await api<Meal>("/meals", { method: "POST", body });
        show("Meal created", "success");
      }
      router.back();
    } catch (e: any) {
      show(e?.message || "Save failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const sectionStyle = [styles.panel, SHADOW.soft, { marginTop: 14 }] as const;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Ionicons
          name="chevron-back"
          size={26}
          color={COLORS.text}
          onPress={() => router.back()}
          testID="editor-back"
        />
        <Text style={styles.h1}>{editing ? "Edit meal" : "New meal"}</Text>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        bottomOffset={32}
        keyboardShouldPersistTaps="handled"
      >
        {!!imageUrl && <Image source={{ uri: imageUrl }} style={styles.preview} />}

        <View style={sectionStyle}>
          <Field label="Name" value={name} onChange={setName} testID="editor-name" />
          <Field label="Description" value={description} onChange={setDescription} multiline testID="editor-desc" />
          <Field label="Image URL" value={imageUrl} onChange={setImageUrl} testID="editor-image" />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}><Field label="Calories" value={calories} onChange={setCalories} numeric testID="editor-cal" /></View>
            <View style={{ flex: 1 }}><Field label="Fat (g)" value={fat} onChange={setFat} numeric testID="editor-fat" /></View>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}><Field label="Protein (g)" value={protein} onChange={setProtein} numeric testID="editor-protein" /></View>
            <View style={{ flex: 1 }}><Field label="Carbs (g)" value={carbsG} onChange={setCarbsG} numeric testID="editor-carbs" /></View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 8 }}>
            <Chip label={lowFat ? "✓ Low-fat" : "Mark low-fat"} selected={lowFat} onPress={() => setLowFat((v) => !v)} testID="editor-lowfat" />
          </View>
        </View>

        {kwData && (Object.keys(EMPTY_KW) as (keyof Kw)[]).map((g) => (
          <View key={g} style={sectionStyle}>
            <Text style={styles.sectionTitle}>{g.replace("_", " ")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {kwData.groups[g].map((v) => (
                <Chip
                  key={v}
                  label={v}
                  selected={keywords[g].includes(v)}
                  onPress={() => toggleKw(g, v)}
                  testID={`editor-kw-${g}-${v}`}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={sectionStyle}>
          <Text style={styles.sectionTitle}>Dietary tags</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {(kwData?.dietary_preferences || []).map((d) => (
              <Chip key={d} label={d} selected={diet.includes(d)} onPress={() => setDiet(toggle(diet, d))} testID={`editor-diet-${d}`} />
            ))}
          </View>
        </View>

        <View style={sectionStyle}>
          <Text style={styles.sectionTitle}>Allergens (in this meal)</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {(kwData?.allergies || []).map((a) => (
              <Chip key={a} label={a} selected={allergens.includes(a)} onPress={() => setAllergens(toggle(allergens, a))} testID={`editor-allergen-${a}`} />
            ))}
          </View>
        </View>

        <Button label={editing ? "Save changes" : "Create meal"} loading={busy} onPress={save} testID="editor-save-button" style={{ marginTop: 18 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChange, multiline, numeric, testID,
}: {
  label: string; value: string; onChange: (s: string) => void;
  multiline?: boolean; numeric?: boolean; testID: string;
}) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={numeric ? "numeric" : "default"}
        style={[styles.input, multiline && { height: 88, textAlignVertical: "top", paddingTop: 12 }]}
        autoCapitalize="none"
        placeholderTextColor={COLORS.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 8 },
  h1: { fontSize: 24, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  preview: { width: "100%", height: 180, borderRadius: RADIUS.lg, backgroundColor: COLORS.border },
  panel: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 12, fontWeight: "800", color: COLORS.text, letterSpacing: 2, textTransform: "uppercase" },
  label: { fontSize: 11, color: COLORS.muted, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  input: {
    marginTop: 6,
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 15,
    backgroundColor: "#FAF8F3",
  },
});
