\
// Telegram init
const tg = window.Telegram?.WebApp;
tg?.ready?.();

// --- STATE ---
const state = JSON.parse(localStorage.getItem('b2b-state') || '{}');
let coins = state.coins || 0;
let perClick = state.perClick || 1;
let perSec = state.perSec || 0;
let level = state.level || 1;

// --- DOM ---
const coinsEl = document.getElementById('coins');
const levelEl = document.getElementById('level');
const belly = document.getElementById('belly');
const buyPower = document.getElementById('buyPower');
const buyAuto = document.getElementById('buyAuto');
const resetBtn = document.getElementById('reset');
const shareBtn = document.getElementById('share');
const bellyWrap = document.querySelector('.belly-wrap');

// --- AUDIO (cache-bust & unlock) ---
const clickAudio = new Audio('./click.wav?v=1');
clickAudio.preload = 'auto';
clickAudio.volume = 0.9;
let audioUnlocked = false;
const unlock = () => {
  if (audioUnlocked) return;
  clickAudio.play().then(() => {
    clickAudio.pause(); clickAudio.currentTime = 0; audioUnlocked = true;
  }).catch(()=>{});
};
document.addEventListener('pointerdown', unlock, { once: true });

// --- UTIL ---
function save() {
  localStorage.setItem('b2b-state', JSON.stringify({ coins, perClick, perSec, level }));
}
function render() {
  coinsEl.textContent = coins.toLocaleString('ru-RU');
  levelEl.textContent = level;
  buyPower.disabled = coins < 50;
  buyAuto.disabled = coins < 200;
}
render();

// particles
function spawnParticle(x, y, text) {
  const p = document.createElement('span');
  p.className = 'particle';
  p.textContent = `+${text}`;
  p.style.left = x + 'px';
  p.style.top = y + 'px';
  bellyWrap.appendChild(p);
  setTimeout(() => p.remove(), 700);
}

// anti-cheat cps
let clicksThisSecond = 0;
setInterval(() => { clicksThisSecond = 0; }, 1000);

// --- CLICK HANDLER ---
belly.addEventListener('click', (e) => {
  if (clicksThisSecond > 20) return;
  clicksThisSecond++;

  coins += perClick;

  try { tg?.HapticFeedback?.impactOccurred?.('light'); } catch (_) {}

  try { clickAudio.currentTime = 0; clickAudio.play(); } catch (_) {}

  belly.classList.add('tap');
  setTimeout(() => belly.classList.remove('tap'), 120);

  const rect = bellyWrap.getBoundingClientRect();
  const x = (e.clientX || (rect.left + rect.width/2)) - rect.left;
  const y = (e.clientY || (rect.top + rect.height/2)) - rect.top;
  spawnParticle(x, y, perClick);

  if (coins > (level * 1000)) level++;
  render(); save();
});

// --- UPGRADES ---
buyPower.addEventListener('click', () => {
  if (coins >= 50) { coins -= 50; perClick += 1; }
  render(); save();
});

buyAuto.addEventListener('click', () => {
  if (coins >= 200) { coins -= 200; perSec += 1; }
  render(); save();
});

setInterval(() => {
  if (perSec > 0) { coins += perSec; render(); save(); }
}, 1000);

resetBtn.addEventListener('click', () => {
  coins = 0; perClick = 1; perSec = 0; level = 1; render(); save();
});

shareBtn.addEventListener('click', () => {
  const ref = tg?.initDataUnsafe?.user?.id || Math.floor(Math.random()*1e9);
  const url = `https://t.me/YOUR_BOT?start=ref_${ref}`;
  if (tg?.shareUrl) tg.shareUrl(url);
  else navigator.clipboard.writeText(url);
  alert('Ссылка скопирована! Пригласи друга и получи бонус.');
});
