import React from 'react';
import { ASSETS } from '@/config/assets';

export interface BrandLogoProps {
  theme?: 'dark' | 'light';
  mode?: 'staff' | 'client';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  theme = 'dark',
  mode = 'staff',
  size = 'md',
  className = '',
  onClick,
}) => {
  const isDark = theme === 'dark';

  const markSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const slogan = mode === 'client' ? 'Vérifiez • Réservez • Payez' : 'Gérer • Servir • Performer';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <img
        src={ASSETS.brand.logoMark}
        alt="StationPro"
        className={`${markSizes[size]} object-contain drop-shadow-sm`}
      />
      <div className="flex flex-col leading-none">
        <div className={`font-display font-bold tracking-tight ${textSizes[size]}`}>
          <span className={isDark ? 'text-white' : 'text-[#0A285F]'}>Station</span>
          <span className="text-[#F5A623]">Pro</span>
        </div>
        <span
          className={`text-[9px] font-medium tracking-wide mt-0.5 ${
            isDark ? 'text-blue-100/80' : 'text-slate-500'
          }`}
        >
          {slogan}
        </span>
      </div>
    </div>
  );
};

