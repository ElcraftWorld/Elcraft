/* ELCraft Living City Growth v1
   Load after city.js and world-engine.js.
   It keeps My City fully accessible while visual details grow with learning stars.
*/
(() => {
  'use strict';

  const city = document.getElementById('city');
  if (!city) return;

  const world = window.ELCraftWorld
    ? window.ELCraftWorld.recalculate()
    : (() => {
        try {
          return JSON.parse(localStorage.getItem('elcraft_world_v1') || '{}');
        } catch {
          return {};
        }
      })();

  const stars = Number(world.totalStars || 0);
  const nature = world.nature || {};
  const castleStage = Number(world.castleStage || 0);
  const roadStage = Number(world.roadStage || 0);
  const rainbowStage = Number(world.rainbowStage || 0);

  city.dataset.cityLevel = String(world.cityLevel || 1);
  city.dataset.flowerStage = String(nature.flowerStage || 0);
  city.dataset.butterflyStage = String(nature.butterflyStage || 0);
  city.dataset.treeStage = String(nature.treeStage || 0);
  city.dataset.fountainStage = String(nature.fountainStage || 0);
  city.dataset.birdStage = String(nature.birdStage || 0);
  city.dataset.fireflyStage = String(nature.fireflyStage || 0);
  city.dataset.castleStage = String(castleStage);
  city.dataset.roadStage = String(roadStage);
  city.dataset.rainbowStage = String(rainbowStage);

  const style = document.createElement('style');
  style.id = 'elcraft-city-growth-styles';
  style.textContent = `
    .growth-hidden {
      display: none !important;
    }

    .city-growth-badge {
      position: absolute;
      right: 18px;
      top: 16px;
      z-index: 45;
      min-width: 150px;
      padding: 9px 13px;
      border: 3px solid rgba(255,255,255,.95);
      border-radius: 18px;
      color: #5b429a;
      background: rgba(255,255,255,.94);
      box-shadow: 0 8px 20px rgba(38,65,111,.2);
      font-size: clamp(12px,1.05vw,16px);
      font-weight: 900;
      text-align: center;
      cursor: pointer;
    }

    .city-growth-badge strong {
      display: block;
      font-size: 1.18em;
    }

    .growth-decoration {
      position: absolute;
      z-index: 4;
      pointer-events: none;
      user-select: none;
    }

    .growth-rainbow {
      left: 50%;
      top: 1%;
      transform: translateX(-50%);
      font-size: clamp(80px,12vw,180px);
      opacity: .82;
      filter: drop-shadow(0 8px 12px rgba(70,91,143,.22));
      animation: growthRainbow 4s ease-in-out infinite;
    }

    .growth-firefly {
      font-size: clamp(12px,1.4vw,21px);
      animation: growthFirefly var(--speed) ease-in-out infinite;
      animation-delay: var(--delay);
      filter: drop-shadow(0 0 7px #fff5a8);
    }

    .growth-bench {
      bottom: 17.5%;
      font-size: clamp(34px,4vw,58px);
      filter: drop-shadow(0 6px 5px rgba(46,85,47,.25));
    }

    .growth-bench.left { left: 28%; }
    .growth-bench.right { right: 28%; }

    .growth-lamp {
      bottom: 14.5%;
      font-size: clamp(38px,4vw,62px);
      filter: drop-shadow(0 0 8px rgba(255,234,137,.75));
    }

    .growth-lamp.one { left: 12%; }
    .growth-lamp.two { right: 12%; }
    .growth-lamp.three { left: 43%; }

    .growth-balloon {
      top: 18%;
      font-size: clamp(28px,3vw,46px);
      animation: growthBalloon 8s ease-in-out infinite;
    }

    .growth-balloon.one { left: 24%; }
    .growth-balloon.two { right: 25%; animation-delay: 2.5s; }

    #city[data-tree-stage="0"] .tree {
      opacity: .2;
      transform: scale(.45);
      filter: grayscale(.5);
    }

    #city[data-tree-stage="1"] .tree {
      transform: scale(.72);
    }

    #city[data-tree-stage="2"] .tree {
      transform: scale(.9);
    }

    #city[data-tree-stage="3"] .tree {
      transform: scale(1.08);
      filter: saturate(1.15);
    }

    #city[data-tree-stage="4"] .tree {
      transform: scale(1.16);
      filter: saturate(1.25) drop-shadow(0 0 12px rgba(255,244,145,.75));
    }

    #city[data-fountain-stage="2"] #cityFountain {
      filter: saturate(1.18) drop-shadow(0 0 8px rgba(111,221,255,.55));
    }

    #city[data-fountain-stage="3"] #cityFountain {
      transform: translateX(-50%) scale(1.12);
      filter: saturate(1.28) drop-shadow(0 0 13px rgba(111,221,255,.75));
    }

    #city[data-fountain-stage="4"] #cityFountain {
      transform: translateX(-50%) scale(1.2);
      filter: saturate(1.35) drop-shadow(0 0 18px rgba(255,225,111,.9));
    }

    #city[data-castle-stage="1"] #castle::before {
      box-shadow:
        0 16px 0 rgba(73,112,56,.28),
        0 22px 30px rgba(34,91,38,.25),
        0 0 15px rgba(255,225,110,.65);
    }

    #city[data-castle-stage="2"] #castle::before {
      background: linear-gradient(145deg,#fff9d3,#efdfff);
      box-shadow:
        0 16px 0 rgba(73,112,56,.28),
        0 22px 30px rgba(34,91,38,.25),
        0 0 24px rgba(255,225,110,.9);
    }

    #city[data-castle-stage="3"] #castle::before {
      background: linear-gradient(145deg,#fff4a8,#e6d1ff,#c9eeff);
      box-shadow:
        0 16px 0 rgba(73,112,56,.28),
        0 22px 30px rgba(34,91,38,.25),
        0 0 34px rgba(255,238,135,1);
      animation: castleGlow 2.2s ease-in-out infinite;
    }

    @keyframes growthRainbow {
      50% { transform: translateX(-50%) translateY(7px) scale(1.03); }
    }

    @keyframes growthFirefly {
      0%,100% { transform: translate(0,0) scale(.8); opacity:.35; }
      50% { transform: translate(14px,-18px) scale(1.25); opacity:1; }
    }

    @keyframes growthBalloon {
      0%,100% { transform: translateY(0) rotate(-3deg); }
      50% { transform: translateY(-18px) rotate(4deg); }
    }

    @keyframes castleGlow {
      50% { filter: brightness(1.16); }
    }

    @media (max-width:700px) {
      .city-growth-badge {
        right: 8px;
        top: 8px;
        min-width: 118px;
        padding: 7px 9px;
      }

      .growth-bench.left { left: 20%; }
      .growth-bench.right { right: 20%; }
      .growth-lamp.three { display:none; }
    }

    @media (prefers-reduced-motion:reduce) {
      .growth-decoration,
      #castle::before {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  function hideExtra(elements, visibleCount) {
    elements.forEach((element, index) => {
      element.classList.toggle('growth-hidden', index >= visibleCount);
    });
  }

  function applyExistingGrowth() {
    const flowers = [...document.querySelectorAll('.flower-patch')];
    const butterflies = [...document.querySelectorAll('.city-butterfly')];
    const birds = [...document.querySelectorAll('.city-bird')];
    const sparkles = [...document.querySelectorAll('.city-sparkle')];
    const fountain = document.getElementById('cityFountain');

    const flowerCount = [0, 1, 2, 3][Math.min(3, Number(nature.flowerStage || 0))];
    const butterflyCount = [0, 1, 2, 3][Math.min(3, Number(nature.butterflyStage || 0))];
    const birdCount = [0, 1, 2, 3][Math.min(3, Number(nature.birdStage || 0))];

    hideExtra(flowers, flowerCount);
    hideExtra(butterflies, butterflyCount);
    hideExtra(birds, birdCount);

    if (fountain) {
      fountain.classList.toggle('growth-hidden', Number(nature.fountainStage || 0) === 0);
      fountain.setAttribute(
        'aria-label',
        Number(nature.fountainStage || 0) > 0
          ? `City fountain, stage ${nature.fountainStage}`
          : 'City fountain not grown yet'
      );
    }

    hideExtra(
      sparkles,
      castleStage >= 3 ? sparkles.length : castleStage >= 2 ? 4 : castleStage >= 1 ? 2 : 0
    );
  }

  function addDecoration(className, text, extraClass = '') {
    const element = document.createElement('div');
    element.className = `growth-decoration ${className} ${extraClass}`.trim();
    element.textContent = text;
    element.setAttribute('aria-hidden', 'true');
    city.appendChild(element);
    return element;
  }

  function addGrowthDecorations() {
    if (rainbowStage >= 1) {
      addDecoration('growth-rainbow', '🌈');
    }

    if (roadStage >= 1) {
      addDecoration('growth-bench', '🪑', 'left');
    }

    if (roadStage >= 2) {
      addDecoration('growth-bench', '🪑', 'right');
      addDecoration('growth-lamp', '💡', 'one');
      addDecoration('growth-lamp', '💡', 'two');
    }

    if (roadStage >= 3) {
      addDecoration('growth-lamp', '💡', 'three');
      addDecoration('growth-balloon', '🎈', 'one');
      addDecoration('growth-balloon', '🎈', 'two');
    }

    const fireflyCount = Number(nature.fireflyStage || 0) === 0
      ? 0
      : Number(nature.fireflyStage || 0) === 1
        ? 6
        : 12;

    const positions = [
      ['31%','58%'],['39%','62%'],['57%','55%'],['65%','63%'],
      ['46%','48%'],['73%','52%'],['24%','49%'],['53%','68%'],
      ['35%','70%'],['68%','45%'],['17%','60%'],['81%','61%']
    ];

    positions.slice(0, fireflyCount).forEach(([left, top], index) => {
      const firefly = addDecoration('growth-firefly', '✨');
      firefly.style.left = left;
      firefly.style.top = top;
      firefly.style.setProperty('--speed', `${2.3 + (index % 4) * .45}s`);
      firefly.style.setProperty('--delay', `${index * .22}s`);
    });
  }

  function nextGrowthMessage() {
    const milestones = [
      [10, 'flowers begin to bloom'],
      [20, 'butterflies visit the park'],
      [30, 'the city trees grow'],
      [40, 'birds begin flying overhead'],
      [50, 'the park fountain appears'],
      [70, 'a rainbow appears'],
      [90, 'fireflies and castle decorations appear'],
      [120, 'benches and street details appear'],
      [220, 'the castle begins glowing'],
      [280, 'street lamps and balloons appear'],
      [450, 'the legendary castle awakens']
    ];

    const next = milestones.find(([required]) => stars < required);

    if (!next) {
      return 'Legendary City';
    }

    return `${next[0] - stars} stars until ${next[1]}`;
  }

  function addGrowthBadge() {
    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'city-growth-badge';
    badge.innerHTML = `
      <strong>⭐ ${stars} Stars · City Level ${world.cityLevel || 1}</strong>
      <span>${nextGrowthMessage()}</span>
    `;
    badge.setAttribute('aria-label', 'Open World Progress');
    badge.addEventListener('click', () => {
      window.location.href = 'progress.html';
    });
    city.appendChild(badge);
  }

  function announceNewestGrowth() {
    const lastSeen = Number(localStorage.getItem('elcraft_city_last_seen_level') || 0);
    const currentLevel = Number(world.cityLevel || 1);

    if (currentLevel > lastSeen) {
      localStorage.setItem('elcraft_city_last_seen_level', String(currentLevel));

      const message = document.getElementById('message');
      if (message && currentLevel > 1) {
        setTimeout(() => {
          message.textContent = `Your city grew to Level ${currentLevel}! ✨`;
          message.classList.add('show');
          setTimeout(() => message.classList.remove('show'), 2600);
        }, 900);
      }
    }
  }

  // city.js creates its decorations immediately before this file loads.
  applyExistingGrowth();
  addGrowthDecorations();
  addGrowthBadge();
  announceNewestGrowth();
})();
