# Complete Setup Guide - From Scratch 🚀

**Follow this guide step-by-step. Don't skip anything!**

---

## 📋 PART 1: Create Supabase Account & Project

### Step 1.1: Create Supabase Account

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"** or **"Sign up"**
3. Choose sign-up method:
   - **GitHub** (recommended)
   - **Google**
   - **Email**
4. Complete sign-up process
5. Verify your email if needed

### Step 1.2: Create New Project

1. After logging in, click **"New Project"** button
2. Fill in project details:
   - **Name:** `wazn-platform` (or any name you prefer)
   - **Database Password:** Create a strong password (SAVE IT SOMEWHERE SAFE!)
     - Must be at least 8 characters
     - Mix of letters, numbers, and symbols
   - **Region:** Choose closest to your users
     - For Middle East: Choose a region like `West US (North California)` or `Southeast Asia (Singapore)`
   - **Pricing Plan:** Select **Free** (perfect for development)
3. Click **"Create new project"**
4. **Wait 2-3 minutes** for project to be created
   - You'll see a loading screen
   - Don't close the browser!

### Step 1.3: Get API Credentials

1. Once project is ready, go to **Settings** (gear icon ⚙️) in left sidebar
2. Click **"API"** in the settings menu
3. You'll see two important values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   - Copy this entire URL

   **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```
   - Copy this entire long string

4. **Save both values** - you'll need them in Step 2!

---

## 📝 PART 2: Set Up Environment Variables

### Step 2.1: Create .env File

1. Go back to your project folder (`wazn_website`)
2. In the **root directory** (same level as `package.json`), create a new file named `.env`
3. Open `.env` file and paste this:

```env
VITE_SUPABASE_URL=https://your-project-url-here.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Replace the placeholders:**
   - Replace `https://your-project-url-here.supabase.co` with your actual Project URL from Step 1.3
   - Replace `your-anon-key-here` with your actual anon public key from Step 1.3

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzIwMCwiZXhwIjoxOTU0NTQzMjAwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

5. **Save the file**

**Important:** `.env` is already in `.gitignore`, so your credentials won't be committed to git.

---

## 🗄️ PART 3: Set Up Database

### Step 3.1: Open SQL Editor

1. In Supabase Dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New query"** button

### Step 3.2: Run Cleanup Script (Fresh Start)

1. Open `database/cleanup.sql` from your project
2. **Copy ALL contents** (Ctrl+A, Ctrl+C / Cmd+A, Cmd+C)
3. **Paste** into SQL Editor in Supabase
4. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)

**Expected Result:**
- ✅ Success message
- ✅ All old tables deleted (if any existed)

### Step 3.3: Create Database Schema

1. In SQL Editor, click **"New query"** (or clear the previous one)
2. Open `database/schema.sql` from your project
3. **Copy ALL contents**
4. **Paste** into SQL Editor
5. Click **"Run"**

**Expected Result:**
- ✅ Success message: "Success. No rows returned"
- ✅ All tables created

### Step 3.4: Verify Base Tables Created

1. Click **"Table Editor"** in left sidebar
2. You should see **9 base tables**:
   - ✅ `profiles`
   - ✅ `providers`
   - ✅ `employers` ← **NEW!**
   - ✅ `provider_drivers`
   - ✅ `orders`
   - ✅ `transactions`
   - ✅ `proof_of_delivery`
   - ✅ `permits`
   - ✅ `notifications`

3. Click on `employers` table to verify it has these columns:
   - `id`, `company_name`, `commercial_registration`, `tax_number`, `activity_type`, `rating`, `address`, `created_at`, `updated_at`

### Step 3.5: Add Payment Tables (schema_enhanced.sql)

**Important:** This step adds 3 payment tables and enhances the transactions table.

1. In SQL Editor, click **"New query"** (or clear the previous one)
2. Open `database/schema_enhanced.sql` from your project
3. **Copy ALL contents**
4. **Paste** into SQL Editor
5. Click **"Run"**

**Expected Result:**
- ✅ Success message: "Success. No rows returned"
- ✅ 3 new tables created: `invoices`, `payout_requests`, `wallet_balances`
- ✅ `transactions` table enhanced with payment gateway fields

### Step 3.6: Verify All Tables Created

1. Click **"Table Editor"** in left sidebar
2. You should now see **12 tables total**:

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

---

## 🔐 PART 4: Configure Authentication

### Step 4.1: Configure Phone Authentication

1. Click **"Authentication"** in left sidebar
2. Click **"Settings"** tab
3. Scroll down to **"Phone Auth"** section
4. **Enable Phone provider:**
   - Toggle **"Enable Phone provider"** to **ON** (green)
