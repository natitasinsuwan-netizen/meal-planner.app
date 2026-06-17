import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/src/components/Button";
import { api, type Meal } from "@/src/lib/api";
import { useToast } from "@/src/components/Toast";
import { useAuth } from "@/src/context/AuthContext";
import { COLORS, RADIUS, SHADOW } from "@/src/lib/theme";

export default function Admin() {
  const { me } = useAuth();
  const { show } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  // Spoonacular import form
  const [importQuery, setImportQuery] = useState("");
  const [importCount, setImportCount] = useState("10");
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async (search?: string) => {
    try {
      const list = await api<Meal[]>(`/meals${search ? `?q=${encodeURIComponent(search)}` : ""}`);
      setMeals(list);
    } catch (e: any) {
      show(e?.message || "Could not load meals", "error");
    }
  }, [show]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onDelete = async (id: string) => {
    try {
      await api(`/meals/${id}`, { method: "DELETE" });
      setMeals((m) => m.filter((x) => x.id !== id));
      show("Deleted", "success");
    } catch (e: any) {
      show(e?.message || "Could not delete", "error");
    }
  };

  const importThai = async () => {
    setBusy(true);
    try {
      const r = await api<{ results: any[] }>("/spoonacular/search?query=thai&number=10");
      const imp = await api<{ inserted: number }>("/spoonacular/import", { method: "POST", body: { results: r.results } });
      show(`Imported ${imp.inserted} Thai meals from Spoonacular`, "success");
      await load();
    } catch (e: any) {
      show(e?.message || "Import failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const importByQuery = async () => {
    const query = importQuery.trim();
    if (!query) {
      show("Type a search query", "error");
      return;
    }
    const n = Math.max(1, Math.min(25, parseInt(importCount || "10", 10) || 10));
    setBusy(true);
    try {
      const r = await api<{ results: any[] }>(
        `/spoonacular/search?query=${encodeURIComponent(query)}&number=${n}`,
      );
      if (!r.results?.length) {
        show("No recipes found for that query", "error");
        return;
      }
      const imp = await api<{ inserted: number }>("/spoonacular/import", {
        method: "POST",
        body: { results: r.results },
      });
      show(`Imported ${imp.inserted} "${query}" meals`, "success");
      setImportQuery("");
      setImportOpen(false);
      await load();
    } catch (e: any) {
      show(e?.message || "Import failed", "error");
    } finally {
      setBusy(false);
    }
  };

  if (!me?.is_admin) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={{ padding: 24 }}>
          <Text style={styles.h1}>Admin only</Text>
          <Text style={styles.muted}>You don&apos;t have access to this page.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={{ padding: 20, paddingBottom: 8 }}>
        <Text style={styles.eyebrow}>OWNER · ADMIN</Text>
        <Text style={styles.h1}>Meals</Text>
        <Text style={styles.muted}>{meals.length} meals in catalog</Text>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={COLORS.muted} />
          <TextInput
            testID="admin-search-input"
            value={q}
            onChangeText={(v) => { setQ(v); load(v); }}
            placeholder="Search by name…"
            placeholderTextColor={COLORS.muted}
            style={{ flex: 1, color: COLORS.text, fontSize: 15 }}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <Button
            label="+ New meal"
            full={false}
            onPress={() => router.push("/meal-editor")}
            testID="admin-new-button"
            style={{ flex: 1 }}
          />
          <Button
            label={importOpen ? "Close" : "Import…"}
            variant="secondary"
            full={false}
            onPress={() => setImportOpen((v) => !v)}
            testID="admin-import-toggle"
            style={{ flex: 1 }}
          />
        </View>

        {importOpen && (
          <View style={styles.importPanel}>
            <Text style={styles.importTitle}>Import from Spoonacular</Text>
            <Text style={styles.importHelp}>
              Search any cuisine, ingredient or dish. Up to 25 per import.
            </Text>
            <TextInput
              testID="admin-import-query"
              value={importQuery}
              onChangeText={setImportQuery}
              placeholder="e.g. italian pasta, korean bbq, vegan curry"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              style={styles.importInput}
            />
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <Text style={styles.importHelp}>How many?</Text>
              <TextInput
                testID="admin-import-count"
                value={importCount}
                onChangeText={setImportCount}
                keyboardType="numeric"
                style={[styles.importInput, { width: 80, marginTop: 0 }]}
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              {["thai", "italian", "japanese", "korean", "indian", "mexican", "vegan", "low-carb"].map((s) => (
                <Pressable
                  key={s}
                  testID={`admin-import-quick-${s}`}
                  onPress={() => setImportQuery(s)}
                  style={styles.quickChip}
                >
                  <Text style={styles.quickChipTxt}>{s}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Button
                label="Quick: Thai (10)"
                variant="secondary"
                full={false}
                onPress={importThai}
                loading={busy}
                testID="admin-import-thai"
                style={{ flex: 1 }}
              />
              <Button
                label="Import"
                full={false}
                onPress={importByQuery}
                loading={busy}
                testID="admin-import-run"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40, gap: 10 }}
        renderItem={({ item }) => (
          <View style={[styles.row, SHADOW.soft]}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.img} /> : <View style={[styles.img, { backgroundColor: COLORS.border }]} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.metaLine}>
                {Math.round(item.calories)} kcal · {(item.keywords.countries[0] || "—")}{item.low_fat ? " · low-fat" : ""}
              </Text>
            </View>
            <Pressable
              testID={`admin-edit-${item.id}`}
              onPress={() => router.push({ pathname: "/meal-editor", params: { id: item.id } })}
              style={styles.iconBtn}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.text} />
            </Pressable>
            <Pressable
              testID={`admin-delete-${item.id}`}
              onPress={() => onDelete(item.id)}
              style={styles.iconBtn}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  eyebrow: { fontSize: 11, color: COLORS.muted, fontWeight: "800", letterSpacing: 3 },
  h1: { fontSize: 30, fontWeight: "900", color: COLORS.text, letterSpacing: -1, marginTop: 4 },
  muted: { color: COLORS.muted },
  searchRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 48,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 10,
  },
  img: { width: 56, height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.border },
  name: { fontSize: 14, fontWeight: "800", color: COLORS.text },
  metaLine: { fontSize: 12, color: COLORS.muted, marginTop: 2, textTransform: "capitalize" },
  iconBtn: {
    width: 36, height: 36, alignItems: "center", justifyContent: "center",
    borderRadius: 99, backgroundColor: "#FAF8F3", borderWidth: 1, borderColor: COLORS.border,
  },
});
