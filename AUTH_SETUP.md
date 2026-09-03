# Gatekeeper account setup

Gatekeeper uses Supabase Auth and one database row per user. The site still works with browser storage until the values in `.env` are configured.

## 1. Create the Supabase project

Create a project at https://supabase.com, then open **Project Settings > API**. Copy the **Project URL** and the **anon public key** into your local `.env` file or your Vercel environment variables:

```js
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
```

The anon key is safe to use in browser code. Never put a service role key in this website.

## 2. Create the progress table

In Supabase **SQL Editor**, run:

```sql
create table public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ticks jsonb not null default '{}'::jsonb,
  extra_days jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

create policy "Users can read their own progress"
on public.user_progress for select
using (auth.uid() = user_id);

create policy "Users can create their own progress"
on public.user_progress for insert
with check (auth.uid() = user_id);

create policy "Users can update their own progress"
on public.user_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## 3. Configure email sign-up

In **Authentication > Providers > Email**, keep Email enabled. For the simplest launch, disable **Confirm email**. If it stays enabled, users must click the confirmation email before signing in.

Add the deployed site URL in **Authentication > URL Configuration > Site URL**. For local testing, also add `http://localhost:8000` to Redirect URLs.

## 4. Deploy

The included Vercel build runs `npm run build`, which creates the ignored `js/config.js` file from Vercel environment variables. Never commit `.env` or `js/config.js`. The site loads the Supabase browser library from jsDelivr, so deployment needs internet access.

### Push to GitHub

From this folder, run:

```powershell
git init
git add .
git commit -m "Prepare Gatekeeper for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Do not run `git add .env`. The `.gitignore` file protects it, but check with `git status` before pushing.

### Deploy on Vercel

1. Open https://vercel.com and sign in with GitHub.
2. Select **Add New > Project**, then import your Gatekeeper repository.
3. Leave the framework as **Other**. The included `vercel.json` already sets the build command and output directory.
4. Open **Environment Variables** and add `SUPABASE_URL` and `SUPABASE_ANON_KEY` for **Production**, **Preview**, and **Development** as needed. Use the Supabase **anon public** key only.
5. Click **Deploy**. Vercel runs `npm run build` and generates `js/config.js` during deployment.
6. Copy the live Vercel URL. In Supabase, open **Authentication > URL Configuration**, set it as **Site URL**, and add it to **Redirect URLs**.
7. Open the live `/auth.html`, create an account, and tick a lecture. Confirm the progress row appears in Supabase **Table Editor > user_progress**.

For future changes, push to GitHub and Vercel will redeploy automatically. If you change Supabase credentials, update the Vercel environment variables and redeploy.
