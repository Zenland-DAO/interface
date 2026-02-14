"use client";

import { createContext, useContext, useCallback, useMemo, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "zenland-theme";

// Store for theme state
let themeListeners: Array<() => void> = [];
let currentTheme: Theme = "light";

function emitChange() {
  for (const listener of themeListeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  themeListeners = [...themeListeners, listener];
  return () => {
    themeListeners = themeListeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Theme {
  return currentTheme;
}

function getServerSnapshot(): Theme {
  return "light"; // Default theme for SSR
}

function updateTheme(newTheme: Theme) {
  if (currentTheme !== newTheme) {
    currentTheme = newTheme;
    
    // Update DOM
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    
    // Persist to localStorage
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {
        // localStorage might not be available
      }
    }
    
    emitChange();
  }
}

// Initialize theme from localStorage on client
if (typeof window !== "undefined") {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      currentTheme = storedTheme;
      // Apply initial theme class
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  } catch {
    // localStorage might not be available
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((newTheme: Theme) => {
    updateTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    updateTheme(currentTheme === "light" ? "dark" : "light");
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
