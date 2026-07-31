import { supabase } from "./supabase-client.js";

const CHILD_ID_KEY =
    "elcraft_selected_child_id";

let notificationChannel = null;

function selectedChildId() {
    return localStorage.getItem(
        CHILD_ID_KEY
    );
}

function dispatchNotificationEvent(
    name,
    detail = {}
) {
    window.dispatchEvent(
        new CustomEvent(
            `elcraft:${name}`,
            {
                detail
            }
        )
    );
}

export async function createNotification({
    childId = selectedChildId(),
    type = "general",
    title,
    message = null,
    icon = "🔔",
    actionUrl = null,
    actionLabel = null,
    metadata = {}
}) {
    if (!title) {
        throw new Error(
            "A notification title is required."
        );
    }

    const {
        data,
        error
    } = await supabase.rpc(
        "elcraft_create_notification",
        {
            p_child_id:
                childId || null,

            p_notification_type:
                type,

            p_title:
                title,

            p_message:
                message,

            p_icon:
                icon,

            p_action_url:
                actionUrl,

            p_action_label:
                actionLabel,

            p_metadata:
                metadata || {}
        }
    );

    if (error) {
        throw error;
    }

    dispatchNotificationEvent(
        "notification-created",
        {
            notification:
                data
        }
    );

    return data;
}

export async function loadNotifications({
    childId = selectedChildId(),
    includeRead = true,
    includeDismissed = false,
    limit = 100
} = {}) {
    let query =
        supabase
            .from("game_notifications")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(limit);

    if (childId) {
        query =
            query.or(
                `child_id.eq.${childId},child_id.is.null`
            );
    }

    if (!includeRead) {
        query =
            query.eq(
                "is_read",
                false
            );
    }

    if (!includeDismissed) {
        query =
            query.eq(
                "is_dismissed",
                false
            );
    }

    const {
        data,
        error
    } = await query;

    return {
        data:
            data || [],

        error
    };
}

export async function getUnreadCount({
    childId = selectedChildId()
} = {}) {
    let query =
        supabase
            .from("game_notifications")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "is_read",
                false
            )
            .eq(
                "is_dismissed",
                false
            );

    if (childId) {
        query =
            query.or(
                `child_id.eq.${childId},child_id.is.null`
            );
    }

    const {
        count,
        error
    } = await query;

    if (error) {
        throw error;
    }

    return Number(count || 0);
}

export async function markNotificationRead(
    notificationId
) {
    const {
        data,
        error
    } = await supabase
        .from("game_notifications")
        .update({
            is_read: true,
            read_at:
                new Date().toISOString()
        })
        .eq(
            "id",
            notificationId
        )
        .select()
        .single();

    if (error) {
        throw error;
    }

    dispatchNotificationEvent(
        "notification-read",
        {
            notification:
                data
        }
    );

    return data;
}

export async function markAllNotificationsRead({
    childId = selectedChildId()
} = {}) {
    const {
        data,
        error
    } = await supabase.rpc(
        "elcraft_mark_all_notifications_read",
        {
            p_child_id:
                childId || null
        }
    );

    if (error) {
        throw error;
    }

    dispatchNotificationEvent(
        "notifications-read-all",
        {
            count:
                Number(data || 0)
        }
    );

    return Number(data || 0);
}

export async function dismissNotification(
    notificationId
) {
    const {
        data,
        error
    } = await supabase
        .from("game_notifications")
        .update({
            is_dismissed: true,
            dismissed_at:
                new Date().toISOString()
        })
        .eq(
            "id",
            notificationId
        )
        .select()
        .single();

    if (error) {
        throw error;
    }

    dispatchNotificationEvent(
        "notification-dismissed",
        {
            notification:
                data
        }
    );

    return data;
}

export function subscribeToNotifications({
    childId = selectedChildId(),
    onNotification = null
} = {}) {
    if (notificationChannel) {
        supabase.removeChannel(
            notificationChannel
        );
    }

    notificationChannel =
        supabase
            .channel(
                `game-notifications-${
                    childId || "account"
                }`
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table:
                        "game_notifications"
                },
                payload => {
                    const notification =
                        payload.new;

                    const appliesToChild =
                        !notification.child_id ||
                        !childId ||
                        notification.child_id ===
                            childId;

                    if (!appliesToChild) {
                        return;
                    }

                    dispatchNotificationEvent(
                        "notification-received",
                        {
                            notification
                        }
                    );

                    if (
                        typeof onNotification ===
                        "function"
                    ) {
                        onNotification(
                            notification
                        );
                    }
                }
            )
            .subscribe();

    return notificationChannel;
}

export function stopNotificationSubscription() {
    if (!notificationChannel) {
        return;
    }

    supabase.removeChannel(
        notificationChannel
    );

    notificationChannel = null;
}

export function showNotificationToast(
    notification,
    {
        duration = 5000
    } = {}
) {
    const existing =
        document.getElementById(
            "elcraftNotificationToast"
        );

    if (existing) {
        existing.remove();
    }

    const toast =
        document.createElement("button");

    toast.id =
        "elcraftNotificationToast";

    toast.type =
        "button";

    Object.assign(
        toast.style,
        {
            position:
                "fixed",

            right:
                "18px",

            bottom:
                "18px",

            zIndex:
                "999999",

            width:
                "min(380px, calc(100% - 36px))",

            display:
                "grid",

            gridTemplateColumns:
                "52px 1fr",

            alignItems:
                "center",

            gap:
                "12px",

            border:
                "3px solid white",

            borderRadius:
                "18px",

            padding:
                "13px",

            color:
                "#35395f",

            background:
                "rgba(255,255,255,.97)",

            boxShadow:
                "0 16px 40px rgba(46,42,103,.28)",

            textAlign:
                "left",

            cursor:
                notification.action_url
                    ? "pointer"
                    : "default"
        }
    );

    const icon =
        document.createElement("div");

    Object.assign(
        icon.style,
        {
            width:
                "52px",

            height:
                "52px",

            display:
                "grid",

            placeItems:
                "center",

            borderRadius:
                "16px",

            background:
                "linear-gradient(145deg,#eeeaff,#dff4ff)",

            fontSize:
                "28px"
        }
    );

    icon.textContent =
        notification.icon || "🔔";

    const copy =
        document.createElement("div");

    const title =
        document.createElement("strong");

    title.style.display =
        "block";

    title.style.color =
        "#4d3eae";

    title.style.fontSize =
        "14px";

    title.textContent =
        notification.title ||
        "New Notification";

    const message =
        document.createElement("span");

    message.style.display =
        "block";

    message.style.marginTop =
        "4px";

    message.style.color =
        "#727895";

    message.style.fontSize =
        "11px";

    message.style.fontWeight =
        "700";

    message.style.lineHeight =
        "1.4";

    message.textContent =
        notification.message || "";

    copy.append(
        title,
        message
    );

    toast.append(
        icon,
        copy
    );

    toast.addEventListener(
        "click",
        async () => {
            try {
                if (!notification.is_read) {
                    await markNotificationRead(
                        notification.id
                    );
                }
            } catch (error) {
                console.warn(
                    "Unable to mark notification read:",
                    error
                );
            }

            if (notification.action_url) {
                window.location.href =
                    notification.action_url;
            }
        }
    );

    document.body.appendChild(
        toast
    );

    window.setTimeout(
        () => {
            toast.remove();
        },
        duration
    );
}

export const Notifications = {
    createNotification,
    loadNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    subscribeToNotifications,
    stopNotificationSubscription,
    showNotificationToast
};

window.ELCraftNotifications =
    Notifications;
