"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ThemeName } from "@/lib/design-tokens";

type ThemePreference = ThemeName | "system";

interface ThemeContextValue {
  theme: ThemeName;
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "schoolmart-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialPreference(): ThemePreference {
  if (globalThis.window === undefined) {
    return "system";
  }
  const stored = globalThis.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function resolveTheme(preference: ThemePreference): ThemeName {
  if (preference !== "system") {
    return preference;
  }
  if (globalThis.window === undefined) {
    return "light";
  }
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [preference, setPreference] = useState<ThemePreference>(() => getInitialPreference());
  const [theme, setTheme] = useState<ThemeName>(() => resolveTheme(getInitialPreference()));

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const media = globalThis.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (preference === "system") {
        setTheme(media.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [preference]);

  const onSetPreference = useCallback((value: ThemePreference) => {
    setPreference(value);
    setTheme(resolveTheme(value));
    globalThis.localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemePreference = theme === "dark" ? "light" : "dark";
    onSetPreference(next);
  }, [theme, onSetPreference]);

  const value = useMemo(
    () => ({ theme, preference, setPreference: onSetPreference, toggleTheme }),
    [theme, preference, onSetPreference, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
