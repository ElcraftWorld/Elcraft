/*
  Parent Dashboard — Clubhouse Artwork Approvals
  Local-device Phase 2 implementation.
*/

const REQUESTS_KEY =
  "elcraft_clubhouse_art_requests_v1";

const APPROVED_KEY =
  "elcraft_clubhouse_art_approved_v1";

const GALLERY_KEYS = [
  "elcraft_art_gallery_v2",
  "elcraft_art_gallery_v1"
];

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

    return Array.isArray(
      value
    )
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
    JSON.stringify(
      value
    )
  );
}

function updateGalleryStatus(
  artworkId,
  status
) {
  for (
    const key of
    GALLERY_KEYS
  ) {
    const gallery =
      readArray(
        key
      );

    if (
      !gallery.length
    ) {
      continue;
    }

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
        key,
        gallery
      );
    }
  }
}

function injectStyles() {
  const style =
    document.createElement(
      "style"
    );

  style.textContent = `
    .elcraft-art-approval-card {
      margin-top: 22px;
      border: 4px solid rgba(255,255,255,.92);
      border-radius: 27px;
      padding: 20px;
      background: rgba(255,255,255,.97);
      box-shadow: 0 18px 46px rgba(48,42,112,.2);
    }

    .elcraft-art-approval-card * {
      box-sizing: border-box;
    }

    .elcraft-art-approval-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .elcraft-art-approval-title h3 {
      margin: 0;
      color: #554ecb;
      font-size: clamp(22px,4vw,31px);
    }

    .elcraft-art-count {
      border-radius: 999px;
      padding: 7px 11px;
      color: white;
      background: #7758df;
      font-size: 11px;
      font-weight: 1000;
    }

    .elcraft-art-request-list {
      display: grid;
      gap: 12px;
    }

    .elcraft-art-request {
      display: grid;
      grid-template-columns: 120px minmax(0,1fr);
      gap: 14px;
      align-items: center;
      border: 3px solid #e7e0f6;
      border-radius: 19px;
      padding: 12px;
      background: #fbf9ff;
    }

    .elcraft-art-request img {
      width: 120px;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      border-radius: 13px;
      background: #eee9f6;
    }

    .elcraft-art-request h4 {
      margin: 0 0 5px;
      color: #4e3ca6;
      font-size: 17px;
    }

    .elcraft-art-request p {
      margin: 0;
      color: #747a98;
      font-size: 11px;
      font-weight: 800;
    }

    .elcraft-art-request-actions {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }

    .elcraft-art-request-actions button {
      flex: 1;
      border: 0;
      border-radius: 13px;
      padding: 10px;
      color: white;
      font-weight: 1000;
      cursor: pointer;
    }

    .elcraft-art-approve {
      background: #55ad3c;
    }

    .elcraft-art-deny {
      background: #d75e72;
    }

    .elcraft-art-empty {
      border: 3px dashed #d9cfed;
      border-radius: 17px;
      padding: 20px;
      color: #79708f;
      background: #fbfaff;
      text-align: center;
      font-weight: 900;
    }

    @media (max-width: 620px) {
      .elcraft-art-request {
        grid-template-columns: 1fr;
      }

      .elcraft-art-request img {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(
    style
  );
}

function findDashboardMount() {
  return (
    document.querySelector(
      ".page"
    ) ||
    document.querySelector(
      "main"
    ) ||
    document.body
  );
}

function createSection() {
  const section =
    document.createElement(
      "section"
    );

  section.id =
    "elcraftArtworkApprovals";

  section.className =
    "elcraft-art-approval-card";

  section.innerHTML = `
    <div class="elcraft-art-approval-title">
      <div>
        <h3>🎨 Clubhouse Art Approvals</h3>
        <div style="margin-top:4px;color:#747a98;font-size:11px;font-weight:900;">
          Approve artwork before it appears in the child Clubhouse.
        </div>
      </div>

      <div
        id="elcraftArtworkApprovalCount"
        class="elcraft-art-count">
        0 pending
      </div>
    </div>

    <div
      id="elcraftArtworkApprovalList"
      class="elcraft-art-request-list">
    </div>
  `;

  findDashboardMount()
    .appendChild(
      section
    );

  return section;
}

function render() {
  const requests =
    readArray(
      REQUESTS_KEY
    );

  const pending =
    requests.filter(
      request =>
        request.status ===
        "pending"
    );

  const count =
    document.getElementById(
      "elcraftArtworkApprovalCount"
    );

  const list =
    document.getElementById(
      "elcraftArtworkApprovalList"
    );

  if (
    !count ||
    !list
  ) {
    return;
  }

  count.textContent =
    `${pending.length} pending`;

  list.replaceChildren();

  if (
    !pending.length
  ) {
    list.innerHTML = `
      <div class="elcraft-art-empty">
        ✅ No artwork is waiting for approval.
      </div>
    `;

    return;
  }

  pending.forEach(
    request => {
      const card =
        document.createElement(
          "article"
        );

      card.className =
        "elcraft-art-request";

      const requestedAt =
        request.requestedAt
          ? new Date(
              request.requestedAt
            )
          : null;

      card.innerHTML = `
        <img
          src="${request.image}"
          alt="${request.title || "Artwork awaiting approval"}">

        <div>
          <h4>
            ${request.title || "Untitled Artwork"}
          </h4>

          <p>
            Artist:
            ${request.artistName || "Child"}
          </p>

          <p>
            ${
              requestedAt &&
              !Number.isNaN(
                requestedAt.valueOf()
              )
                ? requestedAt.toLocaleString()
                : "Recently submitted"
            }
          </p>

          <div class="elcraft-art-request-actions">
            <button
              class="elcraft-art-approve"
              type="button">
              Approve
            </button>

            <button
              class="elcraft-art-deny"
              type="button">
              Do Not Post
            </button>
          </div>
        </div>
      `;

      card
        .querySelector(
          ".elcraft-art-approve"
        )
        .addEventListener(
          "click",
          () => {
            approveRequest(
              request.id
            );
          }
        );

      card
        .querySelector(
          ".elcraft-art-deny"
        )
        .addEventListener(
          "click",
          () => {
            denyRequest(
              request.id
            );
          }
        );

      list.appendChild(
        card
      );
    }
  );
}

function approveRequest(
  requestId
) {
  const requests =
    readArray(
      REQUESTS_KEY
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
    "approved";

  request.reviewedAt =
    new Date()
      .toISOString();

  writeArray(
    REQUESTS_KEY,
    requests
  );

  const approved =
    readArray(
      APPROVED_KEY
    );

  const record = {
    ...request,

    id:
      request.artworkId ||
      request.id,

    approvedAt:
      request.reviewedAt
  };

  const filtered =
    approved.filter(
      item =>
        (
          item.id ||
          item.artworkId
        ) !==
        record.id
    );

  filtered.unshift(
    record
  );

  writeArray(
    APPROVED_KEY,
    filtered.slice(
      0,
      50
    )
  );

  updateGalleryStatus(
    request.artworkId,
    "approved"
  );

  render();
}

function denyRequest(
  requestId
) {
  const requests =
    readArray(
      REQUESTS_KEY
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
    "denied";

  request.reviewedAt =
    new Date()
      .toISOString();

  writeArray(
    REQUESTS_KEY,
    requests
  );

  updateGalleryStatus(
    request.artworkId,
    "denied"
  );

  render();
}

function initialize() {
  injectStyles();

  if (
    !document.getElementById(
      "elcraftArtworkApprovals"
    )
  ) {
    createSection();
  }

  render();

  window.addEventListener(
    "storage",
    event => {
      if (
        event.key ===
        REQUESTS_KEY
      ) {
        render();
      }
    }
  );
}

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initialize,
    {
      once: true
    }
  );
} else {
  initialize();
}
