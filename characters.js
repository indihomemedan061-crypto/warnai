/* ============================================================
   CHARACTERS.JS v3 — Full Update dengan Fix
   ============================================================
   - Outline hitam tebal (stroke 3)
   - Semua bagian yang bisa diwarnai pakai class="character-part"
   - Bagian yang tidak diwarnai (mata pupil) = hitam fixed
   ============================================================ */

/* Helper: warna outline */
const OL = '#0f172a';
const SW = 3;

/* 1. ROBOT */
function svgRobot(c) {
    return `<svg viewBox="0 -15 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path class="character-part" data-part="core" fill="${c.core}" stroke="${OL}" stroke-width="${SW}" d="M 95 15 H 105 V 35 H 95 Z" />
        <circle class="character-part" data-part="core" fill="${c.core}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="12" r="8" />
        <rect class="character-part" data-part="head" fill="${c.head}" stroke="${OL}" stroke-width="${SW}" rx="14" x="50" y="35" width="100" height="70" />
        <circle fill="${OL}" cx="75" cy="65" r="9" />
        <circle fill="${OL}" cx="125" cy="65" r="9" />
        <circle fill="#ffffff" cx="72" cy="62" r="3.5" />
        <circle fill="#ffffff" cx="122" cy="62" r="3.5" />
        <rect fill="${OL}" x="80" y="85" width="40" height="7" rx="3.5" />
        <rect class="character-part" data-part="armL" fill="${c.armL}" stroke="${OL}" stroke-width="${SW}" rx="10" x="15" y="115" width="28" height="70" />
        <rect class="character-part" data-part="armR" fill="${c.armR}" stroke="${OL}" stroke-width="${SW}" rx="10" x="157" y="115" width="28" height="70" />
        <rect class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" rx="12" x="48" y="110" width="104" height="80" />
        <circle class="character-part" data-part="core" fill="${c.core}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="150" r="18" />
        <rect class="character-part" data-part="legs" fill="${c.legs}" stroke="${OL}" stroke-width="${SW}" rx="8" x="60" y="193" width="30" height="40" />
        <rect class="character-part" data-part="legs" fill="${c.legs}" stroke="${OL}" stroke-width="${SW}" rx="8" x="110" y="193" width="30" height="40" />
    </svg>`;
}

