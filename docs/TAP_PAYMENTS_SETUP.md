# 💳 Tap Payments Integration Setup Guide

This guide explains how to set up and test the Tap Payments integration for the Wazn platform.

## ✅ What's Already Done

1. **Tap Payments Service** (`src/services/tapPayments.ts`)
   - Charge creation API
   - Payment status checking
   - Webhook payload processing

2. **Payment Success Page** (`src/modules/core/pages/PaymentSuccess.tsx`)
   - Handles redirect from Tap Payments
   - Completes order creation after payment
   - Shows success/error messages

3. **Integration in Order Flow** (`src/modules/employer/pages/CreateOrderMultiStep.tsx`)
   - Payment processing before order creation
   - Redirects to Tap Payments hosted page
   - Stores order data temporarily

## 🔧 Configuration

### 1. Environment Variables

Your `.env.local` should have:

```env
VITE_TAP_ENABLED=true
VITE_TAP_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY
VITE_TAP_PUBLIC_KEY=pk_test_YOUR_TEST_PUBLIC_KEY
VITE_TAP_MERCHANT_ID=YOUR_MERCHANT_ID
VITE_TAP_API_URL=https://api.tap.company/v2/
VITE_TAP_CURRENCY=SAR
VITE_TAP_REDIRECT_URL=http://localhost:5175/payment/success
VITE_TAP_WEBHOOK_URL=http://localhost:5175/api/tap/webhook
```

**⚠️ SECURITY**: Never commit actual API keys to source code. Add your actual Tap Payments credentials to `.env.local` (which is gitignored). Obtain test credentials from your Tap Payments dashboard.

### 2. Production URLs

For production, update these URLs in your hosting platform (Vercel):

```env
VITE_TAP_REDIRECT_URL=https://your-domain.com/payment/success
VITE_TAP_WEBHOOK_URL=https://your-domain.com/api/tap/webhook
```

## 🔄 Payment Flow

1. **User fills order form** → Step 1: Shipment details
2. **User selects Aramex** → Step 2: Shipping company (rate calculated)
3. **User clicks "Create Order"** → Step 3: Payment
4. **System creates Tap charge** → Redirects to Tap Payments hosted page
5. **User completes payment** → Tap redirects to `/payment/success`
6. **Payment Success page** → Verifies payment → Creates order → Shows confirmation

## 📡 Webhook Handler

**✅ Implemented:** A Supabase Edge Function has been created to handle Tap Payments webhooks.

### Location

The webhook handler is located at:
- **Function**: `supabase/functions/tap-webhook/index.ts`
- **Documentation**: `supabase/functions/tap-webhook/README.md`

### Features

The webhook handler automatically:
1. ✅ Listens for CAPTURED payment status from Tap Payments
2. ✅ Finds the order by `tap_charge_id`
3. ✅ Updates order `payment_status` to 'paid'
4. ✅ Triggers Aramex shipment creation automatically
5. ✅ Updates order with tracking information
6. ✅ Handles errors gracefully (order is paid even if shipment fails)

### Deployment

See `supabase/functions/tap-webhook/README.md` for detailed deployment instructions.

**Quick Deploy:**

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login and Link:**
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. **Set Secrets:**
   ```bash
   supabase secrets set ARAMEX_ENABLED=true
   supabase secrets set ARAMEX_ACCOUNT_NUMBER=your_account_number
   supabase secrets set ARAMEX_USERNAME=your_username
   supabase secrets set ARAMEX_PASSWORD=your_password
   supabase secrets set ARAMEX_ACCOUNT_PIN=your_pin
   supabase secrets set ARAMEX_ACCOUNT_ENTITY=your_entity
   supabase secrets set ARAMEX_ACCOUNT_COUNTRY_CODE=SA
   ```

4. **Deploy:**
   ```bash
   supabase functions deploy tap-webhook
   ```

5. **Configure in Tap Payments Dashboard:**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-project-ref.supabase.co/functions/v1/tap-webhook`
   - Select events: "Charge Captured" or "All Events"

### Option 2: Separate Backend API

Create a Node.js/Express API endpoint:

```javascript
app.post('/api/tap/webhook', async (req, res) => {
  const payload = req.body;
  // Process webhook and update database
  // ...
  res.json({ success: true });
});
```

## 🧪 Testing

### Test Payment Flow

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Login as employer** → Navigate to "إنشاء طلب جديد"

3. **Fill order form:**
   - Shipment details (date, type, weight, delivery method)
   - Sender details (name, phone, address)
   - Receiver details (name, phone, address)

4. **Select Aramex** → Wait for rate calculation

5. **Click "Create Order"** → Should redirect to Tap Payments

6. **Complete payment** on Tap's page:
   - Use test card: `5123450000000008`
   - CVV: Any 3 digits
   - Expiry: Any future date

7. **Verify redirect** → Should return to `/payment/success`

8. **Check order creation** → Navigate to "الطلبات" and verify new order

### Test Cards (Tap Payments)

- **Success:** `5123450000000008`
- **Declined:** `5123450000000009`
- **3D Secure:** `5123450000000016`

## 🔍 Troubleshooting

### Payment redirect not working

- Check `.env.local` has correct `VITE_TAP_REDIRECT_URL`
- Verify Tap Payments credentials are correct
- Check browser console for errors

### Order not created after payment

- Check `sessionStorage` for `pendingOrderData`
- Verify payment success page is loading
- Check browser console for errors
- Verify user is logged in

### Webhook not receiving updates

- Verify webhook URL is publicly accessible
- Check Tap Payments dashboard for webhook logs
- Ensure webhook endpoint returns 200 status
- Check Supabase Edge Function logs (if using)

## 📝 Next Steps

1. ✅ **Payment Success Page** - Created
2. ✅ **Webhook Handler** - Supabase Edge Function created
3. ⏳ **Deploy Webhook** - Deploy Edge Function and configure in Tap Payments
4. ⏳ **Test End-to-End** - Complete test payment flow with webhook
5. ⏳ **Production Setup** - Configure production URLs and secrets
6. ⏳ **Error Handling** - Add retry logic for failed shipments
7. ⏳ **Payment History** - Show payment status in orders list

## 🔐 Security Notes

- Never commit `.env.local` to git
- Use environment variables in production (Vercel, etc.)
- Verify webhook signatures (when Tap provides them)
- Use HTTPS for webhook URLs in production
- Store sensitive data securely in Supabase

