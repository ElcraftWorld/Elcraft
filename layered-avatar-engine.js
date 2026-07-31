const STYLE_KEY = "elcraft_layered_avatar_v1";
const AVATAR_IMAGE_KEY = "elcraft_child_avatar";

export const AVATAR_MANIFEST = {
  canvas: {
    width: 600,
    height: 800
  },

  basePath: "assets/avatar",

  layers: {
    body: {
      folder: "body",
      options: [
        { id: "body-1", label: "Body 1", file: "body-1.png" },
        { id: "body-2", label: "Body 2", file: "body-2.png" },
        { id: "body-3", label: "Body 3", file: "body-3.png" },
        { id: "body-4", label: "Body 4", file: "body-4.png" }
      ]
    },

    face: {
      folder: "face",
      options: [
        { id: "face-1", label: "Face 1", file: "face-1.png" },
        { id: "face-2", label: "Face 2", file: "face-2.png" },
        { id: "face-3", label: "Face 3", file: "face-3.png" }
      ]
    },

    eyes: {
      folder: "eyes",
      options: [
        { id: "eyes-1", label: "Eyes 1", file: "eyes-1.png" },
        { id: "eyes-2", label: "Eyes 2", file: "eyes-2.png" },
        { id: "eyes-3", label: "Eyes 3", file: "eyes-3.png" }
      ]
    },

    mouth: {
      folder: "mouth",
      options: [
        { id: "mouth-1", label: "Smile 1", file: "mouth-1.png" },
        { id: "mouth-2", label: "Smile 2", file: "mouth-2.png" },
        { id: "mouth-3", label: "Smile 3", file: "mouth-3.png" }
      ]
    },

    hairBack: {
      folder: "hair-back",
      options: [
        { id: "hair-1", label: "Soft Waves", file: "hair-1.png" },
        { id: "hair-2", label: "Short Hair", file: "hair-2.png" },
        { id: "hair-3", label: "Braids", file: "hair-3.png" },
        { id: "hair-4", label: "Afro", file: "hair-4.png" },
        { id: "hair-5", label: "Locs", file: "hair-5.png" },
        { id: "hair-6", label: "Ponytail", file: "hair-6.png" }
      ]
    },

    hairFront: {
      folder: "hair-front",
      options: [
        { id: "hair-1", label: "Soft Waves", file: "hair-1.png" },
        { id: "hair-2", label: "Short Hair", file: "hair-2.png" },
        { id: "hair-3", label: "Braids", file: "hair-3.png" },
        { id: "hair-4", label: "Afro", file: "hair-4.png" },
        { id: "hair-5", label: "Locs", file: "hair-5.png" },
        { id: "hair-6", label: "Ponytail", file: "hair-6.png" }
      ]
    },

    top: {
      folder: "top",
      options: [
        { id: "top-1", label: "T-Shirt", file: "top-1.png" },
        { id: "top-2", label: "Hoodie", file: "top-2.png" },
        { id: "top-3", label: "Jacket", file: "top-3.png" },
        { id: "top-4", label: "Dress", file: "top-4.png" },
        { id: "top-5", label: "Overalls", file: "top-5.png" }
      ]
    },

    bottom: {
      folder: "bottom",
      options: [
        { id: "bottom-1", label: "Jeans", file: "bottom-1.png" },
        { id: "bottom-2", label: "Shorts", file: "bottom-2.png" },
        { id: "bottom-3", label: "Skirt", file: "bottom-3.png" },
        { id: "bottom-4", label: "Joggers", file: "bottom-4.png" }
      ]
    },

    shoes: {
      folder: "shoes",
      options: [
        { id: "shoes-1", label: "Sneakers", file: "shoes-1.png" },
        { id: "shoes-2", label: "Boots", file: "shoes-2.png" },
        { id: "shoes-3", label: "High Tops", file: "shoes-3.png" }
      ]
    },

    accessory: {
      folder: "accessory",
      options: [
        { id: "none", label: "No Extra", file: null },
        { id: "accessory-1", label: "Glasses", file: "accessory-1.png" },
        { id: "accessory-2", label: "Crown", file: "accessory-2.png" },
        { id: "accessory-3", label: "Cap", file: "accessory-3.png" },
        { id: "accessory-4", label: "Bow", file: "accessory-4.png" }
      ]
    }
  },

  renderOrder: [
    "hairBack",
    "body",
    "bottom",
    "top",
    "shoes",
    "face",
    "eyes",
    "mouth",
    "hairFront",
    "accessory"
  ],

  makeup: {
    lipstick: {
      x: 300,
      y: 332,
      width: 90,
      height: 45
    },

    leftEye: {
      x: 245,
      y: 258,
      width: 75,
      height: 50
    },

    rightEye: {
      x: 355,
      y: 258,
      width: 75,
      height: 50
    },

    leftCheek: {
      x: 220,
      y: 328,
      width: 95,
      height: 70
    },

    rightCheek: {
      x: 380,
      y: 328,
      width: 95,
      height: 70
    }
  }
};

