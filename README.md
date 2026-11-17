# Class Schedule Builder

A React web application that helps students create, view, edit, save, and print
weekly class schedules while preventing time conflicts.

Built with **React + Vite + Tailwind CSS**, backed by **Supabase**
(PostgreSQL with Row Level Security, and Supabase Auth).

## Features

- Register, sign in, and sign out
- Manage subjects (code, name, instructor, room, display color)
- Assign weekly class sessions to subjects
- Weekly timetable view (desktop grid and mobile-friendly list)
- Same-day time-conflict detection before saving a session
- Data saved to the cloud, available on any device after signing in
- Print or save the weekly timetable as a PDF via the browser print dialog

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (normally `http://localhost:5173`).

## Supabase configuration

The app requires two environment variables. Copy `.env.example` to `.env.local`
and fill in the values from your Supabase project (**Connect** panel or API
settings — Project URL and Publishable key):

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Without them the app shows a configuration screen instead of crashing.

Then run the database setup: open **Supabase Dashboard → SQL Editor → New
query**, paste the contents of [`supabase/setup.sql`](supabase/setup.sql), and
run it. This creates the `subjects` and `class_sessions` tables with indexes
and Row Level Security policies.

> **Security:** never put a Supabase `service_role` key, database password, or
> other server secret in a `VITE_` variable or in frontend code. The
> publishable key is safe in the browser only because RLS policies restrict
> every table to the owning user. Test RLS with two separate accounts.

## Production build

```bash
npm run build
npm run preview
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the source with oxlint |
