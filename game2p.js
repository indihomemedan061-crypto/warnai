/* ============================================================
   GAME-2P.JS — Mode 2 Pemain (Balapan, 5 Ronde)
   ============================================================
   - Split kiri (P1, merah) / kanan (P2, biru)
   - Deteksi 2 tangan: tangan kiri layar = P1, kanan layar = P2
   - Cubit + tahan 1.2 detik di atas part untuk apply warna
   - Siapa duluan selesaikan 1 karakter, dia menang ronde
   - 5 ronde total, skor tertinggi juara
   ============================================================ */

import { HandLandmarker, FilesetResolver } from './vision_bundle.mjs';

/* ============================================================
   1. KONSTANTA
   ============================================================ */
const PALETTE = [
    '#DC2626', '#F97316', '#FACC15', '#16A34A', '#2563EB', '#9333EA', '#64748B'
];
const DEFAULT_FILL = '#ffffff';
const TOTAL_ROUNDS = 5;
const PART_HOLD_DURATION = 1200;
const PINCH_GRAB = 0.07;
const PINCH_RELEASE = 0.12;
const DEBOUNCE_FRAMES = 3;

/* ============================================================
   2. SOUND FX (Ringkas)
   ============================================================ */
const sfx = {
    ctx: null,
    init() {
        if (!this.ctx) {
            try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    tone(freq, dur = 0.1, type = 'sine', vol = 0.15, delay = 0) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(vol, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + dur + 0.02);
    },
    pinch() { this.tone(320, 0.08, 'sine', 0.12); this.tone(750, 0.06, 'sine', 0.1, 0.05); },
    correct() { this.tone(660, 0.1, 'sine', 0.15); this.tone(880, 0.1, 'sine', 0.15, 0.08); this.tone(1320, 0.15, 'sine', 0.13, 0.16); },
    wrong() { this.tone(280, 0.15, 'sawtooth', 0.12); this.tone(200, 0.18, 'sawtooth', 0.1, 0.1); },
    same() { this.tone(400, 0.08, 'triangle', 0.1); },
    tick(p) { this.tone(400 + p * 700, 0.05, 'sine', 0.08); },
    holdComplete() { this.tone(1200, 0.1, 'sine', 0.2); this.tone(1600, 0.12, 'sine', 0.15, 0.08); },
    countdown() { this.tone(600, 0.12, 'sine', 0.2); },
    go() { this.tone(880, 0.15, 'sine', 0.25); this.tone(1320, 0.2, 'sine', 0.2, 0.1); },
    roundWin() {
        [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.3, 'sine', 0.18, i * 0.1));
    },
    champion() {
        [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.4, 'triangle', 0.2, i * 0.15));
    }
};

/* ============================================================
   3. LOAD KARAKTER
   ============================================================ */
let ALL_LEVELS = [];

