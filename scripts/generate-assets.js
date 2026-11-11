import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 1. AVATARS
const avatarsDir = path.join(ROOT, 'public/assets/avatars');
ensureDir(avatarsDir);

function createAvatar({ skin = '#6A412A', capColor = '#0F56B3', capBrim = '#0A3F85', hair = '#1E1B18', shirt = '#0F56B3', collar = '#F5A623', female = false, beard = false, suit = false, tie = false, glasses = false }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" fill="none">
    <defs>
      <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4A90E2"/>
        <stop offset="100%" stop-color="#1A53B0"/>
      </linearGradient>
      <linearGradient id="skinG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${skin}"/>
        <stop offset="100%" stop-color="#3F2415"/>
      </linearGradient>
      <linearGradient id="shirtG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${suit ? '#1A2942' : shirt}"/>
        <stop offset="100%" stop-color="${suit ? '#0A1322' : '#0B3B7B'}"/>
      </linearGradient>
      <clipPath id="circleClip">
        <circle cx="100" cy="100" r="96"/>
      </clipPath>
    </defs>
    
    <!-- Circle background -->
    <circle cx="100" cy="100" r="98" fill="url(#bgG)"/>
    
    <g clip-path="url(#circleClip)">
      <!-- Torso / Shoulders -->
      <path d="M40 200C40 162 68 140 100 140C132 140 160 162 160 200Z" fill="url(#shirtG)"/>
      
      ${suit ? `
        <!-- White shirt collar & tie -->
        <path d="M88 140L100 160L112 140H124L100 174L76 140H88Z" fill="#FFFFFF"/>
        <path d="M96 154L100 196L104 154Z" fill="${tie ? '#D92D20' : '#0F56B3'}"/>
      ` : `
        <!-- Polo Collar (Yellow) -->
        <path d="M82 140L100 168L118 140L130 144L100 178L70 144Z" fill="${collar}"/>
        <path d="M90 140L100 156L110 140Z" fill="${skin}"/>
      `}
      
      <!-- Neck -->
      <rect x="85" y="112" width="30" height="34" rx="6" fill="url(#skinG)"/>
      
      <!-- Head -->
      <ellipse cx="100" cy="92" rx="38" ry="44" fill="url(#skinG)"/>
      
      ${female ? `
        <!-- Hair (Female) -->
        <path d="M60 85C60 60 75 48 100 48C125 48 140 60 140 85C140 115 136 125 142 145H58C64 125 60 115 60 85Z" fill="${hair}"/>
      ` : `
        <!-- Hair (Male side) -->
        <path d="M62 82C62 65 72 55 100 55C128 55 138 65 138 82Z" fill="${hair}"/>
      `}
      
      <!-- Ears -->
      <ellipse cx="61" cy="94" rx="7" ry="11" fill="url(#skinG)"/>
      <ellipse cx="139" cy="94" rx="7" ry="11" fill="url(#skinG)"/>
      
      <!-- Eyes & Eyebrows -->
      <ellipse cx="85" cy="88" rx="5" ry="3.5" fill="#1C140E"/>
      <circle cx="86" cy="87" r="1.2" fill="#FFFFFF"/>
      <ellipse cx="115" cy="88" rx="5" ry="3.5" fill="#1C140E"/>
      <circle cx="116" cy="87" r="1.2" fill="#FFFFFF"/>
      <path d="M78 81Q85 78 92 81" stroke="#1A110B" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M108 81Q115 78 122 81" stroke="#1A110B" stroke-width="2.5" stroke-linecap="round"/>
      
      <!-- Nose -->
      <path d="M96 92Q100 102 104 92" stroke="#2B160C" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      
      <!-- Mouth / Smile -->
      <path d="M88 110Q100 120 112 110" stroke="#FFFFFF" stroke-width="3" fill="#883333" stroke-linecap="round"/>
      
      ${beard ? `
        <!-- Beard -->
        <path d="M72 98C76 126 88 136 100 136C112 136 124 126 128 98C120 106 112 108 100 108C88 108 80 106 72 98Z" fill="#1E1712" opacity="0.85"/>
      ` : ''}
      
      ${!suit ? `
        <!-- Cap Base -->
        <path d="M62 76C62 48 78 40 100 40C122 40 138 48 138 76H62Z" fill="${capColor}"/>
        <!-- Cap Brim -->
        <path d="M52 74C65 68 135 68 148 74C140 82 60 82 52 74Z" fill="${capBrim}"/>
        <!-- Cap Logo (Teardrop) -->
        <path d="M100 48C97 53 94 57 94 61C94 64 97 67 100 67C103 67 106 64 106 61C106 57 103 53 100 48Z" fill="#F5A623"/>
      ` : ''}
    </g>
  </svg>`;
}

const avatars = [
  { file: 'pompiste.svg', options: { skin: '#6E4226', capColor: '#125BB5', capBrim: '#0D3E80', female: false } },
  { file: 'chef-de-piste.svg', options: { skin: '#5B371E', capColor: '#125BB5', capBrim: '#0D3E80', female: false } },
  { file: 'caissiere.svg', options: { skin: '#784628', capColor: '#125BB5', capBrim: '#0D3E80', female: true, hair: '#140F0B' } },
  { file: 'chef-de-poste.svg', options: { skin: '#4A2A14', capColor: '#125BB5', capBrim: '#0D3E80', beard: true } },
  { file: 'rayonniste.svg', options: { skin: '#6A3E22', capColor: '#125BB5', capBrim: '#0D3E80' } },
  { file: 'agent-comptoir.svg', options: { skin: '#7B4C2C', capColor: '#D97706', capBrim: '#B45309', collar: '#FFFFFF', female: true } },
  { file: 'gerant.svg', options: { skin: '#5A351D', suit: true, tie: true, beard: true } },
  { file: 'pierre-moukala.svg', options: { skin: '#5F3920', capColor: '#125BB5', capBrim: '#0D3E80' } },
  { file: 'michel-ngoma.svg', options: { skin: '#502F18', capColor: '#125BB5', capBrim: '#0D3E80' } },
  { file: 'daniel-bikoumou.svg', options: { skin: '#693F23', capColor: '#125BB5', capBrim: '#0D3E80' } },
  { file: 'alain-matsanga.svg', options: { skin: '#573319', capColor: '#125BB5', capBrim: '#0D3E80' } },
  { file: 'marie-bibang.svg', options: { skin: '#754527', capColor: '#125BB5', capBrim: '#0D3E80', female: true } },
  { file: 'agnes-matsanga.svg', options: { skin: '#7C4B2B', capColor: '#125BB5', capBrim: '#0D3E80', female: true } }
];

avatars.forEach(a => {
  fs.writeFileSync(path.join(avatarsDir, a.file), createAvatar(a.options));
});
console.log(`Created ${avatars.length} avatars.`);

// 2. PRODUCTS
const productsDir = path.join(ROOT, 'public/assets/products');
ensureDir(productsDir);

const products = {
  'gaz-butane.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200" fill="none">
    <defs>
      <linearGradient id="gasG" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0F4BA8"/>
        <stop offset="25%" stop-color="#1E75E8"/>
        <stop offset="60%" stop-color="#3D92FF"/>
        <stop offset="85%" stop-color="#1A60CC"/>
        <stop offset="100%" stop-color="#0B377A"/>
      </linearGradient>
      <linearGradient id="metalG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D1D5DB"/>
        <stop offset="50%" stop-color="#9CA3AF"/>
        <stop offset="100%" stop-color="#4B5563"/>
      </linearGradient>
      <filter id="pShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#0C285A" flood-opacity="0.18"/>
      </filter>
    </defs>
    <g filter="url(#pShadow)">
      <!-- Collar Handle Ring -->
      <path d="M48 30C48 20 62 16 80 16C98 16 112 20 112 30V48H48V30Z" fill="url(#gasG)"/>
      <ellipse cx="80" cy="30" rx="20" ry="6" fill="#0A2C68"/>
      <!-- Valve -->
      <rect x="74" y="24" width="12" height="18" rx="2" fill="url(#metalG)"/>
      <circle cx="80" cy="22" r="5" fill="#EF4444"/>
      <!-- Cylinder Body Top Dome -->
      <path d="M32 80C32 54 52 46 80 46C108 46 128 54 128 80Z" fill="url(#gasG)"/>
      <!-- Middle Main Body -->
      <rect x="32" y="80" width="96" height="85" fill="url(#gasG)"/>
      <!-- Weld ring ridge -->
      <rect x="30" y="112" width="100" height="6" rx="3" fill="#1256BA"/>
      <!-- Bottom Dome -->
      <path d="M32 165C32 182 52 188 80 188C108 188 128 182 128 165Z" fill="url(#gasG)"/>
      <!-- Base Ring Foot -->
      <path d="M44 182C44 192 60 196 80 196C100 196 116 192 116 182V192C116 197 100 200 80 200C60 200 44 197 44 192Z" fill="#0A2C68"/>
      <!-- Specular Highlight Strip -->
      <rect x="58" y="52" width="10" height="126" rx="5" fill="#FFFFFF" opacity="0.35"/>
      <!-- Label "TOTAL" or "6 KG" badge -->
      <rect x="56" y="90" width="48" height="18" rx="3" fill="#FFFFFF" opacity="0.9"/>
      <text x="80" y="103" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0F4BA8" text-anchor="middle">6 KG</text>
    </g>
  </svg>`,

  'gazoil.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" fill="none">
    <defs>
      <linearGradient id="nozG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFD000"/>
        <stop offset="100%" stop-color="#E59400"/>
      </linearGradient>
      <linearGradient id="pipeG" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#94A3B8"/>
        <stop offset="50%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#64748B"/>
      </linearGradient>
    </defs>
    <!-- Fuel Dispenser Nozzle -->
    <!-- Metal Pipe Spout -->
    <path d="M96 28L130 52L134 46L102 24C98 21 92 23 88 28L60 62L68 68L94 36C95 34 96 30 96 28Z" fill="url(#pipeG)"/>
    <path d="M128 50L144 62L140 66L126 54Z" fill="#475569"/>
    <!-- Yellow Handle Body -->
    <path d="M48 64C48 58 54 54 60 56L92 72C98 75 100 82 98 88L84 122C81 128 74 130 68 128L48 116C42 113 40 106 42 100L48 64Z" fill="url(#nozG)"/>
    <!-- Black Grip trigger guard -->
    <path d="M54 78C62 82 72 86 80 84C82 83 84 88 82 94C74 102 62 98 56 90Z" fill="#1E293B"/>
    <!-- Trigger Lever -->
    <rect x="62" y="86" width="18" height="4" rx="2" transform="rotate(-25 62 86)" fill="#CBD5E1"/>
    <!-- Black Hose tail -->
    <path d="M44 112C36 116 28 126 24 140H16C18 120 30 106 40 102Z" fill="#1E293B"/>
  </svg>`,

  'super.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" fill="none">
    <defs>
      <linearGradient id="supG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF5722"/>
        <stop offset="100%" stop-color="#D84315"/>
      </linearGradient>
      <linearGradient id="metalP" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#94A3B8"/>
        <stop offset="50%" stop-color="#E2E8F0"/>
        <stop offset="100%" stop-color="#64748B"/>
      </linearGradient>
    </defs>
    <!-- Red/Orange Fuel Dispenser Nozzle -->
    <path d="M96 28L130 52L134 46L102 24C98 21 92 23 88 28L60 62L68 68L94 36C95 34 96 30 96 28Z" fill="url(#metalP)"/>
    <path d="M128 50L144 62L140 66L126 54Z" fill="#334155"/>
    <path d="M48 64C48 58 54 54 60 56L92 72C98 75 100 82 98 88L84 122C81 128 74 130 68 128L48 116C42 113 40 106 42 100L48 64Z" fill="url(#supG)"/>
    <path d="M54 78C62 82 72 86 80 84C82 83 84 88 82 94C74 102 62 98 56 90Z" fill="#1E293B"/>
    <rect x="62" y="86" width="18" height="4" rx="2" transform="rotate(-25 62 86)" fill="#CBD5E1"/>
    <path d="M44 112C36 116 28 126 24 140H16C18 120 30 106 40 102Z" fill="#1E293B"/>
    <!-- Specular Drop -->
    <circle cx="140" cy="74" r="5" fill="#FFC107"/>
  </svg>`,

  'eau-50cl.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180" width="100" height="180" fill="none">
    <defs>
      <linearGradient id="wCap" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0066FF"/>
        <stop offset="100%" stop-color="#0044BB"/>
      </linearGradient>
      <linearGradient id="wBottle" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#D0E8FF"/>
        <stop offset="35%" stop-color="#E8F4FF"/>
        <stop offset="70%" stop-color="#C2E0FF"/>
        <stop offset="100%" stop-color="#A5CCF5"/>
      </linearGradient>
    </defs>
    <!-- Cap -->
    <rect x="42" y="16" width="16" height="12" rx="2" fill="url(#wCap)"/>
    <!-- Neck -->
    <path d="M44 28H56L62 44H38L44 28Z" fill="url(#wBottle)"/>
    <!-- Main Bottle -->
    <rect x="36" y="44" width="28" height="110" rx="10" fill="url(#wBottle)"/>
    <!-- Grooves / Ridges -->
    <line x1="37" y1="65" x2="63" y2="65" stroke="#7BAAF7" stroke-width="2"/>
    <line x1="37" y1="125" x2="63" y2="125" stroke="#7BAAF7" stroke-width="2"/>
    <!-- Blue Label -->
    <rect x="36" y="80" width="28" height="34" fill="#0070F3"/>
    <text x="50" y="100" font-family="sans-serif" font-size="7" font-weight="bold" fill="#FFFFFF" text-anchor="middle">EAU</text>
    <text x="50" y="108" font-family="sans-serif" font-size="5" fill="#E0F2FE" text-anchor="middle">50 cl</text>
    <!-- Highlight -->
    <rect x="40" y="48" width="3" height="102" rx="1.5" fill="#FFFFFF" opacity="0.7"/>
  </svg>`,

  'jus-naturel.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180" width="100" height="180" fill="none">
    <rect x="42" y="18" width="16" height="12" rx="2" fill="#FFA500"/>
    <path d="M44 30H56L63 46H37L44 30Z" fill="#FF9800"/>
    <rect x="36" y="46" width="28" height="108" rx="8" fill="#FFB74D"/>
    <rect x="36" y="78" width="28" height="36" fill="#F57C00"/>
    <circle cx="50" cy="94" r="8" fill="#FFE082"/>
    <text x="50" y="106" font-family="sans-serif" font-size="5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ORANGE</text>
    <rect x="40" y="50" width="3" height="98" rx="1.5" fill="#FFFFFF" opacity="0.5"/>
  </svg>`,

  'coca-cola.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180" width="100" height="180" fill="none">
    <rect x="43" y="18" width="14" height="10" rx="1" fill="#DC2626"/>
    <path d="M44 28H56L64 48H36L44 28Z" fill="#1C1917"/>
    <rect x="35" y="48" width="30" height="106" rx="9" fill="#292524"/>
    <rect x="35" y="76" width="30" height="38" fill="#E11D48"/>
    <text x="50" y="98" font-family="serif" font-style="italic" font-size="7" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Cola</text>
    <rect x="39" y="52" width="3" height="98" rx="1.5" fill="#FFFFFF" opacity="0.3"/>
  </svg>`,

  'jus-tropical.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 180" width="110" height="180" fill="none">
    <!-- Juice Brick / Tetra Pak -->
    <path d="M30 40L42 28H82L70 40H30Z" fill="#84CC16"/>
    <rect x="30" y="40" width="50" height="110" rx="4" fill="#65A30D"/>
    <path d="M80 40L92 28V138L80 150V40Z" fill="#4D7C0F"/>
    <circle cx="55" cy="85" r="16" fill="#FACC15"/>
    <circle cx="52" cy="83" r="10" fill="#EA580C"/>
    <text x="55" y="120" font-family="sans-serif" font-size="7" font-weight="bold" fill="#FFFFFF" text-anchor="middle">TROPICAL</text>
  </svg>`,

  'chips.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 180" width="140" height="180" fill="none">
    <!-- Shiny Chips Bag -->
    <defs>
      <linearGradient id="chipG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="50%" stop-color="#D97706"/>
        <stop offset="100%" stop-color="#B45309"/>
      </linearGradient>
    </defs>
    <path d="M35 30L30 150L45 156L105 156L120 150L115 30L100 24L50 24L35 30Z" fill="url(#chipG)"/>
    <!-- Serrated Top & Bottom -->
    <path d="M35 30H115V36H35Z" fill="#92400E"/>
    <path d="M30 146H120V152H30Z" fill="#92400E"/>
    <!-- Big Chips Label -->
    <ellipse cx="75" cy="88" rx="28" ry="18" fill="#EF4444"/>
    <text x="75" y="93" font-family="sans-serif" font-size="11" font-weight="900" fill="#FDE047" text-anchor="middle">CHIPS</text>
    <path d="M50 36L65 144" stroke="#FFFFFF" stroke-width="3" opacity="0.4"/>
  </svg>`,

  'chocolat.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" width="160" height="120" fill="none">
    <rect x="20" y="30" width="120" height="60" rx="4" fill="#3E2723"/>
    <rect x="40" y="30" width="100" height="60" rx="4" fill="#B71C1C"/>
    <rect x="40" y="30" width="15" height="60" fill="#E0E0E0"/>
    <text x="95" y="66" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFD54F" text-anchor="middle">Chocolat</text>
  </svg>`,

  'biscuits.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" width="160" height="120" fill="none">
    <rect x="25" y="35" width="110" height="50" rx="6" fill="#0284C7"/>
    <rect x="30" y="40" width="100" height="40" rx="4" fill="#F59E0B"/>
    <text x="80" y="65" font-family="sans-serif" font-size="11" font-weight="900" fill="#0369A1" text-anchor="middle">BISCUITZ</text>
  </svg>`,

  'huile.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180" width="100" height="180" fill="none">
    <rect x="43" y="18" width="14" height="10" rx="2" fill="#EAB308"/>
    <rect x="35" y="44" width="30" height="110" rx="6" fill="#FACC15"/>
    <rect x="35" y="75" width="30" height="40" fill="#CA8A04"/>
    <circle cx="50" cy="95" r="8" fill="#FEF08A"/>
    <text x="50" y="98" font-family="sans-serif" font-size="6" font-weight="bold" fill="#713F12" text-anchor="middle">HUILE</text>
    <rect x="39" y="48" width="3" height="100" rx="1.5" fill="#FFFFFF" opacity="0.6"/>
  </svg>`,

  'lubrifiant.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 180" width="140" height="180" fill="none">
    <!-- Motor Oil Bottle / Canister with handle -->
    <path d="M40 35H60V50L45 65V150H95V55L75 35H60" fill="#1E3A8A"/>
    <!-- Handle hole -->
    <path d="M45 75C45 68 55 68 55 75V115C55 122 45 122 45 115Z" fill="#F0F4FB"/>
    <rect x="58" y="80" width="32" height="45" fill="#DC2626"/>
    <text x="74" y="105" font-family="sans-serif" font-size="6" font-weight="bold" fill="#FFFFFF" text-anchor="middle">LUBRIFIANT</text>
  </svg>`,

  'cafe.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" width="120" height="160" fill="none">
    <rect x="30" y="30" width="60" height="100" rx="8" fill="#78350F"/>
    <rect x="30" y="60" width="60" height="40" fill="#DC2626"/>
    <circle cx="60" cy="80" r="12" fill="#FEF3C7"/>
    <text x="60" y="84" font-family="sans-serif" font-size="8" font-weight="bold" fill="#78350F" text-anchor="middle">CAFÉ</text>
  </svg>`,

  'huile-moteur.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 180" width="140" height="180" fill="none">
    <path d="M38 35H58V48L44 62V148H96V52L76 35H58" fill="#1F2937"/>
    <path d="M44 72C44 65 54 65 54 72V112C54 119 44 119 44 112Z" fill="#F0F4FB"/>
    <rect x="58" y="78" width="34" height="44" rx="2" fill="#F59E0B"/>
    <text x="75" y="103" font-family="sans-serif" font-size="7" font-weight="900" fill="#111827" text-anchor="middle">5W-40</text>
  </svg>`,

  'lave-glace.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 180" width="140" height="180" fill="none">
    <path d="M42 36H58V48L44 60V148H96V50L76 36H58" fill="#0284C7"/>
    <path d="M44 72C44 65 54 65 54 72V112C54 119 44 119 44 112Z" fill="#F0F4FB"/>
    <rect x="58" y="76" width="34" height="46" rx="2" fill="#E0F2FE"/>
    <text x="75" y="98" font-family="sans-serif" font-size="6" font-weight="bold" fill="#0369A1" text-anchor="middle">LAVE-GLACE</text>
    <text x="75" y="108" font-family="sans-serif" font-size="6" font-weight="bold" fill="#0369A1" text-anchor="middle">5L</text>
  </svg>`,

  'gaz-industriel.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 200" width="140" height="200" fill="none">
    <rect x="45" y="18" width="50" height="16" rx="3" fill="#0369A1"/>
    <rect x="40" y="38" width="60" height="145" rx="14" fill="#0284C7"/>
    <rect x="48" y="44" width="6" height="130" rx="3" fill="#FFFFFF" opacity="0.3"/>
    <rect x="40" y="90" width="60" height="20" fill="#E0F2FE"/>
    <text x="70" y="104" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0369A1" text-anchor="middle">GAZ IND.</text>
  </svg>`,

  'graisse.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140" fill="none">
    <ellipse cx="70" cy="35" rx="42" ry="14" fill="#EAB308"/>
    <rect x="28" y="35" width="84" height="65" rx="4" fill="#CA8A04"/>
    <ellipse cx="70" cy="100" rx="42" ry="14" fill="#A16207"/>
    <rect x="28" y="55" width="84" height="26" fill="#1F2937"/>
    <text x="70" y="72" font-family="sans-serif" font-size="8" font-weight="bold" fill="#FFFFFF" text-anchor="middle">GRAISSE</text>
  </svg>`,

  'essence.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" fill="none">
    <use href="#super"/>
  </svg>`,
  'eau-minerale.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180" width="100" height="180" fill="none">
    <use href="#eau-50cl"/>
  </svg>`,
  'snacks.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 180" width="140" height="180" fill="none">
    <use href="#chips"/>
  </svg>`,
  'boissons.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180" width="100" height="180" fill="none">
    <use href="#coca-cola"/>
  </svg>`,
};

