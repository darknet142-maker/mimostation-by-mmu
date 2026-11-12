import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { Station } from '@/types';

export interface StationCanopyPreviewProps {
  stationName: string;
  locationText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  canopyTheme?: Station['canopyTheme'];
  isOpen?: boolean;
  isOpen24h?: boolean;
  status?: Station['status'];
  mode?: 'full' | 'mini';
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface CanopyThemeDef {
  id: 'classic-blue' | 'night-edition' | 'eco-green' | 'neon-tech' | 'minimal-blue' | 'urban-orange';
  label: string;
  primary: string;
  secondary: string;
  skyTop: string;
  skyBottom: string;
  roofColor: string;
  fasciaColor: string;
  totemColor: string;
}

export const CANOPY_THEMES: CanopyThemeDef[] = [
  {
    id: 'classic-blue',
    label: 'Classique Bleu & Or',
    primary: '#0B4DB3',
    secondary: '#FFC107',
    skyTop: '#4A90E2',
    skyBottom: '#C2E0FF',
    roofColor: '#FFB300',
    fasciaColor: '#0B4DB3',
    totemColor: '#0B4DB3',
  },
  {
    id: 'night-edition',
    label: 'Édition Nocturne',
    primary: '#0F2752',
    secondary: '#38BDF8',
    skyTop: '#0B1528',
    skyBottom: '#1E293B',
    roofColor: '#38BDF8',
    fasciaColor: '#0F2752',
    totemColor: '#0F2752',
  },
  {
    id: 'eco-green',
    label: 'Éco Énergie',
    primary: '#059669',
    secondary: '#84CC16',
    skyTop: '#60A5FA',
    skyBottom: '#DCFCE7',
    roofColor: '#84CC16',
    fasciaColor: '#059669',
    totemColor: '#047857',
  },
  {
    id: 'neon-tech',
    label: 'High-Tech Néon',
    primary: '#0284C7',
    secondary: '#06B6D4',
    skyTop: '#1E3A8A',
    skyBottom: '#93C5FD',
    roofColor: '#06B6D4',
    fasciaColor: '#0284C7',
    totemColor: '#0369A1',
  },
  {
    id: 'minimal-blue',
    label: 'Minimal Royal',
    primary: '#1D4ED8',
    secondary: '#FFFFFF',
    skyTop: '#3B82F6',
    skyBottom: '#DBEAFE',
    roofColor: '#FFFFFF',
    fasciaColor: '#1D4ED8',
    totemColor: '#1E40AF',
  },
  {
    id: 'urban-orange',
    label: 'Urbain Énergie',
    primary: '#EA580C',
    secondary: '#FACC15',
    skyTop: '#FB923C',
    skyBottom: '#FED7AA',
    roofColor: '#FACC15',
    fasciaColor: '#EA580C',
    totemColor: '#C2410C',
  },
];

export const StationCanopyPreview: React.FC<StationCanopyPreviewProps> = ({
  stationName = 'Station Liberté',
  locationText = 'Libreville, Gabon',
  primaryColor = '#0B4DB3',
  secondaryColor = '#FFC107',
  canopyTheme = 'classic-blue',
  isOpen = true,
  isOpen24h = true,
  status = 'active',
  mode = 'full',
  isSelected = false,
  onClick,
  className = '',
}) => {
  const themeConfig =
    CANOPY_THEMES.find(t => t.id === canopyTheme) || CANOPY_THEMES[0];

  const effectivePrimary = primaryColor || themeConfig.primary;
  const effectiveSecondary = secondaryColor || themeConfig.secondary;
  const effectiveRoof = effectiveSecondary || themeConfig.roofColor;

  const isMini = mode === 'mini';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden transition-all duration-200 select-none ${
        isMini
          ? `rounded-xl border-2 ${
              isSelected
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md scale-[1.02]'
                : 'border-slate-200 hover:border-slate-300 hover:shadow'
            } cursor-pointer`
          : 'rounded-2xl border border-slate-200 shadow-md bg-white'
      } ${className}`}
    >
      {/* 3D Gas Station Canopy SVG Render */}
      <svg
        viewBox="0 0 600 360"
        className="w-full h-auto block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id={`sky-${canopyTheme}-${mode}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={themeConfig.skyTop} />
            <stop offset="60%" stopColor={themeConfig.skyBottom} />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Roof Gradient with Secondary Accent */}
          <linearGradient id={`roof-${canopyTheme}-${mode}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={effectiveRoof} />
            <stop offset="100%" stopColor={effectiveRoof} stopOpacity="0.85" />
          </linearGradient>

          {/* Fascia Gradient with Primary Brand Color */}
          <linearGradient id={`fascia-${canopyTheme}-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={effectivePrimary} />
            <stop offset="100%" stopColor={effectivePrimary} stopOpacity="0.92" />
          </linearGradient>

          {/* Forecourt Ground Gradient */}
          <linearGradient id={`ground-${canopyTheme}-${mode}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Ceiling light glow */}
          <linearGradient id={`ceilingGlow-${canopyTheme}-${mode}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* 1. Sky */}
        <rect width="600" height="360" fill={`url(#sky-${canopyTheme}-${mode})`} />

        {/* 2. City Skyline in Distance */}
        <g opacity="0.35" fill="#64748B">
          <rect x="20" y="140" width="30" height="80" rx="1" />
          <rect x="55" y="110" width="38" height="110" rx="1" />
          <rect x="98" y="150" width="25" height="70" rx="1" />
          <rect x="130" y="125" width="40" height="95" rx="1" />
          <polygon points="150,95 130,125 170,125" />
          <rect x="440" y="120" width="45" height="100" rx="1" />
          <rect x="490" y="145" width="32" height="75" rx="1" />
          <rect x="530" y="105" width="50" height="115" rx="1" />
          <polygon points="555,80 530,105 580,105" />
        </g>

        {/* 3. Rounded stylized trees */}
        <circle cx="50" cy="215" r="28" fill="#15803D" />
        <circle cx="75" cy="225" r="22" fill="#16A34A" />
        <circle cx="530" cy="215" r="26" fill="#15803D" />
        <circle cx="555" cy="225" r="20" fill="#16A34A" />

        {/* 4. Concrete forecourt pavement */}
        <path d="M0 220 L600 220 L600 360 L0 360 Z" fill={`url(#ground-${canopyTheme}-${mode})`} />
        {/* Forecourt Perspective lines / yellow guide markings */}
        <path d="M120 220 L40 360" stroke="#94A3B8" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />
        <path d="M240 220 L190 360" stroke="#94A3B8" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />
        <path d="M360 220 L390 360" stroke="#94A3B8" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />
        <path d="M480 220 L550 360" stroke="#94A3B8" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />

        {/* 5. Concrete Pump Islands (Îlots béton) */}
        {/* Island 1 */}
        <path d="M160 270 L210 270 L220 280 L150 280 Z" fill="#CBD5E1" />
        {/* Island 2 */}
        <path d="M260 270 L310 270 L320 280 L250 280 Z" fill="#CBD5E1" />
        {/* Island 3 */}
        <path d="M360 270 L410 270 L420 280 L350 280 Z" fill="#CBD5E1" />

        {/* 6. Fuel Dispensers (Pompes) */}
        {/* Pump 1 */}
        <rect x="175" y="225" width="22" height="48" rx="3" fill={effectivePrimary} />
        <rect x="178" y="230" width="16" height="14" rx="2" fill="#0F172A" />
        <circle cx="186" cy="237" r="3" fill={effectiveSecondary} />
        <path d="M197 238 L201 245 L199 265" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Pump 2 */}
        <rect x="275" y="225" width="22" height="48" rx="3" fill={effectivePrimary} />
        <rect x="278" y="230" width="16" height="14" rx="2" fill="#0F172A" />
        <circle cx="286" cy="237" r="3" fill={effectiveSecondary} />
        <path d="M297 238 L301 245 L299 265" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Pump 3 */}
        <rect x="375" y="225" width="22" height="48" rx="3" fill={effectivePrimary} />
        <rect x="378" y="230" width="16" height="14" rx="2" fill="#0F172A" />
        <circle cx="386" cy="237" r="3" fill={effectiveSecondary} />
        <path d="M397 238 L401 245 L399 265" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* 7. Structural Canopy Pillars (Poteaux métalliques) */}
        {/* Pillar Left */}
        <rect x="150" y="145" width="12" height="120" fill="#E2E8F0" />
        <rect x="160" y="145" width="4" height="120" fill="#94A3B8" />
        {/* Pillar Middle */}
        <rect x="285" y="145" width="12" height="120" fill="#E2E8F0" />
        <rect x="295" y="145" width="4" height="120" fill="#94A3B8" />
        {/* Pillar Right */}
        <rect x="420" y="145" width="12" height="120" fill="#E2E8F0" />
        <rect x="430" y="145" width="4" height="120" fill="#94A3B8" />

        {/* 8. Canopy Ceiling (Underbody) with LED Lights */}
        <polygon
          points="80,145 300,120 500,145 490,155 300,132 90,155"
          fill={`url(#ceilingGlow-${canopyTheme}-${mode})`}
        />
        {/* Ceiling LED recessed spot lights */}
        <ellipse cx="185" cy="144" rx="10" ry="2.5" fill="#FEF08A" opacity="0.9" />
        <ellipse cx="290" cy="133" rx="10" ry="2.5" fill="#FEF08A" opacity="0.9" />
        <ellipse cx="395" cy="144" rx="10" ry="2.5" fill="#FEF08A" opacity="0.9" />

        {/* 9. 3D Canopy Roof & Fascia Structure */}
        {/* Top Sloped Roof Plane (Secondary Color Accent) */}
        <polygon
          points="70,110 300,75 510,110 495,122 300,88 85,122"
          fill={`url(#roof-${canopyTheme}-${mode})`}
        />

        {/* Main Front Fascia (Primary Brand Color) */}
        <polygon
          points="85,122 300,88 495,122 490,150 300,118 90,150"
          fill={`url(#fascia-${canopyTheme}-${mode})`}
        />

        {/* Left Side 3D Fascia Return */}
        <polygon
          points="70,110 85,122 90,150 75,138"
          fill={effectivePrimary}
          opacity="0.75"
        />

        {/* Secondary Color Accent Trim Line along bottom of fascia */}
        <polygon
          points="90,147 300,115 490,147 490,150 300,118 90,150"
          fill={effectiveSecondary}
        />

        {/* 10. Brand Flame Logo & Station Name on Canopy Fascia */}
        <g transform="translate(230, 96)">
          {/* Stylized flame icon */}
          <path
            d="M0 14 C-2 10 2 6 5 2 C8 7 12 10 10 15 C8 18 2 18 0 14 Z"
            fill={effectiveSecondary}
          />
          <path
            d="M3 13 C2 11 4 9 5 7 C6 10 7 11 6 13 C5 14 3 14 3 13 Z"
            fill="#FFFFFF"
          />
        </g>
        {/* Dynamic Station Name on Canopy */}
        <text
          x="310"
          y="112"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize={isMini ? '12' : '15'}
          fontWeight="800"
          fill="#FFFFFF"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          {stationName}
        </text>

        {/* 11. Station Totem Sign on Right */}
        <g transform="translate(460, 150)">
          {/* Totem Pole */}
          <rect x="0" y="0" width="30" height="120" rx="5" fill={themeConfig.totemColor || effectivePrimary} />
          {/* Totem Top Flame */}
          <circle cx="15" cy="18" r="9" fill={effectiveSecondary} />
          <path
            d="M12 21 C10 18 13 15 15 12 C17 15 20 18 18 21 C16 23 13 23 12 21 Z"
            fill="#FFFFFF"
          />
          {/* Totem Station Label */}
          <text
            x="15"
            y="42"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="5"
            fontWeight="bold"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            {stationName.length > 10 ? stationName.slice(0, 10) : stationName}
          </text>
          {/* Price Badges */}
          <rect x="4" y="52" width="22" height="10" rx="2" fill="#0F172A" />
          <text x="15" y="59" fontFamily="monospace" fontSize="5" fontWeight="bold" fill="#4ADE80" textAnchor="middle">
            700 F
          </text>
          <rect x="4" y="66" width="22" height="10" rx="2" fill="#0F172A" />
          <text x="15" y="73" fontFamily="monospace" fontSize="5" fontWeight="bold" fill="#FACC15" textAnchor="middle">
            650 F
          </text>
        </g>
      </svg>

      {/* Top Right Verified Checkmark Badge (Full Mode & Mini Selected Mode) */}
      {(mode === 'full' || (isMini && isSelected)) && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Bottom Overlay Badge in Full Mode */}
      {!isMini && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs font-semibold text-slate-800 shadow-sm border border-slate-200/80">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>{locationText}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
              status === 'maintenance'
                ? 'bg-amber-500 text-white'
                : isOpen
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>
              {status === 'maintenance'
                ? 'En maintenance'
                : isOpen
                ? isOpen24h
                  ? 'Ouverte • 24h/24'
                  : 'Ouverte'
                : 'Fermée'}
            </span>
          </div>
        </div>
      )}

      {/* Mini Mode Caption Label */}
      {isMini && (
        <div className="p-2 bg-white text-center border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-800 truncate">
            {themeConfig.label}
          </p>
        </div>
      )}
    </div>
  );
};
