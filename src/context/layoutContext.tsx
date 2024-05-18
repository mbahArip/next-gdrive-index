import React, { createContext, useEffect, useState } from "react";

export type TLayout = "grid" | "list";

const getLayoutFromLocalStorage = (): TLayout => {
  if (typeof window !== "undefined") {
    const layout = localStorage.getItem("layout");
    if (layout === "grid" || layout === "list") {
      return layout;
    }
  }
  return "grid";
};

export type TLayoutContext = {
  layout: TLayout;
  setLayout: (layout: TLayout) => void;
};

export const LayoutContext = createContext<TLayoutContext>({
  layout: getLayoutFromLocalStorage(),
  setLayout: () => {},
});

type TLayoutProvider = {
  children: React.ReactNode;
};
const LayoutProvider = ({ children }: TLayoutProvider) => {
  const [layout, setLayout] = useState<TLayout>("grid");

  useEffect(() => {
    setLayout(getLayoutFromLocalStorage());
  }, []);

  const onChangeLayout = (layout: TLayout) => {
    setLayout(layout);
    localStorage.setItem("layout", layout);
  };

  return <LayoutContext.Provider value={{ layout, setLayout: onChangeLayout }}>{children}</LayoutContext.Provider>;
};
export default LayoutProvider;
