# 🚀 Wazn Platform - Setup Guide

Complete setup guide for the Wazn logistics platform.

## 📋 Quick Start

### 1. Clone and Install
```bash
git clone <repo-url>
cd wazn_website
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** `.env.local` is gitignored and is the recommended file for local development. Vite automatically loads `.env.local` with highest priority.

### 3. Database Setup
Run SQL scripts in Supabase SQL Editor (in order):
1. `database/schema.sql` - Base tables
2. `database/schema_enhanced.sql` - Payment tables
3. `database/rls_policies.sql` - Base security
4. `database/rls_policies_enhanced.sql` - Payment security
5. `database/storage_setup.sql` - File storage
6. `database/triggers.sql` - Auto-updates
7. `database/fix_login_rls.sql` - Login function
8. `database/integrations_schema.sql` - Integration fields

### 4. Run Development Server
```bash
npm run dev
```

## 📚 Documentation

- **README.md** - Project overview
- **docs/** - Detailed documentation
  - `ARCHITECTURE.md` - System architecture
  - `API.md` - API documentation
  - `DEPLOYMENT.md` - Deployment guide
  - `INTEGRATIONS.md` - Integration APIs
  - `INTEGRATION_SETUP.md` - Integration setup
  - `VERCEL_SETUP.md` - Vercel deployment

## 🗄️ Database Files

**Core Schema:**
- `schema.sql` - Base tables
- `schema_enhanced.sql` - Payment tables
- `rls_policies.sql` - Security policies
- `rls_policies_enhanced.sql` - Payment security
- `triggers.sql` - Auto-update triggers
- `storage_setup.sql` - Storage buckets

**Setup Scripts:**
- `fix_login_rls.sql` - Secure login function
- `integrations_schema.sql` - Integration fields
- `cleanup.sql` - Drop all tables (fresh start)

**Documentation:**
- `ERD.md` - Entity Relationship Diagram

## 🔧 Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

## 📖 See Also

- [README.md](./README.md) - Project overview
- [docs/](./docs/) - Detailed documentation
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

