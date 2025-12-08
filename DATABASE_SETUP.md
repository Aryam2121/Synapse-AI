# Database Setup Guide

## Current Issue: Database Resets on Render

### Problem
The SQLite database file (`universal_ai.db`) is stored locally and **resets every time Render redeploys** your backend. This means:
- ❌ All user accounts are deleted on each deploy
- ❌ All chat history is lost
- ❌ Users must re-register after backend restarts

### Why This Happens
Render's free tier **doesn't have persistent file storage** for the app filesystem. SQLite is a file-based database, so when the container restarts, the file is recreated from scratch.

---

## Solution: Switch to PostgreSQL

### Step 1: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `synapse-ai-db`
   - **Database**: `synapse_ai`
   - **User**: `synapse_user`
   - **Region**: Same as your backend (e.g., Oregon)
   - **Plan**: **Free** (sufficient for development)
4. Click **"Create Database"**
5. Wait for it to provision (~2 minutes)
6. Copy the **"Internal Database URL"** (starts with `postgresql://`)

### Step 2: Update Backend Environment Variables

1. Go to your backend service on Render
2. Go to **Environment** tab
3. Add/Update:
   ```
   DATABASE_URL = postgresql://synapse_user:PASSWORD@dpg-xxx.oregon-postgres.render.com/synapse_ai
   ```
   (Use the Internal Database URL you copied)
4. Click **"Save Changes"** - this will trigger a redeploy

### Step 3: Install PostgreSQL Driver (Already Done)

Your `requirements.txt` already has:
```
asyncpg>=0.30.0  # PostgreSQL async driver
```

### Step 4: Test

After the backend redeploys:
1. Register a new account
2. Login
3. Test chat
4. **Trigger a manual redeploy** (to verify persistence)
5. Try logging in again - **should work!** ✅

---

## Alternative: Use External PostgreSQL

If you don't want to use Render's PostgreSQL, you can use:

### Option 1: Neon (Free PostgreSQL)
1. Go to https://neon.tech
2. Create free account
3. Create database
4. Copy connection string
5. Add to Render environment: `DATABASE_URL=postgresql://...`

### Option 2: Supabase (Free PostgreSQL)
1. Go to https://supabase.com
2. Create project
3. Get connection string from Settings → Database
4. Add to Render: `DATABASE_URL=postgresql://...`

### Option 3: ElephantSQL (Free PostgreSQL)
1. Go to https://www.elephantsql.com
2. Create free "Tiny Turtle" plan
3. Copy URL
4. Add to Render: `DATABASE_URL=postgresql://...`

---

## Current Workaround (Temporary)

Until you set up PostgreSQL, users will need to:
1. **Re-register** after each backend redeploy
2. Accept that chat history won't persist

We've added helpful messages in the UI to inform users about this.

---

## Benefits of PostgreSQL

✅ **Persistent Storage** - Data survives redeploys  
✅ **Better Performance** - Optimized for concurrent connections  
✅ **Scalability** - Handles more users  
✅ **Backups** - Automatic backups on Render  
✅ **Production Ready** - Used by millions of apps  

---

## Migration Notes

When you switch to PostgreSQL:
- The database tables will be created automatically on first run
- Your existing SQLite data will **not** transfer (it's empty anyway due to resets)
- All future data will persist properly

---

## Questions?

- **Q: Will this cost money?**  
  A: No! Render's free PostgreSQL tier is sufficient for development.

- **Q: How long does setup take?**  
  A: ~5 minutes total

- **Q: Will users need to re-register?**  
  A: Yes, one last time when you switch. After that, accounts persist forever.

- **Q: Can I test locally first?**  
  A: Yes! Install PostgreSQL locally or use Docker, then update your local `.env` file.
