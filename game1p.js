/* ============================================================
   GAME.JS v6 — MediaPipe Tasks Vision (Lokal)
   ============================================================
   - Pakai vision_bundle.mjs + hand_landmarker.task (lokal)
   - Loading cepat (2-3 detik)
   - Skeleton tangan + pinch indicator
   - Semua fitur game tetap sama
   ============================================================ */

import { HandLandmarker, FilesetResolver } from './vision_bundle.mjs';

/* ============================================================
   1. PALETTE KONTRAS
   ============================================================ */
const CONTRAST_PALETTE = [
    '#DC2626', '#F97316', '#FACC15', '#16A34A', '#2563EB', '#9333EA', '#64748B'
];

const DEFAULT_FILL = '#ffffff';

/* ============================================================
   2. SOUND FX
   ============================================================ */
class SoundFX {
    constructor() { this.ctx = null; }
    init() {
        if (!this.ctx) {
            try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) {}
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
    _tone(freq, start, dur, type = 'sine', vol = 0.2) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(vol, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.02);
    }
    playPinch() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this._tone(320, now, 0.1, 'sine', 0.15);
        this._tone(750, now + 0.05, 0.08, 'sine', 0.12);
    }
    playCorrect() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this._tone(660, now, 0.1, 'sine', 0.18);
        this._tone(880, now + 0.08, 0.1, 'sine', 0.18);
        this._tone(1320, now + 0.16, 0.18, 'sine', 0.16);
    }
    playWrong() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this._tone(280, now, 0.15, 'sawtooth', 0.15);
        this._tone(200, now + 0.1, 0.18, 'sawtooth', 0.13);
    }
    playSame() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this._tone(400, now, 0.08, 'triangle', 0.12);
    }
    playLock() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this._tone(880, now, 0.08, 'sine', 0.18);
        this._tone(1320, now + 0.06, 0.1, 'sine', 0.15);
    }
    playUnlock() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this._tone(660, now, 0.1, 'triangle', 0.18);
        this._tone(440, now + 0.08, 0.12, 'triangle', 0.15);
    }
    playResetAll() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this._tone(400, now, 0.1, 'sine', 0.15);
        this._tone(600, now + 0.05, 0.1, 'sine', 0.15);
        this._tone(900, now + 0.1, 0.15, 'sine', 0.15);
    }
    playLevelComplete() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
            this._tone(f, now + i * 0.1, 0.4, 'sine', 0.2);
        });
    }
    playCelebration() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
            this._tone(f, now + i * 0.15, 0.5, 'triangle', 0.22);
        });
    }
    playHoldTick(progress) {
        if (!this.ctx) return;
        const freq = 400 + progress * 700;
        const now = this.ctx.currentTime;
        this._tone(freq, now, 0.05, 'sine', 0.1);
    }
    playHoldComplete() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this._tone(1200, now, 0.1, 'sine', 0.25);
        this._tone(1600, now + 0.08, 0.15, 'sine', 0.2);
    }
    playHoldCancel() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this._tone(300, now, 0.1, 'triangle', 0.15);
        this._tone(200, now + 0.08, 0.15, 'triangle', 0.12);
    }
}
const sfx = new SoundFX();

/* ============================================================
   3. LOAD DATA KARAKTER
   ============================================================ */
let ALL_LEVELS = [];
let DATA_LOADED = false;

async function loadCharacters() {
    try {
        const res = await fetch('characters.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        ALL_LEVELS = data.characters.map(ch => {
            const targets = {};
            const defaultColors = {};
            const partNames = {};
            const partKeys = [];

            ch.parts.forEach(p => {
                targets[p.key] = null;
                defaultColors[p.key] = DEFAULT_FILL;
                partNames[p.key] = p.label;
                partKeys.push(p.key);
            });

            return {
                id: ch.id,
                name: ch.name,
                shortName: ch.shortName,
				scale: ch.scale || 1,
                palette: CONTRAST_PALETTE,
                targets: targets,
                defaultColors: defaultColors,
                partNames: partNames,
                partKeys: partKeys
            };
        });

        DATA_LOADED = true;
        console.log('✅ Loaded', ALL_LEVELS.length, 'characters');
        return true;
    } catch (err) {
        console.error('❌ Gagal load characters.json:', err);
        return false;
    }
}

/* ============================================================
   4. UTILITIES
   ============================================================ */
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateRandomLevel(baseLvl) {
    const palette = shuffleArray(CONTRAST_PALETTE);
    const partKeys = baseLvl.partKeys;
    const randomTargets = {};
    partKeys.forEach((key, i) => {
        randomTargets[key] = palette[i % palette.length];
    });
    return { ...baseLvl, targets: randomTargets };
}

/* ============================================================
   5. GAME STATE
   ============================================================ */
const JEDA_SETIAP = 3;

let shuffledLevels = [];
let currentLevelIdx = 0;
let currentLevel = null;
let currentColors = {};
let lockedParts = {};

let sessionStartTime = 0;
let totalPinches = 0;
let correctDrops = 0;
let wrongDrops = 0;
let totalStars = 0;
let characterStars = [];

let currentCharCorrect = 0;
let currentCharWrong = 0;
let currentCharStartTime = 0;

/* Hold system */
const HOLD_DURATION = 1500;
const HOLD_GRACE_PERIOD = 200;
const HOLD_RING_CIRCUMFERENCE = 283;

