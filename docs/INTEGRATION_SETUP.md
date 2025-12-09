# Integration Setup Guide

## Quick Setup Checklist

### 1. Aramex Integration

**What we need from you:**
- [ ] Aramex Account Number
- [ ] Aramex Username
- [ ] Aramex Password
- [ ] Aramex Account PIN
- [ ] Aramex Account Entity
- [ ] Aramex Account Country Code (usually "SA")
- [ ] API Documentation/Endpoint URLs (if different from default)

**Environment Variables to Add:**
```env
VITE_ARAMEX_ENABLED=true
VITE_ARAMEX_ACCOUNT_NUMBER=your_account_number
VITE_ARAMEX_USERNAME=your_username
VITE_ARAMEX_PASSWORD=your_password
VITE_ARAMEX_ACCOUNT_PIN=your_pin
VITE_ARAMEX_ACCOUNT_ENTITY=your_entity
VITE_ARAMEX_ACCOUNT_COUNTRY_CODE=SA
```

### 2. Tap Payments Integration

**What we need from you:**
- [ ] Tap Payments Secret Key
- [ ] Tap Payments Public Key
- [ ] Tap Payments Merchant ID
- [ ] Webhook Secret (for webhook verification)
- [ ] Test/Sandbox credentials (for testing)

**Environment Variables to Add:**
```env
VITE_TAP_ENABLED=true
VITE_TAP_SECRET_KEY=your_secret_key
VITE_TAP_PUBLIC_KEY=your_public_key
VITE_TAP_MERCHANT_ID=your_merchant_id
VITE_TAP_REDIRECT_URL=https://wazn-website.vercel.app/payment/callback
```

## Integration Flow

### Order Creation → Payment → Aramex Flow

1. **User creates order** → Order saved to database
2. **Payment initiated** → Tap Payments charge created
3. **User redirected** → Tap Payments payment page
4. **Payment success** → Webhook received → Order status updated
5. **Aramex shipment** → Shipment created with Aramex
6. **Tracking** → Tracking number saved, user can track

## Database Updates Needed

We'll need to add these fields to the `orders` table:

```sql
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS aramex_shipment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS aramex_tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tap_charge_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'SAR';
```

## Next Steps

1. **Provide Credentials** - Send me the Aramex and Tap Payments credentials
2. **Test Integration** - We'll test with sandbox/test credentials first
3. **Update Order Flow** - Integrate into existing order creation
4. **Add Provider Selection** - Allow users to select Aramex as provider
5. **Payment Integration** - Add payment step before order creation
6. **Webhook Setup** - Set up webhook endpoints for payment callbacks
7. **Testing** - End-to-end testing of complete flow

## Files Created

- `src/services/aramex.ts` - Aramex API service
- `src/services/tapPayments.ts` - Tap Payments API service
- `src/config/integrations.ts` - Integration configuration
- `docs/INTEGRATIONS.md` - Integration documentation
- `docs/INTEGRATION_SETUP.md` - This file

## Ready for Integration

The structure is ready. Once you provide:
1. Aramex credentials → I'll complete the Aramex integration
2. Tap Payments credentials → I'll complete the payment integration
3. Any API documentation → I'll adjust the implementation

Then we can test and deploy!

