# Quick Start Guide - Fix "Nothing Working" Issue

## The Problem
Your app shows 0 inventory because the Supabase database tables haven't been created yet.

## Solution - 3 Simple Steps:

### Step 1: Create Database Tables in Supabase

1. Go to https://supabase.com and open your project
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the ENTIRE content from `supabase-schema.sql`
5. Click "Run" button
6. Wait for success message

### Step 2: Add Security Policies

1. Still in SQL Editor, click "New Query" again
2. Copy and paste the ENTIRE content from `supabase-policies.sql`
3. Click "Run" button
4. Wait for success message

### Step 3: Initialize Inventory

1. Go to http://localhost:5173/setup in your browser
2. Click the "Initialize Database" button
3. Wait for success message
4. Click "Go to Dashboard"

## That's It!

Your app should now work perfectly with:
- ✅ All inventory showing correct stock levels
- ✅ Ability to issue materials
- ✅ Ability to record returns
- ✅ Ability to record payments
- ✅ Data persisting across page refreshes

## If You Still Have Issues:

1. **Check Supabase Connection:**
   - Make sure `.env.local` has correct URL and key
   - Restart the dev server: Stop and run `npm run dev` again

2. **Check Browser Console:**
   - Press F12 in browser
   - Look for any red error messages
   - Share them if you need help

3. **Verify Tables Were Created:**
   - In Supabase, go to "Table Editor"
   - You should see: customers, sites, materials, history_events, inventory

## Need to Start Fresh?

If you want to delete all data and start over:
1. In Supabase SQL Editor, run:
   ```sql
   DROP TABLE IF EXISTS history_events CASCADE;
   DROP TABLE IF EXISTS materials CASCADE;
   DROP TABLE IF EXISTS sites CASCADE;
   DROP TABLE IF EXISTS customers CASCADE;
   DROP TABLE IF EXISTS inventory CASCADE;
   ```
2. Then repeat Steps 1-3 above

## Current Status:
- ✅ Supabase URL configured
- ✅ Supabase Key configured
- ⚠️ Database tables need to be created (Step 1)
- ⚠️ Inventory needs to be initialized (Step 3)
