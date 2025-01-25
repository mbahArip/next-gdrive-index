import React, { createContext, useEffect, useState } from "react";

const DefaultQuery = "(min-width: 768px)";
export type TResponsiveContext = {
  isDesktop: boolean;
  isMobile: boolean;
};
export const ResponsiveContext = createContext<TResponsiveContext>({ isDesktop: true, isMobile: false });

type TResponsiveProvider = {
  query?: string;
  children: React.ReactNode;
};
export const ResponsiveProvider = ({ query = DefaultQuery, children }: TResponsiveProvider) => {
  const [isDesktop, setDesktop] = useState<boolean>(true);

  useEffect(() => {
    function onChangeLayout(event: MediaQueryListEvent) {
      setDesktop(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener("change", onChangeLayout);
    setDesktop(result.matches);

    return () => result.removeEventListener("change", onChangeLayout);
  }, [query]);

  return (
    <ResponsiveContext.Provider value={{ isDesktop, isMobile: !isDesktop }}>{children}</ResponsiveContext.Provider>
  );
};

export const useResponsive = () => {
  const context = React.useContext(ResponsiveContext);
  if (!context) {
    throw new Error("useResponsive must be used within a ResponsiveProvider");
  }

  return context;
};
