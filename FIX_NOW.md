# 🚨 FIX YOUR APP NOW - 3 STEPS

## Why Nothing Works:
Your Supabase database is empty. You need to create the tables first.

## Fix in 3 Minutes:

### 1️⃣ Go to Supabase (2 minutes)
- Open: https://supabase.com
- Login to your project
- Click "SQL Editor" (left sidebar)
- Click "New Query"
- Open the file `supabase-schema.sql` from your project
- Copy ALL the text
- Paste into Supabase SQL Editor
- Click "RUN" ▶️
- Wait for "Success" ✅

### 2️⃣ Add Security (30 seconds)
- Click "New Query" again in Supabase
- Open the file `supabase-policies.sql`
- Copy ALL the text
- Paste into Supabase SQL Editor
- Click "RUN" ▶️
- Wait for "Success" ✅

### 3️⃣ Initialize Data (30 seconds)
- Go to: http://localhost:5173/setup
- Click "Initialize Database" button
- Wait for green checkmark ✅
- Click "Go to Dashboard"

## ✅ DONE!
Your app now works perfectly!

---

## Still Not Working?

### Quick Checks:
1. Is your dev server running? (Should see http://localhost:5173)
2. Did you run BOTH SQL files in Supabase?
3. Did you click "Initialize Database" at /setup?

### Restart Everything:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

Then go to http://localhost:5173/setup again.
