import React, { createContext, useEffect, useState, useTransition } from "react";

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
  isPending: boolean;
};

export const LayoutContext = createContext<TLayoutContext>({
  layout: getLayoutFromLocalStorage(),
  setLayout: () => {
    void 0;
  },
  isPending: false,
});

type TLayoutProvider = {
  children: React.ReactNode;
};
export const LayoutProvider = ({ children }: TLayoutProvider) => {
  const [layout, setLayout] = useState<TLayout>("grid");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLayout(getLayoutFromLocalStorage());
  }, []);

  const onChangeLayout = (layout: TLayout) => {
    startTransition(() => {
      setLayout(layout);
      localStorage.setItem("layout", layout);
    });
  };

  return (
    <LayoutContext.Provider value={{ layout, setLayout: onChangeLayout, isPending }}>{children}</LayoutContext.Provider>
  );
};

export const useLayout = () => React.useContext(LayoutContext);
