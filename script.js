/* ===========================================================
   КОНФИГ
   =========================================================== */
const CONFIG = {
  girlfriendName: "КСЮША",

  reasons: [
    "Обладаешь потрясающим чувством юмора и харизмой",
    "Добра и внимательна ко всем без исключения",
    "У тебя чудесный, звонкий словно бегущий ручей, смех",
    "Скромная и стеснительная при всех, чудная и уморительная наедине с близкими",
    "Элегантно выходишь на лёд как Камила Валиева",
    "У тебя шикарный вкус, который проявляется во всем: от музыки и фильмов, до твоих повседневных нарядов",
    "Знаешь автора любой песни, потому что у тебя КМС по квизам",
    "У тебя записаны все даты мероприятий и все предстоящие дела, тк ты очень занятая и организованная тётя",
    "Прекрасно танцуешь!! У тебя получается выглядеть органично и в хип-хопе, и в контемпе, и в танце Питера Паркера",
    "Ты самая красиваяяя ＼(^o^)／"
  ],

  // Дата начала отношений для счётчика "DAYS TOGETHER" (год-месяц-день)
  // Если не хочешь использовать счётчик — оставь null
  relationshipStartDate: "2025-06-15", // например: "2023-05-14"

  // Главное поздравление на финальном экране
  finalMessage: "Здесь напиши главное поздравление — то самое, ради чего весь сайт. Можно длинное, можно короткое. Это финал игры.",

  // Текст в шапке финального экрана
  finalLabel: "GAME COMPLETE!",

  // Включить звуковые эффекты (простые пищалки через Web Audio API)
  soundEnabled: true
};

/* ===========================================================
   ИНИЦИАЛИЗАЦИЯ КОНТЕНТА ИЗ КОНФИГА
   =========================================================== */
document.getElementById("girlfriend-name").textContent = CONFIG.girlfriendName;
document.getElementById("final-message").textContent = CONFIG.finalMessage;
document.getElementById("final-label").textContent = CONFIG.finalLabel;

if (CONFIG.relationshipStartDate) {
  const start = new Date(CONFIG.relationshipStartDate);
  const now = new Date();
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  document.getElementById("stat-days").textContent = days >= 0 ? days : "???";
} else {
  document.getElementById("stat-days").textContent = "∞";
}

/* ===========================================================
   ПРОСТОЙ ЗВУК (Web Audio API, без файлов)
   =========================================================== */
let audioCtx = null;
function playBeep(freq = 600, duration = 0.08, type = "square") {
  if (!CONFIG.soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    /* audio not available, fail silently */
    console.warn("Audio not available");
  }
}

function playSelectSound() { playBeep(440, 0.06, "square"); }
function playUnlockSound() {
  playBeep(523, 0.08, "square");
  setTimeout(() => playBeep(659, 0.08, "square"), 90);
  setTimeout(() => playBeep(784, 0.12, "square"), 180);
}

/* ===========================================================
   НАВИГАЦИЯ МЕЖДУ ЭКРАНАМИ
   =========================================================== */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active", "fade-in");
  });
  const target = document.getElementById(id);
  target.classList.add("active");
  requestAnimationFrame(() => target.classList.add("fade-in"));
  window.scrollTo(0, 0);

  if (id === "screen-menu" && typeof setMenuFocus === "function") {
    setMenuFocus(menuFocusIndex);
  }
}

document.querySelectorAll(".menu-card").forEach(card => {
  card.addEventListener("click", () => {
    playSelectSound();
    showScreen(card.dataset.target);
  });
});

/* ===========================================================
   МЕНЮ: НАВИГАЦИЯ СТРЕЛКАМИ (2 колонки x 2 ряда)
   =========================================================== */
const menuCards = Array.from(document.querySelectorAll(".menu-card"));
const MENU_COLS = 2;
let menuFocusIndex = 0;

function setMenuFocus(index) {
  menuFocusIndex = ((index % menuCards.length) + menuCards.length) % menuCards.length;
  menuCards.forEach((card, i) => {
    card.classList.toggle("kb-focused", i === menuFocusIndex);
  });
}

function moveMenuFocus(dir) {
  let next = menuFocusIndex;
  if (dir === "left") next -= 1;
  if (dir === "right") next += 1;
  if (dir === "up") next -= MENU_COLS;
  if (dir === "down") next += MENU_COLS;
  setMenuFocus(next);
  playSelectSound();
}

// Запоминаем, по какой карточке кликнули мышью — чтобы стрелки продолжали оттуда
menuCards.forEach((card, i) => {
  card.addEventListener("click", () => {
    menuFocusIndex = i;
  });
});

document.querySelectorAll(".back-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    playSelectSound();
    showScreen(btn.dataset.target);
  });
});

/* ===========================================================
   BOOT SCREEN: прогресс-бар + появление заголовка
   =========================================================== */
let bootInterval = null;

function runBootSequence() {
  const fill = document.getElementById("progress-fill");
  const bootText = document.getElementById("boot-text");
  const titleBlock = document.getElementById("title-block");
  const loaderBlock = document.getElementById("loader-block");
  const startBtn = document.getElementById("btn-start");

  // Полный сброс состояния — важно для повторного запуска по кнопке PLAY AGAIN
  if (bootInterval) clearInterval(bootInterval);
  let progress = 0;
  fill.style.width = "0%";
  bootText.innerHTML = 'SYSTEM LOADING<span class="dots">...</span>';
  startBtn.style.visibility = "hidden";
  titleBlock.classList.remove("revealed");
  loaderBlock.classList.remove("hidden");

  bootInterval = setInterval(() => {
    progress += Math.random() * 12 + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(bootInterval);
      bootInterval = null;
      bootText.textContent = "LOADED!";
      setTimeout(() => {
        // Замещаем загрузчик приветственной надписью на том же месте (кросс-фейд)
        loaderBlock.classList.add("hidden");
        titleBlock.classList.add("revealed");
        startBtn.style.visibility = "visible";
        playUnlockSound();
      }, 300);
    }
    fill.style.width = progress + "%";
  }, 120);
}