/* 2. MONSTER */
function svgMonster(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path class="character-part" data-part="horns" fill="${c.horns}" stroke="${OL}" stroke-width="${SW}" d="M 50 60 Q 30 20 20 30 Q 35 60 55 70 Z" />
        <path class="character-part" data-part="horns" fill="${c.horns}" stroke="${OL}" stroke-width="${SW}" d="M 150 60 Q 170 20 180 30 Q 165 60 145 70 Z" />
        <path class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" d="M 40 100 C 30 30, 170 30, 160 100 C 175 160, 160 210, 130 210 C 110 210, 90 210, 70 210 C 40 210, 25 160, 40 100 Z" />
        <ellipse class="character-part" data-part="belly" fill="${c.belly}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="145" rx="38" ry="42" />
        <circle fill="${OL}" cx="75" cy="85" r="16" />
        <circle fill="${OL}" cx="125" cy="85" r="16" />
        <circle fill="#ffffff" cx="78" cy="82" r="4" />
        <circle fill="#ffffff" cx="128" cy="82" r="4" />
        <path fill="${OL}" d="M 80 115 Q 100 135 120 115 Z" />
        <ellipse class="character-part" data-part="feet" fill="${c.feet}" stroke="${OL}" stroke-width="${SW}" cx="65" cy="215" rx="20" ry="10" />
        <ellipse class="character-part" data-part="feet" fill="${c.feet}" stroke="${OL}" stroke-width="${SW}" cx="135" cy="215" rx="20" ry="10" />
    </svg>`;
}

/* 3. SUPERHERO — kepala bisa diwarnai */
function svgSuperhero(c) {
    return `<svg viewBox="0 -9 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path class="character-part" data-part="cape" fill="${c.cape}" stroke="${OL}" stroke-width="${SW}" d="M 50 85 L 10 210 Q 100 230 190 210 L 150 85 Z" />
        <rect class="character-part" data-part="suit" fill="${c.suit}" stroke="${OL}" stroke-width="${SW}" rx="16" x="55" y="80" width="90" height="95" />
        <circle class="character-part" data-part="head" fill="${c.head}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="55" r="32" />
        <path class="character-part" data-part="mask" fill="${c.mask}" stroke="${OL}" stroke-width="${SW}" d="M 68 40 Q 100 30 132 40 Q 138 65 100 70 Q 62 65 68 40 Z" />
        <ellipse fill="${OL}" cx="84" cy="52" rx="7" ry="4" />
        <ellipse fill="${OL}" cx="116" cy="52" rx="7" ry="4" />
        <polygon class="character-part" data-part="emblem" fill="${c.emblem}" stroke="${OL}" stroke-width="${SW}" points="100,100 120,115 110,135 90,135 80,115" />
        <rect class="character-part" data-part="boots" fill="${c.boots}" stroke="${OL}" stroke-width="${SW}" rx="8" x="65" y="178" width="28" height="48" />
        <rect class="character-part" data-part="boots" fill="${c.boots}" stroke="${OL}" stroke-width="${SW}" rx="8" x="107" y="178" width="28" height="48" />
    </svg>`;
}

/* 4. KUCING */
function svgCat(c) {
    return `<svg viewBox="0 -5 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <polygon class="character-part" data-part="ears" fill="${c.ears}" stroke="${OL}" stroke-width="${SW}" points="30,80 55,20 85,60" />
        <polygon class="character-part" data-part="ears" fill="${c.ears}" stroke="${OL}" stroke-width="${SW}" points="170,80 145,20 115,60" />
        <ellipse class="character-part" data-part="head" fill="${c.head}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="85" rx="70" ry="55" />
        <circle fill="${OL}" cx="75" cy="78" r="8" />
        <circle fill="${OL}" cx="125" cy="78" r="8" />
        <circle fill="#ffffff" cx="72" cy="75" r="3" />
        <circle fill="#ffffff" cx="122" cy="75" r="3" />
        <polygon fill="${OL}" points="94,95 106,95 100,103" />
        <path class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" d="M 55 130 C 45 180, 50 215, 65 215 C 85 215, 115 215, 135 215 C 150 215, 155 180, 145 130 Z" />
        <rect class="character-part" data-part="collar" fill="${c.collar}" stroke="${OL}" stroke-width="${SW}" rx="4" x="65" y="130" width="70" height="15" />
        <ellipse class="character-part" data-part="paws" fill="${c.paws}" stroke="${OL}" stroke-width="${SW}" cx="75" cy="215" rx="18" ry="12" />
        <ellipse class="character-part" data-part="paws" fill="${c.paws}" stroke="${OL}" stroke-width="${SW}" cx="125" cy="215" rx="18" ry="12" />
    </svg>`;
}

/* 5. ANJING */
function svgDog(c) {
    return `<svg viewBox="0 5 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <ellipse class="character-part" data-part="earL" fill="${c.earL}" stroke="${OL}" stroke-width="${SW}" cx="45" cy="80" rx="22" ry="38" />
        <ellipse class="character-part" data-part="earR" fill="${c.earR}" stroke="${OL}" stroke-width="${SW}" cx="155" cy="80" rx="22" ry="38" />
        <ellipse class="character-part" data-part="head" fill="${c.head}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="95" rx="68" ry="58" />
        <circle fill="${OL}" cx="78" cy="88" r="8" />
        <circle fill="${OL}" cx="122" cy="88" r="8" />
        <circle fill="#ffffff" cx="75" cy="85" r="3" />
        <circle fill="#ffffff" cx="119" cy="85" r="3" />
        <ellipse fill="${OL}" cx="100" cy="115" rx="12" ry="8" />
        <path fill="${OL}" d="M 88 125 Q 100 138 112 125 Z" />
        <ellipse class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="185" rx="55" ry="45" />
        <ellipse class="character-part" data-part="paws" fill="${c.paws}" stroke="${OL}" stroke-width="${SW}" cx="68" cy="225" rx="20" ry="12" />
        <ellipse class="character-part" data-part="paws" fill="${c.paws}" stroke="${OL}" stroke-width="${SW}" cx="132" cy="225" rx="20" ry="12" />
    </svg>`;
}

/* 6. KURA-KURA — shellLeft & shellRight bisa diwarnai */
function svgTurtle(c) {
    return `<svg viewBox="0 15 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <ellipse class="character-part" data-part="legs" fill="${c.legs}" stroke="${OL}" stroke-width="${SW}" cx="40" cy="205" rx="22" ry="15" />
        <ellipse class="character-part" data-part="legs" fill="${c.legs}" stroke="${OL}" stroke-width="${SW}" cx="160" cy="205" rx="22" ry="15" />
        <path class="character-part" data-part="tail" fill="${c.tail}" stroke="${OL}" stroke-width="${SW}" d="M 22 175 Q 5 175 5 188 Q 12 195 22 190 Z" />
        <ellipse class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="180" rx="72" ry="40" />
        <ellipse class="character-part" data-part="head" fill="${c.head}" stroke="${OL}" stroke-width="${SW}" cx="180" cy="160" rx="25" ry="23" />
        <circle fill="${OL}" cx="188" cy="152" r="4" />
        <circle fill="#ffffff" cx="189" cy="151" r="1.5" />
        <path fill="${OL}" d="M 195 168 Q 200 172 195 176 Z" />
        <path class="character-part" data-part="shell" fill="${c.shell}" stroke="${OL}" stroke-width="${SW}" d="M 22 170 Q 22 85 100 75 Q 178 85 178 170 Q 178 190 100 190 Q 22 190 22 170 Z" />
        <!-- Motif tengah (diamond) tetap jadi bagian shell -->
        <path class="character-part" data-part="shell" fill="${c.shell}" stroke="${OL}" stroke-width="2" d="M 100 90 L 135 135 L 100 175 L 65 135 Z" opacity="0.85" />
        <!-- Motif kiri & kanan bisa diwarnai -->
        <circle class="character-part" data-part="shellLeft" fill="${c.shellLeft}" stroke="${OL}" stroke-width="2.5" cx="50" cy="140" r="18" />
        <circle class="character-part" data-part="shellRight" fill="${c.shellRight}" stroke="${OL}" stroke-width="2.5" cx="150" cy="140" r="18" />
    </svg>`;
}

/* 7. ASTRONAUT */
function svgAstro(c) {
    return `<svg viewBox="0 -15 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect class="character-part" data-part="backpack" fill="${c.backpack}" stroke="${OL}" stroke-width="${SW}" rx="10" x="28" y="95" width="30" height="80" />
        <rect class="character-part" data-part="backpack" fill="${c.backpack}" stroke="${OL}" stroke-width="${SW}" rx="10" x="142" y="95" width="30" height="80" />
        <rect class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" rx="20" x="55" y="90" width="90" height="100" />
        <circle class="character-part" data-part="helmet" fill="${c.helmet}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="55" r="42" />
        <ellipse class="character-part" data-part="visor" fill="${c.visor}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="55" rx="30" ry="25" />
        <ellipse fill="${OL}" cx="90" cy="55" rx="4" ry="5" />
        <ellipse fill="${OL}" cx="110" cy="55" rx="4" ry="5" />
        <rect class="character-part" data-part="gloves" fill="${c.gloves}" stroke="${OL}" stroke-width="${SW}" rx="8" x="18" y="130" width="25" height="30" />
        <rect class="character-part" data-part="gloves" fill="${c.gloves}" stroke="${OL}" stroke-width="${SW}" rx="8" x="157" y="130" width="25" height="30" />
        <rect class="character-part" data-part="boots" fill="${c.boots}" stroke="${OL}" stroke-width="${SW}" rx="8" x="65" y="185" width="30" height="40" />
        <rect class="character-part" data-part="boots" fill="${c.boots}" stroke="${OL}" stroke-width="${SW}" rx="8" x="105" y="185" width="30" height="40" />
    </svg>`;
}

/* 8. IKAN */
function svgFish(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path class="character-part" data-part="tail" fill="${c.tail}" stroke="${OL}" stroke-width="${SW}" d="M 45 130 L 5 70 L 20 130 L 5 190 Z" />
        <path class="character-part" data-part="fins" fill="${c.fins}" stroke="${OL}" stroke-width="${SW}" d="M 100 85 Q 115 60 140 75 Q 125 95 100 85 Z" />
        <path class="character-part" data-part="fins" fill="${c.fins}" stroke="${OL}" stroke-width="${SW}" d="M 100 175 Q 120 200 140 185 Q 125 160 100 175 Z" />
        <ellipse class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" cx="110" cy="130" rx="82" ry="60" />
        <circle fill="${OL}" cx="150" cy="115" r="14" />
        <circle fill="#ffffff" cx="147" cy="112" r="4" />
        <path fill="${OL}" d="M 175 145 Q 185 150 175 155 Z" />
        <path class="character-part" data-part="fins" fill="${c.fins}" stroke="${OL}" stroke-width="2" d="M 70 100 Q 82 115 70 125 Q 63 115 70 100 Z" />
    </svg>`;
}

