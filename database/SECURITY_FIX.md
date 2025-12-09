# Security Fix - Login RLS Policy

## Issue
The previous RLS policy `"Public can read email and role by phone for login"` used `USING (true)`, which allowed unauthenticated users to read **ALL columns** from the entire `profiles` table, exposing sensitive data like:
- `full_name`
- `id_number`
- `date_of_birth`
- `nationality`
- `address`
- And all other profile data

## Solution
Created a **SECURITY DEFINER function** that only returns the minimal data needed for login:
- `email`
- `role`
- `phone`

This function runs with elevated privileges but only exposes the specified columns, preventing data leakage.

## Implementation

### 1. Run the secure function SQL
```sql
-- Run: database/secure_login_function.sql
```

This creates `get_user_email_by_phone()` function that:
- Only returns email, role, and phone
- Cannot be bypassed to access other columns
- Uses SECURITY DEFINER to bypass RLS for the function execution
- Still restricts what data is returned

### 2. Update RLS policies
```sql
-- Run: database/fix_login_rls.sql (updated)
```

This removes the insecure direct table access policy.

### 3. Update login code
The login code now uses:
```typescript
supabase.rpc('get_user_email_by_phone', { phone_number: phoneFormat })
```

Instead of:
```typescript
supabase.from("profiles").select("email, role, phone").eq("phone", phoneFormat)
```

## Security Benefits

✅ **Column-level security** - Only email, role, and phone are exposed
✅ **No sensitive data leakage** - Other profile fields are protected
✅ **Function-based access** - Cannot be bypassed with direct queries
✅ **Maintains functionality** - Login still works as expected

## Migration Steps

1. **Run secure function SQL**:
   ```sql
   -- In Supabase SQL Editor
   -- Run: database/secure_login_function.sql
   ```

2. **Remove insecure policy** (if exists):
   ```sql
   DROP POLICY IF EXISTS "Public can read email and role by phone for login" ON public.profiles;
   ```

3. **Deploy updated code**:
   - Code already updated to use the function
   - Push to GitHub and deploy

4. **Test login**:
   - Verify login still works
   - Verify only email/role/phone are accessible

## Verification

Test that the function works:
```sql
-- Should return only email, role, phone
SELECT * FROM get_user_email_by_phone('0587654321');

-- Should NOT be able to access other columns
-- This query will fail for anonymous users:
SELECT full_name, id_number FROM profiles WHERE phone = '0587654321';
```

## Files Changed

- ✅ `database/secure_login_function.sql` - New secure function
- ✅ `database/fix_login_rls.sql` - Updated to use function
- ✅ `database/rls_policies.sql` - Removed insecure policy
- ✅ `src/modules/auth/pages/Login.tsx` - Updated to use function

