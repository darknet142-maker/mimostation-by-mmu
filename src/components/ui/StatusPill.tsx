import React from 'react';
import { ASSETS } from '@/config/assets';

export interface StatusPillProps {
  type?: 'disponible' | 'active' | 'stock-ok' | 'stock-faible' | 'ouvert' | 'maintenance' | 'danger';
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({
  type = 'disponible',
  label,
  className = '',
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  switch (type) {
    case 'disponible':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-[#10B981] text-white font-semibold shadow-xs ${sizeClass} ${className}`}
        >
          <img
            src={ASSETS.official.uiActions.disponible}
            alt=""
            className={`${iconSize} object-contain shrink-0`}
          />
          <span>{label || 'Disponible'}</span>
        </span>
      );

    case 'active':
    case 'ouvert':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-[#E6F7EF] text-[#059669] font-medium border border-[#A7F3D0] ${sizeClass} ${className}`}
        >
          <img
            src={ASSETS.official.uiActions.disponible}
            alt=""
            className={`${iconSize} object-contain shrink-0`}
          />
          <span>{label || 'En service'}</span>
        </span>
      );

    case 'stock-ok':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-[#E6F7EF] text-[#059669] font-semibold ${sizeClass} ${className}`}
        >
          <img
            src={ASSETS.official.uiActions.disponible}
            alt=""
            className={`${iconSize} object-contain shrink-0`}
          />
          <span>{label || 'Stock OK'}</span>
        </span>
      );

    case 'stock-faible':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] text-[#DC2626] font-semibold ${sizeClass} ${className}`}
        >
          <img
            src={ASSETS.official.uiActions.stockFaible}
            alt=""
            className={`${iconSize} object-contain shrink-0`}
          />
          <span>{label || 'Stock faible'}</span>
        </span>
      );

    case 'maintenance':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] font-semibold ${sizeClass} ${className}`}
        >
          <img
            src={ASSETS.official.uiActions.stockFaible}
            alt=""
            className={`${iconSize} object-contain shrink-0`}
          />
          <span>{label || 'Maintenance'}</span>
        </span>
      );

    case 'danger':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-[#EF4444] text-white font-semibold ${sizeClass} ${className}`}
        >
          <img
            src={ASSETS.official.uiActions.indisponible}
            alt=""
            className={`${iconSize} object-contain shrink-0`}
          />
          <span>{label || 'Alerte'}</span>
        </span>
      );

    default:
      return null;
  }
};
