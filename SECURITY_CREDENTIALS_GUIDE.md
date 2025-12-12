# 🔒 Security Guide: Credentials Management

## Current Status

✅ **Good News**: Based on git history analysis:
- No `.env` files containing credentials appear to have been committed to the repository
- No credential patterns found in git history
- Documentation files have been updated to remove exposed test credentials

However, it's important to follow security best practices to ensure credentials remain secure.

## Security Checklist

### ✅ Already Protected

1. **`.gitignore` Configuration**
   - `.env` files are properly ignored
   - `.env.local` files are ignored
   - `.env.production` files are ignored
   - Pattern `*.local` catches all local files

2. **No Credentials in Git History**
   - Verified: No `.env` files found in git history
   - Verified: No credential patterns found in committed files

### ⚠️ Important Security Practices

1. **Never Commit Credentials**
   - ✅ `.env` files are gitignored
   - ✅ Use `.env.example` for templates (without real values)
   - ✅ Never add `.env.local` to git

2. **Rotate Credentials If Exposed**
   - If credentials were ever committed (even if later removed), rotate them immediately
   - Supabase: Generate new API keys in Supabase Dashboard
   - Aramex: Request new API credentials from Aramex
   - Tap Payments: Generate new keys in Tap Payments Dashboard
   - Mrsool: Request new API key from Mrsool

3. **Use Environment Variables**
   - All credentials are stored in `.env.local` (gitignored)
   - Never hardcode credentials in source code
   - Use `import.meta.env.VITE_*` to access environment variables

## If Credentials Were Committed (Remediation Steps)

If you discover that credentials were committed to git history:

### Step 1: Rotate All Credentials Immediately

1. **Supabase**
   - Go to Supabase Dashboard → Settings → API
   - Generate new `anon` key
   - Update `.env.local` with new key

2. **Aramex**
   - Contact Aramex support to rotate API credentials
   - Update all credentials in `.env.local`

3. **Tap Payments**
   - Go to Tap Payments Dashboard → API Keys
   - Generate new secret/public keys
   - Update `.env.local`

4. **Mrsool**
   - Contact Mrsool support to generate new API key
   - Update `.env.local`

### Step 2: Remove from Git History (Advanced)

**⚠️ Warning**: This rewrites git history. Only do this if:
- The repository is private OR
- You coordinate with all team members
- You understand the implications

```bash
# Install git-filter-repo (recommended) or use BFG Repo-Cleaner
# Option 1: Using git-filter-repo
pip install git-filter-repo

# Remove .env files from entire git history
git filter-repo --path .env --invert-paths
git filter-repo --path .env.local --invert-paths
git filter-repo --path .env.production --invert-paths

# Force push (if repository allows)
git push origin --force --all
git push origin --force --tags
```

**Alternative: Using BFG Repo-Cleaner**
```bash
# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
java -jar bfg.jar --delete-files .env.local
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 3: Verify Removal

```bash
# Check git history for .env files
git log --all --full-history --oneline -- ".env" ".env.local"

# Search for credential patterns in history
git log --all -S "VITE_SUPABASE_URL" --oneline
git log --all -S "VITE_ARAMEX" --oneline
git log --all -S "VITE_TAP" --oneline
```

## Current `.gitignore` Configuration

```gitignore
# Environment variables
.env
.env.local
.env.production
*.local
```

This configuration ensures:
- ✅ `.env` files are never committed
- ✅ `.env.local` files are never committed
- ✅ Any file ending in `.local` is ignored
- ✅ Production environment files are ignored

## Best Practices Going Forward

1. **Always Use `.env.local`**
   - `.env.local` is gitignored
   - Contains actual credentials
   - Never commit this file

2. **Use `.env.example` for Templates**
   - Contains placeholder values
   - Safe to commit
   - Documents required environment variables

3. **Review Before Committing**
   ```bash
   # Always check what you're committing
   git status
   git diff
   
   # Verify no .env files are staged
   git diff --cached --name-only | grep -E "\.env"
   ```

4. **Use Git Hooks (Optional)**
   Create `.git/hooks/pre-commit`:
   ```bash
   #!/bin/sh
   if git diff --cached --name-only | grep -E "\.env$|\.env\.local$"; then
     echo "ERROR: Attempting to commit .env file!"
     echo "Please remove .env files from staging area."
     exit 1
   fi
   ```

5. **Regular Security Audits**
   - Periodically check git history for credentials
   - Rotate credentials regularly (every 90 days recommended)
   - Use different credentials for development/staging/production

## Environment Variables Reference

### Required Variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Optional Integration Variables
- `VITE_ARAMEX_*` (if Aramex integration enabled)
- `VITE_TAP_*` (if Tap Payments integration enabled)
- `VITE_MRSOOL_*` (if Mrsool integration enabled)

All sensitive variables should be in `.env.local` (gitignored).

## Verification Commands

Run these commands to verify no credentials are in git:

```bash
# Check for .env files in git
git ls-files | grep "\.env"

# Check git history for .env files
git log --all --full-history --oneline -- ".env"

# Search for credential patterns in code (should only find .env.example)
grep -r "VITE_SUPABASE_URL" --exclude="*.md" --exclude="node_modules" --exclude="dist"
```

## Summary

✅ **Current Status**: No credentials found in git history  
✅ **Protection**: `.gitignore` properly configured  
✅ **Best Practice**: Using `.env.local` for all credentials  

**Action Items**:
1. ✅ Verify `.gitignore` includes all `.env` patterns
2. ✅ Ensure all team members use `.env.local`
3. ⚠️ If credentials were ever exposed, rotate them immediately
4. 📝 Document credential rotation process for your team

