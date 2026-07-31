import { supabase } from "./supabase-client.js";

const STORAGE_KEYS = {
    childId: "elcraft_selected_child_id",
    childName: "elcraft_child_name",
    childAvatar: "elcraft_child_avatar"
};

const DEFAULT_WALLET = {
    xp: 0,
    coins: 0,
    gems: 0,
    stars: 0,
    family_points: 0
};

let cachedUser = null;
let cachedChild = null;
let cachedWallet = null;
let cachedFamily = null;

/* =========================================================
   BASIC HELPERS
========================================================= */

function requireValue(value, message) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        throw new Error(message);
    }

    return value;
}

function cleanNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}

function cleanText(value, fallback = "") {
    return String(value ?? fallback).trim();
}

function dispatchEngineEvent(name, detail = {}) {
    window.dispatchEvent(
        new CustomEvent(
            `elcraft:${name}`,
            {
                detail
            }
        )
    );
}

/* =========================================================
   AUTHENTICATION
========================================================= */

export async function getCurrentUser({
    forceRefresh = false
} = {}) {
    if (
        cachedUser &&
        !forceRefresh
    ) {
        return cachedUser;
    }

    const {
        data,
        error
    } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    if (!data.user) {
        throw new Error(
            "You must be signed in to use ELCraft."
        );
    }

    cachedUser = data.user;

    return cachedUser;
}

export async function requireSignedInUser() {
    try {
        return await getCurrentUser();
    } catch (error) {
        window.location.replace(
            "auth.html"
        );

        throw error;
    }
}

export async function signOutELCraft() {
    clearSelectedChild();

    cachedUser = null;
    cachedChild = null;
    cachedWallet = null;
    cachedFamily = null;

    const {
        error
    } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }

    window.location.replace(
        "auth.html"
    );
}

/* =========================================================
   SELECTED CHILD
========================================================= */

export function getSelectedChildId() {
    return localStorage.getItem(
        STORAGE_KEYS.childId
    );
}

export function getSelectedChildSnapshot() {
    return {
        id:
            localStorage.getItem(
                STORAGE_KEYS.childId
            ),

        display_name:
            localStorage.getItem(
                STORAGE_KEYS.childName
            ),

        avatar:
            localStorage.getItem(
                STORAGE_KEYS.childAvatar
            )
    };
}

export function setSelectedChild(child) {
    requireValue(
        child?.id,
        "A valid child profile is required."
    );

    localStorage.setItem(
        STORAGE_KEYS.childId,
        child.id
    );

    localStorage.setItem(
        STORAGE_KEYS.childName,
        cleanText(
            child.display_name,
            "Player"
        )
    );

    localStorage.setItem(
        STORAGE_KEYS.childAvatar,
        cleanText(
            child.avatar,
            "🌟"
        )
    );

    cachedChild = {
        ...child
    };

    dispatchEngineEvent(
        "child-selected",
        {
            child:
                cachedChild
        }
    );

    return cachedChild;
}

export function clearSelectedChild() {
    Object.values(
        STORAGE_KEYS
    ).forEach(key => {
        localStorage.removeItem(key);
    });

    cachedChild = null;
    cachedWallet = null;
}

export async function loadSelectedChild({
    forceRefresh = false
} = {}) {
    const childId =
        getSelectedChildId();

    if (!childId) {
        throw new Error(
            "No child profile is selected."
        );
    }

    if (
        cachedChild?.id === childId &&
        !forceRefresh
    ) {
        return cachedChild;
    }

    await requireSignedInUser();

    const {
        data,
        error
    } = await supabase
        .from("child_profiles")
        .select("*")
        .eq(
            "id",
            childId
        )
        .single();

    if (error) {
        throw error;
    }

    cachedChild = data;

    setSelectedChild(data);

    return cachedChild;
}

export async function requireSelectedChild() {
    try {
        return await loadSelectedChild();
    } catch (error) {
        window.location.replace(
            "profiles.html"
        );

        throw error;
    }
}

/* =========================================================
   FAMILY CONTEXT
========================================================= */

