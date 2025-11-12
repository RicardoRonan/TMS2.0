# Netlify Environment Variables Setup

This guide will help you configure your Netlify deployment to use environment variables.

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon public** key → This is your `VITE_SUPABASE_ANON_KEY`

## Step 2: Set Environment Variables in Netlify

### Option A: Via Netlify Dashboard (Recommended)

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site configuration** → **Environment variables** (or **Site settings** → **Environment variables**)
4. Click **Add variable** for each variable:

   **Variable 1:**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://your-project-id.supabase.co` (your Supabase Project URL)
   - **Scopes:** Select **All scopes** (or at least **Production** and **Deploy previews**)

   **Variable 2:**
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** Your Supabase anon key (the long string starting with `eyJ...`)
   - **Scopes:** Select **All scopes** (or at least **Production** and **Deploy previews**)

5. Click **Save**

### Option B: Via Netlify CLI

If you have Netlify CLI installed:

```bash
# Set production environment variables
netlify env:set VITE_SUPABASE_URL "https://your-project-id.supabase.co" --context production
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key-here" --context production

# Set for all contexts (production, deploy previews, branch deploys)
netlify env:set VITE_SUPABASE_URL "https://your-project-id.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key-here"
```

## Step 3: Trigger a New Deploy

After setting the environment variables, you need to trigger a new build:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Or push a new commit to your repository

**Important:** Environment variables are only available during the build process. You must rebuild your site after adding/changing environment variables.

## Step 4: Verify the Deployment

After deployment:

1. Open your live site
2. Open browser DevTools (F12) → Console tab
3. You should see: `✅ Supabase client initialized`
4. Check that your Supabase data loads correctly

## Troubleshooting

### Variables not working?

1. **Check variable names:** They must start with `VITE_` (Vite requirement)
2. **Check scopes:** Make sure variables are set for the correct context (Production, Deploy previews, etc.)
3. **Rebuild required:** Environment variables are baked into the build - you must redeploy after adding/changing them
4. **Check build logs:** In Netlify → Deploys → Click on a deploy → Check the build logs for any errors

### How to check if variables are set:

1. Go to Netlify Dashboard → Your Site → **Site configuration** → **Environment variables**
2. You should see both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` listed

### Variables are set but still not working?

1. Make sure you **redeployed** after setting the variables
2. Check that variable values don't have extra spaces or quotes
3. Verify the Supabase URL format: `https://xxxxx.supabase.co`
4. Check browser console for specific error messages

## Additional Environment Variables (Optional)

If you use other services, you can also set:

- `VITE_IMGBB_API_KEY` - For image uploads
- `VITE_BRANDFETCH_CLIENT_ID` - For logo fetching
- `VITE_CHAT_WEBHOOK_URL` - For chat webhooks

These follow the same setup process above.

## Security Notes

- ✅ Environment variables starting with `VITE_` are **public** - they're included in the client bundle
- ✅ This is safe for Supabase anon keys (they're designed to be public)
- ❌ Never put secret keys (like service role keys) in `VITE_` variables
- ✅ Use Netlify's environment variable encryption for sensitive data

## Quick Reference

**Required Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

**Where to find them:**
- Supabase Dashboard → Settings → API

**Where to set them:**
- Netlify Dashboard → Site configuration → Environment variables

**After setting:**
- Trigger a new deploy (required!)