document.getElementById("btn-start").addEventListener("click", () => {
  playSelectSound();
  launchConfetti();
  setTimeout(() => showScreen("screen-menu"), 400);
});

/* ===========================================================
   TOP REASONS: карточки с навигацией
   =========================================================== */
let currentReason = 0;

function renderReasonProgress() {
  const container = document.getElementById("reasons-progress");
  container.innerHTML = "";
  CONFIG.reasons.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "tab-dot" + (i === currentReason ? " active" : "") + (i < currentReason ? " seen" : "");
    dot.addEventListener("click", () => {
      currentReason = i;
      updateReasonCard();
    });
    container.appendChild(dot);
  });
}

function updateReasonCard() {
  const card = document.getElementById("reason-card");
  const numberEl = document.getElementById("reason-number");
  const textEl = document.getElementById("reason-text");
  const countEl = document.getElementById("reason-count");

  card.classList.remove("flip");
  requestAnimationFrame(() => {
    card.classList.add("flip");
  });

  const num = String(currentReason + 1).padStart(3, "0");
  numberEl.textContent = "#" + num;
  textEl.textContent = CONFIG.reasons[currentReason];
  countEl.textContent = (currentReason + 1) + " / " + CONFIG.reasons.length;

  renderReasonProgress();

  if (currentReason === CONFIG.reasons.length - 1) {
    setTimeout(() => {
      launchFireworks();
      playUnlockSound();
    }, 200);
  } else {
    playSelectSound();
  }
}

document.getElementById("reason-next").addEventListener("click", () => {
  currentReason = Math.min(CONFIG.reasons.length - 1, currentReason + 1);
  updateReasonCard();
});

document.getElementById("reason-prev").addEventListener("click", () => {
  currentReason = Math.max(0, currentReason - 1);
  updateReasonCard();
});

/* ===========================================================
   PLAY AGAIN — возврат на boot screen
   =========================================================== */
document.getElementById("btn-replay").addEventListener("click", () => {
  currentReason = 0;
  showScreen("screen-boot");
  runBootSequence();
});

/* ===========================================================
   CANVAS FX: КОНФЕТТИ + ФЕЙЕРВЕРК
   =========================================================== */
const canvas = document.getElementById("fx-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const FX_COLORS = ["#ff6fd8", "#00f5ff", "#ffe600", "#b06fff"];
let particles = [];
let fxRunning = false;

function launchConfetti() {
  const count = 90;
  for (let i = 0; i < count; i++) {
    particles.push({
      type: "confetti",
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      size: 4 + Math.random() * 5,
      color: FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)],
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 10,
      life: 220
    });
  }
  startFxLoop();
}

function launchFireworks() {
  const bursts = 5;
  for (let b = 0; b < bursts; b++) {
    setTimeout(() => {
      const cx = canvas.width * (0.2 + Math.random() * 0.6);
      const cy = canvas.height * (0.2 + Math.random() * 0.4);
      const color = FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)];
      const particleCount = 40;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 3;
        particles.push({
          type: "spark",
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 2,
          color: color,
          life: 60 + Math.random() * 20,
          maxLife: 80
        });
      }
    }, b * 350);
  }
  startFxLoop();
}

function startFxLoop() {
  if (fxRunning) return;
  fxRunning = true;
  requestAnimationFrame(fxLoop);
}

function fxLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    if (p.type === "confetti") {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      p.rotation += p.vr;
      p.life--;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    } else if (p.type === "spark") {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.life--;

      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  particles = particles.filter(p => p.life > 0 && p.y < canvas.height + 50);

  if (particles.length > 0) {
    requestAnimationFrame(fxLoop);
  } else {
    fxRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* ===========================================================
   КЛАВИАТУРНАЯ НАВИГАЦИЯ (доп. удобство для десктопа)
   =========================================================== */
document.addEventListener("keydown", (e) => {
  const activeScreen = document.querySelector(".screen.active");
  if (!activeScreen) return;
  const screenId = activeScreen.id;

  if (screenId === "screen-boot" && (e.key === "Enter" || e.key === " ")) {
    document.getElementById("btn-start").click();
  }

  if (screenId === "screen-reasons") {
    if (e.key === "ArrowRight") document.getElementById("reason-next").click();
    if (e.key === "ArrowLeft") document.getElementById("reason-prev").click();
  }

  if (screenId === "screen-menu") {
    if (e.key === "ArrowRight") { e.preventDefault(); moveMenuFocus("right"); }
    if (e.key === "ArrowLeft") { e.preventDefault(); moveMenuFocus("left"); }
    if (e.key === "ArrowUp") { e.preventDefault(); moveMenuFocus("up"); }
    if (e.key === "ArrowDown") { e.preventDefault(); moveMenuFocus("down"); }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      menuCards[menuFocusIndex].click();
    }
  }

  if (screenId === "screen-final" && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    document.getElementById("btn-replay").click();
  }

  if (screenId !== "screen-menu") {
    if (e.key === "Escape") {
      const backBtn = activeScreen.querySelector(".back-btn");
      if (backBtn) backBtn.click();
    }
  }
});

/* ===========================================================
   СТАРТ
   =========================================================== */
renderReasonProgress();
updateReasonCard();
showScreen("screen-boot");
runBootSequence();