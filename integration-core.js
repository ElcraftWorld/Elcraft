/*
  ELCraft Integration Core — Phase 2

  Purpose:
  - Standardize the active-child localStorage keys.
  - Keep the legacy coin value and shared profile wallet synchronized.
  - Expose canonical routes to every page.
  - Redirect obsolete duplicate routes.
  - Dispatch shared ELCraft state events.
*/

const CHILD_KEYS = {
  id: "elcraft_selected_child_id",
  name: "elcraft_child_name",
  avatar: "elcraft_child_avatar"
};

const LEGACY_CHILD_KEYS = {
  ids: [
    "selected_child_id",
    "elcraft_active_child_id"
  ],

  names: [
    "elcraft_player_name",
    "player_name"
  ],

  avatars: [
    "elcraft_player_avatar",
    "player_avatar"
  ]
};

const PROFILE_KEY =
  "elcraft_profile_v1";

const COINS_KEY =
  "elcraft_coins";

export const ELCraftRoutes = Object.freeze({
  auth:
    "auth.html",

  parentDashboard:
    "parent-dashboard.html",

  familyCastle:
    "family-castle.html",

  profiles:
    "profiles.html",

  myCity:
    "my-city.html",

  school:
    "school.html",

  library:
    "library.html",

  artStudio:
    "sky-world.html",

  clubhouse:
    "clubhouse.html",

  musicStudio:
    "music-studio.html",

  characterStudio:
    "my-character.html",

  market:
    "market.html",

  inventory:
    "inventory.html",

  quests:
    "quests.html",

  progress:
    "progress.html"
});

window.ELCraftRoutes =
  ELCraftRoutes;

function firstStoredValue(
  keys
) {
  for (
    const key of
    keys
  ) {
    const value =
      localStorage.getItem(
        key
      );

    if (
      value
    ) {
      return value;
    }
  }

  return "";
}

function migrateChildSession() {
  const id =
    localStorage.getItem(
      CHILD_KEYS.id
    ) ||
    firstStoredValue(
      LEGACY_CHILD_KEYS.ids
    );

  const name =
    localStorage.getItem(
      CHILD_KEYS.name
    ) ||
    firstStoredValue(
      LEGACY_CHILD_KEYS.names
    );

  const avatar =
    localStorage.getItem(
      CHILD_KEYS.avatar
    ) ||
    firstStoredValue(
      LEGACY_CHILD_KEYS.avatars
    );

  if (
    id
  ) {
    localStorage.setItem(
      CHILD_KEYS.id,
      id
    );
  }

  if (
    name
  ) {
    localStorage.setItem(
      CHILD_KEYS.name,
      name
    );
  }

  if (
    avatar
  ) {
    localStorage.setItem(
      CHILD_KEYS.avatar,
      avatar
    );
  }

  return {
    id:
      id ||
      null,

    display_name:
      name ||
      "",

    avatar:
      avatar ||
      "🌟"
  };
}

function readProfile() {
  let profile = {};

  try {
    profile =
      JSON.parse(
        localStorage.getItem(
          PROFILE_KEY
        ) ||
        "{}"
      );
  } catch {
    profile = {};
  }

  return {
    ...profile,

    coins:
      Number(
        profile.coins ??
        localStorage.getItem(
          COINS_KEY
        ) ??
        0
      ) ||
      0,

    xp:
      Number(
        profile.xp ??
        0
      ) ||
      0,

    totalXp:
      Number(
        profile.totalXp ??
        profile.total_xp ??
        profile.xp ??
        0
      ) ||
      0
  };
}

function writeProfile(
  profile,
  {
    dispatch = true
  } = {}
) {
  const normalized = {
    ...profile,

    coins:
      Math.max(
        0,
        Number(
          profile.coins
        ) ||
        0
      ),

    xp:
      Math.max(
        0,
        Number(
          profile.xp
        ) ||
        0
      ),

    totalXp:
      Math.max(
        0,
        Number(
          profile.totalXp ??
          profile.total_xp ??
          profile.xp
        ) ||
        0
      )
  };

  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify(
      normalized
    )
  );

  localStorage.setItem(
    COINS_KEY,
    String(
      normalized.coins
    )
  );

  if (
    dispatch
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "elcraft:wallet-changed",
        {
          detail:
            normalized
        }
      )
    );
  }

  return normalized;
}

