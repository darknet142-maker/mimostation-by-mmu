import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unitLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  unitLabel,
  size = 'md',
  className = '',
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const btnClass = isSm
    ? 'w-7 h-7 text-xs rounded-lg'
    : isLg
    ? 'w-12 h-12 text-base rounded-2xl'
    : 'w-10 h-10 text-sm rounded-xl';

  const textClass = isSm
    ? 'text-sm min-w-[24px]'
    : isLg
    ? 'text-2xl font-bold min-w-[48px]'
    : 'text-lg font-bold min-w-[36px]';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={`${btnClass} inline-flex items-center justify-center border border-[#CBD5E1] bg-white text-slate-700 hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs`}
        aria-label="Diminuer la quantité"
      >
        <Minus className={isSm ? 'w-3 h-3' : isLg ? 'w-5 h-5' : 'w-4 h-4'} />
      </button>

      <span className={`${textClass} text-center font-bold text-[#0F172A]`}>
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={`${btnClass} inline-flex items-center justify-center border border-[#CBD5E1] bg-white text-slate-700 hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs`}
        aria-label="Augmenter la quantité"
      >
        <Plus className={isSm ? 'w-3 h-3' : isLg ? 'w-5 h-5' : 'w-4 h-4'} />
      </button>

      {unitLabel && (
        <span className="text-sm font-medium text-slate-500 ml-1">
          {unitLabel}
        </span>
      )}
    </div>
  );
};

