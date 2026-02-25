# Vercel Deployment Guide

## Error: Missing Supabase Environment Variables

If you see this error after deploying to Vercel:
```
Uncaught Error: Missing Supabase environment variables
```

This means you need to add your Supabase credentials to Vercel.

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your project (Material Rental Pro / Slab)
3. Click on "Settings" tab

### Step 2: Add Environment Variables
1. In Settings, click on "Environment Variables" in the left sidebar
2. Add the following variables:

**Variable 1:**
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://zlvzaowstkisfifainhe.supabase.co`
- **Environment**: Select all (Production, Preview, Development)

**Variable 2:**
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `sb_publishable_5J0zTG9cuxZlfh4Nr4lUMg_cfGugwEO`
- **Environment**: Select all (Production, Preview, Development)

### Step 3: Redeploy
1. After adding the variables, go to "Deployments" tab
2. Click on the three dots (...) next to your latest deployment
3. Click "Redeploy"
4. Wait for the deployment to complete

### Step 4: Verify
1. Open your Vercel URL
2. You should now see the login page instead of the error
3. Login with: username: `admin`, password: `admin123`

## Important Notes

⚠️ **Security Warning**: The anon key shown above is a publishable key and is safe to expose in client-side code. However, make sure your Supabase Row Level Security (RLS) policies are properly configured.

⚠️ **Database Setup**: After deploying, you need to:
1. Run the SQL script in Supabase SQL Editor: `supabase-setup-clean.sql`
2. Visit your-app-url/setup to initialize inventory

## Alternative: Using Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste: https://zlvzaowstkisfifainhe.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste: sb_publishable_5J0zTG9cuxZlfh4Nr4lUMg_cfGugwEO

# Redeploy
vercel --prod
```

## Troubleshooting

### Still seeing the error after adding variables?
1. Make sure you selected all environments (Production, Preview, Development)
2. Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache
4. Redeploy the project

### Variables not showing up?
1. Check that variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Make sure there are no extra spaces in the values
3. Verify you clicked "Save" after adding each variable

### App loads but shows "0 inventory"?
1. You need to run the database setup script in Supabase
2. Go to Supabase Dashboard → SQL Editor
3. Paste and run the contents of `supabase-setup-clean.sql`
4. Then visit your-app-url/setup to initialize inventory

## Quick Reference

**Your Supabase Project URL**: https://zlvzaowstkisfifainhe.supabase.co
**Supabase Dashboard**: https://supabase.com/dashboard/project/zlvzaowstkisfifainhe

**Default Login Credentials**:
- Username: `admin`
- Password: `admin123`

## Next Steps After Deployment

1. ✅ Add environment variables to Vercel
2. ✅ Redeploy the application
3. ✅ Run database setup script in Supabase
4. ✅ Visit /setup page to initialize inventory
5. ✅ Login and start using the app
6. 🔒 Consider changing the default admin password in the code
