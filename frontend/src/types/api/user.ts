export interface UserProfile {
  _links: Links;
  id: number;
  wow_accounts: WowAccount[];
  collections: HrefOnly;
}

export interface Links {
  self: HrefOnly;
  user: HrefOnly;
  profile: HrefOnly;
}

export interface HrefOnly {
  href: string;
}

export interface WowAccount {
  id: number;
  characters: WowCharacterRef[];
}

export interface WowCharacterRef {
  character: HrefOnly;
  protected_character: HrefOnly;
  name: string;
  id: number;
  realm: Realm;
  playable_class: PlayableClass;
  playable_race: PlayableRace;
  gender: TypeNameField;
  faction: TypeNameField;
  level: number;
}

export interface Realm {
  key: HrefOnly;
  name: string;
  id: number;
  slug: string;
}

export interface PlayableClass {
  key: HrefOnly;
  name: string;
  id: number;
}

export interface PlayableRace {
  key: HrefOnly;
  name: string;
  id: number;
}

export interface TypeNameField {
  type: string;
  name: string;
}




export interface User {
    id: string
    email: string
    name: string
    created_at: string // or time check
    descope_user_id: string
    descope_login_id: string
    first_login: boolean
    btag: string
    bnet_id: string
    bnet_profile_data: UserProfile
}