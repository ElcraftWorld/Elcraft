import { supabase } from "./supabase-client.js";

const SELECTED_CHILD_ID_KEY =
  "elcraft_selected_child_id";

const CHILD_NAME_KEY =
  "elcraft_child_name";

const CHILD_AVATAR_KEY =
  "elcraft_child_avatar";

const PETS = [
  {
    type: "puppy",
    label: "Puppy",
    emoji: "🐶",
    personality:
      "Playful, loyal, and always ready for a game."
  },
  {
    type: "kitten",
    label: "Kitten",
    emoji: "🐱",
    personality:
      "Curious, cuddly, and loves to explore."
  },
  {
    type: "bunny",
    label: "Bunny",
    emoji: "🐰",
    personality:
      "Gentle, cheerful, and loves fresh treats."
  },
  {
    type: "panda",
    label: "Panda",
    emoji: "🐼",
    personality:
      "Calm, silly, and gives the best hugs."
  },
  {
    type: "fox",
    label: "Fox",
    emoji: "🦊",
    personality:
      "Clever, energetic, and loves adventures."
  },
  {
    type: "unicorn",
    label: "Unicorn",
    emoji: "🦄",
    personality:
      "Magical, kind, and full of sparkles."
  }
];

const ACTIONS = {
  feed: {
    thought: "Yum! Thank you! 🍎",
    hunger: 18,
    happiness: 3,
    cleanliness: -2,
    xp: 5,
    rewardEvery: 3
  },

  wash: {
    thought: "So bubbly and clean! 🫧",
    hunger: -2,
    happiness: 4,
    cleanliness: 22,
    xp: 5,
    rewardEvery: 3
  },

  brush: {
    thought: "I look wonderful! ✨",
    hunger: -1,
    happiness: 9,
    cleanliness: 9,
    xp: 4,
    rewardEvery: 4
  },

  play: {
    thought: "Again! Again! 🎾",
    hunger: -7,
    happiness: 18,
    cleanliness: -4,
    xp: 7,
    rewardEvery: 3
  },

  treat: {
    thought: "Best treat ever! 🦴",
    hunger: 8,
    happiness: 12,
    cleanliness: -1,
    xp: 4,
    rewardEvery: 4
  }
};

const backButton =
  document.getElementById("backButton");

const playerName =
  document.getElementById("playerName");

const playerAvatar =
  document.getElementById("playerAvatar");

const starCount =
  document.getElementById("starCount");

const petList =
  document.getElementById("petList");

const adoptAnotherButton =
  document.getElementById("adoptAnotherButton");

const startAdoptionButton =
  document.getElementById("startAdoptionButton");

const emptyPetState =
  document.getElementById("emptyPetState");

const activePetArea =
  document.getElementById("activePetArea");

const petName =
  document.getElementById("petName");

const petType =
  document.getElementById("petType");

const petCharacter =
  document.getElementById("petCharacter");

const petNameTag =
  document.getElementById("petNameTag");

const petThought =
  document.getElementById("petThought");

const happinessValue =
  document.getElementById("happinessValue");

const happinessBar =
  document.getElementById("happinessBar");

const hungerValue =
  document.getElementById("hungerValue");

const hungerBar =
  document.getElementById("hungerBar");

const cleanlinessValue =
  document.getElementById("cleanlinessValue");

const cleanlinessBar =
  document.getElementById("cleanlinessBar");

const petLevel =
  document.getElementById("petLevel");

const petXpBar =
  document.getElementById("petXpBar");

const petXpText =
  document.getElementById("petXpText");

const rewardToast =
  document.getElementById("rewardToast");

const adoptionModal =
  document.getElementById("adoptionModal");

const closeAdoptionButton =
  document.getElementById("closeAdoptionButton");

const adoptionChoices =
  document.getElementById("adoptionChoices");

const nameModal =
  document.getElementById("nameModal");

const closeNameButton =
  document.getElementById("closeNameButton");

const namePetEmoji =
  document.getElementById("namePetEmoji");

const namePetForm =
  document.getElementById("namePetForm");

