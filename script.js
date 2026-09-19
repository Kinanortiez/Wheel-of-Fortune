const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const entryInput = document.getElementById("entryInput");
const entryList = document.getElementById("entryList");
const spinBtn = document.getElementById("spinBtn");
const historyList = document.getElementById("historyList");
const statusEl = document.getElementById("status");
const addBtn = document.getElementById("addBtn");
const resetBtn = document.getElementById("resetBtn");

const palette = [
  "#ffb703", "#fb8500", "#ff7b00", "#6a4c93",
  "#2a9d8f", "#264653", "#ef476f", "#06d6a0",
  "#90be6d", "#c1121f", "#3a86ff", "#8338ec"
];

const defaultEntries = [
  "Free Coffee",
  "VIP Pass",
  "Gift Card",
  "Movie Night",
  "Mystery Box",
  "Bonus Round",
  "Weekend Escape",
  "Take Home Prize"
];

const state = {
  entries: [...defaultEntries],
  winnerHistory: [],
  rotation: 0,
  spinning: false,
  audioContext: null
};

function clampText(text, maxLen = 18) {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
}

function drawWheel() {
  const entries = state.entries;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 220;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(state.rotation);

  if (!entries.length) {
    ctx.beginPath();
    ctx.fillStyle = "#1a2234";
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.stroke();

    ctx.fillStyle = "#f8f5ec";
    ctx.font = "700 26px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No prizes left", 0, 10);
    ctx.restore();
    return;
  }

  const segmentAngle = (Math.PI * 2) / entries.length;
  const startAngle = -Math.PI / 2;

  entries.forEach((entry, index) => {
    const a0 = startAngle + segmentAngle * index;
    const a1 = a0 + segmentAngle;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, a0, a1);
    ctx.closePath();
    ctx.fillStyle = palette[index % palette.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.rotate(a0 + segmentAngle / 2);

    const label = clampText(entry, 16);
    const textRadius = radius * 0.66;

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 18px sans-serif";
    ctx.fillText(label, textRadius, 6);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.fillStyle = "#1a2436";
  ctx.arc(0, 0, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = "#f8c659";
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderEntries() {
  entryList.innerHTML = "";

  if (!state.entries.length) {
    const empty = document.createElement("div");
    empty.className = "entry-item";
    empty.innerHTML = "<span>All prizes used</span>";
    entryList.appendChild(empty);
    spinBtn.disabled = true;
    return;
  }

  spinBtn.disabled = state.spinning || state.entries.length < 2;

  state.entries.forEach((entry, index) => {
    const item = document.createElement("div");
    item.className = "entry-item";

    const text = document.createElement("span");
    text.textContent = entry;

    const button = document.createElement("button");
    button.className = "remove-btn";
    button.type = "button";
    button.textContent = "×";
    button.setAttribute("aria-label", `Remove ${entry}`);
    button.addEventListener("click", () => {
      state.entries.splice(index, 1);
      renderEntries();
      drawWheel();
    });

    item.appendChild(text);
    item.appendChild(button);
    entryList.appendChild(item);
  });
}

function renderHistory() {
  historyList.innerHTML = "";

  if (!state.winnerHistory.length) {
    const li = document.createElement("li");
    li.innerHTML = "<span>No winners yet</span><small>—</small>";
    historyList.appendChild(li);
    return;
  }

  state.winnerHistory.slice(0, 8).forEach((winner, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${winner}</span><small>#${idx + 1}</small>`;
    historyList.appendChild(li);
  });
}

function playTone(frequency, duration, type = "triangle", volume = 0.05, delay = 0) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  if (!state.audioContext) {
    state.audioContext = new AudioCtx();
  }

  const startAt = state.audioContext.currentTime + delay;
  const osc = state.audioContext.createOscillator();
  const gain = state.audioContext.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain);
  gain.connect(state.audioContext.destination);

  osc.start(startAt);
  osc.stop(startAt + duration);
}

function spinWheel() {
  if (state.spinning || state.entries.length < 2) return;

  state.spinning = true;
  spinBtn.disabled = true;
  statusEl.textContent = "Spinning...";

  const chosenIndex = Math.floor(Math.random() * state.entries.length);
  const chosenPrize = state.entries[chosenIndex];
  const segmentAngle = (Math.PI * 2) / state.entries.length;
  const startAngle = -Math.PI / 2;
  const chosenCenterAngle = startAngle + (chosenIndex + 0.5) * segmentAngle;

  const currentRotation = state.rotation;
  const spinCount = 7 + Math.random() * 2;
  const targetRotation = currentRotation + spinCount * Math.PI * 2 + (-Math.PI / 2 - chosenCenterAngle);

  const startTime = performance.now();
  const duration = 4200;

  playTone(180, 0.16, "triangle", 0.07);
  playTone(260, 0.2, "sine", 0.05, 0.12);

  function animate(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    state.rotation = currentRotation + (targetRotation - currentRotation) * eased;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      state.rotation = targetRotation;
      state.spinning = false;
      state.entries.splice(chosenIndex, 1);
      state.winnerHistory.unshift(chosenPrize);

      renderEntries();
      renderHistory();
      drawWheel();

      statusEl.textContent = `Winner: ${chosenPrize}`;

      playTone(440, 0.18, "triangle", 0.08);
      playTone(660, 0.26, "sine", 0.08, 0.1);
      playTone(880, 0.24, "triangle", 0.07, 0.18);

      spinBtn.disabled = state.entries.length < 2;
    }
  }

  requestAnimationFrame(animate);
}

function addEntry() {
  const value = entryInput.value.trim();
  if (!value) return;

  state.entries.push(value);
  entryInput.value = "";
  renderEntries();
  drawWheel();

  if (state.entries.length >= 2) {
    spinBtn.disabled = false;
  }
}

function resetGame() {
  state.entries = [...defaultEntries];
  state.winnerHistory = [];
  state.rotation = 0;
  state.spinning = false;

  renderEntries();
  renderHistory();
  drawWheel();
  statusEl.textContent = "Ready to spin";
  spinBtn.disabled = false;
}

addBtn.addEventListener("click", addEntry);
spinBtn.addEventListener("click", spinWheel);
resetBtn.addEventListener("click", resetGame);

entryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addEntry();
  }
});

renderEntries();
renderHistory();
drawWheel();
spinBtn.disabled = false;
