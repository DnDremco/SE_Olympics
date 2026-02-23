const MIN = 0;
const MAX = 2200;

const MILESTONE_COUNT = 5;
const STEP = MAX / MILESTONE_COUNT;

const emojis = ["💪","⚡","🚀","👑"];
const colors = ["var(--goalLine)", "var(--goalLine2)", "var(--goalLine3)"];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function percent(points) {
  return ((points - MIN) / (MAX - MIN)) * 100;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
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

  const barW = bar.clientWidth;
  const pillW = pill.offsetWidth || 60;

  const fillEnd = (pc / 100) * barW;

  // pill binnen de fill: rechterkant 2px vóór fill-einde
  let left = fillEnd - 2 - pillW;

  // clamp binnen de bar (2px marge)
  left = clamp(left, 2, barW - pillW - 2);

  // verticaal centreren op de bar
  const top = bar.offsetTop + (bar.clientHeight / 2);

  pill.style.left = `${left}px`;
  pill.style.top = `${top}px`;
}

function setProgress(points) {
  const raw = Number(points) || 0;       // echte score (mag > MAX)
  const progress = clamp(raw, MIN, MAX); // voor bar/positie
  const pc = percent(progress);

  const fill = document.getElementById("fill");
  const text = document.getElementById("currentText");
  const bar = document.getElementById("bar");

  if (fill) fill.style.width = `${pc}%`;

  // pill tekst: echte score (ook boven doel)
  if (text) {
    text.textContent = raw > MAX ? `${raw} 🔥` : String(raw);
  }

  // aria: progress = max zodra je over doel heen gaat
  if (bar) bar.setAttribute("aria-valuenow", String(progress));

  requestAnimationFrame(() => positionPill(pc));
}

function animateProgressTo(targetPoints, durationMs = 3000) {
  const endRaw = Number(targetPoints) || 0;
  const endProgress = clamp(endRaw, MIN, MAX);

  const start = performance.now();
  const startPoints = 0;

  function frame(now) {
    const elapsed = now - start;
    const t = clamp(elapsed / durationMs, 0, 1);
    const eased = easeOutCubic(t);

    const current = startPoints + (endProgress - startPoints) * eased;

    // tijdens animatie loopt alles mee tot endProgress
    setProgress(Math.round(current));

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      // eindstand: bar op max, pill toont echte score
      setProgress(endRaw);
    }
  }

  requestAnimationFrame(frame);
}

async function loadPoints() {
  try {
    const res = await fetch("points.json", { cache: "no-store" });
    const data = await res.json();
    const points = Number(data.points ?? 0);
    animateProgressTo(points, 3000);
  } catch (e) {
    animateProgressTo(0, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Teksten
  const goalText = document.getElementById("goalText");
  const scaleMin = document.getElementById("scaleMin");
  const scaleMax = document.getElementById("scaleMax");

  if (goalText) goalText.textContent = MAX;
  if (scaleMin) scaleMin.textContent = MIN;
  if (scaleMax) scaleMax.textContent = MAX;

  // ARIA
  const bar = document.getElementById("bar");
  if (bar) {
    bar.setAttribute("aria-valuemin", String(MIN));
    bar.setAttribute("aria-valuemax", String(MAX));
  }

  renderMilestones();
  loadPoints();

  window.addEventListener("resize", () => {
    const current = Number(document.getElementById("currentText")?.textContent ?? 0);
    setProgress(current);
  });
});
