import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontSize, spacing } from "../constants/theme";

export function TopBar({ title = "EventBooking", subtitle, onBack, right, showBack = true }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {showBack && onBack ? (
          <Pressable
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={onBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
        ) : showBack ? (
          <Pressable
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}

        <View style={styles.center}>
          <View style={styles.brandMark}>
            <Ionicons name="ticket" size={20} color={colors.white} />
          </View>
          <Text style={styles.brandName}>{title}</Text>
        </View>

        {right ? (
          right
        ) : (
          <View style={styles.rightSpacer} />
        )}
      </View>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backSpacer: {
    width: 44,
  },
  rightSpacer: {
    width: 44,
  },
  center: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: colors.white,
    fontSize: fontSize.subheading,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: fontSize.small,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});