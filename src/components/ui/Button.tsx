import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'navy' | 'primary' | 'soft-blue' | 'outline-blue' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2';

  const variants = {
    yellow:
      'bg-gradient-to-r from-[#F7B928] to-[#F5A623] hover:from-[#F5A623] hover:to-[#E59400] text-[#0A162B] shadow-md shadow-amber-500/20 focus-visible:outline-amber-500 font-bold',
    navy:
      'bg-[#0B3A82] hover:bg-[#082D67] text-white shadow-md shadow-blue-900/20 focus-visible:outline-blue-600',
    primary:
      'bg-[#1668E3] hover:bg-[#1255C0] text-white shadow-md shadow-blue-500/20 focus-visible:outline-blue-500',
    'soft-blue':
      'bg-[#E8F0FE] hover:bg-[#D5E4FD] text-[#1668E3] border border-[#CBDCF8] focus-visible:outline-blue-500',
    'outline-blue':
      'bg-white hover:bg-blue-50/50 text-[#1668E3] border border-[#1668E3] focus-visible:outline-blue-500',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 focus-visible:outline-slate-400',
    danger:
      'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-md shadow-red-500/20 focus-visible:outline-red-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-2 gap-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-base px-5 py-3.5 gap-2.5 min-h-[50px]',
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};

