/*
  ELCraft Walkable Building Engine
  File name: walkable-building-engine.js

  Reusable for Library, School, Farm, Pet Shop, and future buildings.
*/

export class WalkableBuildingEngine {
  constructor({
    stage,
    player,
    obstacles = [],
    interactables = [],
    speed = 4,
    onInteract = null,
    onMove = null
  }) {
    if (!stage || !player) {
      throw new Error(
        "WalkableBuildingEngine requires a stage and player element."
      );
    }

    this.stage =
      stage;

    this.player =
      player;

    this.speed =
      speed;

    this.onInteract =
      onInteract;

    this.onMove =
      onMove;

    this.keys =
      new Set();

    this.obstacles =
      obstacles;

    this.interactables =
      interactables;

    this.position = {
      x:
        Number(
          player.dataset.startX ||
          50
        ),

      y:
        Number(
          player.dataset.startY ||
          78
        )
    };

    this.direction =
      "down";

    this.activeInteractable =
      null;

    this.running =
      false;

    this.lastFrame =
      0;

    this.joystick = {
      active:
        false,

      dx:
        0,

      dy:
        0
    };

    this.boundLoop =
      this.loop.bind(
        this
      );

    this.installKeyboard();
    this.installJoystick();
    this.installClickToWalk();
    this.updatePlayer();
  }

  installKeyboard() {
    const movementKeys =
      new Set([
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "w",
        "a",
        "s",
        "d"
      ]);

    window.addEventListener(
      "keydown",
      event => {
        const key =
          event.key.toLowerCase();

        if (
          movementKeys.has(
            key
          )
        ) {
          event.preventDefault();

          this.keys.add(
            key
          );
        }

        if (
          key === "e" ||
          key === "enter" ||
          key === " "
        ) {
          if (
            this.activeInteractable
          ) {
            event.preventDefault();

            this.interact();
          }
        }
      }
    );

    window.addEventListener(
      "keyup",
      event => {
        this.keys.delete(
          event.key.toLowerCase()
        );
      }
    );
  }

  installJoystick() {
    const joystick =
      document.getElementById(
        "touchJoystick"
      );

    const knob =
      document.getElementById(
        "touchJoystickKnob"
      );

    if (
      !joystick ||
      !knob
    ) {
      return;
    }

    const updateJoystick =
      event => {
        const pointer =
          event.touches
            ? event.touches[0]
            : event;

        const rect =
          joystick.getBoundingClientRect();

        const centerX =
          rect.left +
          rect.width / 2;

        const centerY =
          rect.top +
          rect.height / 2;

        let dx =
          pointer.clientX -
          centerX;

        let dy =
          pointer.clientY -
          centerY;

        const max =
          rect.width *
          0.31;

        const distance =
          Math.hypot(
            dx,
            dy
          );

        if (
          distance >
          max
        ) {
          dx =
            dx /
            distance *
            max;

          dy =
            dy /
            distance *
            max;
        }

        knob.style.transform =
          `translate(${dx}px, ${dy}px)`;

        this.joystick.active =
          true;

        this.joystick.dx =
          dx /
          max;

        this.joystick.dy =
          dy /
          max;
      };

    const endJoystick =
      () => {
        this.joystick.active =
          false;

        this.joystick.dx =
          0;

        this.joystick.dy =
          0;

        knob.style.transform =
          "translate(0, 0)";
      };

    joystick.addEventListener(
      "pointerdown",
      event => {
        joystick.setPointerCapture(
          event.pointerId
        );

        updateJoystick(
          event
        );
      }
    );

    joystick.addEventListener(
      "pointermove",
      event => {
        if (
          this.joystick.active
        ) {
          updateJoystick(
            event
          );
        }
      }
    );

    joystick.addEventListener(
      "pointerup",
      endJoystick
    );

    joystick.addEventListener(
      "pointercancel",
      endJoystick
    );
  }

  installClickToWalk() {
    this.stage.addEventListener(
      "pointerdown",
      event => {
        if (
          event.target.closest(
            "button, .interaction-button, .modal, .global-nav"
          )
        ) {
          return;
        }

        const rect =
          this.stage.getBoundingClientRect();

        const targetX =
          (
            event.clientX -
            rect.left
          ) /
          rect.width *
          100;

        const targetY =
          (
            event.clientY -
            rect.top
          ) /
          rect.height *
          100;

        this.walkToward(
          targetX,
          targetY
        );
      }
    );
  }

  walkToward(
    targetX,
    targetY
  ) {
    const start =
      performance.now();

    const duration =
      Math.min(
        1600,
        Math.max(
          300,
          Math.hypot(
            targetX -
            this.position.x,
            targetY -
            this.position.y
          ) *
          22
        )
      );

    const fromX =
      this.position.x;

    const fromY =
      this.position.y;

    const animate =
      now => {
        const progress =
          Math.min(
            1,
            (
              now -
              start
            ) /
            duration
          );

        const desiredX =
          fromX +
          (
            targetX -
            fromX
          ) *
          progress;

        const desiredY =
          fromY +
          (
            targetY -
            fromY
          ) *
          progress;

        this.tryMove(
          desiredX -
          this.position.x,
          desiredY -
          this.position.y,
          true
        );

        if (
          progress <
          1
        ) {
          requestAnimationFrame(
            animate
          );
        }
      };

    requestAnimationFrame(
      animate
    );
  }

  start() {
    if (
      this.running
    ) {
      return;
    }

    this.running =
      true;

    requestAnimationFrame(
      this.boundLoop
    );
  }

