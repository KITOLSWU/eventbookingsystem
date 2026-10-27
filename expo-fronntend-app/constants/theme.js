import { Platform } from "react-native";

/**
 * Shared design tokens.
 * Keeping colors, spacing, radii and shadows in one place keeps every
 * screen visually consistent and makes future theming straightforward.
 */
export const colors = {
  bg: "#F4F6FB",
  surface: "#FFFFFF",
  surfaceMuted: "#EDF1F9",
  border: "#E2E8F0",

  text: "#0B1220",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primarySoft: "#EAF1FF",

  accent: "#7C3AED",
  accentSoft: "#F1EBFF",

  success: "#15803D",
  successSoft: "#DCFCE7",

  danger: "#DC2626",
  dangerSoft: "#FEE2E2",

  warning: "#B45309",
  warningSoft: "#FEF3C7",

  dark: "#0B1220",
  darkSurface: "#151E31",
  white: "#FFFFFF",
  overlay: "rgba(6, 10, 20, 0.55)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const fontSize = {
  display: 30,
  title: 24,
  heading: 20,
  subheading: 17,
  body: 15,
  small: 13,
  tiny: 11,
};

// A quiet editorial serif for display headings; body copy keeps each platform's
// native sans-serif so forms and dense details remain familiar and readable.
export const fonts = {
  display: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" }),
};

export const shadow = {
  card: {
    shadowColor: "#0B1220",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  floating: {
    shadowColor: "#0B1220",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

