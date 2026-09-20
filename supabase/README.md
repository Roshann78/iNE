# Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in the Supabase dashboard
3. Paste the contents of `schema.sql` and click **Run**
4. Go to **Settings → API** and copy:
   - **Project URL** → use as `SUPABASE_URL`
   - **anon/public key** → use as `SUPABASE_KEY`
5. Add these to your backend `.env` file
