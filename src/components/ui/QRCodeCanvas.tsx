import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  className?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({
  value,
  size = 180,
  className = '',
  errorCorrectionLevel = 'M',
}) => {
  const [svgString, setSvgString] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toString(
      value,
      {
        type: 'svg',
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel,
      },
      (err, string) => {
        if (!err && isMounted && string) {
          setSvgString(string);
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, [value, size, errorCorrectionLevel]);

  if (!svgString) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-white rounded-lg flex items-center justify-center p-2 border border-slate-200 animate-pulse ${className}`}
      >
        <span className="text-xs text-slate-400">Génération QR...</span>
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-2.5 rounded-xl border border-slate-200 inline-block shadow-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};

