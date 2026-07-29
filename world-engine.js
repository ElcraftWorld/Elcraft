/* ELCraft World Engine v1
   Shared progression system for every ELCraft page.
   Save key: elcraft_world_v1
*/
(() => {
  const WORLD_KEY = 'elcraft_world_v1';
  const PROFILE_KEY = 'elcraft_profile_v1';

  const SUBJECT_KEYS = {
    reading: 'elcraft_reading_library_v1',
    writing: 'elcraft_writing_v1',
    math: 'elcraft_math_v1',
    science: 'elcraft_science_v1',
    discovery: 'elcraft_discovery_v1',
    music: 'elcraft_music_studio_v1'
  };

  const DEFAULT_WORLD = {
    version: 1,
    totalStars: 0,
    totalXP: 0,
    coins: Number(localStorage.getItem('elcraft_coins') || 0),

    cityLevel: 1,
    skyLevel: 1,
    characterLevel: 1,

    nature: {
      flowerStage: 0,
      butterflyStage: 0,
      treeStage: 0,
      fountainStage: 0,
      birdStage: 0,
      fireflyStage: 0
    },

    castleStage: 0,
    roadStage: 0,
    rainbowStage: 0,

    skyIslands: {
      rainbowPlaza: true,
      artIsland: false,
      musicIsland: false,
      theaterIsland: false,
      unicornMeadow: false,
      wizardTower: false,
      observatory: false,
      inventorIsland: false,
      spaceDock: false
    },

    characterUnlocks: {
      cape: false,
      backpack: false,
      skates: false,
      fairyWings: false,
      dragonWings: false,
      wizardRobes: false,
      royalArmor: false,
      legendaryOutfit: false
    },

    buildingStages: {
      library: 1,
      school: 1,
      market: 1,
      petShop: 1,
      styleStudio: 1,
      home: 1,
      castle: 1
    },

    subjectStars: {
      reading: 0,
      writing: 0,
      math: 0,
      science: 0,
      discovery: 0,
      music: 0,
      art: 0
    },

    achievements: [],
    lastCalculatedAt: null
  };

  const deepMerge = (target, source) => {
    if (!source || typeof source !== 'object') return target;
    Object.keys(source).forEach(key => {
      const value = source[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        target[key] = deepMerge(
          target[key] && typeof target[key] === 'object' ? target[key] : {},
          value
        );
      } else {
        target[key] = value;
      }
    });
    return target;
  };

  function readJSON(key, fallback = null) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function getWorld() {
    const saved = readJSON(WORLD_KEY, {});
    return deepMerge(structuredClone(DEFAULT_WORLD), saved);
  }

  function countMasteryStars(data) {
    if (!data || typeof data !== 'object') return 0;
    if (data.mastery && typeof data.mastery === 'object') {
      return Object.values(data.mastery).reduce((sum, value) => sum + (Number(value) || 0), 0);
    }
    return 0;
  }

  function calculateReadingStars(data) {
    if (!data || typeof data !== 'object') return 0;
    const passport = data.passport || data.progress || {};
    if (passport && typeof passport === 'object') {
      const values = Object.values(passport);
      const completed = values.filter(v => {
        if (typeof v === 'number') return v > 0;
        if (typeof v === 'boolean') return v;
        if (v && typeof v === 'object') return v.completed || v.read || v.finished;
        return false;
      }).length;
      return Math.min(50, completed);
    }
    const completedBooks = Array.isArray(data.completedBooks) ? data.completedBooks.length : 0;
    return Math.min(50, completedBooks);
  }

  function calculateWritingStars(data) {
    if (!data || typeof data !== 'object') return 0;
    if (data.mastery) return countMasteryStars(data);
    const portfolio = Array.isArray(data.portfolio) ? data.portfolio.length : 0;
    const completed = Number(data.totalCompleted || data.completedActivities || 0);
    return Math.min(50, portfolio + completed);
  }

  function calculateSubjectStars() {
    const result = {
      reading: calculateReadingStars(readJSON(SUBJECT_KEYS.reading, {})),
      writing: calculateWritingStars(readJSON(SUBJECT_KEYS.writing, {})),
      math: countMasteryStars(readJSON(SUBJECT_KEYS.math, {})),
      science: countMasteryStars(readJSON(SUBJECT_KEYS.science, {})),
      discovery: countMasteryStars(readJSON(SUBJECT_KEYS.discovery, {})),
      music: countMasteryStars(readJSON(SUBJECT_KEYS.music, {})),
      art: 0
    };

    const art = readJSON('elcraft_art_gallery_v1', {});
    result.art = countMasteryStars(art) || Math.min(50, Array.isArray(art.gallery) ? art.gallery.length : 0);

    return result;
  }

  function levelFromStars(stars, thresholds) {
    let level = 1;
    thresholds.forEach((threshold, index) => {
      if (stars >= threshold) level = index + 2;
    });
    return level;
  }

  function unlockByThreshold(world, stars) {
    world.cityLevel = levelFromStars(stars, [10, 25, 50, 90, 140, 220, 320, 450]);
    world.skyLevel = levelFromStars(stars, [15, 35, 70, 120, 190, 280, 400, 550]);
    world.characterLevel = levelFromStars(stars, [10, 20, 40, 70, 110, 170, 260, 400]);

    world.nature.flowerStage = stars >= 10 ? (stars >= 60 ? (stars >= 180 ? 3 : 2) : 1) : 0;
    world.nature.butterflyStage = stars >= 20 ? (stars >= 75 ? (stars >= 220 ? 3 : 2) : 1) : 0;
    world.nature.treeStage = stars >= 30 ? (stars >= 100 ? (stars >= 250 ? (stars >= 450 ? 4 : 3) : 2) : 1) : 0;
    world.nature.fountainStage = stars >= 50 ? (stars >= 150 ? (stars >= 300 ? (stars >= 500 ? 4 : 3) : 2) : 1) : 0;
    world.nature.birdStage = stars >= 40 ? (stars >= 130 ? (stars >= 350 ? 3 : 2) : 1) : 0;
    world.nature.fireflyStage = stars >= 90 ? (stars >= 260 ? 2 : 1) : 0;

    world.castleStage = stars >= 80 ? (stars >= 200 ? (stars >= 400 ? 3 : 2) : 1) : 0;
    world.roadStage = stars >= 35 ? (stars >= 120 ? (stars >= 280 ? 3 : 2) : 1) : 0;
    world.rainbowStage = stars >= 70 ? (stars >= 240 ? 2 : 1) : 0;

    world.skyIslands.rainbowPlaza = true;
    world.skyIslands.artIsland = stars >= 20;
    world.skyIslands.musicIsland = stars >= 40;
    world.skyIslands.theaterIsland = stars >= 70;
    world.skyIslands.unicornMeadow = stars >= 110;
    world.skyIslands.wizardTower = stars >= 160;
    world.skyIslands.observatory = stars >= 220;
    world.skyIslands.inventorIsland = stars >= 300;
    world.skyIslands.spaceDock = stars >= 420;

    world.characterUnlocks.cape = stars >= 10;
    world.characterUnlocks.backpack = stars >= 20;
    world.characterUnlocks.skates = stars >= 40;
    world.characterUnlocks.fairyWings = stars >= 70;
    world.characterUnlocks.dragonWings = stars >= 110;
    world.characterUnlocks.wizardRobes = stars >= 170;
    world.characterUnlocks.royalArmor = stars >= 260;
    world.characterUnlocks.legendaryOutfit = stars >= 400;

    world.buildingStages.library = 1 + (stars >= 60) + (stars >= 180) + (stars >= 360);
    world.buildingStages.school = 1 + (stars >= 50) + (stars >= 160) + (stars >= 340);
    world.buildingStages.market = 1 + (stars >= 40) + (stars >= 140) + (stars >= 300);
    world.buildingStages.petShop = 1 + (stars >= 30) + (stars >= 120) + (stars >= 260);
    world.buildingStages.styleStudio = 1 + (stars >= 25) + (stars >= 100) + (stars >= 240);
    world.buildingStages.home = 1 + (stars >= 80) + (stars >= 220) + (stars >= 420);
    world.buildingStages.castle = 1 + (stars >= 90) + (stars >= 220) + (stars >= 450);
  }

  function achievement(world, id, title, description, unlocked) {
    const exists = world.achievements.some(item => item.id === id);
    if (unlocked && !exists) {
      world.achievements.push({
        id,
        title,
        description,
        unlockedAt: new Date().toISOString()
      });
    }
  }

  function calculateAchievements(world) {
    const stars = world.totalStars;
    achievement(world, 'first-star', 'First Spark', 'Earn your first learning star.', stars >= 1);
    achievement(world, 'city-blooms', 'City in Bloom', 'Grow the first city flowers.', stars >= 10);
    achievement(world, 'sky-builder', 'Sky Builder', 'Help the first new sky island appear.', stars >= 20);
    achievement(world, 'world-grower', 'World Grower', 'Reach 100 total stars.', stars >= 100);
    achievement(world, 'magic-city', 'Magical City', 'Reach 300 total stars.', stars >= 300);
    achievement(world, 'legendary-learner', 'Legendary Learner', 'Reach 500 total stars.', stars >= 500);

    Object.entries(world.subjectStars).forEach(([subject, value]) => {
      achievement(
        world,
        `subject-${subject}-5`,
        `${subject[0].toUpperCase() + subject.slice(1)} Explorer`,
        `Earn 5 stars in ${subject}.`,
        value >= 5
      );
    });
  }

  function recalculate() {
    const world = getWorld();
    const profile = readJSON(PROFILE_KEY, {});

    world.subjectStars = calculateSubjectStars();
    world.totalStars = Object.values(world.subjectStars).reduce((sum, value) => sum + (Number(value) || 0), 0);
    world.totalXP = Number(profile.xp || profile.totalXp || 0);
    world.coins = Number(profile.coins ?? localStorage.getItem('elcraft_coins') ?? world.coins ?? 0);

    unlockByThreshold(world, world.totalStars);
    calculateAchievements(world);
    world.lastCalculatedAt = new Date().toISOString();

    localStorage.setItem(WORLD_KEY, JSON.stringify(world));
    return world;
  }

  function getNextUnlock(world = recalculate()) {
    const unlocks = [
      [10, 'City flowers begin to bloom'],
      [20, 'Art Island appears in Sky World'],
      [30, 'The first city tree grows'],
      [40, 'Music Island appears in Sky World'],
      [50, 'The fountain begins to upgrade'],
      [70, 'Theater Island and fairy wings'],
      [90, 'Castle decorations and fireflies'],
      [110, 'Unicorn Meadow and dragon wings'],
      [160, 'Wizard Tower'],
      [220, 'Cloud Observatory'],
      [300, 'Inventor Island'],
      [420, 'Space Dock'],
      [500, 'Rainbow Fountain']
    ];

    const next = unlocks.find(([stars]) => world.totalStars < stars);
    if (!next) return { required: world.totalStars, remaining: 0, label: 'All current world upgrades discovered!' };

    return {
      required: next[0],
      remaining: next[0] - world.totalStars,
      label: next[1]
    };
  }

  window.ELCraftWorld = {
    key: WORLD_KEY,
    get: getWorld,
    recalculate,
    getNextUnlock
  };

  recalculate();
})();
