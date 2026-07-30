/* =========================================================
   ELCraft Cloud World Engine v2
   Load with: <script type="module" src="./world-engine.js"></script>
   ========================================================= */

import { supabase } from "./supabase-client.js";

const KEYS = Object.freeze({
  childId: "elcraft_selected_child_id",
  childName: "elcraft_child_name",
  childAvatar: "elcraft_child_avatar",
  legacyAvatarImage: "elcraft_avatar_image",
  snapshot: "elcraft_cloud_world_snapshot_v2"
});

const DEFAULT_WORLD_STATE = Object.freeze({
  version: 2,
  nature: {
    flowerStage: 0,
    butterflyStage: 0,
    treeStage: 0,
    fountainStage: 0
  },
  buildingStages: {
    library: 1,
    school: 1,
    market: 1,
    petShop: 1,
    styleStudio: 1,
    clubhouse: 1,
    castle: 1
  },
  achievements: []
});

let snapshot = null;
let readyPromise = null;

function possessive(name) {
  const clean = String(name || "Player").trim() || "Player";
  return /s$/i.test(clean) ? `${clean}'` : `${clean}'s`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function merge(base, extra) {
  const output = clone(base);

  if (!extra || typeof extra !== "object") {
    return output;
  }

  for (const [key, value] of Object.entries(extra)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      output[key] &&
      typeof output[key] === "object" &&
      !Array.isArray(output[key])
    ) {
      output[key] = merge(output[key], value);
    } else {
      output[key] = value;
    }
  }

  return output;
}

function calculateLevel(experience, storedLevel = 1) {
  return Math.max(
    Number(storedLevel || 1),
    Math.floor(Number(experience || 0) / 100) + 1
  );
}

function nextLevelXP(experience) {
  const xp = Number(experience || 0);
  const level = Math.floor(xp / 100) + 1;
  return {
    current: xp % 100,
    required: 100,
    remaining: 100 - (xp % 100),
    level
  };
}

function cacheSnapshot(value) {
  snapshot = value;

  localStorage.setItem(KEYS.childName, value.child.display_name);
  localStorage.setItem(KEYS.childAvatar, value.child.avatar || "🌟");
  localStorage.setItem(KEYS.snapshot, JSON.stringify(value));

  window.dispatchEvent(
    new CustomEvent("elcraft:world-ready", {
      detail: clone(value)
    })
  );

  applyPersonalization(document, value);
  return value;
}

function cachedSnapshot() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.snapshot) || "null");
  } catch {
    return null;
  }
}

async function requireSession() {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("A parent login is required.");
  }

  return session;
}

async function load({ redirect = true, force = false } = {}) {
  if (readyPromise && !force) {
    return readyPromise;
  }

  readyPromise = (async () => {
    try {
      const session = await requireSession();
      const childId = localStorage.getItem(KEYS.childId);

      if (!childId) {
        if (redirect) window.location.replace("profiles.html");
        throw new Error("No child profile is selected.");
      }

      const { data: child, error: childError } = await supabase
        .from("child_profiles")
        .select("id, parent_id, display_name, avatar, friend_code, stars, experience, level")
        .eq("id", childId)
        .eq("parent_id", session.user.id)
        .maybeSingle();

      if (childError || !child) {
        localStorage.removeItem(KEYS.childId);
        if (redirect) window.location.replace("profiles.html");
        throw childError || new Error("The selected child profile was not found.");
      }

      let world = null;
      const { data: worldData, error: worldError } = await supabase
        .from("child_worlds")
        .select("child_id, parent_id, city_name, clubhouse_name, city_level, clubhouse_level, coins, world_state, updated_at")
        .eq("child_id", child.id)
        .maybeSingle();

      if (!worldError && worldData) {
        world = worldData;
      } else {
        // The rest of ELCraft still works before the SQL migration is run.
        if (worldError) {
          console.warn("ELCraft cloud world table is not ready yet:", worldError.message);
        }

        const { data: city } = await supabase
          .from("cities")
          .select("city_name, city_level")
          .eq("child_id", child.id)
          .maybeSingle();

        world = {
          child_id: child.id,
          parent_id: child.parent_id,
          city_name: city?.city_name || `${possessive(child.display_name)} City`,
          clubhouse_name: `${possessive(child.display_name)} Clubhouse`,
          city_level: Number(city?.city_level || 1),
          clubhouse_level: 1,
          coins: Number(localStorage.getItem("elcraft_coins") || 0),
          world_state: clone(DEFAULT_WORLD_STATE),
          updated_at: null,
          cloudReady: false
        };
      }

      const normalized = {
        user: {
          id: session.user.id,
          email: session.user.email || ""
        },
        child: {
          ...child,
          avatar: child.avatar || "🌟",
          stars: Number(child.stars || 0),
          experience: Number(child.experience || 0),
          level: calculateLevel(child.experience, child.level)
        },
        world: {
          ...world,
          city_name: world.city_name || `${possessive(child.display_name)} City`,
          clubhouse_name: world.clubhouse_name || `${possessive(child.display_name)} Clubhouse`,
          city_level: Number(world.city_level || 1),
          clubhouse_level: Number(world.clubhouse_level || 1),
          coins: Number(world.coins || 0),
          world_state: merge(DEFAULT_WORLD_STATE, world.world_state || {})
        }
      };

      normalized.progress = nextLevelXP(normalized.child.experience);
      return cacheSnapshot(normalized);
    } catch (error) {
      readyPromise = null;
      const cached = cachedSnapshot();

      if (cached && !redirect) {
        snapshot = cached;
        applyPersonalization(document, cached);
        return cached;
      }

      throw error;
    }
  })();

  return readyPromise;
}

