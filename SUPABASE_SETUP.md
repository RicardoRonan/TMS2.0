# Supabase Setup Instructions

## Step 1: Run Database Schema

You have two options:

### Option A: Run Complete Setup (Recommended)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `wayjokwfywehqfzvtnan`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of `supabase-schema.sql`
6. Click **Run** (or press Ctrl+Enter)

**This single file includes everything with failsafes - safe to run multiple times!**

### Option B: Run Individual Scripts
If you prefer to run scripts individually, use the scripts in the `supabase-scripts` folder in order:
- `01_users_table.sql`
- `02_users_policies.sql`
- `03_users_functions.sql`
- `04_updated_at_function.sql`
- `05_users_indexes.sql`
- `06_blogs_table.sql`
- `07_blogs_policies.sql`
- `08_blogs_triggers.sql`
- `09_blogs_indexes.sql`

**Note:** See `supabase-scripts/README.md` for detailed information about each script.

### What Gets Created:
- `users` table with proper structure
- `blogs` table with proper structure
- Row Level Security (RLS) policies for both tables
- Automatic user profile creation trigger
- Updated timestamp triggers
- Performance indexes

**All scripts include failsafes - safe to run multiple times without errors!**

## Step 2: Create .env File

**IMPORTANT:** You must create a `.env` file in the root of your project. The `.env` file is gitignored for security.

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=https://wayjokwfywehqfzvtnan.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheWpva3dmeXdlaHFmenZ0bmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjE3MjcsImV4cCI6MjA3ODI5NzcyN30.fn8flPm8vAxcqqbjooA8KiOLuzzM4pZhxTj8Xrc2VOg
```

**Quick fix:** You can copy `env.example` to `.env` and update the values, or create it manually.

**After creating the .env file, restart your dev server** (`npm run dev`) for the changes to take effect.

## Step 3: Configure Google OAuth (Optional)

If you want to enable Google sign-in:

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Find **Google** and click **Enable**
3. You'll need:
   - Google OAuth Client ID
   - Google OAuth Client Secret
4. Add redirect URL: `https://wayjokwfywehqfzvtnan.supabase.co/auth/v1/callback`
5. In Google Cloud Console, add this redirect URI to your OAuth credentials

## Step 4: Test the Integration

1. Start your dev server: `npm run dev`
2. Try signing up with email/password
3. Check your Supabase Dashboard → **Authentication** → **Users** to see the new user
4. Check **Table Editor** → **users** to see the user profile

## Step 5: Make a User Admin (Optional)

To make a user an admin, run this in SQL Editor:

```sql
UPDATE public.users 
SET is_admin = TRUE 
WHERE email = 'your-admin-email@example.com';
```

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env` file exists in project root
- Restart your dev server after creating/updating `.env`
- Check that variable names start with `VITE_`

### User profile not created automatically
- Check that the trigger was created successfully
- Verify in SQL Editor that `handle_new_user()` function exists
- Check Supabase logs for any errors

### Authentication not working
- Verify your Supabase URL and anon key are correct
- Check browser console for errors
- Ensure RLS policies are enabled on the users table

## Next Steps

After authentication is working, you may want to:
- Migrate other Firestore collections (blogs, tools, tutorials, etc.)
- Set up Supabase Storage for file uploads
- Configure additional OAuth providers
- Set up email templates in Supabase Dashboard