function svgSunflower(c) {
    let petals = '';
    const N = 12, cx = 100, cy = 120;
    const innerR = 30;   // pangkal kelopak (dekat pusat)
    const outerR = 70;   // ujung kelopak (lebih pendek = tidak seperti duri)
    const halfWidth = 16; // setengah lebar sudut kelopak (derajat) — lebih besar = lebih lebar
    for (let i = 0; i < N; i++) {
        const a1 = (i * 30 - halfWidth) * Math.PI / 180;
        const a2 = (i * 30 + halfWidth) * Math.PI / 180;
        const base1X = cx + Math.cos(a1 - Math.PI/2) * innerR;
        const base1Y = cy + Math.sin(a1 - Math.PI/2) * innerR;
        const base2X = cx + Math.cos(a2 - Math.PI/2) * innerR;
        const base2Y = cy + Math.sin(a2 - Math.PI/2) * innerR;
        // Ujung kelopak: pakai sudut tengah, jari-jari luar
        const midA = (i * 30) * Math.PI / 180;
        const tipX = cx + Math.cos(midA - Math.PI/2) * outerR;
        const tipY = cy + Math.sin(midA - Math.PI/2) * outerR;
        // Control point untuk sisi kiri & kanan biar kelopak membulat
        const ctrl1X = cx + Math.cos(a1 - Math.PI/2) * (outerR * 0.85);
        const ctrl1Y = cy + Math.sin(a1 - Math.PI/2) * (outerR * 0.85);
        const ctrl2X = cx + Math.cos(a2 - Math.PI/2) * (outerR * 0.85);
        const ctrl2Y = cy + Math.sin(a2 - Math.PI/2) * (outerR * 0.85);

        petals += `M ${base1X.toFixed(1)} ${base1Y.toFixed(1)} `;
        petals += `Q ${ctrl1X.toFixed(1)} ${ctrl1Y.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} `;
        petals += `Q ${ctrl2X.toFixed(1)} ${ctrl2Y.toFixed(1)} ${base2X.toFixed(1)} ${base2Y.toFixed(1)} Z `;
    }
    return `<svg viewBox="0 18 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path class="character-part" data-part="leafL" fill="${c.leafL}" stroke="${OL}" stroke-width="3" d="M 92 180 Q 60 170 50 190 Q 70 200 92 190 Z" />
        <path class="character-part" data-part="leafR" fill="${c.leafR}" stroke="${OL}" stroke-width="3" d="M 108 180 Q 140 170 150 190 Q 130 200 108 190 Z" />
        <rect class="character-part" data-part="stem" fill="${c.stem}" stroke="${OL}" stroke-width="3" x="92" y="150" width="16" height="70"/>
        <rect class="character-part" data-part="pot" fill="${c.pot}" stroke="${OL}" stroke-width="3" rx="6" x="60" y="210" width="80" height="40"/>
        <path class="character-part" data-part="petals" fill="${c.petals}" stroke="${OL}" stroke-width="2.5" d="${petals}" />
        <circle class="character-part" data-part="center" fill="${c.center}" stroke="${OL}" stroke-width="3" cx="100" cy="120" r="30"/>
    </svg>`;
}

