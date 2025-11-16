# Client Role - Complete Testing Guide

دليل اختبار شامل لدور العميل (Client)

---

## 🎯 Test Environment Setup

### Prerequisites:
- [ ] Supabase project configured
- [ ] Database tables created
- [ ] `.env` file with Supabase credentials
- [ ] Development server running (`npm run dev`)

---

## 📋 Test Checklist

### 1. Registration & Login ✅

#### Test Registration:
1. Navigate to `/select-user`
2. Select **"عميل"** (Client)
3. Fill registration form:
   - Full name: `أحمد محمد`
   - Phone: `0501234567`
   - Email: `ahmed@test.com`
   - Password: `Test123!@#`
   - Confirm Password: `Test123!@#`
   - ID Number: `1234567890`
   - Date of Birth: `01/01/1990`
   - Nationality: `سعودي`
4. Click **"إنشاء الحساب"**
5. **Expected:** Success message + redirect to `/client/profile`

#### Verify in Supabase:
- [ ] Check `auth.users` table - user created
- [ ] Check `profiles` table - profile created with `role = 'client'`

#### Test Login:
1. Navigate to `/login`
2. Enter:
   - Phone: `0501234567`
   - Password: `Test123!@#`
3. Click **"تسجيل الدخول"**
4. **Expected:** Redirect to `/client/profile`

---

### 2. Profile Management ✅

#### Test View Profile:
1. After login, should be on `/client/profile`
2. **Expected:** See profile data loaded from database

#### Test Edit Profile:
1. Click **"تعديل"** button
2. Change some fields:
   - Full name: `أحمد محمد علي`
   - Phone: `0507654321`
   - Email: `ahmed.ali@test.com`
3. Click **"حفظ"**
4. **Expected:** Success message + form disabled

#### Test Cancel Edit:
1. Click **"تعديل"** again
2. Make changes
3. Click **"إلغاء"**
4. **Expected:** Changes reverted, form disabled

#### Verify Persistence:
1. Reload page (F5)
2. **Expected:** Changes persist, data loaded from database

---

### 3. Create Shipment Flow ✅

#### Step 1: Create Shipment
1. Navigate to `/client/shipments`
2. Click **"إنشاء شحنة جديدة"** button
3. Fill shipment form:
   - Shipment Date: `Today's date`
   - Shipment Type: `طرد`
   - Weight: `5`
   - Delivery Method: `عادي`
   - Sender Name: `أحمد محمد`
   - Sender Phone: `0501234567`
   - Sender Address: `الرياض، حي النرجس، شارع الملك فهد`
   - Receiver Name: `محمد أحمد`
   - Receiver Phone: `0507654321`
   - Receiver Address: `جدة، حي الزهراء، شارع التحلية`
4. Check **"أوافق على الشروط والأحكام"**
5. Click **"إنشاء"**
6. **Expected:** Modal closes, service provider selection appears

#### Step 2: Select Service Provider
1. Should see list of providers (Aramex, Redbox)
2. Click on any provider card
3. **Expected:** Navigate to `/client/wallet`

#### Verify Session Storage:
- [ ] Open browser DevTools → Application → Session Storage
- [ ] Check `pendingShipment` exists
- [ ] Check `selectedProvider` exists

---

### 4. Payment & Order Creation ✅

#### Test Wallet Page:
1. Should be on `/client/wallet`
2. **Expected:** See payment method selection

#### Test Payment Form:
1. Select payment method: **"مدى"** (Mada)
2. Fill card details:
   - Card Number: `1234567890123456`
   - Expiry Date: `12/25`
   - CVV: `123`
3. Click **"دفع"** button
4. **Expected:** 
   - Loading state
   - Success message: "تم الدفع وإنشاء الطلب بنجاح!"
   - Redirect to `/client/order-confirmation`

#### Verify Order Creation:
- [ ] Check Supabase `orders` table
- [ ] New order created with:
  - `client_id` = your user ID
  - `tracking_no` generated (starts with WAZN)
  - `status` = 'new'
  - All shipment data saved

#### Verify Session Storage Cleared:
- [ ] Check Session Storage
- [ ] `pendingShipment` removed
- [ ] `selectedProvider` removed

---

### 5. Order Confirmation ✅

#### Test Confirmation Page:
1. Should be on `/client/order-confirmation`
2. **Expected:** 
   - See success icon
   - See tracking number displayed
   - See "صورة بوليصة الشحن" placeholder

#### Test Download Button:
1. Click **"تنزيل"** button
2. **Expected:** Download HTML file with bill of lading

