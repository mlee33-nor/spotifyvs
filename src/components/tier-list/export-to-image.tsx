'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportToImageProps {
  elementId: string;
  filename?: string;
  className?: string;
}

export function ExportToImage({
  elementId,
  filename = 'tier-list',
  className,
}: ExportToImageProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const element = document.getElementById(elementId);

      if (!element) {
        throw new Error(`Element with ID "${elementId}" not found`);
      }

      // Scroll to top to ensure full capture
      window.scrollTo(0, 0);

      // Wait a bit for any animations to settle
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Capture the element
      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Add watermark
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Add semi-transparent background for watermark
        const watermarkHeight = 40;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
          0,
          canvas.height - watermarkHeight,
          canvas.width,
          watermarkHeight
        );

        // Add watermark text
        ctx.fillStyle = '#1DB954';
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          'Created with SpotifyVS',
          canvas.width / 2,
          canvas.height - 12
        );
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${filename}-${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting to image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={cn(
        'px-4 py-2 bg-border hover:bg-border/80 rounded-lg transition-all inline-flex items-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export as PNG
        </>
      )}
    </button>
  );
}
