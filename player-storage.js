(() => {
  "use strict";

  const SELECTED_CHILD_ID_KEY =
    "elcraft_selected_child_id";

  const PLAYER_PREFIX =
    "elcraft_player:";

  const OWNER_PREFIX =
    "elcraft_scope_owner:";

  const GLOBAL_KEYS =
    new Set([
      "elcraft_selected_child_id",
      "elcraft_child_name",
      "elcraft_child_avatar",
      "elcraft_player_name",
      "elcraft_player_avatar",
      "elcraft_parent_pin_hash",
      "elcraft_pending_family_invite",
      "elcraft_clubhouse_art_requests_v1",
      "elcraft_clubhouse_art_approved_v1",
      "elcraft_demo_library_books"
    ]);

  const PLAYER_KEYS =
    new Set([
      "elcraft_art_gallery_v1",
      "elcraft_art_gallery_v2",
      "elcraft_avatar_image",
      "elcraft_character_v3",
      "elcraft_child_books_v1",
      "elcraft_coins",
      "elcraft_discovery_v1",
      "elcraft_inventory",
      "elcraft_magical_mail_v1",
      "elcraft_market_daily_gift",
      "elcraft_math_v1",
      "elcraft_music_studio_v1",
      "elcraft_npc_friends_inline_v1",
      "elcraft_npc_friends_v1",
      "elcraft_player_style",
      "elcraft_profile_v1",
      "elcraft_reading_library_v1",
      "elcraft_reading_v1",
      "elcraft_reading_v2",
      "elcraft_royal_salon_look_v1",
      "elcraft_saved_songs_v1",
      "elcraft_school_v1",
      "elcraft_science_v1",
      "elcraft_stars",
      "elcraft_together_room",
      "elcraft_world_v1",
      "elcraft_writing_v1"
    ]);

  const storage =
    window.localStorage;

  const nativeGetItem =
    Storage.prototype.getItem;

  const nativeSetItem =
    Storage.prototype.setItem;

  const nativeRemoveItem =
    Storage.prototype.removeItem;

  const nativeClear =
    Storage.prototype.clear;

  function nativeGet(key) {
    return nativeGetItem.call(
      storage,
      key
    );
  }

  function nativeSet(
    key,
    value
  ) {
    nativeSetItem.call(
      storage,
      key,
      String(value)
    );
  }

  function nativeRemove(key) {
    nativeRemoveItem.call(
      storage,
      key
    );
  }

  function activeChildId() {
    return (
      nativeGet(
        SELECTED_CHILD_ID_KEY
      ) ||
      ""
    ).trim();
  }

  function shouldScope(key) {
    return (
      typeof key ===
        "string" &&
      PLAYER_KEYS.has(key) &&
      !GLOBAL_KEYS.has(key)
    );
  }

  function scopedKey(
    key,
    childId =
      activeChildId()
  ) {
    if (
      !childId ||
      !shouldScope(key)
    ) {
      return key;
    }

    return (
      PLAYER_PREFIX +
      childId +
      ":" +
      key
    );
  }

  function migrateLegacyValue(
    key,
    childId
  ) {
    const scoped =
      scopedKey(
        key,
        childId
      );

    const existing =
      nativeGet(scoped);

    if (
      existing !==
      null
    ) {
      return existing;
    }

    const ownerKey =
      OWNER_PREFIX +
      key;

    const owner =
      nativeGet(ownerKey);

    if (
      owner &&
      owner !==
        childId
    ) {
      return null;
    }

    const legacy =
      nativeGet(key);

    if (
      legacy ===
      null
    ) {
      return null;
    }

    nativeSet(
      scoped,
      legacy
    );

    nativeSet(
      ownerKey,
      childId
    );

    return legacy;
  }

  Storage.prototype.getItem =
    function (key) {
      if (
        this !==
          storage ||
        !shouldScope(key)
      ) {
        return nativeGetItem.call(
          this,
          key
        );
      }

      const childId =
        activeChildId();

      if (!childId) {
        return nativeGetItem.call(
          this,
          key
        );
      }

      return migrateLegacyValue(
        key,
        childId
      );
    };

  Storage.prototype.setItem =
    function (
      key,
      value
    ) {
      if (
        this !==
          storage ||
        !shouldScope(key)
      ) {
        return nativeSetItem.call(
          this,
          key,
          value
        );
      }

      const childId =
        activeChildId();

      if (!childId) {
        console.warn(
          "No child is selected; ELCraft could not separate this save:",
          key
        );

        return nativeSetItem.call(
          this,
          key,
          value
        );
      }

      return nativeSetItem.call(
        this,
        scopedKey(
          key,
          childId
        ),
        value
      );
    };

  Storage.prototype.removeItem =
    function (key) {
      if (
        this !==
          storage ||
        !shouldScope(key)
      ) {
        return nativeRemoveItem.call(
          this,
          key
        );
      }

      const childId =
        activeChildId();

      if (!childId) {
        return nativeRemoveItem.call(
          this,
          key
        );
      }

      return nativeRemoveItem.call(
        this,
        scopedKey(
          key,
          childId
        )
      );
    };

  Storage.prototype.clear =
    function () {
      if (
        this !==
          storage
      ) {
        return nativeClear.call(this);
      }

      const childId =
        activeChildId();

      if (!childId) {
        return nativeClear.call(this);
      }

      const prefix =
        PLAYER_PREFIX +
        childId +
        ":";

      const keysToRemove =
        [];

      for (
        let index = 0;
        index < storage.length;
        index += 1
      ) {
        const key =
          storage.key(index);

        if (
          key?.startsWith(prefix)
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(
        key => {
          nativeRemove(key);
        }
      );
    };

  window.ELCraftPlayerStorage =
    Object.freeze({
      activeChildId,
      scopedKey,

      isPlayerKey:
        key =>
          shouldScope(key),

      getPlayerValue(
        key,
        childId =
          activeChildId()
      ) {
        if (
          !childId ||
          !shouldScope(key)
        ) {
          return nativeGet(key);
        }

        return nativeGet(
          scopedKey(
            key,
            childId
          )
        );
      },

      setPlayerValue(
        key,
        value,
        childId =
          activeChildId()
      ) {
        if (
          !childId ||
          !shouldScope(key)
        ) {
          nativeSet(
            key,
            value
          );

          return;
        }

        nativeSet(
          scopedKey(
            key,
            childId
          ),
          value
        );
      }
    });

  window.dispatchEvent(
    new CustomEvent(
      "elcraft:player-storage-ready",
      {
        detail: {
          childId:
            activeChildId()
        }
      }
    )
  );
})();
