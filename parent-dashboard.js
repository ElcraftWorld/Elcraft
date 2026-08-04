import { supabase } from "./supabase-client.js";

const KEYS = Object.freeze({
  childId:
    "elcraft_selected_child_id",

  childName:
    "elcraft_child_name",

  childAvatar:
    "elcraft_child_avatar",

  approvalRequests:
    "elcraft_clubhouse_art_requests_v1",

  approvedArtwork:
    "elcraft_clubhouse_art_approved_v1"
});

const state = {
  user:
    null,

  players:
    [],

  selectedPlayer:
    null,

  family:
    [],

  activity:
    [],

  selectedNewAvatar:
    "🌟"
};

const elements = {
  parentGreeting:
    document.getElementById(
      "parentGreeting"
    ),

  parentMenuButton:
    document.getElementById(
      "parentMenuButton"
    ),

  parentMenu:
    document.getElementById(
      "parentMenu"
    ),

  parentMenuName:
    document.getElementById(
      "parentMenuName"
    ),

  parentMenuEmail:
    document.getElementById(
      "parentMenuEmail"
    ),

  footerEmail:
    document.getElementById(
      "footerEmail"
    ),

  syncBadge:
    document.getElementById(
      "syncBadge"
    ),

  playerGrid:
    document.getElementById(
      "playerGrid"
    ),

  quickReturnName:
    document.getElementById(
      "quickReturnName"
    ),

  quickReturnButton:
    document.getElementById(
      "quickReturnButton"
    ),

  quickReturnDetail:
    document.getElementById(
      "quickReturnDetail"
    ),

  progressList:
    document.getElementById(
      "progressList"
    ),

  familyList:
    document.getElementById(
      "familyList"
    ),

  activityList:
    document.getElementById(
      "activityList"
    ),

  approvalList:
    document.getElementById(
      "approvalList"
    ),

  approvalCountBadge:
    document.getElementById(
      "approvalCountBadge"
    ),

  approvalToolCount:
    document.getElementById(
      "approvalToolCount"
    ),

  tipText:
    document.getElementById(
      "tipText"
    ),

  pageMessage:
    document.getElementById(
      "pageMessage"
    ),

  addChildModal:
    document.getElementById(
      "addChildModal"
    ),

  addChildForm:
    document.getElementById(
      "addChildForm"
    ),

  newChildName:
    document.getElementById(
      "newChildName"
    ),

  addChildError:
    document.getElementById(
      "addChildError"
    ),

  saveChildButton:
    document.getElementById(
      "saveChildButton"
    ),

  manageChildModal:
    document.getElementById(
      "manageChildModal"
    ),

  manageChildForm:
    document.getElementById(
      "manageChildForm"
    ),

  manageChildName:
    document.getElementById(
      "manageChildName"
    ),

  manageChildError:
    document.getElementById(
      "manageChildError"
    ),

  saveManagedChildButton:
    document.getElementById(
      "saveManagedChildButton"
    )
};

function firstNameFromUser(
  user
) {
  const metadataName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name;

  const source =
    metadataName ||
    String(
      user?.email ||
      ""
    ).split("@")[0];

  const clean =
    String(source)
      .replace(/[._-]+/g, " ")
      .trim()
      .split(/\s+/)[0];

  if (
    !clean
  ) {
    return "Parent";
  }

  return (
    clean.charAt(0).toUpperCase() +
    clean.slice(1)
  );
}

function showMessage(
  message,
  {
    error =
      false
  } = {}
) {
  elements.pageMessage.textContent =
    message;

  elements.pageMessage.className =
    `page-message show${
      error
        ? " error"
        : ""
    }`;

  window.clearTimeout(
    window.__elcraftParentMessage
  );

  window.__elcraftParentMessage =
    window.setTimeout(
      () => {
        elements.pageMessage.className =
          "page-message";
      },
      3200
    );
}

