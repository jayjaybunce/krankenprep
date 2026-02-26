export type Boss = {
  id: number;
  name: string;
  order: number;
  short_name: string;
  slug: string;
  phases: null | any[];
  raid_id: number;
  raid: Raid;
  splash_img_url: string
  icon_img_url: string
};

export type Raid = {
  id: number;
  name: string;
  slug: string;
  order: number;
  expansion: string;
  season_id: number;
  splash_img_url: string;
  season: Season;
  bosses: Boss[] | null;
};

export type Season = {
  id: number;
  start_date: string;
  end_date: string;
  name: string;
  raids: Raid[] | null;
  order: number;
  is_current: boolean;
  expansion_id: number;
  expansion: Expansion;
};

export type Expansion = {
  id: number;
  name: string;
  is_current: boolean;
  slug: string;
  seasons: Season[] | null;
};

export type ExpansionResponse = Expansion[];
