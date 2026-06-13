import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";
import { COLORS } from "@/src/lib/theme";

export default function TabsLayout() {
  const { me } = useAuth();
  const insets = useSafeAreaInsets();
  const isAdmin = !!me?.is_admin;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,
          ...Platform.select({
            ios: { shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: -4 } },
            default: { elevation: 6 },
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => <Ionicons name="sunny-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="random"
        options={{
          title: "Randomize",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.center}>
              <Ionicons name="dice" color={color} size={size + 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: isAdmin ? "/(tabs)/admin" : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
