const wheel = document.getElementById("wheel");
const playersList = document.getElementById("playersList");
const playerInput = document.getElementById("playerInput");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const resetBtn = document.getElementById("resetBtn");
const clearBtn = document.getElementById("clearBtn");
const spinBtn = document.getElementById("spinBtn");
const playerCountEl = document.getElementById("playerCount");
const winnerBadgeEl = document.getElementById("winnerBadge");

let players = ["سارة", "أحمد", "ليلى", "محمود", "نور", "حسن"];
let currentRotation = 0;
let isSpinning = false;

function updateStats() {
  playerCountEl.textContent = players.length;
  winnerBadgeEl.textContent = players.length ? "مستعد" : "-";
  if (players.length === 0) {
    spinBtn.disabled = true;
  } else {
    spinBtn.disabled = isSpinning;
  }
}

function renderWheel() {
  wheel.innerHTML = "";
  if (!players.length) {
    wheel.style.background = "radial-gradient(circle, rgba(255,255,255,0.08), rgba(255,255,255,0.04))";
    wheel.style.border = "16px solid rgba(255,255,255,0.08)";
    return;
  }

  wheel.style.background = "";
  wheel.style.border = "";
  const segmentAngle = 360 / players.length;
  const radius = 155;

  players.forEach((player, index) => {
    const label = document.createElement("div");
    label.className = "wheel-item";
    label.textContent = player;

    const angle = index * segmentAngle + segmentAngle / 2;
    const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
    const y = Math.sin((angle - 90) * Math.PI / 180) * radius;

    label.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
    wheel.appendChild(label);
  });
}

function renderPlayersList() {
  playersList.innerHTML = "";

  if (!players.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "player-item";
    emptyItem.innerHTML = `<span class="player-name">لا يوجد لاعبين</span>`;
    playersList.appendChild(emptyItem);
    return;
  }

  players.forEach((player, index) => {
    const li = document.createElement("li");
    li.className = "player-item";

    li.innerHTML = `
      <span class="player-name">${player}</span>
      <button class="delete-btn" data-index="${index}">حذف</button>
    `;

    playersList.appendChild(li);
  });
}

function addPlayer() {
  const value = playerInput.value.trim();

  if (!value) {
    playerInput.focus();
    return;
  }

  players.push(value);
  playerInput.value = "";
  playerInput.focus();

  renderWheel();
  renderPlayersList();
  updateStats();
}

function removePlayer(index) {
  players.splice(index, 1);
  renderWheel();
  renderPlayersList();
  updateStats();
}

function clearPlayers() {
  players = [];
  renderWheel();
  renderPlayersList();
  updateStats();
}

function spinWheel() {
  if (!players.length || isSpinning) return;

  isSpinning = true;
  spinBtn.disabled = true;
  const winnerIndex = Math.floor(Math.random() * players.length);
  const segmentAngle = 360 / players.length;
  const winnerAngle = (winnerIndex + 0.5) * segmentAngle;

  const extraRotations = 360 * 6;
  currentRotation += extraRotations + (360 - winnerAngle) + 30;
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    winnerBadgeEl.textContent = players[winnerIndex];
    isSpinning = false;
    spinBtn.disabled = false;
    updateStats();
  }, 4300);
}

function bindEvents() {
  addPlayerBtn.addEventListener("click", addPlayer);
  playerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addPlayer();
  });

  playersList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-btn");
    if (!button) return;
    const index = Number(button.dataset.index);
    removePlayer(index);
  });

  clearBtn.addEventListener("click", clearPlayers);
  resetBtn.addEventListener("click", () => {
    winnerBadgeEl.textContent = "-";
    currentRotation = 0;
    wheel.style.transform = "rotate(0deg)";
  });

  spinBtn.addEventListener("click", spinWheel);
}

renderWheel();
renderPlayersList();
updateStats();
bindEvents();
