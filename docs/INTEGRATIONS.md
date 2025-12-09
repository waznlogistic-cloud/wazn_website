# Integrations Documentation

## Aramex Shipping Integration

### Overview
Integration with Aramex shipping API for creating shipments and tracking deliveries.

### Configuration

Add these environment variables to your `.env` file:

```env
VITE_ARAMEX_ENABLED=true
VITE_ARAMEX_ACCOUNT_NUMBER=your_account_number
VITE_ARAMEX_USERNAME=your_username
VITE_ARAMEX_PASSWORD=your_password
VITE_ARAMEX_ACCOUNT_PIN=your_account_pin
VITE_ARAMEX_ACCOUNT_ENTITY=your_entity
VITE_ARAMEX_ACCOUNT_COUNTRY_CODE=SA
VITE_ARAMEX_API_URL=https://ws.aramex.net  # Optional, defaults to production
```

### Usage

```typescript
import { aramexService } from "@/services/aramex";

// Create a shipment
const shipment = await aramexService.createShipment({
  shipper: {
    name: "Sender Name",
    email: "sender@example.com",
    phone: "0501234567",
    line1: "Address Line 1",
    city: "Riyadh",
    postCode: "12345",
    countryCode: "SA",
  },
  consignee: {
    name: "Receiver Name",
    email: "receiver@example.com",
    phone: "0507654321",
    line1: "Address Line 1",
    city: "Jeddah",
    postCode: "21421",
    countryCode: "SA",
  },
  details: {
    numberOfPieces: 1,
    weight: 5,
    weightUnit: "KG",
    productGroup: "DOM",
    productType: "ONX",
    paymentType: "P",
  },
});

// Track a shipment
const tracking = await aramexService.trackShipment({
  shipments: [shipment.shipmentId],
});
```

### API Reference

- **Aramex Developer Portal**: https://developer.aramex.com/
- **API Documentation**: https://developer.aramex.com/docs/

## Tap Payments Integration

### Overview
Integration with Tap Payments for processing payments.

### Configuration

Add these environment variables to your `.env` file:

```env
VITE_TAP_ENABLED=true
VITE_TAP_SECRET_KEY=your_secret_key
VITE_TAP_PUBLIC_KEY=your_public_key
VITE_TAP_MERCHANT_ID=your_merchant_id
VITE_TAP_API_URL=https://api.tap.company/v2  # Optional
VITE_TAP_REDIRECT_URL=https://yourdomain.com/payment/callback  # Optional
```

### Usage

```typescript
import { tapPaymentsService } from "@/services/tapPayments";

// Create a charge
const charge = await tapPaymentsService.createCharge({
  amount: 100,
  currency: "SAR",
  customer: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: {
      countryCode: "+966",
      number: "501234567",
    },
  },
  merchant: {
    id: "your_merchant_id",
  },
  description: "Order payment",
  reference: {
    order: "order_123",
  },
});

// Redirect user to payment page
window.location.href = charge.redirect.url;
```

### Webhook Setup

1. Set up webhook endpoint: `/api/webhooks/tap`
2. Process webhook payloads to update order payment status
3. Verify webhook signatures for security

### API Reference

- **Tap Payments Developer Portal**: https://developers.tap.company/
- **API Documentation**: https://developers.tap.company/docs/

## Environment Variables for Production

### Vercel Setup

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all integration environment variables
3. Redeploy after adding variables

### Required Variables

**Aramex:**
- `VITE_ARAMEX_ENABLED`
- `VITE_ARAMEX_ACCOUNT_NUMBER`
- `VITE_ARAMEX_USERNAME`
- `VITE_ARAMEX_PASSWORD`
- `VITE_ARAMEX_ACCOUNT_PIN`
- `VITE_ARAMEX_ACCOUNT_ENTITY`
- `VITE_ARAMEX_ACCOUNT_COUNTRY_CODE`

**Tap Payments:**
- `VITE_TAP_ENABLED`
- `VITE_TAP_SECRET_KEY`
- `VITE_TAP_PUBLIC_KEY`
- `VITE_TAP_MERCHANT_ID`

## Testing

### Test Mode

Both services support test/sandbox environments:

- **Aramex**: Use test credentials from Aramex developer portal
- **Tap Payments**: Use test keys from Tap Payments dashboard

## Error Handling

Both services include comprehensive error handling:
- API errors are caught and thrown with descriptive messages
- Network errors are handled gracefully
- Invalid configurations throw clear error messages

