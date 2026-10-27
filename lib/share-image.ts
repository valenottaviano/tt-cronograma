"use client";

import { toast } from "sonner";

/**
 * Pasa una imagen generada en el navegador al atleta. En el celular abre el
 * menú de compartir (WhatsApp, Fotos…): en la app instalada del iPhone un
 * link de descarga no hace nada. En la compu, la descarga de siempre.
 */
export async function shareOrDownloadImage(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type || "image/png" });
  const touch = window.matchMedia("(pointer: coarse)").matches;

  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
    } catch (err) {
      if ((err as DOMException).name === "AbortError") return; // cerró el menú
      // Safari pide que compartir salga de un toque, y armar la imagen puede
      // tardar más de lo que dura ese toque: se ofrece otro.
      if ((err as DOMException).name === "NotAllowedError") {
        toast("La imagen está lista", {
          action: { label: "Compartir", onClick: () => navigator.share({ files: [file] }).catch(() => {}) },
          duration: 15000,
        });
        return;
      }
      throw err;
    }
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
