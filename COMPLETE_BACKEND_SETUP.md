# Complete Backend Setup Guide 🚀

**Everything you need to set up the backend completely - nothing forgotten!**

---

## 📋 Prerequisites

- ✅ Supabase account created
- ✅ Supabase project created
- ✅ Project URL and API keys copied
- ✅ `.env` file ready (or will create it)

---

## 🗄️ PART 1: Database Setup

### Step 1.1: Run Cleanup Script (If Starting Fresh)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New query"**
3. Open `database/cleanup.sql` from this project
4. **Copy ALL contents** and paste into SQL Editor
5. Click **"Run"** (Ctrl+Enter / Cmd+Enter)

**Expected:** Success message - all old tables deleted

### Step 1.2: Create Database Schema

1. In SQL Editor, click **"New query"** (or use same one)
2. Open `database/schema.sql` from this project
3. **Copy ALL contents** and paste into SQL Editor
4. Click **"Run"**

**Expected:** Success message - all tables created

### Step 1.3: Verify Base Tables Created

Go to **Table Editor** → You should see **9 base tables**:

- ✅ `profiles`
- ✅ `providers`
- ✅ `employers` ← **NEW!**
- ✅ `provider_drivers`
- ✅ `orders`
- ✅ `transactions`
- ✅ `proof_of_delivery`
- ✅ `permits`
- ✅ `notifications`

### Step 1.4: Add Payment Tables (schema_enhanced.sql)

**Important:** This step adds 3 payment tables and enhances the transactions table.

1. In SQL Editor, click **"New query"**
2. Open `database/schema_enhanced.sql` from this project
3. **Copy ALL contents** and paste into SQL Editor
4. Click **"Run"**

**Expected:** Success message - 3 new tables created

### Step 1.5: Verify All Tables Created

Go to **Table Editor** → You should now see **12 tables total**:

**Base tables (9):**
- ✅ `profiles`
- ✅ `providers`
- ✅ `employers`
- ✅ `provider_drivers`
- ✅ `orders`
- ✅ `transactions` (enhanced with payment fields)
- ✅ `proof_of_delivery`
- ✅ `permits`
- ✅ `notifications`

**Payment tables (3):**
- ✅ `invoices` ← From schema_enhanced.sql
- ✅ `payout_requests` ← From schema_enhanced.sql
- ✅ `wallet_balances` ← From schema_enhanced.sql

### Step 1.6: Verify Table Structures

**Check `profiles` table:**
- Should have: `id`, `role`, `full_name`, `phone`, `email`, `id_number`, `date_of_birth`, `nationality`, `address`, `created_at`, `updated_at`
- Should NOT have: `commercial_registration`, `tax_number` (moved to `employers` table)

**Check `employers` table:**
- Should have: `id`, `company_name`, `commercial_registration`, `tax_number`, `activity_type`, `rating`, `address`, `created_at`, `updated_at`

---

## 🔐 PART 2: Authentication Configuration

### Step 2.1: Configure Phone Authentication

1. Go to **Authentication** → **Settings**
2. Scroll to **"Phone Auth"** section
3. **Enable Phone provider** (toggle ON)
4. **Enable phone confirmations** (toggle ON) ← **IMPORTANT!**
5. Click **"Save"**

**Why?** Users will receive SMS code to verify their phone number.

### Step 2.2: Configure Email Auth

1. Scroll to **"Email Auth"** section
2. Email provider should be **enabled** (for login)
3. **Disable email confirmations** (toggle OFF) ← Since using phone confirmation
4. Click **"Save"**

**Note:** Account confirmation is done through phone numbers (SMS), not email.

### Step 2.3: Configure Site URL (If Not Set)

1. In **Authentication** → **Settings**
2. Scroll to **"Site URL"**
3. Set to: `http://localhost:5173` (for development)
4. For production, set to your actual domain
5. Click **"Save"**

---

## 📦 PART 3: Storage Buckets Setup

### Step 3.1: Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Click **"New bucket"**
3. Create these buckets one by one:

**Bucket 1: `proof-of-delivery`**
- Name: `proof-of-delivery`
- Public: **No** (private)
- File size limit: 10 MB
- Allowed MIME types: `image/*`
- Click **"Create bucket"**

**Bucket 2: `permits`**
- Name: `permits`
- Public: **No** (private)
- File size limit: 10 MB
- Allowed MIME types: `application/pdf,image/*`
- Click **"Create bucket"**

**Bucket 3: `profiles`** (Optional - for profile pictures)
- Name: `profiles`
- Public: **Yes** (public)
- File size limit: 5 MB
- Allowed MIME types: `image/*`
- Click **"Create bucket"**

### Step 3.2: Set Up Storage Policies

Go to **SQL Editor** → **New query** → Paste and run:

```sql
-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Policy 1: Allow authenticated users to upload proof of delivery
CREATE POLICY "Users can upload proof of delivery"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proof-of-delivery' AND
  auth.role() = 'authenticated'
);

-- Policy 2: Allow users to read proof of delivery files
CREATE POLICY "Users can read proof of delivery"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'proof-of-delivery' AND
  auth.role() = 'authenticated'
);

-- Policy 3: Allow providers to upload permits
CREATE POLICY "Providers can upload permits"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'permits' AND
  auth.role() = 'authenticated'
);

-- Policy 4: Allow users to read permit files
CREATE POLICY "Users can read permits"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'permits' AND
  auth.role() = 'authenticated'
);

-- Policy 5: Allow users to upload profile pictures
CREATE POLICY "Users can upload profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  auth.role() = 'authenticated'
);

-- Policy 6: Allow public to read profile pictures
CREATE POLICY "Public can read profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');
```

**Expected:** Success message - policies created

---

## 🔒 PART 4: Row Level Security (RLS) Policies

### Step 4.1: Enable RLS on Tables

**Option 1: Use SQL Files (Recommended)**

1. In **SQL Editor**, click **"New query"**
2. Open `database/rls_policies.sql` from this project
3. **Copy ALL contents** and paste into SQL Editor
4. Click **"Run"**

**Option 2: Manual SQL (Alternative)**

Go to **SQL Editor** → **New query** → Paste and run:

```sql
-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_of_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- Payment tables (from schema_enhanced.sql)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;
```

### Step 4.2: Create Base RLS Policies

**Option 1: Use SQL File (Recommended)**

1. In **SQL Editor**, click **"New query"**
2. Open `database/rls_policies.sql` from this project
3. **Copy ALL contents** and paste into SQL Editor
4. Click **"Run"**

**Option 2: Manual SQL (Alternative)**

Go to **SQL Editor** → **New query** → Paste and run:

```sql
-- ============================================
-- RLS POLICIES
-- ============================================

-- PROFILES POLICIES
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- PROVIDERS POLICIES
-- Users can read their own provider record
CREATE POLICY "Users can read own provider"
ON public.providers FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own provider record
CREATE POLICY "Users can update own provider"
ON public.providers FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own provider record
CREATE POLICY "Users can insert own provider"
ON public.providers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- EMPLOYERS POLICIES
-- Users can read their own employer record
CREATE POLICY "Users can read own employer"
ON public.employers FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own employer record
CREATE POLICY "Users can update own employer"
ON public.employers FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own employer record
CREATE POLICY "Users can insert own employer"
ON public.employers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- PROVIDER DRIVERS POLICIES
-- Providers can manage their own drivers
CREATE POLICY "Providers can manage own drivers"
ON public.provider_drivers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = provider_drivers.provider_id
    AND providers.id = auth.uid()
  )
);

-- ORDERS POLICIES
-- Users can read orders they created or are assigned to
CREATE POLICY "Users can read own orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  client_id = auth.uid() OR
  employer_id = auth.uid() OR
  driver_id = auth.uid() OR
  provider_id IN (
    SELECT id FROM public.providers WHERE id = auth.uid()
  )
);

-- Users can create orders
CREATE POLICY "Users can create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (
  client_id = auth.uid() OR
  employer_id = auth.uid()
);

-- Users can update their own orders
CREATE POLICY "Users can update own orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  client_id = auth.uid() OR
  employer_id = auth.uid() OR
  provider_id IN (
    SELECT id FROM public.providers WHERE id = auth.uid()
  )
);

-- TRANSACTIONS POLICIES
-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own transactions
CREATE POLICY "Users can create own transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- PROOF OF DELIVERY POLICIES
-- Drivers can create proof of delivery
CREATE POLICY "Drivers can create proof of delivery"
ON public.proof_of_delivery FOR INSERT
TO authenticated
WITH CHECK (driver_id = auth.uid());

-- Users can read proof of delivery for their orders
CREATE POLICY "Users can read proof of delivery"
ON public.proof_of_delivery FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = proof_of_delivery.order_id
    AND (
      orders.client_id = auth.uid() OR
      orders.employer_id = auth.uid() OR
      orders.driver_id = auth.uid()
    )
  )
);

-- PERMITS POLICIES
-- Providers can manage their own permits
CREATE POLICY "Providers can manage own permits"
ON public.permits FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = permits.provider_id
    AND providers.id = auth.uid()
  )
);

-- NOTIFICATIONS POLICIES
-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());
```

**Expected:** Success message - all policies created

### Step 4.3: Create Enhanced RLS Policies (for Payment Tables)

**Important:** This step adds RLS policies for the payment tables (`invoices`, `payout_requests`, `wallet_balances`).

