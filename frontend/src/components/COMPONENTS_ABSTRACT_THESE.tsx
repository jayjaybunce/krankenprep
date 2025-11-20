import React, { useState, createContext, useContext } from "react";
import {
  Sun,
  Moon,
  Plus,
  Check,
  Trash2,
  AlertTriangle,
  Settings,
  Download,
  Edit2,
} from "lucide-react";

// Theme Context
const ThemeContext = createContext({
  colorMode: "dark",
  toggleColorMode: () => {},
});

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { colorMode: "dark", toggleColorMode: () => {} };
  }
  return context;
};

// Theme Configuration
const theme = {
  light: {
    bg: {
      primary: "bg-slate-50",
      card: "bg-white",
      elevated: "bg-gradient-to-br from-white to-slate-50",
    },
    text: {
      primary: "text-slate-900",
      secondary: "text-slate-600",
      tertiary: "text-slate-500",
    },
    border: {
      primary: "border-slate-200",
      accent: "border-slate-300",
    },
    accent: {
      primary: "bg-gradient-to-r from-cyan-500 to-blue-600",
      secondary: "bg-gradient-to-r from-violet-500 to-purple-600",
    },
  },
  dark: {
    bg: {
      primary: "bg-slate-950",
      card: "bg-slate-900/50",
      elevated: "bg-gradient-to-br from-slate-900 to-slate-950",
    },
    text: {
      primary: "text-slate-50",
      secondary: "text-slate-300",
      tertiary: "text-slate-500",
    },
    border: {
      primary: "border-slate-800",
      accent: "border-slate-700",
    },
    accent: {
      primary: "bg-gradient-to-r from-cyan-500 to-blue-600",
      secondary: "bg-gradient-to-r from-violet-500 to-purple-600",
    },
  },
};

// Button Component - Redesigned
const Button = ({
  variant = "primary",
  size = "md",
  icon,
  children,
  onClick,
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 border border-cyan-400/20",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-lg shadow-slate-900/50 border border-slate-700",
    danger:
      "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 border border-rose-400/20",
    success:
      "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 border border-emerald-400/20",
    warning:
      "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 border border-amber-400/20",
    ghost:
      "bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-700/50 hover:border-slate-600 backdrop-blur-sm",
    outline:
      "bg-transparent border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 hover:border-cyan-400 shadow-lg shadow-cyan-500/10",
  };

  const sizes = {
    xs: "text-xs px-3 py-1.5",
    sm: "text-sm px-4 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 ${variants[variant]} ${sizes[size]}`}
    >
      {icon}
      {children}
    </button>
  );
};

// Card Component - Expanded with More Variants
const Card = ({
  children,
  variant = "default",
  hover = true,
  glow = false,
}) => {
  const { colorMode } = useTheme();
  const colors = colorMode === "dark" ? theme.dark : theme.light;

  const variants = {
    // Glass morphism cards
    default:
      colorMode === "dark"
        ? `bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-xl shadow-slate-950/50`
        : `bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg shadow-slate-200/50`,

    // Elevated with stronger shadow
    elevated:
      colorMode === "dark"
        ? `bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-2xl shadow-cyan-500/10`
        : `bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-xl shadow-slate-300/50`,

    // Primary gradient
    gradient: `bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 border-0 shadow-2xl shadow-cyan-500/30 text-white`,

    // Bordered with accent
    bordered:
      colorMode === "dark"
        ? `bg-slate-900/80 backdrop-blur-sm border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20`
        : `bg-white border-2 border-cyan-400 shadow-lg shadow-cyan-400/20`,

    // Solid with no transparency
    solid:
      colorMode === "dark"
        ? `bg-slate-900 border-slate-700 shadow-2xl shadow-black/50`
        : `bg-white border-slate-300 shadow-xl shadow-slate-400/30`,

    // Neon glow effect
    neon:
      colorMode === "dark"
        ? `bg-slate-900 border border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)]`
        : `bg-white border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]`,

    // Outlined minimal
    outlined:
      colorMode === "dark"
        ? `bg-transparent border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-900/30`
        : `bg-transparent border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50`,

    // Success themed
    success:
      colorMode === "dark"
        ? `bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-500/30 shadow-xl shadow-emerald-500/10`
        : `bg-gradient-to-br from-emerald-50 to-white border border-emerald-300 shadow-lg shadow-emerald-200/50`,

    // Warning themed
    warning:
      colorMode === "dark"
        ? `bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-500/30 shadow-xl shadow-amber-500/10`
        : `bg-gradient-to-br from-amber-50 to-white border border-amber-300 shadow-lg shadow-amber-200/50`,

    // Danger themed
    danger:
      colorMode === "dark"
        ? `bg-gradient-to-br from-rose-950/50 to-slate-900 border border-rose-500/30 shadow-xl shadow-rose-500/10`
        : `bg-gradient-to-br from-rose-50 to-white border border-rose-300 shadow-lg shadow-rose-200/50`,
  };

  const hoverEffect = hover
    ? "transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
    : "transition-all duration-300";
  const glowEffect = glow ? "animate-pulse" : "";

  return (
    <div
      className={`${variants[variant]} border rounded-2xl p-5 ${hoverEffect} ${glowEffect}`}
    >
      {children}
    </div>
  );
};

