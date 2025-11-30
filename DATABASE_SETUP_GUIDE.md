# Database Setup Guide - Step by Step

دليل إعداد قاعدة البيانات خطوة بخطوة

---

## 📋 Prerequisites (المتطلبات)

- ✅ Supabase account created
- ✅ New Supabase project created
- ✅ Project URL and API keys copied

---

## 🗄️ Step 1: Open SQL Editor

1. Go to your Supabase Dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

---

## 🗄️ Step 2: Run Schema SQL

1. Open the file `database/schema.sql` from this project
2. **Copy ALL the contents** of the file
3. **Paste** into the SQL Editor in Supabase
4. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

### What this does:
- Creates custom role enum (`wazn_user_role`)
- Creates `profiles` table with all fields including `commercial_registration` and `tax_number`
- Creates `providers` table
- Creates `provider_drivers` table
- Creates `orders` table
- Creates `transactions` table
- Creates `proof_of_delivery` table
- Creates `permits` table
- Creates `notifications` table

### Expected Result:
- ✅ No errors
- ✅ Message: "Success. No rows returned"

---

## 🗄️ Step 3: Verify Tables Created

1. Go to **"Table Editor"** in the left sidebar
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `providers`
   - ✅ `provider_drivers`
   - ✅ `orders`
   - ✅ `transactions`
   - ✅ `proof_of_delivery`
   - ✅ `permits`
   - ✅ `notifications`

### Check `profiles` table structure:
Click on `profiles` table and verify these columns exist:
- ✅ `id` (UUID)
- ✅ `role` (enum)
- ✅ `full_name` (text)
- ✅ `phone` (text)
- ✅ `email` (text)
- ✅ `id_number` (text)
- ✅ `date_of_birth` (date)
- ✅ `nationality` (text)
- ✅ `address` (text)
- ✅ `commercial_registration` (text) ← **Important for Employer**
- ✅ `tax_number` (text) ← **Important for Employer**
- ✅ `created_at` (timestamp)
- ✅ `updated_at` (timestamp)

---

## 🔐 Step 4: Configure Authentication

### 4.1 Configure Phone Authentication (Important!)

1. Go to **"Authentication"** → **"Settings"** in the left sidebar
2. Scroll down to **"Phone Auth"** section
3. **Enable Phone provider** if not already enabled
4. Find **"Enable phone confirmations"**
5. **Turn it ON** (toggle should be checked/green) - Users will receive SMS confirmation code
6. Click **"Save"**

**Note:** Phone confirmation will be used for account verification instead of email.

### 4.2 Configure Email Auth (Optional)

1. Scroll to **"Email Auth"** section
2. Email provider should be **enabled by default** (for login)
3. Find **"Enable email confirmations"**
4. **Turn it OFF** (since we're using phone confirmation)
5. Click **"Save"**

**Why?** We're using phone numbers for account confirmation, not email.

---

## ✅ Step 5: Test Database Connection

### 5.1 Check Environment Variables

Make sure your `.env` file exists in the project root:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5.2 Restart Dev Server

```bash
npm run dev
```

### 5.3 Check Browser Console

- Open browser console (F12)
- Should see **no errors** related to Supabase
- If you see "Missing Supabase environment variables", check `.env` file

---

## 🧪 Step 6: Test Registration

1. Go to `/select-user` in your app
2. Select **"Employer"** (صاحب عمل)
3. Fill the registration form:
   - Company Name
   - Document/Commercial Registration Number
   - Tax Number
   - Address
   - Phone (05xxxxxxxx)
   - Email
   - Password
   - Check Terms & Conditions
4. Click **"إنشاء الحساب"** (Create Account)

### Expected Result:
- ✅ Success message appears
- ✅ Redirects to `/employer/profile`
- ✅ No errors in console

### Verify in Supabase:
1. Go to **"Authentication"** → **"Users"**
2. You should see the new user with the email you entered
3. Go to **"Table Editor"** → **"profiles"**
4. You should see a new row with:
   - `role` = "employer"
   - `full_name` = Company Name
   - `commercial_registration` = Document/Commercial Registration Number
   - `tax_number` = Tax Number
   - `phone` = Phone Number
   - `email` = Email

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
- ✅ Make sure you ran `schema.sql` completely
- ✅ Check Table Editor to see which tables exist
- ✅ Re-run `schema.sql` if needed

### Error: "column does not exist"
- ✅ Check if `commercial_registration` and `tax_number` exist in `profiles` table
- ✅ If not, run `database/add_employer_fields.sql` to add them

### Error: "duplicate key value violates unique constraint"
- ✅ User already exists
- ✅ Try with different email/phone

### Can't login after registration
- ✅ Check if phone confirmation is enabled (Step 4.1)
- ✅ User should receive SMS code to verify phone number
- ✅ Check browser console for errors
- ✅ Verify user exists in Authentication → Users
- ✅ Make sure phone number is verified before login

### Tables not showing in Table Editor
- ✅ Refresh the page
- ✅ Check SQL Editor for errors
- ✅ Make sure you ran the complete `schema.sql`

---

## 📋 Checklist

Before testing Employer role, make sure:

- [ ] Supabase project created
- [ ] `.env` file created with correct credentials
- [ ] `schema.sql` run successfully in SQL Editor
- [ ] All 8 tables visible in Table Editor
- [ ] `profiles` table has `commercial_registration` and `tax_number` columns
- [ ] Phone confirmation enabled in Authentication Settings
- [ ] Email confirmation disabled (since using phone confirmation)
- [ ] Dev server restarted after creating `.env`
- [ ] Test registration works
- [ ] Test login works
- [ ] Data appears in Supabase tables

---

## 🎯 Next Steps After Database Setup

Once database is set up:

1. ✅ Test Employer registration
2. ✅ Test Employer login
3. ✅ Test Employer profile update
4. ✅ Test creating an order
5. ✅ Test viewing orders
6. ✅ Test billing page

---

## 📝 Summary

**What you need to do:**

1. ✅ Open Supabase SQL Editor
2. ✅ Copy and paste `database/schema.sql`
3. ✅ Run the SQL
4. ✅ Verify tables in Table Editor
5. ✅ Disable email confirmation
6. ✅ Test registration

**That's it!** Your database is ready for Employer role testing.

---

## 🔗 Files Reference

- **`database/schema.sql`** - Main schema file (run this first)
- **`database/add_employer_fields.sql`** - Only if `commercial_registration`/`tax_number` missing
- **`database/cleanup.sql`** - If you need to reset everything
- **`database/ERD.md`** - Database structure diagram

---

**Status:** Ready to set up! Follow steps 1-6 above. 🚀

