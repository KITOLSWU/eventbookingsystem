import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, fontSize, fonts, radius, shadow, spacing } from "../constants/theme";

const BUTTON_VARIANTS = {
  primary: { background: colors.primary, foreground: colors.white, border: colors.primary },
  dark: { background: colors.dark, foreground: colors.white, border: colors.dark },
  soft: { background: colors.primarySoft, foreground: colors.primaryDark, border: "transparent" },
  ghost: { background: "transparent", foreground: colors.text, border: colors.border },
  danger: { background: colors.dangerSoft, foreground: colors.danger, border: "transparent" },
  onDark: {
    background: "rgba(255,255,255,0.08)",
    foreground: colors.white,
    border: "rgba(255,255,255,0.16)",
  },
};

export function AppButton({
  title,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
}) {
  const palette = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.background, borderColor: palette.border },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.foreground} />
      ) : icon ? (
        <Ionicons name={icon} size={19} color={palette.foreground} />
      ) : null}
      <Text style={[styles.buttonLabel, { color: palette.foreground }, textStyle]}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  color = colors.text,
  backgroundColor = "transparent",
  size = 22,
  accessibilityLabel,
  style,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

export function Card({ children, style, padded = true }) {
  return <View style={[styles.card, padded && styles.cardPadded, style]}>{children}</View>;
}

const BADGE_TONES = {
  neutral: { background: colors.surfaceMuted, foreground: colors.textSecondary },
  primary: { background: colors.primarySoft, foreground: colors.primaryDark },
  accent: { background: colors.accentSoft, foreground: colors.accent },
  success: { background: colors.successSoft, foreground: colors.success },
  danger: { background: colors.dangerSoft, foreground: colors.danger },
  warning: { background: colors.warningSoft, foreground: colors.warning },
};

export function Badge({ label, tone = "neutral", icon, style }) {
  const palette = BADGE_TONES[tone] || BADGE_TONES.neutral;

  return (
    <View style={[styles.badge, { backgroundColor: palette.background }, style]}>
      {icon ? <Ionicons name={icon} size={13} color={palette.foreground} /> : null}
      <Text style={[styles.badgeLabel, { color: palette.foreground }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function Field({ label, icon, right, style, inputStyle, multiline, ...props }) {
  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={[styles.fieldRow, multiline && styles.fieldRowMultiline]}>
        {icon ? <Ionicons name={icon} size={19} color={colors.textMuted} /> : null}
        <TextInput
          {...props}
          multiline={multiline}
          placeholderTextColor={colors.textMuted}
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline, inputStyle]}
        />
        {right}
      </View>
    </View>
  );
}

export function EmptyState({ icon = "sparkles-outline", title, message, actionLabel, onAction, style }) {
  return (
    <View style={[styles.emptyState, style]}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <AppButton title={actionLabel} onPress={onAction} variant="soft" style={styles.emptyAction} />
      ) : null}
    </View>
  );
}

export function StatTile({ icon, label, value, tone = "primary" }) {
  const palette = BADGE_TONES[tone] || BADGE_TONES.primary;

  return (
    <View style={styles.statTile}>
      <View style={[styles.statIcon, { backgroundColor: palette.background }]}>
        <Ionicons name={icon} size={18} color={palette.foreground} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ScreenHeader({ title, subtitle, onBack, right, backLabel = "Go back" }) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderTop}>
        {onBack ? (
          <IconButton
            icon="arrow-back"
            onPress={onBack}
            accessibilityLabel={backLabel}
            style={styles.headerBack}
          />
        ) : (
          <View style={styles.headerBack} />
        )}
        {right}
      </View>
      <View style={styles.screenHeaderText}>
        {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
        <Text style={styles.screenTitle}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  buttonLabel: {
    fontSize: fontSize.body,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardPadded: {
    padding: spacing.lg,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  badgeLabel: {
    fontSize: fontSize.tiny,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.small,
    fontWeight: "800",
  },
  fieldRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldRowMultiline: {
    alignItems: "flex-start",
    paddingVertical: spacing.md,
  },
  fieldInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.body,
    paddingVertical: spacing.md,
  },
  fieldInputMultiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.subheading,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyMessage: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    lineHeight: 21,
    textAlign: "center",
  },
  emptyAction: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.card,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    color: colors.text,
    fontSize: fontSize.title,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: fontSize.small,
    fontWeight: "600",
  },
  screenHeader: {
    gap: spacing.lg,
  },
  screenHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBack: {
    width: 42,
    height: 42,
    marginLeft: -spacing.sm,
  },
  screenHeaderText: {
    gap: spacing.xs,
  },
  screenSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.small,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  screenTitle: {
    color: colors.text,
    fontSize: fontSize.display,
    fontFamily: fonts.display,
    fontWeight: "700",
  },
});