function readArray(
  key
) {
  try {
    const value =
      JSON.parse(
        localStorage.getItem(
          key
        ) ||
        "[]"
      );

    return Array.isArray(value)
      ? value
      : [];
  } catch {
    return [];
  }
}

function writeArray(
  key,
  value
) {
  localStorage.setItem(
    key,
    JSON.stringify(value)
  );
}

function selectPlayer(
  player,
  {
    render =
      true
  } = {}
) {
  state.selectedPlayer =
    player;

  localStorage.setItem(
    KEYS.childId,
    player.id
  );

  localStorage.setItem(
    KEYS.childName,
    player.display_name ||
      "Player"
  );

  localStorage.setItem(
    KEYS.childAvatar,
    player.avatar ||
      "🌟"
  );

  if (
    render
  ) {
    renderPlayers();
    renderQuickReturn();
    renderTips();
  }
}

function selectedPlayerFromStorage() {
  const storedId =
    localStorage.getItem(
      KEYS.childId
    );

  return (
    state.players.find(
      player =>
        player.id ===
        storedId
    ) ||
    null
  );
}

async function queryWithTimeout(
  promise,
  milliseconds =
    9000
) {
  let timeoutId;

  const timeout =
    new Promise(
      (
        _resolve,
        reject
      ) => {
        timeoutId =
          window.setTimeout(
            () => {
              reject(
                new Error(
                  "The request took too long."
                )
              );
            },
            milliseconds
          );
      }
    );

  try {
    return await Promise.race([
      promise,
      timeout
    ]);
  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
}

async function loadAuthenticatedUser() {
  const {
    data,
    error
  } =
    await queryWithTimeout(
      supabase.auth.getSession(),
      8000
    );

  if (
    error
  ) {
    throw error;
  }

  const user =
    data?.session?.user;

  if (
    !user
  ) {
    window.location.replace(
      "auth.html"
    );

    throw new Error(
      "No signed-in parent session."
    );
  }

  state.user =
    user;

  const parentName =
    firstNameFromUser(user);

  elements.parentGreeting.textContent =
    `Hi, ${parentName}`;

  elements.parentMenuName.textContent =
    parentName;

  elements.parentMenuEmail.textContent =
    user.email ||
    "Parent account";

  elements.footerEmail.textContent =
    user.email ||
    "Parent account";
}

async function loadPlayers() {
  elements.syncBadge.textContent =
    "Syncing players…";

  elements.syncBadge.className =
    "status-badge syncing";

  let result =
    await queryWithTimeout(
      supabase
        .from(
          "child_profiles"
        )
        .select(
          "id,parent_id,display_name,avatar,stars,experience,level,created_at"
        )
        .eq(
          "parent_id",
          state.user.id
        )
        .order(
          "created_at",
          {
            ascending:
              true
          }
        ),
      9000
    );

  if (
    result.error ||
    !result.data?.length
  ) {
    /*
      This fallback is intentionally unfiltered. Supabase RLS still decides
      which child rows this signed-in parent may see.
    */
    const fallback =
      await queryWithTimeout(
        supabase
          .from(
            "child_profiles"
          )
          .select(
            "id,parent_id,display_name,avatar,stars,experience,level,created_at"
          )
          .order(
            "created_at",
            {
              ascending:
                true
            }
          ),
        9000
      );

    if (
      !fallback.error &&
      fallback.data?.length
    ) {
      result =
        fallback;
    }
  }

  if (
    result.error
  ) {
    throw result.error;
  }

  state.players =
    result.data ||
    [];

  state.selectedPlayer =
    selectedPlayerFromStorage() ||
    state.players[0] ||
    null;

  if (
    state.selectedPlayer
  ) {
    selectPlayer(
      state.selectedPlayer,
      {
        render:
          false
      }
    );
  }

  elements.syncBadge.textContent =
    `${state.players.length} player${
      state.players.length === 1
        ? ""
        : "s"
    } connected`;

  elements.syncBadge.className =
    "status-badge";
}

async function safeLoadFamily() {
  try {
    const result =
      await queryWithTimeout(
        supabase
          .from(
            "family_members"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                true
            }
          ),
        6500
      );

    if (
      !result.error
    ) {
      state.family =
        result.data ||
        [];
    }
  } catch (
    error
  ) {
    console.warn(
      "Optional family member load failed:",
      error
    );
  }
}