5. **Enable Phone Confirmations:**
   - Toggle **"Enable phone confirmations"** to **ON** (green)
   - This means users will receive SMS code to verify their phone number
6. Click **"Save"** button at the bottom

### Step 4.2: Configure Email Auth

1. Still in **Authentication** → **Settings**
2. Scroll to **"Email Auth"** section
3. **Email provider** should be **enabled by default** (leave it ON)
4. **Disable Email Confirmations:**
   - Toggle **"Enable email confirmations"** to **OFF** (gray)
   - We're using phone confirmation instead
5. Click **"Save"** button

### Step 4.3: Configure Site URL

1. Still in **Authentication** → **Settings**
2. Scroll to **"Site URL"** section
3. Set to: `http://localhost:5173` (for development)
4. Click **"Save"**

**Note:** For production, you'll change this to your actual domain later.

---

## 📦 PART 5: Set Up Storage Buckets

### Step 5.1: Create Storage Buckets

1. Click **"Storage"** in left sidebar
2. Click **"New bucket"** button

**Create Bucket 1: proof-of-delivery**
- **Name:** `proof-of-delivery`
- **Public bucket:** **No** (unchecked - private)
- **File size limit:** `10` MB
- **Allowed MIME types:** `image/*`
- Click **"Create bucket"**

**Create Bucket 2: permits**
- Click **"New bucket"** again
- **Name:** `permits`
- **Public bucket:** **No** (unchecked - private)
- **File size limit:** `10` MB
- **Allowed MIME types:** `application/pdf,image/*`
- Click **"Create bucket"**

**Create Bucket 3: profiles**
- Click **"New bucket"** again
- **Name:** `profiles`
- **Public bucket:** **Yes** (checked - public)
- **File size limit:** `5` MB
- **Allowed MIME types:** `image/*`
- Click **"Create bucket"**

### Step 5.2: Set Up Storage Policies

1. Go back to **SQL Editor**
2. Click **"New query"**
3. Open `database/storage_setup.sql` from your project
4. **Copy ALL contents**
5. **Paste** into SQL Editor
6. Click **"Run"**

**Expected Result:**
- ✅ Success message
- ✅ Storage policies created

---

## 🔒 PART 6: Set Up Row Level Security (RLS)

### Step 6.1: Create Base RLS Policies

1. In **SQL Editor**, click **"New query"**
2. Open `database/rls_policies.sql` from your project
3. **Copy ALL contents**
4. **Paste** into SQL Editor
5. Click **"Run"**

**Expected Result:**
- ✅ Success message
- ✅ RLS enabled on base tables
- ✅ All base policies created

### Step 6.2: Create Enhanced RLS Policies (for Payment Tables)

**Important:** This step adds RLS policies for the payment tables (`invoices`, `payout_requests`, `wallet_balances`).

1. In **SQL Editor**, click **"New query"**
2. Open `database/rls_policies_enhanced.sql` from your project
3. **Copy ALL contents**
4. **Paste** into SQL Editor
5. Click **"Run"**

**Expected Result:**
- ✅ Success message
- ✅ RLS enabled on payment tables
- ✅ All payment table policies created

### Step 6.3: Verify RLS is Enabled

1. Go to **Table Editor**
2. Click on any table (e.g., `profiles`)
3. Click **"Policies"** tab at the top
4. You should see policies listed (e.g., "Users can read own profile")
5. Check payment tables too (`invoices`, `payout_requests`, `wallet_balances`) - they should also have policies

---

## 🔧 PART 7: Set Up Database Triggers

### Step 7.1: Create Triggers

1. In **SQL Editor**, click **"New query"**
2. Open `database/triggers.sql` from your project
3. **Copy ALL contents**
4. **Paste** into SQL Editor
5. Click **"Run"**

**Expected Result:**
- ✅ Success message
- ✅ Function created
- ✅ Triggers created

### Step 7.2: Verify Triggers

1. Go to **Table Editor**
2. Click on `profiles` table
3. Click **"Triggers"** tab at the top
4. You should see `set_updated_at_profiles` trigger

---

## 🚀 PART 8: Start Development Server

### Step 8.1: Restart Dev Server

1. Go back to your terminal/command prompt
2. Make sure you're in the project directory (`wazn_website`)
3. Stop the server if it's running (Ctrl+C)
4. Start it again:

```bash
npm run dev
```

**Expected Result:**
- ✅ Server starts successfully
- ✅ No errors about missing Supabase variables
- ✅ Server running on `http://localhost:5173`

---

## ✅ PART 9: Verification & Testing

### Step 9.1: Test Registration