function reconcileWallet() {
  const profile =
    readProfile();

  const legacyCoins =
    Number(
      localStorage.getItem(
        COINS_KEY
      )
    );

  if (
    Number.isFinite(
      legacyCoins
    ) &&
    legacyCoins !==
      profile.coins
  ) {
    /*
      The separate coin key is still used by older pages.
      Prefer the most recently written standalone value at startup.
    */
    profile.coins =
      Math.max(
        0,
        legacyCoins
      );
  }

  return writeProfile(
    profile,
    {
      dispatch:
        false
    }
  );
}

export function getActiveChild() {
  return migrateChildSession();
}

export function setActiveChild(
  child
) {
  if (
    !child?.id
  ) {
    throw new Error(
      "A valid child profile is required."
    );
  }

  localStorage.setItem(
    CHILD_KEYS.id,
    child.id
  );

  localStorage.setItem(
    CHILD_KEYS.name,
    String(
      child.display_name ||
      child.name ||
      "Player"
    )
  );

  localStorage.setItem(
    CHILD_KEYS.avatar,
    String(
      child.avatar ||
      "🌟"
    )
  );

  for (
    const key of
    LEGACY_CHILD_KEYS.ids
  ) {
    localStorage.removeItem(
      key
    );
  }

  window.dispatchEvent(
    new CustomEvent(
      "elcraft:child-selected",
      {
        detail: {
          child:
            getActiveChild()
        }
      }
    )
  );

  return getActiveChild();
}

export function clearActiveChild() {
  [
    ...Object.values(
      CHILD_KEYS
    ),

    ...LEGACY_CHILD_KEYS.ids,
    ...LEGACY_CHILD_KEYS.names,
    ...LEGACY_CHILD_KEYS.avatars
  ].forEach(
    key => {
      localStorage.removeItem(
        key
      );
    }
  );

  window.dispatchEvent(
    new CustomEvent(
      "elcraft:child-cleared"
    )
  );
}

export function getLocalWallet() {
  return readProfile();
}

export function updateLocalWallet({
  coins = 0,
  xp = 0,
  absolute = false
} = {}) {
  const current =
    readProfile();

  const next =
    absolute
      ? {
          ...current,

          coins:
            Number(
              coins
            ) ||
            0,

          xp:
            Number(
              xp
            ) ||
            0
        }
      : {
          ...current,

          coins:
            current.coins +
            (
              Number(
                coins
              ) ||
              0
            ),

          xp:
            current.xp +
            (
              Number(
                xp
              ) ||
              0
            ),

          totalXp:
            current.totalXp +
            (
              Number(
                xp
              ) ||
              0
            )
        };

  return writeProfile(
    next
  );
}

function canonicalRedirect() {
  const page =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();

  const redirects = {
    "music.html":
      ELCraftRoutes.musicStudio
  };

  const destination =
    redirects[
      page
    ];

  if (
    destination &&
    destination !==
      page
  ) {
    window.location.replace(
      destination
    );
  }
}

function watchWalletChanges() {
  window.addEventListener(
    "storage",
    event => {
      if (
        event.key ===
          COINS_KEY
      ) {
        const profile =
          readProfile();

        profile.coins =
          Math.max(
            0,
            Number(
              event.newValue
            ) ||
            0
          );

        writeProfile(
          profile
        );
      }

      if (
        event.key ===
          PROFILE_KEY
      ) {
        const profile =
          readProfile();

        localStorage.setItem(
          COINS_KEY,
          String(
            profile.coins
          )
        );

        window.dispatchEvent(
          new CustomEvent(
            "elcraft:wallet-changed",
            {
              detail:
                profile
            }
          )
        );
      }
    }
  );
}

canonicalRedirect();
migrateChildSession();
reconcileWallet();
watchWalletChanges();

window.dispatchEvent(
  new CustomEvent(
    "elcraft:integration-ready",
    {
      detail: {
        child:
          getActiveChild(),

        wallet:
          getLocalWallet(),

        routes:
          ELCraftRoutes
      }
    }
  )
);