export async function loadFamilyContext({
    forceRefresh = false
} = {}) {
    if (
        cachedFamily &&
        !forceRefresh
    ) {
        return cachedFamily;
    }

    const user =
        await requireSignedInUser();

    const {
        data,
        error
    } = await supabase
        .from("family_members")
        .select(`
            id,
            family_id,
            user_id,
            display_name,
            email,
            relationship,
            member_role,
            status,
            created_at
        `)
        .eq(
            "user_id",
            user.id
        )
        .eq(
            "status",
            "active"
        );

    if (error) {
        throw error;
    }

    const memberships =
        data || [];

    const membership =
        memberships.find(
            item =>
                item.member_role ===
                "owner"
        ) ||
        memberships[0] ||
        null;

    if (!membership) {
        throw new Error(
            "This account is not connected to an ELCraft family."
        );
    }

    cachedFamily = {
        id:
            membership.family_id,

        membership,

        isOwner:
            membership.member_role ===
            "owner"
    };

    return cachedFamily;
}

/* =========================================================
   WALLET / ECONOMY
========================================================= */

export async function loadWallet({
    forceRefresh = false
} = {}) {
    const child =
        await requireSelectedChild();

    if (
        cachedWallet?.child_id ===
            child.id &&
        !forceRefresh
    ) {
        return cachedWallet;
    }

    const {
        data,
        error
    } = await supabase
        .from("child_wallets")
        .select("*")
        .eq(
            "child_id",
            child.id
        )
        .maybeSingle();

    if (error) {
        throw error;
    }

    cachedWallet = data || {
        child_id:
            child.id,

        ...DEFAULT_WALLET
    };

    return cachedWallet;
}

export async function changeWalletBalance({
    xp = 0,
    coins = 0,
    gems = 0,
    stars = 0,
    familyPoints = 0
} = {}) {
    const child =
        await requireSelectedChild();

    const current =
        await loadWallet({
            forceRefresh: true
        });

    const nextWallet = {
        child_id:
            child.id,

        xp:
            Math.max(
                0,
                cleanNumber(current.xp) +
                cleanNumber(xp)
            ),

        coins:
            Math.max(
                0,
                cleanNumber(current.coins) +
                cleanNumber(coins)
            ),

        gems:
            Math.max(
                0,
                cleanNumber(current.gems) +
                cleanNumber(gems)
            ),

        stars:
            Math.max(
                0,
                cleanNumber(current.stars) +
                cleanNumber(stars)
            ),

        family_points:
            Math.max(
                0,
                cleanNumber(
                    current.family_points
                ) +
                cleanNumber(
                    familyPoints
                )
            ),

        updated_at:
            new Date().toISOString()
    };

    const {
        data,
        error
    } = await supabase
        .from("child_wallets")
        .upsert(
            nextWallet,
            {
                onConflict:
                    "child_id"
            }
        )
        .select()
        .single();

    if (error) {
        throw error;
    }

    cachedWallet = data;

    dispatchEngineEvent(
        "wallet-updated",
        {
            wallet:
                cachedWallet,

            changes: {
                xp,
                coins,
                gems,
                stars,
                familyPoints
            }
        }
    );

    return cachedWallet;
}

export async function canAfford({
    coins = 0,
    gems = 0,
    stars = 0
} = {}) {
    const wallet =
        await loadWallet();

    return (
        cleanNumber(wallet.coins) >=
            cleanNumber(coins) &&
        cleanNumber(wallet.gems) >=
            cleanNumber(gems) &&
        cleanNumber(wallet.stars) >=
            cleanNumber(stars)
    );
}

export async function spendCurrency({
    coins = 0,
    gems = 0,
    stars = 0
} = {}) {
    const affordable =
        await canAfford({
            coins,
            gems,
            stars
        });

    if (!affordable) {
        throw new Error(
            "There is not enough currency for this purchase."
        );
    }

    return changeWalletBalance({
        coins:
            -Math.abs(
                cleanNumber(coins)
            ),

        gems:
            -Math.abs(
                cleanNumber(gems)
            ),

        stars:
            -Math.abs(
                cleanNumber(stars)
            )
    });
}

/* =========================================================
   INVENTORY
========================================================= */

