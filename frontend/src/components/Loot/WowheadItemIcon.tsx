import type { FC } from "react";

type WowheadItemIconProps = {
  wowItemId: number;
  bonusIds: string;
  iconUrl: string;
  className?: string;
};

// The current tier is still on PTR, where Wowhead's tooltip script can't
// find the item via a plain href (that resolves against the live item
// database). data-wowhead's domain=ptr tells it to pull tooltip data
// (stats, upgrade rank) from the PTR database instead. Revisit once this
// tier ships live — at that point domain=ptr should be dropped.
export const WowheadItemIcon: FC<WowheadItemIconProps> = ({
  wowItemId,
  bonusIds,
  iconUrl,
  className,
}) => {
  const wowheadHref = `https://www.wowhead.com/ptr/item=${wowItemId}`;
  const wowheadData = `item=${wowItemId}${bonusIds ? `&bonus=${bonusIds}` : ""}&domain=ptr`;
  return (
    <a
      href={wowheadHref}
      data-wowhead={wowheadData}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`shrink-0 ${className ?? ""}`}
    >
      <img
        src={iconUrl}
        alt=""
        className="w-8 h-8 rounded-md border border-slate-700 shadow-sm"
      />
    </a>
  );
};
