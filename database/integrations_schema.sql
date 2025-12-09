-- ============================================
-- Integration Schema Updates
-- Add fields for Aramex and Tap Payments integration
-- Run this AFTER schema.sql and schema_enhanced.sql
-- ============================================

-- Add Aramex integration fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS aramex_shipment_id TEXT,
ADD COLUMN IF NOT EXISTS aramex_tracking_number TEXT,
ADD COLUMN IF NOT EXISTS aramex_label_url TEXT;

-- Add payment integration fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS tap_charge_id TEXT,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'SAR',
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_aramex_shipment_id ON public.orders(aramex_shipment_id);
CREATE INDEX IF NOT EXISTS idx_orders_tap_charge_id ON public.orders(tap_charge_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- Add payment status enum constraint (optional, for data integrity)
-- ALTER TABLE public.orders ADD CONSTRAINT check_payment_status 
-- CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled'));

-- Comments for documentation
COMMENT ON COLUMN public.orders.aramex_shipment_id IS 'Aramex shipment ID after creating shipment';
COMMENT ON COLUMN public.orders.aramex_tracking_number IS 'Aramex tracking number for shipment tracking';
COMMENT ON COLUMN public.orders.aramex_label_url IS 'URL to download shipping label from Aramex';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: pending, paid, failed, refunded, cancelled';
COMMENT ON COLUMN public.orders.tap_charge_id IS 'Tap Payments charge ID';
COMMENT ON COLUMN public.orders.payment_amount IS 'Amount paid for the order';
COMMENT ON COLUMN public.orders.payment_currency IS 'Currency code (SAR, USD, etc.)';
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method used (card, apple_pay, etc.)';
COMMENT ON COLUMN public.orders.paid_at IS 'Timestamp when payment was completed';

