"use client";

import { ThemeContext, TTheme } from "context/themeContext";
import { useEffect, useState } from "react";
import { TLayout } from "context/layoutContext";

type Props = {
  children: React.ReactNode;
};
function ContextWrapper({ children }: Props) {
  const [theme, setTheme] = useState<TTheme>("light");
  const [layout, setLayout] = useState<TLayout>("grid");

  useEffect(() => {
    console.log("ContextWrapper useEffect");
    if (typeof window === "undefined") return;
    const lsTheme = localStorage.getItem("theme");
    const lsLayout = localStorage.getItem("layout");
    const lsSitePassword =
      localStorage.getItem("sitePassword");

    if (
      lsTheme &&
      (lsTheme === "dark" || lsTheme === "light")
    ) {
      setTheme(lsTheme as TTheme);
    }
    if (
      lsLayout &&
      (lsLayout === "grid" || lsLayout === "list")
    ) {
      setLayout(lsLayout as TLayout);
    }
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.remove("dark");
    } else {
      document.body.classList.add("dark");
    }
  }, [theme]);

  return (
    <>
      <ThemeContext.Provider
        value={{
          theme,
          setTheme: (theme) => {
            if (typeof window !== "undefined") {
              localStorage.setItem("theme", theme);
            }
            setTheme(theme);
          },
        }}
      >
        {children}
      </ThemeContext.Provider>
    </>
  );
}

export default ContextWrapper;
