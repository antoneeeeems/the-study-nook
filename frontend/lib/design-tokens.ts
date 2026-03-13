export const themeNames = ["light", "dark"] as const;

export type ThemeName = (typeof themeNames)[number];

export const tokens = {
  color: {
    brand: {
      indigo: {
        950: "#15181d",
        900: "#1e232b",
        800: "#2a313b",
        700: "#39424f",
        600: "#4a5667",
        100: "#e7ebf1",
        50: "#f4f6fa",
      },
      teal: {
        500: "#2f9d95",
        400: "#53b8b0",
        300: "#82d0ca",
        100: "#d7efec",
        50: "#eff8f7",
      },
      coral: "#e36c3f",
    },
    semantic: {
      success: "#2f9d95",
      warning: "#c98a2f",
      danger: "#d14f66",
      info: "#4a5667",
    },
    chart: ["#4a5667", "#2f9d95", "#7f8a9a", "#c98a2f", "#d14f66", "#6384b3", "#6ca8a1", "#9a8571"],
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    full: "9999px",
  },
  shadow: {
    card: "0 1px 3px rgba(15, 23, 42, 0.05), 0 4px 18px -6px rgba(15, 23, 42, 0.08)",
    elevated: "0 6px 28px -8px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.07)",
    hover: "0 10px 34px -10px rgba(15, 23, 42, 0.15)",
  },
  motion: {
    duration: {
      fast: "160ms",
      base: "220ms",
      slow: "320ms",
    },
    easing: {
      standard: "cubic-bezier(0.16, 1, 0.3, 1)",
    },
  },
} as const;

export const metricThresholds = {
  lift: { strong: 1.2, weak: 1.0 },
  confidence: { strong: 0.45, weak: 0.3 },
  score: { strong: 0.7, weak: 0.4 },
} as const;
