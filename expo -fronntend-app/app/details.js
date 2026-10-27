import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../context/AppStore";
import { AppButton, Field, IconButton } from "../components/ui";
import { colors, fontSize, radius, spacing } from "../constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAppStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = username.trim().length > 0 && password.trim().length > 0;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleLogin = async () => {
    if (!canSubmit || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const result = await login(username, password);

      if (!result.ok) {
        setMessage(result.message || "Login failed. Please try again.");
        return;
      }

      router.replace(result.role === "admin" ? "/organizer" : "/home");
    } catch (error) {
      setMessage(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
            <IconButton
              icon="arrow-back"
              color={colors.white}
              accessibilityLabel="Go back"
              onPress={handleBack}
              style={styles.backButton}
            />

            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Ionicons name="ticket" size={20} color={colors.white} />
              </View>
              <Text style={styles.brandName}>EventBooking</Text>
            </View>

            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Log in to book events, view your tickets and check in at the door.
            </Text>
          </View>

          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xxl }]}>
            <Field
              label="Username"
              icon="person-outline"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
            />

            <Field
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              right={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  hitSlop={10}
                  onPress={() => setShowPassword((current) => !current)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={21}
                    color={colors.textMuted}
                  />
                </Pressable>
              }
            />

            {message ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{message}</Text>
              </View>
            ) : null}

            <AppButton
              title="Log in"
              icon="arrow-forward"
              onPress={handleLogin}
              loading={loading}
              disabled={!canSubmit}
              style={styles.loginButton}
            />

            <View style={styles.hintCard}>
              <View style={styles.hintHeader}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.hintTitle}>Organizer demo access</Text>
              </View>
              <Text style={styles.hintText}>
                Username <Text style={styles.hintMono}>admin123</Text> · Password{" "}
                <Text style={styles.hintMono}>adminadmin</Text>
              </Text>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerNote}>
                New to EventBooking?{" "}
              </Text>
              <TouchableOpacity
                accessibilityRole="link"
                accessibilityLabel="Create account"
                onPress={() => router.push("/signup")}
              >
                <Text style={styles.footerLink}>Create account</Text>
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
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
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
  loginButton: {
    marginTop: spacing.xs,
  },
  hintCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  hintHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  hintTitle: {
    color: colors.primaryDark,
    fontSize: fontSize.small,
    fontWeight: "800",
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: fontSize.small,
    lineHeight: 20,
  },
  hintMono: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    fontWeight: "800",
    color: colors.text,
  },
  footerNote: {
    color: colors.textMuted,
    fontSize: fontSize.small,
    lineHeight: 19,
    textAlign: "center",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  footerLink: {
    color: colors.primary,
    fontSize: fontSize.small,
    fontWeight: "700",
  },
});
