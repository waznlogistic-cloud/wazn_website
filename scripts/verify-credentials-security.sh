#!/bin/bash

# Security Verification Script
# Checks if any credentials have been committed to git history

echo "🔒 Checking for credentials in git history..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Verify .env files are gitignored
echo "1. Checking if .env files are gitignored..."
if git check-ignore .env .env.local .env.production > /dev/null 2>&1; then
    echo -e "${GREEN}✅ .env files are properly gitignored${NC}"
else
    echo -e "${RED}❌ WARNING: Some .env files are NOT gitignored!${NC}"
fi
echo ""

# Check 2: Check if .env files are tracked
echo "2. Checking if .env files are tracked in git..."
TRACKED_ENV=$(git ls-files | grep -E "\.env$|\.env\.local$|\.env\.production$")
if [ -z "$TRACKED_ENV" ]; then
    echo -e "${GREEN}✅ No .env files are tracked in git${NC}"
else
    echo -e "${RED}❌ WARNING: The following .env files are tracked:${NC}"
    echo "$TRACKED_ENV"
fi
echo ""

# Check 3: Check git history for .env files
echo "3. Checking git history for .env files..."
ENV_IN_HISTORY=$(git log --all --full-history --oneline -- ".env" ".env.local" ".env.production" 2>/dev/null)
if [ -z "$ENV_IN_HISTORY" ]; then
    echo -e "${GREEN}✅ No .env files found in git history${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: .env files found in git history:${NC}"
    echo "$ENV_IN_HISTORY"
    echo ""
    echo -e "${RED}ACTION REQUIRED: Rotate all credentials immediately!${NC}"
fi
echo ""

# Check 4: Search for credential patterns in git history
echo "4. Searching for credential patterns in git history..."
CREDENTIAL_PATTERNS=(
    "VITE_SUPABASE_URL.*=.*http"
    "VITE_SUPABASE_ANON_KEY.*=.*eyJ"
    "VITE_ARAMEX.*=.*[A-Za-z0-9]"
    "VITE_TAP.*=.*sk_"
    "VITE_MRSOOL.*=.*eyJ"
)

FOUND_CREDENTIALS=false
for pattern in "${CREDENTIAL_PATTERNS[@]}"; do
    MATCHES=$(git log --all -S "$pattern" --oneline 2>/dev/null | head -5)
    if [ ! -z "$MATCHES" ]; then
        echo -e "${YELLOW}⚠️  Found potential credentials matching: $pattern${NC}"
        echo "$MATCHES"
        FOUND_CREDENTIALS=true
    fi
done

if [ "$FOUND_CREDENTIALS" = false ]; then
    echo -e "${GREEN}✅ No credential patterns found in git history${NC}"
else
    echo ""
    echo -e "${RED}ACTION REQUIRED: Review these commits and rotate credentials if exposed!${NC}"
fi
echo ""

# Check 5: Verify .env.example exists and doesn't contain real credentials
echo "5. Checking .env.example..."
if [ -f ".env.example" ]; then
    REAL_CREDS=$(grep -E "VITE_SUPABASE_URL.*=.*https://.*\.supabase\.co|VITE_SUPABASE_ANON_KEY.*=.*eyJ[a-zA-Z0-9]{100,}" .env.example 2>/dev/null)
    if [ -z "$REAL_CREDS" ]; then
        echo -e "${GREEN}✅ .env.example contains only placeholders${NC}"
    else
        echo -e "${RED}❌ WARNING: .env.example may contain real credentials!${NC}"
        echo "$REAL_CREDS"
    fi
else
    echo -e "${YELLOW}⚠️  .env.example not found${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Security Check Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If any warnings were found:"
echo "1. Rotate all exposed credentials immediately"
echo "2. Review SECURITY_CREDENTIALS_GUIDE.md for remediation steps"
echo "3. Consider using git-filter-repo to remove from history (if repository is private)"
echo ""
echo "✅ Best practices:"
echo "   - Always use .env.local for credentials (gitignored)"
echo "   - Never commit .env files"
echo "   - Use .env.example for templates only"
echo "   - Rotate credentials regularly"

