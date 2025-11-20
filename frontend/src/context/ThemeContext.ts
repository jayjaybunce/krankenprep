import { createContext } from "react";
export type ColorMode = "dark" | "light";


export const ThemeContext = createContext<{
  colorMode: ColorMode;
  toggleColorMode: () => void;
}>({ colorMode: "dark", toggleColorMode: () => {} });
