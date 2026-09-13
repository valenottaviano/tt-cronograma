import Papa from "papaparse";
import { News } from "./data";

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

export async function getNews(): Promise<News[]> {
  const url = process.env.GOOGLE_SHEET_NEWS_URL;
  const data = await fetchSheetData(url);

  return (data as Record<string, string>[]).map((row) => ({
    id: row.id || Math.random().toString(36).substr(2, 9),
    title: row.titulo,
    subtitle: row.subtitulo,
    link:
      row.link && !row.link.startsWith("http")
        ? `https://${row.link}`
        : row.link,
  })) as News[];
}

