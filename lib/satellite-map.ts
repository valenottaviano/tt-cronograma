import type * as Leaflet from 'leaflet';
import type { TrackStats } from '@/lib/gpx';

/**
 * Imágenes satelitales de Esri (World Imagery) y, encima, nombres de lugares
 * para orientarse. No piden clave.
 *
 * OJO: los términos de Esri piden mostrar la atribución. Se sacó del mapa a
 * pedido (2026-10-18); si hay que reponerla, es `attributionControl: true` y
 * la opción `attribution` de la capa satelital.
 */
const SATELLITE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

const ROUTE_COLOR = '#ED241F';

/**
 * El recorrido sobre el satelital, igual en Entreno y en Tracks. Sin
 * `interactive` el mapa es una imagen: no se arrastra ni hace zoom, para que
 * en una lista el dedo siga scrolleando la página.
 */
export function createRouteMap(
  L: typeof Leaflet,
  container: HTMLElement,
  points: TrackStats['points'],
  { interactive = true }: { interactive?: boolean } = {},
): Leaflet.Map {
  const map = L.map(container, {
    zoomControl: interactive,
    dragging: interactive,
    touchZoom: interactive,
    doubleClickZoom: interactive,
    boxZoom: interactive,
    keyboard: interactive,
    // La página scrollea: que la rueda no le robe el scroll al mapa.
    scrollWheelZoom: false,
    attributionControl: false,
  });
  L.tileLayer(SATELLITE_URL, { maxZoom: 19 }).addTo(map);
  L.tileLayer(LABELS_URL, { maxZoom: 19, opacity: 0.8 }).addTo(map);

  const latLngs = points.map((p) => L.latLng(p.lat, p.lon));
  // Un contorno oscuro debajo hace que la línea se lea sobre cualquier terreno.
  L.polyline(latLngs, { color: '#000', weight: 7, opacity: 0.45, interactive: false }).addTo(map);
  const line = L.polyline(latLngs, { color: ROUTE_COLOR, weight: 4, opacity: 1, interactive: false }).addTo(map);

  const dot = (fill: string) => ({ radius: 7, color: '#fff', weight: 2, fillColor: fill, fillOpacity: 1, interactive });
  L.circleMarker(latLngs[0], dot('#22c55e')).bindTooltip('Salida').addTo(map);
  L.circleMarker(latLngs[latLngs.length - 1], dot(ROUTE_COLOR)).bindTooltip('Llegada').addTo(map);

  map.fitBounds(line.getBounds(), { padding: [24, 24] });
  return map;
}
