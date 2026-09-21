import { useColorScheme, vars } from "nativewind";

const brand = {
  primary: "#4F46E5",
  primaryForeground: "#FFFFFF",
  primaryHover: "#4338CA",

  destructive: "#DC2626",
  destructiveForeground: "#FFFFFF",
} as const;

export const appThemeColors = {
  light: {
    ...brand,

    background: "#F7F8FA",
    foreground: "#171A1F",
    card: "#FFFFFF",
    cardForeground: "#171A1F",
    tabBackground: "#FFFFFF",

    muted: "#F1F3F6",
    mutedForeground: "#6B7280",
    secondary: "#F1F3F6",
    secondaryForeground: "#171A1F",
    accent: "#EEF2FF",
    accentForeground: "#3730A3",

    input: "#F1F3F6",
    inputBorder: "#E5E7EB",
    border: "#E5E7EB",
    ring: "#4F46E5",

    primaryMuted: "#EEF2FF",

    success: "#22A06B",
    successForeground: "#FFFFFF",
    successMuted: "#E6F7EF",

    warning: "#D97706",
    warningForeground: "#FFFFFF",
    warningMuted: "#FFF4E5",

    disabled: "#ECEFF3",
    disabledForeground: "#9CA3AF",

    overlay: "#111318",
  },

  dark: {
    primary: "#818CF8",
    primaryForeground: "#111318",
    primaryHover: "#6366F1",

    destructive: "#F87171",
    destructiveForeground: "#111318",

    background: "#111318",
    foreground: "#F8FAFC",
    card: "#191C22",
    cardForeground: "#F8FAFC",
    tabBackground: "#191C22",

    muted: "#22262D",
    mutedForeground: "#9CA3AF",
    secondary: "#22262D",
    secondaryForeground: "#F8FAFC",
    accent: "#262A45",
    accentForeground: "#C7D2FE",

    input: "#22262D",
    inputBorder: "#2F343C",
    border: "#2F343C",
    ring: "#818CF8",

    primaryMuted: "#262A45",

    success: "#4ADE9B",
    successForeground: "#0B1711",
    successMuted: "#17362B",

    warning: "#F59E0B",
    warningForeground: "#1F1604",
    warningMuted: "#3B2B0D",

    disabled: "#2A2E35",
    disabledForeground: "#6B7280",

    overlay: "#000000",
  },
} as const;

export type AppThemeColor = keyof (typeof appThemeColors)["light"];

type ThemeColors = Record<AppThemeColor, string>;

const rgb = (hex: string) => {
  const value = Number.parseInt(hex.slice(1), 16);

  return `${value >> 16} ${(value >> 8) & 255} ${value & 255}`;
};

const createTheme = (colors: ThemeColors) =>
  vars({
    "--color-accent": rgb(colors.accent),
    "--color-accent-foreground": rgb(colors.accentForeground),

    "--color-background": rgb(colors.background),
    "--color-border": rgb(colors.border),

    "--color-card": rgb(colors.card),
    "--color-card-foreground": rgb(colors.cardForeground),

    "--color-destructive": rgb(colors.destructive),
    "--color-destructive-foreground": rgb(colors.destructiveForeground),

    "--color-disabled": rgb(colors.disabled),
    "--color-disabled-foreground": rgb(colors.disabledForeground),

    "--color-foreground": rgb(colors.foreground),

    "--color-input": rgb(colors.input),
    "--color-input-border": rgb(colors.inputBorder),

    "--color-muted": rgb(colors.muted),
    "--color-muted-foreground": rgb(colors.mutedForeground),

    "--color-overlay": rgb(colors.overlay),

    "--color-primary": rgb(colors.primary),
    "--color-primary-foreground": rgb(colors.primaryForeground),
    "--color-primary-hover": rgb(colors.primaryHover),
    "--color-primary-muted": rgb(colors.primaryMuted),

    "--color-ring": rgb(colors.ring),

    "--color-secondary": rgb(colors.secondary),
    "--color-secondary-foreground": rgb(colors.secondaryForeground),

    "--color-success": rgb(colors.success),
    "--color-success-foreground": rgb(colors.successForeground),
    "--color-success-muted": rgb(colors.successMuted),

    "--color-tab-background": rgb(colors.tabBackground),

    "--color-warning": rgb(colors.warning),
    "--color-warning-foreground": rgb(colors.warningForeground),
    "--color-warning-muted": rgb(colors.warningMuted),
  });

export const appThemes = {
  light: createTheme(appThemeColors.light),
  dark: createTheme(appThemeColors.dark),
};

export function useAppThemeColor(color: AppThemeColor) {
  const { colorScheme } = useColorScheme();

  return appThemeColors[colorScheme === "dark" ? "dark" : "light"][color];
}