function text(selector, value, root = document) {
  const node = root.querySelector(selector);
  if (node) node.textContent = value;
}

function applyPersonalization(root = document, data = snapshot) {
  if (!data?.child || !data?.world) return;

  const name = data.child.display_name || "Player";
  const avatar = data.child.avatar || "🌟";
  const cityName = data.world.city_name || `${possessive(name)} City`;
  const clubhouseName = data.world.clubhouse_name || `${possessive(name)} Clubhouse`;

  text("#profileName", name, root);
  text("#greetingName", name, root);
  text("#ownerName", name, root);
  text("#heroName", name, root);
  text("#welcomeName", name, root);
  text("#headerAvatar", avatar, root);
  text("#parentMenuAvatar", avatar, root);
  text("#parentMenuName", name, root);
  text("#cityOwner", `✨ ${cityName}`, root);
  text("#cityPageTitle", cityName, root);
  text("#headerName", clubhouseName, root);
  text("#clubhousePageTitle", clubhouseName, root);
  text("#clubhouseBuildingSign", clubhouseName.toUpperCase(), root);
  text("#profileLevel", `Level ${data.child.level} • ⭐ ${data.child.stars}`, root);

  root.querySelectorAll("[data-elcraft-name]").forEach(node => {
    node.textContent = name;
  });

  root.querySelectorAll("[data-elcraft-avatar]").forEach(node => {
    node.textContent = avatar;
  });

  root.querySelectorAll("[data-elcraft-city-name]").forEach(node => {
    node.textContent = cityName;
  });

  root.querySelectorAll("[data-elcraft-clubhouse-name]").forEach(node => {
    node.textContent = clubhouseName;
  });

  root.querySelectorAll("[data-elcraft-stars]").forEach(node => {
    node.textContent = String(data.child.stars);
  });

  root.querySelectorAll("[data-elcraft-level]").forEach(node => {
    node.textContent = String(data.child.level);
  });

  root.querySelectorAll("[data-elcraft-city-level]").forEach(node => {
    node.textContent = String(data.world.city_level);
  });

  document.title = document.body?.dataset.page === "clubhouse"
    ? `${clubhouseName} | ELCraft`
    : document.body?.dataset.page === "city"
      ? `${cityName} | ELCraft`
      : `ELCraft — ${possessive(name)} World`;
}

async function award({
  stars = 0,
  experience = 0,
  coins = 0,
  source = "elcraft",
  activityType = "reward",
  details = {}
} = {}) {
  const data = snapshot || await load();

  const { data: result, error } = await supabase.rpc(
    "award_child_progress",
    {
      p_child_id: data.child.id,
      p_stars: Math.max(0, Number(stars || 0)),
      p_experience: Math.max(0, Number(experience || 0)),
      p_coins: Math.max(0, Number(coins || 0)),
      p_source: String(source || "elcraft"),
      p_activity_type: String(activityType || "reward"),
      p_details: details || {}
    }
  );

  if (error) throw error;

  await load({ force: true, redirect: false });

  window.dispatchEvent(
    new CustomEvent("elcraft:reward", {
      detail: { stars, experience, coins, source, activityType, result }
    })
  );

  return snapshot;
}

async function saveWorldPatch(patch = {}) {
  const data = snapshot || await load();
  const nextState = merge(data.world.world_state, patch);

  const { data: updated, error } = await supabase
    .from("child_worlds")
    .update({
      world_state: nextState,
      updated_at: new Date().toISOString()
    })
    .eq("child_id", data.child.id)
    .select("*")
    .single();

  if (error) throw error;

  snapshot.world = {
    ...snapshot.world,
    ...updated,
    world_state: merge(DEFAULT_WORLD_STATE, updated.world_state || {})
  };

  cacheSnapshot(snapshot);
  return clone(snapshot);
}

async function renameWorld({ cityName, clubhouseName } = {}) {
  const data = snapshot || await load();
  const updates = { updated_at: new Date().toISOString() };

  if (cityName?.trim()) updates.city_name = cityName.trim().slice(0, 40);
  if (clubhouseName?.trim()) updates.clubhouse_name = clubhouseName.trim().slice(0, 40);

  const { data: updated, error } = await supabase
    .from("child_worlds")
    .update(updates)
    .eq("child_id", data.child.id)
    .select("*")
    .single();

  if (error) throw error;

  snapshot.world = { ...snapshot.world, ...updated };
  cacheSnapshot(snapshot);
  return clone(snapshot);
}

window.ELCraftWorld = Object.freeze({
  load,
  ready: () => load(),
  get: () => clone(snapshot || cachedSnapshot()),
  refresh: () => load({ force: true, redirect: false }),
  applyPersonalization,
  award,
  saveWorldPatch,
  renameWorld,
  possessive,
  keys: KEYS
});

load().catch(error => {
  console.error("ELCraft World Engine:", error);
});
