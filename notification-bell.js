import {
    getUnreadCount,
    loadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    subscribeToNotifications,
    showNotificationToast
} from "./notification-engine.js";

let panelOpen = false;

function createStyles() {
    const style =
        document.createElement("style");

    style.textContent = `
        #elcraftBellButton {
            position: fixed;
            top: 74px;
            right: 14px;
            z-index: 99990;

            width: 52px;
            height: 52px;

            display: grid;
            place-items: center;

            border: 3px solid white;
            border-radius: 50%;

            color: white;
            background:
                linear-gradient(
                    145deg,
                    #6f58e8,
                    #9878ff
                );

            box-shadow:
                0 8px 20px
                rgba(49,43,112,.28);

            font-size: 24px;
            cursor: pointer;
        }

        #elcraftBellCount {
            position: absolute;
            top: -6px;
            right: -6px;

            min-width: 24px;
            height: 24px;

            display: grid;
            place-items: center;

            border: 3px solid white;
            border-radius: 999px;

            color: white;
            background: #ee5d79;

            font-size: 9px;
            font-weight: 900;
        }

        #elcraftNotificationPanel {
            position: fixed;
            top: 136px;
            right: 14px;
            z-index: 99989;

            width:
                min(
                    390px,
                    calc(100% - 28px)
                );

            max-height:
                min(
                    610px,
                    calc(100vh - 155px)
                );

            overflow: hidden;

            border: 4px solid white;
            border-radius: 23px;

            background:
                rgba(
                    255,
                    255,
                    255,
                    .98
                );

            box-shadow:
                0 20px 50px
                rgba(40,37,94,.28);
        }

        .elcraft-notification-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;

            padding: 15px;

            color: white;
            background:
                linear-gradient(
                    135deg,
                    #6653db,
                    #9675f5
                );
        }

        .elcraft-notification-header h3 {
            margin: 0;
            font-size: 17px;
        }

        .elcraft-read-all {
            border: 0;
            border-radius: 11px;
            padding: 8px 10px;

            color: #4a3ba5;
            background: white;

            font-size: 9px;
            font-weight: 900;

            cursor: pointer;
        }

        #elcraftNotificationList {
            max-height: 515px;
            overflow-y: auto;
            padding: 10px;
        }

        .elcraft-notification-item {
            position: relative;

            display: grid;
            grid-template-columns:
                48px 1fr;
            gap: 10px;

            margin-bottom: 8px;
            border: 2px solid #e9e5f8;
            border-radius: 16px;
            padding: 11px;

            color: #373b5e;
            background: #ffffff;

            cursor: pointer;
        }

        .elcraft-notification-item.unread {
            border-color: #a99aed;
            background: #f7f4ff;
        }

        .elcraft-notification-icon {
            width: 48px;
            height: 48px;

            display: grid;
            place-items: center;

            border-radius: 15px;

            background:
                linear-gradient(
                    145deg,
                    #eeeaff,
                    #dff4ff
                );

            font-size: 25px;
        }

        .elcraft-notification-title {
            padding-right: 25px;

            color: #4b3ca6;
            font-size: 12px;
            font-weight: 900;
        }

        .elcraft-notification-message {
            margin-top: 4px;

            color: #747a98;
            font-size: 10px;
            font-weight: 700;
            line-height: 1.4;
        }

        .elcraft-notification-time {
            margin-top: 6px;

            color: #9a9eb1;
            font-size: 8px;
            font-weight: 800;
        }

        .elcraft-dismiss {
            position: absolute;
            top: 8px;
            right: 8px;

            width: 24px;
            height: 24px;

            border: 0;
            border-radius: 50%;

            color: #777c98;
            background: #eceaf5;

            font-size: 11px;
            font-weight: 900;

            cursor: pointer;
        }

        .elcraft-empty-notifications {
            border: 2px dashed #d7d3ed;
            border-radius: 16px;
            padding: 28px 15px;

            color: #777d99;
            text-align: center;
            font-size: 11px;
            font-weight: 800;
        }
    `;

    document.head.appendChild(
        style
    );
}

function formatTime(value) {
    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const minutes =
        Math.floor(
            (
                Date.now() -
                date.getTime()
            ) /
            60000
        );

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days =
        Math.floor(
            hours / 24
        );

    if (days === 1) {
        return "Yesterday";
    }

    return `${days}d ago`;
}

async function updateCount() {
    try {
        const count =
            await getUnreadCount();

        const countElement =
            document.getElementById(
                "elcraftBellCount"
            );

        if (!countElement) {
            return;
        }

        countElement.textContent =
            count > 99
                ? "99+"
                : String(count);

        countElement.hidden =
            count === 0;

    } catch (error) {
        console.warn(
            "Notification count error:",
            error
        );
    }
}

