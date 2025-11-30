# Database Migration Guide - Old Tables to New Schema

## 📋 Current Situation

You have **old tables** in Supabase that need to be cleaned up before running the new `schema.sql`.

---

## 🔍 Comparison: Old Tables vs New Schema

### ✅ Tables That Match (Will be updated with `CREATE TABLE IF NOT EXISTS`):
- ✅ `profiles` - ✅ Exists in new schema
- ✅ `providers` - ✅ Exists in new schema
- ✅ `provider_drivers` - ✅ Exists in new schema
- ✅ `orders` - ✅ Exists in new schema
- ✅ `transactions` - ✅ Exists in new schema
- ✅ `proof_of_delivery` - ✅ Exists in new schema (note: old might be `proof_of_deliveries`)
- ✅ `permits` - ✅ Exists in new schema
- ✅ `notifications` - ✅ Exists in new schema

### ❌ Old Tables NOT in New Schema (Should be deleted):
- ❌ `addresses` - Not used in new schema
- ❌ `companies` - Not used in new schema
- ❌ `drivers` - Not used (we use `provider_drivers` instead)
- ❌ `inventory` - Not used in new schema
- ❌ `invoices` - Not used in new schema
- ❌ `licenses` - Not used in new schema
- ❌ `payments` - Not used (we use `transactions` instead)
- ❌ `terms_acceptances` - Not used in new schema
- ❌ `terms_and_conditions` - Not used in new schema
- ❌ `warehouses` - Not used in new schema

### ⚠️ Potential Conflicts:
- ⚠️ `proof_of_deliveries` (old) vs `proof_of_delivery` (new) - Different names!

---

## 🚨 IMPORTANT: Before Running New Schema

### Option 1: Clean Slate (Recommended)
**Delete all old tables first, then run new schema:**

1. **Run cleanup script** (or manually delete old tables):
   ```sql
   -- Delete old tables that don't exist in new schema
   DROP TABLE IF EXISTS public.addresses CASCADE;
   DROP TABLE IF EXISTS public.companies CASCADE;
   DROP TABLE IF EXISTS public.drivers CASCADE;
   DROP TABLE IF EXISTS public.inventory CASCADE;
   DROP TABLE IF EXISTS public.invoices CASCADE;
   DROP TABLE IF EXISTS public.licenses CASCADE;
   DROP TABLE IF EXISTS public.payments CASCADE;
   DROP TABLE IF EXISTS public.terms_acceptances CASCADE;
   DROP TABLE IF EXISTS public.terms_and_conditions CASCADE;
   DROP TABLE IF EXISTS public.warehouses CASCADE;
   
   -- Handle proof_of_deliveries vs proof_of_delivery
   DROP TABLE IF EXISTS public.proof_of_deliveries CASCADE;
   ```

2. **Then run `database/schema.sql`** - It will create/update the correct tables

### Option 2: Keep Old Tables (Not Recommended)
If you want to keep old tables for reference:
- They won't interfere with new schema (different names)
- But they'll clutter your database
- Not recommended for production

---

## ✅ Recommended Steps

### Step 1: Backup (Optional but Recommended)
1. Go to Supabase Dashboard → **Database** → **Backups**
2. Create a backup before making changes

### Step 2: Delete Old Tables
Run this SQL in Supabase SQL Editor:

```sql
-- ============================================
-- Delete Old Tables Not in New Schema
-- ============================================

DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.licenses CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.terms_acceptances CASCADE;
DROP TABLE IF EXISTS public.terms_and_conditions CASCADE;
DROP TABLE IF EXISTS public.warehouses CASCADE;
DROP TABLE IF EXISTS public.proof_of_deliveries CASCADE; -- Old name
```

### Step 3: Run New Schema
1. Copy `database/schema.sql`
2. Paste in SQL Editor
3. Run it

### Step 4: Verify
Check Table Editor - you should see only:
- ✅ profiles
- ✅ providers
- ✅ provider_drivers
- ✅ orders
- ✅ transactions
- ✅ proof_of_delivery (singular, not plural)
- ✅ permits
- ✅ notifications

---

## 🔍 Verification Checklist

After migration:
- [ ] Old tables deleted
- [ ] New schema.sql run successfully
- [ ] Only 8 tables visible in Table Editor
- [ ] `profiles` table has `commercial_registration` and `tax_number` columns
- [ ] `proof_of_delivery` exists (singular, not plural)
- [ ] No errors in SQL Editor

---

## ⚠️ Important Notes

1. **Data Loss Warning**: Deleting old tables will delete all data in them. Make sure you don't need that data!

2. **Existing Data**: If you have data in `profiles`, `orders`, etc., running `CREATE TABLE IF NOT EXISTS` will **keep** that data, but the table structure might be updated.

3. **Foreign Keys**: If old tables have foreign keys pointing to tables you're keeping, you might need to drop those constraints first.

4. **RLS Policies**: Old tables might have RLS policies that need to be cleaned up.

---

## 🎯 Summary

**Action Required:**
1. ✅ Delete old unused tables
2. ✅ Run new `schema.sql`
3. ✅ Verify tables match new schema

**Result:**
- Clean database with only the 8 tables needed
- All tables match the new schema structure
- Ready for Employer role testing

---

**Status:** Ready to migrate! Follow steps above. 🚀

