-- ============================================
-- Wazn Platform - Process Paid Order Trigger
-- This trigger ensures Aramex/Mrsool shipments are created reliably
-- even if the webhook or client-side processing fails
-- 
-- IMPORTANT: This requires pg_net extension and proper configuration
-- See docs/RELIABLE_SHIPMENT_CREATION.md for setup instructions
-- 
-- ALTERNATIVE: If pg_net is not available, use Supabase Database Webhooks:
-- 1. Go to Supabase Dashboard > Database > Webhooks
-- 2. Create new webhook on 'orders' table
-- 3. Trigger on UPDATE when payment_status = 'paid'
-- 4. Point to: https://<project-ref>.supabase.co/functions/v1/process-paid-order
-- 5. Include payload: {"order_id": "{{record.id}}", "triggered_by": "database_webhook"}
-- ============================================

-- Enable pg_net extension if not already enabled
-- This allows PostgreSQL to make HTTP requests to Edge Functions
-- Note: pg_net may not be available in all Supabase projects
-- If not available, use Supabase Database Webhooks instead (see alternative above)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- Step 1: Create function to process paid orders via Edge Function
-- ============================================

CREATE OR REPLACE FUNCTION public.process_paid_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Only process if payment_status changed to 'paid'
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    -- Check if shipment already exists (don't process if already created)
    IF (NEW.aramex_shipment_id IS NULL AND NEW.aramex_tracking_number IS NULL AND
        NEW.mrsool_order_id IS NULL AND NEW.mrsool_tracking_number IS NULL) THEN
      
      -- Get configuration from database settings
      -- These should be set via: ALTER DATABASE postgres SET app.xxx = 'value';
      edge_function_url := current_setting('app.process_paid_order_url', true);
      supabase_url := current_setting('app.supabase_url', true);
      service_role_key := current_setting('app.supabase_service_role_key', true);
      
      -- Build URL if not explicitly set
      IF edge_function_url IS NULL OR edge_function_url = '' THEN
        IF supabase_url IS NOT NULL AND supabase_url != '' THEN
          edge_function_url := supabase_url || '/functions/v1/process-paid-order';
        ELSE
          RAISE WARNING 'process_paid_order_url and supabase_url not configured. Skipping trigger.';
          RETURN NEW;
        END IF;
      END IF;
      
      -- Call the Edge Function via HTTP
      -- This is asynchronous - the trigger doesn't wait for the response
      PERFORM net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || COALESCE(service_role_key, '')
        ),
        body := jsonb_build_object(
          'order_id', NEW.id::text,
          'payment_status', NEW.payment_status,
          'triggered_by', 'database_trigger'
        )
      );
      
      RAISE NOTICE 'Triggered shipment creation for order % via database trigger', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Step 2: Create trigger on orders table
-- ============================================

DROP TRIGGER IF EXISTS trigger_process_paid_order ON public.orders;

CREATE TRIGGER trigger_process_paid_order
  AFTER UPDATE OF payment_status ON public.orders
  FOR EACH ROW
  WHEN (NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid'))
  EXECUTE FUNCTION public.process_paid_order_webhook();

-- ============================================
-- DONE! Trigger created successfully
-- ============================================

-- CONFIGURATION REQUIRED:
-- Run these commands in Supabase SQL Editor to configure the trigger:
--
-- ALTER DATABASE postgres SET app.process_paid_order_url = 'https://<project-ref>.supabase.co/functions/v1/process-paid-order';
-- ALTER DATABASE postgres SET app.supabase_url = 'https://<project-ref>.supabase.co';
-- ALTER DATABASE postgres SET app.supabase_service_role_key = '<service-role-key>';
--
-- Replace <project-ref> with your Supabase project reference
-- Replace <service-role-key> with your Supabase service role key (from Settings > API)
--
-- ALTERNATIVE: Use Supabase Database Webhooks (recommended if pg_net not available):
-- 1. Go to Supabase Dashboard > Database > Webhooks
-- 2. Create new webhook on 'orders' table
-- 3. Trigger on UPDATE when payment_status = 'paid'
-- 4. Point to: https://<project-ref>.supabase.co/functions/v1/process-paid-order
-- 5. Include payload: {"order_id": "{{record.id}}", "triggered_by": "database_webhook"}

