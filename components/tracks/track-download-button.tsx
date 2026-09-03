'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface TrackDownloadButtonProps {
  fileUrl: string;
  title: string;
  className?: string;
  children?: React.ReactNode;
}

/** `Tafí del Valle` → `tafi-del-valle.gpx` */
function gpxFileName(title: string) {
  const slug = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${slug || 'track'}.gpx`;
}

// Firebase Storage sirve el GPX con `Content-Disposition: inline`, así que un <a> común
// navega a una pestaña en blanco y el usuario tiene que guardar el archivo a mano.
// Bajamos el archivo como blob para forzar la descarga sin salir de la página.
export function TrackDownloadButton({ fileUrl, title, className, children }: TrackDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Error al descargar el GPX');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = gpxFileName(title);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error('GPX download failed', error);
      // Último recurso: abrir el archivo directo desde Firebase.
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button type="button" onClick={handleDownload} disabled={downloading} className={className}>
      {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
      {children ?? 'Descargar GPX'}
    </button>
  );
}
