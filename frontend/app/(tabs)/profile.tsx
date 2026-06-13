import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { Chip } from "@/src/components/Chip";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/components/Toast";
import { api, type KeywordsResponse, type Me, type Profile } from "@/src/lib/api";
import { COLORS, RADIUS, SHADOW } from "@/src/lib/theme";

export default function ProfileScreen() {
  const { me, refresh, signOut } = useAuth();
  const { show } = useToast();
  const [kw, setKw] = useState<KeywordsResponse | null>(null);
  const [busy, setBusy] = useState(false);

  const [purpose, setPurpose] = useState<"random" | "diet">(me?.profile.purpose || "random");
  const [sex, setSex] = useState<"male" | "female" | null>(me?.profile.sex || null);
  const [weight, setWeight] = useState<string>(me?.profile.weight_kg ? String(me.profile.weight_kg) : "");
  const [height, setHeight] = useState<string>(me?.profile.height_cm ? String(me.profile.height_cm) : "");
  const [birthday, setBirthday] = useState<string>(me?.profile.birthday || "");
  const [exercise, setExercise] = useState<number>(me?.profile.exercise_per_week ?? 2);
  const [diet, setDiet] = useState<string[]>(me?.profile.dietary_preferences || []);
  const [allergies, setAllergies] = useState<string[]>(me?.profile.allergies || []);

  useEffect(() => {
    api<KeywordsResponse>("/keywords").then(setKw).catch(() => {});
  }, []);

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const save = async () => {
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
      show("Profile saved", "success");
    } catch (e: any) {
      show(e?.message || "Could not save", "error");
    } finally {
      setBusy(false);
    }
  };

  const doSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>YOUR PROFILE</Text>
        <Text style={styles.h1}>Settings</Text>
        <Text style={styles.muted}>{me?.email}</Text>

        {/* Daily calories panel */}
        <View style={[styles.panel, SHADOW.soft, { marginTop: 18 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={styles.label}>{purpose === "diet" ? "DIET TARGET (−400)" : "DAILY CALORIE TARGET"}</Text>
              <Text style={styles.big}>{(() => {
                const tdee = me?.daily_calorie_target || 0;
                if (!tdee) return "—";
                return purpose === "diet" ? tdee - 400 : tdee;
              })()}</Text>
              <Text style={styles.muted}>
                {me?.daily_calorie_target
                  ? `${me.daily_calorie_target} TDEE · Mifflin–St Jeor`
                  : "Save profile to compute"}
              </Text>
            </View>
          </View>
        </View>

        {/* Purpose */}
        <Section title="Purpose">
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              testID="profile-purpose-random"
              onPress={() => setPurpose("random")}
              style={[styles.segment, purpose === "random" && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, purpose === "random" && styles.segmentTextActive]}>Random</Text>
            </Pressable>
            <Pressable
              testID="profile-purpose-diet"
              onPress={() => setPurpose("diet")}
              style={[styles.segment, purpose === "diet" && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, purpose === "diet" && styles.segmentTextActive]}>Diet</Text>
            </Pressable>
          </View>
        </Section>

        {/* Body */}
        <Section title="Body">
          <Text style={styles.label}>Sex</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
            <Pressable
              testID="profile-sex-male"
              onPress={() => setSex("male")}
              style={[styles.segment, sex === "male" && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, sex === "male" && styles.segmentTextActive]}>Male</Text>
            </Pressable>
            <Pressable
              testID="profile-sex-female"
              onPress={() => setSex("female")}
              style={[styles.segment, sex === "female" && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, sex === "female" && styles.segmentTextActive]}>Female</Text>
            </Pressable>
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Birthday (YYYY-MM-DD)</Text>
          <TextInput
            testID="profile-birthday-input"
            value={birthday}
            onChangeText={setBirthday}
            placeholder="1995-08-21"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            autoCapitalize="none"
          />

          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                testID="profile-weight-input"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                testID="profile-height-input"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Exercise / week</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
              <Pressable
                key={n}
                testID={`profile-exercise-${n}`}
                onPress={() => setExercise(n)}
                style={[styles.exTile, exercise === n && styles.exTileActive]}
              >
                <Text style={[styles.exNum, exercise === n && styles.exNumActive]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Dietary preferences">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(kw?.dietary_preferences || []).map((d) => (
              <Chip
                key={d}
                label={d}
                selected={diet.includes(d)}
                onPress={() => setDiet(toggle(diet, d))}
                testID={`profile-diet-${d}`}
              />
            ))}
          </View>
        </Section>

        <Section title="Allergies">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(kw?.allergies || []).map((a) => (
              <Chip
                key={a}
                label={a}
                selected={allergies.includes(a)}
                onPress={() => setAllergies(toggle(allergies, a))}
                testID={`profile-allergy-${a}`}
              />
            ))}
          </View>
        </Section>

        <View style={{ marginTop: 16, gap: 10 }}>
          <Button label="Save changes" onPress={save} loading={busy} testID="profile-save-button" />
          <Button label="Sign out" variant="secondary" onPress={doSignOut} testID="profile-signout-button" />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={[styles.panel, SHADOW.soft, { marginTop: 16 }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ marginTop: 10 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  eyebrow: { fontSize: 11, color: COLORS.muted, fontWeight: "800", letterSpacing: 3 },
  h1: { fontSize: 30, fontWeight: "900", color: COLORS.text, marginTop: 4, letterSpacing: -1 },
  muted: { color: COLORS.muted },
  panel: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: COLORS.text, letterSpacing: 1, textTransform: "uppercase" },
  label: { fontSize: 11, color: COLORS.muted, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  big: { fontSize: 36, fontWeight: "900", color: COLORS.text, letterSpacing: -1, marginTop: 4 },
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
    height: 48,
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
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF8F3",
  },
  exTileActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  exNum: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  exNumActive: { color: "#fff" },
});