async function safeLoadActivity() {
  try {
    const result =
      await queryWithTimeout(
        supabase
          .from(
            "family_activity"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false
            }
          )
          .limit(6),
        6500
      );

    if (
      !result.error
    ) {
      state.activity =
        result.data ||
        [];
    }
  } catch (
    error
  ) {
    console.warn(
      "Optional activity load failed:",
      error
    );
  }
}

function renderPlayers() {
  elements.playerGrid.replaceChildren();

  state.players.forEach(
    player => {
      const card =
        document.createElement(
          "article"
        );

      const selected =
        state.selectedPlayer?.id ===
        player.id;

      card.className =
        `player-card${
          selected
            ? " selected"
            : ""
        }`;

      card.innerHTML = `
        <div class="player-avatar">
          ${player.avatar || "🌟"}
        </div>

        <h3>
          ${escapeHtml(
            player.display_name ||
            "Player"
          )}
        </h3>

        <div class="player-stats">
          Level ${Number(player.level || 1)}
          &nbsp;•&nbsp;
          ${Number(player.experience || 0)} XP
        </div>

        <button
          class="player-select-button"
          type="button">
          ${
            selected
              ? "⭐ Active Player"
              : "Play This Player"
          }
        </button>
      `;

      card
        .querySelector(
          ".player-select-button"
        )
        .addEventListener(
          "click",
          () => {
            selectPlayer(player);
          }
        );

      elements.playerGrid.appendChild(
        card
      );
    }
  );

  const addCard =
    document.createElement(
      "article"
    );

  addCard.className =
    "player-card add-player-card";

  addCard.innerHTML = `
    <div class="add-player-symbol">
      +
    </div>

    <h3>Add Child</h3>

    <div class="player-stats">
      Create a separate player and world
    </div>

    <button type="button">
      Create Player
    </button>
  `;

  addCard
    .querySelector(
      "button"
    )
    .addEventListener(
      "click",
      openAddChildModal
    );

  elements.playerGrid.appendChild(
    addCard
  );
}

function renderQuickReturn() {
  const player =
    state.selectedPlayer;

  if (
    !player
  ) {
    elements.quickReturnName.textContent =
      "No player selected";

    elements.quickReturnDetail.textContent =
      "Choose or add a player";

    elements.quickReturnButton.disabled =
      true;

    return;
  }

  elements.quickReturnName.textContent =
    `${player.display_name || "Player"} ${
      player.avatar || "🌟"
    }`;

  elements.quickReturnDetail.textContent =
    "Player world ready";

  elements.quickReturnButton.disabled =
    false;
}

function renderProgress() {
  elements.progressList.replaceChildren();

  if (
    !state.players.length
  ) {
    elements.progressList.innerHTML = `
      <div class="empty-state">
        Add a child to begin tracking progress.
      </div>
    `;

    return;
  }

  state.players.forEach(
    player => {
      const xp =
        Number(
          player.experience ||
          0
        );

      const level =
        Number(
          player.level ||
          1
        );

      const target =
        Math.max(
          100,
          level * 100
        );

      const percent =
        Math.min(
          100,
          Math.round(
            (
              xp %
              target
            ) /
            target *
            100
          )
        );

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "progress-row";

      row.innerHTML = `
        <div class="progress-head">

          <div class="progress-avatar">
            ${player.avatar || "🌟"}
          </div>

          <div class="progress-copy">

            <strong>
              ${escapeHtml(
                player.display_name ||
                "Player"
              )}
            </strong>

            <small>
              Level ${level}
              · ${xp} XP
              · ${Number(player.stars || 0)} stars
            </small>

          </div>

        </div>

        <div class="progress-bar">
          <span style="width:${percent}%"></span>
        </div>
      `;

      elements.progressList.appendChild(
        row
      );
    }
  );
}

