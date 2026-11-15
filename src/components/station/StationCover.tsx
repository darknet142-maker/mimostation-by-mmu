import React from 'react';
import { MapPin } from 'lucide-react';
import type { Station } from '@/types';

export interface StationCoverProps {
  coverSrc: string;
  logoSrc: string;
  stationName: string;
  operatorName?: string;
  locationText?: string;
  status?: Station['status'];
  isOpen?: boolean;
  isOpen24h?: boolean;
  /** `hero` : en-tête de page ; `card` : vignette de liste ; `thumb` : miniature sans surimpression. */
  variant?: 'hero' | 'card' | 'thumb';
  className?: string;
}

const statusLabel = (status: Station['status'], isOpen: boolean, isOpen24h: boolean): string => {
  if (status === 'maintenance') return 'En maintenance';
  if (status === 'closed' || !isOpen) return 'Fermée';
  return isOpen24h ? 'Ouverte • 24h/24' : 'Ouverte';
};

const statusTone = (status: Station['status'], isOpen: boolean): string => {
  if (status === 'maintenance') return 'bg-amber-500 text-white';
  if (status === 'closed' || !isOpen) return 'bg-rose-600 text-white';
  return 'bg-emerald-600 text-white';
};

/**
 * Couverture officielle d'une station : visuel SVG de l'enseigne,
 * logo en médaillon et état d'ouverture. Ratio fixe (2:1) pour un CLS nul.
 */
export const StationCover: React.FC<StationCoverProps> = ({
  coverSrc,
  logoSrc,
  stationName,
  operatorName,
  locationText,
  status = 'active',
  isOpen = true,
  isOpen24h = true,
  variant = 'hero',
  className = '',
}) => {
  const isThumb = variant === 'thumb';
  const isHero = variant === 'hero';

  return (
    <div
      className={`relative overflow-hidden bg-slate-200 aspect-[2/1] ${
        isThumb ? 'rounded-lg' : 'rounded-2xl'
      } ${className}`}
    >
      <img
        src={coverSrc}
        alt={`Couverture ${operatorName ?? ''} – ${stationName}`.trim()}
        className="absolute inset-0 w-full h-full object-cover"
        loading={isHero ? 'eager' : 'lazy'}
        decoding="async"
      />

      {!isThumb && (
        <>
          {/* Médaillon logo de l'enseigne */}
          <div
            className={`absolute top-3 left-3 bg-white/95 rounded-xl shadow-md border border-white flex items-center justify-center ${
              isHero ? 'h-11 sm:h-12 px-2.5 max-w-[55%]' : 'h-8 px-2 max-w-[60%]'
            }`}
          >
            <img src={logoSrc} alt={operatorName ? `Logo ${operatorName}` : 'Logo'} className="h-full w-auto py-1.5 object-contain" />
          </div>

          {/* Surimpression basse : localisation + état */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/55 to-transparent flex items-end justify-between gap-2">
            {locationText ? (
              <span className="inline-flex items-center gap-1.5 min-w-0 px-2.5 py-1 rounded-full bg-white/95 text-[11px] sm:text-xs font-semibold text-slate-800 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                <span className="truncate">{locationText}</span>
              </span>
            ) : (
              <span />
            )}
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold shadow-sm ${statusTone(
                status,
                isOpen
              )}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
              {statusLabel(status, isOpen, isOpen24h)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

