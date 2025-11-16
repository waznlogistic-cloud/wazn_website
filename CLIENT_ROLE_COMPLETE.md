# CLIENT Role - Complete Implementation Checklist

## 🎯 Goal: Complete Client Role Frontend + Backend + Testing

---

## Phase 1: Frontend Check ✅

### Pages Status:
- [x] `/client/profile` - ✅ Connected to Supabase
- [x] `/client/shipments` - ✅ Connected (Create → Select Provider → Wallet)
- [x] `/client/wallet` - ✅ Connected (Payment → Order Creation)
- [x] `/client/order-confirmation` - ✅ Working (Download + Share buttons)
- [ ] `/client/tracking` - ⚠️ UI ready, needs Supabase connection
- [x] `/client/terms` - ✅ Static page

### Buttons Status:
- [x] Profile Edit/Save/Cancel - ✅ Working
- [x] Create Shipment - ✅ Working
- [x] Select Provider - ✅ Working
- [x] Payment Submit - ✅ Working
- [x] Download Bill of Lading - ✅ Working
- [x] Share Tracking - ✅ Working
- [ ] Track Order - ⚠️ Needs implementation

---

## Phase 2: Backend Integration 🔌

### Tasks:

#### 1. Tracking Page Connection
- [ ] Create `getOrderByTrackingNo` service function
- [ ] Connect tracking page to Supabase
- [ ] Display real order data
- [ ] Show order status updates
- [ ] Add loading state
- [ ] Add error handling

#### 2. Order History
- [ ] Create `getClientOrders` service function
- [ ] Add orders list to shipments page (optional)
- [ ] Display order history with status

#### 3. Profile Picture Upload (Optional)
- [ ] Set up Supabase Storage bucket `profiles`
- [ ] Add upload functionality to profile page
- [ ] Display uploaded picture

---

## Phase 3: External APIs Integration 🌐

### Tap Payments Integration

#### Setup:
- [ ] Get Tap Payments API keys
- [ ] Add to `.env`:
  ```env
  VITE_TAP_PUBLIC_KEY=pk_test_...
  VITE_TAP_SECRET_KEY=sk_test_...
  ```

#### Implementation:
- [ ] Install Tap Payments SDK: `npm install @tap-payments/tapjs`
- [ ] Create `src/services/payments.ts`
- [ ] Implement `processPayment` function
- [ ] Replace mock payment in Wallet page
- [ ] Handle payment success/failure
- [ ] Update order status after payment

#### Files to Create/Update:
- [ ] `src/services/payments.ts` - Payment service
- [ ] `src/modules/client/pages/Wallet.tsx` - Update payment flow

---

## Phase 4: Testing 🧪

### Test Checklist:

#### Registration & Login:
- [ ] Register as client
- [ ] Login with phone/password
- [ ] Verify redirect to profile page

#### Profile Management:
- [ ] View profile data
- [ ] Edit profile
- [ ] Save changes
- [ ] Verify data persists after reload

#### Order Creation Flow:
- [ ] Create new shipment
- [ ] Fill all required fields
- [ ] Select service provider
- [ ] Navigate to wallet
- [ ] Select payment method
- [ ] Enter card details
- [ ] Submit payment
- [ ] Verify order creation
- [ ] Verify redirect to confirmation page

#### Order Confirmation:
- [ ] View tracking number
- [ ] Download bill of lading
- [ ] Share tracking link
- [ ] Navigate back to shipments

#### Tracking:
- [ ] Enter tracking number
- [ ] View order details
- [ ] View order status
- [ ] View delivery progress

---

## 📝 Implementation Steps

### Step 1: Complete Tracking Page (30 min)

1. Update `src/services/orders.ts`:
```typescript
export async function getOrderByTrackingNo(trackingNo: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("tracking_no", trackingNo)
    .single();
  
  if (error) throw error;
  return data;
}
```

2. Update `src/modules/client/pages/Tracking.tsx`:
- Add state for tracking number input
- Add `getOrderByTrackingNo` call
- Display real order data
- Add loading/error states

### Step 2: Tap Payments Integration (2-3 hours)

1. Install SDK:
```bash
npm install @tap-payments/tapjs
```

2. Create payment service:
```typescript
// src/services/payments.ts
import Tap from '@tap-payments/tapjs';

const tap = new Tap({
  secretKey: import.meta.env.VITE_TAP_SECRET_KEY,
  publicKey: import.meta.env.VITE_TAP_PUBLIC_KEY,
});

export async function processPayment(amount: number, orderId: string) {
  // Implementation
}
```

3. Update Wallet page to use real payment

### Step 3: Testing (1 hour)

- Test complete flow
- Fix any bugs
- Document issues

---

## ✅ Definition of Done

Client role is complete when:
- [x] All frontend pages work
- [ ] All pages connected to Supabase
- [ ] Tap Payments integrated
- [ ] Complete user flow tested
- [ ] No console errors
- [ ] All buttons work
- [ ] Loading states added
- [ ] Error handling added

---

## 🚀 Next Steps After Client

Once Client role is complete:
1. Document any issues found
2. Move to Driver role
3. Follow same process

---

**Ready to start?** Let's begin with Step 1: Complete Tracking Page! 🎯

