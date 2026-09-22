import type { CSSProperties } from "react";
import {
  vs,
  vscDarkPlus,
  oneLight,
  dracula,
  solarizedlight,
  nord,
  oneDark,
  coldarkDark,
  duotoneLight,
  okaidia,
  gruvboxLight,
  gruvboxDark,
  atomDark,
  nightOwl,
  synthwave84,
} from "react-syntax-highlighter/dist/esm/styles/prism";

// Note display themes — typography + note-card "reskins" inspired by the
// conventions of well-regarded Obsidian community themes (font pairing,
// spacing rhythm, palette philosophy) and, for four of them, real
// documented open color specs (Tokyo Night, Rosé Pine, Gruvbox all publish
// their exact palette values; Catppuccin/Nord/Solarized likewise). Palette
// *values* are referenced where a theme draws on one of those; none of
// this reuses another theme's CSS, assets, or source code — only color
// values, font-pairing ideas, and (for code blocks) an already-installed
// syntax-highlighter's bundled, differently-licensed style presets.
//
// Each theme ships both a `light` and `dark` palette so it stays
// orthogonal to the app's own light/dark toggle (see useTheme) instead of
// fighting it. Colors are plain hex, applied via inline style rather than
// Tailwind classes — several of these palettes don't map cleanly onto
// Tailwind's default scale, and hex keeps every theme pixel-accurate to
// its reference palette.

export type ThemeId =
  | "minimal"
  | "warm-paper"
  | "pastel-dark"
  | "cool-contrast"
  | "tokyo-night"
  | "rose-pine"
  | "gruvbox"
  | "vesper"
  | "og-krankenprep"
  | "high-contrast"
  | "everforest"
  | "synthwave"
  | "uwu";

export type GoogleFontSpec = {
  family: string;
  weights: number[];
};

export type ThemeFonts = {
  heading: string; // CSS font-family value
  body: string; // CSS font-family value
  googleFonts: GoogleFontSpec[]; // [] = no webfont request (system stack only)
};

export type ThemePalette = {
  cardBg: string;
  cardBorder: string;
  heading: string;
  headingGradientFrom: string;
  headingGradientTo: string;
  body: string;
  muted: string;
  link: string;
  linkHover: string;
  strong: string;
  em: string;
  blockquoteBorder: string;
  blockquoteBg: string;
  blockquoteText: string;
  hr: string;
  tableHeaderBg: string;
  tableHeaderText: string;
  tableBorder: string;
  del: string;
};

// A react-syntax-highlighter Prism style object (its own per-token-type
// CSSProperties map) — typed loosely rather than importing the package's
// internal type, since this is otherwise a plain data module.
export type PrismStyle = { [tag: string]: CSSProperties };

export type ThemeTypography = {
  // Applied once, globally, via inline style + CSS inheritance — not per
  // element, unlike margins below.
  lineHeight: number;
  letterSpacing: string;
  // Multiplies every element's base margin/padding (see
  // data/noteTypography.ts noteMarginScale) — a theme's spacing
  // "personality," independent of the user's S/M/L size preference.
  spacingScale: number;
};

export type NoteTheme = {
  id: ThemeId;
  name: string;
  description: string;
  fonts: ThemeFonts;
  card: {
    radius: string; // literal Tailwind class
    shadow: string; // literal Tailwind class
  };
  typography: ThemeTypography;
  codeTheme: { light: PrismStyle; dark: PrismStyle };
  light: ThemePalette;
  dark: ThemePalette;
};

