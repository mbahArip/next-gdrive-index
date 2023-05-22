"use client";

import { ThemeContext, TTheme } from "context/themeContext";
import { useEffect, useState } from "react";
import {
  LayoutContext,
  TLayout,
} from "context/layoutContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

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
        <LayoutContext.Provider
          value={{
            layout,
            setLayout: (layout) => {
              if (typeof window !== "undefined") {
                localStorage.setItem("layout", layout);
              }
              setLayout(layout);
            },
          }}
        >
          <ToastContainer
            position='bottom-center'
            autoClose={2500}
            limit={3}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover={false}
            theme={theme}
          />
          {children}
        </LayoutContext.Provider>
      </ThemeContext.Provider>
    </>
  );
}

export default ContextWrapper;