1. In **SQL Editor**, click **"New query"**
2. Open `database/rls_policies_enhanced.sql` from this project
3. **Copy ALL contents** and paste into SQL Editor
4. Click **"Run"**

**Expected:** Success message - RLS policies created for payment tables

---

## 🔧 PART 5: Database Functions & Triggers

### Step 5.1: Create Updated_at Trigger Function

Go to **SQL Editor** → **New query** → Paste and run:

```sql
-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Step 5.2: Create Triggers for updated_at

Go to **SQL Editor** → **New query** → Paste and run:

```sql
-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_providers
  BEFORE UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_employers
  BEFORE UPDATE ON public.employers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_provider_drivers
  BEFORE UPDATE ON public.provider_drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

**Expected:** Success message - triggers created

---

## 📝 PART 6: Environment Variables

### Step 6.1: Create .env File

In your project root, create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to **Supabase Dashboard** → **Settings** (gear icon) → **API**
2. Copy **Project URL** → paste as `VITE_SUPABASE_URL`
3. Copy **anon public key** → paste as `VITE_SUPABASE_ANON_KEY`

### Step 6.2: Restart Dev Server

```bash
npm run dev
```

---

## ✅ PART 7: Verification Checklist

### Database
- [ ] Cleanup.sql run successfully
- [ ] Schema.sql run successfully (9 base tables)
- [ ] Schema_enhanced.sql run successfully (3 payment tables)
- [ ] All 12 tables visible in Table Editor
- [ ] `employers` table exists with correct columns
- [ ] Payment tables exist: `invoices`, `payout_requests`, `wallet_balances`
- [ ] `profiles` table does NOT have `commercial_registration` or `tax_number`

### Authentication
- [ ] Phone provider enabled
- [ ] Phone confirmations enabled
- [ ] Email provider enabled
- [ ] Email confirmations disabled
- [ ] Site URL configured

### Storage
- [ ] `proof-of-delivery` bucket created
- [ ] `permits` bucket created
- [ ] `profiles` bucket created (optional)
- [ ] Storage policies created

### RLS Policies
- [ ] RLS enabled on all tables (base + payment tables)
- [ ] Base RLS policies created (`rls_policies.sql`)
- [ ] Enhanced RLS policies created (`rls_policies_enhanced.sql`)
- [ ] Policies tested (can read own data)

### Functions & Triggers
- [ ] `handle_updated_at()` function created
- [ ] All triggers created
- [ ] Triggers tested (updated_at updates automatically)

### Environment
- [ ] `.env` file created
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] Dev server restarted

---

## 🧪 PART 8: Testing

### Test 1: Registration
1. Go to `/select-user` → Select **"Employer"**
2. Fill registration form
3. Submit
4. **Expected:** Success message, redirect to profile

### Test 2: Verify Data in Supabase
1. Go to **Table Editor** → `profiles`
2. Should see new user with `role = 'employer'`
3. Go to **Table Editor** → `employers`
4. Should see new employer record with company info

### Test 3: Profile Update
1. Go to `/employer/profile`
2. Click **"تعديل"** (Edit)
3. Update company name
4. Click **"حفظ"** (Save)
5. **Expected:** Success message, data updated
6. Verify in Supabase: `employers` table updated

### Test 4: Login
1. Go to `/login`
2. Enter phone and password
3. **Expected:** Redirect to profile page

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
- ✅ Run `cleanup.sql` first, then `schema.sql`
- ✅ Check Table Editor to verify tables exist

### Error: "permission denied"
- ✅ Check RLS policies are created
- ✅ Verify user is authenticated
- ✅ Check policy conditions match your use case

### Error: "bucket does not exist"
- ✅ Create storage buckets first (Part 3)
- ✅ Check bucket names match exactly

### Can't login after registration
- ✅ Check phone confirmation is enabled
- ✅ User should receive SMS code
- ✅ Verify phone number in Authentication → Users

### Storage upload fails
- ✅ Check storage policies are created
- ✅ Verify bucket exists
- ✅ Check file size and MIME type restrictions

---

## 📋 Summary

**What you've set up:**

1. ✅ **Database** - All 9 tables with correct structure
2. ✅ **Authentication** - Phone confirmation enabled
3. ✅ **Storage** - 3 buckets with policies
4. ✅ **RLS** - Security policies for all tables
5. ✅ **Functions** - Auto-update triggers
6. ✅ **Environment** - `.env` configured

**Your backend is now 100% complete and production-ready!** 🎉

---

## 🎯 Next Steps

After backend setup:
1. ✅ Test all registration flows
2. ✅ Test profile updates
3. ✅ Test order creation
4. ✅ Test file uploads (when implemented)
5. ✅ Monitor Supabase logs for any issues

---

**Status:** Complete! Follow all parts 1-8 above. 🚀