const petNameInput =
  document.getElementById("petNameInput");

const nameError =
  document.getElementById("nameError");

const savePetNameButton =
  document.getElementById("savePetNameButton");

const renamePetButton =
  document.getElementById("renamePetButton");

let session = null;
let childId = "";
let pets = [];
let selectedPetId = "";
let pendingPetType = null;
let renameMode = false;
let thoughtTimer = null;
let toastTimer = null;

function clamp(value) {
  return Math.max(
    0,
    Math.min(
      100,
      Number(value || 0)
    )
  );
}

function cleanPetName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 16);
}

function petDefinition(type) {
  return (
    PETS.find(
      item => item.type === type
    ) ||
    PETS[0]
  );
}

function currentPet() {
  return pets.find(
    pet => pet.id === selectedPetId
  ) || null;
}

function levelTarget(level) {
  return Math.max(
    50,
    Number(level || 1) * 50
  );
}

function calculateLevel(pet) {
  let level =
    Math.max(
      1,
      Number(pet.level || 1)
    );

  let experience =
    Math.max(
      0,
      Number(pet.experience || 0)
    );

  let target =
    levelTarget(level);

  while (experience >= target) {
    experience -= target;
    level += 1;
    target = levelTarget(level);
  }

  return {
    level,
    experience,
    target
  };
}

function showToast(text) {
  rewardToast.textContent = text;
  rewardToast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    rewardToast.classList.remove("show");
  }, 2300);
}

function showThought(text) {
  petThought.textContent = text;
  petThought.classList.add("show");

  clearTimeout(thoughtTimer);

  thoughtTimer = setTimeout(() => {
    petThought.classList.remove("show");
  }, 1900);
}

function animatePet() {
  petCharacter.classList.remove("action");

  void petCharacter.offsetWidth;

  petCharacter.classList.add("action");

  setTimeout(() => {
    petCharacter.classList.remove("action");
  }, 700);
}

function updateMeter(
  valueElement,
  barElement,
  amount
) {
  const safeAmount = clamp(amount);

  valueElement.textContent =
    `${safeAmount}%`;

  barElement.style.width =
    `${safeAmount}%`;

  if (safeAmount <= 25) {
    barElement.style.background =
      "linear-gradient(90deg,#f06a79,#ff9a76)";
  } else if (safeAmount <= 55) {
    barElement.style.background =
      "linear-gradient(90deg,#f5b64d,#ffe173)";
  } else {
    barElement.style.background =
      "linear-gradient(90deg,#63c97e,#9cdb71)";
  }
}

function renderPetList() {
  petList.replaceChildren();

  if (!pets.length) {
    const empty =
      document.createElement("div");

    empty.className =
      "pet-list-empty";

    empty.textContent =
      "No pets yet. Adopt one to begin!";

    petList.appendChild(empty);
    return;
  }

  pets.forEach(pet => {
    const definition =
      petDefinition(pet.pet_type);

    const button =
      document.createElement("button");

    button.type = "button";
    button.className =
      "pet-list-button";

    if (pet.id === selectedPetId) {
      button.classList.add("selected");
    }

    button.innerHTML = `
      <span class="pet-list-emoji">
        ${definition.emoji}
      </span>

      <span class="pet-list-copy">
        <strong>
          ${escapeHtml(pet.name)}
        </strong>

        <span>
          ${escapeHtml(definition.label)}
          • Level ${Number(pet.level || 1)}
        </span>
      </span>
    `;

    button.addEventListener(
      "click",
      () => {
        selectedPetId = pet.id;
        render();
      }
    );

    petList.appendChild(button);
  });
}