function renderFamily() {
  elements.familyList.replaceChildren();

  const parentName =
    firstNameFromUser(
      state.user
    );

  const parentRow =
    document.createElement(
      "div"
    );

  parentRow.className =
    "family-row";

  parentRow.innerHTML = `
    <div class="family-avatar">
      👑
    </div>

    <div class="family-copy">
      <strong>
        ${escapeHtml(parentName)}
      </strong>

      <small>
        Parent · Account owner
      </small>
    </div>
  `;

  elements.familyList.appendChild(
    parentRow
  );

  state.players.forEach(
    player => {
      const row =
        document.createElement(
          "div"
        );

      row.className =
        "family-row";

      row.innerHTML = `
        <div class="family-avatar">
          ${player.avatar || "🌟"}
        </div>

        <div class="family-copy">
          <strong>
            ${escapeHtml(
              player.display_name ||
              "Player"
            )}
          </strong>

          <small>
            Child player
          </small>
        </div>
      `;

      elements.familyList.appendChild(
        row
      );
    }
  );

  state.family
    .filter(
      member =>
        member.user_id !==
        state.user.id
    )
    .slice(0, 4)
    .forEach(
      member => {
        const row =
          document.createElement(
            "div"
          );

        row.className =
          "family-row";

        row.innerHTML = `
          <div class="family-avatar">
            👨‍👩‍👧
          </div>

          <div class="family-copy">
            <strong>
              ${escapeHtml(
                member.display_name ||
                member.relationship ||
                "Family Member"
              )}
            </strong>

            <small>
              ${escapeHtml(
                member.relationship ||
                "Family member"
              )}
            </small>
          </div>
        `;

        elements.familyList.appendChild(
          row
        );
      }
    );
}

function renderActivity() {
  elements.activityList.replaceChildren();

  if (
    state.activity.length
  ) {
    state.activity
      .slice(0, 4)
      .forEach(
        activity => {
          const row =
            document.createElement(
              "div"
            );

          row.className =
            "activity-row";

          row.innerHTML = `
            <div class="activity-avatar">
              ✨
            </div>

            <div class="activity-copy">
              <strong>
                ${escapeHtml(
                  activity.title ||
                  activity.message ||
                  activity.activity_type ||
                  "Family activity"
                )}
              </strong>

              <small>
                ${formatDate(
                  activity.created_at
                )}
              </small>
            </div>
          `;

          elements.activityList.appendChild(
            row
          );
        }
      );

    return;
  }

  if (
    state.players.length
  ) {
    state.players
      .slice(0, 3)
      .forEach(
        player => {
          const row =
            document.createElement(
              "div"
            );

          row.className =
            "activity-row";

          row.innerHTML = `
            <div class="activity-avatar">
              ${player.avatar || "🌟"}
            </div>

            <div class="activity-copy">
              <strong>
                ${escapeHtml(
                  player.display_name ||
                  "Player"
                )} is connected
              </strong>

              <small>
                Ready to enter their ELCraft home
              </small>
            </div>
          `;

          elements.activityList.appendChild(
            row
          );
        }
      );

    return;
  }

  elements.activityList.innerHTML = `
    <div class="empty-state">
      Activity will appear after a player begins exploring.
    </div>
  `;
}

function pendingApprovals() {
  return readArray(
    KEYS.approvalRequests
  ).filter(
    request =>
      request.status ===
      "pending"
  );
}