async function loadCharacters() {
    try {
        const res = await fetch('characters.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        ALL_LEVELS = data.characters.map(ch => {
            const targets = {}, defaultColors = {}, partNames = {}, partKeys = [];
            ch.parts.forEach(p => {
                targets[p.key] = null;
                defaultColors[p.key] = DEFAULT_FILL;
                partNames[p.key] = p.label;
                partKeys.push(p.key);
            });
            return {
                id: ch.id, name: ch.name, shortName: ch.shortName,
                scale: ch.scale || 1,
                targets, defaultColors, partNames, partKeys
            };
        });
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

function generateRandomTargets(baseLvl) {
    const palette = shuffleArray(PALETTE);
    const targets = {};
    baseLvl.partKeys.forEach((key, i) => {
        targets[key] = palette[i % palette.length];
    });
    return targets;
}

/* ============================================================
   5. STATE
   ============================================================ */
let roundNumber = 1;
let scores = { p1: 0, p2: 0 };
let currentLevel = null;
let targets = {};

// Part state per pemain
const state = {
    p1: { colors: {}, locked: {}, hold: null, pinching: false, pinchBuffer: [], cursor: { x: 0, y: 0, active: false }, finished: false },
    p2: { colors: {}, locked: {}, hold: null, pinching: false, pinchBuffer: [], cursor: { x: 0, y: 0, active: false }, finished: false }
};

let roundActive = false;
let nextBtnHold = { active: false, startTime: 0, ringFill: null };
let currentScreenshotData = null;

// ===== MOUSE & TOUCH =====
const mousePointer = { active: false, pickedColor: null, hold: null, player: 'p1' };
const touchPointers = new Map(); // pointerId → { player, pickedColor, hold, x, y }
let mousePlayer = 'p1'; // default mouse kontrol P1

/* Update cursor + bubble untuk mouse/touch (tiru 1P) */
/* DOM refs */
const cursorEls = {
    p1: document.getElementById('cursor-p1'),
    p2: document.getElementById('cursor-p2')
};

/* Update cursor + bubble untuk mouse/touch (tiru 1P) */
function updateMouseCursor(player, x, y, active) {
    const cursorEl = cursorEls[player];
    if (!cursorEl) return;
    cursorEl.style.left = x + 'px';
    cursorEl.style.top = y + 'px';
    if (active) {
        cursorEl.classList.add('active', 'pinched-active');
    } else {
        cursorEl.classList.remove('active', 'pinched-active');
    }

    const bubbleEl = document.getElementById('bubble-' + player);
    const picked = state[player].pickedColor;
    if (bubbleEl) {
        if (picked) {
            bubbleEl.style.background = picked;
            cursorEl.classList.add('has-bubble');
        } else {
            cursorEl.classList.remove('has-bubble');
        }
    }
}
const ringEls = {
    p1: document.getElementById('ring-p1'),
    p2: document.getElementById('ring-p2')
};
const stageEls = {
    p1: document.getElementById('stage-p1'),
    p2: document.getElementById('stage-p2')
};
const paletteEls = {
    p1: document.getElementById('palette-p1'),
    p2: document.getElementById('palette-p2')
};

const videoElement = document.getElementById('webcam-feed');
const skeletonCanvas = document.getElementById('skeleton-canvas');
const skeletonCtx = skeletonCanvas.getContext('2d');

function resizeSkeleton() {
    skeletonCanvas.width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
    skeletonCanvas.height = window.innerHeight * Math.min(window.devicePixelRatio || 1, 2);
}
window.addEventListener('resize', resizeSkeleton);
resizeSkeleton();

const HAND_CONNECTIONS = [
    [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
    [5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],
    [13,17],[17,18],[18,19],[19,20],[0,17]
];
const lastSkeletonDraw = { p1: 0, p2: 0 };
function drawSkeleton(landmarks, color, W, H, player) {
    const now = performance.now();
    if (now - lastSkeletonDraw[player] < 33) return;
    lastSkeletonDraw[player] = now;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const points = landmarks.map(lm => ({
        x: (1 - lm.x) * W * dpr,
        y: lm.y * H * dpr
    }));

    skeletonCtx.save();
    skeletonCtx.strokeStyle = color;
    skeletonCtx.lineWidth = 2 * dpr;

    HAND_CONNECTIONS.forEach(([i, j]) => {
        skeletonCtx.beginPath();
        skeletonCtx.moveTo(points[i].x, points[i].y);
        skeletonCtx.lineTo(points[j].x, points[j].y);
        skeletonCtx.stroke();
    });

    points.forEach((pt, idx) => {
        const isTip = (idx === 4 || idx === 8);
        skeletonCtx.beginPath();
        skeletonCtx.arc(pt.x, pt.y, (isTip ? 6 : 3) * dpr, 0, Math.PI * 2);
        skeletonCtx.fillStyle = isTip ? color : '#ffffff';
        skeletonCtx.fill();
    });

    // Hitung jarak jempol-telunjuk → warna kuning/hijau
const t = points[4], i2 = points[8];
const pinchDist = Math.hypot(
    (t.x - i2.x) / dpr / W * 1,   // normalisasi ke unit video (0-1)
    (t.y - i2.y) / dpr / H * 1
);

// Kuning kalau jauh (>0.07), hijau kalau dekat (<0.07)
let lineColor = '#fbbf24';        // kuning default
let lineWidth = 3;

if (pinchDist < PINCH_GRAB) {
    lineColor = '#22c55e';         // hijau = siap pinch
    lineWidth = 5;
} else if (pinchDist < PINCH_RELEASE) {
    lineColor = '#facc15';         // kuning-orange = sedang mendekat
    lineWidth = 4;
}

skeletonCtx.beginPath();
skeletonCtx.moveTo(t.x, t.y);
skeletonCtx.lineTo(i2.x, i2.y);
skeletonCtx.lineWidth = lineWidth * dpr;
skeletonCtx.strokeStyle = lineColor;
skeletonCtx.shadowColor = lineColor;
skeletonCtx.shadowBlur = 8 * dpr;
skeletonCtx.stroke();
skeletonCtx.shadowBlur = 0;

// Warna titik jempol & telunjuk juga ikut
skeletonCtx.beginPath();
skeletonCtx.arc(t.x, t.y, 6 * dpr, 0, Math.PI * 2);
skeletonCtx.fillStyle = lineColor;
skeletonCtx.fill();
skeletonCtx.beginPath();
skeletonCtx.arc(i2.x, i2.y, 6 * dpr, 0, Math.PI * 2);
skeletonCtx.fillStyle = lineColor;
skeletonCtx.fill();

    skeletonCtx.restore();
}
/* ============================================================
   6. GAME FLOW
   ============================================================ */
function updateScoreUI() {
    document.getElementById('score-p1').innerText = scores.p1;
    document.getElementById('score-p2').innerText = scores.p2;
    document.getElementById('round-info').innerText = `${roundNumber} / ${TOTAL_ROUNDS}`;
}

function startRound() {
    // Reset state
    state.p1.colors = { ...currentLevel.defaultColors };
    state.p2.colors = { ...currentLevel.defaultColors };
    state.p1.locked = {};
    state.p2.locked = {};
    state.p1.finished = false;
    state.p2.finished = false;
    state.p1.hold = null;
    state.p2.hold = null;
    hideRing('p1');
    hideRing('p2');

    // Target preview
    document.getElementById('target-svg-holder').innerHTML =
        window.renderCharacter(currentLevel.id, targets);

    // Render 2 gambar putih
    renderStage('p1');
    renderStage('p2');

    // Render 2 palet
    buildPalette('p1');
    buildPalette('p2');

    // Checklist
    renderChecklist();

    updateScoreUI();
    roundActive = false;
	nextBtnHold.active = false;
	nextBtnHold.ringFill = null;

    // Countdown 3-2-1
    runCountdown(() => {
        roundActive = true;
    });
}

function runCountdown(callback) {
    const cdEl = document.getElementById('countdown');
    cdEl.classList.add('active');
    let n = 3;

    function show() {
        cdEl.innerHTML = `<span>${n}</span>`;
        sfx.countdown();
        if (n === 1) {
            setTimeout(() => {
                cdEl.innerHTML = `<span>GO!</span>`;
                sfx.go();
                setTimeout(() => {
                    cdEl.classList.remove('active');
                    callback();
                }, 500);
            }, 900);
        } else {
            n--;
            setTimeout(show, 900);
        }
    }
    show();
}

function pickRandomLevel() {
    const idx = Math.floor(Math.random() * ALL_LEVELS.length);
    return ALL_LEVELS[idx];
}

function nextRound() {
    document.getElementById('round-modal').classList.remove('active');

    // Cek early win: kalau ada yang sudah 3x menang, langsung juara
    if (scores.p1 >= 3 || scores.p2 >= 3) {
        setTimeout(showChampion, 300);
        return;
    }

    roundNumber++;

    if (roundNumber > TOTAL_ROUNDS) {
        showChampion();
        return;
    }
    currentLevel = pickRandomLevel();
    targets = generateRandomTargets(currentLevel);
    setTimeout(startRound, 300);
}

function restartGame() {
    // Reset SEMUA state
    roundNumber = 1;
    scores = { p1: 0, p2: 0 };
    roundActive = false;

    // Reset state pemain
    state.p1.colors = {};
    state.p2.colors = {};
    state.p1.locked = {};
    state.p2.locked = {};
    state.p1.finished = false;
    state.p2.finished = false;
    state.p1.pickedColor = null;
    state.p2.pickedColor = null;
    state.p1.pinching = false;
    state.p2.pinching = false;
    state.p1.hold = null;
    state.p2.hold = null;

    // Reset next btn hold
    nextBtnHold.active = false;
    nextBtnHold.ringFill = null;

    // Sembunyikan modal
    // Sembunyikan modal + reset opacity
    const cm = document.getElementById('champion-modal');
    cm.style.opacity = '';             // ← reset inline opacity
    cm.classList.remove('active');

    // Reset hold state tombol champion
    Object.keys(champBtnHold).forEach(k => {
        champBtnHold[k].active = false;
        champBtnHold[k].startTime = 0;
    });
    document.querySelectorAll('#champion-modal .hold-btn').forEach(btn => {
        btn.classList.remove('pressing', 'triggered');
        const fill = btn.querySelector('.ring-fill');
        if (fill) fill.style.strokeDashoffset = 283;
    });

    // Sembunyikan screenshot
    const img = document.getElementById('screenshot-preview');
    img.style.display = 'none';
    img.src = '';
    currentScreenshotData = null;

    // Pilih karakter baru
    currentLevel = pickRandomLevel();
    targets = generateRandomTargets(currentLevel);

    // Mulai ronde
    setTimeout(startRound, 300);
}

function showRoundWin(winner) {
    roundActive = false;
    scores[winner]++;
    updateScoreUI();
    sfx.roundWin();

    // Confetti dari sisi pemenang
    const originX = winner === 'p1' ? 0.25 : 0.75;
    confetti({ particleCount: 150, spread: 90, origin: { x: originX, y: 0.6 } });
    setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { x: originX, y: 0.5 } }), 300);

    // Update modal
    const card = document.getElementById('round-modal-card');
    card.classList.remove('win-p1', 'win-p2');
    card.classList.add(winner === 'p1' ? 'win-p1' : 'win-p2');

    document.getElementById('round-emoji').innerText = winner === 'p1' ? '🔴' : '🔵';
    document.getElementById('round-title').innerText =
        winner === 'p1' ? 'Pemain 1 Menang!' : 'Pemain 2 Menang!';
    document.getElementById('round-score-detail').innerText =
        `Skor: P1 ${scores.p1} — ${scores.p2} P2`;

    // 🏆 Cek early win: siapa yang sudah menang 3x
    const hasEarlyWinner = scores.p1 >= 3 || scores.p2 >= 3;
    const isLastRound = roundNumber >= TOTAL_ROUNDS;
    const isFinal = hasEarlyWinner || isLastRound;

    // Update label tombol
    if (hasEarlyWinner) {
        const champ = scores.p1 >= 3 ? 'P1' : 'P2';
        document.getElementById('next-round-label').innerText =
            `🏆 Lihat Juara (${champ} menang 3x)`;
    } else if (isLastRound) {
        document.getElementById('next-round-label').innerText = '🏆 Lihat Juara';
    } else {
        document.getElementById('next-round-label').innerText = '▶ Ronde Berikutnya';
    }

    // Simpan flag early winner untuk tombol
    nextBtnHold.earlyWin = hasEarlyWinner;

    setTimeout(() => {
        document.getElementById('round-modal').classList.add('active');
    }, 600);
}

