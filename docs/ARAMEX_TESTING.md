# 🧪 Aramex Integration Testing Guide

## Prerequisites

1. **Environment Variables Setup**
   - Copy `.env.example` to `.env.local`
   - Configure Aramex test credentials (see below)

2. **Database Schema**
   - Ensure `database/integrations_schema.sql` has been run
   - Verify `orders` table has Aramex fields:
     - `aramex_shipment_id`
     - `aramex_tracking_number`
     - `aramex_label_url`

## Test Credentials

**⚠️ Security Note:** Test credentials should never be committed to source code.

For testing, use the sandbox credentials provided in `shipping-services-api-manual.pdf` (page 30). 

**To obtain test credentials:**
1. Refer to the Aramex API manual (`shipping-services-api-manual.pdf`) page 30
2. Or contact Aramex support for test/sandbox account credentials
3. Add credentials to your local `.env.local` file (which is gitignored)

**Required environment variables for testing:**
- `VITE_ARAMEX_ENABLED=true`
- `VITE_ARAMEX_API_URL` - Sandbox URL (see manual)
- `VITE_ARAMEX_ACCOUNT_COUNTRY_CODE` - See manual
- `VITE_ARAMEX_ACCOUNT_ENTITY` - See manual
- `VITE_ARAMEX_ACCOUNT_NUMBER` - See manual
- `VITE_ARAMEX_ACCOUNT_PIN` - See manual
- `VITE_ARAMEX_USERNAME` - See manual
- `VITE_ARAMEX_PASSWORD` - See manual

## Test Scenarios

### 1. ✅ Basic Order Creation with Aramex

**Steps:**
1. Login as Employer
2. Navigate to "Create Order"
3. Fill in all required fields:
   - Shipment Date
   - Shipment Type: "package"
   - Weight: 2.5 kg
   - Delivery Method: "standard"
   - Sender details (use Saudi Arabia address)
   - Receiver details (use Saudi Arabia address)
4. Click "Create Order"

**Expected Result:**
- Order created successfully
- Success message shows Aramex tracking number
- Order in database has `aramex_tracking_number` populated
- Order has `aramex_shipment_id` populated

**Verify:**
- Check Supabase `orders` table
- Check browser console for logs
- Verify tracking number format

---

### 2. ✅ Domestic vs International Shipment

**Test A: Domestic (DOM)**
- Sender: Riyadh, Saudi Arabia
- Receiver: Jeddah, Saudi Arabia
- **Expected:** Product Group = "DOM", Product Type = "CDS"

**Test B: International (EXP)**
- Sender: Riyadh, Saudi Arabia
- Receiver: Dubai, UAE
- **Expected:** Product Group = "EXP", Product Type = "EPX"

**Verify:**
- Check browser console logs
- Check Aramex API request payload
- Verify correct product group/type in database

---

### 3. ✅ Express Delivery Method

**Steps:**
1. Create order with:
   - Delivery Method: "express"
   - International shipment (KSA → UAE)
2. Submit order

**Expected Result:**
- For international express: Product Type = "PPX" (Priority Parcel Express)
- For domestic express: Product Type = "CDS" (standard domestic)

**Verify:**
- Check API request payload
- Verify product type in logs

---

### 4. ✅ Fragile Shipment Handling

**Steps:**
1. Create order with:
   - Shipment Type: "fragile"
   - Weight: 1.5 kg
2. Submit order

**Expected Result:**
- Order created successfully
- `OperationsInstructions` field contains "FRAGILE/HANDLE WITH CARE"
- Aramex shipment includes handling instructions

**Verify:**
- Check API request payload
- Verify `OperationsInstructions` in request

---

### 5. ✅ Error Handling (Aramex API Failure)

**Test A: Invalid Credentials**
1. Set incorrect Aramex credentials
2. Create order
3. **Expected:** Order still created, warning message shown

**Test B: Network Error**
1. Disconnect internet
2. Create order
3. **Expected:** Order created, error logged, warning shown

**Test C: Invalid Address**
1. Use invalid/malformed address
2. Create order
3. **Expected:** Order created, address parsed with defaults

**Verify:**
- Order exists in database
- Warning message displayed to user
- Error logged in console
- Order can be manually synced later

---

### 6. ✅ Address Parsing

**Test Cases:**
- "Riyadh, Saudi Arabia" → City: Riyadh, Country: SA
- "King Fahd Road, Al Olaya, Riyadh 12211, Saudi Arabia" → Full address parsed
- "Dubai, UAE" → City: Dubai, Country: AE
- Empty address → Defaults to Riyadh, SA

**Verify:**
- Check parsed address in console logs
- Verify correct country codes
- Check city extraction

---

### 7. ✅ Tracking Number Display

**Steps:**
1. Create order successfully
2. Navigate to Orders page
3. View order details

**Expected Result:**
- Order shows Aramex tracking number
- Tracking number is clickable/linkable
- Label URL available if provided

**Verify:**
- Check Orders page display
- Verify tracking number format
- Test tracking link (if implemented)

---

## Manual Testing Checklist

- [ ] Order creation with Aramex enabled
- [ ] Order creation with Aramex disabled
- [ ] Domestic shipment (DOM/CDS)
- [ ] International shipment (EXP/EPX)
- [ ] Express delivery method
- [ ] Same-day delivery method (if supported)
- [ ] Fragile shipment handling
- [ ] Heavy shipment handling
- [ ] Address parsing (various formats)
- [ ] Error handling (invalid credentials)
- [ ] Error handling (network failure)
- [ ] Tracking number storage
- [ ] Label URL storage
- [ ] Order update after Aramex sync

---

## Troubleshooting

### Issue: "Aramex service not initialized"
**Solution:** Check environment variables are set correctly and `VITE_ARAMEX_ENABLED=true`

### Issue: "Failed to create Aramex shipment"
**Solution:** 
- Verify credentials are correct
- Check API URL (sandbox vs production)
- Check browser console for detailed error
- Verify network connectivity

### Issue: "Invalid address format"
**Solution:**
- Check address string format
- Verify address parser logic
- Check country code mappings

### Issue: "Product type not found"
**Solution:**
- Verify product mapping configuration
- Check shipment type and delivery method values
- Review ProductGroup.docx for correct codes

---

## API Testing with Postman

You can also test the Aramex API directly using the provided Postman collection:
1. Import `Aramex API Copy.postman_collection.json`
2. Update environment variables in Postman
3. Test individual endpoints:
   - CalculateRate
   - CreateShipments
   - TrackShipments
   - FetchCities

---

## Production Checklist

Before going to production:

- [ ] Replace test credentials with production credentials
- [ ] Update `VITE_ARAMEX_API_URL` to production URL
- [ ] Test with real addresses
- [ ] Verify rate calculation
- [ ] Test label generation
- [ ] Set up error monitoring
- [ ] Configure retry mechanism for failed syncs
- [ ] Set up webhook for shipment status updates (optional)

---

## Support

For issues:
1. Check browser console for errors
2. Check Supabase logs
3. Review Aramex API documentation
4. Contact Aramex support if API issues persist

