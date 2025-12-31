export interface Person {
  estado: string;
  nombre: string;
  apellido: string;
  dni: string;
}

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiKzgX37VFKzlOHWPT6-TkPPmwJETqD8YQphg21kFcSsBuj7WEhkHPWD7Uivsix9UUi5spOnCLC1Nn/pub?output=csv";

export async function fetchCredentialData(): Promise<Person[]> {
  try {
    const response = await fetch(CSV_URL, { next: { revalidate: 3600 } }); // Cache for 1 hour
    const csvText = await response.text();
    
    // Basic CSV parsing
    const lines = csvText.split("\n").filter(line => line.trim() !== "");
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
      const obj: any = {};
      headers.forEach((header, i) => {
        const key = header.toLowerCase();
        obj[key] = values[i] || "";
      });
      return obj as Person;
    });
  } catch (error) {
    console.error("Error fetching credential data:", error);
    return [];
  }
}

export async function getPersonByDni(dni: string): Promise<Person | null> {
  const data = await fetchCredentialData();
  const found = data.find(p => p.dni === dni.trim());
  return found || null;
}