function updateGalleryStatus(
  artworkId,
  status,
  childId
) {
  const keys = [
    "elcraft_art_gallery_v2",
    "elcraft_art_gallery_v1"
  ];

  keys.forEach(
    galleryKey => {
      const scopedKey =
        childId
          ? `elcraft_player:${childId}:${galleryKey}`
          : galleryKey;

      const gallery =
        readArray(scopedKey);

      let changed =
        false;

      gallery.forEach(
        artwork => {
          if (
            artwork.id ===
            artworkId
          ) {
            artwork.clubhouseStatus =
              status;

            changed =
              true;
          }
        }
      );

      if (
        changed
      ) {
        writeArray(
          scopedKey,
          gallery
        );
      }
    }
  );
}

function renderApprovals() {
  const pending =
    pendingApprovals();

  elements.approvalCountBadge.textContent =
    String(pending.length);

  elements.approvalToolCount.textContent =
    String(pending.length);

  elements.approvalList.replaceChildren();

  if (
    !pending.length
  ) {
    elements.approvalList.innerHTML = `
      <div class="empty-state">
        ✅ No artwork is waiting for approval.
      </div>
    `;

    return;
  }

  pending
    .slice(0, 4)
    .forEach(
      request => {
        const row =
          document.createElement(
            "div"
          );

        row.className =
          "approval-row";

        row.innerHTML = `
          <img
            src="${request.image || ""}"
            alt="Artwork preview">

          <div class="approval-copy">
            <strong>
              ${escapeHtml(
                request.title ||
                "Untitled Artwork"
              )}
            </strong>

            <small>
              by ${escapeHtml(
                request.artistName ||
                "ELCraft Artist"
              )}
            </small>
          </div>

          <div class="approval-actions">

            <button
              class="approve-button"
              type="button"
              aria-label="Approve">
              ✓
            </button>

            <button
              class="deny-button"
              type="button"
              aria-label="Do not approve">
              ×
            </button>

          </div>
        `;

        row
          .querySelector(
            ".approve-button"
          )
          .addEventListener(
            "click",
            () => {
              reviewArtwork(
                request.id,
                "approved"
              );
            }
          );

        row
          .querySelector(
            ".deny-button"
          )
          .addEventListener(
            "click",
            () => {
              reviewArtwork(
                request.id,
                "denied"
              );
            }
          );

        elements.approvalList.appendChild(
          row
        );
      }
    );
}

function reviewArtwork(
  requestId,
  status
) {
  const requests =
    readArray(
      KEYS.approvalRequests
    );

  const request =
    requests.find(
      item =>
        item.id ===
        requestId
    );

  if (
    !request
  ) {
    return;
  }

  request.status =
    status;

  request.reviewedAt =
    new Date().toISOString();

  writeArray(
    KEYS.approvalRequests,
    requests
  );

  if (
    status ===
    "approved"
  ) {
    const approved =
      readArray(
        KEYS.approvedArtwork
      );

    const record = {
      ...request,
      id:
        request.artworkId ||
        request.id,

      approvedAt:
        request.reviewedAt
    };

    const next =
      approved.filter(
        item =>
          (
            item.id ||
            item.artworkId
          ) !==
          record.id
      );

    next.unshift(record);

    writeArray(
      KEYS.approvedArtwork,
      next.slice(0, 50)
    );
  }

  updateGalleryStatus(
    request.artworkId,
    status,
    request.childId
  );

  renderApprovals();

  showMessage(
    status ===
      "approved"
        ? "Artwork approved for the Clubhouse."
        : "Artwork was not posted."
  );
}

function renderTips() {
  if (
    state.selectedPlayer
  ) {
    elements.tipText.textContent =
      `Encourage creativity! Visit the Art Studio with ${
        state.selectedPlayer.display_name ||
        "your child"
      } and create something amazing.`;

    return;
  }

  elements.tipText.textContent =
    "Choose a player above to review their world and progress.";
}

function renderAll() {
  renderPlayers();
  renderQuickReturn();
  renderProgress();
  renderFamily();
  renderActivity();
  renderApprovals();
  renderTips();
}

