# Tap Payments Webhook Setup Summary

## Overview

A Supabase Edge Function has been created to handle Tap Payments webhooks. This ensures that Aramex shipments are created automatically even if the user closes their browser after payment.

## What Was Created

### 1. Edge Function
- **Location**: `supabase/functions/tap-webhook/index.ts`
- **Purpose**: Handles Tap Payments webhook events
- **Language**: TypeScript (Deno runtime)

### 2. Documentation
- **Location**: `supabase/functions/tap-webhook/README.md`
- **Contents**: Complete deployment and configuration guide

## How It Works

```
User Pays → Tap Payments → Webhook → Edge Function → Process Order
                                              ↓
                                    Update payment_status = 'paid'
                                              ↓
                                    Create Aramex Shipment
                                              ↓
                                    Update order with tracking
```

## Key Features

1. **Automatic Processing**: No user interaction needed after payment
2. **Idempotent**: Safe to retry if webhook is called multiple times
3. **Error Handling**: Order is marked as paid even if shipment creation fails
4. **Logging**: Comprehensive logging for debugging

## Deployment Checklist

- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Login: `supabase login`
- [ ] Link project: `supabase link --project-ref your-project-ref`
- [ ] Set Aramex secrets (see README.md)
- [ ] Deploy function: `supabase functions deploy tap-webhook`
- [ ] Get webhook URL from deployment output
- [ ] Configure in Tap Payments dashboard
- [ ] Test with a real payment

## Webhook URL Format

After deployment, your webhook URL will be:
```
https://your-project-ref.supabase.co/functions/v1/tap-webhook
```

## Testing

1. Make a test payment through the app
2. Check Supabase Edge Function logs
3. Verify order payment_status is updated
4. Verify Aramex shipment is created (if enabled)

## Troubleshooting

See `supabase/functions/tap-webhook/README.md` for detailed troubleshooting guide.

## Next Steps

1. Deploy the Edge Function
2. Configure webhook URL in Tap Payments dashboard
3. Test with a real payment
4. Monitor logs for any issues
5. Set up alerts for failed shipments

