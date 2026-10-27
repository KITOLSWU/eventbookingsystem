import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontSize, radius, spacing } from "../constants/theme";

const TAB_BAR_HEIGHT = 70;

const TABS = [
  { name: "home", icon: "home-outline", activeIcon: "home", label: "Home", path: "/home" },
  {
    name: "history",
    icon: "receipt-outline",
    activeIcon: "receipt",
    label: "History",
    path: "/history",
  },
  {
    name: "organizer",
    icon: "grid-outline",
    activeIcon: "grid",
    label: "Organizer",
    path: "/organizer",
  },
];

export function BottomTabBar({ activeTab }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            hitSlop={20}
            onPress={() => router.replace(tab.path)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.label,
                isActive && styles.activeLabel,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export { TAB_BAR_HEIGHT };

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: TAB_BAR_HEIGHT,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  activeTab: {},
  label: {
    fontSize: fontSize.tiny,
    fontWeight: "600",
    color: colors.textMuted,
  },
  activeLabel: {
    color: colors.primary,
  },
});