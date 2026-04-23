# Computer Lab Records App

A production-style starter for a **computer lab record system** built with **Next.js**, **Supabase**, and **Netlify**.

## Features

- Auth with Supabase
- Two roles:
  - `lab_assistant`: add/edit/delete records
  - `viewer`: principal/head can only view
- Track all PCs in each lab
- Record hardware/software issues
- Maintain lab session register
- Store teacher, CR, and assistant sign values
- Dashboard and reporting pages
- Netlify deployment config included

## Tech stack

- Next.js App Router
- TypeScript
- Supabase Auth + Postgres + RLS
- Tailwind CSS v4
- Netlify deployment plugin for Next.js

## 1) Create Supabase project

Create a Supabase project and copy these values:

- Project URL
- Publishable key (anon key)
- Service role key

## 2) Add environment variables

Copy `.env.example` to `.env.local` and fill in your keys.

```bash
cp .env.example .env.local
```

## 3) Run SQL in Supabase

Open **Supabase SQL Editor** and run:

1. `supabase/schema.sql`
2. Sign up the users from the app login page
3. `supabase/seed-demo.sql`

The signup trigger creates a row in `public.profiles` automatically.

## 4) Install and run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## 5) Deploy to Netlify

### Option A: Git-based deploy

1. Push this project to GitHub
2. Import repository into Netlify
3. Add these environment variables in Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_NAME`
4. Deploy

### Option B: Manual deploy

Netlify supports Git-based and manual deploy flows. For ongoing updates, Git-based deploy is easier.

## Role setup

By default, every new user is created as `viewer`.

To make yourself the lab assistant, update your profile in Supabase SQL:

```sql
update public.profiles
set role = 'lab_assistant'
where id = (select id from auth.users where email = 'your-email@example.com' limit 1);
```

## Suggested workflow

- You log in as `lab_assistant`
- Head/principal logs in as `viewer`
- You add sessions, PC issues, and status changes
- Head/principal checks reports only

## Notes

- Signature fields are currently stored as text values.
- You can later upgrade to image upload or a drawn signature pad with Supabase Storage.
- If you want printable PDFs, add a PDF export route in the next version.

## Next improvements

- Add edit/delete buttons
- Add search and filters
- Add printable reports
- Add signature canvas upload
- Add CSV export
- Add attendance or class strength field