function showChampion() {
    sfx.champion();
    const winner = scores.p1 > scores.p2 ? 'p1' : (scores.p2 > scores.p1 ? 'p2' : null);

    confetti({ particleCount: 300, spread: 180, origin: { y: 0.5 } });
    setTimeout(() => confetti({ particleCount: 200, spread: 120, origin: { x: 0.3, y: 0.6 } }), 300);
    setTimeout(() => confetti({ particleCount: 200, spread: 120, origin: { x: 0.7, y: 0.6 } }), 600);

    const title = document.getElementById('champion-title');
    if (winner === 'p1') {
        title.innerText = '🔴 PEMAIN 1 JUARA!';
        title.style.color = '#ef4444';
    } else if (winner === 'p2') {
        title.innerText = '🔵 PEMAIN 2 JUARA!';
        title.style.color = '#3b82f6';
    } else {
        title.innerText = 'SERI!';
        title.style.color = '#fbbf24';
    }

    document.getElementById('champion-score').innerText =
        `P1 ${scores.p1} — ${scores.p2} P2`;

    // Screenshot otomatis (delay supaya modal tampil dulu)
    setTimeout(() => takeScreenshot(winner), 400);

    document.getElementById('champion-modal').classList.add('active');
}

async function takeScreenshot(winner) {
    try {
        document.getElementById('champion-modal').style.opacity = '0';
        await new Promise(r => setTimeout(r, 200));

        const panelSelector = winner === 'p2' ? '.player-panel.p2' : '.player-panel.p1';
        const panel = document.querySelector(panelSelector);

        if (!panel) {
            console.warn('Panel pemenang tidak ditemukan');
            document.getElementById('champion-modal').style.opacity = '1';
            return;
        }

        const rect = panel.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        const ctx = canvas.getContext('2d');

        const video = document.getElementById('webcam-feed');

        if (video && video.videoWidth > 0) {
            const vw = video.videoWidth;
            const vh = video.videoHeight;
            const panelAspect = rect.width / rect.height;

            // === Tentukan separuh video yang di-crop berdasarkan pemenang ===
            // Video landscape (lebar > tinggi). Ambil SEPARUH KIRI atau KANAN.
            // Karena video mirror (scaleX(-1)), "kanan layar" = "kiri frame video".
            //
            // P2 menang (kanan layar) → crop kiri frame video
            // P1 menang (kiri layar)  → crop kanan frame video

            const halfW = vw / 2;  // 640 dari 1280
            const halfAspect = halfW / vh;  // rasio separuh video

            let sx, sy, sw, sh;

            if (halfAspect > panelAspect) {
                // Separuh video masih lebih lebar dari panel → crop dalam lagi
                sh = vh;
                sw = vh * panelAspect;
                sy = 0;
                if (winner === 'p2') {
                    // kiri frame video (kiri separuh, tapi masih perlu crop lagi)
                    sx = 0;
                } else {
                    // kanan frame video
                    sx = vw - sw;
                }
            } else {
                // Separuh video lebih tinggi dari panel → crop atas-bawah
                sw = halfW;
                sh = halfW / panelAspect;
                sy = (vh - sh) / 2;
                if (winner === 'p2') {
                    sx = 0;             // separuh kiri video
                } else {
                    sx = vw - halfW;    // separuh kanan video
                }
            }

            // Gambar video (mirror karena webcam)
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(
                video,
                sx, sy, sw, sh,
                0, 0, canvas.width, canvas.height
            );
            ctx.restore();
        } else {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // === Overlay gelap di bawah ===
        const gradH = canvas.height * 0.30;
        const grad = ctx.createLinearGradient(0, canvas.height - gradH, 0, canvas.height);
        grad.addColorStop(0, 'rgba(15,23,42,0)');
        grad.addColorStop(1, 'rgba(15,23,42,0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, canvas.height - gradH, canvas.width, gradH);

        // === Border warna pemenang ===
        ctx.strokeStyle = winner === 'p2' ? '#3b82f6' : '#ef4444';
        ctx.lineWidth = 6 * dpr;
        ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, canvas.width - ctx.lineWidth, canvas.height - ctx.lineWidth);

        // === Tulisan PEMENANG + skor ===
        const textColor = winner === 'p2' ? '#3b82f6' : '#ef4444';
        const centerX = canvas.width / 2;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = `900 ${Math.round(32 * dpr)}px 'Fredoka', sans-serif`;
        ctx.fillStyle = textColor;
        ctx.shadowColor = textColor;
        ctx.shadowBlur = 20 * dpr;
        const winnerLabel = winner === 'p2' ? 'PEMENANG 2' : 'PEMENANG 1';
        ctx.fillText(winnerLabel, centerX, canvas.height - 60 * dpr);

        ctx.shadowBlur = 8 * dpr;
        ctx.fillStyle = '#fbbf24';
        ctx.font = `700 ${Math.round(20 * dpr)}px 'Fredoka', sans-serif`;
        ctx.fillText(`P1 ${scores.p1} — ${scores.p2} P2`, centerX, canvas.height - 28 * dpr);

        ctx.shadowBlur = 0;

        // === Simpan ===
        const dataUrl = canvas.toDataURL('image/png');
        currentScreenshotData = dataUrl;

        const img = document.getElementById('screenshot-preview');
        img.src = dataUrl;
        img.style.display = 'block';

        document.getElementById('champion-modal').style.opacity = '1';
    } catch (err) {
        console.warn('Screenshot gagal:', err);
        document.getElementById('champion-modal').style.opacity = '1';
    }
}

function downloadScreenshot() {
    if (!currentScreenshotData) return;
    const a = document.createElement('a');
    a.href = currentScreenshotData;
    a.download = `pinch-2p-juara-${Date.now()}.png`;
    a.click();
}

/* ============================================================
   7. RENDER
   ============================================================ */
function renderStage(player) {
    const stage = stageEls[player];
    const colors = state[player].colors;
    stage.innerHTML = window.renderCharacter(currentLevel.id, colors);

    // Apply scale
    const svg = stage.querySelector('svg');
    if (svg) svg.style.transform = `scale(${currentLevel.scale || 1})`;

    // Tandai locked
    Object.keys(state[player].locked).forEach(part => {
        if (state[player].locked[part]) {
            const el = stage.querySelector(`[data-part="${part}"]`);
            if (el) el.classList.add('locked-part');
        }
    });
}

function buildPalette(player) {
    const el = paletteEls[player];
    el.innerHTML = '';
    PALETTE.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'color-swatch';
        btn.style.backgroundColor = color;
        btn.dataset.color = color;
        btn.dataset.player = player;
        el.appendChild(btn);
    });
}