#### Test Share Button:
1. Click **"مشاركة"** button
2. **Expected:** 
   - If Web Share API supported: Share dialog
   - Otherwise: Copy to clipboard + success message

#### Test Navigation:
1. Click **"العودة إلى الشحنات"** link
2. **Expected:** Navigate to `/client/shipments`

---

### 6. Tracking Page ✅

#### Test Tracking Search:
1. Navigate to `/client/tracking`
2. Enter tracking number from order confirmation
3. Click **"بحث"** button
4. **Expected:** 
   - Loading spinner
   - Order details displayed

#### Test Order Details Display:
- [ ] Order number matches
- [ ] Order date displayed correctly
- [ ] Status displayed with correct color
- [ ] Sender information displayed
- [ ] Receiver information displayed
- [ ] Delivery progress steps shown

#### Test Delivery Progress:
- [ ] Steps show correct status based on order status
- [ ] If delivered: Shows delivery date

#### Test Download Bill of Lading (if delivered):
1. If order status is "delivered"
2. Click **"تنزيل"** button
3. **Expected:** Download HTML file

#### Test Share Tracking (if delivered):
1. Click **"مشاركة"** button
2. **Expected:** Share or copy tracking link

#### Test URL Parameter:
1. Navigate to `/client/tracking?tracking=WAZN12345678`
2. **Expected:** Automatically search and display order

#### Test Error Handling:
1. Enter invalid tracking number
2. Click **"بحث"**
3. **Expected:** Error message displayed

---

### 7. Navigation & Sidebar ✅

#### Test Sidebar Navigation:
- [ ] Click "الملف الشخصي" → Navigate to `/client/profile`
- [ ] Click "الشحنات" → Navigate to `/client/shipments`
- [ ] Click "المحفظة" → Navigate to `/client/wallet`
- [ ] Click "الشروط والأحكام" → Navigate to `/client/terms`
- [ ] Click "تسجيل الخروج" → Logout + redirect to landing page

#### Test Breadcrumbs:
- [ ] Verify breadcrumbs show correct Arabic text
- [ ] Verify breadcrumbs update on navigation

---

### 8. Error Scenarios ⚠️

#### Test Invalid Login:
1. Try login with wrong password
2. **Expected:** Error message displayed

#### Test Empty Form Submission:
1. Try to create shipment without filling form
2. **Expected:** Validation errors displayed

#### Test Payment Without Shipment:
1. Navigate directly to `/client/wallet`
2. Try to submit payment
3. **Expected:** Error message + redirect to shipments

#### Test Tracking Invalid Number:
1. Enter non-existent tracking number
2. **Expected:** "لم يتم العثور على الطلب" message

---

## ✅ Success Criteria

Client role is fully tested when:

- [x] Registration works
- [x] Login works
- [x] Profile view/edit works
- [x] Shipment creation works
- [x] Provider selection works
- [x] Payment flow works (creates order)
- [x] Order confirmation displays
- [x] Tracking page works
- [x] All buttons work
- [x] Navigation works
- [x] Data persists in database
- [x] Error handling works

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read property of undefined"
**Solution:** Check if user is logged in before accessing user data

### Issue: Order not created
**Solution:** 
- Check browser console for errors
- Verify Supabase connection
- Check `orders` table permissions

### Issue: Tracking not found
**Solution:**
- Verify tracking number format
- Check if order exists in database
- Verify `tracking_no` column in orders table

### Issue: Session storage not working
**Solution:**
- Check browser DevTools → Application → Session Storage
- Verify data is saved before navigation

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Registration: [ ] Pass [ ] Fail
Login: [ ] Pass [ ] Fail
Profile View: [ ] Pass [ ] Fail
Profile Edit: [ ] Pass [ ] Fail
Create Shipment: [ ] Pass [ ] Fail
Select Provider: [ ] Pass [ ] Fail
Payment: [ ] Pass [ ] Fail
Order Creation: [ ] Pass [ ] Fail
Order Confirmation: [ ] Pass [ ] Fail
Tracking Search: [ ] Pass [ ] Fail
Tracking Display: [ ] Pass [ ] Fail
Navigation: [ ] Pass [ ] Fail
Error Handling: [ ] Pass [ ] Fail

Issues Found:
1. _______________________
2. _______________________
3. _______________________

Notes:
_______________________
```

---

## 🚀 Ready to Test!

Follow the checklist above and test each feature systematically.

**Report any issues you find!** 🐛

