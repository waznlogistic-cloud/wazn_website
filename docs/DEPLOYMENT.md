# Deployment Guide

## Prerequisites

- Supabase project configured
- Environment variables set
- Database migrations applied

## Build Process

1. Install dependencies:
```bash
npm install
```

2. Build for production:
```bash
npm run build
```

3. The `dist` folder contains production-ready files

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key (optional, for address picker)

## Deployment Platforms

### Vercel

1. Connect your GitHub repository
2. Add environment variables in Project Settings
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

### Netlify

1. Connect your GitHub repository
2. Add environment variables in Site Settings
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy

### Other Platforms

Follow the platform's documentation for:
- Setting environment variables
- Configuring build commands
- Setting output directory to `dist`

## Database Setup

Ensure all database migrations are applied:

1. Run `database/schema.sql` - Base tables
2. Run `database/schema_enhanced.sql` - Payment tables
3. Run `database/rls_policies.sql` - Base RLS policies
4. Run `database/rls_policies_enhanced.sql` - Payment RLS policies
5. Run `database/fix_login_rls.sql` - Login RLS function
6. Run `database/storage_setup.sql` - Storage buckets
7. Run `database/triggers.sql` - Auto-update triggers
8. Run `database/integrations_schema.sql` - Integration fields (Aramex, Tap Payments, Mrsool)

## Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Test authentication flow
- [ ] Verify database connections
- [ ] Test order creation
- [ ] Verify file uploads work
- [ ] Check error handling
- [ ] Verify all routes work correctly