function createNotificationItem(
    notification
) {
    const item =
        document.createElement("article");

    item.className =
        notification.is_read
            ? "elcraft-notification-item"
            : "elcraft-notification-item unread";

    const icon =
        document.createElement("div");

    icon.className =
        "elcraft-notification-icon";

    icon.textContent =
        notification.icon || "🔔";

    const copy =
        document.createElement("div");

    const title =
        document.createElement("div");

    title.className =
        "elcraft-notification-title";

    title.textContent =
        notification.title;

    const message =
        document.createElement("div");

    message.className =
        "elcraft-notification-message";

    message.textContent =
        notification.message || "";

    const time =
        document.createElement("div");

    time.className =
        "elcraft-notification-time";

    time.textContent =
        formatTime(
            notification.created_at
        );

    copy.append(
        title,
        message,
        time
    );

    const dismiss =
        document.createElement("button");

    dismiss.className =
        "elcraft-dismiss";

    dismiss.type =
        "button";

    dismiss.textContent =
        "×";

    dismiss.title =
        "Dismiss notification";

    dismiss.addEventListener(
        "click",
        async event => {
            event.stopPropagation();

            dismiss.disabled =
                true;

            try {
                await dismissNotification(
                    notification.id
                );

                item.remove();

                await updateCount();

            } catch (error) {
                dismiss.disabled =
                    false;

                console.error(
                    "Dismiss error:",
                    error
                );
            }
        }
    );

    item.append(
        icon,
        copy,
        dismiss
    );

    item.addEventListener(
        "click",
        async () => {
            try {
                if (
                    !notification.is_read
                ) {
                    await markNotificationRead(
                        notification.id
                    );

                    item.classList.remove(
                        "unread"
                    );

                    await updateCount();
                }

                if (
                    notification.action_url
                ) {
                    window.location.href =
                        notification.action_url;
                }

            } catch (error) {
                console.error(
                    "Notification click error:",
                    error
                );
            }
        }
    );

    return item;
}

async function renderPanel() {
    const list =
        document.getElementById(
            "elcraftNotificationList"
        );

    if (!list) {
        return;
    }

    list.innerHTML =
        '<div class="elcraft-empty-notifications">Loading notifications...</div>';

    const {
        data,
        error
    } = await loadNotifications({
        includeRead: true,
        includeDismissed: false,
        limit: 50
    });

    list.replaceChildren();

    if (error) {
        const empty =
            document.createElement("div");

        empty.className =
            "elcraft-empty-notifications";

        empty.textContent =
            error.message ||
            "Unable to load notifications.";

        list.appendChild(empty);

        return;
    }

    if (!data.length) {
        const empty =
            document.createElement("div");

        empty.className =
            "elcraft-empty-notifications";

        empty.textContent =
            "🔔 No notifications yet.";

        list.appendChild(empty);

        return;
    }

    data.forEach(
        notification => {
            list.appendChild(
                createNotificationItem(
                    notification
                )
            );
        }
    );
}

function createPanel() {
    const panel =
        document.createElement("aside");

    panel.id =
        "elcraftNotificationPanel";

    panel.hidden =
        true;

    panel.innerHTML = `
        <header class="elcraft-notification-header">
            <h3>🔔 Notifications</h3>

            <button
                id="elcraftReadAll"
                class="elcraft-read-all"
                type="button">
                Mark All Read
            </button>
        </header>

        <div
            id="elcraftNotificationList">
        </div>
    `;

    document.body.appendChild(
        panel
    );

    document
        .getElementById(
            "elcraftReadAll"
        )
        .addEventListener(
            "click",
            async () => {
                try {
                    await markAllNotificationsRead();

                    await renderPanel();
                    await updateCount();

                } catch (error) {
                    console.error(
                        "Mark-all-read error:",
                        error
                    );
                }
            }
        );
}

function createBell() {
    const button =
        document.createElement("button");

    button.id =
        "elcraftBellButton";

    button.type =
        "button";

    button.title =
        "Notifications";

    button.innerHTML = `
        🔔

        <span
            id="elcraftBellCount"
            hidden>
            0
        </span>
    `;

    document.body.appendChild(
        button
    );

    button.addEventListener(
        "click",
        async () => {
            panelOpen =
                !panelOpen;

            const panel =
                document.getElementById(
                    "elcraftNotificationPanel"
                );

            panel.hidden =
                !panelOpen;

            if (panelOpen) {
                await renderPanel();
            }
        }
    );
}

async function initializeNotificationBell() {
    createStyles();
    createPanel();
    createBell();

    await updateCount();

    subscribeToNotifications({
        onNotification:
            async notification => {
                showNotificationToast(
                    notification
                );

                await updateCount();

                if (panelOpen) {
                    await renderPanel();
                }
            }
    });
}

initializeNotificationBell();