function renderChecklist() {
    const el = document.getElementById('checklist-items');
    if (!el) return;
    el.innerHTML = '';
    currentLevel.partKeys.forEach(key => {
        const p1Done = state.p1.locked[key];
        const p2Done = state.p2.locked[key];
        const div = document.createElement('div');
        div.className = 'part-check';
        div.innerHTML = `
            <div class="mark p1 ${p1Done ? 'done' : ''}"></div>
            <div class="lbl">${currentLevel.partNames[key] || key}</div>
            <div class="mark p2 ${p2Done ? 'done' : ''}"></div>
        `;
        el.appendChild(div);
    });
}

/* ============================================================
   8. PINCH DETECTION per Pemain
   ============================================================ */
function processPlayerPinch(player, landmarks, W, H) {
    const st = state[player];
    const thumb = landmarks[4];
    const index = landmarks[8];

    const x = (1 - (thumb.x + index.x) / 2) * W;
    const y = ((thumb.y + index.y) / 2) * H;
    const dist = Math.hypot(thumb.x - index.x, thumb.y - index.y);

    // Update cursor
    st.cursor.x = x;
    st.cursor.y = y;
    st.cursor.active = true;

    // Debounce
    let raw = st.pinching ? dist < PINCH_RELEASE : dist < PINCH_GRAB;
    st.pinchBuffer.push(raw);
    if (st.pinchBuffer.length > DEBOUNCE_FRAMES) st.pinchBuffer.shift();

    let stable = st.pinching;
    if (st.pinchBuffer.length >= DEBOUNCE_FRAMES) {
        if (!st.pinching && st.pinchBuffer.every(v => v)) stable = true;
        else if (st.pinching && st.pinchBuffer.every(v => !v)) stable = false;
    }

    const was = st.pinching;
    st.pinching = stable;

    // Update cursor UI
    const cursorEl = cursorEls[player];
    cursorEl.style.left = x + 'px';
    cursorEl.style.top = y + 'px';
    cursorEl.classList.add('active');
    cursorEl.classList.toggle('pinched-active', st.pinching);
	// Update bubble warna
	const bubbleEl = document.getElementById('bubble-' + player);
	if (bubbleEl) {
    if (st.pickedColor) {
        bubbleEl.style.background = st.pickedColor;
        cursorEl.classList.add('has-bubble');
    } else {
        cursorEl.classList.remove('has-bubble');
    }
}

    if (!roundActive) return;

    console.log('PINCH', player, 'was=', was, 'now=', st.pinching, 'x=', x.toFixed(0), 'y=', y.toFixed(0));

    // Pinch mulai: cek swatch / part
    if (!was && st.pinching) {
        const elements = document.elementsFromPoint(x, y);

        // 1. Cek palet — pakai fallback radius kalau elementsFromPoint tidak kena
        let swatch = elements.find(el =>
            el.classList && el.classList.contains('color-swatch') &&
            el.dataset.player === player
        );

        // Fallback: cari swatch terdekat dalam radius 40px
        if (!swatch) {
            const swatches = document.querySelectorAll(`.color-swatch[data-player="${player}"]`);
            let closest = null, minDist = 40;
            swatches.forEach(s => {
                const r = s.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const d = Math.hypot(cx - x, cy - y);
                if (d < minDist) { minDist = d; closest = s; }
            });
            swatch = closest;
        }

        if (swatch && !st.pickedColor) {
            st.pickedColor = swatch.dataset.color;
            swatch.classList.add('active-drag');
            sfx.pinch();
            return;
        }
    }

    // Pinch selesai: cancel hold kalau belum selesai
    if (was && !st.pinching) {
        cancelPartHold(player);
        // JANGAN reset pickedColor — biar tetap dibawa
        // (akan di-reset setelah hold complete atau user lepas di luar part)
        if (!st.hold) {
            st.pickedColor = null;
            document.querySelectorAll(`.color-swatch[data-player="${player}"].active-drag`)
                .forEach(s => s.classList.remove('active-drag'));
        }
    }

    // Kalau sudah pegang warna & tahan di atas part → mulai hold
    if (st.pinching && st.pickedColor) {
        const elements = document.elementsFromPoint(x, y);
        const part = elements.find(el =>
            el.classList && el.classList.contains('character-part')
        );
        if (part && part.dataset.part) {
            const partName = part.dataset.part;
            if (targets[partName] && !st.locked[partName]) {
                if (!st.hold || st.hold.partName !== partName) {
                    startPartHold(player, partName, part);
                }
            }
        } else {
            // Keluar dari part → cancel hold
            if (st.hold) cancelPartHold(player);
        }
    }
}

function clearPlayerCursor(player) {
    const st = state[player];
    st.cursor.active = false;
    st.pinching = false;
    st.pinchBuffer = [];
    cursorEls[player].classList.remove('active', 'pinched-active');
    cancelPartHold(player);
}

/* ============================================================
   9. PART HOLD
   ============================================================ */
function getPartCenter(partEl) {
    const r = partEl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, size: Math.max(r.width, r.height) };
}

function startPartHold(player, partName, partEl) {
    const st = state[player];
    if (st.hold && st.hold.partName === partName) return;
    cancelPartHold(player);
    st.hold = {
        partName,
        partEl,
        startTime: Date.now(),
        lastTick: Date.now()
    };
    updatePartHold(player);
}

function updatePartHold(player) {
    const st = state[player];
    if (!st.hold) return;
    const now = Date.now();
    const elapsed = now - st.hold.startTime;
    const progress = Math.min(elapsed / PART_HOLD_DURATION, 1);

    const c = getPartCenter(st.hold.partEl);
    showRing(player, st.cursor.x, st.cursor.y, 0, progress);

    if (now - st.hold.lastTick > 200) {
        st.hold.lastTick = now;
        sfx.tick(progress);
    }

    if (progress >= 1) {
        completePartHold(player);
    } else {
        requestAnimationFrame(() => updatePartHold(player));
    }
}

