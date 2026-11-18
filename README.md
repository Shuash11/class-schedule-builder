# Class Schedule Builder

A React web application that helps students create, view, edit, save, and print
weekly class schedules while preventing time conflicts.

Built with **React + Vite + Tailwind CSS**, backed by **Firebase Cloud
Firestore**. This is a **non-production demo**: the Firestore rules are
intentionally open. Login/register use **Firestore documents** (`users` and
`sessions`) instead of Firebase Auth — accounts and sessions are visible in
the Firebase console. Only a random session token is kept in the browser.

## Features

- Firestore-backed demo sign-in (email + salted SHA-256 hash; no Firebase Auth)
- Manage subjects (code, name, instructor, room, display color)
- Assign weekly class sessions to subjects
- Weekly timetable view (desktop grid and mobile-friendly list)
- Same-day time-conflict detection before saving a session
- Data saved to the cloud in a shared demo project
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

Then prepare the Firebase project (no Authentication setup is needed):

1. **Firestore Database:** create the database.

> **About sign-in:** Firebase Authentication is NOT used. Register creates a
> `users/{id}` document with the email, a random salt and a SHA-256 password
> hash; login checks that document and creates a `sessions/{token}` document.
> Only the token is stored in the browser (`localStorage`). You can inspect
> both collections in the Firebase console. This is demo-grade: SHA-256 is not
> a production password KDF, and the open rules let anyone read the hashes.
> For production, use Firebase Auth (or a real backend) with owner-scoped rules.
2. Deploy the demo rules and indexes from this repository:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes --project class-schedule-builder-e1
   ```

   [`firestore.rules`](firestore.rules) is **intentionally open** for this
   non-production demo; [`firestore.indexes.json`](firestore.indexes.json)
   defines the composite indexes the queries need.

> **Security warning — demo mode:** these rules allow **anyone with the app's
> public web config to read, create, update, and delete all schedule data**.
> There is no authentication and no per-user isolation. Do not use this
> project for private data or deploy these rules to production. Never put a
> Firebase service-account key, database password, or other admin credential
> in a `VITE_` variable or in frontend code. The web SDK config (including its
> apiKey) is public-by-design client configuration.

### Documented limitations

- **Demo data and accounts are shared.** Anyone with the public config can
  read/write all collections (including user hashes); the login only labels
  the UI session, it is not a security boundary.
- **Subject codes are best-effort unique, not transactionally unique.** The
  app checks for an existing code before create/edit, but Firestore has no
  unique constraint; two simultaneous writes could both succeed.
- **Subject deletion is atomic up to 500 sessions.** The subject and its
  sessions are deleted in a single Firestore batch; a subject with more than
  500 sessions would exceed the batch limit.
- **Demo data lives in the shared Firestore project until deleted through the
  app.** Clearing this browser's demo ID only hides it from this browser — it
  does not delete the underlying public documents.

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
