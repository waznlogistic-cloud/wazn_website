# 🧪 Local Testing Guide

## ✅ Step 1: Start Dev Server

The dev server should be starting. Check your terminal - you should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**If not running, start it:**
```bash
npm run dev
```

---

## ✅ Step 2: Open Login Page

1. Open browser: **http://localhost:5173/login**
2. You should see the login form

---

## ✅ Step 3: Test Login

**Test Credentials:**
- Phone: `0512345678` (or `0587654321`)
- Password: (the password you set during registration)

**What to Watch:**
1. **Browser Console** (F12 → Console tab):
   - Look for "Trying phone format: ..." logs
   - Look for "Found profile: ..." logs
   - Look for any red error messages

2. **Debug Panel** (below login form):
   - Shows step-by-step what's happening
   - Shows errors if any occur

3. **Network Tab** (F12 → Network tab):
   - Check if RPC call to `get_user_email_by_phone` is made
   - Check response status (should be 200)
   - Check response data

---

## 🔍 Debugging Checklist

### If RPC call fails:
- [ ] Check browser console for error message
- [ ] Check Network tab for failed request
- [ ] Verify function exists in Supabase (run `database/verify_rpc_permissions.sql`)
- [ ] Check if function has correct permissions

### If profile not found:
- [ ] Check console logs for "Trying phone format"
- [ ] Verify phone number exists in `profiles` table
- [ ] Check exact phone format in database vs what you're entering

### If login fails after finding profile:
- [ ] Check if email matches what's in database
- [ ] Check if password is correct
- [ ] Check console for "Invalid login credentials" error

---

## 📝 What to Share

When testing, share:
1. **Console logs** - Copy all console output
2. **Network requests** - Screenshot of Network tab showing RPC call
3. **Debug panel text** - What shows in the debug panel
4. **Any error messages** - Full error text

---

## 🚀 Quick Test Commands

**Check if server is running:**
```bash
curl http://localhost:5173
```

**Check environment variables:**
```bash
cat .env
```

**Restart dev server:**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

