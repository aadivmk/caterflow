# CaterFlow: Catering Booking and Management Platform

CaterFlow is a back office for a catering business. It works out how much food and staff an event needs, builds priced menus, and keeps every booking on one calendar with double-booking checks, payments and customer history.

Built with the Next.js App Router as the INT257 course project.

## Features

| Area | What it does |
| --- | --- |
| Dashboard | Totals, upcoming events, monthly revenue, bookings-per-month chart, status breakdown, mini calendar, recent activity. Every figure is calculated from the saved records. |
| Guest Calculator | Servings, total food, rice, meat, vegetables, water, service staff and food budget from a guest count. Every assumption is editable. Calculations can be saved, reloaded and deleted. |
| Menu Builder | Create, edit and delete food items (category, price per person, dietary type, image, availability). Build, edit, duplicate and delete reusable packages with a live price per person and total. |
| Booking Calendar | Month, week, day and list views, status colours, search, status and event-type filters, date navigation. |
| Bookings | Validated booking form with automatic pricing, additional charges, discounts, advance and balance. Details page with status updates, payments, edit and cancel. |
| Double-booking checks | Warns on overlapping time, same venue, all catering teams busy, and daily kitchen capacity exceeded. A booking with warnings cannot be saved until the warning is acknowledged. |
| Customers | Created automatically from bookings (matched by phone number). Search, add, edit, booking history, events booked, total spent. |
| Settings | Business details, currency (INR by default), default price per guest, catering teams, daily capacity, calculator assumptions, demo data reset. |

## Tech stack

Next.js 16 (App Router, Cache Components), React 19, plain JavaScript (no TypeScript), Tailwind CSS 4, shadcn/ui-style components on Radix UI, Lucide icons, React Hook Form, Zod, Recharts, Sonner, date-fns, MongoDB (users, data and token sign-in).

## Quick start

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment variables the app runs in **local mode** and opens with demo data, so nothing else is needed for a demonstration.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Data modes

All reads and writes go through one interface, `Repository` (`lib/data/repository.js`). `getRepository()` in `lib/data/index.js` picks the implementation from the environment:

| Mode | When | Storage | Sign-in |
| --- | --- | --- | --- |
| Local | `NEXT_PUBLIC_DATA_MODE` is empty | Browser `localStorage` (key `caterflow:data:v1`) | None |
| MongoDB | `NEXT_PUBLIC_DATA_MODE=mongodb` and `MONGODB_URI` set | MongoDB through Route Handlers under `/api/data` | Email and password (bcrypt hash, signed token) |

Components and hooks never call `localStorage` or MongoDB directly, so switching modes is a configuration change. Local mode is real persistence, not a mock: records survive reloads, and the dashboard, calendar and customer stats are all derived from what is stored.

In local mode data belongs to one browser. Another browser or device starts with its own copy of the demo data.

## Environment variables

Copy `.env.example` to `.env.local`.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_DATA_MODE` | Only for MongoDB mode | Set to `mongodb` to turn MongoDB mode on |
| `MONGODB_URI` | Only for MongoDB mode | Server-only connection string |
| `MONGODB_DB`, `JWT_SECRET` | Only for MongoDB mode | Database name (default `caterflow`) and token-signing secret |

Both are safe in the browser because access is controlled by Row Level Security. The `service_role` key is never used by this project. Do not add it. `.env.local` is ignored by git.

## MongoDB setup

1. Get a MongoDB database: install MongoDB locally, or create a free cluster on MongoDB Atlas (https://www.mongodb.com/atlas) and copy its connection string.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_DATA_MODE=mongodb`, `MONGODB_URI`, `MONGODB_DB` and `JWT_SECRET` (any random string of 16+ characters).
3. Run `npm install` and `npm run dev`. No schema script is needed: collections and indexes are created automatically the first time the server connects.
4. Open `/login`, choose **Create an account**, then sign in. On first load the app creates the settings document; use **Settings > Reset demo data** to load the sample records.

Collections: `users`, `customers`, `menuItems`, `menus` (package items are an ordered `itemIds` array, no join table), `bookings`, `savedCalculations`, `businessSettings`. Each document's `_id` is the app's string id.