function showRing(player, x, y, size, progress) {
    const el = ringEls[player];
    const diam = 70;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = diam + 'px';
    el.style.height = diam + 'px';
    el.classList.add('active');

    const fill = el.querySelector('.phr-fill');
    if (fill) {
        fill.style.strokeDashoffset = 283 * (1 - progress);
        // Warna ring sesuai pemain
        fill.style.stroke = player === 'p1' ? '#ef4444' : '#3b82f6';
    }
}

function hideRing(player) {
    ringEls[player].classList.remove('active');
}

function cancelPartHold(player) {
    const st = state[player];
    if (!st.hold) return;
    st.hold = null;
    hideRing(player);
}



function updateNextBtnHold() {
    if (!nextBtnHold.active) return;
    const elapsed = Date.now() - nextBtnHold.startTime;
    const progress = Math.min(elapsed / 1200, 1);

    if (nextBtnHold.ringFill) {
        nextBtnHold.ringFill.style.strokeDashoffset = 283 * (1 - progress);
    }

    if (progress >= 1) {
        nextBtnHold.active = false;
        const btn = document.getElementById('next-round-btn');
        btn.classList.remove('pressing');
        btn.classList.add('triggered');
        sfx.holdComplete();
        if (nextBtnHold.ringFill) nextBtnHold.ringFill.style.strokeDashoffset = 283;
        setTimeout(() => btn.classList.remove('triggered'), 400);

        // Cek early win dulu
        if (scores.p1 >= 3 || scores.p2 >= 3) {
            document.getElementById('round-modal').classList.remove('active');
            setTimeout(showChampion, 300);
            return;
        }

        if (roundNumber < TOTAL_ROUNDS) {
            nextRound();
        } else {
            document.getElementById('round-modal').classList.remove('active');
            setTimeout(showChampion, 300);
        }
        return;
    }
    requestAnimationFrame(updateNextBtnHold);
}
const champBtnHold = {};

function checkChampButton(btnId, player) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const c = state[player].cursor;
    const isPinchOnBtn = state[player].pinching &&
        c.x > rect.left && c.x < rect.right &&
        c.y > rect.top && c.y < rect.bottom;

    const key = btnId + '_' + player;
    if (!champBtnHold[key]) {
        champBtnHold[key] = { active: false, startTime: 0 };
    }

    if (isPinchOnBtn) {
        if (!champBtnHold[key].active) {
            champBtnHold[key].active = true;
            champBtnHold[key].startTime = Date.now();
            btn.classList.add('pressing');
            animateChampBtnHold(btnId, player);
        }
    } else {
        if (champBtnHold[key].active) {
            champBtnHold[key].active = false;
            btn.classList.remove('pressing');
        }
    }
}

function animateChampBtnHold(btnId, player) {
    const key = btnId + '_' + player;
    if (!champBtnHold[key] || !champBtnHold[key].active) return;

    const elapsed = Date.now() - champBtnHold[key].startTime;
    const progress = Math.min(elapsed / 1200, 1);

    const btn = document.getElementById(btnId);
    const fill = btn.querySelector('.ring-fill');
    if (fill) fill.style.strokeDashoffset = 283 * (1 - progress);

    if (progress >= 1) {
        champBtnHold[key].active = false;
        btn.classList.remove('pressing');
        btn.classList.add('triggered');
        sfx.holdComplete();
        setTimeout(() => btn.classList.remove('triggered'), 400);
        if (btnId === 'start-game-btn') {
            document.getElementById('start-overlay').style.opacity = '0';
			document.getElementById('start-overlay').style.display = 'none';
            setTimeout(() => {
                startRound();
            }, 400);
        } else if (btnId === 'back-from-start-btn') {
            window.location.href = 'index.html';
        } else if (btnId === 'play-again-btn') {
            restartGame();
        } else if (btnId === 'download-screenshot-btn') {
            downloadScreenshot();
        } else if (btnId === 'back-to-menu-btn' ||
                   btnId === 'back-menu-left' ||
                   btnId === 'back-menu-right') {
            window.location.href = 'index.html';
				   }
        return;
    }
    requestAnimationFrame(() => animateChampBtnHold(btnId, player));
}
function completePartHold(player) {
    const st = state[player];
    if (!st.hold) return;
    const hold = st.hold;
    st.hold = null;
    hideRing(player);
    sfx.holdComplete();

    const partName = hold.partName;
    const pickedColor = st.pickedColor;

    if (!pickedColor || !targets[partName]) {
        st.pickedColor = null;
		const b = document.getElementById('bubble-' + player);
		if (b) b.parentElement.classList.remove('has-bubble');
        return;
    }

    const oldColor = st.colors[partName];
    const isSame = oldColor && oldColor.toLowerCase() === pickedColor.toLowerCase();
    const isCorrect = pickedColor.toLowerCase() === targets[partName].toLowerCase();

    if (isSame) {
        sfx.same();
    } else if (isCorrect) {
        st.colors[partName] = pickedColor;
        st.locked[partName] = true;
        sfx.correct();

        // Animasi part
        const partEl = hold.partEl;
        if (partEl) {
            partEl.classList.add('part-matched');
            setTimeout(() => partEl.classList.remove('part-matched'), 500);
        }

        // Confetti kecil dari posisi part
        confetti({
            particleCount: 25,
            spread: 60,
            origin: {
                x: hold.partEl.getBoundingClientRect().left / window.innerWidth,
                y: hold.partEl.getBoundingClientRect().top / window.innerHeight
            },
            colors: player === 'p1' ? ['#ef4444', '#fca5a5', '#fff'] : ['#3b82f6', '#93c5fd', '#fff']
        });

        renderStage(player);
        renderChecklist();

        // Cek apakah pemain selesai
        checkPlayerComplete(player);
    } else {
        st.colors[partName] = pickedColor;
        sfx.wrong();
        renderStage(player);
        const partEl = stageEls[player].querySelector(`[data-part="${partName}"]`);
        if (partEl) {
            partEl.classList.add('part-wrong');
            setTimeout(() => partEl.classList.remove('part-wrong'), 500);
        }
    }

    // Lepas warna
    st.pickedColor = null;
    document.querySelectorAll(`.color-swatch[data-player="${player}"].active-drag`)
        .forEach(s => s.classList.remove('active-drag'));
}

function checkPlayerComplete(player) {
    const st = state[player];
    if (st.finished) return;
    const allDone = currentLevel.partKeys.every(k => st.locked[k]);
    if (allDone && roundActive) {
        st.finished = true;
        showRoundWin(player);
    }
}

/* ============================================================
   10. MEDIAPIPE 2 TANGAN
   ============================================================ */
let handLandmarker = null;
let lastVideoTime = -1;

async function initHandLandmarker() {
    try {
        const vision = await FilesetResolver.forVisionTasks('./wasm/');
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
		baseOptions: { modelAssetPath: './hand_landmarker.task', delegate: 'GPU' },
		runningMode: 'VIDEO',
		numHands: 2,
		minHandDetectionConfidence: 0.4,   // ← turunkan biar cepat deteksi
		minTrackingConfidence: 0.4
        });
        console.log('✅ HandLandmarker ready (2 hands)');
        return true;
    } catch (err) {
        console.error('❌ MediaPipe gagal:', err);
        return false;
    }
}