  stop() {
    this.running =
      false;
  }

  loop(
    timestamp
  ) {
    if (
      !this.running
    ) {
      return;
    }

    const delta =
      this.lastFrame
        ? Math.min(
            2,
            (
              timestamp -
              this.lastFrame
            ) /
            16.667
          )
        : 1;

    this.lastFrame =
      timestamp;

    let dx =
      0;

    let dy =
      0;

    if (
      this.keys.has(
        "arrowleft"
      ) ||
      this.keys.has(
        "a"
      )
    ) {
      dx -=
        1;
    }

    if (
      this.keys.has(
        "arrowright"
      ) ||
      this.keys.has(
        "d"
      )
    ) {
      dx +=
        1;
    }

    if (
      this.keys.has(
        "arrowup"
      ) ||
      this.keys.has(
        "w"
      )
    ) {
      dy -=
        1;
    }

    if (
      this.keys.has(
        "arrowdown"
      ) ||
      this.keys.has(
        "s"
      )
    ) {
      dy +=
        1;
    }

    if (
      this.joystick.active
    ) {
      dx =
        this.joystick.dx;

      dy =
        this.joystick.dy;
    }

    const length =
      Math.hypot(
        dx,
        dy
      );

    if (
      length >
      0
    ) {
      dx /=
        length;

      dy /=
        length;

      const percentPerFrame =
        this.speed *
        0.055 *
        delta;

      this.tryMove(
        dx *
        percentPerFrame,
        dy *
        percentPerFrame
      );

      this.player.classList.add(
        "walking"
      );
    } else {
      this.player.classList.remove(
        "walking"
      );
    }

    this.detectInteraction();

    requestAnimationFrame(
      this.boundLoop
    );
  }

  tryMove(
    dx,
    dy,
    absoluteDelta = false
  ) {
    const nextX =
      Math.max(
        3,
        Math.min(
          97,
          this.position.x +
          dx
        )
      );

    const nextY =
      Math.max(
        8,
        Math.min(
          94,
          this.position.y +
          dy
        )
      );

    if (
      Math.abs(dx) >
      Math.abs(dy)
    ) {
      this.direction =
        dx <
        0
          ? "left"
          : "right";
    } else if (
      Math.abs(dy) >
      0
    ) {
      this.direction =
        dy <
        0
          ? "up"
          : "down";
    }

    const previousX =
      this.position.x;

    const previousY =
      this.position.y;

    this.position.x =
      nextX;

    this.position.y =
      nextY;

    if (
      this.collides()
    ) {
      this.position.x =
        previousX;

      this.position.y =
        previousY;

      return false;
    }

    this.updatePlayer();

    if (
      this.onMove
    ) {
      this.onMove({
        ...this.position,
        direction:
          this.direction
      });
    }

    return true;
  }

  updatePlayer() {
    this.player.style.left =
      `${this.position.x}%`;

    this.player.style.top =
      `${this.position.y}%`;

    this.player.dataset.direction =
      this.direction;
  }

  playerRectPercent() {
    return {
      left:
        this.position.x -
        2.2,

      right:
        this.position.x +
        2.2,

      top:
        this.position.y -
        5.5,

      bottom:
        this.position.y +
        2.4
    };
  }

  collides() {
    const player =
      this.playerRectPercent();

    return this.obstacles.some(
      obstacle => {
        const rect =
          this.resolveRect(
            obstacle
          );

        return (
          player.right >
            rect.left &&
          player.left <
            rect.right &&
          player.bottom >
            rect.top &&
          player.top <
            rect.bottom
        );
      }
    );
  }

  resolveRect(
    item
  ) {
    if (
      item.element
    ) {
      const stageRect =
        this.stage.getBoundingClientRect();

      const rect =
        item.element.getBoundingClientRect();

      return {
        left:
          (
            rect.left -
            stageRect.left
          ) /
          stageRect.width *
          100,

        right:
          (
            rect.right -
            stageRect.left
          ) /
          stageRect.width *
          100,

        top:
          (
            rect.top -
            stageRect.top
          ) /
          stageRect.height *
          100,

        bottom:
          (
            rect.bottom -
            stageRect.top
          ) /
          stageRect.height *
          100
      };
    }

    return item;
  }

  detectInteraction() {
    const nearest =
      this.interactables
        .map(
          item => {
            const dx =
              this.position.x -
              item.x;

            const dy =
              this.position.y -
              item.y;

            return {
              item,
              distance:
                Math.hypot(
                  dx,
                  dy
                )
            };
          }
        )
        .filter(
          result =>
            result.distance <=
            (
              result.item.radius ||
              9
            )
        )
        .sort(
          (
            a,
            b
          ) =>
            a.distance -
            b.distance
        )[0];

    const next =
      nearest?.item ||
      null;

    if (
      next?.id ===
      this.activeInteractable?.id
    ) {
      return;
    }

    this.activeInteractable =
      next;

    const prompt =
      document.getElementById(
        "interactionPrompt"
      );

    const button =
      document.getElementById(
        "interactionButton"
      );

    if (
      !prompt ||
      !button
    ) {
      return;
    }

    if (
      next
    ) {
      prompt.hidden =
        false;

      button.innerHTML =
        `${next.icon || "✨"} ${next.label || "Interact"}`;
    } else {
      prompt.hidden =
        true;
    }
  }

  interact() {
    if (
      !this.activeInteractable
    ) {
      return;
    }

    if (
      this.onInteract
    ) {
      this.onInteract(
        this.activeInteractable
      );
    }
  }
}