let currentHold = null;
/* Part hold system (cubit-tahan 1.2s di atas part) */
const PART_HOLD_DURATION = 1200;
let currentPartHold = null;
let hoveredPartName = null;

/* ============================================================
   6. DOM ELEMENTS
   ============================================================ */
const videoElement = document.getElementById('webcam-feed');
const cursorEl = document.getElementById('pinch-cursor');
const colorBubbleEl = document.getElementById('carried-color-bubble');

/* ============================================================
   7. GAME FLOW
   ============================================================ */
function initGame(reshuffle = true) {
    if (reshuffle) shuffledLevels = shuffleArray(ALL_LEVELS);
    currentLevelIdx = 0;
    totalStars = 0;
    characterStars = [];
    sessionStartTime = Date.now();
    totalPinches = 0;
    correctDrops = 0;
    wrongDrops = 0;
    document.getElementById('total-stars-badge').innerText = '0';
    loadLevel(0);
}

function loadLevel(idx) {
    currentLevelIdx = idx;
    const baseLvl = shuffledLevels[idx];
    currentLevel = generateRandomLevel(baseLvl);
    currentColors = { ...currentLevel.defaultColors };
    lockedParts = {};

    currentCharCorrect = 0;
    currentCharWrong = 0;
    currentCharStartTime = Date.now();

    const badge = document.getElementById('level-title-badge');
    if (badge) badge.innerText = currentLevel.shortName || currentLevel.name || `Karakter ${idx + 1}`;

    const paletteEl = document.getElementById('color-palette');
    paletteEl.innerHTML = '';
    CONTRAST_PALETTE.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'color-swatch w-11 h-11 md:w-13 md:h-13 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full shadow-lg flex-shrink-0';
        btn.style.backgroundColor = color;
        btn.dataset.color = color;
        paletteEl.appendChild(btn);
    });

    document.getElementById('target-svg-holder').innerHTML = renderCharacter(currentLevel.id, currentLevel.targets);
    updateMainSVG();
    updateProgress();
    updateHint('👆', 'Cubit warna di palet atas!');
	renderPartsList();
}
function renderPartsList() {
    const listEl = document.getElementById('parts-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    currentLevel.partKeys.forEach(key => {
        const isDone = lockedParts[key] === true;
        const item = document.createElement('div');
        item.className = 'part-item' + (isDone ? ' done' : '');
        item.innerHTML = `
            <span class="part-label">${isDone ? '✅' : '⬜'} ${currentLevel.partNames[key] || key}</span>
        `;
        listEl.appendChild(item);
    });
}

function updateMainSVG() {
    const holder = document.getElementById('svg-holder');
    holder.innerHTML = renderCharacter(currentLevel.id, currentColors);
    const svg = holder.querySelector('svg');
    if (svg) svg.style.transform = `scale(${currentLevel.scale || 1})`;
    Object.keys(lockedParts).forEach(part => {
        if (lockedParts[part]) {
            const el = holder.querySelector(`[data-part="${part}"]`);
            if (el) el.classList.add('locked-part');
        }
    });
    bindPartEvents();
}

function updateProgress() {
    const targetKeys = currentLevel.partKeys;
    let matchedCount = 0;
    targetKeys.forEach(k => {
        if (currentColors[k] && currentColors[k].toLowerCase() === currentLevel.targets[k].toLowerCase()) matchedCount++;
    });
    const percent = Math.round((matchedCount / targetKeys.length) * 100);
    document.getElementById('match-percentage').innerText = `${percent}%`;
    document.getElementById('progress-bar').style.width = `${percent}%`;

    const lockedCount = Object.values(lockedParts).filter(v => v).length;
	if (percent === 100) {
        sfx.playLevelComplete();
        setTimeout(finishCharacter, 500);
    }
    renderPartsList();
	return percent;
}

function updateHint(icon, message) {
    document.getElementById('hint-icon').textContent = icon;
    document.getElementById('hint-message').textContent = message;
}

function finishCharacter() {
    let stars = 1;
    if (currentCharWrong === 0) stars = 3;
    else if (currentCharWrong <= 2) stars = 2;

    characterStars.push({ id: currentLevel.id, name: currentLevel.shortName, stars });
    totalStars += stars;
    document.getElementById('total-stars-badge').innerText = totalStars;

    document.getElementById('victory-char-name').innerText = currentLevel.name;
    const starsEl = document.getElementById('victory-stars');
    starsEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const star = document.createElement('span');
        star.className = i < stars ? 'star-filled' : 'star-empty';
        star.textContent = '⭐';
        starsEl.appendChild(star);
    }

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    const modal = document.getElementById('victory-modal');
    const card = document.getElementById('modal-card');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        card.classList.remove('scale-90');
    }, 50);
}

function nextCharacter() {
    const modal = document.getElementById('victory-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('modal-card').classList.add('scale-90');

        const nextIdx = currentLevelIdx + 1;
        if (nextIdx >= shuffledLevels.length) {
            showFinalCelebration();
            return;
        }
        if (nextIdx % JEDA_SETIAP === 0) {
            showCelebrationModal(nextIdx);
        } else {
            loadLevel(nextIdx);
        }
    }, 300);
}

