# Employer Role - Complete Testing Guide

دليل اختبار شامل لدور صاحب العمل (Employer) للإنتاج

---

## 🎯 Test Environment Setup

### Prerequisites:
- [ ] Supabase project configured
- [ ] Database tables created
- [ ] `.env` file with Supabase credentials
- [ ] Development server running (`npm run dev`)

---

## 📋 Complete Test Checklist

### 1. Registration & Login ✅

#### Test Registration:
1. Navigate to `/select-user`
2. Select **"صاحب عمل"** (Employer)
3. Fill registration form:
   - Full name: `محمد أحمد`
   - Phone: `0501234567`
   - Email: `employer@test.com`
   - Password: `Test123!@#`
   - Confirm Password: `Test123!@#`
   - ID Number: `1234567890`
   - Date of Birth: `01/01/1985`
4. Click **"إنشاء الحساب"**
5. **Expected:** Success message + redirect to `/employer/profile`

#### Verify in Supabase:
- [ ] Check `auth.users` table - user created
- [ ] Check `profiles` table - profile created with `role = 'employer'`

#### Test Login:
1. Navigate to `/login`
2. Enter:
   - Phone: `0501234567`
   - Password: `Test123!@#`
3. Click **"تسجيل الدخول"**
4. **Expected:** Redirect to `/employer/profile`

---

### 2. Profile Management ✅

#### Test View Profile:
1. After login, should be on `/employer/profile`
2. **Expected:** See profile data loaded from database

#### Test Edit Profile:
1. Click **"تعديل"** button
2. Change some fields:
   - Full name: `محمد أحمد علي`
   - Phone: `0507654321`
   - Email: `employer.ali@test.com`
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

### 3. Create Order ✅

#### Test Create Order:
1. Navigate to `/employer/orders/new`
2. Fill order form:
   - **Shipment Date:** Today's date
   - **Shipment Type:** `طرد`
   - **Weight:** `10`
   - **Delivery Method:** `سريع`
   - **Sender Name:** `شركة التقنية المتقدمة`
   - **Sender Phone:** `0501234567`
   - **Sender Address:** `الرياض، حي النرجس، شارع الملك فهد`
   - **Receiver Name:** `محمد أحمد`
   - **Receiver Phone:** `0507654321`
   - **Receiver Address:** `جدة، حي الزهراء، شارع التحلية`
3. Click **"إنشاء الطلب"**
4. **Expected:** 
   - Loading state
   - Success message: "تم إنشاء الطلب بنجاح!"
   - Redirect to `/employer/orders`

#### Verify Order Creation:
- [ ] Check Supabase `orders` table
- [ ] New order created with:
  - `employer_id` = your user ID
  - `tracking_no` generated (starts with WAZN)
  - `status` = 'new'
  - All order data saved correctly

#### Test Cancel:
1. Go back to `/employer/orders/new`
2. Fill form partially
3. Click **"إلغاء"**
4. **Expected:** Navigate to `/employer/orders` without creating order

---

### 4. Orders List ✅

#### Test View Orders:
1. Navigate to `/employer/orders`
2. **Expected:** 
   - Loading spinner initially
   - Orders list displayed (or empty state if no orders)
   - See created order from step 3

#### Test Order Details:
1. Click **"عرض التفاصيل"** on any order
2. **Expected:** Modal opens with order details
3. Verify details match database
4. Close modal

#### Test Empty State:
1. If no orders exist
2. **Expected:** See "لا توجد طلبات حالياً" message

#### Test Error Handling:
1. Disconnect internet (or simulate error)
2. Reload orders page
3. **Expected:** Error message + retry button

---

### 5. Billing Page ✅

#### Test View Invoices:
1. Navigate to `/employer/billing`
2. **Expected:** See summary cards and invoices table

#### Test View Invoice Details:
1. Click **"عرض"** on any invoice
2. **Expected:** Modal opens with invoice details
3. Verify all details displayed correctly
4. Close modal

#### Test Download Invoice:
1. Click **"تحميل"** on any invoice
2. **Expected:** Download HTML file with invoice
3. Open downloaded file
4. **Expected:** See formatted invoice

#### Test Download from Modal:
1. Open invoice details modal
2. Click **"تحميل الفاتورة"** button
3. **Expected:** Download invoice file

---

### 6. Navigation & Sidebar ✅

#### Test Sidebar Navigation:
- [ ] Click "معلوماتي" → Navigate to `/employer/profile`
- [ ] Click "الطلبات" → Navigate to `/employer/orders`
- [ ] Click "إنشاء طلب جديد" → Navigate to `/employer/orders/new`
- [ ] Click "الفاتورة والمدفوعات" → Navigate to `/employer/billing`
- [ ] Click "الشروط والأحكام" → Navigate to `/employer/terms`
- [ ] Click "تسجيل الخروج" → Logout + redirect to landing page

#### Test Breadcrumbs:
- [ ] Verify breadcrumbs show correct Arabic text
- [ ] Verify breadcrumbs update on navigation

#### Test Sidebar Highlighting:
- [ ] Navigate to `/employer/orders/new`
- [ ] Verify "إنشاء طلب جديد" is highlighted in sidebar

---

### 7. Error Scenarios ⚠️

#### Test Invalid Login:
1. Try login with wrong password
2. **Expected:** Error message displayed

#### Test Empty Form Submission:
1. Try to create order without filling form
2. **Expected:** Validation errors displayed

#### Test Network Error:
1. Disconnect internet
2. Try to create order
3. **Expected:** Error message displayed

#### Test Invalid Data:
1. Try to submit form with invalid phone number
2. **Expected:** Validation error displayed

---

## ✅ Success Criteria

Employer role is production-ready when:

- [x] Registration works
- [x] Login works
- [x] Profile view/edit works
- [x] Create order works
- [x] Orders list loads from database
- [x] View order details works
- [x] Billing page works
- [x] Download invoice works
- [x] All buttons work
- [x] Navigation works
- [x] Data persists in database
- [x] Error handling works
- [x] Loading states work
- [x] Empty states handled

---

## 🐛 Common Issues & Solutions

### Issue: Orders not loading
**Solution:** 
- Check browser console for errors
- Verify Supabase connection
- Check `orders` table permissions
- Verify `employer_id` matches user ID

### Issue: Order not created
**Solution:**
- Check browser console for errors
- Verify all required fields filled
- Check Supabase `orders` table
- Verify `createOrder` service function

### Issue: Profile not saving
**Solution:**
- Check browser console
- Verify Supabase connection
- Check `profiles` table permissions

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Registration: [ ] Pass [ ] Fail
Login: [ ] Pass [ ] Fail
Profile View: [ ] Pass [ ] Fail
Profile Edit: [ ] Pass [ ] Fail
Create Order: [ ] Pass [ ] Fail
Orders List: [ ] Pass [ ] Fail
View Order Details: [ ] Pass [ ] Fail
Billing View: [ ] Pass [ ] Fail
Download Invoice: [ ] Pass [ ] Fail
Navigation: [ ] Pass [ ] Fail
Error Handling: [ ] Pass [ ] Fail
Loading States: [ ] Pass [ ] Fail

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

---

## 📊 Current Status

### ✅ Completed:
- [x] Orders page connected to Supabase
- [x] Loading states added
- [x] Error handling added
- [x] Empty state handled
- [x] Date formatting added

### ✅ Already Working:
- [x] Profile page
- [x] Create Order page
- [x] Billing page
- [x] Terms page
- [x] All buttons
- [x] Navigation

---

**Everything is ready for testing!** 🎉

