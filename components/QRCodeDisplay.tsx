'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

export default function QRCodeDisplay({ value, size = 200, label }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      {label && <p className="text-white/70 text-sm mb-3">{label}</p>}
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <QRCodeSVG value={value} size={size} level="M" includeMargin />
      </div>
      <p className="text-white/50 text-xs mt-3 font-mono break-all text-center max-w-xs">
        {value}
      </p>
    </div>
  );
}
