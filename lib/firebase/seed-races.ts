'use server';

import { getRaces } from '../google-sheets';
import { getFirebaseRaces } from './races';
import { Race } from '../data';

/**
 * Fetches races from Google Sheets on the server 
 * to keep the URL private and avoid CORS/Env issues.
 */
export async function fetchRacesFromSheets() {
  try {
    const sheetRaces = await getRaces();
    
    // Return them to the client
    return { success: true, races: sheetRaces };
  } catch (error) {
    console.error('Error fetching races from sheet:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Helper to check which races already exist in Firebase.
 */
export async function getExistingRacesKeys() {
  try {
    const existingRaces = await getFirebaseRaces();
    // Unique key: Name + Date
    return existingRaces.map(r => `${r.name.toLowerCase()}|${r.date}`);
  } catch (error) {
    console.error('Error fetching existing races keys:', error);
    return [];
  }
}