function renderActivePet() {
  const pet =
    currentPet();

  const hasPet =
    Boolean(pet);

  emptyPetState.hidden =
    hasPet;

  activePetArea.hidden =
    !hasPet;

  if (!pet) {
    return;
  }

  const definition =
    petDefinition(pet.pet_type);

  const progress =
    calculateLevel(pet);

  pet.level =
    progress.level;

  pet.experience =
    progress.experience;

  petName.textContent =
    pet.name;

  petNameTag.textContent =
    pet.name;

  petType.textContent =
    definition.label;

  petCharacter.textContent =
    definition.emoji;

  petCharacter.setAttribute(
    "aria-label",
    `Play with ${pet.name}`
  );

  updateMeter(
    happinessValue,
    happinessBar,
    pet.happiness
  );

  updateMeter(
    hungerValue,
    hungerBar,
    pet.hunger
  );

  updateMeter(
    cleanlinessValue,
    cleanlinessBar,
    pet.cleanliness
  );

  petLevel.textContent =
    String(progress.level);

  petXpBar.style.width =
    `${Math.min(
      100,
      Math.round(
        (
          progress.experience /
          progress.target
        ) * 100
      )
    )}%`;

  petXpText.textContent =
    `${progress.experience} / ${progress.target} XP`;
}

function render() {
  renderPetList();
  renderActivePet();
}

function openAdoptionModal() {
  renderAdoptionChoices();
  adoptionModal.classList.add("open");
}

function closeAdoptionModal() {
  adoptionModal.classList.remove("open");
}

function renderAdoptionChoices() {
  adoptionChoices.replaceChildren();

  PETS.forEach(definition => {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className =
      "adoption-option";

    button.innerHTML = `
      <div class="adoption-emoji">
        ${definition.emoji}
      </div>

      <h3>
        ${escapeHtml(definition.label)}
      </h3>

      <p>
        ${escapeHtml(definition.personality)}
      </p>
    `;

    button.addEventListener(
      "click",
      () => {
        pendingPetType =
          definition.type;

        renameMode = false;

        closeAdoptionModal();
        openNameModal();
      }
    );

    adoptionChoices.appendChild(button);
  });
}

function openNameModal() {
  const pet =
    currentPet();

  if (renameMode && pet) {
    const definition =
      petDefinition(pet.pet_type);

    namePetEmoji.textContent =
      definition.emoji;

    petNameInput.value =
      pet.name;

    document.getElementById(
      "namePetTitle"
    ).textContent =
      "Rename Your Pet";

    savePetNameButton.textContent =
      "Save Name";
  } else {
    const definition =
      petDefinition(
        pendingPetType || "puppy"
      );

    namePetEmoji.textContent =
      definition.emoji;

    petNameInput.value = "";

    document.getElementById(
      "namePetTitle"
    ).textContent =
      "Name Your Pet";

    savePetNameButton.textContent =
      "Adopt Pet";
  }

  nameError.textContent = "";
  nameModal.classList.add("open");

  setTimeout(() => {
    petNameInput.focus();
    petNameInput.select();
  }, 100);
}

function closeNameModal() {
  nameModal.classList.remove("open");
  nameError.textContent = "";
  petNameInput.value = "";
  pendingPetType = null;
  renameMode = false;
}

async function verifySession() {
  const {
    data: {
      session: currentSession
    },
    error
  } =
    await supabase.auth.getSession();

  if (error || !currentSession) {
    window.location.replace(
      "auth.html"
    );

    return false;
  }

  session =
    currentSession;

  childId =
    localStorage.getItem(
      SELECTED_CHILD_ID_KEY
    ) || "";

  if (!childId) {
    window.location.replace(
      "profiles.html"
    );

    return false;
  }

  playerName.textContent =
    localStorage.getItem(
      CHILD_NAME_KEY
    ) || "Player";

  playerAvatar.textContent =
    localStorage.getItem(
      CHILD_AVATAR_KEY
    ) || "🌟";

  return true;
}

async function loadStars() {
  const {
    data,
    error
  } =
    await supabase
      .from("child_profiles")
      .select("stars")
      .eq("id", childId)
      .eq(
        "parent_id",
        session.user.id
      )
      .maybeSingle();

  if (error) {
    console.warn(
      "Unable to load stars:",
      error
    );

    return;
  }

  starCount.textContent =
    `⭐ ${Number(data?.stars || 0)}`;
}

