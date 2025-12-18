import Papa from "papaparse";
import { Race, RaceType } from "./data";

export async function getRaces(): Promise<Race[]> {
  const sheetUrl = process.env.GOOGLE_SHEET_CSV_URL;

  if (!sheetUrl) {
    console.warn("GOOGLE_SHEET_CSV_URL is not defined, using mock data.");
    const { races } = await import("./data");
    return races;
  }

  try {
    const response = await fetch(sheetUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour
    const csvText = await response.text();

    const { data } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    return data.map((row: any) => ({
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
  } catch (error) {
    console.error("Error fetching races from Google Sheets:", error);
    const { races } = await import("./data");
    return races;
  }
}

export async function getRaceById(id: string): Promise<Race | undefined> {
  const races = await getRaces();
  return races.find((race) => race.id === id);
}
