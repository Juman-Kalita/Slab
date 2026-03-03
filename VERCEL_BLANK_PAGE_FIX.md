# Fix: Blank Page on Vercel Deployment

## Problem
After deploying to Vercel, you see a blank white page instead of your app.

## Root Cause
The Supabase anon key is incomplete or environment variables are not set in Vercel.

## Solution

### Step 1: Get Your CORRECT Supabase Keys

1. Go to https://supabase.com/dashboard
2. Select your project: **zlvzaowstkisfifainhe**
3. Click **Settings** (gear icon) in the left sidebar
4. Click **API** under Project Settings
5. You'll see two important values:

   **Project URL** (copy this):
   ```
   https://zlvzaowstkisfifainhe.supabase.co
   ```

   **Project API keys > anon public** (copy the FULL key):
   - This key is VERY LONG (200+ characters)
   - It starts with `eyJ`
   - It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsdnphb3dzdGtpc2ZpZmFpbmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1NjcyMzQsImV4cCI6MjAwNTE0MzIzNH0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

⚠️ **IMPORTANT**: The key in your `.env.local` file (`sb_publishable_5J0zTG9cuxZlfh4Nr4lUMg_cfGugwEO`) is INCOMPLETE. You need the full key from Supabase dashboard.

### Step 2: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project (slab-qihas)
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Add these two variables:

**Variable 1:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://zlvzaowstkisfifainhe.supabase.co`
- Environments: Check all boxes (Production, Preview, Development)
- Click **Save**

**Variable 2:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: [Paste the FULL anon key you copied from Supabase - the long one starting with `eyJ`]
- Environments: Check all boxes (Production, Preview, Development)
- Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab in Vercel
2. Find the latest deployment
3. Click the three dots (...) menu
4. Click **Redeploy**
5. Wait for deployment to complete (usually 1-2 minutes)

### Step 4: Test

1. Open your Vercel URL: https://slab-qihas.vercel.app
2. Hard refresh: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. You should now see the login page

## Still Seeing Blank Page?

### Check Browser Console for Errors

1. Right-click on the blank page
2. Click **Inspect** or **Inspect Element**
3. Click **Console** tab
4. Look for error messages (usually in red)
5. Common errors:
   - "Missing Supabase environment variables" → Variables not added to Vercel
   - "Invalid API key" → Wrong anon key
   - "Failed to fetch" → Supabase project might be paused

### Verify Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. You should see:
   - `VITE_SUPABASE_URL` = `https://zlvzaowstkisfifainhe.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (long key starting with `eyJ`)
3. Both should have all 3 environments checked

### Update Your Local .env.local File

After getting the correct key from Supabase, update your local file:

```env
VITE_SUPABASE_URL=https://zlvzaowstkisfifainhe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsdnphb3dzdGtpc2ZpZmFpbmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1NjcyMzQsImV4cCI6MjAwNTE0MzIzNH0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

(Replace the X's with your actual key from Supabase)

## Quick Checklist

- [ ] Got the FULL anon key from Supabase dashboard (starts with `eyJ`, 200+ characters)
- [ ] Added `VITE_SUPABASE_URL` to Vercel environment variables
- [ ] Added `VITE_SUPABASE_ANON_KEY` to Vercel environment variables (the full long key)
- [ ] Selected all 3 environments for both variables
- [ ] Clicked Save for both variables
- [ ] Redeployed the project from Vercel Deployments tab
- [ ] Waited for deployment to complete
- [ ] Hard refreshed the browser (Ctrl+Shift+R)

## After It Works

Once you see the login page:
1. Login with username: `admin`, password: `admin123`
2. If you see "0 inventory", go to `/setup` page to initialize inventory
3. Start using your app!

## Need More Help?

If you're still stuck:
1. Take a screenshot of the browser console errors
2. Check if your Supabase project is active (not paused)
3. Verify the database tables are created (run `supabase-setup-clean.sql` in Supabase SQL Editor)