async function loadPets() {
  const {
    data,
    error
  } =
    await supabase
      .from("child_pets")
      .select(
        "id, child_id, name, pet_type, happiness, hunger, cleanliness, level, experience, care_count, is_active, created_at"
      )
      .eq(
        "child_id",
        childId
      )
      .order(
        "created_at",
        {
          ascending: true
        }
      );

  if (error) {
    console.error(
      "Unable to load pets:",
      error
    );

    showToast(
      error.message ||
      "Unable to load pets."
    );

    pets = [];
    render();
    return;
  }

  pets =
    data || [];

  const activePet =
    pets.find(
      pet => pet.is_active
    );

  selectedPetId =
    activePet?.id ||
    pets[0]?.id ||
    "";

  render();
}

async function savePet(pet) {
  const {
    error
  } =
    await supabase
      .from("child_pets")
      .update({
        name: pet.name,
        happiness:
          clamp(pet.happiness),
        hunger:
          clamp(pet.hunger),
        cleanliness:
          clamp(pet.cleanliness),
        level:
          Number(pet.level || 1),
        experience:
          Number(pet.experience || 0),
        care_count:
          Number(pet.care_count || 0),
        is_active:
          pet.id === selectedPetId,
        updated_at:
          new Date().toISOString()
      })
      .eq("id", pet.id)
      .eq(
        "child_id",
        childId
      );

  if (error) {
    throw error;
  }
}

async function makeSelectedPetActive() {
  if (!selectedPetId) {
    return;
  }

  const {
    error
  } =
    await supabase
      .from("child_pets")
      .update({
        is_active: false,
        updated_at:
          new Date().toISOString()
      })
      .eq(
        "child_id",
        childId
      );

  if (error) {
    throw error;
  }

  const {
    error: activeError
  } =
    await supabase
      .from("child_pets")
      .update({
        is_active: true,
        updated_at:
          new Date().toISOString()
      })
      .eq(
        "id",
        selectedPetId
      )
      .eq(
        "child_id",
        childId
      );

  if (activeError) {
    throw activeError;
  }

  pets.forEach(pet => {
    pet.is_active =
      pet.id === selectedPetId;
  });
}

async function createPet(name) {
  const definition =
    petDefinition(
      pendingPetType || "puppy"
    );

  savePetNameButton.disabled = true;
  savePetNameButton.textContent =
    "Adopting...";

  try {
    const {
      data,
      error
    } =
      await supabase
        .from("child_pets")
        .insert({
          child_id: childId,
          name,
          pet_type:
            definition.type,
          happiness: 85,
          hunger: 80,
          cleanliness: 90,
          level: 1,
          experience: 0,
          care_count: 0,
          is_active: true
        })
        .select(
          "id, child_id, name, pet_type, happiness, hunger, cleanliness, level, experience, care_count, is_active, created_at"
        )
        .single();

    if (error) {
      throw error;
    }

    await supabase
      .from("child_pets")
      .update({
        is_active: false
      })
      .eq(
        "child_id",
        childId
      )
      .neq(
        "id",
        data.id
      );

    pets.forEach(pet => {
      pet.is_active = false;
    });

    pets.push(data);
    selectedPetId = data.id;

    closeNameModal();
    render();

    showToast(
      `${name} joined your family! 🎉`
    );

  } catch (error) {
    console.error(
      "Pet adoption error:",
      error
    );

    nameError.textContent =
      error?.message ||
      "Unable to adopt this pet.";

  } finally {
    savePetNameButton.disabled = false;
    savePetNameButton.textContent =
      "Adopt Pet";
  }
}

async function renamePet(name) {
  const pet =
    currentPet();

  if (!pet) {
    return;
  }

  savePetNameButton.disabled = true;
  savePetNameButton.textContent =
    "Saving...";

  try {
    const {
      error
    } =
      await supabase
        .from("child_pets")
        .update({
          name,
          updated_at:
            new Date().toISOString()
        })
        .eq(
          "id",
          pet.id
        )
        .eq(
          "child_id",
          childId
        );

    if (error) {
      throw error;
    }

    pet.name = name;

    closeNameModal();
    render();

    showToast(
      `Your pet is now named ${name}! ✨`
    );

  } catch (error) {
    console.error(
      "Rename pet error:",
      error
    );

    nameError.textContent =
      error?.message ||
      "Unable to rename this pet.";

  } finally {
    savePetNameButton.disabled = false;
    savePetNameButton.textContent =
      "Save Name";
  }
}

