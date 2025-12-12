/**
 * Aramex Product Type Mappings
 * 
 * Maps internal shipment types and delivery methods to Aramex product codes
 * Based on ProductGroup.docx and shipping-services-api-manual.pdf
 */

export interface AramexProductMapping {
  productGroup: "DOM" | "EXP";
  productType: string;
  services?: string; // Additional services like "NOON" for same-day
}

/**
 * Determine product group based on origin and destination countries
 */
export function getProductGroup(originCountry: string, destinationCountry: string): "DOM" | "EXP" {
  // Normalize country codes (handle both "SA" and "Saudi Arabia")
  const normalizeCountry = (country: string): string => {
    const upper = country.toUpperCase();
    // Common country code mappings
    const mappings: Record<string, string> = {
      "SAUDI ARABIA": "SA",
      "SA": "SA",
      "UNITED ARAB EMIRATES": "AE",
      "UAE": "AE",
      "KUWAIT": "KW",
      "BAHRAIN": "BH",
      "QATAR": "QA",
      "OMAN": "OM",
      "JORDAN": "JO",
    };
    return mappings[upper] || upper.slice(0, 2);
  };

  const origin = normalizeCountry(originCountry);
  const destination = normalizeCountry(destinationCountry);

  // DOM (Domestic) if same country, EXP (International Express) otherwise
  return origin === destination ? "DOM" : "EXP";
}

/**
 * Get Aramex product type based on shipment type and delivery method
 * 
 * @param shipType - Internal shipment type (document, package, fragile, heavy)
 * @param deliveryMethod - Internal delivery method (standard, express, same-day)
 * @param productGroup - DOM or EXP (determined by origin/destination)
 * @returns Aramex product mapping
 */
export function getAramexProductMapping(
  shipType: string,
  deliveryMethod: string,
  productGroup: "DOM" | "EXP"
): AramexProductMapping {
  // Default mappings for standard shipments
  const defaultMapping: AramexProductMapping = {
    productGroup,
    productType: productGroup === "DOM" ? "CDS" : "EPX",
  };

  // Express/Priority service mappings (for international express)
  if (deliveryMethod === "express" && productGroup === "EXP") {
    // Use Priority service for express international
    if (shipType === "document") {
      return {
        productGroup: "EXP",
        productType: "PDX", // Priority Document Express
      };
    } else {
      return {
        productGroup: "EXP",
        productType: "PPX", // Priority Parcel Express
      };
    }
  }

  // Same-day service (requires NOON service code)
  // Note: This may not be available with all product types - needs verification with Aramex
  if (deliveryMethod === "same-day") {
    return {
      productGroup,
      productType: productGroup === "DOM" ? "CDS" : "EPX", // Base product type
      services: "NOON", // Additional service: Committed delivery before Noon
    };
  }

  // Standard mappings for document, package, fragile, heavy
  // All use the default CDS (Domestic) or EPX (International)
  return defaultMapping;
}

/**
 * Get operations instructions based on shipment type
 */
export function getOperationsInstructions(shipType: string): string {
  if (shipType === "fragile") {
    return "FRAGILE/HANDLE WITH CARE";
  }
  if (shipType === "heavy") {
    return "HEAVY PACKAGE/HANDLE WITH CARE";
  }
  return "";
}

/**
 * Country code mappings for common country names
 * ISO 3166-1 alpha-2 country codes
 */
export const COUNTRY_CODE_MAPPINGS: Record<string, string> = {
  // GCC Countries
  "SAUDI ARABIA": "SA",
  "السعودية": "SA", // Arabic name for Saudi Arabia
  "المملكة العربية السعودية": "SA", // Full Arabic name
  "SA": "SA",
  "UNITED ARAB EMIRATES": "AE",
  "UAE": "AE",
  "KUWAIT": "KW",
  "BAHRAIN": "BH",
  "QATAR": "QA",
  "OMAN": "OM",
  // Middle East
  "JORDAN": "JO",
  "EGYPT": "EG",
  "LEBANON": "LB",
  "IRAQ": "IQ",
  "SYRIA": "SY",
  "YEMEN": "YE",
  "PALESTINE": "PS",
  "ISRAEL": "IL",
  "TURKEY": "TR",
  "IRAN": "IR",
  // North America
  "UNITED STATES": "US",
  "USA": "US",
  "U.S.A": "US",
  "U.S.A.": "US",
  "CANADA": "CA",
  "MEXICO": "MX",
  // Europe
  "UNITED KINGDOM": "GB",
  "UK": "GB",
  "U.K.": "GB",
  "GREAT BRITAIN": "GB",
  "FRANCE": "FR",
  "GERMANY": "DE",
  "ITALY": "IT",
  "SPAIN": "ES",
  "NETHERLANDS": "NL",
  "BELGIUM": "BE",
  "SWITZERLAND": "CH",
  "AUSTRIA": "AT",
  "SWEDEN": "SE",
  "NORWAY": "NO",
  "DENMARK": "DK",
  "POLAND": "PL",
  "RUSSIA": "RU",
  // Asia
  "CHINA": "CN",
  "JAPAN": "JP",
  "SOUTH KOREA": "KR",
  "KOREA": "KR",
  "INDIA": "IN",
  "PAKISTAN": "PK",
  "BANGLADESH": "BD",
  "SRI LANKA": "LK",
  "THAILAND": "TH",
  "VIETNAM": "VN",
  "SINGAPORE": "SG",
  "MALAYSIA": "MY",
  "INDONESIA": "ID",
  "PHILIPPINES": "PH",
  "AUSTRALIA": "AU",
  "NEW ZEALAND": "NZ",
  // Africa
  "SOUTH AFRICA": "ZA",
  "KENYA": "KE",
  "NIGERIA": "NG",
  "MOROCCO": "MA",
  "ALGERIA": "DZ",
  "TUNISIA": "TN",
  // South America
  "BRAZIL": "BR",
  "ARGENTINA": "AR",
  "CHILE": "CL",
};

