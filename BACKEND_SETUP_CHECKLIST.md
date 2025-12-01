# Backend Setup Checklist ✅

**Quick reference - follow this order!**

---

## 📋 Setup Order

### 1️⃣ Database Tables
- [ ] Run `database/cleanup.sql` (if starting fresh)
- [ ] Run `database/schema.sql` (creates 9 base tables)
- [ ] Run `database/schema_enhanced.sql` (adds 3 payment tables)
- [ ] Verify 12 tables exist in Table Editor

### 2️⃣ Authentication
- [ ] Enable Phone provider
- [ ] Enable Phone confirmations
- [ ] Disable Email confirmations
- [ ] Set Site URL

### 3️⃣ Storage Buckets (Create in Dashboard)
- [ ] Create `proof-of-delivery` bucket (private, 10MB, image/*)
- [ ] Create `permits` bucket (private, 10MB, application/pdf,image/*)
- [ ] Create `profiles` bucket (public, 5MB, image/*)
- [ ] Run `database/storage_setup.sql`

### 4️⃣ Security (RLS)
- [ ] Run `database/rls_policies.sql` (base tables)
- [ ] Run `database/rls_policies_enhanced.sql` (payment tables)
- [ ] Verify policies in Table Editor → Policies tab

### 5️⃣ Functions & Triggers
- [ ] Run `database/triggers.sql`
- [ ] Verify triggers in Table Editor → Triggers tab

### 6️⃣ Environment Variables
- [ ] Create `.env` file
- [ ] Add `VITE_SUPABASE_URL`
- [ ] Add `VITE_SUPABASE_ANON_KEY`
- [ ] Restart dev server

### 7️⃣ Testing
- [ ] Test Employer registration
- [ ] Test login
- [ ] Test profile update
- [ ] Verify data in Supabase tables

---

## 📁 SQL Files Reference

| File | When to Run | What it Does |
|------|-------------|--------------|
| `cleanup.sql` | First (if fresh start) | Deletes all tables |
| `schema.sql` | After cleanup | Creates 9 base tables |
| `schema_enhanced.sql` | After schema.sql | Adds 3 payment tables |
| `rls_policies.sql` | After schema | Adds security policies (base tables) |
| `rls_policies_enhanced.sql` | After schema_enhanced | Adds security policies (payment tables) |
| `storage_setup.sql` | After creating buckets | Adds storage policies |
| `triggers.sql` | After schema | Adds auto-update triggers |

---

## ✅ Verification

After setup, verify:
- [ ] 12 tables exist (9 base + 3 payment tables)
- [ ] `employers` table has correct columns
- [ ] Payment tables exist: `invoices`, `payout_requests`, `wallet_balances`
- [ ] RLS enabled on all tables
- [ ] Storage buckets created
- [ ] Storage policies created
- [ ] Triggers created
- [ ] `.env` configured
- [ ] Registration works
- [ ] Login works

---

**For detailed instructions, see `COMPLETE_BACKEND_SETUP.md`**