/* 10. LABU HALLOWEEN — eyeL, eyeR, mouth bisa diwarnai */
function svgPumpkin(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path class="character-part" data-part="stem" fill="${c.stem}" stroke="${OL}" stroke-width="${SW}" d="M 92 35 L 108 35 L 108 65 L 92 65 Z" />
        <path class="character-part" data-part="leaf" fill="${c.leaf}" stroke="${OL}" stroke-width="${SW}" d="M 108 50 Q 135 38 148 58 Q 130 72 108 65 Z" />
        <ellipse class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="155" rx="85" ry="78" />
        <ellipse fill="none" stroke="${OL}" stroke-width="2" cx="100" cy="155" rx="62" ry="75" />
        <ellipse fill="none" stroke="${OL}" stroke-width="2" cx="100" cy="155" rx="35" ry="72" />
        
        <!-- Mata & mulut bisa diwarnai -->
        <path class="character-part" data-part="eyeL" fill="${c.eyeL}" stroke="${OL}" stroke-width="2" d="M 60 120 L 85 120 L 72 150 Z" />
        <path class="character-part" data-part="eyeR" fill="${c.eyeR}" stroke="${OL}" stroke-width="2" d="M 115 120 L 140 120 L 128 150 Z" />
        <path class="character-part" data-part="mouth" fill="${c.mouth}" stroke="${OL}" stroke-width="2" d="M 65 170 L 78 182 L 92 170 L 100 190 L 108 170 L 122 182 L 135 170 L 135 195 L 65 195 Z" />
    </svg>`;
}

/* 11. BERUANG */
function svgBear(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <circle class="character-part" data-part="earL" fill="${c.earL}" stroke="${OL}" stroke-width="${SW}" cx="50" cy="45" r="25" />
        <circle class="character-part" data-part="earR" fill="${c.earR}" stroke="${OL}" stroke-width="${SW}" cx="150" cy="45" r="25" />
        <circle fill="${OL}" cx="50" cy="45" r="12" />
        <circle fill="${OL}" cx="150" cy="45" r="12" />
        <ellipse class="character-part" data-part="head" fill="${c.head}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="80" rx="62" ry="55" />
        <circle fill="${OL}" cx="78" cy="75" r="8" />
        <circle fill="${OL}" cx="122" cy="75" r="8" />
        <circle fill="#ffffff" cx="75" cy="72" r="3" />
        <circle fill="#ffffff" cx="119" cy="72" r="3" />
        <ellipse fill="${OL}" cx="100" cy="98" rx="14" ry="9" />
        <path fill="${OL}" d="M 92 108 Q 100 118 108 108 Z" />
        <ellipse class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="175" rx="58" ry="55" />
        <ellipse class="character-part" data-part="belly" fill="${c.belly}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="180" rx="38" ry="42" />
        <circle class="character-part" data-part="paws" fill="${c.paws}" stroke="${OL}" stroke-width="${SW}" cx="62" cy="218" r="20" />
        <circle class="character-part" data-part="paws" fill="${c.paws}" stroke="${OL}" stroke-width="${SW}" cx="138" cy="218" r="20" />
    </svg>`;
}

/* 12. NINJA */
function svgNinja(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect class="character-part" data-part="sword" fill="${c.sword}" stroke="${OL}" stroke-width="${SW}" rx="3" x="158" y="75" width="8" height="135" />
        <rect fill="#475569" stroke="${OL}" stroke-width="2" x="160" y="200" width="40" height="8" rx="3" />
        <circle class="character-part" data-part="hood" fill="${c.hood}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="60" r="48" />
        <rect class="character-part" data-part="mask" fill="${c.mask}" stroke="${OL}" stroke-width="${SW}" x="58" y="55" width="84" height="28" rx="8" />
        <circle fill="${OL}" cx="80" cy="68" r="6" />
        <circle fill="${OL}" cx="120" cy="68" r="6" />
        <circle fill="#ffffff" cx="78" cy="66" r="2" />
        <circle fill="#ffffff" cx="118" cy="66" r="2" />
        <rect class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" rx="14" x="55" y="100" width="90" height="100" />
        <rect class="character-part" data-part="belt" fill="${c.belt}" stroke="${OL}" stroke-width="${SW}" rx="4" x="55" y="165" width="90" height="14" />
        <rect fill="${OL}" x="90" y="168" width="20" height="8" rx="2" />
        <rect class="character-part" data-part="legs" fill="${c.legs}" stroke="${OL}" stroke-width="${SW}" rx="8" x="65" y="200" width="28" height="35" />
		<rect class="character-part" data-part="legs" fill="${c.legs}" stroke="${OL}" stroke-width="${SW}" rx="8" x="107" y="200" width="28" height="35" />
    </svg>`;
}

/* 13. PIZZA */
function svgPizza(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <ellipse class="character-part" data-part="plate" fill="${c.plate}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="215" rx="88" ry="18" />
        <path class="character-part" data-part="crust" fill="${c.crust}" stroke="${OL}" stroke-width="${SW}" d="M 100 25 L 15 205 Q 100 230 185 205 Z" />
        <path class="character-part" data-part="cheese" fill="${c.cheese}" stroke="${OL}" stroke-width="2" d="M 100 50 L 32 200 Q 100 218 168 200 Z" />
        <circle class="character-part" data-part="pepperoni" fill="${c.pepperoni}" stroke="${OL}" stroke-width="2" cx="72" cy="120" r="14" />
        <circle class="character-part" data-part="pepperoni" fill="${c.pepperoni}" stroke="${OL}" stroke-width="2" cx="128" cy="130" r="14" />
        <circle class="character-part" data-part="pepperoni" fill="${c.pepperoni}" stroke="${OL}" stroke-width="2" cx="92" cy="175" r="14" />
        <ellipse class="character-part" data-part="basil" fill="${c.basil}" stroke="${OL}" stroke-width="2" cx="60" cy="160" rx="12" ry="7" />
        <ellipse class="character-part" data-part="basil" fill="${c.basil}" stroke="${OL}" stroke-width="2" cx="140" cy="178" rx="12" ry="7" />
    </svg>`;
}

/* 14. PESAWAT */
function svgPlane(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <ellipse class="character-part" data-part="wing" fill="${c.wing}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="145" rx="95" ry="24" />
        <path class="character-part" data-part="tail" fill="${c.tail}" stroke="${OL}" stroke-width="${SW}" d="M 140 115 L 175 55 L 185 55 L 180 115 Z" />
        <ellipse class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="145" rx="88" ry="38" />
        <path class="character-part" data-part="nose" fill="${c.nose}" stroke="${OL}" stroke-width="2" d="M 15 145 L 35 122 L 52 145 L 35 168 Z" />
        <circle class="character-part" data-part="window" fill="${c.window}" stroke="${OL}" stroke-width="2" cx="70" cy="135" r="9" />
        <circle class="character-part" data-part="window" fill="${c.window}" stroke="${OL}" stroke-width="2" cx="98" cy="135" r="9" />
        <circle class="character-part" data-part="window" fill="${c.window}" stroke="${OL}" stroke-width="2" cx="126" cy="135" r="9" />
        <ellipse class="character-part" data-part="propeller" fill="${c.propeller}" stroke="${OL}" stroke-width="2" cx="15" cy="145" rx="5" ry="28" />
        <circle fill="${OL}" cx="15" cy="145" r="4" />
    </svg>`;
}

/* 15. KUE */
function svgCake(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect class="character-part" data-part="base" fill="${c.base}" stroke="${OL}" stroke-width="${SW}" rx="8" x="25" y="140" width="150" height="90" />
        <rect class="character-part" data-part="top" fill="${c.top}" stroke="${OL}" stroke-width="${SW}" rx="8" x="20" y="115" width="160" height="45" />
        <path class="character-part" data-part="frosting" fill="${c.frosting}" stroke="${OL}" stroke-width="2" d="M 20 140 Q 32 158 44 140 Q 56 158 68 140 Q 80 158 92 140 Q 104 158 116 140 Q 128 158 140 140 Q 152 158 164 140 Q 176 158 180 140 L 180 125 L 20 125 Z" />
        <rect class="character-part" data-part="candle" fill="${c.candle}" stroke="${OL}" stroke-width="2" x="93" y="75" width="14" height="45" rx="3" />
        <path class="character-part" data-part="flame" fill="${c.flame}" stroke="${OL}" stroke-width="2" d="M 100 50 Q 87 70 100 78 Q 113 70 100 50 Z" />
    </svg>`;
}

