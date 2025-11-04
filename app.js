const tg = window.Telegram?.WebApp;
tg?.ready?.();

const state = JSON.parse(localStorage.getItem('b2b-state') || '{}');
let coins = state.coins || 0;
let perClick = state.perClick || 1;
let perSec = state.perSec || 0;
let level = state.level || 1;

const coinsEl = document.getElementById('coins');
const levelEl = document.getElementById('level');
const belly = document.getElementById('belly');
const tapPlus = document.getElementById('tapplus');
const buyPower = document.getElementById('buyPower');
const buyAuto = document.getElementById('buyAuto');
const resetBtn = document.getElementById('reset');
const shareBtn = document.getElementById('share');

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

// anti-cheat: rough CPS cap
let clicksThisSecond = 0;
setInterval(() => { clicksThisSecond = 0; }, 1000);

belly.addEventListener('click', () => {
  if (clicksThisSecond > 20) return; // 20 clicks/sec cap
  clicksThisSecond++;

  coins += perClick;
  tapPlus.style.opacity = 1;
  tapPlus.style.transform = 'translate(-50%,-60%)';
  belly.classList.add('tap');
  setTimeout(() => {
    tapPlus.style.opacity = 0;
    tapPlus.style.transform = 'translate(-50%,-50%)';
    belly.classList.remove('tap');
  }, 120);
  if (coins > (level * 1000)) level++;
  render(); save();
});

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
