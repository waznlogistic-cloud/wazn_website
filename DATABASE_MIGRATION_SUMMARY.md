# Database Migration Summary - Old Schema to New Schema

## 📋 Key Differences Between Old and New Schema

### ✅ Good News: profiles table already has Employer fields!
- ✅ `commercial_registration` - Already exists in old schema
- ✅ `tax_number` - Already exists in old schema
- ✅ These fields will be preserved when running new schema.sql

### ⚠️ Important Differences:

1. **proof_of_deliveries (old) vs proof_of_delivery (new)**
   - Old: `proof_of_deliveries` (plural) - Different structure, references `drivers` table
   - New: `proof_of_delivery` (singular) - References `profiles` table (for independent drivers)
   - **Action:** Old table will be deleted, new one created

2. **drivers (old) vs provider_drivers (new)**
   - Old: `drivers` table - References `companies` table
   - New: `provider_drivers` table - References `providers` table
   - **Action:** Old table will be deleted, new one created

3. **companies (old) vs providers (new)**
   - Old: `companies` table - Different structure
   - New: `providers` table - Linked to `profiles`
   - **Action:** Old table will be deleted, new one created

### ❌ Tables to be Deleted (Not in New Schema):
- `addresses` - Not used
- `companies` - Replaced by `providers`
- `drivers` - Replaced by `provider_drivers`
- `inventory` - Not used
- `invoices` - Not used (using `transactions` instead)
- `licenses` - Not used (using `permits` instead)
- `payments` - Not used (using `transactions` instead)
- `terms_acceptances` - Not used
- `terms_and_conditions` - Not used
- `warehouses` - Not used
- `proof_of_deliveries` - Replaced by `proof_of_delivery`

### ✅ Tables to be Kept/Updated:
- `profiles` - ✅ Will be updated (structure matches, fields preserved)
- `providers` - ✅ Will be updated
- `provider_drivers` - ✅ Will be updated
- `orders` - ✅ Will be updated
- `transactions` - ✅ Will be updated
- `proof_of_delivery` - ✅ Will be created (new name)
- `permits` - ✅ Will be updated
- `notifications` - ✅ Will be updated

---

## 🚀 Migration Steps

### Step 1: Run Cleanup (Deletes Everything)
```sql
-- Run database/cleanup.sql
-- This will delete ALL old and new tables
```

### Step 2: Run New Schema
```sql
-- Run database/schema.sql
-- This will create fresh tables with correct structure
```

### Step 3: Verify
- Check Table Editor - should see only 8 tables
- Verify `profiles` has `commercial_registration` and `tax_number`
- Verify `proof_of_delivery` exists (singular, not plural)

---

## ⚠️ Data Loss Warning

**IMPORTANT:** Running cleanup.sql will delete ALL data in ALL tables!

If you have important data:
1. Export data from old tables first
2. Or keep old tables temporarily (not recommended)

---

## ✅ Final Result

After migration, you'll have:
- ✅ 8 clean tables matching new schema
- ✅ All foreign keys correctly set
- ✅ All indexes created
- ✅ Ready for Employer role testing

---

**Status:** Ready to migrate! Follow steps above. 🚀

