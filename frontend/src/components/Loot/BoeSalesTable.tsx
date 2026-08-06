import type { FC } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { BoeSale, BoeTotals } from "../../api/queryHooks";
import { useDeleteBoeSale } from "../../api/mutationHooks";

const formatGold = (amount: number) => `${amount.toLocaleString()}g`;

export const BoeSalesTable: FC<{
  teamId: number;
  sales: BoeSale[];
  totals: BoeTotals;
  canManage: boolean;
  colorMode: string;
  onEdit: (sale: BoeSale) => void;
}> = ({ teamId, sales, totals, canManage, colorMode, onEdit }) => {
  const { mutate: deleteSale } = useDeleteBoeSale(teamId);

  const headerTextClass = colorMode === "dark" ? "text-slate-400" : "text-slate-600";
  const borderClass = colorMode === "dark" ? "border-slate-800" : "border-slate-200";
  const cellTextClass = colorMode === "dark" ? "text-slate-300" : "text-slate-700";

  if (sales.length === 0) {
    return (
      <p className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}>
        No BoE sales recorded for this season yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className={`px-3 py-2 text-left text-xs font-medium font-montserrat uppercase tracking-wide ${headerTextClass}`}>
              Player
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium font-montserrat uppercase tracking-wide ${headerTextClass}`}>
              Item
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium font-montserrat uppercase tracking-wide ${headerTextClass}`}>
              Slot
            </th>
            <th className={`px-2 py-2 text-right text-xs font-medium font-montserrat uppercase tracking-wide ${headerTextClass}`}>
              Sale Price
            </th>
            <th className={`px-2 py-2 text-center text-xs font-medium font-montserrat uppercase tracking-wide ${headerTextClass}`}>
              Sold to Player
            </th>
            <th className={`px-2 py-2 text-right text-xs font-medium font-montserrat uppercase tracking-wide ${headerTextClass}`}>
              Guild Cut
            </th>
            <th className={`px-2 py-2 text-right text-xs font-medium font-montserrat uppercase tracking-wide ${headerTextClass}`}>
              Player Cut
            </th>
            {canManage && (
              <th className={`px-2 py-2 text-xs font-medium font-montserrat uppercase tracking-wide ${headerTextClass}`}>
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className={`px-3 py-2 border-t text-sm font-medium font-montserrat whitespace-nowrap ${borderClass} ${cellTextClass}`}>
                {sale.player_name}
              </td>
              <td className={`px-2 py-2 border-t text-sm font-montserrat ${borderClass} ${cellTextClass}`}>
                {sale.item_name}
              </td>
              <td className={`px-2 py-2 border-t text-sm font-montserrat whitespace-nowrap ${borderClass} ${cellTextClass}`}>
                {sale.item_slot}
              </td>
              <td className={`px-2 py-2 border-t text-right text-sm font-montserrat whitespace-nowrap ${borderClass} ${cellTextClass}`}>
                {formatGold(sale.sale_price)}
              </td>
              <td className={`px-2 py-2 border-t text-center text-xs font-montserrat ${borderClass}`}>
                {sale.sold_to_player && (
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full font-semibold ${
                      colorMode === "dark" ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-700"
                    }`}
                  >
                    Yes
                  </span>
                )}
              </td>
              <td className={`px-2 py-2 border-t text-right text-sm font-semibold font-montserrat whitespace-nowrap ${borderClass} ${colorMode === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                {formatGold(sale.guild_cut)}
              </td>
              <td className={`px-2 py-2 border-t text-right text-sm font-semibold font-montserrat whitespace-nowrap ${borderClass} ${colorMode === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                {formatGold(sale.player_cut)}
              </td>
              {canManage && (
                <td className={`px-2 py-2 border-t text-right ${borderClass}`}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(sale)}
                      title="Edit sale"
                      className={`p-1.5 rounded-lg transition-colors ${
                        colorMode === "dark"
                          ? "text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                          : "text-slate-500 hover:text-cyan-600 hover:bg-slate-100"
                      }`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSale(sale.id)}
                      title="Delete sale"
                      className={`p-1.5 rounded-lg transition-colors ${
                        colorMode === "dark"
                          ? "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          : "text-slate-500 hover:text-rose-600 hover:bg-slate-100"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={3}
              className={`px-3 py-2 border-t-2 text-xs font-bold font-montserrat uppercase tracking-wide ${borderClass} ${headerTextClass}`}
            >
              Totals
            </td>
            <td className={`px-2 py-2 border-t-2 text-right text-sm font-bold font-montserrat whitespace-nowrap ${borderClass} ${cellTextClass}`}>
              {formatGold(totals.sale_price)}
            </td>
            <td className={`border-t-2 ${borderClass}`} />
            <td className={`px-2 py-2 border-t-2 text-right text-sm font-bold font-montserrat whitespace-nowrap ${borderClass} ${cellTextClass}`}>
              {formatGold(totals.guild_cut)}
            </td>
            <td className={`px-2 py-2 border-t-2 text-right text-sm font-bold font-montserrat whitespace-nowrap ${borderClass} ${cellTextClass}`}>
              {formatGold(totals.player_cut)}
            </td>
            {canManage && <td className={`border-t-2 ${borderClass}`} />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