export const noteThemes: Record<ThemeId, NoteTheme> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean system sans, generous whitespace, a single restrained accent.",
    fonts: {
      heading:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      googleFonts: [], // system stack only — this is also the zero-network default
    },
    card: { radius: "rounded-lg", shadow: "shadow-sm" },
    typography: { lineHeight: 1.6, letterSpacing: "0", spacingScale: 1 },
    codeTheme: { light: vs, dark: vscDarkPlus },
    light: {
      cardBg: "#ffffff",
      cardBorder: "#e2e8f0",
      heading: "#0f172a",
      headingGradientFrom: "#0891b2",
      headingGradientTo: "#2563eb",
      body: "#334155",
      muted: "#64748b",
      link: "#0891b2",
      linkHover: "#0e7490",
      strong: "#0f172a",
      em: "#334155",
      blockquoteBorder: "#cbd5e1",
      blockquoteBg: "#f8fafc",
      blockquoteText: "#475569",
      hr: "#e2e8f0",
      tableHeaderBg: "#f1f5f9",
      tableHeaderText: "#0f172a",
      tableBorder: "#e2e8f0",
      del: "#94a3b8",
    },
    dark: {
      cardBg: "#1e293b",
      cardBorder: "#334155",
      heading: "#f8fafc",
      headingGradientFrom: "#22d3ee",
      headingGradientTo: "#60a5fa",
      body: "#cbd5e1",
      muted: "#94a3b8",
      link: "#22d3ee",
      linkHover: "#67e8f9",
      strong: "#f8fafc",
      em: "#cbd5e1",
      blockquoteBorder: "#475569",
      blockquoteBg: "#0f172a",
      blockquoteText: "#cbd5e1",
      hr: "#334155",
      tableHeaderBg: "#0f172a",
      tableHeaderText: "#f8fafc",
      tableBorder: "#334155",
      del: "#64748b",
    },
  },

  "warm-paper": {
    id: "warm-paper",
    name: "Warm Paper",
    description: "Serif reading type on a parchment card — cozy and literary.",
    fonts: {
      heading: '"Fraunces", Georgia, serif',
      body: '"Source Serif 4", Georgia, serif',
      googleFonts: [
        { family: "Fraunces", weights: [500, 600, 700] },
        { family: "Source Serif 4", weights: [400, 600] },
      ],
    },
    card: { radius: "rounded-md", shadow: "shadow-md" },
    typography: { lineHeight: 1.75, letterSpacing: "0.01em", spacingScale: 1.15 },
    codeTheme: { light: duotoneLight, dark: okaidia },
    light: {
      cardBg: "#f6efe1",
      cardBorder: "#e3d5b8",
      heading: "#4a3226",
      headingGradientFrom: "#a4622f",
      headingGradientTo: "#7a4a2c",
      body: "#4a3f36",
      muted: "#8a7a68",
      link: "#a4622f",
      linkHover: "#7a4a22",
      strong: "#3b2b1e",
      em: "#5c4a3a",
      blockquoteBorder: "#c9b48c",
      blockquoteBg: "#efe3cc",
      blockquoteText: "#5c4a3a",
      hr: "#ddcda8",
      tableHeaderBg: "#ede0c8",
      tableHeaderText: "#3b2b1e",
      tableBorder: "#ddcda8",
      del: "#a89882",
    },
    dark: {
      cardBg: "#241d17",
      cardBorder: "#3a2f24",
      heading: "#f1e4cc",
      headingGradientFrom: "#e0a458",
      headingGradientTo: "#c97b3d",
      body: "#e6d9c3",
      muted: "#a8977e",
      link: "#e0a458",
      linkHover: "#f0bd7c",
      strong: "#f6ead2",
      em: "#ddc9a8",
      blockquoteBorder: "#4a3c2c",
      blockquoteBg: "#2e251c",
      blockquoteText: "#d8c8ac",
      hr: "#3a2f24",
      tableHeaderBg: "#2e251c",
      tableHeaderText: "#f1e4cc",
      tableBorder: "#3a2f24",
      del: "#7c6c58",
    },
  },

  "pastel-dark": {
    id: "pastel-dark",
    name: "Pastel Dark",
    description: "Soft, muted pastel palette with rounded edges — Catppuccin-family colors.",
    fonts: {
      heading: '"Quicksand", sans-serif',
      body: '"Nunito", sans-serif',
      googleFonts: [
        { family: "Quicksand", weights: [600, 700] },
        { family: "Nunito", weights: [400, 600, 700] },
      ],
    },
    card: { radius: "rounded-2xl", shadow: "shadow-lg" },
    typography: { lineHeight: 1.65, letterSpacing: "0", spacingScale: 1.05 },
    codeTheme: { light: oneLight, dark: dracula },
    // Light palette follows Catppuccin Latte; dark follows Catppuccin Mocha.
    light: {
      cardBg: "#eff1f5",
      cardBorder: "#ccd0da",
      heading: "#4c4f69",
      headingGradientFrom: "#8839ef",
      headingGradientTo: "#ea76cb",
      body: "#4c4f69",
      muted: "#6c6f85",
      link: "#1e66f5",
      linkHover: "#7287fd",
      strong: "#4c4f69",
      em: "#5c5f77",
      blockquoteBorder: "#dc8a78",
      blockquoteBg: "#e6e9ef",
      blockquoteText: "#5c5f77",
      hr: "#ccd0da",
      tableHeaderBg: "#e6e9ef",
      tableHeaderText: "#4c4f69",
      tableBorder: "#ccd0da",
      del: "#9ca0b0",
    },
    dark: {
      cardBg: "#1e1e2e",
      cardBorder: "#313244",
      heading: "#cdd6f4",
      headingGradientFrom: "#cba6f7",
      headingGradientTo: "#f5c2e7",
      body: "#cdd6f4",
      muted: "#a6adc8",
      link: "#89b4fa",
      linkHover: "#b4befe",
      strong: "#f5e0dc",
      em: "#cdd6f4",
      blockquoteBorder: "#f5c2e7",
      blockquoteBg: "#181825",
      blockquoteText: "#bac2de",
      hr: "#313244",
      tableHeaderBg: "#181825",
      tableHeaderText: "#cdd6f4",
      tableBorder: "#313244",
      del: "#6c7086",
    },
  },

  "cool-contrast": {
    id: "cool-contrast",
    name: "Cool Contrast",
    description: "Crisp blue-gray palette built for legibility — Nord/Solarized-inspired.",
    fonts: {
      heading: '"IBM Plex Sans", sans-serif',
      body: '"IBM Plex Sans", sans-serif',
      googleFonts: [{ family: "IBM Plex Sans", weights: [400, 500, 600, 700] }],
    },
    card: { radius: "rounded-md", shadow: "shadow-sm" },
    typography: { lineHeight: 1.55, letterSpacing: "-0.005em", spacingScale: 0.9 },
    codeTheme: { light: solarizedlight, dark: nord },
    // Light palette follows Solarized Light; dark follows Nord.
    light: {
      cardBg: "#fdf6e3",
      cardBorder: "#eee8d5",
      heading: "#073642",
      headingGradientFrom: "#268bd2",
      headingGradientTo: "#2aa198",
      body: "#586e75",
      muted: "#93a1a1",
      link: "#268bd2",
      linkHover: "#2aa198",
      strong: "#073642",
      em: "#586e75",
      blockquoteBorder: "#93a1a1",
      blockquoteBg: "#eee8d5",
      blockquoteText: "#586e75",
      hr: "#eee8d5",
      tableHeaderBg: "#eee8d5",
      tableHeaderText: "#073642",
      tableBorder: "#eee8d5",
      del: "#93a1a1",
    },
    dark: {
      cardBg: "#2e3440",
      cardBorder: "#3b4252",
      heading: "#eceff4",
      headingGradientFrom: "#88c0d0",
      headingGradientTo: "#81a1c1",
      body: "#d8dee9",
      muted: "#a3aebd",
      link: "#88c0d0",
      linkHover: "#8fbcbb",
      strong: "#eceff4",
      em: "#d8dee9",
      blockquoteBorder: "#5e81ac",
      blockquoteBg: "#3b4252",
      blockquoteText: "#d8dee9",
      hr: "#3b4252",
      tableHeaderBg: "#3b4252",
      tableHeaderText: "#eceff4",
      tableBorder: "#434c5e",
      del: "#6b7484",
    },
  },

  "tokyo-night": {
    id: "tokyo-night",
    name: "Tokyo Night",
    description: "Deep indigo dusk with neon cyan/purple accents — an editor-theme favorite.",
    fonts: {
      heading: '"JetBrains Mono", monospace',
      body: '"Inter", sans-serif',
      googleFonts: [
        { family: "JetBrains Mono", weights: [600, 700] },
        { family: "Inter", weights: [400, 500] },
      ],
    },
    card: { radius: "rounded-lg", shadow: "shadow-md" },
    typography: { lineHeight: 1.6, letterSpacing: "0", spacingScale: 0.95 },
    codeTheme: { light: oneLight, dark: oneDark },
    // Light palette follows Tokyo Night Day; dark follows Tokyo Night.
    light: {
      cardBg: "#e1e2e7",
      cardBorder: "#c4c8da",
      heading: "#2e7de9",
      headingGradientFrom: "#2e7de9",
      headingGradientTo: "#9854f1",
      body: "#33467c",
      muted: "#848cb5",
      link: "#007197",
      linkHover: "#2e7de9",
      strong: "#3760bf",
      em: "#9854f1",
      blockquoteBorder: "#c4c8da",
      blockquoteBg: "#d7d9e0",
      blockquoteText: "#33467c",
      hr: "#c4c8da",
      tableHeaderBg: "#d7d9e0",
      tableHeaderText: "#33467c",
      tableBorder: "#c4c8da",
      del: "#848cb5",
    },
    dark: {
      cardBg: "#1a1b26",
      cardBorder: "#292e42",
      heading: "#c0caf5",
      headingGradientFrom: "#7aa2f7",
      headingGradientTo: "#bb9af7",
      body: "#a9b1d6",
      muted: "#565f89",
      link: "#7dcfff",
      linkHover: "#89ddff",
      strong: "#c0caf5",
      em: "#bb9af7",
      blockquoteBorder: "#3b4261",
      blockquoteBg: "#1f2335",
      blockquoteText: "#a9b1d6",
      hr: "#292e42",
      tableHeaderBg: "#1f2335",
      tableHeaderText: "#c0caf5",
      tableBorder: "#292e42",
      del: "#565f89",
    },
  },

  "rose-pine": {
    id: "rose-pine",
    name: "Rosé Pine",
    description: "Muted rose, gold, and pine on a soft natural backdrop.",
    fonts: {
      heading: '"Cormorant Garamond", Georgia, serif',
      body: '"Karla", sans-serif',
      googleFonts: [
        { family: "Cormorant Garamond", weights: [600, 700] },
        { family: "Karla", weights: [400, 500] },
      ],
    },
    card: { radius: "rounded-2xl", shadow: "shadow-md" },
    typography: { lineHeight: 1.7, letterSpacing: "0.005em", spacingScale: 1.1 },
    codeTheme: { light: duotoneLight, dark: coldarkDark },
    // Light palette follows Rosé Pine Dawn; dark follows Rosé Pine Moon.
    light: {
      cardBg: "#faf4ed",
      cardBorder: "#f2e9e1",
      heading: "#575279",
      headingGradientFrom: "#907aa9",
      headingGradientTo: "#d7827e",
      body: "#575279",
      muted: "#9893a5",
      link: "#56949f",
      linkHover: "#286983",
      strong: "#ea9d34",
      em: "#907aa9",
      blockquoteBorder: "#286983",
      blockquoteBg: "#fffaf3",
      blockquoteText: "#797593",
      hr: "#f2e9e1",
      tableHeaderBg: "#fffaf3",
      tableHeaderText: "#575279",
      tableBorder: "#f2e9e1",
      del: "#9893a5",
    },
    dark: {
      cardBg: "#232136",
      cardBorder: "#393552",
      heading: "#e0def4",
      headingGradientFrom: "#c4a7e7",
      headingGradientTo: "#ea9a97",
      body: "#e0def4",
      muted: "#6e6a86",
      link: "#9ccfd8",
      linkHover: "#3e8fb0",
      strong: "#f6c177",
      em: "#c4a7e7",
      blockquoteBorder: "#3e8fb0",
      blockquoteBg: "#2a273f",
      blockquoteText: "#908caa",
      hr: "#393552",
      tableHeaderBg: "#2a273f",
      tableHeaderText: "#e0def4",
      tableBorder: "#393552",
      del: "#6e6a86",
    },
  },

  gruvbox: {
    id: "gruvbox",
    name: "Gruvbox",
    description: "Warm retro terminal palette — cream and brown with earthy accents.",
    fonts: {
      heading: '"Space Mono", monospace',
      body: '"Work Sans", sans-serif',
      googleFonts: [
        { family: "Space Mono", weights: [700] },
        { family: "Work Sans", weights: [400, 500] },
      ],
    },
    card: { radius: "rounded-sm", shadow: "shadow-sm" },
    typography: { lineHeight: 1.6, letterSpacing: "0", spacingScale: 1 },
    codeTheme: { light: gruvboxLight, dark: gruvboxDark },
    light: {
      cardBg: "#fbf1c7",
      cardBorder: "#ebdbb2",
      heading: "#3c3836",
      headingGradientFrom: "#af3a03",
      headingGradientTo: "#b57614",
      body: "#3c3836",
      muted: "#7c6f64",
      link: "#076678",
      linkHover: "#427b58",
      strong: "#b57614",
      em: "#8f3f71",
      blockquoteBorder: "#d5c4a1",
      blockquoteBg: "#f2e5bc",
      blockquoteText: "#504945",
      hr: "#ebdbb2",
      tableHeaderBg: "#f2e5bc",
      tableHeaderText: "#3c3836",
      tableBorder: "#ebdbb2",
      del: "#928374",
    },
    dark: {
      cardBg: "#282828",
      cardBorder: "#3c3836",
      heading: "#ebdbb2",
      headingGradientFrom: "#fe8019",
      headingGradientTo: "#fabd2f",
      body: "#ebdbb2",
      muted: "#928374",
      link: "#83a598",
      linkHover: "#8ec07c",
      strong: "#fabd2f",
      em: "#d3869b",
      blockquoteBorder: "#504945",
      blockquoteBg: "#32302f",
      blockquoteText: "#d5c4a1",
      hr: "#3c3836",
      tableHeaderBg: "#32302f",
      tableHeaderText: "#ebdbb2",
      tableBorder: "#3c3836",
      del: "#928374",
    },
  },

  vesper: {
    id: "vesper",
    name: "Vesper",
    description: "Severe minimalism — near-monochrome with a single warm accent.",
    fonts: {
      heading: '"Archivo", sans-serif',
      body: '"Archivo", sans-serif',
      googleFonts: [{ family: "Archivo", weights: [500, 600, 700, 400] }],
    },
    card: { radius: "rounded-sm", shadow: "shadow-lg" },
    typography: { lineHeight: 1.8, letterSpacing: "0.02em", spacingScale: 1.3 },
    codeTheme: { light: vs, dark: atomDark },
    light: {
      cardBg: "#fafaf9",
      cardBorder: "#e5e4e1",
      heading: "#161616",
      headingGradientFrom: "#c97a3d",
      headingGradientTo: "#a85f27",
      body: "#2b2b2a",
      muted: "#8a8a8a",
      link: "#c97a3d",
      linkHover: "#161616",
      strong: "#161616",
      em: "#c97a3d",
      blockquoteBorder: "#d9d8d4",
      blockquoteBg: "#f2f2f0",
      blockquoteText: "#4a4a48",
      hr: "#e5e4e1",
      tableHeaderBg: "#f2f2f0",
      tableHeaderText: "#161616",
      tableBorder: "#e5e4e1",
      del: "#a9a9a6",
    },
    dark: {
      cardBg: "#101010",
      cardBorder: "#232323",
      heading: "#ffffff",
      headingGradientFrom: "#ffc799",
      headingGradientTo: "#e0ac7e",
      body: "#e6e6e6",
      muted: "#8a8a8a",
      link: "#ffc799",
      linkHover: "#ffffff",
      strong: "#ffffff",
      em: "#ffc799",
      blockquoteBorder: "#3a3a3a",
      blockquoteBg: "#161616",
      blockquoteText: "#b8b8b8",
      hr: "#232323",
      tableHeaderBg: "#161616",
      tableHeaderText: "#ffffff",
      tableBorder: "#232323",
      del: "#6b6b6b",
    },
  },

  "og-krankenprep": {
    id: "og-krankenprep",
    name: "OG Krankenprep",
    description: "The app's own native look — Montserrat, cyan-to-blue glow, slate cards.",
    fonts: {
      // Montserrat is already loaded app-wide (see App.css) — this theme
      // is the one exception that deliberately reuses it rather than
      // pulling its own webfont, since it's meant to feel like the rest
      // of the app, not a departure from it.
      heading: '"Montserrat", sans-serif',
      body: '"Montserrat", sans-serif',
      googleFonts: [],
    },
    card: { radius: "rounded-2xl", shadow: "shadow-xl shadow-cyan-500/10" },
    typography: { lineHeight: 1.6, letterSpacing: "0", spacingScale: 1 },
    codeTheme: { light: oneLight, dark: oneDark },
    light: {
      cardBg: "#ffffff",
      cardBorder: "#e2e8f0",
      heading: "#0f172a",
      headingGradientFrom: "#06b6d4",
      headingGradientTo: "#2563eb",
      body: "#334155",
      muted: "#64748b",
      link: "#0891b2",
      linkHover: "#0e7490",
      strong: "#0f172a",
      em: "#7c3aed",
      blockquoteBorder: "#06b6d4",
      blockquoteBg: "#f8fafc",
      blockquoteText: "#475569",
      hr: "#e2e8f0",
      tableHeaderBg: "#f1f5f9",
      tableHeaderText: "#0f172a",
      tableBorder: "#e2e8f0",
      del: "#94a3b8",
    },
    dark: {
      cardBg: "#161b2c",
      cardBorder: "#334155",
      heading: "#f8fafc",
      headingGradientFrom: "#06b6d4",
      headingGradientTo: "#2563eb",
      body: "#cbd5e1",
      muted: "#64748b",
      link: "#22d3ee",
      linkHover: "#67e8f9",
      strong: "#f8fafc",
      em: "#a78bfa",
      blockquoteBorder: "#06b6d4",
      blockquoteBg: "#0f172a",
      blockquoteText: "#cbd5e1",
      hr: "#334155",
      tableHeaderBg: "#0f172a",
      tableHeaderText: "#f8fafc",
      tableBorder: "#334155",
      del: "#64748b",
    },
  },

  "high-contrast": {
    id: "high-contrast",
    name: "High Contrast",
    description: "Pure black/white with one bright accent — built for maximum legibility.",
    fonts: {
      // Designed by the Braille Institute specifically for readers with
      // low vision — the right typographic choice here, not just an
      // aesthetic one.
      heading: '"Atkinson Hyperlegible", sans-serif',
      body: '"Atkinson Hyperlegible", sans-serif',
      googleFonts: [{ family: "Atkinson Hyperlegible", weights: [400, 700] }],
    },
    card: { radius: "rounded-md", shadow: "shadow-none" },
    typography: { lineHeight: 1.7, letterSpacing: "0.01em", spacingScale: 1.15 },
    codeTheme: { light: vs, dark: vscDarkPlus },
    light: {
      cardBg: "#ffffff",
      cardBorder: "#000000",
      heading: "#000000",
      headingGradientFrom: "#0057b8",
      headingGradientTo: "#000000",
      body: "#0a0a0a",
      muted: "#595959",
      link: "#0057b8",
      linkHover: "#000000",
      strong: "#000000",
      em: "#b8860b",
      blockquoteBorder: "#0057b8",
      blockquoteBg: "#f0f0f0",
      blockquoteText: "#1a1a1a",
      hr: "#000000",
      tableHeaderBg: "#f0f0f0",
      tableHeaderText: "#000000",
      tableBorder: "#000000",
      del: "#707070",
    },
    dark: {
      cardBg: "#000000",
      cardBorder: "#333333",
      heading: "#ffffff",
      headingGradientFrom: "#00e5ff",
      headingGradientTo: "#ffffff",
      body: "#f5f5f5",
      muted: "#a0a0a0",
      link: "#00e5ff",
      linkHover: "#ffffff",
      strong: "#ffffff",
      em: "#ffd60a",
      blockquoteBorder: "#00e5ff",
      blockquoteBg: "#0d0d0d",
      blockquoteText: "#e0e0e0",
      hr: "#333333",
      tableHeaderBg: "#0d0d0d",
      tableHeaderText: "#ffffff",
      tableBorder: "#333333",
      del: "#707070",
    },
  },

  everforest: {
    id: "everforest",
    name: "Everforest",
    description: "Soft forest green on warm cream or deep moss — calm and natural.",
    fonts: {
      heading: '"Comfortaa", sans-serif',
      body: '"Mulish", sans-serif',
      googleFonts: [
        { family: "Comfortaa", weights: [600, 700] },
        { family: "Mulish", weights: [400, 500] },
      ],
    },
    card: { radius: "rounded-xl", shadow: "shadow-md" },
    typography: { lineHeight: 1.7, letterSpacing: "0", spacingScale: 1.1 },
    codeTheme: { light: duotoneLight, dark: nightOwl },
    light: {
      cardBg: "#f3ead3",
      cardBorder: "#e0d5b8",
      heading: "#5c6a72",
      headingGradientFrom: "#8da101",
      headingGradientTo: "#35a77c",
      body: "#5c6a72",
      muted: "#939f91",
      link: "#3a94c5",
      linkHover: "#35a77c",
      strong: "#dfa000",
      em: "#df69ba",
      blockquoteBorder: "#8da101",
      blockquoteBg: "#e6dcc7",
      blockquoteText: "#5c6a72",
      hr: "#e0d5b8",
      tableHeaderBg: "#e6dcc7",
      tableHeaderText: "#5c6a72",
      tableBorder: "#e0d5b8",
      del: "#939f91",
    },
    dark: {
      cardBg: "#2d353b",
      cardBorder: "#3d484d",
      heading: "#d3c6aa",
      headingGradientFrom: "#a7c080",
      headingGradientTo: "#83c092",
      body: "#d3c6aa",
      muted: "#7a8478",
      link: "#7fbbb3",
      linkHover: "#83c092",
      strong: "#dbbc7f",
      em: "#d699b6",
      blockquoteBorder: "#a7c080",
      blockquoteBg: "#343f44",
      blockquoteText: "#9da9a0",
      hr: "#3d484d",
      tableHeaderBg: "#343f44",
      tableHeaderText: "#d3c6aa",
      tableBorder: "#3d484d",
      del: "#7a8478",
    },
  },

  synthwave: {
    id: "synthwave",
    name: "Synthwave",
    description: "Neon pink-to-cyan on a retro-futuristic dusk — vivid and playful.",
    fonts: {
      heading: '"Orbitron", sans-serif',
      body: '"Rajdhani", sans-serif',
      googleFonts: [
        { family: "Orbitron", weights: [700, 800] },
        { family: "Rajdhani", weights: [400, 500, 600] },
      ],
    },
    card: { radius: "rounded-xl", shadow: "shadow-xl shadow-pink-500/20" },
    typography: { lineHeight: 1.6, letterSpacing: "0.02em", spacingScale: 1 },
    codeTheme: { light: oneLight, dark: synthwave84 },
    light: {
      cardBg: "#fdf1fb",
      cardBorder: "#f0cdf0",
      heading: "#3d1a5c",
      headingGradientFrom: "#d6459a",
      headingGradientTo: "#0891b2",
      body: "#4a3a63",
      muted: "#8b7fa8",
      link: "#0891b2",
      linkHover: "#d6459a",
      strong: "#b8860b",
      em: "#d6459a",
      blockquoteBorder: "#d6459a",
      blockquoteBg: "#f7e6f5",
      blockquoteText: "#5c4a73",
      hr: "#f0cdf0",
      tableHeaderBg: "#f7e6f5",
      tableHeaderText: "#3d1a5c",
      tableBorder: "#f0cdf0",
      del: "#a89bc0",
    },
    dark: {
      cardBg: "#241b2f",
      cardBorder: "#463465",
      heading: "#f9f9f9",
      headingGradientFrom: "#ff7edb",
      headingGradientTo: "#36f9f6",
      body: "#e0d9f0",
      muted: "#8b7fa8",
      link: "#36f9f6",
      linkHover: "#ff7edb",
      strong: "#fede5d",
      em: "#ff7edb",
      blockquoteBorder: "#ff7edb",
      blockquoteBg: "#2d2140",
      blockquoteText: "#c9c0e0",
      hr: "#463465",
      tableHeaderBg: "#2d2140",
      tableHeaderText: "#f9f9f9",
      tableBorder: "#463465",
      del: "#6b5f87",
    },
  },

  uwu: {
    id: "uwu",
    name: "UwU",
    description: "notices ur boss strat *nuzzles* — bubblegum chaos, zero notes given.",
    fonts: {
      heading: '"Bubblegum Sans", cursive',
      body: '"Comic Neue", cursive',
      googleFonts: [
        { family: "Bubblegum Sans", weights: [400] },
        { family: "Comic Neue", weights: [400, 700] },
      ],
    },
    // Maximum rounding + a pastel glow, because normal border-radius
    // wasn't a big enough bit.
    card: { radius: "rounded-[2.5rem]", shadow: "shadow-2xl shadow-pink-400/50" },
    typography: { lineHeight: 1.8, letterSpacing: "0.03em", spacingScale: 1.3 },
    // The one part of this theme played completely straight — stock
    // VS Code light/dark — because a code block screaming in hot pink
    // would stop being funny and start being a diff nobody can read.
    codeTheme: { light: vs, dark: vscDarkPlus },
    light: {
      cardBg: "#fff0f8",
      cardBorder: "#ff9ecb",
      heading: "#d6409f",
      headingGradientFrom: "#ff6ec7",
      headingGradientTo: "#b78cf0",
      body: "#5c4b66",
      muted: "#a68fc0",
      link: "#ff2fa0",
      linkHover: "#8b2fc9",
      strong: "#ff2fa0",
      em: "#b78cf0",
      blockquoteBorder: "#ff9ecb",
      blockquoteBg: "#f5ecff",
      blockquoteText: "#8a7398",
      hr: "#ffc2e2",
      tableHeaderBg: "#ffe0f0",
      tableHeaderText: "#d6409f",
      tableBorder: "#ffc2e2",
      del: "#d9b8cc",
    },
    dark: {
      cardBg: "#1f1425",
      cardBorder: "#ff6ec7",
      heading: "#ffb3e6",
      headingGradientFrom: "#ff6ec7",
      headingGradientTo: "#c084fc",
      body: "#f0d9f5",
      muted: "#b48ac9",
      link: "#ff8fd4",
      linkHover: "#ffffff",
      strong: "#ffe0f7",
      em: "#c084fc",
      blockquoteBorder: "#ff6ec7",
      blockquoteBg: "#2a1a30",
      blockquoteText: "#d9b8e8",
      hr: "#4a2f52",
      tableHeaderBg: "#2a1a30",
      tableHeaderText: "#ffb3e6",
      tableBorder: "#4a2f52",
      del: "#8a6b94",
    },
  },
};

