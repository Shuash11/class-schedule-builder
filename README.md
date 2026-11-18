# Class Schedule Builder

A React web application that helps students create, view, edit, save, and print
weekly class schedules while preventing time conflicts.

Built with **React + Vite + Tailwind CSS**, backed by **Firebase**
(Cloud Firestore with security rules, and Firebase Auth).

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

## Firebase configuration

The app requires six environment variables. Copy `.env.example` to `.env.local`
and fill in the values from the **Firebase console → Project settings →
General → Your apps → SDK setup and configuration** (web app config — create a
web app if none exists yet):

```dotenv
VITE_FIREBASE_API_KEY=YOUR_WEB_APP_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_WEB_APP_ID
```

Without them the app shows a configuration screen instead of crashing.

Then prepare the Firebase project:

1. **Authentication → Sign-in method:** enable the **Email/Password**
   provider.
2. **Firestore Database:** create the database (production mode).
3. Deploy the security rules and indexes from this repository:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes --project class-schedule-builder-e1
   ```

   [`firestore.rules`](firestore.rules) restricts every document to its
   owning user; [`firestore.indexes.json`](firestore.indexes.json) defines the
   composite indexes the queries need.

> **Security:** never put a Firebase server secret (service account key,
> database password, or other admin credential) in a `VITE_` variable or in
> frontend code. The web app SDK config is safe in the browser only because
> the security rules restrict every document to the owning user. Test the
> rules with two separate accounts. Also set the Firebase password policy to
> require at least 8 characters — the form enforces this, but the Firebase
> default is 6.

### Documented limitations

- **Subject codes are best-effort unique, not transactionally unique.** The
  app checks for an existing code before create/edit, but Firestore has no
  unique constraint; two simultaneous writes could both succeed. This only
  affects the owner's own data.
- **Subject deletion is atomic up to 500 sessions.** The subject and its
  sessions are deleted in a single Firestore batch; a subject with more than
  500 sessions would exceed the batch limit.
- **Firestore has no database-level cascade when a Firebase Auth account is
  deleted** outside the app. Deleting an Auth user in the console leaves its
  Firestore documents behind; remove those manually if you delete accounts.

## Production build

```bash
npm run build
npm run preview
```

## Deployment (GitHub Pages)

The site deploys automatically on every push to `main` via
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml),
which builds the app and publishes it to GitHub Pages.

Live URL: https://shuash11.github.io/class-schedule-builder/

GitHub Pages serves the app from a repository subpath and cannot rewrite
deep links, so the app uses hash-based routing (`/#/dashboard`) and relative
asset paths (`base: './'`).

To connect your Firebase project, add these six repository secrets
(**Settings → Secrets and variables → Actions**) and re-run the deploy
workflow — the build injects them at build time:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Until the secrets exist, the deployed site shows its setup screen.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the source with oxlint |
