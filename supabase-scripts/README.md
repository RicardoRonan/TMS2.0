# Supabase Database Setup Scripts

This folder contains individual SQL scripts to set up your Supabase database. 

**Quick Setup:** For a complete setup in one go, use the main `supabase-schema.sql` file in the root directory. It includes all scripts with failsafes and is safe to run multiple times.

**Individual Scripts:** If you prefer to run scripts individually or need to update specific parts, use the numbered scripts in this folder.

## Setup Order (Individual Scripts)

If running individually, run these scripts in your Supabase Dashboard → SQL Editor in the following order:

1. **01_users_table.sql** - Creates the users table
2. **02_users_policies.sql** - Sets up Row Level Security policies for users
3. **03_users_functions.sql** - Creates trigger function for auto-creating user profiles
4. **04_updated_at_function.sql** - Creates the updated_at trigger function (used by multiple tables)
5. **05_users_indexes.sql** - Creates indexes for the users table
6. **24_update_users_policies.sql** - **IMPORTANT:** Creates `is_admin()` function and admin policies (must run before other admin policies)
7. **06_blogs_table.sql** - Creates the blogs table
8. **07_blogs_policies.sql** - Sets up Row Level Security policies for blogs (requires is_admin() function)
9. **08_blogs_triggers.sql** - Creates triggers for the blogs table
10. **09_blogs_indexes.sql** - Creates indexes for the blogs table
11. **25_update_blogs_policies.sql** - Updates blog policies for admin access
12. **11_tutorials_table.sql** - Creates the tutorials table
13. **12_tutorials_policies.sql** - Sets up Row Level Security policies for tutorials (requires is_admin() function)
14. **13_tutorials_triggers.sql** - Creates triggers for the tutorials table
15. **14_tutorials_indexes.sql** - Creates indexes for the tutorials table
16. **15_import_sample_tutorials.sql** - (Optional) Imports sample tutorial data
17. **16_tutorial_pages_table.sql** - Creates the tutorial_pages table
18. **17_tutorial_pages_policies.sql** - Sets up RLS policies for tutorial_pages (requires is_admin() function)
19. **18_tutorial_pages_triggers.sql** - Creates triggers for tutorial_pages
20. **19_tutorial_pages_indexes.sql** - Creates indexes for tutorial_pages
21. **20_tools_table.sql** - Creates the tools table
22. **21_tools_policies.sql** - Sets up RLS policies for tools (requires is_admin() function)
23. **22_tools_triggers.sql** - Creates triggers for tools
24. **23_tools_indexes.sql** - Creates indexes for tools

**Note:** If you encounter infinite recursion errors (42P17), run **26_fix_users_policies_recursion.sql** to fix all policies at once.

## Quick Setup

You can run all scripts at once by copying and pasting them in order, or run them individually.

## Making a User an Admin

After running the setup scripts, you can make a user an admin by running:

```sql
UPDATE public.users SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

## Notes

- All scripts use `IF NOT EXISTS` and `DROP IF EXISTS` to be idempotent (safe to run multiple times)
- Row Level Security (RLS) is enabled on all tables
- The `handle_new_user()` function automatically creates a user profile when someone signs up
- The `handle_updated_at()` function automatically updates the `updated_at` timestamp on any table that uses it
- Tutorials table includes a GIN index on the tags array column for efficient tag-based searches