async function startCamera() {
    sfx.init();
    const ok = await initHandLandmarker();
    if (!ok) {
        document.body.style.background = '#0f172a';
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
		video: {
			width: { ideal: 1280 },
			height: { ideal: 720 },
			facingMode: { ideal: 'user' },
		},
		audio: false
		});
        videoElement.srcObject = stream;
        await new Promise(r => {
            if (videoElement.readyState >= 1) return r();
            videoElement.onloadedmetadata = () => r();
        });
        startDetectionLoop();
    } catch (err) {
        console.warn('Kamera gagal:', err);
    }
}

function startDetectionLoop() {
    function loop() {
        if (videoElement.readyState >= 2 && videoElement.videoWidth > 0 &&
            videoElement.currentTime !== lastVideoTime && handLandmarker) {
            lastVideoTime = videoElement.currentTime;
            try {
                const results = handLandmarker.detectForVideo(videoElement, performance.now());
                onHandResults(results);
            } catch (e) {}
        }
        requestAnimationFrame(loop);
    }
    loop();
}

    // ---- Logika pointer (dipakai mouse & touch) ----
    function pointerDown(state, x, y, player) {
        if (!roundActive) return;
        const sw = findSwatchAt(x, y, player);
        if (sw && !state.pickedColor) {
            state.pickedColor = sw.dataset.color;
            sw.classList.add('active-drag');
            sfx.pinch();
        }
    }

    function pointerMove(state, x, y, player) {
        if (!roundActive) return;
        if (!state.pickedColor) return;
        // Tidak perlu startPartHold untuk mouse/touch —
        // warna akan di-apply saat pointerup (sama seperti 1P)
    }

    function pointerUp(state, x, y, player) {
        if (!roundActive) {
            state.pickedColor = null;
            document.querySelectorAll(`.color-swatch[data-player="${player}"].active-drag`)
                .forEach(s => s.classList.remove('active-drag'));
            return;
        }

        if (state.pickedColor) {
            const part = findPartAt(x, y);
            if (part && part.dataset.part) {
                const partName = part.dataset.part;
                const st = state[player];
                if (targets[partName] && !st.locked[partName]) {
                    applyColorDirect(player, partName, part, state.pickedColor);
                }
            }
            // Bersihkan picked color
            state.pickedColor = null;
            document.querySelectorAll(`.color-swatch[data-player="${player}"].active-drag`)
                .forEach(s => s.classList.remove('active-drag'));
        }
    }

function onHandResults(results) {
    const startOverlay = document.getElementById('start-overlay');
    const overlayVisible = startOverlay && startOverlay.style.display !== 'none';

    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    skeletonCtx.clearRect(0, 0, skeletonCanvas.width, skeletonCanvas.height);

    // ==== Kalau tidak ada tangan ====
    if (!results.landmarks || results.landmarks.length === 0) {
        skeletonCanvas.style.display = 'none';
        clearPlayerCursor('p1');
        clearPlayerCursor('p2');
        return;
    }

    skeletonCanvas.style.display = 'block';

    // ==== Assign tangan ke P1 (kiri) atau P2 (kanan) ====
    const handsWithX = results.landmarks.map(lm => {
        const avgX = lm.reduce((sum, p) => sum + (1 - p.x), 0) / lm.length;
        return { lm, avgX };
    });
    handsWithX.sort((a, b) => a.avgX - b.avgX);

    let p1Hand = null, p2Hand = null;
    if (handsWithX.length === 1) {
        const h = handsWithX[0];
        if (h.avgX < 0.5) p1Hand = h.lm;
        else p2Hand = h.lm;
    } else {
        p1Hand = handsWithX[0].lm;
        p2Hand = handsWithX[1].lm;
    }

    // ==== Update cursor posisi saja (untuk overlay) — JANGAN hitung pinching di sini ====
    ['p1', 'p2'].forEach(p => {
        const hand = p === 'p1' ? p1Hand : p2Hand;
        const cursorEl = cursorEls[p];
        const st = state[p];
        if (hand) {
            const thumb = hand[4], index = hand[8];
            const x = (1 - (thumb.x + index.x) / 2) * W;
            const y = ((thumb.y + index.y) / 2) * H;

            st.cursor.x = x;
            st.cursor.y = y;
            st.cursor.active = true;

            cursorEl.style.left = x + 'px';
            cursorEl.style.top = y + 'px';
            cursorEl.classList.add('active');

            // Update ring hold saat pinch (untuk overlay)
            if (st.pinching && overlayVisible) {
                const activeKey = Object.keys(champBtnHold).find(k =>
                    k.endsWith('_' + p) && champBtnHold[k].active
                );
                if (activeKey) {
                    const elapsed = Date.now() - champBtnHold[activeKey].startTime;
                    const progress = Math.min(elapsed / 1200, 1);
                    showRing(p, x, y, 0, progress);
                }
            }
        } else {
            cursorEl.classList.remove('active', 'pinched-active');
            hideRing(p);
            st.cursor.active = false;
            st.pinching = false;
            st.pinchBuffer = [];
        }
    });

    // ==== Skeleton ====
    if (p1Hand) drawSkeleton(p1Hand, '#ef4444', W, H, 'p1');
    if (p2Hand) drawSkeleton(p2Hand, '#3b82f6', W, H, 'p2');

    // ==== Kalau overlay start tampil → cek tombol start/back saja ====
       // ==== Kalau overlay start tampil → cek tombol start/back saja ====
    // ==== Kalau overlay start tampil → hitung pinching + cek tombol ====
    if (overlayVisible) {
        ['p1', 'p2'].forEach(p => {
            const hand = p === 'p1' ? p1Hand : p2Hand;
            const st = state[p];
            if (hand) {
                const thumb = hand[4], index = hand[8];
                const dist = Math.hypot(thumb.x - index.x, thumb.y - index.y);

                // Hitung pinching (debounce) khusus untuk overlay
                let raw = st.pinching ? dist < PINCH_RELEASE : dist < PINCH_GRAB;
                st.pinchBuffer.push(raw);
                if (st.pinchBuffer.length > DEBOUNCE_FRAMES) st.pinchBuffer.shift();

                let stable = st.pinching;
                if (st.pinchBuffer.length >= DEBOUNCE_FRAMES) {
                    if (!st.pinching && st.pinchBuffer.every(v => v)) stable = true;
                    else if (st.pinching && st.pinchBuffer.every(v => !v)) stable = false;
                }
                st.pinching = stable;
            } else {
                st.pinching = false;
                st.pinchBuffer = [];
            }
        });

        checkChampButton('start-game-btn', 'p1');
        checkChampButton('start-game-btn', 'p2');
        checkChampButton('back-from-start-btn', 'p1');
        checkChampButton('back-from-start-btn', 'p2');
    }


    // ==== Game aktif: proses pinch per pemain ====
    // ==== Game aktif: proses pinch per pemain ====
    if (p1Hand) processPlayerPinch('p1', p1Hand, W, H);
    else clearPlayerCursor('p1');

    if (p2Hand) processPlayerPinch('p2', p2Hand, W, H);
    else clearPlayerCursor('p2');

    // ==== Logika Zoom Target saat di-pinch ====
    const targetPanel = document.getElementById('target-panel');
    const targetRect = targetPanel.getBoundingClientRect();
    let isTargetPinched = false;

    ['p1', 'p2'].forEach(p => {
        const c = state[p].cursor;
        if (state[p].pinching && 
            c.x > targetRect.left && c.x < targetRect.right &&
            c.y > targetRect.top && c.y < targetRect.bottom) {
            isTargetPinched = true;
        }
    });

    const targetSvgHolder = document.getElementById('target-svg-holder');
    if (isTargetPinched) {
        targetSvgHolder.classList.add('pinched');
    } else {
        targetSvgHolder.classList.remove('pinched');
    }

    // ==== Tombol "Lanjut Ronde" ====
    const roundModal = document.getElementById('round-modal');
    if (roundModal.classList.contains('active')) {
        const btn = document.getElementById('next-round-btn');
        const rect = btn.getBoundingClientRect();
        let anyPinchOnBtn = false;

        ['p1', 'p2'].forEach(p => {
            const c = state[p].cursor;
            if (state[p].pinching &&
                c.x > rect.left && c.x < rect.right &&
                c.y > rect.top && c.y < rect.bottom) {
                anyPinchOnBtn = true;
            }
        });

        if (anyPinchOnBtn) {
            if (!nextBtnHold.active) {
                nextBtnHold.active = true;
                nextBtnHold.startTime = Date.now();
                nextBtnHold.ringFill = btn.querySelector('.ring-fill');
                btn.classList.add('pressing');
                updateNextBtnHold();
            }
        } else {
            if (nextBtnHold.active) {
                nextBtnHold.active = false;
                btn.classList.remove('pressing');
                if (nextBtnHold.ringFill) nextBtnHold.ringFill.style.strokeDashoffset = 283;
            }
        }
    } else {
        if (nextBtnHold.active) {
            nextBtnHold.active = false;
            const btn = document.getElementById('next-round-btn');
            btn.classList.remove('pressing');
            if (nextBtnHold.ringFill) nextBtnHold.ringFill.style.strokeDashoffset = 283;
        }
    }

    // ==== Tombol di modal champion ====
    const champModal = document.getElementById('champion-modal');
    if (champModal.classList.contains('active')) {
        checkChampButton('play-again-btn', 'p1');
        checkChampButton('play-again-btn', 'p2');
        checkChampButton('download-screenshot-btn', 'p1');
        checkChampButton('download-screenshot-btn', 'p2');
        checkChampButton('back-to-menu-btn', 'p1');
        checkChampButton('back-to-menu-btn', 'p2');
    }

    // ==== Tombol back di topbar (selalu aktif) ====
    ['p1', 'p2'].forEach(p => {
        checkChampButton('back-menu-left', p);
        checkChampButton('back-menu-right', p);
    });
	
}
/* ============================================================
   11. INIT
   ============================================================ */
