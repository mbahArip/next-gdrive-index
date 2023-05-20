"use client";

import React, {
  createContext,
  useState,
  useEffect,
} from "react";

export type TTheme = "dark" | "light";

const getThemeFromLocalStorage = (): TTheme => {
  if (typeof window !== "undefined") {
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || theme === "light") {
      return theme;
    }
  }
  return "light";
};

export type TThemeContext = {
  theme: TTheme;
  setTheme: (theme: TTheme) => void;
};

export const ThemeContext = createContext<TThemeContext>({
  theme: getThemeFromLocalStorage(),
  setTheme: () => {},
});

type TThemeProvider = {
  children: React.ReactNode;
};

const ThemeProvider = ({ children }: TThemeProvider) => {
  const [theme, setTheme] = useState<TTheme>("dark");

  useEffect(() => {
    setTheme(getThemeFromLocalStorage());
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
