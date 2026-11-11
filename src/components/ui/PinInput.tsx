import React, { useRef } from 'react';

export interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
}

export const PinInput: React.FC<PinInputProps> = ({
  value,
  onChange,
  length = 4,
  disabled = false,
  className = '',
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleCharChange = (idx: number, char: string) => {
    // Only accept numeric digit
    const cleaned = char.replace(/\D/g, '');
    if (!cleaned) {
      // Clear current
      const arr = value.split('');
      arr[idx] = '';
      onChange(arr.join(''));
      return;
    }

    const digit = cleaned[cleaned.length - 1]; // last entered
    const arr = value.padEnd(length, ' ').split('');
    arr[idx] = digit;
    const nextVal = arr.join('').trimEnd();
    onChange(nextVal);

    // Auto advance
    if (idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[idx] && idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (paste) {
      onChange(paste);
      const nextIdx = Math.min(paste.length, length - 1);
      inputsRef.current[nextIdx]?.focus();
    }
  };

  return (
    <div className={`flex items-center justify-center gap-3.5 sm:gap-4 ${className}`} onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => {
        const char = value[i] || '';
        return (
          <input
            key={i}
            ref={el => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={e => handleCharChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-14 h-16 sm:w-16 sm:h-20 text-center text-3xl sm:text-4xl font-extrabold text-[#0F172A] bg-white border-2 border-[#DCE4F0] rounded-2xl shadow-sm focus:border-[#1668E3] focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-150 disabled:bg-slate-100"
            aria-label={`Chiffre PIN ${i + 1}`}
          />
        );
      })}
    </div>
  );
};