function showCelebrationModal(nextIdx) {
    sfx.playCelebration();
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
    setTimeout(() => confetti({ particleCount: 150, spread: 100, origin: { y: 0.6, x: 0.3 } }), 300);
    setTimeout(() => confetti({ particleCount: 150, spread: 100, origin: { y: 0.6, x: 0.7 } }), 600);

    document.getElementById('celebration-count').innerText = nextIdx;

    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('stat-time').innerText = `${minutes}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('stat-pinches').innerText = totalPinches;

    const totalAttempts = correctDrops + wrongDrops;
    const acc = totalAttempts > 0 ? Math.round((correctDrops / totalAttempts) * 100) : 100;
    const accEl = document.getElementById('stat-accuracy');
    accEl.innerText = `${acc}%`;
    accEl.className = 'stat-value ' + (acc >= 90 ? 'good' : acc >= 70 ? 'warn' : 'bad');

    document.getElementById('stat-stars').innerText = totalStars;
    document.getElementById('next-char-name').innerText = shuffledLevels[nextIdx].name;
    document.getElementById('celebration-modal').classList.add('active');
}

function showFinalCelebration() {
    sfx.playCelebration();
    confetti({ particleCount: 300, spread: 180, origin: { y: 0.5 } });

    const modal = document.getElementById('celebration-modal');
    document.querySelector('.celebration-card').innerHTML = `
        <div style="font-size: 5rem; line-height: 1; margin-bottom: 8px;">🎉</div>
        <h2 style="font-size: 2rem; font-weight: 900; color: #fbbf24; letter-spacing: 1px; margin-bottom: 12px;">
            SELESAI SEMUA!
        </h2>
        <p style="color: #cbd5e1; margin-bottom: 20px;">Kamu berhasil menyelesaikan <strong>semua ${shuffledLevels.length} karakter</strong>!</p>
        <div style="background: rgba(15,23,42,0.6); border-radius: 16px; padding: 16px; margin-bottom: 20px;">
            <div style="font-size: 2rem; font-weight: 900; color: #4ade80; margin-bottom: 4px;">${totalStars} ⭐</div>
            <div style="font-size: 0.85rem; color: #94a3b8;">Total Bintang</div>
        </div>
        <button onclick="location.reload()" style="width: 100%; padding: 14px 24px; border-radius: 16px; background: linear-gradient(135deg, #fbbf24, #f97316); color: #1a1005; font-weight: 800; font-size: 1rem; border: none; cursor: pointer;">
            🔄 Main Lagi dari Awal
        </button>
    `;
    modal.classList.add('active');
}

/* ============================================================
   8. TOAST
   ============================================================ */
function showToast(type, message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
}

/* ============================================================
   9. HOLD SYSTEM
   ============================================================ */
function startHold(button, onComplete) {
    if (currentHold) return;

    const ringFill = button.querySelector('.ring-fill');
    const startTime = Date.now();

    currentHold = {
        button,
        startTime,
        lastTickTime: startTime,
        onComplete,
        ringFill
    };

    button.classList.add('pressing');

    if (ringFill) {
        ringFill.style.strokeDashoffset = HOLD_RING_CIRCUMFERENCE;
    }

    updateHoldProgress();
}

function updateHoldProgress() {
    if (!currentHold) return;

    const now = Date.now();
    const elapsed = now - currentHold.startTime;
    const progress = Math.min(elapsed / HOLD_DURATION, 1);

    if (currentHold.ringFill) {
        currentHold.ringFill.style.strokeDashoffset = HOLD_RING_CIRCUMFERENCE * (1 - progress);

        let color = '#22c55e';
        if (progress > 0.85) color = '#ef4444';
        else if (progress > 0.6) color = '#f97316';
        else if (progress > 0.3) color = '#facc15';
        currentHold.ringFill.style.stroke = color;
    }

    if (now - currentHold.lastTickTime > 200) {
        currentHold.lastTickTime = now;
        sfx.playHoldTick(progress);
    }

    if (progress >= 1) {
        completeHold();
    } else {
        requestAnimationFrame(updateHoldProgress);
    }
}

function completeHold() {
    if (!currentHold) return;
    const hold = currentHold;
    currentHold = null;

    hold.button.classList.remove('pressing');
    hold.button.classList.add('triggered');
    sfx.playHoldComplete();

    if (hold.ringFill) hold.ringFill.style.strokeDashoffset = 0;

    setTimeout(() => {
        hold.button.classList.remove('triggered');
        if (hold.ringFill) hold.ringFill.style.strokeDashoffset = HOLD_RING_CIRCUMFERENCE;
    }, 600);

    if (hold.onComplete) hold.onComplete();
}

function cancelHold() {
    if (!currentHold) return;
    const hold = currentHold;
    currentHold = null;

    hold.button.classList.remove('pressing');
    hold.button.classList.add('cancelled');
    sfx.playHoldCancel();

    if (hold.ringFill) hold.ringFill.style.strokeDashoffset = HOLD_RING_CIRCUMFERENCE;

    setTimeout(() => {
        hold.button.classList.remove('cancelled');
    }, 400);
}

/* ============================================================
   10. PINCH ENGINE
   ============================================================ */
const PINCH_GRAB_THRESHOLD = 0.07;
const PINCH_RELEASE_THRESHOLD = 0.12;
const DEBOUNCE_FRAMES = 3;

let pinchStateBuffer = [];
let confirmedPinching = false;
let activePickedColor = null;
let pinchX = 0;
let pinchY = 0;

let lastPinchTime = 0;
let lastPinchX = 0;
let lastPinchY = 0;

function updatePinchCursor(x, y, active) {
    pinchX = x;
    pinchY = y;
    cursorEl.style.left = `${x}px`;
    cursorEl.style.top = `${y}px`;
    cursorEl.classList.remove('hidden');
    if (active) cursorEl.classList.add('pinched-active');
    else cursorEl.classList.remove('pinched-active');

    // --- TAMBAHKAN LOGIKA INI ---
    // Hapus efek hover dari semua swatch terlebih dahulu
    document.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('pinched-hover'));
    
    // Jika sedang tidak membawa warna (belum mencubit), cek apakah kursor tepat di atas swatch
    if (!activePickedColor) {
        const elements = document.elementsFromPoint(x, y);
        const swatch = elements.find(el => el.classList && el.classList.contains('color-swatch'));
        if (swatch) {
            swatch.classList.add('pinched-hover'); // Berikan efek border putih
        }
    }
    // ----------------------------

    if (activePickedColor) {
        colorBubbleEl.style.backgroundColor = activePickedColor;
        colorBubbleEl.classList.remove('hidden');
    } else {
        colorBubbleEl.classList.add('hidden');
    }
}

function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'pinch-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
}

function processPinchStart(x, y) {
    const elements = document.elementsFromPoint(x, y);

    const holdBtn = elements.find(el => el.classList && el.classList.contains('hold-button'));
    if (holdBtn) {
        const action = holdBtn.id;
        startHold(holdBtn, () => handleButtonAction(action));
        return;
    }

    const swatch = elements.find(el => el.classList && el.classList.contains('color-swatch'));
    if (swatch && !activePickedColor) {
        activePickedColor = swatch.dataset.color;
        swatch.classList.add('active-drag');
        sfx.playPinch();
        totalPinches++;
        createColorParticles(x, y, activePickedColor);
        updateHint('⬇️', 'Tarik ke karakter di bawah!');
		if (currentPartHold) cancelPartHold();
        return;
    }

    const now = Date.now();
    const timeDiff = now - lastPinchTime;
    const distDiff = Math.hypot(x - lastPinchX, y - lastPinchY);

    if (timeDiff < 500 && distDiff < 80) {
        handleDoublePinch(x, y, elements);
        lastPinchTime = 0;
        return;
    }
    lastPinchTime = now;
    lastPinchX = x;
    lastPinchY = y;
}

function handleButtonAction(buttonId) {
    console.log('🎯 Button:', buttonId);
    switch (buttonId) {
        case 'change-char-btn':
			// ganti ke karakter lain
			currentLevelIdx = (currentLevelIdx + 1) % shuffledLevels.length;
			loadLevel(currentLevelIdx);
			showToast('same', '🔄 Karakter diganti!');
			break;

		case 'change-color-btn':
			// acak ulang warna target untuk karakter yang sama
			currentLevel = generateRandomLevel(shuffledLevels[currentLevelIdx]);
			currentColors = { ...currentLevel.defaultColors };
			lockedParts = {};
			document.getElementById('target-svg-holder').innerHTML =
			renderCharacter(currentLevel.id, currentLevel.targets);
			updateMainSVG();
			updateProgress();
			showToast('same', '🎨 Warna target diacak ulang!');
			break;

		case 'reset-btn':
			resetAllToDefault();
			break;
        case 'next-level-btn':
            nextCharacter();
            break;
        case 'celebration-continue-btn':
            document.getElementById('celebration-modal').classList.remove('active');
            setTimeout(() => loadLevel(currentLevelIdx + 1), 300);
            break;
        case 'celebration-pause-btn':
            document.getElementById('celebration-modal').classList.remove('active');
            showRestModal();
            break;
        case 'rest-restart-btn':
            document.getElementById('rest-modal').classList.remove('active');
            setTimeout(() => {
                currentLevelIdx = 0;
                totalStars = 0;
                characterStars = [];
                sessionStartTime = Date.now();
                totalPinches = 0;
                correctDrops = 0;
                wrongDrops = 0;
                document.getElementById('total-stars-badge').innerText = '0';
                loadLevel(0);
            }, 300);
            break;
		case 'back-menu-left':
        case 'back-menu-right':
            window.location.href = 'index.html';
            break;
    }
}


function processPinchEnd(x, y) {
    // 1. Kalau sedang hold button (change/reset/back), cancel
    if (currentHold) {
        const elapsed = Date.now() - currentHold.startTime;
        if (elapsed < HOLD_GRACE_PERIOD) return;
        cancelHold();
        return;
    }

    // 2. Kalau sedang hold part (mode gesture): JANGAN apply, cancel saja
    if (currentPartHold) {
        cancelPartHold();
        return;
    }

    // 3. Mode mouse: apply warna kalau dilepas di atas part
    if (activePickedColor) {
        const elements = document.elementsFromPoint(x, y);
        const part = elements.find(el => el.classList && el.classList.contains('character-part'));

        if (part && part.dataset.part) {
            const partName = part.dataset.part;

            if (currentLevel.targets[partName] && !lockedParts[partName]) {
                const isSameColor = currentColors[partName] &&
                    currentColors[partName].toLowerCase() === activePickedColor.toLowerCase();
                const isCorrect = activePickedColor.toLowerCase() ===
                    currentLevel.targets[partName].toLowerCase();

                if (isSameColor) {
                    sfx.playSame();
                    showToast('same', `⚠️ Sudah warna ini!`);
                } else if (isCorrect) {
                    currentColors[partName] = activePickedColor;
                    lockedParts[partName] = true;
                    sfx.playCorrect();
                    setTimeout(() => sfx.playLock(), 200);
                    showToast('correct', `✅ Bagus! ${currentLevel.partNames[partName]} sudah benar!`);
                    correctDrops++;
                    currentCharCorrect++;

                    const rect = part.getBoundingClientRect();
                    createMiniConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, activePickedColor);

                    updateMainSVG();
                    const percent = updateProgress();
                    if (percent < 100) updateHint('👍', 'Lanjut bagian lain!');
                } else {
                    currentColors[partName] = activePickedColor;
                    sfx.playWrong();
                    showToast('wrong', `❌ Ups! Belum pas. Coba warna lain! 🎨`);
                    wrongDrops++;
                    currentCharWrong++;
                    updateMainSVG();

                    const newPart = document.querySelector(`[data-part="${partName}"]`);
                    if (newPart) {
                        newPart.classList.add('part-wrong');
                        setTimeout(() => newPart.classList.remove('part-wrong'), 600);
                    }
                    updateProgress();
                    updateHint('💪', 'Ayo coba lagi!');
                }
            }

            // Bersihkan picked color setelah apply (atau kalau locked)
            document.querySelectorAll('.color-swatch.active-drag')
                .forEach(s => s.classList.remove('active-drag'));
            activePickedColor = null;
            updateHint('👆', 'Cubit warna di palet atas!');
            return;
        }
    }

    // 4. Fallback: ada picked color tapi tidak di atas part → lepas saja
    if (activePickedColor) {
        document.querySelectorAll('.color-swatch.active-drag')
            .forEach(s => s.classList.remove('active-drag'));
        activePickedColor = null;
        updateHint('👆', 'Cubit warna di palet atas!');
    }
}

function handleDoublePinch(x, y, elements) {
    const part = elements.find(el => el.classList && el.classList.contains('character-part'));
    if (part && part.dataset.part) {
        const partName = part.dataset.part;
        if (lockedParts[partName]) {
            lockedParts[partName] = false;
            currentColors[partName] = currentLevel.defaultColors[partName];
            sfx.playUnlock();
            showToast('same', `🔓 ${currentLevel.partNames[partName]} dibuka!`);
            updateHint('✏️', 'Warnai lagi bagian ini!');
            part.classList.add('part-unlocking');
            setTimeout(() => {
                updateMainSVG();
                updateProgress();
				renderPartsList();
            }, 500);
        }
    }
}

/* ============================================================
   PART HOLD SYSTEM (cubit + tahan di atas part)
   ============================================================ */
function getPartCenter(partEl) {
    const rect = partEl.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: Math.max(rect.width, rect.height) };
}

function showPartHoldRing(x, y, size, progress) {
    const ringEl = document.getElementById('part-hold-ring');
    if (!ringEl) return;
    const diam = 80;
    ringEl.style.left = x + 'px';
    ringEl.style.top = y + 'px';
    ringEl.style.width = diam + 'px';
    ringEl.style.height = diam + 'px';
    ringEl.classList.remove('hidden');

    const fill = ringEl.querySelector('.phr-fill');
    if (fill) {
        fill.style.strokeDashoffset = 283 * (1 - progress);
        let color = '#22c55e';
        if (progress > 0.85) color = '#ef4444';
        else if (progress > 0.6) color = '#f97316';
        else if (progress > 0.3) color = '#facc15';
        fill.style.stroke = color;
    }
}

function hidePartHoldRing() {
    const ringEl = document.getElementById('part-hold-ring');
    if (ringEl) ringEl.classList.add('hidden');
}

function startPartHold(partName, partEl) {
    if (currentPartHold && currentPartHold.partName === partName) return;
    cancelPartHold();
    const center = getPartCenter(partEl);
    currentPartHold = {
        partName,
        partEl,
        startTime: Date.now(),
        lastTickTime: Date.now(),
        center
    };
    updatePartHoldProgress();
}

function updatePartHoldProgress() {
    if (!currentPartHold) return;
    const now = Date.now();
    const elapsed = now - currentPartHold.startTime;
    const progress = Math.min(elapsed / PART_HOLD_DURATION, 1);

    // Update posisi ring (kalau part bergerak, misal scroll)
    const c = getPartCenter(currentPartHold.partEl);
    showPartHoldRing(pinchX, pinchY, 0, progress);

    if (now - currentPartHold.lastTickTime > 200) {
        currentPartHold.lastTickTime = now;
        sfx.playHoldTick(progress);
    }

    if (progress >= 1) {
        completePartHold();
    } else {
        requestAnimationFrame(updatePartHoldProgress);
    }
}

function completePartHold() {
    if (!currentPartHold) return;
    const hold = currentPartHold;
    currentPartHold = null;
    hidePartHoldRing();
    sfx.playHoldComplete();

    // Apply warna ke part
    const partName = hold.partName;
    const part = hold.partEl;

    if (activePickedColor && currentLevel.targets[partName]) {
        if (lockedParts[partName]) {
            sfx.playSame();
            showToast('locked', `🔒 ${currentLevel.partNames[partName]} sudah benar!`);
            return;
        }

        const oldColor = currentColors[partName];
        const isSameColor = oldColor && oldColor.toLowerCase() === activePickedColor.toLowerCase();
        const isCorrect = activePickedColor.toLowerCase() === currentLevel.targets[partName].toLowerCase();

        if (isSameColor) {
            sfx.playSame();
            showToast('same', `⚠️ Sudah warna ini!`);
        } else if (isCorrect) {
            currentColors[partName] = activePickedColor;
            lockedParts[partName] = true;
            sfx.playCorrect();
            setTimeout(() => sfx.playLock(), 200);
            showToast('correct', `✅ Bagus! ${currentLevel.partNames[partName]} sudah benar!`);
            correctDrops++;
            currentCharCorrect++;
            createMiniConfetti(hold.center.x, hold.center.y, activePickedColor);
            updateMainSVG();
            const percent = updateProgress();
            if (percent < 100) updateHint('👍', 'Lanjut bagian lain!');
        } else {
            currentColors[partName] = activePickedColor;
            sfx.playWrong();
            showToast('wrong', `❌ Ups! Belum pas. Coba warna lain! 🎨`);
            wrongDrops++;
            currentCharWrong++;
            updateMainSVG();
            const newPart = document.querySelector(`[data-part="${partName}"]`);
            if (newPart) {
                newPart.classList.add('part-wrong');
                setTimeout(() => newPart.classList.remove('part-wrong'), 600);
            }
            updateProgress();
            updateHint('💪', 'Ayo coba lagi!');
        }
    }

    // Lepas kursor warna
    document.querySelectorAll('.color-swatch.active-drag').forEach(s => s.classList.remove('active-drag'));
    activePickedColor = null;
    hidePartHoldRing();
}

function cancelPartHold() {
    if (!currentPartHold) return;
    currentPartHold = null;
    hidePartHoldRing();
}

function resetAllToDefault() {
    sfx.playResetAll();
    currentColors = { ...currentLevel.defaultColors };
    lockedParts = {};
    currentCharCorrect = 0;
    currentCharWrong = 0;
    currentCharStartTime = Date.now();
    updateMainSVG();
    updateProgress();
	renderPartsList();
    showToast('same', '🧹 Semua warna direset!');
    updateHint('👆', 'Cubit warna di palet atas!');
}

/* ============================================================
   11. TOUCH/MOUSE FALLBACK
   ============================================================ */
let isMouseDown = false;

let mousePartHold = null;

window.addEventListener('pointerdown', (e) => {
    sfx.init();
    isMouseDown = true;
    updatePinchCursor(e.clientX, e.clientY, true);
    processPinchStart(e.clientX, e.clientY);
});

window.addEventListener('pointermove', (e) => {
    if (!isMouseDown) return;
    updatePinchCursor(e.clientX, e.clientY, true);

    // Kalau sedang hold part → update ring ke posisi kursor
    if (currentPartHold) {
        const progress = Math.min((Date.now() - currentPartHold.startTime) / PART_HOLD_DURATION, 1);
        showPartHoldRing(e.clientX, e.clientY, 0, progress);
    }

    // Kalau mouse bawa warna & di atas part → mulai hold part
    if (activePickedColor) {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const part = elements.find(el => el.classList && el.classList.contains('character-part'));
        if (part && part.dataset.part) {
            const partName = part.dataset.part;
            if (!lockedParts[partName] && currentLevel.targets[partName]) {
                if (!currentPartHold || currentPartHold.partName !== partName) {
                    startPartHold(partName, part);
                }
            }
        } else {
            if (currentPartHold) cancelPartHold();
        }
    }
});

window.addEventListener('pointerup', (e) => {
    if (!isMouseDown) return;
    isMouseDown = false;
    
    // Kalau ada part hold yang sedang berjalan, jangan cancel dulu—
    // biarkan completePartHold() yang apply warna (sama seperti gesture).
    // Kalau belum selesai, cancel.
    if (currentPartHold) {
        const elapsed = Date.now() - currentPartHold.startTime;
        if (elapsed < PART_HOLD_DURATION) {
            cancelPartHold(); // user lepas terlalu cepat
        }
        // Kalau sudah >= durasi, completePartHold sudah dipanggil otomatis
    } else {
        processPinchEnd(e.clientX, e.clientY);
    }
    
    updatePinchCursor(e.clientX, e.clientY, false);
});
document.querySelectorAll('.hold-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Kalau kamera aktif → gesture yang handle, jangan double
        if (isCameraOn) return;
        // Kalau lagi mouse down / part hold → biarkan pointerup yang handle
        if (isMouseDown || currentHold || currentPartHold) return;

        handleButtonAction(btn.id);
        btn.classList.add('triggered');
        sfx.playHoldComplete();
        setTimeout(() => btn.classList.remove('triggered'), 600);
    });
});

function bindPartEvents() {
    document.querySelectorAll('.character-part').forEach(el => {
        el.addEventListener('mouseenter', () => el.classList.add('hover-target'));
        el.addEventListener('mouseleave', () => el.classList.remove('hover-target'));
    });
}

/* ============================================================
   12. MEDIAPIPE TASKS VISION
   ============================================================ */
let camera = null;
let isCameraOn = false;
let handLandmarker = null;
let lastVideoTime = -1;

const skeletonCanvas = document.createElement('canvas');
skeletonCanvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: 5;
    pointer-events: none;
    display: none;
`;
document.body.appendChild(skeletonCanvas);
const skeletonCtx = skeletonCanvas.getContext('2d');

function resizeSkeletonCanvas() {
    skeletonCanvas.width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
    skeletonCanvas.height = window.innerHeight * Math.min(window.devicePixelRatio || 1, 2);
}
window.addEventListener('resize', resizeSkeletonCanvas);
resizeSkeletonCanvas();

const HAND_CONNECTIONS = [
    [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
    [5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],
    [13,17],[17,18],[18,19],[19,20],[0,17]
];

async function initHandLandmarker() {
    try {
        console.log('📦 Loading FilesetResolver...');
        const vision = await FilesetResolver.forVisionTasks('./wasm/');
        
        console.log('🤖 Creating HandLandmarker...');
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: './hand_landmarker.task',
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        console.log('✅ HandLandmarker ready');
        return true;
    } catch (err) {
        console.error('❌ Failed to init HandLandmarker:', err);
        return false;
    }
}

async function startCamera() {
    try {
        sfx.init();
        
        // Init MediaPipe
        const ok = await initHandLandmarker();
        if (!ok) throw new Error('MediaPipe init failed');
        
        // Start kamera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: false
        });
        
        videoElement.srcObject = stream;
        await new Promise((resolve) => {
            if (videoElement.readyState >= 1) return resolve();
            videoElement.onloadedmetadata = () => resolve();
        });
        
        isCameraOn = true;
        videoElement.classList.add('active');
        document.getElementById('status-indicator').className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';

        
        // Mulai loop deteksi
        startDetectionLoop();
        
    } catch (err) {
        console.warn('Camera init failed:', err);
        isCameraOn = false;
        videoElement.classList.remove('active');
        document.getElementById('status-indicator').className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
    }
}

