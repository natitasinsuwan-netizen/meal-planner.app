import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { COLORS } from "@/src/lib/theme";

export default function Index() {
  const { me, loading } = useAuth();

  useEffect(() => {}, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }
  if (!me) return <Redirect href="/(auth)/login" />;

  // Profile not yet complete -> onboarding
  const p = me.profile;
  const needsOnboarding = !p.weight_kg || !p.height_cm || !p.birthday || !p.sex;
  if (needsOnboarding) return <Redirect href="/onboarding" />;

  return <Redirect href="/(tabs)" />;
}
