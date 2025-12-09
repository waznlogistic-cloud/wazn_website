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
  tapPayments: {
    enabled: boolean;
    secretKey?: string;
    publicKey?: string;
    merchantId?: string;
    apiUrl?: string;
    redirectUrl?: string;
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
    tapPayments: {
      enabled: import.meta.env.VITE_TAP_ENABLED === "true",
      secretKey: import.meta.env.VITE_TAP_SECRET_KEY,
      publicKey: import.meta.env.VITE_TAP_PUBLIC_KEY,
      merchantId: import.meta.env.VITE_TAP_MERCHANT_ID,
      apiUrl: import.meta.env.VITE_TAP_API_URL,
      redirectUrl: import.meta.env.VITE_TAP_REDIRECT_URL,
    },
  };
}

/**
 * Initialize all integrations
 */
export function initializeIntegrations() {
  const config = getIntegrationsConfig();

  // Initialize Aramex
  if (config.aramex.enabled && config.aramex.accountNumber) {
    const { aramexService } = require("@/services/aramex");
    aramexService.initialize({
      accountNumber: config.aramex.accountNumber!,
      userName: config.aramex.userName!,
      password: config.aramex.password!,
      accountPin: config.aramex.accountPin!,
      accountEntity: config.aramex.accountEntity!,
      accountCountryCode: config.aramex.accountCountryCode!,
      apiUrl: config.aramex.apiUrl,
    });
  }

  // Initialize Tap Payments
  if (config.tapPayments.enabled && config.tapPayments.secretKey) {
    const { tapPaymentsService } = require("@/services/tapPayments");
    tapPaymentsService.initialize({
      secretKey: config.tapPayments.secretKey!,
      publicKey: config.tapPayments.publicKey!,
      apiUrl: config.tapPayments.apiUrl,
      redirectUrl: config.tapPayments.redirectUrl,
    });
  }
}

