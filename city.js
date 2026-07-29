(() => {
  'use strict';

  const NAME_KEY = 'elcraft_child_name';
  const AVATAR_KEY = 'elcraft_avatar_image';

  const homeButton = document.getElementById('homeButton');
  const cityOwner = document.getElementById('cityOwner');
  const hero = document.getElementById('hero');
  const heroName = document.getElementById('heroName');
  const heroAvatar = document.getElementById('heroAvatar');
  const message = document.getElementById('message');

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

  function showMessage(text) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.add('show');

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
      message.classList.remove('show');
    }, 1800);
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
        showComingSoon('The School');
        break;

      case 'market':
        showComingSoon('The Market');
        break;

      case 'pets':
        showComingSoon('The Pet Shop');
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

  loadPlayerName();
  loadPlayerAvatar();

  window.addEventListener('storage', event => {
    if (event.key === NAME_KEY) {
      loadPlayerName();
    }

    if (event.key === AVATAR_KEY) {
      loadPlayerAvatar();
    }
  });
})();
