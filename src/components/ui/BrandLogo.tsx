import React from 'react';
import { ASSETS } from '@/config/assets';
import { useAppStore } from '@/hooks/useAppStore';

export interface BrandLogoProps {
  theme?: 'dark' | 'light';
  mode?: 'staff' | 'client' | 'admin';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  sloganOverride?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  theme = 'dark',
  mode = 'staff',
  size = 'md',
  className = '',
  sloganOverride,
  onClick,
}) => {
  const networkConfig = useAppStore(s => s.networkConfig);
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

  const platformName = networkConfig?.platformName?.trim() || 'StationPro';
  const defaultSlogan =
    mode === 'admin'
      ? "Console d'administration"
      : mode === 'client'
      ? networkConfig?.platformSlogan || 'Vérifiez • Réservez • Payez'
      : 'Gérer • Servir • Performer';

  const slogan = sloganOverride || defaultSlogan;

  const isDefaultBrand = platformName.toLowerCase() === 'stationpro';

  const content = (
    <>
      <img
        src={ASSETS.brand.logoMark}
        alt={platformName}
        className={`${markSizes[size]} object-contain drop-shadow-sm`}
      />
      <div className="flex flex-col leading-none text-left">
        <div className={`font-display font-bold tracking-tight ${textSizes[size]}`}>
          {isDefaultBrand ? (
            <>
              <span className={isDark ? 'text-white' : 'text-[#0A285F]'}>Station</span>
              <span className="text-[#F5A623]">Pro</span>
            </>
          ) : (
            <span className={isDark ? 'text-white' : 'text-[#0A285F]'}>{platformName}</span>
          )}
        </div>
        <span
          className={`text-[9px] font-medium tracking-wide mt-0.5 ${
            isDark ? 'text-blue-100/80' : 'text-slate-500'
          }`}
        >
          {slogan}
        </span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 select-none cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${className}`}
      >
        {content}
      </button>
    );
  }

  return <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>{content}</div>;
};

