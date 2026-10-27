import { useEffect, useRef } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { testBackend } from "../services/api";
import { colors, fontSize, fonts, radius, spacing } from "../constants/theme";

const slides = [
  {
    key: "discover",
    eyebrow: "Discover",
    icon: "compass-outline",
    title: "Find events worth showing up for",
    subtitle: "Concerts, conferences and community meetups — all in one place.",
    image: require("../assets/intro1.gif"),
  },
  {
    key: "tickets",
    eyebrow: "Tickets",
    icon: "qr-code-outline",
    title: "Book in seconds. Scan at the door.",
    subtitle: "Your digital QR ticket gets you checked in without the queue.",
    image: require("../assets/app_slide_5.jpg"),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const sliderRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Backend availability is optional here — never block onboarding on it.
    testBackend().catch(() => {});
  }, []);

  const goToLogin = () => router.replace("/details");

  const renderSlide = ({ item }) => (
    <ImageBackground source={item.image} style={styles.slide} resizeMode="cover">
      <View style={styles.scrim} />
      <View style={[styles.slideContent, { paddingBottom: insets.bottom + 140 }]}>
        <View style={styles.eyebrowRow}>
          <Ionicons name={item.icon} size={16} color={colors.white} />
          <Text style={styles.eyebrow}>{item.eyebrow}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </ImageBackground>
  );

  const renderPagination = (activeIndex) => {
    const isLast = activeIndex === slides.length - 1;

    return (
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <View
              key={slide.key}
              style={[styles.dot, index === activeIndex && styles.activeDot]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {isLast ? (
            <View />
          ) : (
            <Pressable accessibilityRole="button" onPress={goToLogin} hitSlop={12}>
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLast ? "Get started" : "Next slide"}
            onPress={() => {
              if (isLast) {
                goToLogin();
              } else {
                sliderRef.current?.goToSlide(activeIndex + 1);
              }
            }}
            style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
          >
            <Text style={styles.nextLabel}>{isLast ? "Get started" : "Next"}</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.dark} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AppIntroSlider
        ref={sliderRef}
        data={slides}
        keyExtractor={(item) => item.key}
        renderItem={renderSlide}
        renderPagination={renderPagination}
        onDone={goToLogin}
        onSkip={goToLogin}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  slide: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  slideContent: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.white,
    fontSize: fontSize.small,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  footer: {
    gap: spacing.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.white,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  skip: {
    color: "rgba(255,255,255,0.85)",
    fontSize: fontSize.body,
    fontWeight: "700",
    paddingVertical: spacing.sm,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  nextLabel: {
    color: colors.dark,
    fontSize: fontSize.body,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
