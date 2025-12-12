# 🚚 Mrsool Integration Guide

## Overview

Mrsool logistics integration for intra-city deliveries with dynamic pricing based on distance.

## Pricing Structure

Based on the provided pricing table:

- **Base Cost**: 25-30 SAR (average 27.5 SAR)
- **Distance Charge**: 2 SAR per 10 km
- **Wazn Final Price**: 31-36 SAR + 2 SAR/10 km
- **Margin**: 6 SAR average

### Pricing Formula

```
Base Price = 27.5 SAR (average of 25-30 range)
Distance Charge = ceil(distance / 10) * 2 SAR
Mrsool Total = Base Price + Distance Charge
Wazn Final Price = Mrsool Total + 6 SAR margin
```

## Environment Variables

Add these to your `.env.local` file:

```env
# Mrsool Integration
VITE_MRSOOL_ENABLED=true
VITE_MRSOOL_API_KEY=YOUR_MRSOOL_API_KEY
VITE_MRSOOL_API_URL=https://logistics.staging.mrsool.co/api
```

**⚠️ SECURITY**: Never commit actual API keys to source code. Add your actual API key to `.env.local` (which is gitignored). Contact Mrsool support to obtain your API key.

## API Documentation

- **API Docs**: https://logistics.staging.mrsool.co/api/docs/index.html
- **API Base URL**: https://logistics.staging.mrsool.co/api (staging)

## Implementation Status

### ✅ Completed

1. **Mrsool Service** (`src/services/mrsool.ts`)
   - Service structure created
   - Rate calculation with distance-based pricing
   - Wazn margin application (6 SAR)
   - Order creation API (placeholder - needs API endpoint verification)
   - Order tracking API (placeholder - needs API endpoint verification)
   - Order cancellation API (placeholder - needs API endpoint verification)

2. **Integration Configuration** (`src/config/integrations.ts`)
   - Added Mrsool configuration interface
   - Added environment variable parsing
   - Added initialization logic

### ⏳ Pending

1. **API Endpoint Verification**
   - Review API documentation to verify actual endpoints
   - Update `createOrder`, `trackOrder`, and `cancelOrder` methods with correct endpoints
   - Verify request/response formats

2. **Order Creation Flow Integration**
   - Add Mrsool as shipping option in `CreateOrderMultiStep.tsx`
   - Calculate Mrsool rates alongside Aramex rates
   - Handle Mrsool order creation in `orders.ts` service
   - Store Mrsool tracking numbers in database

3. **Database Schema Updates**
   - Add `mrsool_order_id` column to `orders` table
   - Add `mrsool_tracking_number` column to `orders` table
   - Add `mrsool_label_url` column (if applicable)

4. **Address Coordinates**
   - Ensure `AddressPicker` component stores latitude/longitude
   - Pass coordinates to Mrsool rate calculation
   - Store coordinates in order data

## Next Steps

1. **Review API Documentation**
   - Visit https://logistics.staging.mrsool.co/api/docs/index.html
   - Identify correct endpoints for:
     - Order creation
     - Rate calculation (if different from our implementation)
     - Order tracking
     - Order cancellation

2. **Update Service Methods**
   - Update API endpoints in `src/services/mrsool.ts`
   - Verify request/response formats
   - Test with staging API

3. **Integrate into Order Flow**
   - Update `CreateOrderMultiStep.tsx` to show Mrsool option
   - Calculate rates for both Aramex and Mrsool
   - Allow user to select between providers
   - Update `orders.ts` to handle Mrsool order creation

4. **Database Migration**
   - Run SQL migration to add Mrsool fields to `orders` table

5. **Testing**
   - Test rate calculation with various distances
   - Test order creation
   - Test order tracking
   - Verify pricing matches expected margins

## Notes

- Mrsool is primarily for **intra-city deliveries** (within the same city)
- Pricing is **dynamic** based on day and distance
- Current implementation uses average base price (27.5 SAR) - may need adjustment based on actual API response
- Distance calculation uses Haversine formula (great-circle distance)

## Files Created/Modified

- ✅ `src/services/mrsool.ts` - Mrsool service implementation
- ✅ `src/config/integrations.ts` - Added Mrsool configuration
- 📝 `MRSOOL_INTEGRATION.md` - This documentation file

## Questions for API Review

1. What is the exact endpoint for creating orders?
2. Does the API provide rate calculation endpoint, or should we calculate manually?
3. What is the response format for order creation?
4. How is tracking number provided?
5. Are there any additional fees or surcharges?
6. What is the format for pickup/delivery addresses (coordinates vs. address string)?