function startDetectionLoop() {
    console.log('🔄 Detection loop started');
    
    function loop() {
        if (
            videoElement.readyState >= 2 &&
            videoElement.videoWidth > 0 &&
            videoElement.videoHeight > 0 &&
            videoElement.currentTime !== lastVideoTime &&
            handLandmarker
        ) {
            lastVideoTime = videoElement.currentTime;
            try {
                const results = handLandmarker.detectForVideo(videoElement, performance.now());
                onHandResults(results);
            } catch (err) {
                // Skip frame error
            }
        }
        requestAnimationFrame(loop);
    }
    loop();
}

function onHandResults(results) {
    skeletonCtx.clearRect(0, 0, skeletonCanvas.width, skeletonCanvas.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;

    if (results.landmarks && results.landmarks.length > 0) {
        skeletonCanvas.style.display = 'block';
        const landmarks = results.landmarks[0];

        // Convert landmarks ke koordinat screen (mirror X)
        const points = landmarks.map(lm => ({
            x: (1 - lm.x) * W * dpr,
            y: lm.y * H * dpr
        }));

        // Draw skeleton
        skeletonCtx.save();
        skeletonCtx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
        skeletonCtx.lineWidth = 2 * dpr;
        HAND_CONNECTIONS.forEach(([i, j]) => {
            skeletonCtx.beginPath();
            skeletonCtx.moveTo(points[i].x, points[i].y);
            skeletonCtx.lineTo(points[j].x, points[j].y);
            skeletonCtx.stroke();
        });

        // Draw points
        points.forEach((pt, idx) => {
            const isTip = (idx === 4 || idx === 8);
            skeletonCtx.beginPath();
            skeletonCtx.arc(pt.x, pt.y, (isTip ? 6 : 3) * dpr, 0, Math.PI * 2);
            skeletonCtx.fillStyle = isTip ? '#fbbf24' : 'rgba(255, 255, 255, 0.85)';
            skeletonCtx.fill();
        });

        // Pinch line
        const thumb = points[4];
        const index = points[8];
        skeletonCtx.beginPath();
        skeletonCtx.moveTo(thumb.x, thumb.y);
        skeletonCtx.lineTo(index.x, index.y);
        skeletonCtx.lineWidth = confirmedPinching ? 5 * dpr : 2 * dpr;
        skeletonCtx.strokeStyle = confirmedPinching ? '#22c55e' : '#fbbf24';
        skeletonCtx.stroke();

        // Center dot
        const cx = (thumb.x + index.x) / 2;
        const cy = (thumb.y + index.y) / 2;
        skeletonCtx.beginPath();
        skeletonCtx.arc(cx, cy, (confirmedPinching ? 14 : 9) * dpr, 0, Math.PI * 2);
        skeletonCtx.fillStyle = confirmedPinching ? 'rgba(34, 197, 94, 0.9)' : 'rgba(251, 191, 36, 0.8)';
        skeletonCtx.fill();
        skeletonCtx.lineWidth = 2 * dpr;
        skeletonCtx.strokeStyle = '#ffffff';
        skeletonCtx.stroke();
        skeletonCtx.restore();

        // Pinch detection
        const thumbLM = landmarks[4];
        const indexLM = landmarks[8];
        const x = (1 - (thumbLM.x + indexLM.x) / 2) * W;
        const y = ((thumbLM.y + indexLM.y) / 2) * H;
        const dist = Math.hypot(thumbLM.x - indexLM.x, thumbLM.y - indexLM.y);

        let rawPinch;
        if (confirmedPinching) rawPinch = dist < PINCH_RELEASE_THRESHOLD;
        else rawPinch = dist < PINCH_GRAB_THRESHOLD;

        pinchStateBuffer.push(rawPinch);
        if (pinchStateBuffer.length > DEBOUNCE_FRAMES) pinchStateBuffer.shift();

        let stablePinch = confirmedPinching;
        if (pinchStateBuffer.length >= DEBOUNCE_FRAMES) {
            const allTrue = pinchStateBuffer.every(v => v === true);
            const allFalse = pinchStateBuffer.every(v => v === false);
            if (!confirmedPinching && allTrue) stablePinch = true;
            else if (confirmedPinching && allFalse) stablePinch = false;
        }

        const wasPinching = confirmedPinching;
        confirmedPinching = stablePinch;

        if (!wasPinching && confirmedPinching) {
            sfx.init();
            createRipple(x, y);
            processPinchStart(x, y);
        }
        if (wasPinching && !confirmedPinching) {
            processPinchEnd(x, y);
        }

        updatePinchCursor(x, y, confirmedPinching);
		
        // Kalau user membawa warna & menahan di atas part → mulai hold
        if (confirmedPinching && activePickedColor) {
            const elements = document.elementsFromPoint(x, y);
            const part = elements.find(el => el.classList && el.classList.contains('character-part'));
            if (part && part.dataset.part) {
                const partName = part.dataset.part;
                if (!lockedParts[partName] && currentLevel.targets[partName]) {
                    if (!currentPartHold || currentPartHold.partName !== partName) {
                        startPartHold(partName, part);
                    }
                }
            } else {
                // Pindah keluar part → cancel hold
                if (currentPartHold) cancelPartHold();
            }
        } else if (!confirmedPinching) {
            if (currentPartHold) cancelPartHold();
        }
        // ===== Logika Zoom Target (Pop-up) =====
        const targetPanel = document.querySelector('.target-card');
        const targetRect = targetPanel.getBoundingClientRect();
        let isTargetPinched = false;

        // Cek apakah sedang mencubit di area target
        if (confirmedPinching && 
            x > targetRect.left && x < targetRect.right &&
            y > targetRect.top && y < targetRect.bottom) {
            isTargetPinched = true;
        }

        const popupContainer = document.getElementById('target-popup-container');
        const popupInner = document.getElementById('target-popup-inner');
        const targetSvgHolder = document.getElementById('target-svg-holder');

        // Ambil SVG dari manapun dia berada (di panel asli ATAU di dalam pop-up)
        const activeSvg = targetSvgHolder.querySelector('svg') || popupInner.querySelector('svg');

        if (isTargetPinched && activeSvg) {
            // Pindah ke Pop-up (hanya jika belum dipindah)
            if (popupInner.children.length === 0) {
                popupInner.appendChild(activeSvg);
                popupContainer.style.display = 'flex';
            }
        } else {
            // Kembalikan ke panel asli (jika di dalam pop-up ada SVG)
            if (popupInner.children.length > 0) {
                const svgInPopup = popupInner.querySelector('svg');
                targetSvgHolder.appendChild(svgInPopup);
                popupContainer.style.display = 'none';
            }
        }
        // ==============================
		} else {
        skeletonCanvas.style.display = 'none';
        if (confirmedPinching) {
            confirmedPinching = false;
            pinchStateBuffer = [];
            processPinchEnd(pinchX, pinchY);
        }
        if (isCameraOn) cursorEl.classList.add('hidden');
    }
}

/* ============================================================
   13. PARTICLES
   ============================================================ */
const pCanvas = document.getElementById('particles-canvas');
const pCtx = pCanvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createColorParticles(x, y, color) {
    for (let i = 0; i < 18; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            radius: Math.random() * 6 + 3,
            color,
            alpha: 1,
            decay: Math.random() * 0.03 + 0.02
        });
    }
}

