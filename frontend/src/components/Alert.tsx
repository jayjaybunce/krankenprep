import React from "react";
import { AlertTriangle, Check } from "lucide-react";
import { useTheme } from "../hooks";
import theme from "../theme/theme";

interface AlertProps {
  type?: "info" | "success" | "warning" | "danger";
  title?: string;
  children: React.ReactNode;
}

const Alert = ({ type = "info", title, children }: AlertProps) => {
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

export default Alert;
