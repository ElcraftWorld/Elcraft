/* ELCraft My City — Pet Shop routing enabled */
(() => {
  'use strict';

  const NAME_KEY = 'elcraft_child_name';
  const AVATAR_KEY = 'elcraft_avatar_image';
  const MAIL_KEY = 'elcraft_city_mail_opened';

  const homeButton = document.getElementById('homeButton');
  const cityOwner = document.getElementById('cityOwner');
  const hero = document.getElementById('hero');
  const heroName = document.getElementById('heroName');
  const heroAvatar = document.getElementById('heroAvatar');
  const message = document.getElementById('message');
  const city = document.getElementById('city');

  let messageTimer = null;

  function getPlayerName() {
    const savedName = localStorage.getItem(NAME_KEY);

    if (!savedName) {
      return 'Player';
    }

    const cleanedName = savedName
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 20);

    return cleanedName || 'Player';
  }

  function loadPlayerName() {
    const playerName = getPlayerName();

    if (heroName) {
      heroName.textContent = playerName;
    }

    if (cityOwner) {
      cityOwner.textContent = `✨ ${playerName}'s City`;
    }

    document.title = `ELCraft — ${playerName}'s City`;
  }

  function loadPlayerAvatar() {
    if (!heroAvatar) {
      return;
    }

    const savedAvatar = localStorage.getItem(AVATAR_KEY);

    if (!savedAvatar) {
      heroAvatar.removeAttribute('src');
      return;
    }

    heroAvatar.src = savedAvatar;

    heroAvatar.addEventListener(
      'error',
      () => {
        heroAvatar.removeAttribute('src');
      },
      { once: true }
    );
  }

  function showMessage(text, duration = 2000) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.add('show');

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
      message.classList.remove('show');
    }, duration);
  }

  function openPage(fileName) {
    window.location.href = fileName;
  }

  function showComingSoon(placeName) {
    const playerName = getPlayerName();

    showMessage(
      `${placeName} is coming soon for ${playerName}! ✨`
    );
  }

  function activateWorld(world, label) {
    switch (world) {
      case 'home':
        openPage('index.html');
        break;

      case 'art':
        openPage('sky-world.html');
        break;

      case 'character':
        openPage('my-character.html');
        break;

      case 'castle':
        showComingSoon('The Castle');
        break;

      case 'library':
        showComingSoon('The Library');
        break;

      case 'school':
        openPage('school.html');
        break;

      case 'market':
        openPage('market.html');
        break;

      case 'pets':
        openPage('pet-shop.html');
        break;

      case 'salon':
        openPage('salon.html');
        break;

      default:
        showComingSoon(label || 'This place');
        break;
    }
  }

  function makeInteractive(element) {
    if (!element) {
      return;
    }

    if (!element.hasAttribute('role')) {
      element.setAttribute('role', 'button');
    }

    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }

    element.addEventListener('click', () => {
      const world = element.dataset.world;

      const label =
        element.dataset.label ||
        element.getAttribute('aria-label') ||
        'This place';

      activateWorld(world, label);
    });

    element.addEventListener('keydown', event => {
      if (
        event.key !== 'Enter' &&
        event.key !== ' '
      ) {
        return;
      }

      event.preventDefault();

      const world = element.dataset.world;

      const label =
        element.dataset.label ||
        element.getAttribute('aria-label') ||
        'This place';

      activateWorld(world, label);
    });
  }

  function injectCityStyles() {
    const style = document.createElement('style');

    style.textContent = `
      /* -------------------------------------- */
      /* NOTIFICATION POSITION                  */
      /* -------------------------------------- */

      #message {
        top: 115px;
        transform: translateX(-50%) translateY(-180px);
        z-index: 300;
      }

      #message.show {
        transform: translateX(-50%) translateY(0);
      }

      /* -------------------------------------- */
      /* NEW CITY LIFE FEATURES                 */
      /* -------------------------------------- */

      .city-decoration {
        position: absolute;
        z-index: 3;
        pointer-events: none;
        user-select: none;
      }

      /* Fountain */

      #cityFountain {
        position: absolute;
        left: 50%;
        bottom: 16.5%;
        width: clamp(84px, 8vw, 130px);
        height: clamp(84px, 8vw, 130px);
        transform: translateX(-50%);
        z-index: 5;
        cursor: pointer;
        pointer-events: auto;
      }

      .fountain-pool {
        position: absolute;
        left: 50%;
        bottom: 0;
        width: 100%;
        height: 42%;
        transform: translateX(-50%);
        border: 5px solid rgba(255,255,255,.92);
        border-radius: 50%;
        background:
          radial-gradient(
            ellipse at center,
            #9ee9ff 0%,
            #55c5ec 55%,
            #3198d0 100%
          );
        box-shadow:
          inset 0 -8px 0 rgba(22,120,178,.2),
          0 9px 16px rgba(37,102,128,.25);
      }

      .fountain-center {
        position: absolute;
        left: 50%;
        bottom: 24%;
        width: 23%;
        height: 43%;
        transform: translateX(-50%);
        border: 4px solid rgba(255,255,255,.85);
        border-radius: 15px 15px 8px 8px;
        background: linear-gradient(
          to right,
          #f6e9c7,
          #d9c494
        );
      }

      .fountain-water {
        position: absolute;
        left: 50%;
        bottom: 48%;
        width: 9px;
        height: 54%;
        transform: translateX(-50%);
        border-radius: 999px 999px 0 0;
        background: linear-gradient(
          to top,
          rgba(91,207,247,.3),
          #c4f5ff
        );
        box-shadow:
          -18px 7px 0 -2px rgba(179,241,255,.9),
          18px 7px 0 -2px rgba(179,241,255,.9);
        animation: fountainWater 1.25s ease-in-out infinite;
      }

      .fountain-drop {
        position: absolute;
        width: 10px;
        height: 14px;
        border-radius: 50% 50% 55% 55%;
        background: #baf1ff;
        opacity: .85;
        animation: waterDrop 1.4s linear infinite;
      }

      .fountain-drop.one {
        left: 28%;
        top: 28%;
      }

      .fountain-drop.two {
        right: 27%;
        top: 33%;
        animation-delay: .45s;
      }

      .fountain-drop.three {
        left: 48%;
        top: 8%;
        animation-delay: .8s;
      }

      #cityFountain:hover {
        filter: brightness(1.08);
      }

      #cityFountain:focus-visible {
        outline: 5px solid white;
        outline-offset: 5px;
        border-radius: 50%;
      }

      /* Mailbox */

      #cityMailbox {
        position: absolute;
        left: 1.8%;
        bottom: 15.5%;
        z-index: 7;
        width: clamp(58px, 5vw, 82px);
        cursor: pointer;
        text-align: center;
        pointer-events: auto;
        transition: transform .2s ease;
      }

      #cityMailbox:hover {
        transform: translateY(-7px) rotate(-2deg);
      }

      #cityMailbox:active {
        transform: translateY(-1px) scale(.96);
      }

      #cityMailbox:focus-visible {
        outline: 5px solid white;
        outline-offset: 4px;
        border-radius: 18px;
      }

      .mailbox-box {
        position: relative;
        width: 100%;
        aspect-ratio: 1.1 / .85;
        border: 4px solid rgba(255,255,255,.9);
        border-radius: 24px 24px 10px 10px;
        background: linear-gradient(
          145deg,
          #ff6d8a,
          #d94367
        );
        box-shadow:
          0 7px 0 rgba(120,47,69,.25),
          0 12px 17px rgba(53,81,47,.22);
      }

      .mailbox-door {
        position: absolute;
        left: 13%;
        top: 22%;
        width: 62%;
        height: 42%;
        border: 3px solid rgba(255,255,255,.75);
        border-radius: 12px;
        background: #ff9aad;
      }

      .mailbox-handle {
        position: absolute;
        left: 42%;
        top: 32%;
        width: 18%;
        height: 8%;
        border-radius: 999px;
        background: white;
      }

      .mailbox-flag {
        position: absolute;
        right: -10%;
        top: 10%;
        width: 9%;
        height: 57%;
        border-radius: 999px;
        background: #6544af;
        transform-origin: bottom center;
        transition: transform .35s ease;
      }

      .mailbox-flag::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 260%;
        aspect-ratio: 1.3 / 1;
        border-radius: 5px;
        background: #8060ca;
      }

      #cityMailbox.has-mail .mailbox-flag {
        transform: rotate(-90deg);
      }

      .mailbox-post {
        width: 18%;
        height: clamp(37px, 4vw, 58px);
        margin: 0 auto;
        border-radius: 0 0 8px 8px;
        background: #d5a374;
      }

      .mail-badge {
        position: absolute;
        right: -15px;
        top: -16px;
        min-width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        border-radius: 50%;
        color: white;
        background: #ffbe38;
        font-size: 17px;
        font-weight: 900;
        animation: mailBounce 1.5s ease-in-out infinite;
      }

      /* Birds */

      .city-bird {
        position: absolute;
        top: var(--bird-top);
        left: -10%;
        z-index: 2;
        font-size: clamp(22px, 2vw, 34px);
        line-height: 1;
        pointer-events: none;
        animation:
          birdFly var(--bird-speed) linear infinite;
        animation-delay: var(--bird-delay);
      }

      .city-bird.reverse {
        left: 110%;
        transform: scaleX(-1);
        animation-name: birdFlyReverse;
      }

      /* Butterflies */

      .city-butterfly {
        position: absolute;
        z-index: 8;
        font-size: clamp(20px, 2vw, 30px);
        pointer-events: none;
        animation:
          butterflyFloat var(--fly-speed)
          ease-in-out infinite;
        animation-delay: var(--fly-delay);
      }

      /* Flowers */

      .flower-patch {
        position: absolute;
        z-index: 3;
        display: flex;
        gap: 5px;
        pointer-events: none;
        font-size: clamp(17px, 1.7vw, 28px);
        transform-origin: bottom center;
        animation: flowerSway 2.8s ease-in-out infinite;
      }

      .flower-patch.patch-one {
        left: 29%;
        bottom: 18%;
      }

      .flower-patch.patch-two {
        right: 29%;
        bottom: 19%;
        animation-delay: .8s;
      }

      .flower-patch.patch-three {
        left: 47%;
        bottom: 38%;
        animation-delay: 1.3s;
      }

      /* Sparkles */

      .city-sparkle {
        position: absolute;
        z-index: 4;
        color: white;
        font-size: clamp(13px, 1.2vw, 21px);
        pointer-events: none;
        animation: sparklePop 2.3s ease-in-out infinite;
        animation-delay: var(--sparkle-delay);
      }

      /* Bus */

      #cityBus {
        position: absolute;
        left: -18%;
        bottom: 2.7%;
        z-index: 9;
        width: clamp(105px, 10vw, 165px);
        pointer-events: none;
        animation: busDrive 18s linear infinite;
      }

      .bus-body {
        position: relative;
        width: 100%;
        aspect-ratio: 2.1 / 1;
        border: 4px solid rgba(255,255,255,.9);
        border-radius: 22px 22px 12px 12px;
        background: linear-gradient(
          to bottom,
          #ffd852 0 61%,
          #f6a936 61% 100%
        );
        box-shadow: 0 9px 13px rgba(43,43,43,.24);
      }

      .bus-window {
        position: absolute;
        top: 16%;
        width: 20%;
        height: 31%;
        border: 3px solid rgba(255,255,255,.86);
        border-radius: 7px;
        background: linear-gradient(
          #9ee7ff,
          #54b8e4
        );
      }

      .bus-window.one {
        left: 10%;
      }

      .bus-window.two {
        left: 35%;
      }

      .bus-window.three {
        left: 60%;
      }

      .bus-door {
        position: absolute;
        right: 7%;
        bottom: 8%;
        width: 18%;
        height: 53%;
        border: 3px solid rgba(255,255,255,.85);
        border-radius: 7px;
        background: #db8b32;
      }

      .bus-wheel {
        position: absolute;
        bottom: -17%;
        width: 19%;
        aspect-ratio: 1;
        border: 5px solid #45415c;
        border-radius: 50%;
        background: #aeb2c1;
        animation: wheelSpin .6s linear infinite;
      }

      .bus-wheel.left {
        left: 15%;
      }

      .bus-wheel.right {
        right: 15%;
      }

      /* Animations */

      @keyframes fountainWater {
        0%,
        100% {
          height: 48%;
          opacity: .8;
        }

        50% {
          height: 60%;
          opacity: 1;
        }
      }

      @keyframes waterDrop {
        0% {
          transform: translateY(0) scale(.7);
          opacity: 0;
        }

        35% {
          opacity: 1;
        }

        100% {
          transform: translateY(42px) scale(1);
          opacity: 0;
        }
      }

      @keyframes mailBounce {
        0%,
        100% {
          transform: translateY(0) rotate(-5deg);
        }

        50% {
          transform: translateY(-7px) rotate(5deg);
        }
      }

      @keyframes birdFly {
        from {
          left: -10%;
          transform: translateY(0);
        }

        50% {
          transform: translateY(-18px);
        }

        to {
          left: 110%;
          transform: translateY(0);
        }
      }

      @keyframes birdFlyReverse {
        from {
          left: 110%;
          transform: scaleX(-1) translateY(0);
        }

        50% {
          transform: scaleX(-1) translateY(-16px);
        }

        to {
          left: -10%;
          transform: scaleX(-1) translateY(0);
        }
      }

      @keyframes butterflyFloat {
        0%,
        100% {
          transform:
            translate(0,0)
            rotate(-8deg);
        }

        25% {
          transform:
            translate(25px,-23px)
            rotate(8deg);
        }

        50% {
          transform:
            translate(50px,4px)
            rotate(-7deg);
        }

        75% {
          transform:
            translate(20px,27px)
            rotate(7deg);
        }
      }

      @keyframes flowerSway {
        0%,
        100% {
          transform: rotate(-3deg);
        }

        50% {
          transform: rotate(4deg);
        }
      }

      @keyframes sparklePop {
        0%,
        100% {
          transform: scale(.55) rotate(0);
          opacity: .18;
        }

        50% {
          transform: scale(1.25) rotate(22deg);
          opacity: 1;
        }
      }

      @keyframes busDrive {
        0% {
          left: -18%;
        }

        45% {
          left: 110%;
        }

        100% {
          left: 110%;
        }
      }

      @keyframes wheelSpin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 760px) {
        #message {
          top: 92px;
          max-width: 88vw;
        }
      }

      @media (max-height: 650px) and (orientation: landscape) {
        #message {
          top: 74px;
        }

        #cityFountain {
          bottom: 14%;
          width: 82px;
          height: 82px;
        }

        #cityMailbox {
          left: 1.5%;
          bottom: 13.5%;
          width: 54px;
        }

        #cityBus {
          width: 105px;
          bottom: 2%;
        }

        .flower-patch {
          font-size: 17px;
        }
      }

      @media (max-width: 650px) and (orientation: portrait) {
        #message {
          top: 90px;
        }

        #cityFountain {
          bottom: 15%;
          width: 76px;
          height: 76px;
        }

        #cityMailbox {
          left: 1.5%;
          bottom: 11.5%;
          width: 54px;
        }

        #cityBus {
          width: 100px;
          bottom: 1.5%;
        }

        .flower-patch.patch-one {
          left: 19%;
        }

        .flower-patch.patch-two {
          right: 19%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .fountain-water,
        .fountain-drop,
        .mail-badge,
        .city-bird,
        .city-butterfly,
        .flower-patch,
        .city-sparkle,
        #cityBus,
        .bus-wheel {
          animation: none;
        }

        #cityBus {
          display: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createFountain() {
    if (!city) {
      return;
    }

    const fountain = document.createElement('div');

    fountain.id = 'cityFountain';
    fountain.setAttribute('role', 'button');
    fountain.setAttribute('tabindex', '0');
    fountain.setAttribute(
      'aria-label',
      'Make a wish at the city fountain'
    );

    fountain.innerHTML = `
      <div class="fountain-water"></div>
      <div class="fountain-drop one"></div>
      <div class="fountain-drop two"></div>
      <div class="fountain-drop three"></div>
      <div class="fountain-center"></div>
      <div class="fountain-pool"></div>
    `;

    function makeWish() {
      const playerName = getPlayerName();

      showMessage(
        `${playerName} made a magical wish! 🌟`,
        2300
      );

      createWishSparkles(fountain);
    }

    fountain.addEventListener('click', makeWish);

    fountain.addEventListener('keydown', event => {
      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        makeWish();
      }
    });

    city.appendChild(fountain);
  }

  function createWishSparkles(fountain) {
    for (let index = 0; index < 8; index += 1) {
      const sparkle = document.createElement('span');

      sparkle.textContent =
        index % 2 === 0 ? '✨' : '⭐';

      sparkle.style.position = 'absolute';
      sparkle.style.left = '50%';
      sparkle.style.top = '25%';
      sparkle.style.zIndex = '20';
      sparkle.style.pointerEvents = 'none';
      sparkle.style.fontSize =
        `${18 + Math.random() * 12}px`;

      sparkle.style.transition =
        'transform 900ms ease-out, opacity 900ms ease-out';

      fountain.appendChild(sparkle);

      requestAnimationFrame(() => {
        const x = -80 + Math.random() * 160;
        const y = -40 - Math.random() * 100;

        sparkle.style.transform =
          `translate(${x}px, ${y}px) rotate(180deg)`;

        sparkle.style.opacity = '0';
      });

      setTimeout(() => {
        sparkle.remove();
      }, 950);
    }
  }

  function createMailbox() {
    if (!city) {
      return;
    }

    const mailbox = document.createElement('div');

    mailbox.id = 'cityMailbox';
    mailbox.setAttribute('role', 'button');
    mailbox.setAttribute('tabindex', '0');
    mailbox.setAttribute(
      'aria-label',
      'Open city mailbox'
    );

    const mailAlreadyOpened =
      localStorage.getItem(MAIL_KEY) === 'yes';

    if (!mailAlreadyOpened) {
      mailbox.classList.add('has-mail');
    }

    mailbox.innerHTML = `
      <div class="mailbox-box">
        <div class="mailbox-door"></div>
        <div class="mailbox-handle"></div>
        <div class="mailbox-flag"></div>
        ${
          mailAlreadyOpened
            ? ''
            : '<div class="mail-badge">1</div>'
        }
      </div>

      <div class="mailbox-post"></div>
    `;

    function openMailbox() {
      const playerName = getPlayerName();

      const hasUnreadMail =
        localStorage.getItem(MAIL_KEY) !== 'yes';

      if (hasUnreadMail) {
        localStorage.setItem(MAIL_KEY, 'yes');

        mailbox.classList.remove('has-mail');

        const badge =
          mailbox.querySelector('.mail-badge');

        if (badge) {
          badge.remove();
        }

        showMessage(
          `Welcome to My City, ${playerName}! Your adventure is just beginning! 💌`,
          3600
        );
      } else {
        showMessage(
          `No new mail yet, ${playerName}. Check again later! 📭`,
          2200
        );
      }
    }

    mailbox.addEventListener('click', openMailbox);

    mailbox.addEventListener('keydown', event => {
      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        openMailbox();
      }
    });

    city.appendChild(mailbox);
  }

  function createBirds() {
    if (!city) {
      return;
    }

    const birds = [
      {
        top: '8%',
        speed: '18s',
        delay: '0s',
        reverse: false
      },
      {
        top: '16%',
        speed: '24s',
        delay: '5s',
        reverse: true
      },
      {
        top: '25%',
        speed: '21s',
        delay: '9s',
        reverse: false
      }
    ];

    birds.forEach((birdData, index) => {
      const bird = document.createElement('div');

      bird.className = 'city-bird';

      if (birdData.reverse) {
        bird.classList.add('reverse');
      }

      bird.textContent =
        index === 1 ? '🕊️' : '🐦';

      bird.style.setProperty(
        '--bird-top',
        birdData.top
      );

      bird.style.setProperty(
        '--bird-speed',
        birdData.speed
      );

      bird.style.setProperty(
        '--bird-delay',
        birdData.delay
      );

      city.appendChild(bird);
    });
  }

  function createButterflies() {
    if (!city) {
      return;
    }

    const butterflies = [
      {
        left: '32%',
        top: '54%',
        speed: '5s',
        delay: '0s'
      },
      {
        left: '63%',
        top: '59%',
        speed: '6.2s',
        delay: '1.4s'
      },
      {
        left: '45%',
        top: '48%',
        speed: '5.7s',
        delay: '2.5s'
      }
    ];

    butterflies.forEach(data => {
      const butterfly = document.createElement('div');

      butterfly.className = 'city-butterfly';
      butterfly.textContent = '🦋';
      butterfly.style.left = data.left;
      butterfly.style.top = data.top;

      butterfly.style.setProperty(
        '--fly-speed',
        data.speed
      );

      butterfly.style.setProperty(
        '--fly-delay',
        data.delay
      );

      city.appendChild(butterfly);
    });
  }

  function createFlowers() {
    if (!city) {
      return;
    }

    const flowerSets = [
      {
        className: 'patch-one',
        flowers: '🌸🌼🌷'
      },
      {
        className: 'patch-two',
        flowers: '🌷🌻🌸'
      },
      {
        className: 'patch-three',
        flowers: '🌼🌸'
      }
    ];

    flowerSets.forEach(set => {
      const patch = document.createElement('div');

      patch.className =
        `flower-patch ${set.className}`;

      patch.textContent = set.flowers;

      city.appendChild(patch);
    });
  }

  function createSparkles() {
    if (!city) {
      return;
    }

    const sparklePositions = [
      ['18%', '42%'],
      ['77%', '47%'],
      ['36%', '63%'],
      ['67%', '68%'],
      ['48%', '32%'],
      ['91%', '39%'],
      ['9%', '63%']
    ];

    sparklePositions.forEach(
      ([left, top], index) => {
        const sparkle =
          document.createElement('div');

        sparkle.className = 'city-sparkle';

        sparkle.textContent =
          index % 2 === 0 ? '✨' : '✦';

        sparkle.style.left = left;
        sparkle.style.top = top;

        sparkle.style.setProperty(
          '--sparkle-delay',
          `${index * 0.42}s`
        );

        city.appendChild(sparkle);
      }
    );
  }

  function createBus() {
    if (!city) {
      return;
    }

    const bus = document.createElement('div');

    bus.id = 'cityBus';
    bus.setAttribute('aria-hidden', 'true');

    bus.innerHTML = `
      <div class="bus-body">
        <div class="bus-window one"></div>
        <div class="bus-window two"></div>
        <div class="bus-window three"></div>
        <div class="bus-door"></div>
        <div class="bus-wheel left"></div>
        <div class="bus-wheel right"></div>
      </div>
    `;

    city.appendChild(bus);
  }

  function showWelcomeMessage() {
    const playerName = getPlayerName();

    setTimeout(() => {
      showMessage(
        `Welcome to My City, ${playerName}! 🏙️`,
        2200
      );
    }, 450);
  }

  if (homeButton) {
    homeButton.addEventListener('click', () => {
      openPage('index.html');
    });
  }

  document
    .querySelectorAll('.building, #castle')
    .forEach(makeInteractive);

  if (hero) {
    hero.dataset.world = 'character';
    hero.dataset.label = 'My Character';

    makeInteractive(hero);
  }

  injectCityStyles();
  loadPlayerName();
  loadPlayerAvatar();

  createFountain();
  createMailbox();
  createBirds();
  createButterflies();
  createFlowers();
  createSparkles();
  createBus();

  showWelcomeMessage();

  window.addEventListener('storage', event => {
    if (event.key === NAME_KEY) {
      loadPlayerName();
    }

    if (event.key === AVATAR_KEY) {
      loadPlayerAvatar();
    }
  });
})();
