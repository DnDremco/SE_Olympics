const MIN = 0;
const MAX = 2000;
const STEP = 400;

// Emoji’s voor de tussenmijlpalen (400, 800, 1200, 1600). 2000 wordt 🏆
const emojis = ["💪","⚡","🚀","👑"];
const colors = ["var(--goalLine)","var(--goalLine2)","var(--goalLine3)"];

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function percent(points){
  return ((points - MIN) / (MAX - MIN)) * 100;
}

function renderMilestones(){
  const el = document.getElementById("milestones");
  el.innerHTML = "";

  let emojiIndex = 0;

  for(let at = STEP; at <= MAX; at += STEP){
    const x = (at / MAX) * 100;

    const wrap = document.createElement("div");
    wrap.className = "milestone";
    wrap.style.left = `${x}%`;

    const isLast = at === MAX;

    wrap.innerHTML = `
      <span class="emoji">${isLast ? "🏆" : emojis[emojiIndex % emojis.length]}</span>
      ${!isLast ? `<div class="line" style="background:${colors[emojiIndex % colors.length]}"></div>` : ``}
      ${!isLast ? `<div class="label">${at}</div>` : ``}
    `;

    if(!isLast) emojiIndex++;

    el.appendChild(wrap);
  }
}

function setProgress(points){
  const p = clamp(points, MIN, MAX);
  const pc = percent(p);

  const fill = document.getElementById("fill");
  const bar = document.querySelector(".bar");

  const pill = document.getElementById("currentPill");
  const text = document.getElementById("currentText");

  fill.style.width = `${pc}%`;
  text.textContent = p; // alleen getal (kan ook `${p} punten`)

  // Capsule positioneren: center op de huidige % plek,
  // maar binnen de bar houden zodat hij niet buiten valt.
  const barRect = bar.getBoundingClientRect();
  const pillWidth = pill.offsetWidth || 60;

  // px positie in de bar
  let x = (pc / 100) * barRect.width;

  // clamp zodat capsule niet buiten de bar gaat
  const half = pillWidth / 2;
  x = Math.max(half + 2, Math.min(barRect.width - half - 2, x));

  // left in pixels binnen bar
  pill.style.left = `${x}px`;

  bar.setAttribute("aria-valuenow", String(p));
}


async function loadPoints(){
  try{
    const res = await fetch("points.json", { cache: "no-store" });
    const data = await res.json();
    const points = Number(data.points ?? 0);
    setProgress(points);
  }catch(e){
    setProgress(0);
  }
}

renderMilestones();
loadPoints();
