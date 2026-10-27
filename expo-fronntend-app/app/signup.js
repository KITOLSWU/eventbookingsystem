import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../context/AppStore";
import { colors, fontSize, fonts, radius, spacing } from "../constants/theme";

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, login } = useAppStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    username.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/details");
    }
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await register(username, password);
      if (!result.ok) {
        setMessage(result.message || "Registration failed.");
        return;
      }

      const auth = await login(username, password);
      if (auth.ok) {
        router.replace(auth.role === "admin" ? "/organizer" : "/home");
      } else {
        setMessage(auth.message || "Registered, but login failed.");
      }
    } catch (error) {
      setMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
            <Pressable
              accessibilityLabel="Go back"
              hitSlop={10}
              onPress={handleBack}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color={colors.white} />
            </Pressable>

            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Ionicons name="ticket" size={20} color={colors.white} />
              </View>
              <Text style={styles.brandName}>EventBooking</Text>
            </View>

            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Join to book events and get your digital ticket.
            </Text>
          </View>

          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xxl }]}>
            <View style={[styles.fieldRow, { marginBottom: spacing.md }]}>
              <Ionicons name="person-outline" size={19} color={colors.textMuted} />
              <TextInput
                value={username}
                placeholder="Choose a username"
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                returnKeyType="next"
                style={styles.fieldInput}
              />
            </View>

            <View style={[styles.fieldRow, { marginBottom: spacing.md }]}>
              <Ionicons name="lock-closed-outline" size={19} color={colors.textMuted} />
              <TextInput
                value={password}
                placeholder="Create a password"
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="next"
                style={styles.fieldInput}
              />
              <Pressable
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                hitSlop={10}
                onPress={() => setShowPassword((c) => !c)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={21}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>

            <View style={[styles.fieldRow, { marginBottom: spacing.xl }]}>
              <Ionicons name="lock-outline" size={19} color={colors.textMuted} />
              <TextInput
                value={confirmPassword}
                placeholder="Confirm your password"
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={handleSignup}
                style={styles.fieldInput}
              />
            </View>

            {message ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{message}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create account"
              disabled={!canSubmit || loading}
              hitSlop={10}
              onPress={handleSignup}
              style={[
                styles.submitButton,
                !canSubmit || loading ? styles.disabledButton : {},
              ]}
            >
              {loading ? (
                <Text style={styles.buttonText}>Creating…</Text>
              ) : (
                <Text style={styles.buttonText}>Create account</Text>
              )}
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerNote}>Already have an account?</Text>
              <TouchableOpacity
                accessibilityRole="link"
                accessibilityLabel="Sign in"
                onPress={() => router.replace("/details")}
              >
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  backButton: {
    marginLeft: -spacing.md,
    marginBottom: spacing.md,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: colors.white,
    fontSize: fontSize.subheading,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    gap: spacing.xl,
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
  fieldInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.body,
    paddingVertical: spacing.md,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: fontSize.small,
    fontWeight: "700",
  },
  submitButton: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  disabledButton: {
    backgroundColor: colors.textMuted,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.body,
    fontWeight: "800",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  footerNote: {
    color: colors.textMuted,
    fontSize: fontSize.small,
    lineHeight: 19,
  },
  footerLink: {
    color: colors.primary,
    fontSize: fontSize.small,
    fontWeight: "700",
  },
});