function openSelectedHome() {
  if (
    !state.selectedPlayer
  ) {
    showMessage(
      "Choose a player first.",
      {
        error:
          true
      }
    );

    return;
  }

  selectPlayer(
    state.selectedPlayer,
    {
      render:
        false
    }
  );

  window.location.href =
    "index.html";
}

function openSelectedProgress() {
  if (
    !state.selectedPlayer
  ) {
    showMessage(
      "Choose a player first.",
      {
        error:
          true
      }
    );

    return;
  }

  selectPlayer(
    state.selectedPlayer,
    {
      render:
        false
    }
  );

  window.location.href =
    "progress.html";
}

function openAddChildModal() {
  state.selectedNewAvatar =
    "🌟";

  elements.newChildName.value =
    "";

  elements.addChildError.textContent =
    "";

  document
    .querySelectorAll(
      ".avatar-option"
    )
    .forEach(
      button => {
        button.classList.toggle(
          "selected",
          button.dataset.avatar ===
          state.selectedNewAvatar
        );
      }
    );

  elements.addChildModal.hidden =
    false;

  window.setTimeout(
    () => {
      elements.newChildName.focus();
    },
    80
  );
}

function closeAddChildModal() {
  elements.addChildModal.hidden =
    true;
}

function openManageChildModal() {
  if (
    !state.selectedPlayer
  ) {
    showMessage(
      "Choose a player first.",
      {
        error:
          true
      }
    );

    return;
  }

  elements.manageChildName.value =
    state.selectedPlayer.display_name ||
    "";

  elements.manageChildError.textContent =
    "";

  elements.manageChildModal.hidden =
    false;

  window.setTimeout(
    () => {
      elements.manageChildName.focus();
      elements.manageChildName.select();
    },
    80
  );
}

function closeManageChildModal() {
  elements.manageChildModal.hidden =
    true;
}

async function createChild(
  event
) {
  event.preventDefault();

  const displayName =
    String(
      elements.newChildName.value ||
      ""
    )
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 20);

  if (
    !displayName
  ) {
    elements.addChildError.textContent =
      "Please enter the child’s first name.";

    return;
  }

  elements.saveChildButton.disabled =
    true;

  elements.saveChildButton.textContent =
    "Creating…";

  try {
    const {
      data,
      error
    } =
      await queryWithTimeout(
        supabase
          .from(
            "child_profiles"
          )
          .insert({
            parent_id:
              state.user.id,

            display_name:
              displayName,

            avatar:
              state.selectedNewAvatar
          })
          .select(
            "id,parent_id,display_name,avatar,stars,experience,level,created_at"
          )
          .single(),
        9000
      );

    if (
      error
    ) {
      throw error;
    }

    state.players.push(data);
    selectPlayer(data, {
      render:
        false
    });

    closeAddChildModal();
    renderAll();

    showMessage(
      `${displayName} was added with a separate player world.`
    );

  } catch (
    error
  ) {
    console.error(
      "Create child error:",
      error
    );

    elements.addChildError.textContent =
      error?.message ||
      "Unable to create the child profile.";

  } finally {
    elements.saveChildButton.disabled =
      false;

    elements.saveChildButton.textContent =
      "Create Child";
  }
}

async function updateSelectedChild(
  event
) {
  event.preventDefault();

  const displayName =
    String(
      elements.manageChildName.value ||
      ""
    )
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 20);

  if (
    !displayName
  ) {
    elements.manageChildError.textContent =
      "The name cannot be blank.";

    return;
  }

  elements.saveManagedChildButton.disabled =
    true;

  elements.saveManagedChildButton.textContent =
    "Saving…";

  try {
    const {
      error
    } =
      await queryWithTimeout(
        supabase
          .from(
            "child_profiles"
          )
          .update({
            display_name:
              displayName
          })
          .eq(
            "id",
            state.selectedPlayer.id
          ),
        9000
      );

    if (
      error
    ) {
      throw error;
    }

    state.selectedPlayer.display_name =
      displayName;

    localStorage.setItem(
      KEYS.childName,
      displayName
    );

    closeManageChildModal();
    renderAll();

    showMessage(
      "Child profile updated."
    );

  } catch (
    error
  ) {
    console.error(
      "Update child error:",
      error
    );

    elements.manageChildError.textContent =
      error?.message ||
      "Unable to update the child profile.";

  } finally {
    elements.saveManagedChildButton.disabled =
      false;

    elements.saveManagedChildButton.textContent =
      "Save Changes";
  }
}

