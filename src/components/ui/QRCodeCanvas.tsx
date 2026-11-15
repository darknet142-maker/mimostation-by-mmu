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
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(
      value,
      {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel,
      },
      (err, url) => {
        if (!err && isMounted && url) {
          setDataUrl(url);
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, [value, size, errorCorrectionLevel]);

  if (!dataUrl) {
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
    >
      <img
        src={dataUrl}
        alt={`QR Code ${value}`}
        width={size}
        height={size}
        className="block"
      />
    </div>
  );
};

