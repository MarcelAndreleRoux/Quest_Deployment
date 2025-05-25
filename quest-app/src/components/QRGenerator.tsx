import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  data: Record<string, any>; // JSON data to encode
  size?: number; // Size of QR code in pixels
  className?: string; // Additional className for the container
  includeDownload?: boolean; // Whether to show download button
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  data,
  size = 200,
  className = '',
}) => {
  
  // Convert JSON data to string for QR code
  const qrData = useMemo(() => JSON.stringify(data), [data]);

  // Handle download QR code as PNG
  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative p-4 bg-white rounded-lg border border-gray-200">
        {/* QR Code Canvas - hidden but used for download */}
        <canvas id="qr-canvas" style={{ display: 'none' }} />
        
        {/* Visible QR Code */}
        <QRCodeSVG
          value={qrData}
          size={size}
          level="L"
          className="rounded"
        />
      </div>
    </div>
  );
};

export default QRCodeGenerator;