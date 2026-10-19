/** Los GPX de la planilla pasan por el proxy autenticado: el panel no los sirve públicos. */
export function gpxProxyUrl(url: string): string {
  return `/api/client/gpx-download?url=${encodeURIComponent(url)}`;
}

/**
 * Si el archivo es un GPX. El panel guarda el nombre original al final de la key
 * (`workouts/<uuid>-fondo.gpx`) y la URL firmada lo conserva en el path.
 */
export function isGpxUrl(url: string): boolean {
  try {
    return decodeURIComponent(new URL(url).pathname).toLowerCase().endsWith('.gpx');
  } catch {
    return false;
  }
}
