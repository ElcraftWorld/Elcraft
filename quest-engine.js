import { supabase } from "./supabase-client.js";

const CHILD_ID_KEY = "elcraft_selected_child_id";

export function getSelectedChildId() {
    return localStorage.getItem(CHILD_ID_KEY);
}

export async function assignAvailableQuests(
    childId = getSelectedChildId()
) {
    if (!childId) {
        throw new Error("No child profile is selected.");
    }

    const { error } = await supabase.rpc(
        "elcraft_assign_available_quests",
        {
            p_child_id: childId
        }
    );

    if (error) {
        throw error;
    }
}

export async function loadQuests(
    childId = getSelectedChildId()
) {
    if (!childId) {
        return {
            data: [],
            error: new Error("No child profile is selected.")
        };
    }

    await assignAvailableQuests(childId);

    const { data, error } = await supabase
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
        .eq("child_id", childId)
        .order("assigned_at", { ascending: false });

    return {
        data: data || [],
        error
    };
}

export async function loadWallet(
    childId = getSelectedChildId()
) {
    if (!childId) {
        return {
            data: null,
            error: new Error("No child profile is selected.")
        };
    }

    const { data, error } = await supabase
        .from("child_wallets")
        .select("*")
        .eq("child_id", childId)
        .maybeSingle();

    return {
        data: data || {
            child_id: childId,
            xp: 0,
            coins: 0,
            gems: 0,
            stars: 0,
            family_points: 0
        },
        error
    };
}

export async function incrementQuest(
    questKey,
    amount = 1,
    childId = getSelectedChildId()
) {
    if (!childId) {
        throw new Error("No child profile is selected.");
    }

    const { data, error } = await supabase.rpc(
        "elcraft_increment_quest",
        {
            p_child_id: childId,
            p_quest_key: questKey,
            p_amount: amount
        }
    );

    if (error) {
        throw error;
    }

    return data;
}

export async function claimQuest(childQuestId) {
    const { data, error } = await supabase.rpc(
        "elcraft_claim_quest",
        {
            p_child_quest_id: childQuestId
        }
    );

    if (error) {
        throw error;
    }

    return data;
}

/*
Examples from other pages:

Reading page:
await incrementQuest("daily_read_15", 5);

Math page:
await incrementQuest("daily_math_5", 1);

Pet page:
await incrementQuest("daily_pet_care", 1);

Library page:
await incrementQuest("story_visit_library", 1);
*/
