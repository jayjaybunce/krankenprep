import type { FC } from "react";
import { ExternalLink, Eye } from "lucide-react";
import { useSearchIcons } from "../api/queryHooks";
import { useTheme } from "../hooks";

type SpellSearchAndSelectionProps = {
  top: number;
  left: number;
  height: number;
  x: number;
  y: number;
  show: boolean;
  query: string;
  onClick: (spell_id: number, spell_name: string, filename: string) => void;
};

const h = 300;
const w = 300;

type IconSearchResultProps = {
  spell_id: number;
  spell_name: string;
  filename: string;
  onClick: (spell_id: number, spell_name: string, filename: string) => void;
};

const IconSearchResult: FC<IconSearchResultProps> = ({
  spell_id,
  spell_name,
  filename,
  onClick,
}) => {
  const handleClick = () => {
    onClick(spell_id, spell_name, filename);
  };
  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg transition-all duration-200 hover:bg-cyan-500/10 hover:text-cyan-400"
    >
      {filename ? (
        <img
          className="w-8 h-8 rounded-md border border-slate-700 shadow-sm"
          src={`https://wow.zamimg.com/images/wow/icons/small/${filename}.jpg`}
          alt={spell_name}
        />
      ) : (
        <div className="w-8 h-8 rounded-md bg-slate-700/50 border border-slate-600" />
      )}
      <span className="text-sm font-medium font-montserrat text-slate-200 truncate flex-1">
        {spell_name}
      </span>
      <a
        href={`https://www.wowhead.com/spell=${spell_id}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 p-1 rounded text-slate-500 hover:text-cyan-400 transition-colors duration-200"
      >
        <Eye className="w-3.5 h-3.5" />
      </a>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          window.open(`https://wowhead.com/spell=${spell_id}`, "_blank", "noopener,noreferrer");
        }}
        className="shrink-0 p-1 rounded text-slate-500 hover:text-cyan-400 transition-colors duration-200"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const SpellSearchAndSelection: FC<SpellSearchAndSelectionProps> = ({
  top,
  left,
  x,
  y,
  height,
  show,
  query,
  onClick,
}) => {
  const { data } = useSearchIcons(query);
  const { colorMode } = useTheme();

  if (!show) return null;

  return (
    <div
      className={`
        fixed z-50 flex flex-col
        rounded-xl border overflow-hidden
        animate-in fade-in slide-in-from-top-2 duration-200
        unfuck-scrollbar-1
        ${
          colorMode === "dark"
            ? "bg-slate-900/95 backdrop-blur-xl border-slate-800 shadow-2xl shadow-slate-950/50 text-slate-50"
            : "bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl shadow-slate-300/50 text-slate-900"
        }
      `}
      style={{
        height: h,
        width: w,
        top: y + top + height + 4,
        left: x + left,
      }}
    >
      {data && data.length > 0 ? (
        <div className="flex-1 overflow-y-auto p-1.5">
          {data.map((spell) => (
            <IconSearchResult
              key={spell.spell_id}
              {...spell}
              onClick={onClick}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm font-montserrat text-slate-500">
            {query ? "No results found" : "Start typing to search"}
          </span>
        </div>
      )}
    </div>
  );
};

export default SpellSearchAndSelection;