export async function loadInventory() {
    const child =
        await requireSelectedChild();

    const {
        data,
        error
    } = await supabase
        .from("inventory_items")
        .select("*")
        .eq(
            "child_id",
            child.id
        )
        .gt(
            "quantity",
            0
        )
        .order(
            "is_favorite",
            {
                ascending: false
            }
        )
        .order(
            "item_name",
            {
                ascending: true
            }
        );

    if (error) {
        throw error;
    }

    return data || [];
}

export async function addInventoryItem({
    itemKey,
    itemName,
    itemType = "general",
    itemIcon = "🎒",
    description = null,
    quantity = 1,
    rarity = "common",
    metadata = {}
}) {
    const child =
        await requireSelectedChild();

    requireValue(
        itemKey,
        "An item key is required."
    );

    requireValue(
        itemName,
        "An item name is required."
    );

    const {
        data,
        error
    } = await supabase.rpc(
        "elcraft_add_inventory_item",
        {
            p_child_id:
                child.id,

            p_item_key:
                itemKey,

            p_item_name:
                itemName,

            p_item_type:
                itemType,

            p_item_icon:
                itemIcon,

            p_description:
                description,

            p_quantity:
                Math.max(
                    1,
                    cleanNumber(
                        quantity,
                        1
                    )
                ),

            p_rarity:
                rarity,

            p_metadata:
                metadata
        }
    );

    if (error) {
        throw error;
    }

    dispatchEngineEvent(
        "inventory-updated",
        {
            action:
                "added",

            item:
                data
        }
    );

    return data;
}

export async function useInventoryItem(
    inventoryId,
    quantity = 1
) {
    requireValue(
        inventoryId,
        "An inventory item is required."
    );

    const {
        data,
        error
    } = await supabase.rpc(
        "elcraft_use_inventory_item",
        {
            p_inventory_id:
                inventoryId,

            p_quantity:
                Math.max(
                    1,
                    cleanNumber(
                        quantity,
                        1
                    )
                )
        }
    );

    if (error) {
        throw error;
    }

    dispatchEngineEvent(
        "inventory-updated",
        {
            action:
                "used",

            item:
                data
        }
    );

    return data;
}

/* =========================================================
   QUESTS
========================================================= */

export async function assignAvailableQuests() {
    const child =
        await requireSelectedChild();

    const {
        error
    } = await supabase.rpc(
        "elcraft_assign_available_quests",
        {
            p_child_id:
                child.id
        }
    );

    if (error) {
        throw error;
    }
}

export async function loadQuests() {
    const child =
        await requireSelectedChild();

    await assignAvailableQuests();

    const {
        data,
        error
    } = await supabase
        .from("child_quests")
        .select(`
            id,
            progress_value,
            status,
            assigned_at,
            completed_at,
            claimed_at,
            reset_key,
            quest:quests (
                id,
                quest_key,
                title,
                description,
                quest_type,
                category,
                icon,
                target_value,
                xp_reward,
                coin_reward,
                item_reward_key,
                item_reward_name,
                item_reward_icon,
                item_reward_type,
                item_reward_quantity,
                sort_order
            )
        `)
        .eq(
            "child_id",
            child.id
        )
        .order(
            "assigned_at",
            {
                ascending: false
            }
        );

    if (error) {
        throw error;
    }

    return data || [];
}

export async function incrementQuest(
    questKey,
    amount = 1
) {
    const child =
        await requireSelectedChild();

    requireValue(
        questKey,
        "A quest key is required."
    );

    const {
        data,
        error
    } = await supabase.rpc(
        "elcraft_increment_quest",
        {
            p_child_id:
                child.id,

            p_quest_key:
                questKey,

            p_amount:
                Math.max(
                    1,
                    cleanNumber(
                        amount,
                        1
                    )
                )
        }
    );

    if (error) {
        throw error;
    }

    dispatchEngineEvent(
        "quest-progress",
        {
            quest:
                data
        }
    );

    if (
        data?.status ===
        "completed"
    ) {
        dispatchEngineEvent(
            "quest-completed",
            {
                quest:
                    data
            }
        );
    }

    return data;
}