## Next.js concepts used

| Concept | Where to look |
| --- | --- |
| App Router and file-based routing | Every folder under `app/` is a route |
| Nested routes | `app/dashboard/bookings/new`, `app/dashboard/bookings/[id]/edit` |
| Dynamic routes | `app/dashboard/bookings/[id]/page.js` awaits the `params` Promise and validates the id |
| Layouts | `app/layout.js` (root) and `app/dashboard/layout.js` (sidebar and top bar shared by all dashboard pages) |
| Server Components | All `page.js` and `layout.js` files, `PageHeader`, the landing page, `DataModeNotice` (async, reads cookies) |
| Client Components | Files starting with `"use client"`: forms, calendar, calculator, charts, `SidebarNav` |
| Server and client composition | `app/page.js` is static on the server with one interactive island, `MiniCalculator` |
| Server Actions | `lib/actions/booking-actions.js` re-validates each booking on the server and computes its pricing. `lib/actions/preferences.js` sets a cookie from a plain `<form action>` |
| Data fetching | `DataProvider` loads through the Repository. `DataModeNotice` reads request cookies on the server. Route Handlers query MongoDB on the server |
| Streaming and Suspense | Request-time work (`params`, cookies, search params) is wrapped in `<Suspense>`, so the shell is prerendered and the rest streams in |
| Loading UI | `app/dashboard/loading.js`, plus skeletons from `DataBoundary` while records load |
| Error handling and route-level error boundaries | `app/error.js`, `app/dashboard/error.js`, plus `ErrorState` for data errors with retry |
| Not Found pages | `app/not-found.js`, `app/dashboard/not-found.js`, `notFound()` for malformed booking ids |
| Navigation with Link | Sidebar, buttons, calendar days, booking cards. `useRouter` after saving a booking |
| `useState` and `useEffect` | Calculator state, calendar view state, initial data load in `DataProvider`, dialog form resets |
| Form handling | React Hook Form with Zod resolvers in the booking, customer, menu item, settings and login forms |
| Route Handlers (API routes) | `app/api/bookings/route.js` and `app/api/customers/route.js` (GET and POST) |
| Environment variables | `lib/mongodb/config.js`, documented in `.env.example` |
| Metadata | `metadata` exports with a title template in `app/layout.js` |
| Reusable components | `components/ui` (design system), `components/shared` (Field, ConfirmDialog, badges, states, DataBoundary) |
| Custom hooks | `hooks/use-bookings.js`, `use-customers.js`, `use-menus.js`, `use-settings.js` |

### Why most data pages render in Client Components

In local mode the data lives in the browser, which a server cannot read. So each page is a Server Component that renders the static frame (title, layout, metadata), and a Client Component inside it loads and edits the records. The server still does the work that belongs there: validation and pricing in a Server Action, cookies, environment checks, and the API.

## API

| Endpoint | Local mode | MongoDB mode |
| --- | --- | --- |
| `GET /api/bookings` | Returns the bundled demo bookings with `"source": "demo"` | Returns bookings from the database |
| `POST /api/bookings` | Validates and prices the booking, returns it with `"persisted": false` | Validates, links or creates the customer, inserts the booking |
| `GET /api/customers` | Returns the demo customers | Returns customers from the database |
| `POST /api/customers` | Validates, returns `"persisted": false` | Validates and inserts |

In MongoDB mode send the access token from `/api/auth/login` as `Authorization: Bearer <token>`. Invalid input returns `400` with a `fieldErrors` object.

## Validation rules

Schemas live in `lib/validations` and are shared by the forms, the Server Action and the API.

- Required fields are marked with `*` and have their own messages.
- Email format and 10-digit Indian mobile numbers (with or without `+91`).
- Guest count must be a positive whole number.
- Event date must be a real date and not in the past for new bookings.
- End time must be after start time.
- Prices, charges and discounts cannot be negative. Discount cannot exceed the booking amount.
- Advance cannot exceed the total. A recorded payment cannot exceed the balance.
- Overlap, venue, team and capacity warnings must be acknowledged before saving.
- Deleting or cancelling anything asks for confirmation first.

