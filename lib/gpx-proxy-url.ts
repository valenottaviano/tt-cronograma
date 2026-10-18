/** Los GPX de la planilla pasan por el proxy autenticado: el panel no los sirve públicos. */
export function gpxProxyUrl(url: string): string {
  return `/api/client/gpx-download?url=${encodeURIComponent(url)}`;
}