/* 16. SINGA */
function svgLion(c) {
    return `<svg viewBox="0 -9 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path class="character-part" data-part="tail" fill="${c.tail}" stroke="${OL}" stroke-width="${SW}" d="M 25 195 Q 8 175 15 150 Q 28 140 40 152 Q 45 165 32 175 Q 38 185 50 195 Z" />
        <ellipse class="character-part" data-part="legs" fill="${c.legs}" stroke="${OL}" stroke-width="${SW}" cx="62" cy="215" rx="20" ry="18" />
        <ellipse class="character-part" data-part="legs" fill="${c.legs}" stroke="${OL}" stroke-width="${SW}" cx="138" cy="215" rx="20" ry="18" />
        <ellipse class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="170" rx="60" ry="55" />
        <circle class="character-part" data-part="mane" fill="${c.mane}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="80" r="68" />
        <circle class="character-part" data-part="mane" fill="${c.mane}" stroke="${OL}" stroke-width="${SW}" cx="50" cy="45" r="20" />
        <circle class="character-part" data-part="mane" fill="${c.mane}" stroke="${OL}" stroke-width="${SW}" cx="150" cy="45" r="20" />
        <circle class="character-part" data-part="mane" fill="${c.mane}" stroke="${OL}" stroke-width="${SW}" cx="28" cy="85" r="20" />
        <circle class="character-part" data-part="mane" fill="${c.mane}" stroke="${OL}" stroke-width="${SW}" cx="172" cy="85" r="20" />
        <circle class="character-part" data-part="mane" fill="${c.mane}" stroke="${OL}" stroke-width="${SW}" cx="45" cy="130" r="20" />
        <circle class="character-part" data-part="mane" fill="${c.mane}" stroke="${OL}" stroke-width="${SW}" cx="155" cy="130" r="20" />
        <circle class="character-part" data-part="face" fill="${c.face}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="80" r="45" />
        <circle fill="${OL}" cx="83" cy="70" r="6" />
        <circle fill="${OL}" cx="117" cy="70" r="6" />
        <circle fill="#ffffff" cx="81" cy="68" r="2" />
        <circle fill="#ffffff" cx="115" cy="68" r="2" />
        <path fill="${OL}" d="M 93 92 L 107 92 L 100 104 Z" />
        <path fill="${OL}" d="M 100 104 Q 88 116 82 110 M 100 104 Q 112 116 118 110" stroke="${OL}" stroke-width="2.5" fill="none" />
    </svg>`;
}

/* 17. PENGUIN */
function svgPenguin(c) {
    return `<svg viewBox="0 -15 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <ellipse class="character-part" data-part="feet" fill="${c.feet}" stroke="${OL}" stroke-width="${SW}" cx="68" cy="218" rx="24" ry="14" />
        <ellipse class="character-part" data-part="feet" fill="${c.feet}" stroke="${OL}" stroke-width="${SW}" cx="132" cy="218" rx="24" ry="14" />
        <ellipse class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="140" rx="68" ry="85" />
        <ellipse class="character-part" data-part="belly" fill="${c.belly}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="150" rx="45" ry="70" />
        <ellipse class="character-part" data-part="hat" fill="${c.hat}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="40" rx="50" ry="18" />
        <rect class="character-part" data-part="hat" fill="${c.hat}" stroke="${OL}" stroke-width="${SW}" x="72" y="15" width="56" height="30" rx="6" />
        <circle class="character-part" data-part="hat" fill="${c.hat}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="12" r="12" />
        <circle fill="${OL}" cx="78" cy="80" r="6" />
        <circle fill="${OL}" cx="122" cy="80" r="6" />
        <circle fill="#ffffff" cx="76" cy="78" r="2" />
        <circle fill="#ffffff" cx="120" cy="78" r="2" />
        <path class="character-part" data-part="beak" fill="${c.beak}" stroke="${OL}" stroke-width="2" d="M 88 95 L 112 95 L 100 112 Z" />
        <rect class="character-part" data-part="scarf" fill="${c.scarf}" stroke="${OL}" stroke-width="2" x="58" y="118" width="84" height="16" rx="4" />
        <path class="character-part" data-part="scarf" fill="${c.scarf}" stroke="${OL}" stroke-width="2" d="M 132 130 L 150 165 L 132 165 Z" />
    </svg>`;
}

