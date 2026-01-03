# Tap Payments Webhook Handler

This Supabase Edge Function handles webhook events from Tap Payments. When a payment is successfully captured (CAPTURED status), it automatically:

1. Updates the order's payment status to 'paid'
2. Triggers Aramex shipment creation
3. Updates the order with tracking information

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Supabase project linked
- Environment variables configured (see Configuration section)

## Deployment

### 1. Login to Supabase

```bash
supabase login
```

### 2. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

You can find your project ref in your Supabase dashboard URL: `https://app.supabase.com/project/your-project-ref`

### 3. Set Environment Variables (Secrets)

Set the following secrets in Supabase Dashboard or via CLI:

**Via Supabase Dashboard:**
1. Go to Project Settings → Edge Functions → Secrets
2. Add each secret

**Via CLI:**
```bash
supabase secrets set ARAMEX_ENABLED=true
supabase secrets set ARAMEX_ACCOUNT_NUMBER=your_account_number
supabase secrets set ARAMEX_USERNAME=your_username
supabase secrets set ARAMEX_PASSWORD=your_password
supabase secrets set ARAMEX_ACCOUNT_PIN=your_pin
supabase secrets set ARAMEX_ACCOUNT_ENTITY=your_entity
supabase secrets set ARAMEX_ACCOUNT_COUNTRY_CODE=SA
supabase secrets set ARAMEX_API_URL=https://ws.aramex.net
```

**Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically provided by Supabase.

### 4. Deploy the Function

```bash
supabase functions deploy tap-webhook
```

### 5. Get the Webhook URL

After deployment, you'll get a URL like:
```
https://your-project-ref.supabase.co/functions/v1/tap-webhook
```

## Configuration in Tap Payments Dashboard

1. Log in to your Tap Payments dashboard
2. Go to Settings → Webhooks
3. Add a new webhook endpoint:
   - **URL**: `https://your-project-ref.supabase.co/functions/v1/tap-webhook`
   - **Events**: Select "Charge Captured" or "All Events"
   - **Method**: POST
   - **Headers**: (Optional) Add any required headers

## Testing

### Test Locally

```bash
supabase functions serve tap-webhook
```

Then test with a webhook payload:

```bash
curl -X POST http://localhost:54321/functions/v1/tap-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_test",
    "object": "event",
    "api_version": "2",
    "created": 1234567890,
    "data": {
      "object": {
        "id": "chg_test_123",
        "object": "charge",
        "amount": 10000,
        "currency": "SAR",
        "status": "CAPTURED",
        "reference": {
          "transaction": "txn_test",
          "order": "order_test"
        }
      }
    },
    "type": "charge.captured"
  }'
```

### Test with Real Webhook

Use Tap Payments test mode to send a real webhook event, or use a tool like [ngrok](https://ngrok.com/) to tunnel to your local function.

## How It Works

1. **Webhook Received**: Tap Payments sends a POST request to the webhook URL
2. **Status Check**: Function checks if payment status is "CAPTURED"
3. **Find Order**: Looks up order by `tap_charge_id` matching the charge ID
4. **Update Payment**: Updates order `payment_status` to "paid" and sets `paid_at`
5. **Create Shipment**: Calls `processPaidOrder` logic to create Aramex shipment
6. **Update Order**: Updates order with Aramex tracking number and shipment ID

## Error Handling

- If order is not found, returns 404
- If order is already processed, returns 200 (idempotent)
- If Aramex shipment creation fails, logs error but doesn't fail the webhook (order is already paid)
- All errors are logged to Supabase Edge Function logs

## Monitoring

View logs in Supabase Dashboard:
1. Go to Edge Functions → tap-webhook
2. Click on "Logs" tab
3. Monitor for errors or successful processing

## Troubleshooting

### Order Not Found
- Ensure `tap_charge_id` is set when creating orders
- Check that the charge ID in webhook matches the stored `tap_charge_id`

### Aramex Shipment Not Created
- Verify Aramex secrets are set correctly
- Check Edge Function logs for Aramex API errors
- Ensure order has valid addresses

### Webhook Not Receiving Events
- Verify webhook URL is correct in Tap Payments dashboard
- Check Tap Payments webhook logs
- Ensure webhook is enabled and events are selected

## Security Notes

- The function uses Supabase service role key (automatically provided)
- Webhook signature verification can be added if Tap Payments provides it
- Consider adding IP whitelist for Tap Payments IPs
- Rate limiting is handled by Supabase Edge Functions

