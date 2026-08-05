import { supabase } from "./supabase-client.js";

const REALM_KEY = "elcraft_adult_realm_v1";

export async function getAdultRealm() {
  const { data, error } =
    await supabase.rpc(
      "get_my_family_realm"
    );

  if (error) {
    throw error;
  }

  if (data) {
    localStorage.setItem(
      REALM_KEY,
      JSON.stringify(data)
    );
  }

  return data;
}

export async function ensureAdultRealm(profile) {
  const { data, error } =
    await supabase.rpc(
      "ensure_my_family_realm",
      {
        supplied_display_name:
          profile.displayName,

        supplied_avatar:
          profile.avatar,

        supplied_favorite_color:
          profile.favoriteColor,

        supplied_house_theme:
          profile.houseTheme
      }
    );

  if (error) {
    throw error;
  }

  localStorage.setItem(
    REALM_KEY,
    JSON.stringify(data)
  );

  return data;
}

export function cachedAdultRealm() {
  try {
    return JSON.parse(
      localStorage.getItem(
        REALM_KEY
      ) ||
      "null"
    );
  } catch {
    return null;
  }
}

export function clearAdultRealm() {
  localStorage.removeItem(
    REALM_KEY
  );
}
