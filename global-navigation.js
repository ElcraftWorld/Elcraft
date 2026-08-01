/*
  ELCraft Global Navigation
  File name: global-navigation.js

  Add this near the bottom of every ELCraft HTML page:

  <script
    type="module"
    src="global-navigation.js?v=1">
  </script>

  This file automatically shows:
    Parent / invited adult:
      - Family Castle
      - Parent Dashboard
      - Child Profiles
      - Log Out

    Active child:
      - My World
      - Family Castle
      - Switch Player
*/

import {
  supabase
} from "./supabase-client.js";

const KEYS = {
  selectedChildId:
    "elcraft_selected_child_id",

  childName:
    "elcraft_child_name",

  childAvatar:
    "elcraft_child_avatar"
};

const ROUTES = {
  auth:
    "auth.html",

  familyCastle:
    "family-castle.html",

  dashboard:
    "parent-dashboard.html",

  profiles:
    "profiles.html",

  childWorld:
    "my-city.html"
};

const NAV_ID =
  "elcraftGlobalNavigation";

const STYLE_ID =
  "elcraftGlobalNavigationStyles";

function currentPage() {
  return window.location.pathname
    .split("/")
    .pop()
    .toLowerCase();
}

function isCurrentRoute(
  route
) {
  return (
    currentPage() ===
    route.toLowerCase()
  );
}

function clearChildSession() {
  localStorage.removeItem(
    KEYS.selectedChildId
  );

  localStorage.removeItem(
    KEYS.childName
  );

  localStorage.removeItem(
    KEYS.childAvatar
  );
}

function navigate(
  route
) {
  if (
    !route ||
    isCurrentRoute(route)
  ) {
    return;
  }

  window.location.href =
    route;
}

