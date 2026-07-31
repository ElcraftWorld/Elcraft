const AVATAR_STYLE_KEY = "elcraft_avatar_vector_v1";
const AVATAR_IMAGE_KEY = "elcraft_child_avatar";

export const DEFAULT_AVATAR = {
  skin: "#c9865b",
  hairStyle: "waves",
  hairColor: "#4a2d25",
  eyeStyle: "round",
  eyeColor: "#49342d",
  mouth: "smile",
  shirtStyle: "tee",
  shirtColor: "#7259d6",
  bottomColor: "#42577d",
  shoeColor: "#5063cb",
  accessory: "none",
  freckles: false,
  blush: "#ef8fa6",
  lipstick: "#c95675",
  mascara: false,
  facePaint: [],
  glitter: []
};

export function loadAvatarStyle() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(AVATAR_STYLE_KEY) || "null"
    );

    return stored
      ? { ...DEFAULT_AVATAR, ...stored }
      : { ...DEFAULT_AVATAR };
  } catch {
    localStorage.removeItem(AVATAR_STYLE_KEY);
    return { ...DEFAULT_AVATAR };
  }
}

export function saveAvatarStyle(style) {
  localStorage.setItem(
    AVATAR_STYLE_KEY,
    JSON.stringify(style)
  );
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function hairBack(style) {
  const color = escapeXml(style.hairColor);

  const map = {
    short: `
      <path d="M122 153Q125 65 210 62Q295 65 298 153Q270 107 232 98Q210 83 188 98Q150 107 122 153Z"
        fill="${color}"/>
    `,
    afro: `
      <g fill="${color}">
        <circle cx="143" cy="111" r="52"/>
        <circle cx="210" cy="82" r="61"/>
        <circle cx="277" cy="111" r="52"/>
        <circle cx="118" cy="168" r="45"/>
        <circle cx="302" cy="168" r="45"/>
        <circle cx="154" cy="213" r="43"/>
        <circle cx="266" cy="213" r="43"/>
      </g>
    `,
    braids: `
      <path d="M118 151Q121 65 210 61Q299 65 302 151L286 192Q257 126 210 115Q163 126 134 192Z"
        fill="${color}"/>
      <rect x="109" y="167" width="31" height="149" rx="15" fill="${color}"/>
      <rect x="280" y="167" width="31" height="149" rx="15" fill="${color}"/>
      <path d="M124 177v126M296 177v126" stroke="rgba(255,255,255,.18)" stroke-width="6" stroke-dasharray="11 9"/>
    `,
    buns: `
      <circle cx="126" cy="79" r="41" fill="${color}"/>
      <circle cx="294" cy="79" r="41" fill="${color}"/>
      <path d="M112 151Q118 64 210 60Q302 64 308 151Q279 111 244 99Q210 82 176 99Q141 111 112 151Z"
        fill="${color}"/>
    `,
    locs: `
      <path d="M112 150Q118 59 210 57Q302 59 308 150L293 255Q264 151 210 129Q156 151 127 255Z"
        fill="${color}"/>
      <g stroke="${color}" stroke-width="18" stroke-linecap="round">
        <path d="M130 165v130"/>
        <path d="M157 150v153"/>
        <path d="M263 150v153"/>
        <path d="M290 165v130"/>
      </g>
    `,
    ponytail: `
      <path d="M109 148Q114 57 210 53Q306 57 311 148L302 245Q278 136 210 119Q142 136 118 245Z"
        fill="${color}"/>
      <ellipse cx="320" cy="213" rx="43" ry="78" transform="rotate(-15 320 213)" fill="${color}"/>
    `,
    waves: `
      <path d="M108 147Q111 57 210 53Q309 57 312 147L304 270Q290 300 260 291L269 208Q245 128 210 121Q175 128 151 208L160 291Q130 300 116 270Z"
        fill="${color}"/>
    `
  };

  return map[style.hairStyle] || map.waves;
}

function hairFront(style) {
  const color = escapeXml(style.hairColor);

  const map = {
    short: `
      <path d="M121 136Q151 70 210 68Q269 70 299 136Q247 109 210 111Q173 109 121 136Z"
        fill="${color}"/>
    `,
    afro: `
      <path d="M124 141Q144 75 210 69Q276 75 296 141Q248 104 210 106Q172 104 124 141Z"
        fill="${color}"/>
    `,
    braids: `
      <path d="M121 137Q151 70 210 68Q269 70 299 137Q246 111 210 113Q174 111 121 137Z"
        fill="${color}"/>
    `,
    buns: `
      <path d="M122 137Q155 70 210 68Q265 70 298 137Q249 109 210 111Q171 109 122 137Z"
        fill="${color}"/>
    `,
    locs: `
      <path d="M119 139Q147 66 210 64Q273 66 301 139Q251 108 210 111Q169 108 119 139Z"
        fill="${color}"/>
    `,
    ponytail: `
      <path d="M115 140Q147 58 210 61Q273 58 305 140Q265 108 232 106Q210 89 188 106Q155 108 115 140Z"
        fill="${color}"/>
    `,
    waves: `
      <path d="M115 140Q147 58 210 61Q273 58 305 140Q265 108 232 106Q210 89 188 106Q155 108 115 140Z"
        fill="${color}"/>
    `
  };

  return map[style.hairStyle] || map.waves;
}

function eyes(style) {
  const eyeColor = escapeXml(style.eyeColor);
  const wide = style.eyeStyle === "wide";
  const sleepy = style.eyeStyle === "sleepy";
  const ry = wide ? 26 : sleepy ? 16 : 22;
  const pupil = wide ? 13 : 11;

  return `
    <ellipse cx="170" cy="184" rx="21" ry="${ry}" fill="#fff"/>
    <ellipse cx="250" cy="184" rx="21" ry="${ry}" fill="#fff"/>
    <circle cx="171" cy="187" r="${pupil}" fill="${eyeColor}"/>
    <circle cx="249" cy="187" r="${pupil}" fill="${eyeColor}"/>
    <circle cx="174" cy="183" r="3.5" fill="#fff"/>
    <circle cx="252" cy="183" r="3.5" fill="#fff"/>
  `;
}

function mouth(style) {
  const color = escapeXml(style.lipstick);

  const map = {
    grin: `
      <path d="M169 235Q210 278 251 235Q210 295 169 235Z" fill="${color}"/>
      <path d="M181 242Q210 260 239 242" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    `,
    open: `
      <ellipse cx="210" cy="246" rx="32" ry="24" fill="#6b3040"/>
      <path d="M190 252Q210 266 230 252" fill="#ef809c"/>
    `,
    small: `
      <path d="M189 242Q210 258 231 242" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"/>
    `,
    smile: `
      <path d="M176 236Q210 266 244 236Q210 279 176 236Z" fill="${color}"/>
      <path d="M184 239Q210 255 236 239" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="4" stroke-linecap="round"/>
    `
  };

  return map[style.mouth] || map.smile;
}

function shirt(style) {
  const shirtColor = escapeXml(style.shirtColor);
  const bottomColor = escapeXml(style.bottomColor);

  const shirts = {
    hoodie: `
      <path d="M119 291Q137 252 177 246H243Q283 252 301 291L282 416Q210 439 138 416Z"
        fill="${shirtColor}"/>
      <path d="M174 247Q210 279 246 247Q239 299 210 307Q181 299 174 247Z"
        fill="rgba(255,255,255,.18)"/>
      <path d="M191 286v52M229 286v52" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    `,
    overalls: `
      <path d="M121 291Q140 254 178 247H242Q280 254 299 291L282 413Q210 435 138 413Z"
        fill="${shirtColor}"/>
      <path d="M171 263H249V400H171Z" fill="#597bb4"/>
      <path d="M175 260L154 302M245 260L266 302" stroke="#597bb4" stroke-width="15"/>
      <circle cx="186" cy="281" r="6" fill="#ffd45e"/>
      <circle cx="234" cy="281" r="6" fill="#ffd45e"/>
    `,
    dress: `
      <path d="M135 287Q154 252 182 247H238Q266 252 285 287L316 431Q210 467 104 431Z"
        fill="${shirtColor}"/>
      <path d="M180 250Q210 272 240 250" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="9"/>
    `,
    jacket: `
      <path d="M120 291Q138 251 176 246H244Q282 251 300 291L282 416Q210 439 138 416Z"
        fill="${shirtColor}"/>
      <path d="M210 248V417" stroke="#f1d26b" stroke-width="8"/>
      <path d="M172 316h40M248 316h-40" stroke="#f1d26b" stroke-width="7"/>
    `,
    tee: `
      <path d="M124 291Q145 255 177 249H243Q275 255 296 291L278 407Q210 429 142 407Z"
        fill="${shirtColor}"/>
      <path d="M177 249Q210 270 243 249" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="9"/>
    `
  };

  return `
    ${shirts[style.shirtStyle] || shirts.tee}
    <path d="M141 392Q210 414 279 392L273 439H147Z" fill="${bottomColor}"/>
  `;
}

function accessory(style) {
  const map = {
    glasses: `
      <g fill="none" stroke="#5c4693" stroke-width="7">
        <rect x="141" y="164" width="59" height="44" rx="17"/>
        <rect x="220" y="164" width="59" height="44" rx="17"/>
        <path d="M200 181Q210 173 220 181"/>
      </g>
    `,
    crown: `
      <path d="M164 75L181 35L210 67L239 35L256 75Z"
        fill="#ffd45e" stroke="#d69c25" stroke-width="6"/>
    `,
    cap: `
      <path d="M139 91Q210 42 281 91L273 123Q210 98 147 123Z" fill="#4f68cb"/>
      <path d="M253 111Q303 109 319 130Q276 140 250 127Z" fill="#4f68cb"/>
    `,
    flower: `
      <g transform="translate(280 105)">
        <circle cx="0" cy="-15" r="13" fill="#ff7eb5"/>
        <circle cx="14" cy="-2" r="13" fill="#ff7eb5"/>
        <circle cx="0" cy="11" r="13" fill="#ff7eb5"/>
        <circle cx="-14" cy="-2" r="13" fill="#ff7eb5"/>
        <circle cx="0" cy="-2" r="9" fill="#ffd45e"/>
      </g>
    `,
    bow: `
      <g transform="translate(278 102)">
        <path d="M0 0Q-47-33-50 5Q-44 42 0 10Z" fill="#ff79ae"/>
        <path d="M0 0Q47-33 50 5Q44 42 0 10Z" fill="#ff79ae"/>
        <circle cx="0" cy="7" r="14" fill="#d9508b"/>
      </g>
    `,
    none: ""
  };

  return map[style.accessory] || "";
}

function faceDecorations(style) {
  const freckles = style.freckles
    ? `
      <g fill="rgba(102,63,44,.48)">
        <circle cx="171" cy="217" r="3"/>
        <circle cx="184" cy="220" r="2.5"/>
        <circle cx="236" cy="217" r="3"/>
        <circle cx="249" cy="220" r="2.5"/>
      </g>
    `
    : "";

  const mascara = style.mascara
    ? `
      <g stroke="#24212a" stroke-width="4" stroke-linecap="round">
        <path d="M149 165l-7-11M159 161l-4-13M181 161l4-13M191 165l7-11"/>
        <path d="M229 165l-7-11M239 161l-4-13M261 161l4-13M271 165l7-11"/>
      </g>
    `
    : "";

  const facePaint = (style.facePaint || [])
    .map(mark => `
      <circle cx="${Number(mark.x).toFixed(1)}" cy="${Number(mark.y).toFixed(1)}"
        r="${Number(mark.size || 5).toFixed(1)}" fill="${escapeXml(mark.color)}"/>
    `)
    .join("");

  const glitter = (style.glitter || [])
    .map(mark => `
      <circle cx="${Number(mark.x).toFixed(1)}" cy="${Number(mark.y).toFixed(1)}"
        r="${Number(mark.size || 2).toFixed(1)}" fill="#ffe66d"/>
    `)
    .join("");

  return `${freckles}${mascara}${facePaint}${glitter}`;
}

export function avatarSvg(style, options = {}) {
  const skin = escapeXml(style.skin);
  const shoeColor = escapeXml(style.shoeColor);
  const blush = escapeXml(style.blush);
  const background = options.transparent
    ? ""
    : `
      <defs>
        <linearGradient id="avatarBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f8fcff"/>
          <stop offset="1" stop-color="#dbeef8"/>
        </linearGradient>
      </defs>
      <rect width="420" height="560" rx="30" fill="url(#avatarBg)"/>
    `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 420 560"
      role="img"
      aria-label="ELCraft avatar">

      ${background}

      <ellipse cx="210" cy="521" rx="104" ry="19" fill="rgba(70,66,110,.15)"/>

      <rect x="151" y="399" width="42" height="91" rx="20" fill="${skin}"/>
      <rect x="227" y="399" width="42" height="91" rx="20" fill="${skin}"/>
      <rect x="132" y="468" width="73" height="31" rx="16" fill="${shoeColor}"/>
      <rect x="215" y="468" width="73" height="31" rx="16" fill="${shoeColor}"/>

      ${shirt(style)}

      <path d="M133 287Q111 307 104 353Q101 374 119 379Q136 382 143 360L161 307Z"
        fill="${skin}"/>
      <path d="M287 287Q309 307 316 353Q319 374 301 379Q284 382 277 360L259 307Z"
        fill="${skin}"/>
      <circle cx="112" cy="381" r="18" fill="${skin}"/>
      <circle cx="308" cy="381" r="18" fill="${skin}"/>

      <rect x="178" y="239" width="64" height="76" rx="29" fill="${skin}"/>

      ${hairBack(style)}

      <ellipse cx="122" cy="194" rx="24" ry="31" fill="${skin}"/>
      <ellipse cx="298" cy="194" rx="24" ry="31" fill="${skin}"/>
      <ellipse cx="210" cy="181" rx="100" ry="113" fill="${skin}"/>

      <path d="M149 153Q170 142 191 153" fill="none"
        stroke="${escapeXml(style.hairColor)}" stroke-width="8" stroke-linecap="round"/>
      <path d="M229 153Q250 142 271 153" fill="none"
        stroke="${escapeXml(style.hairColor)}" stroke-width="8" stroke-linecap="round"/>

      ${eyes(style)}

      <path d="M207 188Q200 219 211 221" fill="none"
        stroke="rgba(96,53,42,.25)" stroke-width="5" stroke-linecap="round"/>

      <ellipse cx="149" cy="221" rx="23" ry="10" fill="${blush}" opacity=".28"/>
      <ellipse cx="271" cy="221" rx="23" ry="10" fill="${blush}" opacity=".28"/>

      ${mouth(style)}
      ${faceDecorations(style)}
      ${hairFront(style)}
      ${accessory(style)}
    </svg>
  `;
}

export function svgDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function saveAvatarImage(style) {
  const dataUrl = svgDataUrl(
    avatarSvg(style, { transparent: true })
  );

  localStorage.setItem(
    AVATAR_IMAGE_KEY,
    dataUrl
  );

  return dataUrl;
}

export function renderAvatar(container, style, options = {}) {
  container.innerHTML = avatarSvg(style, options);
}