// Replace aliases
products['essence.svg'] = products['super.svg'];
products['eau-minerale.svg'] = products['eau-50cl.svg'];
products['snacks.svg'] = products['chips.svg'];
products['boissons.svg'] = products['coca-cola.svg'];

Object.entries(products).forEach(([name, content]) => {
  fs.writeFileSync(path.join(productsDir, name), content);
});
console.log(`Created ${Object.keys(products).length} products.`);

// 3. ICONS
const iconsDir = path.join(ROOT, 'public/assets/icons');
ensureDir(iconsDir);

const icons = {
  'pump.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140" fill="none">
    <!-- Blue Gas Pump 3D -->
    <rect x="26" y="24" width="56" height="96" rx="8" fill="#1565C0"/>
    <rect x="34" y="34" width="40" height="26" rx="4" fill="#0D47A1"/>
    <!-- Screen -->
    <rect x="38" y="38" width="32" height="18" rx="2" fill="#E3F2FD"/>
    <text x="54" y="51" font-family="monospace" font-size="9" font-weight="bold" fill="#0D47A1" text-anchor="middle">0.00</text>
    <!-- Fuel symbol drop on pump -->
    <circle cx="54" cy="74" r="5" fill="#F59E0B"/>
    <!-- Side Nozzle & Hose -->
    <path d="M82 60C92 60 96 70 96 85V110" stroke="#1E293B" stroke-width="4" stroke-linecap="round" fill="none"/>
    <rect x="90" y="55" width="8" height="18" rx="3" fill="#334155"/>
    <rect x="20" y="116" width="68" height="8" rx="3" fill="#0D47A1"/>
  </svg>`,

  'fuel-drop.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120" fill="none">
    <path d="M50 10C50 10 20 55 20 80C20 98 33 112 50 112C67 112 80 98 80 80C80 55 50 10 50 10Z" fill="#F59E0B"/>
    <circle cx="42" cy="78" r="8" fill="#FDE68A" opacity="0.6"/>
  </svg>`,

  'barrel.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140" fill="none">
    <ellipse cx="60" cy="28" rx="32" ry="12" fill="#1D4ED8"/>
    <rect x="28" y="28" width="64" height="84" fill="#1E40AF"/>
    <ellipse cx="60" cy="112" rx="32" ry="12" fill="#1E3A8A"/>
    <!-- Ridges -->
    <line x1="28" y1="56" x2="92" y2="56" stroke="#3B82F6" stroke-width="3"/>
    <line x1="28" y1="84" x2="92" y2="84" stroke="#3B82F6" stroke-width="3"/>
    <circle cx="60" cy="70" r="5" fill="#F59E0B"/>
  </svg>`,

  'gas-bottle.svg': products['gaz-butane.svg'],

  'coins.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
    <ellipse cx="60" cy="85" rx="36" ry="14" fill="#D97706"/>
    <rect x="24" y="70" width="72" height="15" fill="#F59E0B"/>
    <ellipse cx="60" cy="70" rx="36" ry="14" fill="#FCD34D"/>
    
    <rect x="24" y="50" width="72" height="15" fill="#F59E0B"/>
    <ellipse cx="60" cy="50" rx="36" ry="14" fill="#FCD34D"/>
    
    <rect x="24" y="30" width="72" height="15" fill="#F59E0B"/>
    <ellipse cx="60" cy="30" rx="36" ry="14" fill="#FDE68A"/>
    <text x="60" y="34" font-family="sans-serif" font-size="12" font-weight="900" fill="#B45309" text-anchor="middle">F</text>
  </svg>`,

  'cube.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none">
    <path d="M60 20L95 40V80L60 100L25 80V40L60 20Z" fill="#2563EB"/>
    <path d="M60 20L95 40L60 60L25 40L60 20Z" fill="#60A5FA"/>
    <path d="M60 60V100L95 80V40L60 60Z" fill="#1D4ED8"/>
  </svg>`
};

Object.entries(icons).forEach(([name, content]) => {
  fs.writeFileSync(path.join(iconsDir, name), content);
});
console.log(`Created ${Object.keys(icons).length} icons.`);

// 4. SCENES
const scenesDir = path.join(ROOT, 'public/assets/scenes');
ensureDir(scenesDir);

const scenes = {
  'client-hero.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400" fill="none">
    <defs>
      <linearGradient id="skyG" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4A90E2"/>
        <stop offset="60%" stop-color="#7BB6F8"/>
        <stop offset="100%" stop-color="#C2E0FF"/>
      </linearGradient>
      <linearGradient id="roofG" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFB300"/>
        <stop offset="100%" stop-color="#F57C00"/>
      </linearGradient>
    </defs>
    <!-- Sky -->
    <rect width="800" height="400" fill="url(#skyG)"/>
    <!-- City Skyline Silhouette -->
    <path d="M0 300H800V340H0Z" fill="#88B8E8" opacity="0.5"/>
    <rect x="50" y="200" width="40" height="110" fill="#88B8E8" opacity="0.6"/>
    <rect x="110" y="170" width="55" height="140" fill="#88B8E8" opacity="0.6"/>
    <rect x="620" y="160" width="60" height="150" fill="#88B8E8" opacity="0.6"/>
    <rect x="700" y="210" width="50" height="100" fill="#88B8E8" opacity="0.6"/>
    <!-- Trees (round green) -->
    <circle cx="90" cy="290" r="35" fill="#34A853"/>
    <circle cx="720" cy="285" r="40" fill="#34A853"/>
    <circle cx="760" cy="295" r="30" fill="#2E7D32"/>
    <!-- Ground / Pavement -->
    <path d="M0 310L800 310L800 400L0 400Z" fill="#607289"/>
    <path d="M120 340L680 340L720 400L80 400Z" fill="#4B5868"/>
    <!-- Canopy (Auvent) Station -->
    <path d="M140 180L400 120L660 180L660 205L400 150L140 205Z" fill="url(#roofG)"/>
    <!-- Canopy Underbody (White) -->
    <path d="M140 205L400 150L660 205V218L400 162L140 218Z" fill="#FFFFFF"/>
    <!-- Pillars (Poteaux) -->
    <rect x="220" y="218" width="16" height="95" fill="#E2E8F0"/>
    <rect x="236" y="218" width="8" height="95" fill="#94A3B8"/>
    <rect x="390" y="162" width="20" height="150" fill="#E2E8F0"/>
    <rect x="410" y="162" width="10" height="150" fill="#94A3B8"/>
    <rect x="560" y="218" width="16" height="95" fill="#E2E8F0"/>
    <rect x="576" y="218" width="8" height="95" fill="#94A3B8"/>
    <!-- Fuel Pumps under canopy -->
    <rect x="260" y="270" width="28" height="42" rx="4" fill="#0D47A1"/>
    <rect x="330" y="270" width="28" height="42" rx="4" fill="#0D47A1"/>
    <rect x="450" y="270" width="28" height="42" rx="4" fill="#0D47A1"/>
    <rect x="510" y="270" width="28" height="42" rx="4" fill="#0D47A1"/>
    <!-- Station Totem Sign -->
    <rect x="680" y="180" width="40" height="120" rx="6" fill="#0F2D6B"/>
    <circle cx="700" cy="205" r="12" fill="#F5A623"/>
    <text x="700" y="235" font-family="sans-serif" font-size="7" font-weight="bold" fill="#FFFFFF" text-anchor="middle">StationPro</text>
  </svg>`,

  'station-front.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360" fill="none">
    <use href="#client-hero"/>
  </svg>`,

  'staff-hero.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360" fill="none">
    <use href="#client-hero"/>
  </svg>`,

  'header-station.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160" width="400" height="160" fill="none">
    <!-- Canopy cropped with gradient fade left -->
    <defs>
      <linearGradient id="fadeL" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0A285F" stop-opacity="1"/>
        <stop offset="40%" stop-color="#0A285F" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#0A285F" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="400" height="160" fill="#5A96E8"/>
    <!-- Canopy -->
    <path d="M60 40L250 15L390 40V55L250 30L60 55Z" fill="#F59E0B"/>
    <path d="M60 55L250 30L390 55V65L250 40L60 65Z" fill="#FFFFFF"/>
    <!-- Pillars -->
    <rect x="140" y="65" width="12" height="75" fill="#E2E8F0"/>
    <rect x="245" y="40" width="14" height="100" fill="#E2E8F0"/>
    <rect x="330" y="65" width="12" height="75" fill="#E2E8F0"/>
    <!-- Pumps -->
    <rect x="180" y="100" width="22" height="38" rx="3" fill="#1D4ED8"/>
    <rect x="280" y="100" width="22" height="38" rx="3" fill="#1D4ED8"/>
    <!-- Ground -->
    <rect y="138" width="400" height="22" fill="#334155"/>
    <!-- Fade overlay to left -->
    <rect width="400" height="160" fill="url(#fadeL)"/>
  </svg>`,

  'boutique-front.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160" width="400" height="160" fill="none">
    <defs>
      <linearGradient id="fadeB" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0A285F" stop-opacity="1"/>
        <stop offset="40%" stop-color="#0A285F" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#0A285F" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="400" height="160" fill="#5A96E8"/>
    <!-- Boutique facade -->
    <rect x="80" y="30" width="290" height="110" rx="6" fill="#1E40AF"/>
    <rect x="90" y="36" width="270" height="28" fill="#F59E0B"/>
    <text x="225" y="55" font-family="sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">BOUTIQUE</text>
    <!-- Windows & Door -->
    <rect x="110" y="75" width="60" height="65" rx="3" fill="#93C5FD"/>
    <rect x="190" y="75" width="70" height="65" rx="3" fill="#DBEAFE"/>
    <rect x="280" y="75" width="60" height="65" rx="3" fill="#93C5FD"/>
    <rect y="140" width="400" height="20" fill="#334155"/>
    <rect width="400" height="160" fill="url(#fadeB)"/>
  </svg>`,

  'sidebar-city.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 180" width="260" height="180" fill="none">
    <defs>
      <linearGradient id="cityFade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#061D47" stop-opacity="0"/>
        <stop offset="40%" stop-color="#061D47" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#061D47" stop-opacity="1"/>
      </linearGradient>
    </defs>
    <!-- Skyline silhouette in blue -->
    <rect x="10" y="60" width="30" height="90" fill="#1A3B70"/>
    <rect x="45" y="40" width="35" height="110" fill="#1E4582"/>
    <rect x="85" y="75" width="25" height="75" fill="#1A3B70"/>
    <rect x="115" y="30" width="40" height="120" fill="#24539E"/>
    <rect x="160" y="55" width="30" height="95" fill="#1A3B70"/>
    <rect x="195" y="45" width="45" height="105" fill="#1E4582"/>
    <!-- Round trees -->
    <circle cx="20" cy="140" r="16" fill="#10B981" opacity="0.6"/>
    <circle cx="230" cy="138" r="18" fill="#10B981" opacity="0.6"/>
    <!-- Road curving -->
    <path d="M0 155Q130 145 260 170V180H0Z" fill="#0F2854"/>
    <rect width="260" height="180" fill="url(#cityFade)"/>
  </svg>`,

  'sidebar-boutique.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 180" width="260" height="180" fill="none">
    <use href="#sidebar-city"/>
  </svg>`
};

scenes['station-front.svg'] = scenes['client-hero.svg'];
scenes['staff-hero.svg'] = scenes['client-hero.svg'];
scenes['sidebar-boutique.svg'] = scenes['sidebar-city.svg'];

Object.entries(scenes).forEach(([name, content]) => {
  fs.writeFileSync(path.join(scenesDir, name), content);
});
console.log(`Created ${Object.keys(scenes).length} scenes.`);

console.log('ALL ASSETS GENERATED SUCCESSFULLY!');

