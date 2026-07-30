import { supabase } from "./supabase-client.js";

const SELECTED_CHILD_ID_KEY =
  "elcraft_selected_child_id";

const CHILD_NAME_KEY =
  "elcraft_child_name";

const CHILD_AVATAR_KEY =
  "elcraft_child_avatar";

async function verifyPlayerSession() {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error || !session) {
    clearPlayerSelection();
    window.location.replace("auth.html");
    return false;
  }

  const selectedChildId =
    localStorage.getItem(SELECTED_CHILD_ID_KEY);

  if (!selectedChildId) {
    window.location.replace("profiles.html");
    return false;
  }

  return true;
}

function clearPlayerSelection() {
  localStorage.removeItem(
    SELECTED_CHILD_ID_KEY
  );

  localStorage.removeItem(
    CHILD_NAME_KEY
  );

  localStorage.removeItem(
    CHILD_AVATAR_KEY
  );
}

function addParentMenuStyles() {
  const style =
    document.createElement("style");

  style.textContent = `
    #elcraftParentMenu,
    #elcraftParentMenu * {
      box-sizing: border-box;
    }

    #elcraftParentButton {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9998;

      width: 54px;
      height: 54px;

      display: flex;
      align-items: center;
      justify-content: center;

      border: 3px solid rgba(255, 255, 255, 0.95);
      border-radius: 50%;

      color: white;
      background:
        linear-gradient(
          145deg,
          #6559f4,
          #9269ff
        );

      box-shadow:
        0 7px 0 #4740b6,
        0 12px 24px rgba(39, 35, 105, 0.3);

      font-size: 26px;
      cursor: pointer;

      transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
    }

    #elcraftParentButton:hover {
      transform: translateY(-2px);

      box-shadow:
        0 9px 0 #4740b6,
        0 15px 28px rgba(39, 35, 105, 0.34);
    }

    #elcraftParentButton:active {
      transform: translateY(5px);

      box-shadow:
        0 2px 0 #4740b6,
        0 7px 14px rgba(39, 35, 105, 0.26);
    }

    #elcraftParentPanel {
      position: fixed;
      top: 82px;
      right: 16px;
      z-index: 9999;

      width: min(320px, calc(100vw - 32px));

      display: none;

      border: 4px solid rgba(255, 255, 255, 0.94);
      border-radius: 24px;
      padding: 20px;

      color: #34385f;
      background: rgba(255, 255, 255, 0.98);

      box-shadow:
        0 22px 55px rgba(31, 31, 81, 0.36);
    }

    #elcraftParentPanel.open {
      display: block;
      animation: elcraftMenuOpen 0.16s ease-out;
    }

    @keyframes elcraftMenuOpen {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.97);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .elcraft-player-summary {
      display: flex;
      align-items: center;
      gap: 13px;

      margin-bottom: 17px;
      padding-bottom: 16px;

      border-bottom: 2px solid #eceafb;
    }

    .elcraft-player-avatar {
      width: 58px;
      height: 58px;

      flex: 0 0 auto;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 50%;

      background:
        linear-gradient(
          145deg,
          #83d9ff,
          #b08cff
        );

      box-shadow: 0 6px 14px rgba(74, 68, 152, 0.22);

      font-size: 32px;
    }

    .elcraft-player-details {
      min-width: 0;
    }

    .elcraft-player-label {
      margin-bottom: 3px;

      color: #8589a5;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .elcraft-player-name {
      overflow: hidden;

      color: #514abd;
      font-size: 21px;
      font-weight: 900;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .elcraft-parent-title {
      margin: 0 0 13px;

      color: #514abd;
      font-size: 20px;
      text-align: center;
    }

    .elcraft-menu-button {
      width: 100%;
      min-height: 48px;

      display: flex;
      align-items: center;
      gap: 10px;

      margin-top: 10px;
      border: 0;
      border-radius: 14px;
      padding: 11px 14px;

      color: #454a72;
      background: #f0effb;

      font-size: 15px;
      font-weight: 900;
      text-align: left;
      cursor: pointer;
    }

    .elcraft-menu-button:hover {
      background: #e4e1fb;
    }

    .elcraft-menu-button.logout {
      color: #a32f43;
      background: #ffe9ed;
    }

    .elcraft-menu-button.logout:hover {
      background: #ffdce2;
    }

    .elcraft-menu-button:disabled {
      opacity: 0.65;
      cursor: wait;
    }

    .elcraft-menu-icon {
      width: 28px;
      text-align: center;
      font-size: 20px;
    }

    .elcraft-menu-message {
      min-height: 18px;
      margin-top: 12px;

      color: #a32f43;
      font-size: 13px;
      font-weight: 800;
      line-height: 1.35;
      text-align: center;
    }

    @media (max-width: 520px) {
      #elcraftParentButton {
        top: 10px;
        right: 10px;

        width: 49px;
        height: 49px;

        font-size: 23px;
      }

      #elcraftParentPanel {
        top: 69px;
        right: 10px;

        width: calc(100vw - 20px);
      }
    }
  `;

  document.head.appendChild(style);
}