export const DEFAULT_STYLE = {
  body: "body-1",
  face: "face-1",
  eyes: "eyes-1",
  mouth: "mouth-1",
  hairBack: "hair-1",
  hairFront: "hair-1",
  top: "top-1",
  bottom: "bottom-1",
  shoes: "shoes-1",
  accessory: "none",

  makeup: {
    lipstick: null,
    mascara: false,
    blush: null,
    facePaint: [],
    glitter: []
  }
};

export function loadAvatarStyle() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STYLE_KEY) || "null"
    );

    return stored
      ? {
          ...structuredClone(DEFAULT_STYLE),
          ...stored,
          makeup: {
            ...structuredClone(DEFAULT_STYLE.makeup),
            ...(stored.makeup || {})
          }
        }
      : structuredClone(DEFAULT_STYLE);
  } catch {
    localStorage.removeItem(STYLE_KEY);
    return structuredClone(DEFAULT_STYLE);
  }
}

export function saveAvatarStyle(style) {
  localStorage.setItem(
    STYLE_KEY,
    JSON.stringify(style)
  );
}

export function optionFor(layerKey, optionId) {
  const layer =
    AVATAR_MANIFEST.layers[layerKey];

  if (!layer) {
    return null;
  }

  return (
    layer.options.find(
      option => option.id === optionId
    ) ||
    layer.options[0] ||
    null
  );
}

export function assetPath(layerKey, optionId) {
  const layer =
    AVATAR_MANIFEST.layers[layerKey];

  const option =
    optionFor(layerKey, optionId);

  if (
    !layer ||
    !option ||
    !option.file
  ) {
    return null;
  }

  return [
    AVATAR_MANIFEST.basePath,
    layer.folder,
    option.file
  ].join("/");
}

function loadImage(path) {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.onload =
        () => resolve(image);

      image.onerror =
        () => reject(
          new Error(
            `Missing avatar asset: ${path}`
          )
        );

      image.src =
        path;
    }
  );
}

function drawEllipse(
  context,
  area,
  color,
  alpha
) {
  context.save();

  context.globalAlpha =
    alpha;

  context.fillStyle =
    color;

  context.beginPath();

  context.ellipse(
    area.x,
    area.y,
    area.width / 2,
    area.height / 2,
    0,
    0,
    Math.PI * 2
  );

  context.fill();
  context.restore();
}

function drawMakeup(
  context,
  style
) {
  const zones =
    AVATAR_MANIFEST.makeup;

  const makeup =
    style.makeup ||
    DEFAULT_STYLE.makeup;

  if (makeup.lipstick) {
    drawEllipse(
      context,
      zones.lipstick,
      makeup.lipstick,
      .45
    );
  }

  if (makeup.mascara) {
    context.save();

    context.strokeStyle =
      "#25212a";

    context.lineWidth =
      4;

    context.lineCap =
      "round";

    [
      zones.leftEye,
      zones.rightEye
    ].forEach(area => {
      for (
        let index = -2;
        index <= 2;
        index += 1
      ) {
        const x =
          area.x +
          index * 11;

        context.beginPath();

        context.moveTo(
          x,
          area.y - 10
        );

        context.lineTo(
          x + index * 1.5,
          area.y - 25
        );

        context.stroke();
      }
    });

    context.restore();
  }

  if (makeup.blush) {
    drawEllipse(
      context,
      zones.leftCheek,
      makeup.blush,
      .16
    );

    drawEllipse(
      context,
      zones.rightCheek,
      makeup.blush,
      .16
    );
  }

  (makeup.facePaint || [])
    .forEach(mark => {
      context.save();

      context.fillStyle =
        mark.color ||
        "#ff4f87";

      context.beginPath();

      context.arc(
        Number(mark.x),
        Number(mark.y),
        Number(mark.size || 6),
        0,
        Math.PI * 2
      );

      context.fill();
      context.restore();
    });

  (makeup.glitter || [])
    .forEach(mark => {
      context.save();

      context.fillStyle =
        "#ffe66d";

      context.beginPath();

      context.arc(
        Number(mark.x),
        Number(mark.y),
        Number(mark.size || 3),
        0,
        Math.PI * 2
      );

      context.fill();
      context.restore();
    });
}

export async function renderAvatarToCanvas(
  canvas,
  style,
  {
    includeMakeup = true,
    clear = true
  } = {}
) {
  const context =
    canvas.getContext("2d");

  const {
    width,
    height
  } =
    AVATAR_MANIFEST.canvas;

  if (clear) {
    context.clearRect(
      0,
      0,
      width,
      height
    );
  }

  for (
    const layerKey
    of AVATAR_MANIFEST.renderOrder
  ) {
    const path =
      assetPath(
        layerKey,
        style[layerKey]
      );

    if (!path) {
      continue;
    }

    const image =
      await loadImage(path);

    context.drawImage(
      image,
      0,
      0,
      width,
      height
    );
  }

  if (includeMakeup) {
    drawMakeup(
      context,
      style
    );
  }
}

export async function saveAvatarImage(
  canvas
) {
  const dataUrl =
    canvas.toDataURL(
      "image/png"
    );

  localStorage.setItem(
    AVATAR_IMAGE_KEY,
    dataUrl
  );

  return dataUrl;
}

export function resetMakeup(style) {
  style.makeup =
    structuredClone(
      DEFAULT_STYLE.makeup
    );
}
