import Papa from "papaparse";
import { Race, RaceType } from "./data";

export async function getRaces(): Promise<Race[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetGid = process.env.GOOGLE_SHEET_GID || "0";
  const sheetUrl = process.env.GOOGLE_SHEET_CSV_URL;

  let url = sheetUrl;

  // Prioritize using the direct export URL if ID is available
  // This avoids the "Publish to Web" latency
  if (sheetId) {
    url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheetGid}`;
  }

  if (!url) {
    console.warn("GOOGLE_SHEET_ID or GOOGLE_SHEET_CSV_URL is not defined.");
    return [];
  }

  try {
    // revalidate: 0 ensures we always get the latest data
    const response = await fetch(url, { next: { revalidate: 0 } });

    if (!response.ok) {
      console.error(
        `Failed to fetch sheet: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const csvText = await response.text();

    const { data } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const races = data.map((row: any) => ({
      id: row.id || Math.random().toString(36).substr(2, 9),
      name: row.name,
      date: row.date,
      location: row.location,
      province: row.province,
      distance: row.distance,
      type: (row.type as RaceType) || "road",
      url: row.url,
      image: row.image,
      description: row.description,
      discountCode: row.discountCode,
    })) as Race[];

    return races.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error("Error fetching races from Google Sheets:", error);
    return [];
  }
}

export async function getRaceById(id: string): Promise<Race | undefined> {
  const races = await getRaces();
  return races.find((race) => race.id === id);
}
