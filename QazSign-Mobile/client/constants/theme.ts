import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    textSecondary: "#5F6368",
    textMuted: "#9AA0A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#5F6368",
    tabIconSelected: "#1A73E8",
    link: "#1A73E8",
    primary: "#1A73E8",
    primaryDark: "#0D47A1",
    primaryLight: "#E8F0FE",
    success: "#34A853",
    successLight: "#E6F4EA",
    error: "#EA4335",
    errorLight: "#FCE8E6",
    warning: "#FBBC04",
    warningLight: "#FEF7E0",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F5F5F5",
    backgroundSecondary: "#EBEBEB",
    backgroundTertiary: "#E0E0E0",
    surfaceElevated: "#FFFFFF",
    cameraOverlay: "rgba(0, 0, 0, 0.7)",
    divider: "#E0E0E0",
    border: "#E0E0E0",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#9AA0A6",
    textMuted: "#5F6368",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9AA0A6",
    tabIconSelected: "#4DA3FF",
    link: "#4DA3FF",
    primary: "#4DA3FF",
    primaryDark: "#1A73E8",
    primaryLight: "#1E3A5F",
    success: "#34A853",
    successLight: "#1E3A2F",
    error: "#EA4335",
    errorLight: "#3A1E1E",
    warning: "#FBBC04",
    warningLight: "#3A351E",
    backgroundRoot: "#1F2123",
    backgroundDefault: "#2A2C2E",
    backgroundSecondary: "#353739",
    backgroundTertiary: "#404244",
    surfaceElevated: "#2A2C2E",
    cameraOverlay: "rgba(0, 0, 0, 0.8)",
    divider: "#404244",
    border: "#404244",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  "2xl": 40,
  "3xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 40,
  },
  hero: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "700" as const,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  floating: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