function createMiniConfetti(x, y, color) {
    for (let i = 0; i < 25; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.8) * 10,
            radius: Math.random() * 5 + 2,
            color: Math.random() < 0.5 ? color : '#ffffff',
            alpha: 1,
            decay: Math.random() * 0.02 + 0.015
        });
    }
}

function animateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        } else {
            pCtx.save();
            pCtx.globalAlpha = p.alpha;
            pCtx.fillStyle = p.color;
            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            pCtx.fill();
            pCtx.restore();
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ============================================================
   14. SHOW REST MODAL
   ============================================================ */
function showRestModal() {
    const selesai = currentLevelIdx + 1;
    document.getElementById('rest-count').innerText = selesai;
    document.getElementById('rest-total').innerText = shuffledLevels.length;
    document.getElementById('rest-stars').innerText = totalStars;
    document.getElementById('rest-modal').classList.add('active');
}

/* ============================================================
   15. INIT
   ============================================================ */
window.addEventListener('load', async () => {
    const ok = await loadCharacters();
    const loadingEl = document.getElementById('loading-screen');

    if (!ok) {
        loadingEl.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #fff;">
                <div style="font-size: 3rem; margin-bottom: 16px;">⚠️</div>
                <h2 style="font-size: 1.5rem; font-weight: 800; color: #fbbf24; margin-bottom: 12px;">Gagal Memuat Data</h2>
                <p style="color: #cbd5e1; max-width: 400px; line-height: 1.6;">
                    File <code>characters.json</code> tidak dapat dimuat.<br><br>
                    <strong>Solusi:</strong><br>
                    • Buka via server (bukan <code>file://</code>)<br>
                    • Atau upload ke Netlify/Vercel
                </p>
            </div>
        `;
        return;
    }

    loadingEl.classList.add('hidden');
    setTimeout(() => loadingEl.remove(), 500);

    initGame(true);
	
	    // Tombol back di panel karakter (bisa di-pinch hold + klik mouse)
    ['back-menu-left', 'back-menu-right'].forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', () => {
            window.location.replace('index.html');
        });
    });
    setTimeout(() => startCamera(), 400);
});