window.addEventListener('load', async () => {
    const ok = await loadCharacters();
    if (!ok) {
        alert('Gagal memuat characters.json. Pastikan dibuka via server (http://localhost).');
        return;
    }

    // Tombol modal
    document.getElementById('next-round-btn').addEventListener('click', () => {
    if (scores.p1 >= 3 || scores.p2 >= 3) {
        document.getElementById('round-modal').classList.remove('active');
        setTimeout(showChampion, 300);
    } else if (roundNumber < TOTAL_ROUNDS) {
        nextRound();
    } else {
        document.getElementById('round-modal').classList.remove('active');
        setTimeout(showChampion, 300);
    }
	});

    document.getElementById('play-again-btn').addEventListener('click', restartGame);
    document.getElementById('download-screenshot-btn').addEventListener('click', downloadScreenshot);
	document.getElementById('back-to-menu-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
	});
	document.getElementById('back-menu-left').addEventListener('click', () => {
    window.location.href = 'index.html';
	});
	document.getElementById('back-menu-right').addEventListener('click', () => {
    window.location.href = 'index.html';
	});

    // Pilih karakter ronde 1 (JANGAN langsung startRound)
    currentLevel = pickRandomLevel();
    targets = generateRandomTargets(currentLevel);

    // Siapkan visual tanpa countdown
    state.p1.colors = { ...currentLevel.defaultColors };
    state.p2.colors = { ...currentLevel.defaultColors };
    state.p1.locked = {};
    state.p2.locked = {};
    document.getElementById('target-svg-holder').innerHTML =
        window.renderCharacter(currentLevel.id, targets);
    renderStage('p1');
    renderStage('p2');
    buildPalette('p1');
    buildPalette('p2');
    renderChecklist();
    updateScoreUI();

    // Tombol MULAI
    document.getElementById('start-game-btn').addEventListener('click', () => {
        document.getElementById('start-overlay').style.opacity = '0';
        document.getElementById('start-overlay').style.display = 'none';
        setTimeout(() => {
			startRound(); // baru muncul countdown 3-2-1
        }, 400);
    });

    // Tombol BACK
    document.getElementById('back-from-start-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // ===== MOUSE & TOUCH SUPPORT =====
    setupMouseAndTouch();

    // Nyalakan kamera setelah 500ms
    setTimeout(startCamera, 500);
});

/* ============================================================
   MOUSE & TOUCH SUPPORT
   ============================================================ */
