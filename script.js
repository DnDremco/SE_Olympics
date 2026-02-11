const MIN = 0;
const MAX = 2000;
const STEP = 400;

// Emoji’s voor de tussenmijlpalen (400, 800, 1200, 1600). 2000 wordt 🏆
const emojis = ["💪","⚡","🚀","👑"];
const colors = ["var(--goalLine)", "var(--goalLine2)", "var(--goalLine3)"];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function percent(points) {
  return ((points - MIN) / (MAX - MIN)) * 100;
}

function renderMilestones() {
  const el = document.getElementById("milestones");
  if (!el) return;

  el.innerHTML = "";

  let emojiIndex = 0;

  for (let at = STEP; at <= MAX; at += STEP) {
    const x = (at / MAX) * 100;
    const isLast = at === MAX;

    const wrap = document.createElement("div");
    wrap.className = "milestone";
    wrap.style.left = `${x}%`;

    wrap.innerHTML = `
      <span class="emoji">${isLast ? "🏆" : emojis[emojiIndex % emojis.length]}</span>
      ${!isLast ? `<div class="line" style="background:${colors[emojiIndex % colors.length]}"></div>` : ``}
      ${!isLast ? `<div class="label">${at}</div>` : ``}
    `;

    if (!isLast) emojiIndex++;
    el.appendChild(wrap);
  }
}

function positionPill(pc) {
  const bar = document.getElementById("bar");
  const pill = document.getElementById("currentPill");
  if (!bar || !pill) return;

  const barW = bar.clientWidth;          // stabieler dan getBoundingClientRect voor width
  const pillW = pill.offsetWidth || 60;

  let x = (pc / 100) * barW;

  // clamp zodat capsule binnen de bar blijft
  const half = pillW / 2;
  x = clamp(x, half + 2, barW - half - 2);

  pill.style.left = `${x}px`;
}

function setProgress(points) {
  const p = clamp(points, MIN, MAX);
  const pc = percent(p);

  const fill = document.getElementById("fill");
  const text = document.getElementById("currentText");
  const bar = document.getElementById("bar");

  if (fill) fill.style.width = `${pc}%`;
  if (text) text.textContent = String(p);
  if (bar) bar.setAttribute("aria-valuenow", String(p));

  // Positioneer pill pas na layout (zodat offsetWidth klopt)
  requestAnimationFrame(() => positionPill(pc));
}

async function loadPoints() {
  try {
    const res = await fetch("points.json", { cache: "no-store" });
    const data = await res.json();
    const points = Number(data.points ?? 0);
    setProgress(points);
  } catch (e) {
    setProgress(0);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderMilestones();
  loadPoints();

  // Bij resize/rotatie pill opnieuw positioneren
  window.addEventListener("resize", () => {
    const current = Number(document.getElementById("currentText")?.textContent ?? 0);
    setProgress(current);
  });
});