/* 18. KUPU-KUPU */
function svgButterfly(c) {
    return `<svg viewBox="0 -10 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <ellipse class="character-part" data-part="wingUL" fill="${c.wingUL}" stroke="${OL}" stroke-width="${SW}" cx="65" cy="80" rx="50" ry="55" />
        <ellipse class="character-part" data-part="wingUR" fill="${c.wingUR}" stroke="${OL}" stroke-width="${SW}" cx="135" cy="80" rx="50" ry="55" />
        <ellipse class="character-part" data-part="wingLL" fill="${c.wingLL}" stroke="${OL}" stroke-width="${SW}" cx="70" cy="170" rx="45" ry="50" />
        <ellipse class="character-part" data-part="wingLR" fill="${c.wingLR}" stroke="${OL}" stroke-width="${SW}" cx="130" cy="170" rx="45" ry="50" />
        <circle class="character-part" data-part="spots" fill="${c.spots}" stroke="${OL}" stroke-width="2" cx="60" cy="75" r="12" />
        <circle class="character-part" data-part="spots" fill="${c.spots}" stroke="${OL}" stroke-width="2" cx="140" cy="75" r="12" />
        <circle class="character-part" data-part="spots" fill="${c.spots}" stroke="${OL}" stroke-width="2" cx="65" cy="170" r="10" />
        <circle class="character-part" data-part="spots" fill="${c.spots}" stroke="${OL}" stroke-width="2" cx="135" cy="170" r="10" />
        <ellipse fill="${OL}" stroke="${OL}" stroke-width="2" cx="100" cy="130" rx="9" ry="60" />
        <ellipse fill="${OL}" stroke="${OL}" stroke-width="2" cx="100" cy="68" r="16" />
        <path fill="${OL}" d="M 94 55 Q 82 35 78 28 M 106 55 Q 118 35 122 28" stroke="${OL}" stroke-width="2.5" fill="none" />
        <circle fill="${OL}" cx="78" cy="28" r="4" />
        <circle fill="${OL}" cx="122" cy="28" r="4" />
    </svg>`;
}

/* 19. MOBIL — trapesium lebih panjang */
function svgCar(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect class="character-part" data-part="bumper" fill="${c.bumper}" stroke="${OL}" stroke-width="${SW}" x="15" y="180" width="170" height="18" rx="6" />
        <path class="character-part" data-part="roof" fill="${c.roof}" stroke="${OL}" stroke-width="${SW}" d="M 30 105 L 55 60 L 145 60 L 170 105 Z" />
        <rect class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" rx="18" x="15" y="105" width="170" height="80" />
        <rect class="character-part" data-part="windows" fill="${c.windows}" stroke="${OL}" stroke-width="2.5" x="62" y="72" width="32" height="28" rx="4" />
        <rect class="character-part" data-part="windows" fill="${c.windows}" stroke="${OL}" stroke-width="2.5" x="106" y="72" width="32" height="28" rx="4" />
        <circle class="character-part" data-part="lights" fill="${c.lights}" stroke="${OL}" stroke-width="2" cx="28" cy="130" r="9" />
        <circle class="character-part" data-part="lights" fill="${c.lights}" stroke="${OL}" stroke-width="2" cx="172" cy="130" r="9" />
        <circle class="character-part" data-part="wheels" fill="${c.wheels}" stroke="${OL}" stroke-width="${SW}" cx="55" cy="195" r="26" />
        <circle class="character-part" data-part="wheels" fill="${c.wheels}" stroke="${OL}" stroke-width="${SW}" cx="145" cy="195" r="26" />
        <circle fill="#ffffff" stroke="${OL}" stroke-width="2" cx="55" cy="195" r="10" />
        <circle fill="#ffffff" stroke="${OL}" stroke-width="2" cx="145" cy="195" r="10" />
    </svg>`;
}

/* 20. RUMAH */
function svgHouse(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect class="character-part" data-part="chimney" fill="${c.chimney}" stroke="${OL}" stroke-width="${SW}" x="140" y="45" width="22" height="45" />
        <rect class="character-part" data-part="walls" fill="${c.walls}" stroke="${OL}" stroke-width="${SW}" x="22" y="115" width="156" height="115" />
        <polygon class="character-part" data-part="roof" fill="${c.roof}" stroke="${OL}" stroke-width="${SW}" points="5,118 100,40 195,118" />
        <rect class="character-part" data-part="door" fill="${c.door}" stroke="${OL}" stroke-width="${SW}" x="82" y="165" width="38" height="65" rx="3" />
        <circle fill="${OL}" cx="112" cy="200" r="3.5" />
        <rect class="character-part" data-part="windows" fill="${c.windows}" stroke="${OL}" stroke-width="2.5" x="38" y="140" width="34" height="34" />
        <line x1="55" y1="140" x2="55" y2="174" stroke="${OL}" stroke-width="2" />
        <line x1="38" y1="157" x2="72" y2="157" stroke="${OL}" stroke-width="2" />
        <rect class="character-part" data-part="windows" fill="${c.windows}" stroke="${OL}" stroke-width="2.5" x="128" y="140" width="34" height="34" />
        <line x1="145" y1="140" x2="145" y2="174" stroke="${OL}" stroke-width="2" />
        <line x1="128" y1="157" x2="162" y2="157" stroke="${OL}" stroke-width="2" />
    </svg>`;
}

