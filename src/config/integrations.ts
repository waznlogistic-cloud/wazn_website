/**
 * Integration Configuration
 * 
 * Centralized configuration for third-party integrations
 */

export interface IntegrationsConfig {
  aramex: {
    enabled: boolean;
    accountNumber?: string;
    userName?: string;
    password?: string;
    accountPin?: string;
    accountEntity?: string;
    accountCountryCode?: string;
    apiUrl?: string;
  };
  mrsool: {
    enabled: boolean;
    apiKey?: string;
    apiUrl?: string;
  };
  tapPayments: {
    enabled: boolean;
    secretKey?: string;
    publicKey?: string;
    merchantId?: string;
    apiUrl?: string;
    redirectUrl?: string;
    webhookUrl?: string;
    currency?: string;
  };
}

/**
 * Get integration configuration from environment variables
 */
export function getIntegrationsConfig(): IntegrationsConfig {
  return {
    aramex: {
      enabled: import.meta.env.VITE_ARAMEX_ENABLED === "true",
      accountNumber: import.meta.env.VITE_ARAMEX_ACCOUNT_NUMBER,
      userName: import.meta.env.VITE_ARAMEX_USERNAME,
      password: import.meta.env.VITE_ARAMEX_PASSWORD,
      accountPin: import.meta.env.VITE_ARAMEX_ACCOUNT_PIN,
      accountEntity: import.meta.env.VITE_ARAMEX_ACCOUNT_ENTITY,
      accountCountryCode: import.meta.env.VITE_ARAMEX_ACCOUNT_COUNTRY_CODE || "SA",
      apiUrl: import.meta.env.VITE_ARAMEX_API_URL,
    },
    mrsool: {
      enabled: import.meta.env.VITE_MRSOOL_ENABLED === "true",
      apiKey: import.meta.env.VITE_MRSOOL_API_KEY,
      apiUrl: import.meta.env.VITE_MRSOOL_API_URL || "https://logistics.staging.mrsool.co/api",
    },
    tapPayments: {
      enabled: import.meta.env.VITE_TAP_ENABLED === "true",
      secretKey: import.meta.env.VITE_TAP_SECRET_KEY,
      publicKey: import.meta.env.VITE_TAP_PUBLIC_KEY,
      merchantId: import.meta.env.VITE_TAP_MERCHANT_ID,
      apiUrl: import.meta.env.VITE_TAP_API_URL || "https://api.tap.company/v2/",
      redirectUrl: import.meta.env.VITE_TAP_REDIRECT_URL,
      webhookUrl: import.meta.env.VITE_TAP_WEBHOOK_URL,
      currency: import.meta.env.VITE_TAP_CURRENCY || "SAR",
    },
  };
}

/**
 * Initialize all integrations
 * This function is called at app startup to initialize third-party services
 */
export function initializeIntegrations() {
  try {
    const config = getIntegrationsConfig();

    // Initialize Aramex
    if (config.aramex.enabled) {
      // Validate all required fields are present
      const requiredFields = {
        accountNumber: config.aramex.accountNumber,
        userName: config.aramex.userName,
        password: config.aramex.password,
        accountPin: config.aramex.accountPin,
        accountEntity: config.aramex.accountEntity,
        accountCountryCode: config.aramex.accountCountryCode,
      };

      // Check if all required fields are present
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.warn(
          `Aramex integration enabled but missing required fields: ${missingFields.join(", ")}. Skipping Aramex initialization.`
        );
        // Continue to next service instead of returning
      } else {

        // Use dynamic import to avoid issues if service doesn't exist
        import("@/services/aramex")
          .then((module) => {
            module.aramexService.initialize({
              accountNumber: requiredFields.accountNumber as string,
              userName: requiredFields.userName as string,
              password: requiredFields.password as string,
              accountPin: requiredFields.accountPin as string,
              accountEntity: requiredFields.accountEntity as string,
              accountCountryCode: requiredFields.accountCountryCode as string,
              apiUrl: config.aramex.apiUrl,
            });
            console.log("Aramex service initialized successfully");
          })
          .catch((error) => {
            console.warn("Failed to initialize Aramex service:", error);
          });
      }
    }

    // Initialize Mrsool
    if (config.mrsool.enabled) {
      // Validate required fields are present
      if (!config.mrsool.apiKey) {
        console.warn(
          "Mrsool integration enabled but missing required field: apiKey. Skipping Mrsool initialization."
        );
        // Continue to next service instead of returning
      } else {
        import("@/services/mrsool")
          .then((module) => {
            module.mrsoolService.initialize({
              apiKey: config.mrsool.apiKey as string,
              apiUrl: config.mrsool.apiUrl,
            });
            console.log("Mrsool service initialized successfully");
          })
          .catch((error) => {
            console.warn("Failed to initialize Mrsool service:", error);
          });
      }
    }

    // Initialize Tap Payments
    if (config.tapPayments.enabled) {
      // Validate required fields are present
      if (!config.tapPayments.secretKey || !config.tapPayments.publicKey) {
        console.warn(
          "Tap Payments integration enabled but missing required fields: secretKey or publicKey. Skipping Tap Payments initialization."
        );
        // Continue to next service instead of returning (though this is the last one)
      } else {
        import("@/services/tapPayments")
          .then((module) => {
            module.tapPaymentsService.initialize({
              secretKey: config.tapPayments.secretKey as string,
              publicKey: config.tapPayments.publicKey as string,
              merchantId: config.tapPayments.merchantId,
              apiUrl: config.tapPayments.apiUrl,
              redirectUrl: config.tapPayments.redirectUrl,
              webhookUrl: config.tapPayments.webhookUrl,
              currency: config.tapPayments.currency,
            });
            console.log("Tap Payments service initialized successfully");
          })
          .catch((error) => {
            console.warn("Failed to initialize Tap Payments service:", error);
          });
      }
    }
  } catch (error) {
    // Don't crash the app if integration initialization fails
    console.error("Error initializing integrations:", error);
  }
}

