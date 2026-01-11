'use server';

import { getBenefits } from '../google-sheets';
import { getFirebaseBenefits } from './benefits';
import { Benefit } from '../data';

/**
 * Fetches benefits from Google Sheets on the server 
 * to keep the URL private and avoid CORS/Env issues.
 */
export async function fetchBenefitsFromSheets() {
  try {
    const sheetBenefits = await getBenefits();
    
    // We've fetched them, now we return them to the client
    // so the client (which is authenticated) can save them.
    return { success: true, benefits: sheetBenefits };
  } catch (error) {
    console.error('Error fetching benefits from sheet:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Helper to check which benefits already exist in Firebase.
 * This can also run on the server to keep the check efficient.
 */
export async function getExistingBenefitsKeys() {
  try {
    const existingBenefits = await getFirebaseBenefits();
    return existingBenefits.map(b => `${b.company.toLowerCase()}|${b.title.toLowerCase()}`);
  } catch (error) {
    console.error('Error fetching existing benefits keys:', error);
    return [];
  }
}
