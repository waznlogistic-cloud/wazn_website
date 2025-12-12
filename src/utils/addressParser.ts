/**
 * Address Parser Utility
 * 
 * Parses address strings from Nominatim/OpenStreetMap into structured format
 * for Aramex API integration
 */

import { COUNTRY_CODE_MAPPINGS } from "@/config/aramexMappings";

export interface ParsedAddress {
  line1: string;
  line2?: string;
  city: string;
  countryCode: string;
  postCode?: string;
  stateOrProvinceCode?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Parse address string from Nominatim format
 * Example: "Riyadh, Saudi Arabia" or "King Fahd Road, Al Olaya, Riyadh 12211, Saudi Arabia"
 */
export function parseAddressString(
  addressString: string,
  lat?: number,
  lng?: number
): ParsedAddress {
  if (!addressString || addressString.trim() === "") {
    // Throw error instead of returning invalid default with empty line1
    throw new Error(
      "Address string is empty or invalid. Please provide a valid address with street, city, and country."
    );
  }

  // Split by comma
  const parts = addressString.split(",").map((p) => p.trim());

  // Try to extract country (usually last part)
  let countryCode: string | undefined;
  let city: string | undefined;
  let postCode: string | undefined;
  let stateOrProvinceCode: string | undefined;

  // Look for country in the address string (case-insensitive for English, exact match for Arabic)
  const addressUpper = addressString.toUpperCase();
  const addressOriginal = addressString; // Keep original for Arabic matching
  
  // First, try to match against known country names in mappings
  // Use word boundary matching to avoid false positives (e.g., "Arab" matching "SAUDI ARABIA")
  // Check both uppercase (for English) and original case (for Arabic)
  for (const [countryName, code] of Object.entries(COUNTRY_CODE_MAPPINGS)) {
    const countryNameUpper = countryName.toUpperCase();
    // Use word boundary regex to ensure exact word matching, not substring matching
    // This prevents "Arab" from matching "SAUDI ARABIA"
    const countryRegex = new RegExp(`\\b${countryNameUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const arabicRegex = new RegExp(`\\b${countryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    
    if (countryRegex.test(addressUpper) || arabicRegex.test(addressOriginal)) {
      countryCode = code;
      break;
    }
  }

  // If no country found, try to extract from the last part of the address
  // Common format: "City, Country" or "Street, City, Country"
  if (!countryCode && parts.length >= 2) {
    const lastPart = parts[parts.length - 1].trim();
    const lastPartUpper = lastPart.toUpperCase();
    
    // Check if last part is a known country code (2-letter ISO code)
    if (lastPartUpper.length === 2) {
      // Check if it matches any country code in our mappings
      for (const [countryName, code] of Object.entries(COUNTRY_CODE_MAPPINGS)) {
        if (code === lastPartUpper) {
          countryCode = code;
          break;
        }
      }
    }
    
    // If still not found, try to match the last part as a country name
    // Use exact matching only to avoid false positives from substring matching
    // Check both uppercase (for English) and original case (for Arabic)
    if (!countryCode) {
      for (const [countryName, code] of Object.entries(COUNTRY_CODE_MAPPINGS)) {
        const countryNameUpper = countryName.toUpperCase();
        // Exact match only - prevents "Arab" from matching "SAUDI ARABIA"
        if (
          lastPartUpper === countryNameUpper || 
          lastPart === countryName
        ) {
          countryCode = code;
          break;
        }
      }
    }
  }

  // If country code still cannot be determined, log a warning
  // This is better than defaulting to "SA" which would cause incorrect shipping calculations
  if (!countryCode) {
    console.warn(
      `Could not determine country code for address: "${addressString}". ` +
      `Please ensure the address includes a country name or code.`
    );
    // Return undefined countryCode - caller should handle this
    // For now, we'll still try to extract city and other parts
  }

  // Extract city (usually second to last or third to last part)
  // Common formats:
  // "Street, City, Country"
  // "Street, District, City, Country"
  // "Street, District, City, PostCode, Country"
  if (parts.length >= 2) {
    // Last part is usually country, second to last is usually city
    const cityCandidate = parts[parts.length - 2];
    
    // Check if it's a postcode (numeric)
    if (/^\d+$/.test(cityCandidate)) {
      postCode = cityCandidate;
      // City is one before postcode
      if (parts.length >= 3) {
        city = parts[parts.length - 3];
      }
    } else {
      // Check if cityCandidate is actually a country code/name
      const candidateUpper = cityCandidate.toUpperCase();
      // COUNTRY_CODE_MAPPINGS has country names as keys and codes as values
      // Check if candidate is a country name (key) or country code (value)
      const countryNames = Object.keys(COUNTRY_CODE_MAPPINGS).map(name => name.toUpperCase());
      const countryCodes = Object.values(COUNTRY_CODE_MAPPINGS).map(code => code.toUpperCase());
      
      // Check if candidate is a country:
      // 1. Is exactly a country code (e.g., "EG", "SA")
      // 2. Matches exactly a country name (e.g., "EGYPT", "SAUDI ARABIA")
      // NOTE: We use exact matching only to avoid false positives from substring matching
      // For example, "Arab" should NOT match "SAUDI ARABIA"
      const isCountry = countryCodes.includes(candidateUpper) ||
                       countryNames.some(name => name === candidateUpper);
      
      if (!isCountry) {
        city = cityCandidate;
      } else if (parts.length >= 3) {
        // If second-to-last is country, city is third-to-last
        city = parts[parts.length - 3];
      }
    }

    // Check for postcode in other positions
    for (const part of parts) {
      if (/^\d{5,}$/.test(part)) {
        postCode = part;
        break;
      }
    }
  }

  // If city still not found, use first part as fallback
  if (!city && parts.length > 0) {
    city = parts[0];
  }

  // Extract line1 (first part, usually the street)
  const line1 = parts.length > 0 ? parts[0] : addressString;

  // Extract line2 (second part if exists and not city/country)
  let line2: string | undefined;
  if (parts.length >= 3) {
    const secondPart = parts[1];
    const secondPartUpper = secondPart.toUpperCase();
    
    // Check if second part is a country (exact match only to avoid false positives)
    const countryNames = Object.keys(COUNTRY_CODE_MAPPINGS).map(name => name.toUpperCase());
    const countryCodes = Object.values(COUNTRY_CODE_MAPPINGS).map(code => code.toUpperCase());
    const isSecondPartCountry = countryCodes.includes(secondPartUpper) ||
                               countryNames.includes(secondPartUpper);
    
    // If second part is not city or country, it's likely line2 (district/area)
    if (secondPart !== city && !isSecondPartCountry) {
      line2 = secondPart;
    }
  }

  // Validate that we have minimum required fields
  if (!city) {
    console.warn(`Could not extract city from address: "${addressString}"`);
    city = parts.length > 0 ? parts[0] : "Unknown";
  }

  return {
    line1,
    line2,
    city,
    countryCode: countryCode || "", // Return empty string if not found (caller should validate)
    postCode,
    stateOrProvinceCode,
    latitude: lat,
    longitude: lng,
  };
}

/**
 * Validate parsed address
 * Returns true if address has minimum required fields
 */
export function validateParsedAddress(address: ParsedAddress): boolean {
  return !!(
    address.line1 &&
    address.city &&
    address.countryCode &&
    address.countryCode.length === 2
  );
}

/**
 * Format address for display
 */
export function formatAddressForDisplay(address: ParsedAddress): string {
  const parts = [address.line1];
  if (address.line2) parts.push(address.line2);
  parts.push(address.city);
  if (address.postCode) parts.push(address.postCode);
  parts.push(address.countryCode);
  return parts.join(", ");
}

