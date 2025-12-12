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

**Important:** Webhooks require a backend API endpoint. Since this is a frontend-only React app, you have two options:

### Option 1: Supabase Edge Function (Recommended)

Create a Supabase Edge Function to handle webhooks:

1. Create `supabase/functions/tap-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const payload = await req.json();
    
    // Verify webhook signature (if Tap provides one)
    // TODO: Implement signature verification
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Extract order ID from reference
    const orderId = payload.data?.object?.reference?.order;
    const chargeId = payload.data?.object?.id;
    const status = payload.data?.object?.status;
    
    if (orderId && chargeId) {
      // Update order payment status
      const paymentStatus = status === "CAPTURED" ? "paid" : 
                           status === "FAILED" || status === "DECLINED" ? "failed" : 
                           "pending";
      
      await supabase
        .from("orders")
        .update({
          payment_status: paymentStatus,
          tap_charge_id: chargeId,
          paid_at: status === "CAPTURED" ? new Date().toISOString() : null,
        })
        .eq("tap_charge_id", chargeId);
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

2. Deploy the function:
```bash
supabase functions deploy tap-webhook
```

3. Update webhook URL in Tap Payments dashboard:
   - Go to Tap Payments dashboard
   - Set webhook URL to: `https://your-project.supabase.co/functions/v1/tap-webhook`

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
2. ⏳ **Webhook Handler** - Create Supabase Edge Function
3. ⏳ **Test End-to-End** - Complete test payment flow
4. ⏳ **Production Setup** - Configure production URLs
5. ⏳ **Error Handling** - Add retry logic for failed payments
6. ⏳ **Payment History** - Show payment status in orders list

## 🔐 Security Notes

- Never commit `.env.local` to git
- Use environment variables in production (Vercel, etc.)
- Verify webhook signatures (when Tap provides them)
- Use HTTPS for webhook URLs in production
- Store sensitive data securely in Supabase

