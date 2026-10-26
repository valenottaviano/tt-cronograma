"use client";

import { toast } from "sonner";

// Safari iOS ignores Content-Disposition: attachment and navigates away when clicking
// a plain anchor. Fetching as a blob and using createObjectURL keeps the user on the page.
export async function downloadFile(proxyUrl: string) {
  try {
    const res = await fetch(proxyUrl);
    // Una descarga que falla en silencio se vive como un botón roto: el atleta
    // toca, no pasa nada, y no hay forma de saber que el servidor dijo que no.
    if (!res.ok) {
      toast.error(
        res.status === 401
          ? "Tu sesión venció. Volvé a entrar para descargar el archivo."
          : "No pudimos descargar el archivo. Probá de nuevo en un rato."
      );
      console.error("GPX download failed", res.status, proxyUrl);
      return;
    }
    const cd = res.headers.get("content-disposition") ?? "";
    const match = cd.match(/filename[^;=\n]*=["']?([^"'\n;]+)["']?/);
    const filename = match ? match[1].trim() : "track.gpx";
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    toast.error("No pudimos descargar el archivo. Revisá tu conexión.");
    console.error("GPX download failed", err);
  }
}