// Badge Component - Redesigned with Glow Effects
const Badge = ({ children, variant = "default" }) => {
  const { colorMode } = useTheme();

  const variants =
    colorMode === "dark"
      ? {
          default:
            "bg-slate-800 text-slate-300 border border-slate-700 shadow-lg shadow-slate-900/50",
          primary:
            "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/20",
          success:
            "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-500/20",
          warning:
            "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-lg shadow-amber-500/20",
          danger:
            "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-lg shadow-rose-500/20",
        }
      : {
          default:
            "bg-slate-100 text-slate-700 border border-slate-300 shadow-sm",
          primary:
            "bg-cyan-100 text-cyan-700 border border-cyan-300 shadow-lg shadow-cyan-500/10",
          success:
            "bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-lg shadow-emerald-500/10",
          warning:
            "bg-amber-100 text-amber-700 border border-amber-300 shadow-lg shadow-amber-500/10",
          danger:
            "bg-rose-100 text-rose-700 border border-rose-300 shadow-lg shadow-rose-500/10",
        };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${variants[variant]} transition-all duration-200`}
    >
      {children}
    </span>
  );
};

// Alert Component - Redesigned with Enhanced Styling
const Alert = ({ type = "info", title, children }) => {
  const { colorMode } = useTheme();
  const colors = colorMode === "dark" ? theme.dark : theme.light;

  const types =
    colorMode === "dark"
      ? {
          info: {
            bg: "bg-cyan-950/50 backdrop-blur-sm",
            border: "border-cyan-500/50 border-l-4 border-l-cyan-500",
            icon: <AlertTriangle className="w-5 h-5 text-cyan-400" />,
            iconBg: "bg-cyan-500/20 text-cyan-400",
          },
          success: {
            bg: "bg-emerald-950/50 backdrop-blur-sm",
            border: "border-emerald-500/50 border-l-4 border-l-emerald-500",
            icon: <Check className="w-5 h-5 text-emerald-400" />,
            iconBg: "bg-emerald-500/20 text-emerald-400",
          },
          warning: {
            bg: "bg-amber-950/50 backdrop-blur-sm",
            border: "border-amber-500/50 border-l-4 border-l-amber-500",
            icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
            iconBg: "bg-amber-500/20 text-amber-400",
          },
          danger: {
            bg: "bg-rose-950/50 backdrop-blur-sm",
            border: "border-rose-500/50 border-l-4 border-l-rose-500",
            icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
            iconBg: "bg-rose-500/20 text-rose-400",
          },
        }
      : {
          info: {
            bg: "bg-cyan-50 backdrop-blur-sm",
            border: "border-cyan-200 border-l-4 border-l-cyan-500",
            icon: <AlertTriangle className="w-5 h-5 text-cyan-600" />,
            iconBg: "bg-cyan-100 text-cyan-600",
          },
          success: {
            bg: "bg-emerald-50 backdrop-blur-sm",
            border: "border-emerald-200 border-l-4 border-l-emerald-500",
            icon: <Check className="w-5 h-5 text-emerald-600" />,
            iconBg: "bg-emerald-100 text-emerald-600",
          },
          warning: {
            bg: "bg-amber-50 backdrop-blur-sm",
            border: "border-amber-200 border-l-4 border-l-amber-500",
            icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
            iconBg: "bg-amber-100 text-amber-600",
          },
          danger: {
            bg: "bg-rose-50 backdrop-blur-sm",
            border: "border-rose-200 border-l-4 border-l-rose-500",
            icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
            iconBg: "bg-rose-100 text-rose-600",
          },
        };

  const style = types[type];

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-xl p-4 flex items-start gap-4 shadow-lg transition-all duration-200 hover:shadow-xl`}
    >
      <div className={`${style.iconBg} p-2 rounded-lg`}>{style.icon}</div>
      <div className="flex-1">
        {title && (
          <h4 className={`font-bold mb-1 ${colors.text.primary}`}>{title}</h4>
        )}
        <p className={`text-sm ${colors.text.secondary}`}>{children}</p>
      </div>
    </div>
  );
};

