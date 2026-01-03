# Reliable Shipment Creation Setup

This document describes how to ensure 100% reliable Aramex/Mrsool shipment creation even if the user closes their browser or the webhook fails.

## Architecture

We use a **multi-layer approach** to ensure shipment creation:

1. **Client-side** (`PaymentSuccess.tsx`): Attempts shipment creation immediately after payment
2. **Tap Payments Webhook** (`tap-webhook`): Processes payment confirmation and creates shipments
3. **Database Trigger** (NEW): Automatically triggers shipment creation when `payment_status` changes to `"paid"`

## Setup Instructions

### Step 1: Deploy the Process Paid Order Edge Function

The `process-paid-order` Edge Function is a dedicated function that handles shipment creation. It can be called by:
- The database trigger (automatic)
- Manual retry mechanisms
- Other Edge Functions

```bash
# Deploy the function
supabase functions deploy process-paid-order
```

### Step 2: Configure Database Secrets

In Supabase Dashboard > Settings > Database > Secrets, set:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PROCESS_PAID_ORDER_URL=https://your-project-ref.supabase.co/functions/v1/process-paid-order
```

### Step 3: Run the Database Trigger SQL

Execute the SQL file in Supabase SQL Editor:

```sql
-- Run: database/process_paid_order_trigger.sql
```

This creates:
- A PostgreSQL function that calls the Edge Function via HTTP
- A trigger that fires when `payment_status` changes to `"paid"`

### Step 4: Verify Setup

1. Create a test order with `payment_status: "pending"`
2. Update the order to `payment_status: "paid"`
3. Check logs to see the trigger firing
4. Verify shipment is created

## How It Works

### Flow Diagram

```
Payment Confirmed
    │
    ├─> Client-side (PaymentSuccess.tsx)
    │   └─> processPaidOrder() → Creates shipment
    │
    ├─> Tap Payments Webhook (tap-webhook)
    │   └─> Updates payment_status → processPaidOrder() → Creates shipment
    │
    └─> Database Trigger (NEW)
        └─> payment_status = 'paid' → HTTP call → process-paid-order → Creates shipment
```

### Race Condition Prevention

All three paths use the same atomic locking mechanism:
- `atomicallyClaimShipmentCreation()` sets a temporary lock
- Only one process can claim the lock
- Other processes skip if lock is already claimed
- Lock is released on error

### Idempotency

- All functions check if shipment already exists before creating
- Atomic database updates prevent duplicate shipments
- Multiple calls are safe and won't create duplicates

## Troubleshooting

### Trigger Not Firing

1. Check if `pg_net` extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_net';
   ```

2. Verify secrets are set:
   ```sql
   SELECT current_setting('app.process_paid_order_url', true);
   ```

3. Check trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_process_paid_order';
   ```

### Edge Function Not Receiving Calls

1. Check Edge Function logs in Supabase Dashboard
2. Verify function is deployed: `supabase functions list`
3. Check function URL matches secret configuration

### Shipment Not Created

1. Check order has `provider_id` set
2. Verify integration is enabled (ARAMEX_ENABLED, MRSOOL_ENABLED)
3. Check integration credentials are set
4. Review Edge Function logs for errors

## Manual Retry

If shipment creation fails, you can manually trigger it:

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/process-paid-order \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "order-uuid-here"}'
```

## Monitoring

Monitor shipment creation success rates:
- Check Edge Function logs
- Query orders with `payment_status = 'paid'` but no shipment
- Set up alerts for failed shipments

