# Class Schedule Builder — UX/UI Design Specification

> **Demo-mode amendment (18 Nov 2026, owner decision):** sign-in/register are
> **optional** in this non-production app — the pages exist, the header offers
> Sign in / Sign out, but no route is protected and the Firestore rules are
> intentionally open (data works without signing in). Sign-in uses **Firestore
> `users`/`sessions` documents** (email + salted hash; token only in browser),
> NOT Firebase Auth. §4's *mandatory* auth redirects do not apply; the print
> header shows the email only when signed in. All
> other sections (tokens, subject/schedule/dashboard pages, timetable, print,
> accessibility, microcopy) remain in force.

**Version:** 1.0 · 17 Nov 2026 · Prepared by UX/UI Designer (for Implementer handoff)
**Sources:** project guide §1, §5, §8, §9 + stack constraints (React 19 + Vite, Tailwind v4 via `@tailwindcss/vite`, lucide-react, RHF+zod, JS only). All contrast ratios below were **computed** from Tailwind v4's official OKLCH palette; layout has **not** been rendered/visually verified.
**Lead decisions on open questions (§13):** (1) Monday-first display approved; (2) register = email + password + confirm only, approved; (3) A4 landscape approved; (4) SQL default `#6366f1` stays, app maps legacy values to Indigo, approved.

## 1. Product context & design direction

- **Users (demo mode):** one role — a student managing a recurring weekly class timetable. Sign-in is optional and Firestore-backed; entry is `/dashboard`, with `/login` → `/dashboard` available for the demo journey. High-frequency tasks: add/edit sessions, scan the week, print.
- **Direction (decision):** calm, functional productivity tool. Light theme only (no dark mode in v1). Near-white cool-neutral `slate` chrome, white surfaces, **indigo primary** — deliberately derived from the existing DB default `#6366F1` (indigo family), so the brand hue and the default subject color agree. No gradients, no glassmorphism, minimal shadows (borders carry structure). Color in the UI is information (subject identity, status), not decoration.
- **IA (demo mode):** `/login`, `/register` (optional Firestore-backed sign-in); `/dashboard`, `/subjects`, `/schedule` (always open — no auth guard); `/` redirects to `/dashboard`. Top nav on ≥`md`, bottom tab bar below `md`.

## 2. Design tokens

Express as Tailwind v4 utility classes (default palette — **no custom `@theme` tokens required**). Only two additions to `src/index.css`: the guide's print block extension (§9) and nothing else.

### 2.1 Semantic color roles (all verified WCAG ratios vs their pairing)

