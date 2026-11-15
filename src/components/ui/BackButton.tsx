import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSafeBack } from '@/hooks/useSafeBack';

export interface BackButtonProps {
  /** Route de repli si l'utilisateur a ouvert la page directement (historique vide). */
  fallbackTo?: string;
  /** Libellé affiché à côté de la flèche. */
  label?: string;
  /** Texte alternatif pour les lecteurs d'écran. */
  ariaLabel?: string;
  /** Variante visuelle adaptée au fond de la barre d'en-tête. */
  variant?: 'pill-light' | 'header-dark' | 'ghost-dark';
  /** Masque le libellé sous `sm:` tout en conservant la zone tactile 44×44 px. */
  compactOnMobile?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<BackButtonProps['variant']>, string> = {
  'pill-light':
    'bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200 shadow-2xs focus-visible:ring-blue-600',
  'header-dark':
    'bg-white/12 hover:bg-white/22 text-white border border-white/20 backdrop-blur-sm focus-visible:ring-white',
  'ghost-dark':
    'bg-transparent hover:bg-white/12 text-white border border-transparent focus-visible:ring-white',
};

export const BackButton: React.FC<BackButtonProps> = ({
  fallbackTo = '/',
  label = 'Retour',
  ariaLabel,
  variant = 'pill-light',
  compactOnMobile = false,
  className = '',
}) => {
  const handleBack = useSafeBack(fallbackTo);

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={ariaLabel || label}
      className={`min-w-[44px] min-h-[44px] inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <ArrowLeft className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[2.5] shrink-0" aria-hidden="true" />
      <span className={compactOnMobile ? 'hidden sm:inline' : 'inline'}>{label}</span>
    </button>
  );
};