async function logout() {
  const logoutButtons = [
    document.getElementById(
      "logoutButton"
    ),

    document.getElementById(
      "footerLogoutButton"
    )
  ].filter(Boolean);

  logoutButtons.forEach(
    button => {
      button.disabled =
        true;
    }
  );

  try {
    localStorage.removeItem(
      KEYS.childId
    );

    localStorage.removeItem(
      KEYS.childName
    );

    localStorage.removeItem(
      KEYS.childAvatar
    );

    await supabase.auth.signOut();
  } catch (
    error
  ) {
    console.error(
      "Logout error:",
      error
    );
  }

  window.location.replace(
    "auth.html"
  );
}

function escapeHtml(
  value
) {
  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    String(
      value ??
      ""
    );

  return div.innerHTML;
}

function formatDate(
  value
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.valueOf()
    )
  ) {
    return "Recently";
  }

  return date.toLocaleString();
}

function bindEvents() {
  elements.parentMenuButton.addEventListener(
    "click",
    () => {
      const nextHidden =
        !elements.parentMenu.hidden;

      elements.parentMenu.hidden =
        nextHidden;

      elements.parentMenuButton.setAttribute(
        "aria-expanded",
        String(!nextHidden)
      );
    }
  );

  document.addEventListener(
    "click",
    event => {
      if (
        !elements.parentMenu.hidden &&
        !elements.parentMenu.contains(
          event.target
        ) &&
        !elements.parentMenuButton.contains(
          event.target
        )
      ) {
        elements.parentMenu.hidden =
          true;

        elements.parentMenuButton.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    }
  );

  document
    .getElementById(
      "familyGuideButton"
    )
    .addEventListener(
      "click",
      () => {
        showMessage(
          "The Family Guide will be added during the parent help module."
        );
      }
    );

  document
    .getElementById(
      "manageAccountButton"
    )
    .addEventListener(
      "click",
      () => {
        showMessage(
          "Parent account settings will be added in the account module."
        );
      }
    );

  document
    .getElementById(
      "logoutButton"
    )
    .addEventListener(
      "click",
      logout
    );

  document
    .getElementById(
      "footerLogoutButton"
    )
    .addEventListener(
      "click",
      logout
    );

  document
    .getElementById(
      "quickReturnButton"
    )
    .addEventListener(
      "click",
      openSelectedHome
    );

  document
    .getElementById(
      "viewProgressButton"
    )
    .addEventListener(
      "click",
      openSelectedProgress
    );

  document
    .getElementById(
      "fullProgressButton"
    )
    .addEventListener(
      "click",
      openSelectedProgress
    );

  document
    .getElementById(
      "manageChildButton"
    )
    .addEventListener(
      "click",
      openManageChildModal
    );

  document
    .getElementById(
      "addChildButton"
    )
    .addEventListener(
      "click",
      openAddChildModal
    );

  document
    .getElementById(
      "familyCastleButton"
    )
    .addEventListener(
      "click",
      () => {
        window.location.href =
          "family-castle.html";
      }
    );

  document
    .getElementById(
      "openFamilyCastleButton"
    )
    .addEventListener(
      "click",
      () => {
        window.location.href =
          "family-castle.html";
      }
    );

  document
    .getElementById(
      "clubhouseApprovalsButton"
    )
    .addEventListener(
      "click",
      () => {
        document
          .getElementById(
            "approvalCard"
          )
          .scrollIntoView({
            behavior:
              "smooth",

            block:
              "center"
          });
      }
    );

  document
    .getElementById(
      "reviewAllArtworkButton"
    )
    .addEventListener(
      "click",
      () => {
        document
          .getElementById(
            "approvalCard"
          )
          .scrollIntoView({
            behavior:
              "smooth",

            block:
              "center"
          });
      }
    );

  document
    .getElementById(
      "viewActivityButton"
    )
    .addEventListener(
      "click",
      () => {
        window.location.href =
          "family-feed.html";
      }
    );

  document
    .getElementById(
      "footerAccountButton"
    )
    .addEventListener(
      "click",
      () => {
        elements.parentMenu.hidden =
          false;

        elements.parentMenuButton.setAttribute(
          "aria-expanded",
          "true"
        );

        window.scrollTo({
          top:
            0,

          behavior:
            "smooth"
        });
      }
    );

  document
    .getElementById(
      "helpButton"
    )
    .addEventListener(
      "click",
      () => {
        showMessage(
          "Parent help and support will be connected in a later module."
        );
      }
    );

  document
    .getElementById(
      "closeAddChildButton"
    )
    .addEventListener(
      "click",
      closeAddChildModal
    );

  document
    .getElementById(
      "cancelAddChildButton"
    )
    .addEventListener(
      "click",
      closeAddChildModal
    );

  elements.addChildModal.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        elements.addChildModal
      ) {
        closeAddChildModal();
      }
    }
  );

  document
    .querySelectorAll(
      ".avatar-option"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            state.selectedNewAvatar =
              button.dataset.avatar ||
              "🌟";

            document
              .querySelectorAll(
                ".avatar-option"
              )
              .forEach(
                option => {
                  option.classList.toggle(
                    "selected",
                    option ===
                      button
                  );
                }
              );
          }
        );
      }
    );

  elements.addChildForm.addEventListener(
    "submit",
    createChild
  );

  document
    .getElementById(
      "closeManageChildButton"
    )
    .addEventListener(
      "click",
      closeManageChildModal
    );

  document
    .getElementById(
      "cancelManageChildButton"
    )
    .addEventListener(
      "click",
      closeManageChildModal
    );

  elements.manageChildModal.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        elements.manageChildModal
      ) {
        closeManageChildModal();
      }
    }
  );

  elements.manageChildForm.addEventListener(
    "submit",
    updateSelectedChild
  );

  window.addEventListener(
    "storage",
    event => {
      if (
        event.key ===
          KEYS.approvalRequests ||
        event.key ===
          KEYS.approvedArtwork
      ) {
        renderApprovals();
      }
    }
  );
}