function injectStyles() {
  if (
    document.getElementById(
      STYLE_ID
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    STYLE_ID;

  style.textContent = `
    #${NAV_ID} {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 99998;

      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;

      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }

    #${NAV_ID} * {
      box-sizing: border-box;
    }

    .elcraft-nav-toggle {
      width: 64px;
      height: 64px;

      display: grid;
      place-items: center;

      border: 5px solid white;
      border-radius: 50%;

      color: white;
      background:
        linear-gradient(
          145deg,
          #7758df,
          #4f35a7
        );

      font-size: 30px;
      cursor: pointer;

      box-shadow:
        0 8px 0 rgba(55,37,119,.22),
        0 15px 30px rgba(45,31,94,.28);

      transition:
        transform .16s ease,
        filter .16s ease;
    }

    .elcraft-nav-toggle:hover {
      transform: translateY(-3px);
      filter: brightness(1.05);
    }

    .elcraft-nav-toggle:focus-visible {
      outline: 5px solid #ffd85b;
      outline-offset: 3px;
    }

    .elcraft-nav-menu {
      width: min(310px, calc(100vw - 30px));

      display: grid;
      gap: 9px;

      border: 5px solid rgba(255,255,255,.94);
      border-radius: 25px;
      padding: 12px;

      background:
        rgba(255,255,255,.98);

      box-shadow:
        0 12px 0 rgba(79,58,159,.1),
        0 24px 44px rgba(47,36,94,.24);

      transform-origin:
        bottom right;

      animation:
        elcraftNavPop
        .18s ease-out;
    }

    .elcraft-nav-menu[hidden] {
      display: none;
    }

    .elcraft-nav-header {
      display: flex;
      align-items: center;
      gap: 10px;

      border-radius: 17px;
      padding: 10px 12px;

      color: #4d389f;
      background:
        linear-gradient(
          145deg,
          #f5edff,
          #eef8ff
        );
    }

    .elcraft-nav-avatar {
      width: 47px;
      height: 47px;

      display: grid;
      place-items: center;

      flex: 0 0 auto;

      border: 4px solid white;
      border-radius: 50%;

      background:
        linear-gradient(
          145deg,
          #7dd4ff,
          #9d7cf0
        );

      font-size: 27px;

      box-shadow:
        0 6px 12px rgba(68,49,125,.15);
    }

    .elcraft-nav-copy {
      min-width: 0;
      flex: 1;
    }

    .elcraft-nav-name {
      overflow: hidden;

      font-size: 14px;
      font-weight: 1000;

      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .elcraft-nav-role {
      margin-top: 3px;

      color: #777d99;
      font-size: 10px;
      font-weight: 900;
    }

    .elcraft-nav-button {
      width: 100%;
      min-height: 49px;

      display: flex;
      align-items: center;
      gap: 11px;

      border: 3px solid #e5e0f2;
      border-radius: 16px;
      padding: 10px 12px;

      color: #433b71;
      background: white;

      font-size: 12px;
      font-weight: 1000;
      text-align: left;
      cursor: pointer;

      box-shadow:
        0 5px 0 rgba(67,49,111,.06);

      transition:
        transform .14s ease,
        border-color .14s ease,
        background .14s ease;
    }

    .elcraft-nav-button:hover {
      transform: translateY(-2px);
      border-color: #bfaef0;
      background: #fbf9ff;
    }

    .elcraft-nav-button.current {
      color: #4d389f;
      border-color: #bba9f2;
      background: #f3edff;
    }

    .elcraft-nav-button.logout {
      color: #a7385a;
      border-color: #f0c1d0;
      background: #fff1f6;
    }

    .elcraft-nav-icon {
      width: 34px;
      height: 34px;

      display: grid;
      place-items: center;

      flex: 0 0 auto;

      border-radius: 12px;

      background: #eee9ff;

      font-size: 20px;
    }

    .elcraft-nav-button.logout
    .elcraft-nav-icon {
      background: #ffe0ea;
    }

    @keyframes elcraftNavPop {
      from {
        opacity: 0;
        transform:
          translateY(12px)
          scale(.94);
      }

      to {
        opacity: 1;
        transform:
          translateY(0)
          scale(1);
      }
    }

    @media (max-width: 600px) {
      #${NAV_ID} {
        right:
          max(
            10px,
            env(safe-area-inset-right)
          );

        bottom:
          max(
            10px,
            env(safe-area-inset-bottom)
          );
      }

      .elcraft-nav-toggle {
        width: 58px;
        height: 58px;
        font-size: 27px;
      }

      .elcraft-nav-menu {
        width: min(
          300px,
          calc(100vw - 20px)
        );
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .elcraft-nav-menu,
      .elcraft-nav-toggle,
      .elcraft-nav-button {
        animation: none;
        transition: none;
      }
    }
  `;

  document.head.appendChild(
    style
  );
}

function createButton({
  icon,
  label,
  route,
  action,
  current = false,
  logout = false
}) {
  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    [
      "elcraft-nav-button",
      current
        ? "current"
        : "",
      logout
        ? "logout"
        : ""
    ]
      .filter(Boolean)
      .join(" ");

  button.innerHTML = `
    <span
      class="elcraft-nav-icon"
      aria-hidden="true">
      ${icon}
    </span>

    <span>
      ${label}
    </span>
  `;

  button.addEventListener(
    "click",
    async () => {
      if (action) {
        await action();
        return;
      }

      navigate(route);
    }
  );

  return button;
}

async function getAccountContext() {
  const {
    data,
    error
  } =
    await supabase.auth.getUser();

  if (
    error ||
    !data.user
  ) {
    return {
      user: null,
      membership: null,
      isAdult:
        false,
      isOwner:
        false
    };
  }

  const user =
    data.user;

  const {
    data: memberships,
    error: membershipError
  } =
    await supabase
      .from("family_members")
      .select(
        "id, family_id, user_id, member_role, relationship, status, display_name, email"
      )
      .eq("user_id", user.id)
      .eq("status", "active");

  if (membershipError) {
    console.warn(
      "Global navigation membership lookup failed:",
      membershipError
    );
  }

  const membershipList =
    memberships ||
    [];

  const membership =
    membershipList.find(
      item =>
        item.member_role ===
        "owner"
    ) ||
    membershipList[0] ||
    null;

  return {
    user,
    membership,
    isAdult:
      Boolean(membership),
    isOwner:
      membership?.member_role ===
      "owner"
  };
}

function createHeader({
  title,
  role,
  avatar
}) {
  const header =
    document.createElement(
      "div"
    );

  header.className =
    "elcraft-nav-header";

  header.innerHTML = `
    <div
      class="elcraft-nav-avatar"
      aria-hidden="true">
      ${avatar}
    </div>

    <div class="elcraft-nav-copy">
      <div class="elcraft-nav-name">
        ${title}
      </div>

      <div class="elcraft-nav-role">
        ${role}
      </div>
    </div>
  `;

  return header;
}

async function buildNavigation() {
  if (
    document.getElementById(
      NAV_ID
    )
  ) {
    return;
  }

  injectStyles();

  const account =
    await getAccountContext();

  const selectedChildId =
    localStorage.getItem(
      KEYS.selectedChildId
    );

  const childName =
    localStorage.getItem(
      KEYS.childName
    ) ||
    "Player";

  const childAvatar =
    localStorage.getItem(
      KEYS.childAvatar
    ) ||
    "🌟";

  const childIsActive =
    Boolean(
      selectedChildId
    );

  const root =
    document.createElement(
      "aside"
    );

  root.id =
    NAV_ID;

  root.setAttribute(
    "aria-label",
    "ELCraft navigation"
  );

  const menu =
    document.createElement(
      "div"
    );

  menu.className =
    "elcraft-nav-menu";

  menu.hidden =
    true;

  const toggle =
    document.createElement(
      "button"
    );

  toggle.type =
    "button";

  toggle.className =
    "elcraft-nav-toggle";

  toggle.setAttribute(
    "aria-label",
    "Open ELCraft navigation"
  );

  toggle.setAttribute(
    "aria-expanded",
    "false"
  );

  toggle.textContent =
    childIsActive
      ? "✨"
      : "🏰";

  toggle.addEventListener(
    "click",
    () => {
      const opening =
        menu.hidden;

      menu.hidden =
        !opening;

      toggle.setAttribute(
        "aria-expanded",
        String(opening)
      );

      toggle.setAttribute(
        "aria-label",
        opening
          ? "Close ELCraft navigation"
          : "Open ELCraft navigation"
      );
    }
  );

  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key ===
        "Escape"
      ) {
        menu.hidden =
          true;

        toggle.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    }
  );

  document.addEventListener(
    "pointerdown",
    event => {
      if (
        !root.contains(
          event.target
        )
      ) {
        menu.hidden =
          true;

        toggle.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    }
  );

  if (childIsActive) {
    menu.appendChild(
      createHeader({
        title:
          childName,

        role:
          "Child World",

        avatar:
          childAvatar
      })
    );

    menu.appendChild(
      createButton({
        icon:
          "🏙️",

        label:
          "My World",

        route:
          ROUTES.childWorld,

        current:
          isCurrentRoute(
            ROUTES.childWorld
          )
      })
    );
  } else if (
    account.isAdult
  ) {
    const displayName =
      account.membership
        ?.display_name ||
      account.user
        ?.user_metadata
        ?.display_name ||
      account.user
        ?.user_metadata
        ?.full_name ||
      account.user
        ?.email ||
      "Parent";

    const role =
      account.isOwner
        ? "Family Owner"
        : (
            account.membership
              ?.relationship ||
            "Family Member"
          );

    menu.appendChild(
      createHeader({
        title:
          displayName,

        role,

        avatar:
          account.isOwner
            ? "👑"
            : "👤"
      })
    );
  } else {
    menu.appendChild(
      createHeader({
        title:
          "ELCraft",

        role:
          "Navigation",

        avatar:
          "🏰"
      })
    );
  }

  if (account.isAdult) {
    menu.appendChild(
      createButton({
        icon:
          "🏰",

        label:
          "Family Castle",

        route:
          ROUTES.familyCastle,

        current:
          isCurrentRoute(
            ROUTES.familyCastle
          )
      })
    );

    menu.appendChild(
      createButton({
        icon:
          "📊",

        label:
          "Parent Dashboard",

        route:
          ROUTES.dashboard,

        current:
          isCurrentRoute(
            ROUTES.dashboard
          )
      })
    );

    menu.appendChild(
      createButton({
        icon:
          "👧",

        label:
          childIsActive
            ? "Switch Player"
            : "Child Profiles",

        route:
          ROUTES.profiles,

        current:
          isCurrentRoute(
            ROUTES.profiles
          ),

        action:
          childIsActive
            ? async () => {
                clearChildSession();

                navigate(
                  ROUTES.profiles
                );
              }
            : null
      })
    );

    menu.appendChild(
      createButton({
        icon:
          "🚪",

        label:
          "Log Out",

        logout:
          true,

        action:
          async () => {
            clearChildSession();

            const {
              error
            } =
              await supabase.auth
                .signOut();

            if (error) {
              console.error(
                "ELCraft sign-out failed:",
                error
              );
            }

            window.location.replace(
              ROUTES.auth
            );
          }
      })
    );
  } else if (
    childIsActive
  ) {
    menu.appendChild(
      createButton({
        icon:
          "🏰",

        label:
          "Family Castle",

        route:
          ROUTES.familyCastle,

        current:
          isCurrentRoute(
            ROUTES.familyCastle
          )
      })
    );

    menu.appendChild(
      createButton({
        icon:
          "🔁",

        label:
          "Switch Player",

        action:
          async () => {
            clearChildSession();

            navigate(
              ROUTES.profiles
            );
          }
      })
    );
  } else {
    menu.appendChild(
      createButton({
        icon:
          "🔐",

        label:
          "Parent Sign In",

        route:
          ROUTES.auth,

        current:
          isCurrentRoute(
            ROUTES.auth
          )
      })
    );
  }

  root.appendChild(
    menu
  );

  root.appendChild(
    toggle
  );

  document.body.appendChild(
    root
  );
}

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      buildNavigation()
        .catch(error => {
          console.error(
            "ELCraft global navigation failed:",
            error
          );
        });
    }
  );
} else {
  buildNavigation()
    .catch(error => {
      console.error(
        "ELCraft global navigation failed:",
        error
      );
    });
}
