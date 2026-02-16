import React, {
  useState,
  useRef,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";
import { useTheme } from "../../hooks";

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  description?: string;
}

interface DropdownAction {
  icon?: React.ReactNode;
  label: string;
  handleClick: () => void;
  disabled?: boolean;
  description?: string;
}

type DropdownVariant =
  | "default"
  | "elevated"
  | "neon"
  | "neon-gradient"
  | "success"
  | "warning"
  | "danger"
  | "minimal";

type DropdownSize = "xs" | "sm" | "md" | "lg";

interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value: T | T[] | null;
  onChange: Dispatch<SetStateAction<T | T[] | null>>;
  placeholder?: string;
  variant?: DropdownVariant;
  size?: DropdownSize;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  maxHeight?: string;
  label?: string;
  error?: string;
  helperText?: string;
  actions?: DropdownAction[];
  valueComparator?: (a: T, b: T) => boolean;
  getOptionKey?: (option: DropdownOption<T>, index: number) => string | number;
}

export const Dropdown = <T = string,>({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  variant = "default",
  size = "md",
  multiple = false,
  searchable = false,
  disabled = false,
  clearable = false,
  maxHeight = "300px",
  label,
  error,
  helperText,
  actions = [],
  valueComparator,
  getOptionKey,
}: DropdownProps<T>) => {
  const { colorMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Default comparator uses strict equality, or custom comparator if provided
  const compareValues = (a: T, b: T): boolean => {
    if (valueComparator) {
      return valueComparator(a, b);
    }
    return a === b;
  };

  const filteredOptions = searchable
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          option.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options;

  const getSelectedOptions = () => {
    if (!value) return [];
    const values = Array.isArray(value) ? value : [value];
    return options.filter((opt) =>
      values.some((val) => compareValues(opt.value, val)),
    );
  };

  const selectedOptions = getSelectedOptions();

  const handleSelect = (optionValue: T) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : value ? [value] : [];
      const isAlreadySelected = currentValues.some((v) =>
        compareValues(v, optionValue),
      );
      const newValues = isAlreadySelected
        ? currentValues.filter((v) => !compareValues(v, optionValue))
        : [...currentValues, optionValue];
      onChange(newValues as T[]);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? ([] as T[]) : null);
  };

  const sizeStyles = {
    xs: {
      trigger: "text-xs px-3 py-1.5 min-h-[28px]",
      option: "text-xs px-3 py-1.5",
      icon: "w-3 h-3",
      search: "text-xs px-3 py-1.5",
    },
    sm: {
      trigger: "text-sm px-3 py-2 min-h-[36px]",
      option: "text-sm px-3 py-2",
      icon: "w-4 h-4",
      search: "text-sm px-3 py-2",
    },
    md: {
      trigger: "text-sm px-4 py-2.5 min-h-[42px]",
      option: "text-sm px-4 py-2.5",
      icon: "w-4 h-4",
      search: "text-sm px-4 py-2.5",
    },
    lg: {
      trigger: "text-base px-5 py-3 min-h-[48px]",
      option: "text-base px-5 py-3",
      icon: "w-5 h-5",
      search: "text-base px-5 py-3",
    },
  };

  const triggerVariants =
    colorMode === "dark"
      ? {
          default:
            "bg-slate-900/50 backdrop-blur-xl border-slate-800 text-slate-50 hover:bg-slate-900/70 hover:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
          elevated:
            "bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-slate-50 shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 focus:border-cyan-500",
          neon: "bg-slate-900 border border-cyan-500 text-slate-50 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] focus:shadow-[0_0_40px_rgba(6,182,212,0.6)]",
          "neon-gradient":
            "bg-slate-900/50 backdrop-blur-xl border-2 border-transparent text-slate-50 hover:bg-slate-900/70 focus:ring-2 focus:ring-transparent",
          success:
            "bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-500/30 text-emerald-50 hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
          warning:
            "bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-500/30 text-amber-50 hover:border-amber-500/50 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
          danger:
            "bg-gradient-to-br from-rose-950/50 to-slate-900 border border-rose-500/30 text-rose-50 hover:border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20",
          minimal:
            "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-900/30 hover:border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
        }
      : {
          default:
            "bg-white/80 backdrop-blur-sm border-slate-200 text-slate-900 hover:bg-white hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
          elevated:
            "bg-gradient-to-br from-white to-slate-50 border-slate-200 text-slate-900 shadow-xl shadow-slate-300/50 hover:shadow-2xl focus:border-cyan-500",
          neon: "bg-white border-2 border-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] focus:shadow-[0_0_35px_rgba(6,182,212,0.5)]",
          "neon-gradient":
            "bg-white/80 backdrop-blur-sm border-2 border-transparent text-slate-900 hover:bg-white focus:ring-2 focus:ring-transparent",
          success:
            "bg-gradient-to-br from-emerald-50 to-white border border-emerald-300 text-emerald-900 hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
          warning:
            "bg-gradient-to-br from-amber-50 to-white border border-amber-300 text-amber-900 hover:border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
          danger:
            "bg-gradient-to-br from-rose-50 to-white border border-rose-300 text-rose-900 hover:border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20",
          minimal:
            "bg-transparent border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
        };

  const menuVariants =
    colorMode === "dark"
      ? {
          default:
            "bg-slate-900/95 backdrop-blur-xl border-slate-800 shadow-2xl shadow-slate-950/50",
          elevated:
            "bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-2xl shadow-cyan-500/10",
          neon: "bg-slate-900/95 backdrop-blur-xl border border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]",
          "neon-gradient":
            "bg-slate-900/95 backdrop-blur-xl border-2 border-transparent shadow-2xl shadow-rose-500/20",
          success:
            "bg-gradient-to-br from-emerald-950/95 to-slate-900/95 backdrop-blur-xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/10",
          warning:
            "bg-gradient-to-br from-amber-950/95 to-slate-900/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl shadow-amber-500/10",
          danger:
            "bg-gradient-to-br from-rose-950/95 to-slate-900/95 backdrop-blur-xl border border-rose-500/30 shadow-2xl shadow-rose-500/10",
          minimal:
            "bg-slate-900/95 backdrop-blur-xl border-slate-700 shadow-xl shadow-slate-950/50",
        }
      : {
          default:
            "bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl shadow-slate-300/50",
          elevated:
            "bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-2xl shadow-slate-400/30",
          neon: "bg-white/95 backdrop-blur-xl border-2 border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.3)]",
          "neon-gradient":
            "bg-white/95 backdrop-blur-xl border-2 border-transparent shadow-2xl shadow-cyan-500/20",
          success:
            "bg-gradient-to-br from-emerald-50/95 to-white/95 backdrop-blur-xl border border-emerald-300 shadow-2xl shadow-emerald-500/10",
          warning:
            "bg-gradient-to-br from-amber-50/95 to-white/95 backdrop-blur-xl border border-amber-300 shadow-2xl shadow-amber-500/10",
          danger:
            "bg-gradient-to-br from-rose-50/95 to-white/95 backdrop-blur-xl border border-rose-300 shadow-2xl shadow-rose-500/10",
          minimal:
            "bg-white/95 backdrop-blur-xl border-slate-200 shadow-xl shadow-slate-300/50",
        };

  const optionHoverStyles =
    colorMode === "dark"
      ? {
          default: "hover:bg-slate-800/70 hover:text-cyan-400",
          elevated: "hover:bg-slate-800/70 hover:text-cyan-400",
          neon: "hover:bg-cyan-500/10 hover:text-cyan-400",
          "neon-gradient": "hover:bg-rose-500/10 hover:text-rose-400",
          success: "hover:bg-emerald-500/10 hover:text-emerald-400",
          warning: "hover:bg-amber-500/10 hover:text-amber-400",
          danger: "hover:bg-rose-500/10 hover:text-rose-400",
          minimal: "hover:bg-slate-800/50 hover:text-cyan-400",
        }
      : {
          default: "hover:bg-slate-100 hover:text-cyan-600",
          elevated: "hover:bg-slate-50 hover:text-cyan-600",
          neon: "hover:bg-cyan-50 hover:text-cyan-700",
          "neon-gradient": "hover:bg-cyan-50 hover:text-cyan-700",
          success: "hover:bg-emerald-50 hover:text-emerald-700",
          warning: "hover:bg-amber-50 hover:text-amber-700",
          danger: "hover:bg-rose-50 hover:text-rose-700",
          minimal: "hover:bg-slate-50 hover:text-cyan-600",
        };

  const currentSize = sizeStyles[size];
  const isGradientVariant = variant === "neon-gradient";

  return (
    <div className="w-full relative" ref={dropdownRef}>
      {label && (
        <label
          className={`block text-sm font-semibold mb-2 font-montserrat ${
            colorMode === "dark" ? "text-slate-300" : "text-slate-700"
          } ${error ? (colorMode === "dark" ? "text-rose-400" : "text-rose-600") : ""}`}
        >
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2
          border rounded-xl font-medium font-montserrat
          transition-all duration-200
          ${currentSize.trigger}
          ${triggerVariants[variant]}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${error ? (colorMode === "dark" ? "!border-rose-500" : "!border-rose-500") : ""}
        `}
      >
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {selectedOptions.length > 0 ? (
            multiple ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedOptions.map((opt, idx) => (
                  <span
                    key={getOptionKey ? getOptionKey(opt, idx) : idx}
                    className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold
                      ${
                        isGradientVariant
                          ? "bg-white/20 text-white"
                          : colorMode === "dark"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : "bg-cyan-100 text-cyan-700 border border-cyan-200"
                      }
                    `}
                  >
                    {opt.icon && (
                      <span className="flex-shrink-0">{opt.icon}</span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>
                ))}
              </div>
            ) : (
              <>
                {selectedOptions[0].icon && (
                  <span className="flex-shrink-0">
                    {selectedOptions[0].icon}
                  </span>
                )}
                <span className="truncate">{selectedOptions[0].label}</span>
              </>
            )
          ) : (
            <span
              className={`truncate ${
                isGradientVariant
                  ? "text-white/70"
                  : colorMode === "dark"
                    ? "text-slate-500"
                    : "text-slate-400"
              }`}
            >
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {clearable && selectedOptions.length > 0 && (
            <X
              className={`${currentSize.icon} hover:scale-110 transition-transform`}
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`${currentSize.icon} transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className={`
            absolute z-50 w-full mt-2
            border rounded-xl
            overflow-hidden
            ${menuVariants[variant]}
            animate-in fade-in slide-in-from-top-2 duration-200
          `}
          style={{ maxHeight }}
        >
          {searchable && (
            <div
              className={`
              sticky top-0 z-10
              border-b
              ${colorMode === "dark" ? "border-slate-800 bg-slate-900/95" : "border-slate-200 bg-white/95"}
            `}
            >
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${currentSize.icon} ${
                    colorMode === "dark" ? "text-slate-500" : "text-slate-400"
                  }`}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={`
                    w-full pl-10
                    bg-transparent border-0 outline-none
                    font-montserrat
                    ${currentSize.search}
                    ${
                      colorMode === "dark"
                        ? "text-slate-300 placeholder-slate-500"
                        : "text-slate-700 placeholder-slate-400"
                    }
                  `}
                />
              </div>
            </div>
          )}

          <div
            className="overflow-y-auto"
            style={{
              maxHeight: `calc(${maxHeight} - ${searchable ? "48px" : "0px"})`,
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, i) => {
                const isSelected = value
                  ? Array.isArray(value)
                    ? value.some((v) => compareValues(v, option.value))
                    : compareValues(value, option.value)
                  : false;

                return (
                  <button
                    key={getOptionKey ? getOptionKey(option, i) : i}
                    type="button"
                    onClick={() =>
                      !option.disabled && handleSelect(option.value)
                    }
                    disabled={option.disabled}
                    className={`
                      w-full flex items-center gap-3
                      transition-all duration-150
                      font-montserrat
                      ${currentSize.option}
                      ${
                        colorMode === "dark"
                          ? "text-slate-300"
                          : "text-slate-700"
                      }
                      ${optionHoverStyles[variant]}
                      ${
                        isSelected
                          ? colorMode === "dark"
                            ? "bg-cyan-500/20 text-cyan-400 font-semibold"
                            : "bg-cyan-100 text-cyan-700 font-semibold"
                          : ""
                      }
                      ${
                        option.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    {option.icon && (
                      <span className="flex-shrink-0">{option.icon}</span>
                    )}

                    <div className="flex-1 text-left min-w-0">
                      <div className="truncate">{option.label}</div>
                      {option.description && (
                        <div
                          className={`text-xs truncate ${
                            colorMode === "dark"
                              ? "text-slate-500"
                              : "text-slate-500"
                          }`}
                        >
                          {option.description}
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <Check
                        className={`${currentSize.icon} flex-shrink-0 ${
                          colorMode === "dark"
                            ? "text-cyan-400"
                            : "text-cyan-600"
                        }`}
                      />
                    )}
                  </button>
                );
              })
            ) : (
              <div
                className={`
                  ${currentSize.option} text-center font-montserrat
                  ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}
                `}
              >
                No options found
              </div>
            )}
            {actions?.map((action) => {
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => !action.disabled && action.handleClick()}
                  disabled={action.disabled}
                  className={`
                      w-full flex items-center gap-3
                      transition-all duration-150
                      font-montserrat
                      ${currentSize.option}
                      ${
                        colorMode === "dark"
                          ? "text-slate-300"
                          : "text-slate-700"
                      }
                      ${optionHoverStyles[variant]}
                      ${
                        action.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                >
                  {action.icon && (
                    <span className="flex-shrink-0">{action.icon}</span>
                  )}

                  <div className="flex-1 text-left min-w-0">
                    <div className="truncate">{action.label}</div>
                    {action.description && (
                      <div
                        className={`text-xs truncate ${
                          colorMode === "dark"
                            ? "text-slate-500"
                            : "text-slate-500"
                        }`}
                      >
                        {action.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(helperText || error) && (
        <p
          className={`mt-2 text-xs font-montserrat ${
            error
              ? colorMode === "dark"
                ? "text-rose-400"
                : "text-rose-600"
              : colorMode === "dark"
                ? "text-slate-500"
                : "text-slate-500"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};
