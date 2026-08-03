/*
  ELCraft Clubhouse — Parent-approved Art Wall
*/

const APPROVED_KEY =
  "elcraft_clubhouse_art_approved_v1";

function readApproved() {
  try {
    const data =
      JSON.parse(
        localStorage.getItem(
          APPROVED_KEY
        ) ||
        "[]"
      );

    return Array.isArray(
      data
    )
      ? data
      : [];
  } catch {
    return [];
  }
}

function injectStyles() {
  const style =
    document.createElement(
      "style"
    );

  style.textContent = `
    #elcraftClubhouseArtButton {
      position: fixed;
      left: 18px;
      bottom: 18px;
      z-index: 99990;

      min-height: 54px;
      border: 5px solid white;
      border-radius: 18px;
      padding: 10px 14px;

      color: white;
      background:
        linear-gradient(
          145deg,
          #ff7caf,
          #7758df
        );

      box-shadow:
        0 9px 0 rgba(82,54,148,.2),
        0 16px 30px rgba(45,28,89,.28);

      font-size: 12px;
      font-weight: 1000;
      cursor: pointer;
    }

    #elcraftClubhouseArtModal {
      position: fixed;
      inset: 0;
      z-index: 100000;

      display: none;
      align-items: center;
      justify-content: center;

      padding: 16px;

      background: rgba(24,13,45,.72);
      backdrop-filter: blur(8px);
    }

    #elcraftClubhouseArtModal.visible {
      display: flex;
    }

    .elcraft-clubhouse-art-panel {
      width: min(980px,100%);
      max-height: 90vh;
      overflow: auto;

      border: 6px solid white;
      border-radius: 28px;
      padding: 17px;

      background:
        linear-gradient(
          145deg,
          #f8efff,
          #fff9e9
        );

      box-shadow:
        0 30px 72px rgba(19,10,38,.45);
    }

    .elcraft-clubhouse-art-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .elcraft-clubhouse-art-head h2 {
      margin: 0;
      color: #4e3ca6;
    }

    .elcraft-clubhouse-art-close {
      width: 44px;
      height: 44px;
      border: 0;
      border-radius: 50%;
      color: white;
      background: #7758df;
      font-size: 22px;
      font-weight: 1000;
      cursor: pointer;
    }

    .elcraft-clubhouse-art-grid {
      display: grid;
      grid-template-columns:
        repeat(
          auto-fill,
          minmax(190px,1fr)
        );
      gap: 13px;
    }

    .elcraft-clubhouse-art-card {
      border: 4px solid white;
      border-radius: 18px;
      padding: 9px;
      background: white;
      box-shadow: 0 12px 25px rgba(74,55,101,.16);
    }

    .elcraft-clubhouse-art-card img {
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      border-radius: 12px;
      background: #eee9f5;
    }

    .elcraft-clubhouse-art-card h3 {
      margin: 8px 0 3px;
      color: #4e3ca6;
      font-size: 15px;
    }

    .elcraft-clubhouse-art-card p {
      margin: 0;
      color: #747a98;
      font-size: 9px;
      font-weight: 900;
    }

    .elcraft-clubhouse-art-empty {
      grid-column: 1 / -1;
      border: 4px dashed #d9cdec;
      border-radius: 20px;
      padding: 30px;
      color: #76668e;
      background: white;
      text-align: center;
      font-weight: 1000;
    }

    @media (max-width: 700px) {
      #elcraftClubhouseArtButton {
        left: 10px;
        bottom: 10px;
      }
    }
  `;

  document.head.appendChild(
    style
  );
}

function createUI() {
  const button =
    document.createElement(
      "button"
    );

  button.id =
    "elcraftClubhouseArtButton";

  button.type =
    "button";

  button.textContent =
    "🎨 Art Wall";

  const modal =
    document.createElement(
      "section"
    );

  modal.id =
    "elcraftClubhouseArtModal";

  modal.innerHTML = `
    <div class="elcraft-clubhouse-art-panel">

      <div class="elcraft-clubhouse-art-head">
        <div>
          <h2>🎨 Clubhouse Art Wall</h2>

          <div style="margin-top:3px;color:#756b8d;font-size:10px;font-weight:900;">
            Parent-approved artwork only
          </div>
        </div>

        <button
          class="elcraft-clubhouse-art-close"
          type="button">
          ×
        </button>
      </div>

      <div
        id="elcraftClubhouseArtGrid"
        class="elcraft-clubhouse-art-grid">
      </div>
    </div>
  `;

  document.body.append(
    button,
    modal
  );

  button.addEventListener(
    "click",
    () => {
      render();
      modal.classList.add(
        "visible"
      );
    }
  );

  modal
    .querySelector(
      ".elcraft-clubhouse-art-close"
    )
    .addEventListener(
      "click",
      () => {
        modal.classList.remove(
          "visible"
        );
      }
    );

  modal.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        modal
      ) {
        modal.classList.remove(
          "visible"
        );
      }
    }
  );
}

function render() {
  const grid =
    document.getElementById(
      "elcraftClubhouseArtGrid"
    );

  if (
    !grid
  ) {
    return;
  }

  const approved =
    readApproved();

  grid.replaceChildren();

  if (
    !approved.length
  ) {
    grid.innerHTML = `
      <div class="elcraft-clubhouse-art-empty">
        🏠 No artwork has been approved for the Clubhouse yet.
      </div>
    `;

    return;
  }

  approved.forEach(
    artwork => {
      const card =
        document.createElement(
          "article"
        );

      card.className =
        "elcraft-clubhouse-art-card";

      card.innerHTML = `
        <img
          src="${artwork.image}"
          alt="${artwork.title || "Clubhouse artwork"}">

        <h3>
          ${artwork.title || "Clubhouse Artwork"}
        </h3>

        <p>
          By
          ${artwork.artistName || "ELCraft Artist"}
        </p>
      `;

      grid.appendChild(
        card
      );
    }
  );
}

function initialize() {
  injectStyles();
  createUI();

  window.addEventListener(
    "storage",
    event => {
      if (
        event.key ===
        APPROVED_KEY
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
