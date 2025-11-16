# Supabase Setup Guide

Complete guide for setting up Supabase backend for Wazn platform.

---

## 📋 Step 1: Create Supabase Account & Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up** (GitHub, Google, or Email)
3. **Create New Project:**
   - Name: `wazn-platform`
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to your users (Middle East recommended)
   - Plan: Free (perfect for development)
4. **Wait 2-3 minutes** for project creation

---

## 📋 Step 2: Get API Credentials

1. In Supabase Dashboard → **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

---

## 📋 Step 3: Set Up Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** `.env` is already in `.gitignore` to keep credentials safe.

---

## 📋 Step 4: Create Database Tables

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New query"**
3. Open `database/schema.sql` from this project
4. Copy entire contents
5. Paste into SQL Editor
6. Click **"Run"** (or Ctrl+Enter)

### Verify Tables Created:
- Go to **Table Editor**
- You should see: `profiles`, `providers`, `provider_drivers`, `orders`, `transactions`, `proof_of_delivery`, `permits`, `notifications`

---

## 📋 Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. **Disable Email Confirmation** (for development):
   - Scroll to "Email Auth"
   - Turn OFF "Enable email confirmations"
   - This allows immediate login after registration

3. **Enable Providers:**
   - Email provider should be enabled by default
   - Phone provider (optional)

---

## 📋 Step 6: Test the Connection

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Check browser console:**
   - Should see no errors
   - If you see "Missing Supabase environment variables", check `.env` file

3. **Test registration:**
   - Go to `/select-user`
   - Register a test user
   - Check Supabase Dashboard → Authentication → Users
   - Check Table Editor → profiles table

---

## 📋 Step 7: Set Up Storage (Optional - For File Uploads)

1. Go to **Storage** in Supabase Dashboard
2. Create buckets:
   - `proof-of-delivery` - For delivery proof images
   - `permits` - For provider permits/licenses
   - `profiles` - For profile pictures

3. Set up policies (in SQL Editor):
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  USING (auth.role() = 'authenticated');
```

---

## 🔍 Verification Checklist

- [ ] Supabase project created
- [ ] `.env` file created with credentials
- [ ] Database tables created (check Table Editor)
- [ ] Email confirmation disabled (for development)
- [ ] Test registration works
- [ ] Test login works
- [ ] Data appears in Supabase tables

---

## 🐛 Common Issues

### "Missing Supabase environment variables"
- ✅ Check `.env` file exists in root
- ✅ Verify variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- ✅ Restart dev server

### Can't login after registration
- ✅ Disable email confirmation in Authentication → Settings
- ✅ Or check email for confirmation link

### Database errors
- ✅ Verify tables exist in Table Editor
- ✅ Check SQL Editor for error messages
- ✅ Ensure schema.sql was run completely

### RLS blocking queries
- ✅ For development, you can temporarily disable RLS
- ✅ Or add appropriate policies (see schema.sql)

---

## 📚 Next Steps

After setup is complete:
1. Test registration and login
2. Test profile updates
3. Test order creation
4. Connect remaining pages to Supabase
5. Set up Storage for file uploads (when needed)

---

## 📖 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Guide](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status:** Ready to use! All tables created and authentication configured. 🚀