/* 21. PELANGI — arc2 & arc4 bisa diwarnai */
function svgRainbow(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path class="character-part" data-part="arc1" fill="${c.arc1}" stroke="${OL}" stroke-width="2" d="M 15 205 Q 15 60 100 60 Q 185 60 185 205 L 165 205 Q 165 80 100 80 Q 35 80 35 205 Z" />
        <path class="character-part" data-part="arc2" fill="${c.arc2}" stroke="${OL}" stroke-width="2" d="M 35 205 Q 35 80 100 80 Q 165 80 165 205 L 145 205 Q 145 100 100 100 Q 55 100 55 205 Z" />
        <path class="character-part" data-part="arc3" fill="${c.arc3}" stroke="${OL}" stroke-width="2" d="M 55 205 Q 55 100 100 100 Q 145 100 145 205 L 125 205 Q 125 120 100 120 Q 75 120 75 205 Z" />
        <path class="character-part" data-part="arc4" fill="${c.arc4}" stroke="${OL}" stroke-width="2" d="M 75 205 Q 75 120 100 120 Q 125 120 125 205 L 105 205 Q 105 140 100 140 Q 95 140 95 205 Z" />
        <path class="character-part" data-part="arc5" fill="${c.arc5}" stroke="${OL}" stroke-width="2" d="M 95 205 Q 95 140 100 140 Q 105 140 105 205 Z" />
        <ellipse class="character-part" data-part="cloud" fill="${c.cloud}" stroke="${OL}" stroke-width="${SW}" cx="30" cy="200" rx="30" ry="20" />
        <ellipse class="character-part" data-part="cloud" fill="${c.cloud}" stroke="${OL}" stroke-width="${SW}" cx="30" cy="210" rx="22" ry="12" />
        <ellipse class="character-part" data-part="cloud" fill="${c.cloud}" stroke="${OL}" stroke-width="${SW}" cx="170" cy="200" rx="30" ry="20" />
        <ellipse class="character-part" data-part="cloud" fill="${c.cloud}" stroke="${OL}" stroke-width="${SW}" cx="170" cy="210" rx="22" ry="12" />
    </svg>`;
}

/* 22. ES KRIM — cherry bisa diwarnai */
function svgIcecream(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <!-- Cone -->
        <path class="character-part" data-part="cone" fill="${c.cone}" stroke="${OL}" stroke-width="${SW}" d="M 45 130 L 155 130 L 100 235 Z" />
        <line x1="55" y1="145" x2="145" y2="145" stroke="${OL}" stroke-width="2" opacity="0.6" />
        <line x1="62" y1="165" x2="138" y2="165" stroke="${OL}" stroke-width="2" opacity="0.6" />
        <line x1="70" y1="185" x2="130" y2="185" stroke="${OL}" stroke-width="2" opacity="0.6" />
        <line x1="78" y1="205" x2="122" y2="205" stroke="${OL}" stroke-width="2" opacity="0.6" />
        <line x1="86" y1="222" x2="114" y2="222" stroke="${OL}" stroke-width="2" opacity="0.6" />
        <line x1="60" y1="135" x2="90" y2="215" stroke="${OL}" stroke-width="1.5" opacity="0.4" />
        <line x1="100" y1="130" x2="100" y2="235" stroke="${OL}" stroke-width="1.5" opacity="0.4" />
        <line x1="140" y1="135" x2="110" y2="215" stroke="${OL}" stroke-width="1.5" opacity="0.4" />
        
        <!-- Scoop 1 (kiri) -->
        <circle class="character-part" data-part="scoop1" fill="${c.scoop1}" stroke="${OL}" stroke-width="${SW}" cx="55" cy="105" r="35" />
        
        <!-- Scoop 2 (tengah) -->
        <circle class="character-part" data-part="scoop2" fill="${c.scoop2}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="95" r="38" />
        
        <!-- Scoop 3 (kanan) -->
        <circle class="character-part" data-part="scoop3" fill="${c.scoop3}" stroke="${OL}" stroke-width="${SW}" cx="145" cy="105" r="35" />
        
        <!-- Sprinkles -->
        <circle class="character-part" data-part="sprinkles" fill="${c.sprinkles}" stroke="${OL}" stroke-width="2" cx="38" cy="88" r="9" />
        <circle class="character-part" data-part="sprinkles" fill="${c.sprinkles}" stroke="${OL}" stroke-width="2" cx="68" cy="68" r="9" />
        <circle class="character-part" data-part="sprinkles" fill="${c.sprinkles}" stroke="${OL}" stroke-width="2" cx="100" cy="55" r="10" />
        <circle class="character-part" data-part="sprinkles" fill="${c.sprinkles}" stroke="${OL}" stroke-width="2" cx="132" cy="68" r="9" />
        <circle class="character-part" data-part="sprinkles" fill="${c.sprinkles}" stroke="${OL}" stroke-width="2" cx="162" cy="88" r="9" />
        <circle class="character-part" data-part="sprinkles" fill="${c.sprinkles}" stroke="${OL}" stroke-width="2" cx="48" cy="118" r="8" />
        <circle class="character-part" data-part="sprinkles" fill="${c.sprinkles}" stroke="${OL}" stroke-width="2" cx="100" cy="120" r="9" />
        <circle class="character-part" data-part="sprinkles" fill="${c.sprinkles}" stroke="${OL}" stroke-width="2" cx="152" cy="118" r="8" />
        
        <!-- Ceri (bisa diwarnai) -->
        <circle class="character-part" data-part="cherry" fill="${c.cherry}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="30" r="18" />
        <path d="M 100 12 Q 108 2 115 -5" stroke="${OL}" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <circle fill="#ffffff" opacity="0.6" cx="93" cy="25" r="4" />
    </svg>`;
}

