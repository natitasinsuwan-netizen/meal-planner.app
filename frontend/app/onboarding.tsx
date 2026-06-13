import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { Chip } from "@/src/components/Chip";
import { api, type KeywordsResponse, type Me, type Profile } from "@/src/lib/api";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/components/Toast";
import { COLORS, RADIUS, SHADOW } from "@/src/lib/theme";

export default function Onboarding() {
  const { me, refresh } = useAuth();
  const { show } = useToast();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [kwData, setKwData] = useState<KeywordsResponse | null>(null);

  // Profile state
  const [sex, setSex] = useState<"male" | "female" | null>(me?.profile.sex || null);
  const [weight, setWeight] = useState<string>(me?.profile.weight_kg ? String(me.profile.weight_kg) : "");
  const [height, setHeight] = useState<string>(me?.profile.height_cm ? String(me.profile.height_cm) : "");
  const [birthday, setBirthday] = useState<string>(me?.profile.birthday || "");
  const [exercise, setExercise] = useState<number>(me?.profile.exercise_per_week ?? 2);
  const [diet, setDiet] = useState<string[]>(me?.profile.dietary_preferences || []);
  const [allergies, setAllergies] = useState<string[]>(me?.profile.allergies || []);
  const [purpose, setPurpose] = useState<"random" | "diet">(me?.profile.purpose || "random");

  useEffect(() => {
    api<KeywordsResponse>("/keywords").then(setKwData).catch(() => {});
  }, []);

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const finish = async () => {
    if (!sex || !weight || !height || !birthday) {
      show("Please fill all required fields", "error");
      return;
    }
    const body: Profile = {
      sex,
      weight_kg: Number(weight),
      height_cm: Number(height),
      birthday,
      exercise_per_week: exercise,
      dietary_preferences: diet,
      allergies,
      purpose,
    };
    setBusy(true);
    try {
      await api<Me>("/users/me/profile", { method: "PUT", body });
      await refresh();
      router.replace("/(tabs)");
    } catch (e: any) {
      show(e?.message || "Could not save profile", "error");
    } finally {
      setBusy(false);
    }
  };

  const steps = [
    {
      key: "purpose",
      title: "What's Your Purpose?",
      sub: "Choose how you want to use this app",
      render: () => (
        <View style={{ gap: 14 }}>
          <Pressable
            testID="onb-purpose-random"
            onPress={() => setPurpose("random")}
            style={[styles.purposeCard, purpose === "random" && styles.purposeCardActive]}
          >
            <View style={[styles.purposeIcon, { backgroundColor: "#F4A024" }]}>
              <Ionicons name="shuffle" size={28} color="#fff" />
            </View>
            <Text style={styles.purposeTitle}>Random Meal</Text>
            <Text style={styles.purposeBody}>
              Get random meal suggestions based on your preferences. Perfect for when you can&apos;t decide what to eat and want variety in your diet.
            </Text>
            <Text style={[styles.purposeCta, { color: "#F4A024" }]}>Explore meals  →</Text>
          </Pressable>
          <Pressable
            testID="onb-purpose-diet"
            onPress={() => setPurpose("diet")}
            style={[styles.purposeCard, purpose === "diet" && styles.purposeCardActive]}
          >
            <View style={[styles.purposeIcon, { backgroundColor: "#2EAF4F" }]}>
              <Ionicons name="locate" size={28} color="#fff" />
            </View>
            <Text style={styles.purposeTitle}>Diet Planning</Text>
            <Text style={styles.purposeBody}>
              Plan your meals while tracking your daily calorie intake. Ideal for weight management and achieving your fitness goals.
            </Text>
            <Text style={[styles.purposeCta, { color: "#2EAF4F" }]}>Start planning  →</Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: "sex",
      title: "Tell us about you",
      sub: "We use this for the Mifflin–St Jeor calorie formula.",
      render: () => (
        <View style={{ gap: 16 }}>
          <Text style={styles.label}>Sex</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              testID="onb-sex-male"
              onPress={() => setSex("male")}
              style={[styles.segment, sex === "male" && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, sex === "male" && styles.segmentTextActive]}>Male</Text>
            </Pressable>
            <Pressable
              testID="onb-sex-female"
              onPress={() => setSex("female")}
              style={[styles.segment, sex === "female" && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, sex === "female" && styles.segmentTextActive]}>Female</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Birthday (YYYY-MM-DD)</Text>
          <TextInput
            testID="onb-birthday-input"
            value={birthday}
            onChangeText={setBirthday}
            placeholder="1995-08-21"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            autoCapitalize="none"
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                testID="onb-weight-input"
                value={weight}
                onChangeText={setWeight}
                placeholder="65"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                testID="onb-height-input"
                value={height}
                onChangeText={setHeight}
                placeholder="170"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>
        </View>
      ),
    },
    {
      key: "exercise",
      title: "Exercise per week?",
      sub: "Number of workout days (0–7).",
      render: () => (
        <View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
              <Pressable
                key={n}
                testID={`onb-exercise-${n}`}
                onPress={() => setExercise(n)}
                style={[styles.exTile, exercise === n && styles.exTileActive]}
              >
                <Text style={[styles.exNum, exercise === n && styles.exNumActive]}>{n}</Text>
                <Text style={[styles.exLabel, exercise === n && styles.exLabelActive]}>
                  {n === 0 ? "rest" : n >= 6 ? "athlete" : "days"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ),
    },
    {
      key: "diet",
      title: "Dietary preferences",
      sub: "Pick anything that applies.",
      render: () => (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(kwData?.dietary_preferences || []).map((d) => (
            <Chip
              key={d}
              label={d}
              selected={diet.includes(d)}
              onPress={() => setDiet(toggle(diet, d))}
              testID={`onb-diet-${d}`}
            />
          ))}
        </View>
      ),
    },
    {
      key: "allergies",
      title: "Any allergies?",
      sub: "We'll never recommend meals with these.",
      render: () => (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(kwData?.allergies || []).map((a) => (
            <Chip
              key={a}
              label={a}
              selected={allergies.includes(a)}
              onPress={() => setAllergies(toggle(allergies, a))}
              testID={`onb-allergy-${a}`}
            />
          ))}
        </View>
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const canAdvance =
    current.key !== "sex" || (sex && weight && height && birthday);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 32, flexGrow: 1 }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.progress}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i <= step && { backgroundColor: COLORS.primary, width: 24 }]}
            />
          ))}
        </View>

        <Text style={styles.eyebrow}>STEP {step + 1} / {steps.length}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.sub}>{current.sub}</Text>

        <View style={[styles.card, SHADOW.soft]}>
          {current.render()}
        </View>

        <View style={styles.actions}>
          {step > 0 && (
            <Button
              label="Back"
              variant="secondary"
              full={false}
              onPress={() => setStep(step - 1)}
              testID="onb-back-button"
              style={{ flex: 1 }}
            />
          )}
          <Button
            label={isLast ? "Finish" : "Continue"}
            loading={busy}
            disabled={!canAdvance}
            onPress={() => (isLast ? finish() : setStep(step + 1))}
            testID="onb-next-button"
            full={false}
            style={{ flex: 1 }}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  progress: { flexDirection: "row", gap: 6, marginBottom: 24 },
  dot: { height: 6, width: 12, backgroundColor: COLORS.border, borderRadius: 999 },
  eyebrow: { fontSize: 11, color: COLORS.muted, fontWeight: "800", letterSpacing: 3 },
  title: { fontSize: 30, fontWeight: "900", color: COLORS.text, marginTop: 6, letterSpacing: -0.5 },
  sub: { color: COLORS.muted, marginTop: 6, marginBottom: 20 },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: { fontSize: 12, color: COLORS.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 },
  input: {
    marginTop: 6,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 16,
    backgroundColor: "#FAF8F3",
  },
  segment: {
    flex: 1,
    height: 52,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF8F3",
  },
  segmentActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  segmentText: { color: COLORS.text, fontWeight: "700" },
  segmentTextActive: { color: "#fff" },
  exTile: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF8F3",
  },
  exTileActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  exNum: { fontSize: 22, fontWeight: "900", color: COLORS.text },
  exNumActive: { color: "#fff" },
  exLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  exLabelActive: { color: "#fff" },
  purposeCard: {
    padding: 22,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    gap: 10,
  },
  purposeCardActive: { borderColor: COLORS.text },
  purposeIcon: {
    width: 56, height: 56, borderRadius: 999, alignItems: "center", justifyContent: "center",
  },
  purposeTitle: { fontSize: 22, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  purposeBody: { color: COLORS.textSoft, textAlign: "center", lineHeight: 21, fontSize: 14 },
  purposeCta: { fontWeight: "800", marginTop: 4 },
  actions: { flexDirection: "row", gap: 12, marginTop: 24 },
});