async function awardStars(amount) {
  if (
    !amount ||
    !window.ELCraftWorld?.award
  ) {
    return;
  }

  try {
    await window.ELCraftWorld.award({
      stars: amount,
      experience: amount * 2,
      coins: 0,
      source: "pet_shop",
      activityType: "pet_care",
      details: {
        petId: selectedPetId
      }
    });

    await loadStars();

  } catch (error) {
    console.warn(
      "Reward warning:",
      error
    );
  }
}

async function performCare(actionName) {
  const pet =
    currentPet();

  const action =
    ACTIONS[actionName];

  if (!pet || !action) {
    return;
  }

  pet.hunger =
    clamp(
      Number(pet.hunger || 0) +
      Number(action.hunger || 0)
    );

  pet.happiness =
    clamp(
      Number(pet.happiness || 0) +
      Number(action.happiness || 0)
    );

  pet.cleanliness =
    clamp(
      Number(pet.cleanliness || 0) +
      Number(action.cleanliness || 0)
    );

  pet.experience =
    Number(pet.experience || 0) +
    Number(action.xp || 0);

  pet.care_count =
    Number(pet.care_count || 0) + 1;

  const previousLevel =
    Number(pet.level || 1);

  const progress =
    calculateLevel(pet);

  pet.level =
    progress.level;

  pet.experience =
    progress.experience;

  animatePet();
  showThought(action.thought);
  render();

  try {
    await makeSelectedPetActive();
    await savePet(pet);

    if (
      pet.care_count %
      action.rewardEvery ===
      0
    ) {
      await awardStars(1);

      showToast(
        `${pet.name} earned you 1 star! ⭐`
      );
    }

    if (pet.level > previousLevel) {
      showToast(
        `${pet.name} reached Level ${pet.level}! 🎉`
      );
    }

  } catch (error) {
    console.error(
      "Pet care save error:",
      error
    );

    showToast(
      "The pet played, but progress could not be saved."
    );
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

backButton.addEventListener(
  "click",
  () => {
    window.location.href =
      "my-city.html";
  }
);

startAdoptionButton.addEventListener(
  "click",
  openAdoptionModal
);

adoptAnotherButton.addEventListener(
  "click",
  openAdoptionModal
);

closeAdoptionButton.addEventListener(
  "click",
  closeAdoptionModal
);

adoptionModal.addEventListener(
  "click",
  event => {
    if (
      event.target ===
      adoptionModal
    ) {
      closeAdoptionModal();
    }
  }
);

closeNameButton.addEventListener(
  "click",
  closeNameModal
);

nameModal.addEventListener(
  "click",
  event => {
    if (
      event.target ===
      nameModal
    ) {
      closeNameModal();
    }
  }
);

renamePetButton.addEventListener(
  "click",
  () => {
    renameMode = true;
    openNameModal();
  }
);

namePetForm.addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    const name =
      cleanPetName(
        petNameInput.value
      );

    if (!name) {
      nameError.textContent =
        "Please enter a pet name.";

      return;
    }

    nameError.textContent = "";

    if (renameMode) {
      await renamePet(name);
    } else {
      await createPet(name);
    }
  }
);

document
  .querySelectorAll(
    ".care-button"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      () => {
        performCare(
          button.dataset.action
        );
      }
    );
  });

petCharacter.addEventListener(
  "click",
  () => {
    performCare("play");
  }
);

document.addEventListener(
  "keydown",
  event => {
    if (event.key !== "Escape") {
      return;
    }

    closeAdoptionModal();
    closeNameModal();
  }
);

async function start() {
  const valid =
    await verifySession();

  if (!valid) {
    return;
  }

  await Promise.all([
    loadStars(),
    loadPets()
  ]);
}

start();