/* 23. BURUNG HANTU */
function svgOwl(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path class="character-part" data-part="wings" fill="${c.wings}" stroke="${OL}" stroke-width="${SW}" d="M 38 85 L 8 130 L 38 195 Z" />
        <path class="character-part" data-part="wings" fill="${c.wings}" stroke="${OL}" stroke-width="${SW}" d="M 162 85 L 192 130 L 162 195 Z" />
        <ellipse class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="145" rx="65" ry="82" />
        <ellipse class="character-part" data-part="belly" fill="${c.belly}" stroke="${OL}" stroke-width="2.5" cx="100" cy="160" rx="42" ry="62" />
        <circle class="character-part" data-part="eyeL" fill="${c.eyeL}" stroke="${OL}" stroke-width="${SW}" cx="70" cy="80" r="26" />
        <circle class="character-part" data-part="eyeR" fill="${c.eyeR}" stroke="${OL}" stroke-width="${SW}" cx="130" cy="80" r="26" />
        <circle fill="${OL}" cx="70" cy="80" r="13" />
        <circle fill="${OL}" cx="130" cy="80" r="13" />
        <circle fill="#ffffff" cx="66" cy="76" r="4" />
        <circle fill="#ffffff" cx="126" cy="76" r="4" />
        <path class="character-part" data-part="beak" fill="${c.beak}" stroke="${OL}" stroke-width="2" d="M 88 105 L 112 105 L 100 128 Z" />
        <path fill="${OL}" d="M 62 52 Q 70 32 82 48 M 138 52 Q 130 32 118 48" stroke="${OL}" stroke-width="2.5" fill="none" />
        <path fill="none" stroke="${OL}" stroke-width="3" d="M 75 218 L 75 230 M 125 218 L 125 230" />
    </svg>`;
}

/* 24. KATAK */
function svgFrog(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <ellipse class="character-part" data-part="legs" fill="${c.legs}" stroke="${OL}" stroke-width="${SW}" cx="38" cy="212" rx="30" ry="22" />
        <ellipse class="character-part" data-part="legs" fill="${c.legs}" stroke="${OL}" stroke-width="${SW}" cx="162" cy="212" rx="30" ry="22" />
        <ellipse class="character-part" data-part="body" fill="${c.body}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="155" rx="78" ry="72" />
        <ellipse class="character-part" data-part="belly" fill="${c.belly}" stroke="${OL}" stroke-width="${SW}" cx="100" cy="178" rx="50" ry="45" />
        <circle class="character-part" data-part="spots" fill="${c.spots}" stroke="${OL}" stroke-width="2" cx="60" cy="130" r="8" />
        <circle class="character-part" data-part="spots" fill="${c.spots}" stroke="${OL}" stroke-width="2" cx="140" cy="130" r="8" />
        <circle class="character-part" data-part="eyeL" fill="${c.eyeL}" stroke="${OL}" stroke-width="${SW}" cx="62" cy="80" r="28" />
        <circle class="character-part" data-part="eyeR" fill="${c.eyeR}" stroke="${OL}" stroke-width="${SW}" cx="138" cy="80" r="28" />
        <circle fill="${OL}" cx="62" cy="80" r="14" />
        <circle fill="${OL}" cx="138" cy="80" r="14" />
        <circle fill="#ffffff" cx="58" cy="76" r="4.5" />
        <circle fill="#ffffff" cx="134" cy="76" r="4.5" />
        <path fill="${OL}" d="M 75 118 Q 100 145 125 118" stroke="${OL}" stroke-width="3.5" fill="none" stroke-linecap="round" />
    </svg>`;
}

/* 25. TRUK */
function svgTrain(c) {
    return `<svg viewBox="0 0 200 260" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect class="character-part" data-part="engine" fill="${c.engine}" stroke="${OL}" stroke-width="${SW}" x="15" y="110" width="80" height="85" rx="6" />
        <line x1="55" y1="110" x2="55" y2="195" stroke="${OL}" stroke-width="2" />
        <rect class="character-part" data-part="cabin" fill="${c.cabin}" stroke="${OL}" stroke-width="${SW}" x="100" y="75" width="80" height="120" rx="6" />
        <rect class="character-part" data-part="chimney" fill="${c.chimney}" stroke="${OL}" stroke-width="${SW}" x="110" y="55" width="22" height="25" rx="3" />
        <ellipse class="character-part" data-part="smoke" fill="${c.smoke}" stroke="${OL}" stroke-width="2" cx="121" cy="45" r="10" />
        <ellipse class="character-part" data-part="smoke" fill="${c.smoke}" stroke="${OL}" stroke-width="2" cx="121" cy="25" r="8" />
        <rect fill="${OL}" x="115" y="95" width="22" height="22" rx="3" />
        <rect fill="${OL}" x="145" y="95" width="22" height="22" rx="3" />
        <circle class="character-part" data-part="wheels" fill="${c.wheels}" stroke="${OL}" stroke-width="2" cx="180" cy="140" r="8" />
        <rect class="character-part" data-part="track" fill="${c.track}" stroke="${OL}" stroke-width="${SW}" x="95" y="192" width="90" height="10" rx="3" />
        <circle class="character-part" data-part="wheels" fill="${c.wheels}" stroke="${OL}" stroke-width="${SW}" cx="45" cy="200" r="22" />
        <circle class="character-part" data-part="wheels" fill="${c.wheels}" stroke="${OL}" stroke-width="${SW}" cx="80" cy="200" r="22" />
        <circle class="character-part" data-part="wheels" fill="${c.wheels}" stroke="${OL}" stroke-width="${SW}" cx="125" cy="200" r="22" />
        <circle class="character-part" data-part="wheels" fill="${c.wheels}" stroke="${OL}" stroke-width="${SW}" cx="160" cy="200" r="22" />
        <circle fill="#ffffff" stroke="${OL}" stroke-width="2" cx="45" cy="200" r="8" />
        <circle fill="#ffffff" stroke="${OL}" stroke-width="2" cx="80" cy="200" r="8" />
        <circle fill="#ffffff" stroke="${OL}" stroke-width="2" cx="125" cy="200" r="8" />
        <circle fill="#ffffff" stroke="${OL}" stroke-width="2" cx="160" cy="200" r="8" />
    </svg>`;
}

/* ============================================================
   MAP: id → fungsi SVG
   ============================================================ */
const SVG_RENDERERS = {
    robot: svgRobot,
    monster: svgMonster,
    superhero: svgSuperhero,
    cat: svgCat,
    dog: svgDog,
    turtle: svgTurtle,
    astro: svgAstro,
    fish: svgFish,
    sunflower: svgSunflower,
    pumpkin: svgPumpkin,
    bear: svgBear,
    ninja: svgNinja,
    pizza: svgPizza,
    plane: svgPlane,
    cake: svgCake,
    lion: svgLion,
    penguin: svgPenguin,
    butterfly: svgButterfly,
    car: svgCar,
    house: svgHouse,
    rainbow: svgRainbow,
    icecream: svgIcecream,
    owl: svgOwl,
    frog: svgFrog,
    train: svgTrain
};

function renderCharacter(templateId, colors) {
    const fn = SVG_RENDERERS[templateId] || svgRobot;
    return fn(colors);
}

window.renderCharacter = renderCharacter;
window.SVG_RENDERERS = SVG_RENDERERS;