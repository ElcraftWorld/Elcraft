/* ============================================================
   ELCRAFT UI HELPERS
   File: elcraft-ui.js
   ============================================================ */

const SOUND_KEY = "elcraft_sound_enabled";

export const ELCraftUI = {
  soundEnabled:
    localStorage.getItem(SOUND_KEY) !== "false",

  showToast(
    message,
    {
      duration = 2200,
      id = "elcraftToast"
    } = {}
  ) {
    let toast =
      document.getElementById(id);

    if (!toast) {
      toast =
        document.createElement("div");

      toast.id =
        id;

      toast.className =
        "el-toast";

      toast.setAttribute(
        "role",
        "status"
      );

      toast.setAttribute(
        "aria-live",
        "polite"
      );

      document.body.appendChild(
        toast
      );
    }

    toast.textContent =
      message;

    toast.classList.add(
      "show"
    );

    window.clearTimeout(
      toast._timer
    );

    toast._timer =
      window.setTimeout(
        () => {
          toast.classList.remove(
            "show"
          );
        },
        duration
      );
  },

  setProgress(
    element,
    percent
  ) {
    const value =
      Math.max(
        0,
        Math.min(
          100,
          Number(percent) || 0
        )
      );

    element.style.setProperty(
      "--progress",
      `${value}%`
    );

    element.setAttribute(
      "aria-valuenow",
      String(value)
    );
  },

  createMascot({
    name = "Milo",
    tool = "🛠️"
  } = {}) {
    const mascot =
      document.createElement("div");

    mascot.className =
      "el-mascot";

    mascot.setAttribute(
      "role",
      "img"
    );

    mascot.setAttribute(
      "aria-label",
      `${name}, the ELCraft mascot`
    );

    mascot.innerHTML = `
      <div class="el-mascot-tail"></div>
      <div class="el-mascot-backpack"></div>
      <div class="el-mascot-tool">${tool}</div>

      <div class="el-mascot-body">
        <div class="el-mascot-belly"></div>
      </div>

      <div class="el-mascot-ear el-mascot-ear--left"></div>
      <div class="el-mascot-ear el-mascot-ear--right"></div>

      <div class="el-mascot-head">
        <div class="el-mascot-eye el-mascot-eye--left"></div>
        <div class="el-mascot-eye el-mascot-eye--right"></div>
        <div class="el-mascot-nose"></div>
        <div class="el-mascot-smile"></div>
        <div class="el-mascot-tooth"></div>
      </div>

      <div class="el-mascot-name">
        ${this.escapeHtml(name)}
      </div>
    `;

    return mascot;
  },

  installMascot(
    selector,
    options = {}
  ) {
    const target =
      document.querySelector(
        selector
      );

    if (!target) {
      return null;
    }

    const mascot =
      this.createMascot(
        options
      );

    target.replaceChildren(
      mascot
    );

    return mascot;
  },

  makeDestinationCardsInteractive() {
    document
      .querySelectorAll(
        "[data-elcraft-page]"
      )
      .forEach(card => {
        const page =
          card.dataset.elcraftPage;

        card.addEventListener(
          "click",
          () => {
            if (page) {
              window.location.href =
                page;
            }
          }
        );

        card.addEventListener(
          "keydown",
          event => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();

              if (page) {
                window.location.href =
                  page;
              }
            }
          }
        );
      });
  },

  personalize({
    nameKey =
      "elcraft_child_name",

    fallback =
      "Player"
  } = {}) {
    const name =
      (
        localStorage.getItem(nameKey) ||
        fallback
      )
        .trim()
        .slice(0, 24) ||
      fallback;

    document
      .querySelectorAll(
        "[data-player-name]"
      )
      .forEach(element => {
        element.textContent =
          name;
      });

    document
      .querySelectorAll(
        "[data-player-world]"
      )
      .forEach(element => {
        element.textContent =
          name.endsWith("s")
            ? `${name}' World`
            : `${name}'s World`;
      });

    document
      .querySelectorAll(
        "[data-player-possessive]"
      )
      .forEach(element => {
        element.textContent =
          name.endsWith("s")
            ? `${name}'`
            : `${name}'s`;
      });

    return name;
  },

  toggleSound() {
    this.soundEnabled =
      !this.soundEnabled;

    localStorage.setItem(
      SOUND_KEY,
      String(this.soundEnabled)
    );

    this.showToast(
      this.soundEnabled
        ? "Sound is on! 🔊"
        : "Sound is off. 🔇"
    );

    return this.soundEnabled;
  },

  playTone({
    frequency = 520,
    duration = 0.08,
    type = "sine",
    volume = 0.04
  } = {}) {
    if (!this.soundEnabled) {
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioContext =
      new AudioContextClass();

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type =
      type;

    oscillator.frequency.value =
      frequency;

    gain.gain.value =
      volume;

    oscillator.connect(
      gain
    );

    gain.connect(
      audioContext.destination
    );

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime +
      duration
    );

    oscillator.addEventListener(
      "ended",
      () => {
        audioContext.close();
      }
    );
  },

  celebrate() {
    this.playTone({
      frequency: 660,
      duration: 0.1
    });

    window.setTimeout(
      () => {
        this.playTone({
          frequency: 820,
          duration: 0.12
        });
      },
      90
    );

    window.setTimeout(
      () => {
        this.playTone({
          frequency: 980,
          duration: 0.14
        });
      },
      190
    );

    this.showToast(
      "Amazing work! 🌟"
    );
  },

  escapeHtml(value) {
    return String(value)
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }
};

window.ELCraftUI =
  ELCraftUI;

document.addEventListener(
  "DOMContentLoaded",
  () => {
    ELCraftUI.personalize();
    ELCraftUI.makeDestinationCardsInteractive();
  }
);