1. Open browser and go to `http://localhost:5173`
2. Navigate to `/select-user` (or registration page)
3. Select **"Employer"** (صاحب عمل)
4. Fill the registration form:
   - Company Name: `Test Company`
   - Document/Commercial Registration: `CR 123 456 7890`
   - Tax Number: `123 4567 890`
   - Address: `Riyadh, Saudi Arabia`
   - Phone: `0512345678` (must start with 05)
   - Email: `test@example.com`
   - Password: `password123`
   - Check Terms & Conditions
5. Click **"إنشاء الحساب"** (Create Account)

**Expected Result:**
- ✅ Success message appears
- ✅ Redirects to `/employer/profile`
- ✅ No errors in browser console (F12)

### Step 9.2: Verify Data in Supabase

1. Go to Supabase Dashboard
2. Click **"Authentication"** → **"Users"**
3. You should see the new user with email `test@example.com`
4. Click **"Table Editor"** → **"profiles"**
5. You should see a new row with:
   - `role` = `employer`
   - `phone` = `0512345678`
   - `email` = `test@example.com`
6. Click **"Table Editor"** → **"employers"**
7. You should see a new row with:
   - `company_name` = `Test Company`
   - `commercial_registration` = `CR 123 456 7890`
   - `tax_number` = `123 4567 890`

### Step 9.3: Test Profile Update

1. In your app, go to `/employer/profile`
2. Click **"تعديل"** (Edit) button
3. Change company name to `Updated Company Name`
4. Click **"حفظ المعلومات"** (Save)
5. **Expected:** Success message
6. Verify in Supabase: `employers` table should show updated company name

### Step 9.4: Test Login

1. Logout (if logged in)
2. Go to `/login`
3. Enter:
   - Phone: `0512345678`
   - Password: `password123`
4. Click login
5. **Expected:** Redirects to profile page

**Note:** If phone confirmation is enabled, you might need to verify the phone number first via SMS.

---

## 📋 Final Checklist

Before considering setup complete, verify:

### Database
- [ ] All 9 tables exist in Table Editor
- [ ] `employers` table has correct columns
- [ ] `profiles` table does NOT have `commercial_registration` or `tax_number`

### Authentication
- [ ] Phone provider enabled
- [ ] Phone confirmations enabled
- [ ] Email confirmations disabled
- [ ] Site URL configured

### Storage
- [ ] 3 buckets created (`proof-of-delivery`, `permits`, `profiles`)
- [ ] Storage policies created (check SQL Editor ran successfully)

### Security
- [ ] RLS enabled on all tables
- [ ] RLS policies created (check Table Editor → Policies tab)

### Functions & Triggers
- [ ] Triggers created (check Table Editor → Triggers tab)

### Environment
- [ ] `.env` file created with correct credentials
- [ ] Dev server restarted
- [ ] No errors in console

### Testing
- [ ] Registration works
- [ ] Data appears in Supabase tables
- [ ] Profile update works
- [ ] Login works

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- ✅ Check `.env` file exists in project root
- ✅ Verify variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- ✅ Make sure no extra spaces or quotes
- ✅ Restart dev server

### "relation does not exist"
- ✅ Run `cleanup.sql` first
- ✅ Then run `schema.sql`
- ✅ Check Table Editor to verify tables exist

### "permission denied"
- ✅ Check RLS policies are created (`rls_policies.sql` ran successfully)
- ✅ Verify user is authenticated
- ✅ For testing, you can temporarily disable RLS on a table (not recommended for production)

### Can't login after registration
- ✅ Check phone confirmation is enabled
- ✅ User should receive SMS code
- ✅ Verify phone number in Authentication → Users
- ✅ Make sure phone number is verified

### Storage upload fails
- ✅ Check storage buckets are created
- ✅ Verify storage policies are created
- ✅ Check file size and MIME type restrictions

---

## 🎉 Success!

If all steps completed successfully:
- ✅ Your backend is 100% set up
- ✅ Database is ready
- ✅ Authentication is configured
- ✅ Storage is ready
- ✅ Security is enabled
- ✅ Everything is tested

**You're ready to continue development!** 🚀

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `database/cleanup.sql` | Delete all tables (fresh start) |
| `database/schema.sql` | Create 9 base tables |
| `database/schema_enhanced.sql` | Add 3 payment tables + enhance transactions |
| `database/rls_policies.sql` | Add security policies for base tables |
| `database/rls_policies_enhanced.sql` | Add security policies for payment tables |
| `database/storage_setup.sql` | Add storage policies |
| `database/triggers.sql` | Add auto-update triggers |

---

**Follow this guide step-by-step. Don't skip anything!** ✅