## Guest calculator assumptions

The calculator does not claim to be a catering standard. Its starting values are estimates in `lib/calculations/guest-calculator.js`, and all of them can be changed in Settings (business defaults) or on the calculator page (one calculation):

- Buffer: 10% extra servings, plus an optional extra buffer per event type
- Per serving: 550 g total food, 150 g rice, 180 g meat, 150 g vegetables, 0.75 L water
- Meal multipliers: Breakfast 0.6, Lunch 1, Dinner 1, Snacks 0.4, Full Day Catering 2.2
- Guests per staff member: Buffet 25, Plated 12, Traditional 15, Live Counters 20

Example: 100 guests at ₹250 per guest gives a ₹25,000 food budget and 110 servings.

## Demo data

10 customers, 20 food items, 4 packages and 10 bookings covering every status and several event types, using Kerala catering examples in INR. Demo records carry a **Demo** tag in the UI (`isDemo` in the data). Booking dates are generated relative to today, so there are always past, current and upcoming events.

**Settings > Demo data > Reset demo data** deletes everything and restores this set. The source is `lib/data/seed.js`.

## Project structure

```
app/
  layout.js, page.js, error.js, not-found.js, globals.css
  login/page.js
  dashboard/
    layout.js, page.js, loading.js, error.js, not-found.js
    guest-calculator/  menu-builder/  customers/  settings/
    bookings/
      page.js
      new/page.js
      [id]/page.js
      [id]/edit/page.js
  api/
    bookings/route.js
    customers/route.js
components/
  ui/          Button, Card, Dialog, Sheet, Tabs, Table, Input, ...
  shared/      Field, ConfirmDialog, DataBoundary, badges, empty and error states
  layout/      Logo, SidebarNav, MobileNav, PageHeader, DataModeNotice
  providers/   DataProvider (state plus all mutations)
  dashboard/  bookings/  calculator/  menu/  customers/  settings/  landing/
hooks/         use-bookings, use-customers, use-menus, use-settings
lib/
  data/          Repository interface, localStorage and MongoDB implementations, seed
  mongodb/       config, server connection, auth (bcrypt + JWT), document mappers, store
  validations/   Zod schemas
  calculations/  guest calculator, pricing, conflicts, dashboard stats
  actions/       Server Actions
  bookings/      shared booking preparation (validation plus pricing)
types/index.js    JSDoc typedefs for the data shapes (editor hints only)
jsconfig.json     the @/ import alias
```

## Deploying to Vercel

1. Push the project to a GitHub repository:
   ```bash
   git init
   git add -A
   git commit -m "CaterFlow"
   git branch -M main
   git remote add origin https://github.com/<your-username>/caterflow.git
   git push -u origin main
   ```
2. On https://vercel.com choose **Add New > Project** and import the repository. Vercel detects Next.js. Keep the default build settings.
3. For local mode, deploy with no environment variables. For MongoDB mode, add `NEXT_PUBLIC_DATA_MODE`, `MONGODB_URI`, `MONGODB_DB` and `JWT_SECRET` under **Environment Variables** first, and allow Vercel to reach your Atlas cluster in Network Access.
4. Click **Deploy**.

## Testing done

- `npm run build` and `npm run lint` pass with no errors or warnings.
- An automated Chrome run of 64 checks passed in local mode: calculator maths and saving, menu item and package create, edit, duplicate and delete, booking validation, conflict warnings, server-side pricing, payments, status changes, editing, cancelling, customer linking, calendar views and filters, settings, demo reset, persistence across reloads, 404 and error states. No console errors.
- Layouts were checked at 390 px, 820 px, 1280 px and 1440 px with no horizontal overflow.

## Known limits

- The MongoDB path (repository, login, API) has not been run against a live database in this environment. Test it once after connecting your cluster.
- In MongoDB mode the dashboard is protected by a client-side session check, and every `/api/data` and `/api/*` call requires a valid token. All signed-in users share one workspace; there is no per-user data separation.
- RLS treats all signed-in users as one team. There is no per-user data separation.
- Menu images are links to hosted images. There is no file upload.
