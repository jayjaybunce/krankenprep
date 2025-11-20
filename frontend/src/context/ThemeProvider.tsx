import { useState, useEffect } from "react";
import { ThemeContext } from "./ThemeContext";
import type { ColorMode } from "./ThemeContext";
import type { FC, PropsWithChildren } from "react";

const LS_THEME_KEY = "kp-theme";

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [colorMode, setColorMode] = useState<ColorMode>(
    (localStorage.getItem(LS_THEME_KEY) as ColorMode) ?? ("dark" as ColorMode),
  );
  // Using tailwind, the color mode selector lives on <html data-theme="dark">
  const htmlElement = document.querySelector("html");

  useEffect(() => {
    if (!htmlElement?.getAttribute("class")) {
      htmlElement?.setAttribute("class", colorMode);
    }
  }, []);

  const setColorModeEverywhere = (colorMode: ColorMode) => {
    // Lets us change state
    setColorMode(colorMode);
    // Changes the attribute on html element (this lets tailwind switch between light and dark styles)
    htmlElement?.setAttribute("class", colorMode);
    // Persistence across refresh
    localStorage.setItem(LS_THEME_KEY, colorMode);
  };

  const toggleColorMode: () => void = () => {
    if (colorMode === "light") {
      setColorModeEverywhere("dark");
    } else {
      setColorModeEverywhere("light");
    }
  };

  return (
    <ThemeContext value={{ colorMode, toggleColorMode }}>
      {children}
    </ThemeContext>
  );
};