export async function claimQuest(
    childQuestId
) {
    requireValue(
        childQuestId,
        "A child quest is required."
    );

    const {
        data,
        error
    } = await supabase.rpc(
        "elcraft_claim_quest",
        {
            p_child_quest_id:
                childQuestId
        }
    );

    if (error) {
        throw error;
    }

    cachedWallet = null;

    dispatchEngineEvent(
        "quest-claimed",
        {
            quest:
                data
        }
    );

    return data;
}

/* =========================================================
   FAMILY FEED
========================================================= */

export async function postFamilyActivity({
    activityType = "family",
    title,
    message = null,
    icon = "💜",
    starsEarned = 0,
    xpEarned = 0,
    childId = null,
    metadata = {}
}) {
    const user =
        await requireSignedInUser();

    const family =
        await loadFamilyContext();

    const selectedChildId =
        childId ||
        getSelectedChildId() ||
        null;

    requireValue(
        title,
        "An activity title is required."
    );

    const {
        data,
        error
    } = await supabase
        .from("family_activity")
        .insert({
            family_id:
                family.id,

            actor_user_id:
                user.id,

            child_id:
                selectedChildId,

            activity_type:
                activityType,

            title:
                cleanText(title),

            message:
                message
                    ? cleanText(message)
                    : null,

            icon:
                cleanText(
                    icon,
                    "💜"
                ),

            stars_earned:
                Math.max(
                    0,
                    cleanNumber(
                        starsEarned
                    )
                ),

            xp_earned:
                Math.max(
                    0,
                    cleanNumber(
                        xpEarned
                    )
                ),

            metadata:
                metadata || {}
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    dispatchEngineEvent(
        "family-activity",
        {
            activity:
                data
        }
    );

    return data;
}

/* =========================================================
   COMPLETE GAME ACTION
========================================================= */

export async function completeGameAction({
    questKey = null,
    questAmount = 1,

    xp = 0,
    coins = 0,
    gems = 0,
    stars = 0,
    familyPoints = 0,

    inventoryItem = null,

    feedActivity = null
} = {}) {
    const child =
        await requireSelectedChild();

    const result = {
        child,
        quest:
            null,
        wallet:
            null,
        inventory:
            null,
        activity:
            null
    };

    if (questKey) {
        result.quest =
            await incrementQuest(
                questKey,
                questAmount
            );
    }

    if (
        xp ||
        coins ||
        gems ||
        stars ||
        familyPoints
    ) {
        result.wallet =
            await changeWalletBalance({
                xp,
                coins,
                gems,
                stars,
                familyPoints
            });
    }

    if (inventoryItem) {
        result.inventory =
            await addInventoryItem(
                inventoryItem
            );
    }

    if (feedActivity) {
        result.activity =
            await postFamilyActivity({
                ...feedActivity,

                childId:
                    child.id,

                starsEarned:
                    feedActivity.starsEarned ??
                    stars,

                xpEarned:
                    feedActivity.xpEarned ??
                    xp
            });
    }

    dispatchEngineEvent(
        "action-completed",
        result
    );

    return result;
}

/* =========================================================
   ENGINE STARTUP
========================================================= */

export async function initializeELCraft({
    requireChild = true
} = {}) {
    const user =
        await requireSignedInUser();

    let child = null;
    let wallet = null;

    if (requireChild) {
        child =
            await requireSelectedChild();

        try {
            wallet =
                await loadWallet();
        } catch (error) {
            console.warn(
                "ELCraft wallet was not loaded:",
                error
            );
        }
    }

    const state = {
        user,
        child,
        wallet
    };

    dispatchEngineEvent(
        "ready",
        state
    );

    return state;
}

export const ELCraft = {
    getCurrentUser,
    requireSignedInUser,
    signOutELCraft,

    getSelectedChildId,
    getSelectedChildSnapshot,
    setSelectedChild,
    clearSelectedChild,
    loadSelectedChild,
    requireSelectedChild,

    loadFamilyContext,

    loadWallet,
    changeWalletBalance,
    canAfford,
    spendCurrency,

    loadInventory,
    addInventoryItem,
    useInventoryItem,

    assignAvailableQuests,
    loadQuests,
    incrementQuest,
    claimQuest,

    postFamilyActivity,

    completeGameAction,
    initializeELCraft
};

window.ELCraft =
    ELCraft;
