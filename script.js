const MIN = 0;
const MAX = 2000;
const STEP = 200;

// Emoji’s + kleuren per milestone (200, 400, ... 2000)
const milestoneConfig = [
  { at: 200,  emoji: "🌱", color: "var(--goalLine3)", label: "Warm-up" },
  { at: 400,  emoji: "🔥", color: "var(--goalLine)",  label: "Lekker bezig" },
  { at: 600,  emoji: "💪", color: "var(--goalLine2)", label: "Sterk" },
  { at: 800,  emoji: "⚡", color: "var(--goalLine)",  label: "Boost" },
  { at: 1000, emoji: "🏁", color: "var(--goalLine2)", label: "Halverwege" },
  { at: 1200, emoji: "🚀", color: "var(--goalLine3)", label: "Gaan!" },
  { at: 1400, emoji: "🧠", color: "var(--goalLine2)", label: "Focus" },
  { at: 1600, emoji: "🌟", color: "var(--goalLine)",  label: "Top" },
  { at: 1800, emoji: "👑", color: "var(--goalLine2)", label: "Bijna" },
  { at: 2000, emoji: "🎉", color: "var(--goalLine3)", label: "Doel!" },
];

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function percent(points){
  return ((points - MIN) / (MAX - MIN)) * 100;
}

function renderMilestones(){
  const el = document.getElementById("milestones");
  el.innerHTML = "";

  // Als je liever automatisch elke 200 wil genereren:
  // maar met emoji’s is handmatig vaak leuker, dus config hierboven.
  milestoneConfig.forEach(m => {
    const x = (m.at / MAX) * 100;

    const wrap = document.createElement("div");
    wrap.className = "milestone";
    wrap.style.left = `${x}%`;

  wrap.innerHTML = `
    <span class="emoji">${m.emoji}</span>
    ${m.at !== MAX ? `<div class="line" style="background:${m.color}"></div>` : ``}
    ${m.at !== MAX ? `<div class="label">${m.at}</div>` : ``}
  `;

    el.appendChild(wrap);
  });
}

function setProgress(points){
  const p = clamp(points, MIN, MAX);
  const pc = percent(p);

  const fill = document.getElementById("fill");
  const bubble = document.getElementById("bubble");
  const bar = document.querySelector(".bar");

  fill.style.width = `${pc}%`;
  bubble.textContent = `${p} punten`;
  bubble.style.left = `${pc}%`;

  bar.setAttribute("aria-valuenow", String(p));
}

async function loadPoints(){
  try{
    const res = await fetch("points.json", { cache: "no-store" });
    const data = await res.json();
    const points = Number(data.points ?? 0);
    setProgress(points);
  }catch(e){
    // fallback als points.json ontbreekt
    setProgress(0);
  }
}

renderMilestones();
loadPoints();