function createParentMenu() {
  const childName =
    localStorage.getItem(CHILD_NAME_KEY) ||
    "Player";

  const childAvatar =
    localStorage.getItem(CHILD_AVATAR_KEY) ||
    "🌟";

  const wrapper =
    document.createElement("div");

  wrapper.id = "elcraftParentMenu";

  wrapper.innerHTML = `
    <button
      id="elcraftParentButton"
      type="button"
      aria-label="Open parent menu"
      aria-expanded="false">
      ⚙️
    </button>

    <section
      id="elcraftParentPanel"
      aria-label="Parent menu">

      <div class="elcraft-player-summary">
        <div class="elcraft-player-avatar">
          ${escapeHtml(childAvatar)}
        </div>

        <div class="elcraft-player-details">
          <div class="elcraft-player-label">
            Current player
          </div>

          <div class="elcraft-player-name">
            ${escapeHtml(childName)}
          </div>
        </div>
      </div>

      <h2 class="elcraft-parent-title">
        Parent Menu
      </h2>

      <button
        id="elcraftSwitchPlayerButton"
        class="elcraft-menu-button"
        type="button">
        <span class="elcraft-menu-icon">👧</span>
        Switch Player
      </button>

      <button
        id="elcraftAddPlayerButton"
        class="elcraft-menu-button"
        type="button">
        <span class="elcraft-menu-icon">➕</span>
        Add a Player
      </button>

      <button
        id="elcraftLogoutButton"
        class="elcraft-menu-button logout"
        type="button">
        <span class="elcraft-menu-icon">🚪</span>
        Log Out
      </button>

      <div
        id="elcraftMenuMessage"
        class="elcraft-menu-message"
        aria-live="polite">
      </div>
    </section>
  `;

  document.body.appendChild(wrapper);

  const parentButton =
    document.getElementById(
      "elcraftParentButton"
    );

  const parentPanel =
    document.getElementById(
      "elcraftParentPanel"
    );

  const switchPlayerButton =
    document.getElementById(
      "elcraftSwitchPlayerButton"
    );

  const addPlayerButton =
    document.getElementById(
      "elcraftAddPlayerButton"
    );

  const logoutButton =
    document.getElementById(
      "elcraftLogoutButton"
    );

  const message =
    document.getElementById(
      "elcraftMenuMessage"
    );

  function closeMenu() {
    parentPanel.classList.remove("open");

    parentButton.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  function openMenu() {
    parentPanel.classList.add("open");

    parentButton.setAttribute(
      "aria-expanded",
      "true"
    );
  }

  parentButton.addEventListener(
    "click",
    event => {
      event.stopPropagation();

      if (
        parentPanel.classList.contains("open")
      ) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  );

  parentPanel.addEventListener(
    "click",
    event => {
      event.stopPropagation();
    }
  );

  document.addEventListener(
    "click",
    closeMenu
  );

  document.addEventListener(
    "keydown",
    event => {
      if (event.key === "Escape") {
        closeMenu();
      }
    }
  );

  switchPlayerButton.addEventListener(
    "click",
    () => {
      clearPlayerSelection();

      window.location.href =
        "profiles.html";
    }
  );

  addPlayerButton.addEventListener(
    "click",
    () => {
      clearPlayerSelection();

      window.location.href =
        "profiles.html?create=true";
    }
  );

  logoutButton.addEventListener(
    "click",
    async () => {
      message.textContent = "";

      logoutButton.disabled = true;
      logoutButton.innerHTML = `
        <span class="elcraft-menu-icon">⏳</span>
        Logging Out...
      `;

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Logout error:",
          error
        );

        message.textContent =
          error.message ||
          "Unable to log out.";

        logoutButton.disabled = false;
        logoutButton.innerHTML = `
          <span class="elcraft-menu-icon">🚪</span>
          Log Out
        `;

        return;
      }

      clearPlayerSelection();

      window.location.replace(
        "auth.html"
      );
    }
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function startParentMenu() {
  const sessionIsValid =
    await verifyPlayerSession();

  if (!sessionIsValid) {
    return;
  }

  addParentMenuStyles();
  createParentMenu();
}

startParentMenu();
