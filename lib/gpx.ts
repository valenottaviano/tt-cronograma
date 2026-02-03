import { XMLParser } from 'fast-xml-parser';

interface ParsedPoint {
  lat: number;
  lon: number;
  ele?: number;
}

interface TrackStats {
  points: ParsedPoint[];
  distanceKm: number;
  elevationGain: number;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  } | null;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

function haversineDistance(a: ParsedPoint, b: ParsedPoint): number {
  const R = 6371e3;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lon - a.lon) * Math.PI) / 180;

  const sinΔφ = Math.sin(Δφ / 2);
  const sinΔλ = Math.sin(Δλ / 2);

  const h = sinΔφ * sinΔφ + Math.cos(φ1) * Math.cos(φ2) * sinΔλ * sinΔλ;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export async function parseGpxFile(file: File): Promise<TrackStats> {
  const text = await file.text();
  return parseGpxText(text);
}

export function parseGpxText(text: string): TrackStats {
  const json = parser.parse(text);
  const trk = json.gpx?.trk;
  if (!trk) {
    return { points: [], distanceKm: 0, elevationGain: 0, bounds: null };
  }

  const segments = Array.isArray(trk.trkseg) ? trk.trkseg : [trk.trkseg];
  const points: ParsedPoint[] = [];

  for (const seg of segments) {
    if (!seg || !seg.trkpt) continue;
    const pts = Array.isArray(seg.trkpt) ? seg.trkpt : [seg.trkpt];
    for (const pt of pts) {
      const lat = parseFloat(pt.lat);
      const lon = parseFloat(pt.lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
      const ele = pt.ele !== undefined ? parseFloat(pt.ele) : undefined;
      points.push({ lat, lon, ele });
    }
  }

  let distance = 0;
  let elevationGain = 0;
  let prev = points[0];

  for (let i = 1; i < points.length; i++) {
    const curr = points[i];
    if (prev) {
      distance += haversineDistance(prev, curr);
      if (curr.ele !== undefined && prev.ele !== undefined) {
        const delta = curr.ele - prev.ele;
        if (delta > 1) {
          elevationGain += delta;
        }
      }
    }
    prev = curr;
  }

  const bounds = points.length
    ? points.reduce(
        (acc, p) => ({
          minLat: Math.min(acc.minLat, p.lat),
          maxLat: Math.max(acc.maxLat, p.lat),
          minLon: Math.min(acc.minLon, p.lon),
          maxLon: Math.max(acc.maxLon, p.lon),
        }),
        {
          minLat: points[0].lat,
          maxLat: points[0].lat,
          minLon: points[0].lon,
          maxLon: points[0].lon,
        }
      )
    : null;

  return {
    points,
    distanceKm: Number((distance / 1000).toFixed(2)),
    elevationGain: Math.round(elevationGain),
    bounds,
  };
}

export type { ParsedPoint, TrackStats };