function setupMouseAndTouch() {

    // Helper
    function findSwatchAt(x, y, player) {
        const els = document.elementsFromPoint(x, y);
        let sw = els.find(el => el.classList && el.classList.contains('color-swatch') && el.dataset.player === player);
        if (sw) return sw;
        const swatches = document.querySelectorAll(`.color-swatch[data-player="${player}"]`);
        let closest = null, min = 45;
        swatches.forEach(s => {
            const r = s.getBoundingClientRect();
            const d = Math.hypot((r.left + r.width/2) - x, (r.top + r.height/2) - y);
            if (d < min) { min = d; closest = s; }
        });
        return closest;
    }
    function findPartAt(x, y) {
        const els = document.elementsFromPoint(x, y);
        return els.find(el => el.classList && el.classList.contains('character-part'));
    }

    // ===== STATE MOUSE =====
    // Simpan pickedColor DI state[player] supaya konsisten dengan applyColorDirect
    let mouseActive = false;
    let mousePlayer = 'p1';
	
	

    window.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse') return;
        if (!roundActive) return;
        if (e.target.closest('.hold-btn') || e.target.closest('.back-menu-btn')) return;

        const W = window.innerWidth;
        mousePlayer = e.clientX < W / 2 ? 'p1' : 'p2';
        mouseActive = true;

        const st = state[mousePlayer];
        const sw = findSwatchAt(e.clientX, e.clientY, mousePlayer);
        if (sw && !st.pickedColor) {
            st.pickedColor = sw.dataset.color;
            sw.classList.add('active-drag');
            sfx.pinch();
            updateMouseCursor(mousePlayer, e.clientX, e.clientY, true);
        }
    });

    window.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        if (!mouseActive) return;
        const st = state[mousePlayer];
        if (!st.pickedColor) return;

        updateMouseCursor(mousePlayer, e.clientX, e.clientY, true);

        const part = findPartAt(e.clientX, e.clientY);
        if (part && part.dataset.part) {
            const partName = part.dataset.part;
            if (targets[partName] && !st.locked[partName]) {
                if (!st.hold || st.hold.partName !== partName) {
                    startPartHold(mousePlayer, partName, part);
                }
            }
        } else {
            if (st.hold) cancelPartHold(mousePlayer);
        }
    });

    window.addEventListener('pointerup', (e) => {
        if (e.pointerType !== 'mouse') return;
        if (!mouseActive) return;
        mouseActive = false;

        const st = state[mousePlayer];
        if (st.pickedColor) {
            const part = findPartAt(e.clientX, e.clientY);
            if (part && part.dataset.part) {
                const partName = part.dataset.part;
                if (targets[partName] && !st.locked[partName]) {
                    applyColorDirect(mousePlayer, partName, part);
                }
            }
            // Bersihkan
            st.pickedColor = null;
            document.querySelectorAll(`.color-swatch[data-player="${mousePlayer}"].active-drag`)
                .forEach(s => s.classList.remove('active-drag'));
            cancelPartHold(mousePlayer);

            // Sembunyikan cursor + bubble
            const cursorEl = cursorEls[mousePlayer];
            cursorEl.classList.remove('active', 'pinched-active', 'has-bubble');
        }
    });

    // ===== TOUCH =====
    const touchPointers = new Map();

    window.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch') return;
        if (!roundActive) return;
        if (e.target.closest('.hold-btn') || e.target.closest('.back-menu-btn')) return;

        const W = window.innerWidth;
        const x = e.clientX;
        let player = x < W / 2 ? 'p1' : 'p2';
        const used = new Set([...touchPointers.values()].map(t => t.player));
        if (used.has(player)) player = player === 'p1' ? 'p2' : 'p1';

        const st = state[player];
        const sw = findSwatchAt(x, e.clientY, player);
        if (sw && !st.pickedColor) {
            st.pickedColor = sw.dataset.color;
            sw.classList.add('active-drag');
            sfx.pinch();

            // Tampilkan cursor + bubble
            const cursorEl = cursorEls[player];
            const bubbleEl = document.getElementById('bubble-' + player);
            cursorEl.style.left = x + 'px';
            cursorEl.style.top = e.clientY + 'px';
            cursorEl.classList.add('active', 'pinched-active');
            if (bubbleEl) {
                bubbleEl.style.background = st.pickedColor;
                cursorEl.classList.add('has-bubble');
            }
        }
        touchPointers.set(e.pointerId, { player });
    });

    window.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'touch') return;
        const t = touchPointers.get(e.pointerId);
        if (!t) return;
        const st = state[t.player];
        if (!st.pickedColor) return;

        // Update posisi cursor (tiru 1P)
        updateMouseCursor(t.player, e.clientX, e.clientY, true);

        const part = findPartAt(e.clientX, e.clientY);
        if (part && part.dataset.part) {
            const partName = part.dataset.part;
            if (targets[partName] && !st.locked[partName]) {
                if (!st.hold || st.hold.partName !== partName) {
                    startPartHold(t.player, partName, part);
                }
            }
        } else {
            if (st.hold) cancelPartHold(t.player);
        }
    });

    window.addEventListener('pointerup', (e) => {
        if (e.pointerType !== 'touch') return;
        const t = touchPointers.get(e.pointerId);
        if (!t) return;
        const st = state[t.player];

        if (st.pickedColor) {
            const part = findPartAt(e.clientX, e.clientY);
            if (part && part.dataset.part) {
                const partName = part.dataset.part;
                if (targets[partName] && !st.locked[partName]) {
                    applyColorDirect(t.player, partName, part);
                }
            }
            st.pickedColor = null;
            document.querySelectorAll(`.color-swatch[data-player="${t.player}"].active-drag`)
                .forEach(s => s.classList.remove('active-drag'));
            cancelPartHold(t.player);

            // Sembunyikan cursor + bubble
            const cursorEl = cursorEls[t.player];
            cursorEl.classList.remove('active', 'pinched-active', 'has-bubble');
        }
        touchPointers.delete(e.pointerId);
    });

    window.addEventListener('pointercancel', (e) => {
        if (e.pointerType !== 'touch') return;
        touchPointers.delete(e.pointerId);
    });

    // ===== TOMBOL MODAL =====
    const btnMap = {
        'next-round-btn': () => {
            if (scores.p1 >= 3 || scores.p2 >= 3) {
                document.getElementById('round-modal').classList.remove('active');
                setTimeout(showChampion, 300);
            } else if (roundNumber < TOTAL_ROUNDS) {
                nextRound();
            } else {
                document.getElementById('round-modal').classList.remove('active');
                setTimeout(showChampion, 300);
            }
        },
        'play-again-btn': restartGame,
        'download-screenshot-btn': downloadScreenshot,
        'back-to-menu-btn': () => { window.location.href = 'index.html'; },
        'back-menu-left': () => { window.location.href = 'index.html'; },
        'back-menu-right': () => { window.location.href = 'index.html'; }
    };

    Object.keys(btnMap).forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.holdComplete();
            btn.classList.add('triggered');
            setTimeout(() => btn.classList.remove('triggered'), 400);
            btnMap[id]();
        });
    });
}

/* ============================================================
   APPLY WARNA LANGSUNG (untuk mouse/touch — tanpa hold 1.2s)
   ============================================================ */
function applyColorDirect(player, partName, partEl, forcedColor) {
    const st = state[player];
    const pickedColor = forcedColor || st.pickedColor;
    if (!pickedColor || !targets[partName]) return;

    const oldColor = st.colors[partName];
    const isSame = oldColor && oldColor.toLowerCase() === pickedColor.toLowerCase();
    const isCorrect = pickedColor.toLowerCase() === targets[partName].toLowerCase();

    if (isSame) {
        sfx.same();
        return;
    }

    if (isCorrect) {
        st.colors[partName] = pickedColor;
        st.locked[partName] = true;
        sfx.correct();
        if (partEl) {
            partEl.classList.add('part-matched');
            setTimeout(() => partEl.classList.remove('part-matched'), 500);
        }
        const r = partEl.getBoundingClientRect();
        confetti({
            particleCount: 25,
            spread: 60,
            origin: { x: r.left / window.innerWidth, y: r.top / window.innerHeight },
            colors: player === 'p1' ? ['#ef4444','#fca5a5','#fff'] : ['#3b82f6','#93c5fd','#fff']
        });
        renderStage(player);
        renderChecklist();
        checkPlayerComplete(player);
    } else {
        st.colors[partName] = pickedColor;
        sfx.wrong();
        renderStage(player);
        const el = stageEls[player].querySelector(`[data-part="${partName}"]`);
        if (el) {
            el.classList.add('part-wrong');
            setTimeout(() => el.classList.remove('part-wrong'), 500);
        }
    }
}