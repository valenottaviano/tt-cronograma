import Papa from "papaparse";
import { Race, RaceType, Benefit, News } from "./data";

async function fetchSheetData(url: string | undefined) {
  if (!url) {
    console.warn("Sheet URL is not defined.");
    return [];
  }

  try {
    const response = await fetch(url, { next: { revalidate: 0 } });

    if (!response.ok) {
      console.error(`Failed to fetch sheet: ${response.status}`);
      return [];
    }

    const csvText = await response.text();
    const { data } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    return data;
  } catch (error) {
    console.error(`Error fetching sheet:`, error);
    return [];
  }
}

export async function getRaces(): Promise<Race[]> {
  // Support both new specific var and old generic var
  const url =
    process.env.GOOGLE_SHEET_RACES_URL || process.env.GOOGLE_SHEET_CSV_URL;
  const data = await fetchSheetData(url);

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
}

export async function getBenefits(): Promise<Benefit[]> {
  const url = process.env.GOOGLE_SHEET_BENEFITS_URL;
  const data = await fetchSheetData(url);

  return data.map((row: any) => ({
    id: row.id || Math.random().toString(36).substr(2, 9),
    title: row.titulo,
    description: row.descripcion,
    company: row.empresa,
    logo: row.logo,
    linkCta: row.link_cta,
  })) as Benefit[];
}

export async function getNews(): Promise<News[]> {
  const url = process.env.GOOGLE_SHEET_NEWS_URL;
  const data = await fetchSheetData(url);
  console.log("Fetched news data:", data);

  return data.map((row: any) => ({
    id: row.id || Math.random().toString(36).substr(2, 9),
    title: row.titulo,
    subtitle: row.subtitulo,
    link:
      row.link && !row.link.startsWith("http")
        ? `https://${row.link}`
        : row.link,
  })) as News[];
}

export async function getRaceById(id: string): Promise<Race | undefined> {
  const races = await getRaces();
  return races.find((race) => race.id === id);
}