async function initialize() {
  bindEvents();

  try {
    await loadAuthenticatedUser();

    await loadPlayers();

    renderAll();

    elements.syncBadge.textContent =
      `${state.players.length} player${
        state.players.length === 1
          ? ""
          : "s"
      } connected`;

    elements.syncBadge.className =
      "status-badge";

    await Promise.allSettled([
      safeLoadFamily(),
      safeLoadActivity()
    ]);

    renderFamily();
    renderActivity();

  } catch (
    error
  ) {
    console.error(
      "Parent Dashboard initialization error:",
      error
    );

    elements.syncBadge.textContent =
      "Player sync needs attention";

    elements.syncBadge.className =
      "status-badge error";

    elements.playerGrid.innerHTML = `
      <article class="player-card add-player-card">

        <div class="add-player-symbol">
          !
        </div>

        <h3>Unable to load players</h3>

        <div class="player-stats">
          ${escapeHtml(
            error?.message ||
            "Please refresh or check the parent session."
          )}
        </div>

        <button
          id="retryDashboardButton"
          type="button">
          Retry
        </button>

      </article>
    `;

    document
      .getElementById(
        "retryDashboardButton"
      )
      ?.addEventListener(
        "click",
        () => {
          window.location.reload();
        }
      );

    renderApprovals();
  }
}

initialize();
