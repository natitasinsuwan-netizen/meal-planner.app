import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/components/Toast";
import { COLORS, RADIUS, SHADOW } from "@/src/lib/theme";

export default function Register() {
  const { signUp } = useAuth();
  const { show } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      show("Email and password required", "error");
      return;
    }
    if (password.length < 6) {
      show("Password must be at least 6 characters", "error");
      return;
    }
    setBusy(true);
    try {
      await signUp(email.trim(), password);
      router.replace("/");
    } catch (e: any) {
      show(e?.message || "Sign up failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandWrap}>
          <Text style={styles.eyebrow}>MEAL · RANDOM</Text>
          <Text style={styles.title}>Get started.</Text>
          <Text style={styles.subtitle}>Track calories. Discover meals.</Text>
        </View>

        <View style={[styles.card, SHADOW.soft]}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            testID="register-email-input"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <TextInput
            testID="register-password-input"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={COLORS.muted}
            secureTextEntry
            style={styles.input}
          />
          <View style={{ height: 24 }} />
          <Button label="Create account" loading={busy} onPress={onSubmit} testID="register-submit-button" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footText}>Already have an account?</Text>
          <Link href="/(auth)/login" replace testID="goto-login-link">
            <Text style={styles.footLink}> Sign in</Text>
          </Link>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 24, paddingBottom: 48, gap: 24, flexGrow: 1, justifyContent: "center" },
  brandWrap: { gap: 8 },
  eyebrow: { color: COLORS.muted, fontSize: 11, letterSpacing: 4, fontWeight: "800" },
  title: { fontSize: 36, fontWeight: "900", color: COLORS.text, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: COLORS.muted },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  label: { fontSize: 12, color: COLORS.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
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
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  footText: { color: COLORS.muted },
  footLink: { color: COLORS.primary, fontWeight: "700" },
});
