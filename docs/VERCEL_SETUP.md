# Vercel Deployment Setup

## Environment Variables

**CRITICAL:** You must set these environment variables in Vercel:

1. Go to your Vercel project → Settings → Environment Variables
2. Add the following:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key (optional)
```

3. **Important:** After adding variables, redeploy your project

## Build Configuration

Vercel should auto-detect Vite, but verify:

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## Common Issues

### White Page

1. **Check Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set
3. Redeploy after adding variables

### Routing Issues

The `vercel.json` file handles SPA routing. If routes don't work:
- Check that `vercel.json` exists in the root
- Verify the rewrite rule is correct

### Build Errors

Check Vercel build logs:
- Go to Deployments → Click on failed deployment → View logs
- Common issues:
  - Missing dependencies
  - TypeScript errors
  - Environment variable issues

## Verification Checklist

- [ ] Environment variables set in Vercel
- [ ] `vercel.json` file exists
- [ ] Build completes successfully
- [ ] Landing page loads
- [ ] Login page works
- [ ] Routes navigate correctly