| Role | Classes | Verified contrast |
|---|---|---|
| Page background | `bg-slate-50` (#f8fafc) | — |
| Surface / card | `bg-white` + `border-slate-200` | — |
| Text primary | `text-slate-900` | 17.0:1 on slate-50 |
| Text secondary | `text-slate-600` | 7.58:1 on white |
| Text muted / helper | `text-slate-500` | 4.76:1 white, 4.55:1 slate-50 (min for small text) |
| Text disabled | `text-slate-400` + `disabled` attr (WCAG-exempt) | 2.63:1 |
| Placeholder | `placeholder:text-slate-500` | 4.55:1 on slate-50 |
| Borders / dividers | `border-slate-200` (screen), `border-slate-300` minimum in print | decorative |
| Brand/primary | `bg-indigo-600` (#4f39f6) + `text-white`; hover `bg-indigo-700` | 6.46:1 / 8.09:1 |
| Primary tint (active nav, selected) | `bg-indigo-50` + `text-indigo-700` | 7.24:1 |
| Focus indicator | `outline-2 outline-offset-2 outline-indigo-600` (2.4.7/1.4.11: 4.58:1 on white, 4.37:1 on slate-50) | pass |
| Error | solid `bg-red-600` + white (4.77:1); alert `bg-red-100` + `text-red-700` (5.27:1); field error text `text-red-600` (4.77:1); invalid border `border-red-500` (3.81:1 ≥ 3:1) | pass |
| Success | alert `bg-emerald-50` + `text-emerald-800` (7.23:1); dot `bg-emerald-600` | pass |
| Warning | alert `bg-amber-50` (#fffbeb) + `text-amber-800` (6.84:1) | pass |
| Overlay scrim | `bg-slate-900/50` | — |

Rules: never introduce raw hexes in components except the subject palette (§3); never use `text-slate-400` for informative text; never encode status by color alone (always icon + text).

### 2.2 Typography

System font stack (Tailwind v4 default `font-sans`) — decision: no webfont dependency (matches guide's dependency list, fast, prints reliably). Hierarchy:

| Role | Classes |
|---|---|
| Page title (h1) | `text-2xl font-semibold tracking-tight text-slate-900` |
| Page subtitle | `text-sm text-slate-600` (mt-1) |
| Section heading (h2) | `text-base font-semibold text-slate-900` |
| Card/block title | `text-sm font-semibold text-slate-900` (or family `-900` in subject blocks) |
| Body / form label | `text-sm text-slate-700` / `text-sm font-medium text-slate-700` |
| Meta, helper, captions | `text-xs text-slate-500` or `-600` |
| Button text | `text-sm font-medium` (sm size: `text-xs font-medium`) |
| All times, counts, stats | add `tabular-nums` |

Header spacing pattern (every page): container `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`; header block `py-6 sm:py-8 flex flex-wrap items-start justify-between gap-4`; title group = h1 + subtitle; actions right-aligned in the same row.

### 2.3 Spacing, radius, elevation, breakpoints

- **Spacing:** 4px base. Page content sections `space-y-6`; card internals `p-4 sm:p-5`; form field stacks `space-y-4`; icon↔label `gap-2`; related meta `gap-1.5`.
- **Radius:** inputs/buttons/timetable blocks `rounded-lg`; cards/day columns `rounded-xl`; modals `rounded-2xl`; dots/badges/swatches `rounded-full`.
- **Elevation:** cards & day columns flat: `border border-slate-200 bg-white shadow-xs`. Shadow only for layers above: modal panel `shadow-xl`, toast `shadow-lg`. No hover shadows on cards.
- **Breakpoints:** `sm` 640, `md` 768 (nav switch), `lg` 1024 (timetable grid switch), `xl` 1280 (3-col subjects). Reflow must be usable at 320px (single column, no horizontal scroll).

## 3. Subject color palette (8 options — the only data colors)

Stored in `subjects.color` as the **500-level hex** below. Screen rendering uses literal Tailwind v4 classes per entry (put them as string constants in `src/features/subjects/colors.js` so the JIT scanner sees them). Text treatments verified: **`-900` on `-100` ≥ 8.0:1 and `-800` on `-100` ≥ 6.3:1 for every family** (normal text ≥ 4.5:1 ✓). The solid `-500` is used only as a non-text accent (dot, 4px left border); it is never the sole carrier of meaning (code text is), so sub-3:1 solids (amber 2.13, teal 2.42, emerald 2.47, sky 2.71) are acceptable per WCAG 1.4.11.

| Name | stored hex (500) | block classes | dot/border class | text classes |
|---|---|---|---|---|
| Indigo *(default)* | `#615fff` | `bg-indigo-100 border-indigo-500 text-indigo-900` | `bg-indigo-500` | secondary `text-indigo-800` |
| Violet | `#8e51ff` | `bg-violet-100 border-violet-500 text-violet-900` | `bg-violet-500` | `text-violet-800` |
| Sky | `#00a6f4` | `bg-sky-100 border-sky-500 text-sky-900` | `bg-sky-500` | `text-sky-800` |
| Teal | `#00bba7` | `bg-teal-100 border-teal-500 text-teal-900` | `bg-teal-500` | `text-teal-800` |
| Emerald | `#00bc7d` | `bg-emerald-100 border-emerald-500 text-emerald-900` | `bg-emerald-500` | `text-emerald-800` |
| Amber | `#fe9a00` | `bg-amber-100 border-amber-500 text-amber-900` | `bg-amber-500` | `text-amber-800` |
| Orange | `#ff6900` | `bg-orange-100 border-orange-500 text-orange-900` | `bg-orange-500` | `text-orange-800` |
| Rose | `#ff2056` | `bg-rose-100 border-rose-500 text-rose-900` | `bg-rose-500` | `text-rose-800` |

- **Picker (in Subject modal):** labeled group "Color" (fieldset+legend or `role="radiogroup"` + `aria-label`); 8 `role="radio"` buttons (real `<input type="radio">` visually hidden or `aria-checked` buttons), each `h-9 w-9 rounded-full bg-{fam}-500` with `aria-label` = name. Selected: `ring-2 ring-indigo-600 ring-offset-2` **plus** a white badge at top-right (`absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white ring-1 ring-slate-300` containing Check `h-2.5 w-2.5 text-slate-900`). Do **not** draw the check directly on the solid — it fails 3:1 on indigo/violet/rose (measured 2.5:1). Default selection: Indigo. Zod enum over the 8 names/hexes.
- **Legacy fallback:** any stored color not in the palette (e.g., guide's `#6366f1`) renders as **Indigo**. Do not change the SQL default; the app maps it.

## 4. App shell & navigation (authenticated pages)

- **Top header** (all screens ≥`md`; entire header `no-print`): `sticky top-0 z-30 border-b border-slate-200 bg-white`; inner container row `h-16 flex items-center justify-between gap-4`.
  - Left: logo lockup — `h-8 w-8 rounded-lg bg-indigo-600 grid place-items-center` + CalendarDays `h-4.5 w-4.5 text-white` + app name `text-base font-semibold tracking-tight` (name hidden below `sm`).
  - Center/right nav (visible ≥`md`): three NavLinks — Dashboard (LayoutDashboard), Subjects (BookOpen), Schedule (CalendarDays). Item: `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium`; active: `bg-indigo-50 text-indigo-700`; inactive: `text-slate-600 hover:bg-slate-100 hover:text-slate-900`.
  - Right: user email `text-xs text-slate-500 truncate max-w-48` (≥`lg` only) + sign-out icon button (LogOut, `aria-label="Sign out"`).
- **Mobile bottom tab bar** (`md:hidden`, `no-print`): `fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]`; items = icon (h-5) + `text-xs` label, active `text-indigo-700` (+ `bg-indigo-50` pill), inactive `text-slate-600`. Targets ≥44px tall (`py-2.5`).
- **Main:** `<main class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">` (extra bottom padding clears the tab bar). Each page has exactly one `h1`.
- **Auth redirect behavior (demo mode):** schedule pages are always reachable; local sign-in → `/dashboard`; local sign-out keeps you on the current page; visiting `/login`/`/register` while signed in → `/dashboard`. No server auth or 401 handling exists.

## 5. Shared components & states (build once in `src/components/ui/`)

**Button** — variants:
- Primary: `inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700`.
- Secondary: `bg-white border border-slate-300 text-slate-700 hover:bg-slate-50`.
- Ghost icon: `h-9 w-9 grid place-items-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900` (+ required `aria-label`).
- Destructive solid: `bg-red-600 text-white hover:bg-red-700`. Destructive quiet (in dialogs): `text-red-600 hover:bg-red-50`.
- Sizes: `h-10` (md), `h-8 px-3 text-xs` (sm). Disabled (any variant): `disabled:opacity-50 disabled:pointer-events-none` + `disabled` attribute.
- **Loading:** left Loader2 `h-4 w-4 animate-spin`, label stays, button disabled. Focus: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600` (apply this exact focus pattern to **every** interactive element; do not use bare `ring` without a color — v4 rings default to `currentColor`).

**Input / Select** — `h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`. Invalid: `border-red-500` + `aria-invalid="true"`. Disabled: `bg-slate-100 text-slate-400`. Every input has a `<label htmlFor>` (`text-sm font-medium text-slate-700`); optional fields get a trailing `text-xs text-slate-500` "(optional)". Field error: plain `text-xs text-red-600` referenced by `aria-describedby`. Select: native `<select>` + ChevronDown `h-4 w-4 text-slate-500 absolute right-3 pointer-events-none`. Time: native `<input type="time">` (Step 5 min).

**Modal** (the one overlay pattern — decision: modals, not inline forms; built on **native `<dialog>` + `showModal()`** for free Esc/focus/backdrop): panel `w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl` + scrim `bg-slate-900/50` via `::backdrop`; mobile: `mx-4 max-h-[85dvh] overflow-y-auto`. Anatomy: title `text-base font-semibold` (`aria-labelledby`), optional subtitle `text-sm text-slate-600 mt-1`, form body `space-y-4 mt-4`, footer `mt-6 flex justify-end gap-3` (Cancel secondary left of primary). Close (X) ghost icon top-right `aria-label="Close"`. Esc ≡ Cancel. Focus returns to trigger on close.

**ConfirmDialog** (deletes only): max-w-md; title = "Delete {item}?"; body names consequences; footer: Cancel + destructive solid confirm.

**Alert** — `flex gap-3 rounded-lg border p-3 text-sm` with icon `h-4 w-4 mt-0.5 shrink-0`: error `bg-red-100 border-red-200 text-red-700` + CircleAlert; warning `bg-amber-50 border-amber-200 text-amber-800` + TriangleAlert; success `bg-emerald-50 border-emerald-200 text-emerald-800` + CircleCheck; info `bg-indigo-50 border-indigo-200 text-indigo-700` + Info. Errors that block an action get `role="alert"`.

**Skeleton** — `animate-pulse rounded-md bg-slate-200`; never contains text.

**EmptyState** — centered `rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center`: icon `h-10 w-10 text-slate-400 mx-auto`, title `text-sm font-semibold text-slate-900 mt-3`, description `text-sm text-slate-600 mt-1 max-w-sm mx-auto`, CTA button `mt-4`.

**Toast** — `fixed z-50 bottom-20 md:bottom-6 right-4 md:right-6 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg` + CircleCheck `h-4 w-4 text-emerald-400`; `role="status"`; auto-dismiss 3.5 s; success only (errors are inline).

**Badge** — `inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600`.

## 6. Page specifications

### 6.1 `/login` and `/register` (shared auth shell)
- Layout: `min-h-dvh grid place-items-center bg-slate-50 px-4`; card `w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs`.
- Above form: logo tile `h-12 w-12 rounded-xl bg-indigo-600` + CalendarDays white `h-6 w-6` centered; app name `text-xl font-semibold text-center mt-3`; page subtitle `text-sm text-slate-600 text-center mt-1`.
- `/login` fields: Email (`type="email"`, autocomplete `email`), Password (`type="password"`, autocomplete `current-password`, show/hide toggle: ghost icon inside input, Eye/EyeOff, `aria-label="Show password"/"Hide password"`, `aria-pressed`). Primary submit "Sign in" full-width (`w-full mt-2`).
- `/register` fields: Email, Password (helper: "Use at least 8 characters."), Confirm password (autocomplete `new-password` both). Submit "Create account". **Lead decision:** no display-name field.
- States: default; **submitting** (spinner, disabled); **error** — credential failure: error Alert above submit, "Incorrect email or password. Try again."; network: "Couldn't sign in. Check your connection and try again."; email-in-use: "An account with this email already exists. Try signing in."; field-level: required, valid email, ≥8 chars, passwords match. Focus the first invalid field on failed submit. Footer swap-link between the two pages (`text-sm text-indigo-600 hover:underline`).

### 6.2 `/dashboard` — "Dashboard" · subtitle "Your week at a glance."
- Header actions: secondary "Manage subjects" (`/subjects`), primary "View schedule" (`/schedule`). (Links only — modals live on their own pages.)
- **Stats row** (each is `rounded-xl border bg-white p-4`): grid `grid-cols-1 gap-4 sm:grid-cols-3`. Tile = label `text-xs text-slate-500`, value `text-2xl font-semibold tabular-nums text-slate-900 mt-1`, sub `text-xs text-slate-500 mt-0.5`. Values: **Subjects** (count), **Weekly sessions** (count), **Busiest day** ("Wed" + "4 sessions" sub, else "—").
- **Today's classes** section (h2): rows = `flex items-center gap-3 rounded-lg border-l-4 {family tint bg} p-3` — time `text-sm font-medium tabular-nums {fam}-900`, code `text-sm font-semibold`, room · instructor `text-xs {fam}-800 truncate`. Empty (has data, none today): quiet line `text-sm text-slate-600` "No classes today."
- **Coming up this week** (h2): next 5 occurrences after today (day name + time + code + room); row `flex justify-between rounded-lg border bg-white p-3` — left: day `text-sm font-medium text-slate-900` + code/time `text-xs text-slate-600`; right: ChevronRight icon muted. Empty: "Nothing else this week."
- **Onboarding empty state (0 subjects)** replaces sections: EmptyState (BookOpen icon) "Let's set up your schedule" / "Add a subject with its code, instructor, and room — then schedule its class times." / primary "Add your first subject" → `/subjects`.
- **Loading:** 3 skeleton stat tiles + 2 skeleton rows. **Error:** error Alert + secondary "Retry".

### 6.3 `/subjects` — "Subjects" · subtitle "Your courses for this term."
- Header action: primary "+ Add subject" → SubjectModal (create mode).
- Grid: `grid gap-4 sm:grid-cols-2 xl:grid-cols-3`.
- **SubjectCard** (`rounded-xl border border-slate-200 bg-white p-4 shadow-xs`): row 1: color dot `h-3 w-3 rounded-full {fam}-500` + code `text-sm font-semibold text-slate-900 truncate` + right actions (Edit ghost icon → modal edit mode; Trash2 ghost icon with `hover:text-red-600` → ConfirmDialog). Row 2: name `text-sm text-slate-700 line-clamp-2`. Row 3 (only if present): meta lines `flex items-center gap-1.5 text-xs text-slate-600` — User icon + instructor; MapPin icon + room. Footer: Badge (CalendarDays) "n session(s)" linking nothing.
- **Delete confirm:** "Delete {CODE}?" / "This also removes its {n} class session(s). This can't be undone." / button "Delete subject". On success: toast "Subject deleted"; its sessions disappear from Schedule (DB cascade — copy must say so).
- **States:** loading = 6 skeleton cards; error = Alert + Retry; empty = EmptyState (BookOpen) "No subjects yet" / "Add a subject with its code, instructor, and room — then schedule its class times." / primary "Add subject".
- **SubjectModal:** fields — Subject code* (placeholder "IT 101"), Subject name*, Instructor (optional), Room (optional, placeholder "Room 204 or Online"), Color* (§3 picker). zod: code/name required (≤20/≤80 chars), instructor ≤80, room ≤40, color = one of the 8. DB unique-code violation → field error under code: "You already have a subject with this code." Save → toast "Subject added"/"Subject updated". Save error (network): error Alert inside modal above footer: "Couldn't save. Check your connection and try again."

## 7. Weekly timetable (`/schedule`) — "Schedule" · subtitle "Your recurring weekly timetable."

- Header actions (`no-print`): secondary "Print" (Printer icon, `window.print()`), primary "+ Add session" → SessionModal (day defaults to **today**).
- **Display order (decision):** Monday-first, Mon→Sun; maps to stored `day_of_week` as [1,2,3,4,5,6,0]. Weekend columns stay in normal order at the end.

### 7.1 Desktop grid (≥`lg`)
- Board: `grid grid-cols-7 gap-3` (this container is the print root; see §9).
- **Day column:** `flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2`. Header: `flex items-center justify-between px-1 pb-1` — day name `text-sm font-semibold text-slate-700` + count `text-xs text-slate-500`; right: ghost icon Plus `aria-label="Add class on {Day}"`. **Today's column:** day name `text-indigo-700` + `border-b-2 border-indigo-500` on the header underline.
- **Session block** (chronological order within the column; a `<button type="button" class="w-full rounded-lg border-l-4 p-2.5 text-left transition-colors hover:brightness-[0.98]">` opening SessionModal in edit mode; accessible name: "{CODE} {Name}, {Day} {start} to {end}, {Room}, {Instructor} — edit"):
  - row 1: `flex justify-between gap-2` — code `text-sm font-semibold truncate` + time `text-xs font-medium tabular-nums whitespace-nowrap` (both `text-{fam}-900`);
  - row 2: name `truncate text-xs text-{fam}-800`;
  - row 3 (omit if both absent): `flex gap-2 text-xs text-{fam}-800 truncate` — MapPin `h-3 w-3` + room · User icon + instructor.
- **Empty day:** placeholder `<button>` filling the column body: `rounded-lg border-2 border-dashed border-slate-300 p-3 text-center text-xs text-slate-500 hover:border-indigo-400 hover:text-indigo-700`, label "+ Add class", `aria-label="Add class on {Day}"`.

### 7.2 Mobile list (<`lg`)
- Replace the grid with day **sections only for days that have sessions**: header row `flex items-center justify-between py-2` — `{Day}` `text-sm font-semibold text-slate-900` + "n classes" `text-xs text-slate-500` + ghost Plus (`aria-label` as above); then session blocks stacked full-width (`space-y-2`), same anatomy.
- After the sections, if some days are empty: one muted line `text-sm text-slate-500` "No classes on {Thu, Sat, Sun}."
- **Whole-week empty:** if 0 subjects → EmptyState (BookOpen) "Add a subject first" / "Sessions belong to a subject. Create one, then come back to plan your week." / primary "Go to subjects" (`/subjects`). If subjects exist but 0 sessions → EmptyState (CalendarDays) "Your week is clear" / "Add a class session to start building your timetable." / primary "Add session".
- **Loading:** 7 skeleton columns (or 3 skeleton day sections on mobile). **Error:** Alert + Retry.
- **Keyboard order:** DOM order = columns Mon→Sun, each column: header, add button, then session blocks in chronological order. No roving tabindex needed; natural tab order is the spec.

### 7.3 SessionModal (create/edit)
- Fields: Subject* — native select, first option "Select a subject" (disabled); Day* — select Mon…Sun (display order, stored values 1–6,0); Start time* / End time* — `type="time"`, side by side (`grid grid-cols-2 gap-3`).
- zod: all required; `end > start` (refine, message "End time must be after start time."); guide rule — touching times (end == other's start) are **not** conflicts.
- **Conflict presentation:** client-side check against loaded sessions (same day + interval overlap, **excluding the edited session's own id**), re-run on every change of day/start/end. When a conflict exists, show an error Alert between form and footer: title "Time conflict" + message: "**This overlaps with {CODE} on {Day}, {start}–{end}.** Adjust the day or times to save." (>1 conflict: "…overlaps with {CODE} and {n} other classes."). `role="alert"` + icon. Save stays enabled; submit is prevented while a conflict exists and focus moves to the alert (no mystery-disabled button).
- If user has 0 subjects: modal body replaced by Alert (info) "You need a subject before you can add sessions." + primary "Go to subjects".
- Edit mode: title "Edit session"; footer: destructive-quiet "Delete session" (left, → ConfirmDialog: "Remove this session?" / "{CODE} on {Day}, {start}–{end} will be removed. This can't be undone.") + Cancel + "Save changes". Success toasts: "Session added" / "Session updated" / "Session removed".

## 8. Print specification

- **Hides (`.no-print`, guide's class, applied to):** top header, bottom tab bar, page header action buttons, day-column add buttons, empty-day placeholders, modals/toasts.
- **Adds (print-only block at top of Schedule, `hidden print:block`):** `h1` "Weekly Class Schedule" (`text-xl font-bold`), line `text-xs` "Generated {date} · {user email}", then a wrap legend (`flex flex-wrap gap-2`): chip = dot (`h-2.5 w-2.5 rounded-full {fam}-500`) + "{CODE} {Name}" `text-xs`.
- **Page setup (extend guide's `@media print` in `index.css`):**
  ```css
  @media print { .no-print { display: none !important; } body { background: #fff; }
    @page { size: A4 landscape; margin: 12mm; } }
  ```
- **Color survival:** shared class `.print-colors { -webkit-print-color-adjust: exact; print-color-adjust: exact; }` on every session block, dot, and legend dot, so `-100` tints and `-500` accents print. **Black-text readability:** block text is `-900` on `-100` (≥8:1 measured); even desaturated/grayscale the luminance gap holds — no print-specific text recoloring needed.
- Grid integrity: board keeps `grid-cols-7` in print; column borders `print:border-slate-300`; session blocks get `print:break-inside-avoid`. Printed from mobile the list variant prints (sections + legend) — acceptable, no separate DOM.

## 9. Accessibility requirements (WCAG 2.2 AA target)

- Focus: the §5 outline pattern on all interactive elements; focus never fully obscured (sticky header has no overlapping tooltips; modals trap via native dialog).
- Labels & semantics: every input labeled; one `h1` per page; day columns are `<section>` with `aria-label="{Day}"`; timetable blocks are real buttons with descriptive names; icon buttons have `aria-label`; color picker is a radiogroup; required = label + validation, optional marked "(optional)".
- Errors: field errors via `aria-describedby` + `aria-invalid`; blocking errors `role="alert"`; toasts `role="status"`.
- Targets: all pointer targets ≥ 24px (smallest = 36px ghost icon button); bottom-tab items ≥ 44px.
- Color independence: subject color + code text always paired; conflict = icon + heading + sentence; today = text color **and** border weight.
- Reflow: usable at 320px (mobile list, stacked forms, stats 1-col); 200% text zoom without loss (no fixed-height text containers; truncation only on repeatable meta lines, never on times).
- Motion: see §10; `prefers-reduced-motion` honored; the loading spinner and skeleton pulse remain (state indicators, low intensity).

## 10. Motion (minimal, purposeful)

| Trigger | Effect | Spec |
|---|---|---|
| Hover/focus on buttons, blocks | background/border color shift | `transition-colors duration-150` (Tailwind default ease) |
| Modal open/close | scrim fade + panel fade/scale-95→100 | 150ms `ease-out` |
| Toast in/out | slide-up 8px + fade | 150ms |
| Loading | spinner `animate-spin`, skeleton `animate-pulse` | exempt |
- Reduced motion: `motion-reduce:transition-none`; modal/toast become opacity-only (`motion-reduce:transform-none`); no other animation exists to disable.

## 11. Microcopy (tone: plain, friendly, specific; sentence case; verb-first buttons; name the object + the next step)

| Context | Copy |
|---|---|
| Subjects empty | "No subjects yet" / "Add a subject with its code, instructor, and room — then schedule its class times." / [Add subject] |
| Schedule empty (no sessions) | "Your week is clear" / "Add a class session to start building your timetable." / [Add session] |
| Schedule empty (no subjects) | "Add a subject first" / "Sessions belong to a subject. Create one, then come back to plan your week." / [Go to subjects] |
| Dashboard, no classes today | "No classes today." |
| Coming-up empty | "Nothing else this week." |
| **Time conflict** | "This overlaps with {CODE} on {Day}, {start}–{end}. Adjust the day or times to save." |
| End before start | "End time must be after start time." |
| Bad credentials | "Incorrect email or password. Try again." |
| Email in use | "An account with this email already exists. Try signing in." |
| Page load error | "Couldn't load your data. Check your connection and try again." + [Retry] |
| Save error | "Couldn't save. Check your connection and try again." |
| Delete subject | "Delete {CODE}? This also removes its {n} class session(s). This can't be undone." / [Delete subject] |
| Delete session | "Remove this session? {CODE} on {Day}, {start}–{end} will be removed. This can't be undone." / [Remove session] |
| Toasts | "Subject added / Subject updated / Subject deleted / Session added / Session updated / Session removed" |

## 12. Acceptance checks (for implementation review)

1. Every list/grid page renders loading skeletons, an empty state with CTA, and an error alert with Retry.
2. All 8 palette entries show `-900`-on-`-100` blocks; picker selection is operable by keyboard and visible without color alone (ring + badge).
3. A conflicting session is blocked with the exact §11 wording naming the clashing class; back-to-back sessions save fine; editing a session never conflicts with itself.
4. At 320px: no horizontal scroll; timetable is the list variant; ≥`lg` it is the 7-column grid.
5. Print preview (desktop): landscape A4, chrome gone, title/date/legend present, colored blocks with readable dark text, no broken column borders.
6. Keyboard-only pass: login → dashboard → add subject (modal) → add session (modal, conflict shown) → tab through timetable → Esc closes modals → sign out.

## 14. Implementer notes

1. **Build order:** `index.css` (import + guide print block + `@page`) → `colors.js` palette map → ui components (Button, Input, Select, Modal, ConfirmDialog, Alert, Skeleton, EmptyState, Badge, Toast) → auth pages → shell/nav → `/subjects` + SubjectModal → `/schedule` + SessionModal + timetable → `/dashboard` → print polish. Matches guide §9 stages 1–8.
2. Tailwind v4 scans `.js` too — keep palette class strings **literal** in `colors.js`; never build class names by concatenation.
3. v4 gotchas: bare `ring` defaults to `currentColor` (spec uses `outline-*` for focus instead); `shadow-xs` exists; `size-4` = `h-4 w-4`.
4. Use **native `<dialog>` + `showModal()`** — do not hand-roll focus traps.
5. Conflict check is client-side pre-save validation (guide §8): same-day + interval overlap, exclude own id when editing, treat touching times as non-conflicting.
6. `day_of_week`: 0 = Sunday stored; display Mon-first via ordered constant `[1,2,3,4,5,6,0]`.
7. `tabular-nums` on every time/count; en dash "–" between times.
8. Deleting a subject cascades its sessions (DB `on delete cascade`) — refetch sessions after any subject delete.
9. Unknown `color` values (incl. legacy `#6366f1`) → render Indigo.
10. Add `pb-24 md:pb-8` to `<main>` so the mobile tab bar never covers content; `pb-[env(safe-area-inset-bottom)]` on the tab bar.
11. Not visually verified: this spec was validated by computed contrast ratios and reasoned layout, not a rendered preview — the first integrated screen review should be a real browser pass at 320px, 768px, 1280px + print preview.