export const noteThemeList = Object.values(noteThemes);

export const DEFAULT_THEME_ID: ThemeId = "minimal";

// Palette values as CSS custom properties, meant to be spread into a
// wrapper's inline `style`. Consumers reference them via Tailwind
// arbitrary values, e.g. `text-(--nt-link) hover:text-(--nt-link-hover)`
// — that keeps hover states working without hand-rolled mouseenter/leave
// handlers, which a plain inline `style` color can't express.
export const themeCssVars = (p: ThemePalette): Record<string, string> => ({
  "--nt-card-bg": p.cardBg,
  "--nt-card-border": p.cardBorder,
  "--nt-heading": p.heading,
  "--nt-heading-from": p.headingGradientFrom,
  "--nt-heading-to": p.headingGradientTo,
  "--nt-body": p.body,
  "--nt-muted": p.muted,
  "--nt-link": p.link,
  "--nt-link-hover": p.linkHover,
  "--nt-strong": p.strong,
  "--nt-em": p.em,
  "--nt-blockquote-border": p.blockquoteBorder,
  "--nt-blockquote-bg": p.blockquoteBg,
  "--nt-blockquote-text": p.blockquoteText,
  "--nt-hr": p.hr,
  "--nt-table-header-bg": p.tableHeaderBg,
  "--nt-table-header-text": p.tableHeaderText,
  "--nt-table-border": p.tableBorder,
  "--nt-del": p.del,
});

// Builds a Google Fonts CSS2 stylesheet URL for a theme's font list, or
// null when the theme uses a system stack (nothing to fetch).
export const buildGoogleFontsHref = (fonts: GoogleFontSpec[]): string | null => {
  if (fonts.length === 0) return null;
  const families = fonts
    .map(
      (f) =>
        `family=${f.family.replace(/ /g, "+")}:wght@${[...f.weights].sort((a, b) => a - b).join(";")}`,
    )
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
};

// Collapses multiple GoogleFontSpec entries for the same family (e.g. two
// themes both using "Inter" at different weights) into one entry with the
// union of weights — otherwise buildGoogleFontsHref would emit that family
// as a repeated `family=` param, which some of its weight requests could
// silently lose to the others depending on how the API resolves dupes.
export const mergeGoogleFonts = (fonts: GoogleFontSpec[]): GoogleFontSpec[] => {
  const weightsByFamily = new Map<string, Set<number>>();
  for (const { family, weights } of fonts) {
    const set = weightsByFamily.get(family) ?? new Set<number>();
    weights.forEach((w) => set.add(w));
    weightsByFamily.set(family, set);
  }
  return [...weightsByFamily.entries()].map(([family, weights]) => ({
    family,
    weights: [...weights],
  }));
};