// Main Component
const ComponentShowcase = () => {
  const [colorMode, setColorMode] = useState("dark");
  const toggleColorMode = () =>
    setColorMode((prev) => (prev === "dark" ? "light" : "dark"));
  const colors = colorMode === "dark" ? theme.dark : theme.light;

  return (
    <ThemeContext.Provider value={{ colorMode, toggleColorMode }}>
      <div className={`min-h-screen ${colors.bg.primary} p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className={`text-3xl font-bold ${colors.text.primary}`}>
                Component Showcase
              </h1>
              <p className={`text-sm ${colors.text.secondary} mt-2`}>
                Testing theme components
              </p>
            </div>
            <Button
              variant="secondary"
              icon={
                colorMode === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )
              }
              onClick={toggleColorMode}
            >
              Toggle Theme
            </Button>
          </div>

          <div className="space-y-12">
            {/* Buttons Section */}
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${colors.text.primary}`}>
                Buttons
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div
                    className={`text-sm font-semibold ${colors.text.secondary} mb-4`}
                  >
                    LIGHT MODE
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3 shadow-inner">
                    <ThemeContext.Provider
                      value={{ colorMode: "light", toggleColorMode: () => {} }}
                    >
                      <Button
                        variant="primary"
                        icon={<Plus className="w-4 h-4" />}
                      >
                        Primary Button
                      </Button>
                      <Button
                        variant="secondary"
                        icon={<Check className="w-4 h-4" />}
                      >
                        Secondary Button
                      </Button>
                      <Button
                        variant="danger"
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        Danger Button
                      </Button>
                      <Button
                        variant="success"
                        icon={<Check className="w-4 h-4" />}
                      >
                        Success Button
                      </Button>
                      <Button
                        variant="warning"
                        icon={<AlertTriangle className="w-4 h-4" />}
                      >
                        Warning Button
                      </Button>
                      <Button
                        variant="ghost"
                        icon={<Settings className="w-4 h-4" />}
                      >
                        Ghost Button
                      </Button>
                      <Button
                        variant="outline"
                        icon={<Download className="w-4 h-4" />}
                      >
                        Outline Button
                      </Button>
                      <div className="flex gap-2 flex-wrap mt-3">
                        <Button size="xs">XS</Button>
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                      </div>
                    </ThemeContext.Provider>
                  </div>
                </div>
                <div>
                  <div
                    className={`text-sm font-semibold ${colors.text.secondary} mb-4`}
                  >
                    DARK MODE
                  </div>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-3 shadow-inner">
                    <ThemeContext.Provider
                      value={{ colorMode: "dark", toggleColorMode: () => {} }}
                    >
                      <Button
                        variant="primary"
                        icon={<Plus className="w-4 h-4" />}
                      >
                        Primary Button
                      </Button>
                      <Button
                        variant="secondary"
                        icon={<Check className="w-4 h-4" />}
                      >
                        Secondary Button
                      </Button>
                      <Button
                        variant="danger"
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        Danger Button
                      </Button>
                      <Button
                        variant="success"
                        icon={<Check className="w-4 h-4" />}
                      >
                        Success Button
                      </Button>
                      <Button
                        variant="warning"
                        icon={<AlertTriangle className="w-4 h-4" />}
                      >
                        Warning Button
                      </Button>
                      <Button
                        variant="ghost"
                        icon={<Settings className="w-4 h-4" />}
                      >
                        Ghost Button
                      </Button>
                      <Button
                        variant="outline"
                        icon={<Download className="w-4 h-4" />}
                      >
                        Outline Button
                      </Button>
                      <div className="flex gap-2 flex-wrap mt-3">
                        <Button size="xs">XS</Button>
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                      </div>
                    </ThemeContext.Provider>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards Section */}
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${colors.text.primary}`}>
                Cards
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div
                    className={`text-sm font-semibold ${colors.text.secondary} mb-4`}
                  >
                    LIGHT MODE
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner space-y-4">
                    <ThemeContext.Provider
                      value={{ colorMode: "light", toggleColorMode: () => {} }}
                    >
                      <Card variant="default">
                        <h3 className="font-bold text-slate-900 mb-2">
                          Default Card
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Glass morphism effect with subtle backdrop blur.
                        </p>
                      </Card>
                      <Card variant="elevated">
                        <h3 className="font-bold text-slate-900 mb-2">
                          Elevated Card
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Gradient background with enhanced shadow.
                        </p>
                      </Card>
                      <Card variant="gradient">
                        <h3 className="font-bold text-white mb-2">
                          Gradient Card
                        </h3>
                        <p className="text-cyan-100 text-sm">
                          Multi-color gradient background.
                        </p>
                      </Card>
                      <Card variant="bordered">
                        <h3 className="font-bold text-slate-900 mb-2">
                          Bordered Card
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Accent border with glow effect.
                        </p>
                      </Card>
                      <Card variant="solid">
                        <h3 className="font-bold text-slate-900 mb-2">
                          Solid Card
                        </h3>
                        <p className="text-slate-600 text-sm">
                          No transparency, strong shadow.
                        </p>
                      </Card>
                      <Card variant="neon">
                        <h3 className="font-bold text-slate-900 mb-2">
                          Neon Card
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Neon glow effect on hover.
                        </p>
                      </Card>
                      <Card variant="outlined" hover={false}>
                        <h3 className="font-bold text-slate-900 mb-2">
                          Outlined Card
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Minimal transparent style.
                        </p>
                      </Card>
                      <Card variant="success">
                        <h3 className="font-bold text-emerald-900 mb-2">
                          Success Card
                        </h3>
                        <p className="text-emerald-700 text-sm">
                          Success themed styling.
                        </p>
                      </Card>
                      <Card variant="warning">
                        <h3 className="font-bold text-amber-900 mb-2">
                          Warning Card
                        </h3>
                        <p className="text-amber-700 text-sm">
                          Warning themed styling.
                        </p>
                      </Card>
                      <Card variant="danger">
                        <h3 className="font-bold text-rose-900 mb-2">
                          Danger Card
                        </h3>
                        <p className="text-rose-700 text-sm">
                          Danger themed styling.
                        </p>
                      </Card>
                    </ThemeContext.Provider>
                  </div>
                </div>
                <div>
                  <div
                    className={`text-sm font-semibold ${colors.text.secondary} mb-4`}
                  >
                    DARK MODE
                  </div>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner space-y-4">
                    <ThemeContext.Provider
                      value={{ colorMode: "dark", toggleColorMode: () => {} }}
                    >
                      <Card variant="default">
                        <h3 className="font-bold text-slate-50 mb-2">
                          Default Card
                        </h3>
                        <p className="text-slate-300 text-sm">
                          Glass morphism effect with subtle backdrop blur.
                        </p>
                      </Card>
                      <Card variant="elevated">
                        <h3 className="font-bold text-slate-50 mb-2">
                          Elevated Card
                        </h3>
                        <p className="text-slate-300 text-sm">
                          Gradient background with enhanced shadow.
                        </p>
                      </Card>
                      <Card variant="gradient">
                        <h3 className="font-bold text-white mb-2">
                          Gradient Card
                        </h3>
                        <p className="text-cyan-100 text-sm">
                          Multi-color gradient background.
                        </p>
                      </Card>
                      <Card variant="bordered">
                        <h3 className="font-bold text-slate-50 mb-2">
                          Bordered Card
                        </h3>
                        <p className="text-slate-300 text-sm">
                          Accent border with glow effect.
                        </p>
                      </Card>
                      <Card variant="solid">
                        <h3 className="font-bold text-slate-50 mb-2">
                          Solid Card
                        </h3>
                        <p className="text-slate-300 text-sm">
                          No transparency, strong shadow.
                        </p>
                      </Card>
                      <Card variant="neon">
                        <h3 className="font-bold text-slate-50 mb-2">
                          Neon Card
                        </h3>
                        <p className="text-slate-300 text-sm">
                          Neon glow effect on hover.
                        </p>
                      </Card>
                      <Card variant="outlined" hover={false}>
                        <h3 className="font-bold text-slate-50 mb-2">
                          Outlined Card
                        </h3>
                        <p className="text-slate-300 text-sm">
                          Minimal transparent style.
                        </p>
                      </Card>
                      <Card variant="success">
                        <h3 className="font-bold text-emerald-300 mb-2">
                          Success Card
                        </h3>
                        <p className="text-emerald-400 text-sm">
                          Success themed styling.
                        </p>
                      </Card>
                      <Card variant="warning">
                        <h3 className="font-bold text-amber-300 mb-2">
                          Warning Card
                        </h3>
                        <p className="text-amber-400 text-sm">
                          Warning themed styling.
                        </p>
                      </Card>
                      <Card variant="danger">
                        <h3 className="font-bold text-rose-300 mb-2">
                          Danger Card
                        </h3>
                        <p className="text-rose-400 text-sm">
                          Danger themed styling.
                        </p>
                      </Card>
                    </ThemeContext.Provider>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges Section */}
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${colors.text.primary}`}>
                Badges
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div
                    className={`text-sm font-semibold ${colors.text.secondary} mb-4`}
                  >
                    LIGHT MODE
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
                    <ThemeContext.Provider
                      value={{ colorMode: "light", toggleColorMode: () => {} }}
                    >
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="default">Default</Badge>
                        <Badge variant="primary">Primary</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="danger">Danger</Badge>
                      </div>
                    </ThemeContext.Provider>
                  </div>
                </div>
                <div>
                  <div
                    className={`text-sm font-semibold ${colors.text.secondary} mb-4`}
                  >
                    DARK MODE
                  </div>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner">
                    <ThemeContext.Provider
                      value={{ colorMode: "dark", toggleColorMode: () => {} }}
                    >
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="default">Default</Badge>
                        <Badge variant="primary">Primary</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="danger">Danger</Badge>
                      </div>
                    </ThemeContext.Provider>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${colors.text.primary}`}>
                Alerts
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div
                    className={`text-sm font-semibold ${colors.text.secondary} mb-4`}
                  >
                    LIGHT MODE
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner space-y-4">
                    <ThemeContext.Provider
                      value={{ colorMode: "light", toggleColorMode: () => {} }}
                    >
                      <Alert type="info" title="Information">
                        This is an informational alert.
                      </Alert>
                      <Alert type="success" title="Success">
                        Action completed successfully!
                      </Alert>
                      <Alert type="warning" title="Warning">
                        Please be careful.
                      </Alert>
                      <Alert type="danger" title="Danger">
                        This cannot be undone!
                      </Alert>
                    </ThemeContext.Provider>
                  </div>
                </div>
                <div>
                  <div
                    className={`text-sm font-semibold ${colors.text.secondary} mb-4`}
                  >
                    DARK MODE
                  </div>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner space-y-4">
                    <ThemeContext.Provider
                      value={{ colorMode: "dark", toggleColorMode: () => {} }}
                    >
                      <Alert type="info" title="Information">
                        This is an informational alert.
                      </Alert>
                      <Alert type="success" title="Success">
                        Action completed successfully!
                      </Alert>
                      <Alert type="warning" title="Warning">
                        Please be careful.
                      </Alert>
                      <Alert type="danger" title="Danger">
                        This cannot be undone!
                      </Alert>
                    </ThemeContext.Provider>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default ComponentShowcase;
