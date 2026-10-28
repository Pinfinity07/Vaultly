# Vaultly

Vaultly is a full-stack finance tracker for individuals and groups. Users log personal expenses, keep a shared expense log with roommates or family, set savings goals, and review spending patterns on an analytics dashboard.

Live application: https://vaultly-one.vercel.app

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Authentication and Security](#authentication-and-security)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing and CI](#testing-and-ci)
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)

---

## Overview

Most personal finance apps are built for a single user. Vaultly is built around the idea that money is often shared: rent with roommates, groceries with a partner, trip expenses with friends. It combines individual expense tracking with group expense logs in one system, backed by a relational schema that models users, groups, expenses, and savings goals as first-class entities.

The application is split into two independently deployed services: a Next.js frontend and an Express/PostgreSQL backend, connected over a REST API with cookie-based authentication.

## Core Features

**Personal expense tracking**
Create, edit, and delete expenses. The expense list supports pagination, case-insensitive search over descriptions and categories, category and date-range filters, and sorting by date, amount, or category. Categories are created on first use and matched case-insensitively, so "Food" and "food" share one category.

**Group expenses**
Create groups, add members by email, and assign `admin` or `member` roles. Expenses can be attached to a group so every member sees the shared spending. Only members can log expenses against a group, only creators and admins can manage members, and only the creator can delete the group.

**Savings goals**
Define a target amount and optional deadline, then log contributions over time. Contributions are applied with an atomic database increment, so concurrent contributions are never lost.

**Analytics and reports**
Server-side aggregation for spending overview with category breakdown, monthly trends, top expenses, group-level spending, goal progress, and month-over-month or year-over-year comparison. The reports page can export the current analytics view as CSV.

**Authentication**
Email and password auth alongside Google OAuth 2.0, with short-lived access tokens and longer-lived refresh tokens stored in httpOnly cookies.

**Quick add**
Press `Cmd+K` / `Ctrl+K` anywhere in the app to open the quick-add expense dialog.

## Architecture

```
┌─────────────────────┐         HTTPS / REST          ┌──────────────────────┐
│  vaultly-frontend   │ ────────────────────────────▶ │   vaultly-backend    │
│  Next.js 16         │ ◀──────────────────────────── │   Express 5 + Prisma │
│  (App Router)       │     JSON + httpOnly cookies   │                      │
└─────────────────────┘                               └──────────┬───────────┘
                                                                 │
                                                                 ▼
                                                       ┌───────────────────┐
                                                       │    PostgreSQL     │
                                                       └───────────────────┘
```

The frontend is deployed on Vercel, the backend on Render, and the database is a managed PostgreSQL instance. The two services communicate purely over HTTP; there is no shared code or monorepo tooling between them.

## Tech Stack

**Frontend**
- Next.js 16 (App Router) and React 19
- Tailwind CSS 4
- GSAP for animation
- lucide-react for icons
- react-hot-toast for notifications

**Backend**
- Node.js with Express 5
- Prisma ORM with PostgreSQL
- JSON Web Tokens for sessions, bcrypt for password hashing
- googleapis for the Google OAuth flow
- express-rate-limit for throttling auth routes

**Tooling**
- Jest and Supertest for backend tests
- ESLint for the frontend
- GitHub Actions for CI

## Database Schema

The schema is defined in Prisma and models six entities:

| Model | Purpose |
|---|---|
| `Users` | Account records, including hashed passwords and role |
| `Groups` | A shared space owned by a user, containing members and expenses |
| `GroupMembers` | Join table linking users to groups with a per-group role, unique on `(groupId, userId)` |
| `Categories` | Expense categories, created on first use |
| `Expenses` | A single expense, optionally attached to a group; always attached to a user and a category |
| `Goals` | A savings target for a user, with a running `currentAmount` updated via contributions |

`Expenses` is indexed on `(userId, date)`, `(userId, categoryId)`, and `groupId` to match the main list, filter, and analytics queries. Schema changes are managed through Prisma migrations in `vaultly-backend/prisma/migrations`.

## Authentication and Security

- **Password auth**: passwords are hashed with bcrypt before being stored; plaintext passwords are never persisted.
- **Sessions**: on signup, login, or a successful OAuth callback, the backend issues a 15-minute access token and a 7-day refresh token, each in its own httpOnly cookie. `POST /auth/refresh` exchanges a valid refresh token for a fresh pair. On the frontend, any request that returns 401 triggers a single shared refresh call and is retried once, so parallel requests don't each start their own refresh.
- **Google OAuth**: an authorization-code flow using `googleapis`, with a random `state` value stored in a short-lived cookie (10 minutes) and checked on callback to protect against CSRF. Each login uses its own OAuth client instance so concurrent logins can never share credentials.
- **Authorization**: users can read and update only their own profile (accounts with the `admin` role can access any profile), and only the fields `full_name` and `email` can be changed. Expenses and goals can only be changed by their owner. Group access is checked against membership and role on every request.
- **Input validation**: amounts are converted to numbers and rejected unless they are finite and positive.
- **Rate limiting**: signup and login are limited to 20 requests per IP per 15 minutes, and the Google OAuth routes to 30.
- **Database resilience**: the OAuth callback retries its database calls with backoff on transient connection errors, since the free-tier backend host can cold-start.
- **CORS**: restricted to the deployed frontend origin, Vercel preview deployments, and `localhost:3000`, with credentials enabled so cookies are sent cross-origin.

## API Reference

Routes marked "Auth" require a valid `accessToken` cookie. Errors are returned as JSON with an `error` field.

**Auth**: `/auth`

| Method | Route | Description | Notes |
|---|---|---|---|
| POST | `/auth/signup` | Create an account | Rate limited |
| POST | `/auth/login` | Log in with email and password | Rate limited |
| POST | `/auth/refresh` | Issue new tokens from the refresh cookie | |
| POST | `/auth/logout` | Clear both session cookies | |
| GET | `/auth/me` | Return the current user | Auth |
| GET | `/auth/google` | Start the Google OAuth flow | Rate limited |
| GET | `/auth/google/callback` | Handle the OAuth redirect | Rate limited |

**Expenses**: `/expenses` (Auth)

| Method | Route | Description |
|---|---|---|
| GET | `/expenses` | List expenses. Query: `page`, `limit`, `search`, `sortBy` (`date`, `amount`, `category`), `sortOrder`, `category`, `startDate`, `endDate` |
| POST | `/expenses` | Create an expense, optionally with a `groupId` the user belongs to |
| PUT | `/expenses/:id` | Update an expense |
| DELETE | `/expenses/:id` | Delete an expense |

**Groups**: `/groups` (Auth)

| Method | Route | Description |
|---|---|---|
| POST | `/groups` | Create a group (the creator becomes an admin) |
| GET | `/groups` | List groups the user belongs to |
| GET | `/groups/:groupId` | Get a single group with members and expenses |
| PUT | `/groups/:groupId` | Rename a group (creator or admin) |
| DELETE | `/groups/:groupId` | Delete a group (creator only) |
| POST | `/groups/:groupId/members` | Add a member by email (creator or admin) |
| DELETE | `/groups/:groupId/members/:memberId` | Remove a member (creator or admin) |

**Goals**: `/goals` (Auth)

| Method | Route | Description |
|---|---|---|
| GET | `/goals` | List the user's savings goals |
| POST | `/goals` | Create a goal |
| GET | `/goals/:goalId` | Get a single goal |
| PUT | `/goals/:goalId` | Update a goal |
| DELETE | `/goals/:goalId` | Delete a goal |
| POST | `/goals/:goalId/contribute` | Add a contribution toward a goal |

**Analytics**: `/analytics` (Auth)

| Method | Route | Description |
|---|---|---|
| GET | `/analytics/overview` | Totals and category breakdown. Query: `startDate`, `endDate` |
| GET | `/analytics/trends` | Monthly totals by category. Query: `months` |
| GET | `/analytics/top-expenses` | Largest expenses. Query: `limit` |
| GET | `/analytics/groups` | Spending per group |
| GET | `/analytics/goals` | Progress across all goals |
| GET | `/analytics/comparison` | Current vs previous period. Query: `period` (`month`, `year`) |
| GET | `/analytics/dashboard` | Aggregated stats for the dashboard |

**Users**: `/users` (Auth)

| Method | Route | Description |
|---|---|---|
| GET | `/users/:id` | Get your own profile |
| PUT | `/users/:id` | Update your own `full_name` or `email` |

**Health**

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Liveness check, used for wake-up pings |

## Project Structure

```
Vaultly/
├── .github/workflows/ci.yml     CI pipeline
├── vaultly-backend/
│   ├── prisma/                  Schema and migrations
│   ├── src/
│   │   ├── config/              OAuth client configuration
│   │   ├── controllers/         Request handling and validation
│   │   ├── lib/                 Prisma client instance
│   │   ├── middlewares/         Auth guard, rate limiters
│   │   ├── routes/              Express route definitions
│   │   ├── services/            Business logic and database queries
│   │   └── server.js            App entry point
│   └── tests/                   Jest and Supertest suites
│
└── vaultly-frontend/
    └── src/
        ├── app/                 Next.js App Router pages
        │   ├── dashboard/
        │   ├── expenses/
        │   ├── groups/
        │   ├── goals/
        │   ├── reports/
        │   ├── profile/
        │   ├── login/
        │   └── signup/
        ├── components/          Modals, navigation, and shared UI
        ├── hooks/               GSAP animation and count-up hooks
        └── lib/api.js           API client with silent token refresh
```

The backend follows a route, controller, service pattern: routes wire up middleware, controllers validate requests and map errors to status codes, and services own the database access.

## Getting Started

### Prerequisites

- Node.js 20 or later
- A PostgreSQL database (local or hosted)
- A Google Cloud OAuth 2.0 client ID and secret, if you want to run Google login locally

### Backend

```bash
cd vaultly-backend
cp .env.sample .env   # then fill in the values
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

The server starts on `http://localhost:8000` unless `PORT` is set.

### Frontend

```bash
cd vaultly-frontend
cp .env.sample .env.local   # then fill in the values
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Environment Variables

**Backend (`vaultly-backend/.env`)**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign access and refresh tokens |
| `ACCESS_TOKEN_EXPIRY` | Access token lifetime (default `15m`) |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor (default `10`) |
| `PORT` | HTTP port (default `8000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth redirect URI registered with Google (default `http://localhost:8000/auth/google/callback`) |
| `FRONTEND_URL` | Frontend origin, used for CORS and post-login redirects |
| `NODE_ENV` | Set to `production` to enable secure, cross-site cookies |

**Frontend (`vaultly-frontend/.env.local`)**

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Backend base URL (default `http://localhost:8000`). `NEXT_PUBLIC_API_URL` is also accepted |

## Testing and CI

```bash
cd vaultly-backend
npm test
```

The backend suite uses Jest and Supertest. It covers token generation and verification, password hashing, the refresh and logout endpoints, expense amount validation, case-insensitive categories, group membership checks on expenses, goal amount validation, atomic goal contributions, and per-request OAuth clients. Prisma is mocked, so the tests run without a database.

GitHub Actions runs on every push to `main` and every pull request targeting it:

- **Backend**: install dependencies, generate the Prisma client, run the test suite
- **Frontend**: install dependencies, run ESLint, build the Next.js app

## Deployment

- **Frontend**: deployed on Vercel from `vaultly-frontend/`.
- **Backend**: deployed on Render from `vaultly-backend/`. The `npm run build` script runs `prisma generate` and `prisma migrate deploy`, so new migrations are applied on every deploy.
- **Database**: managed PostgreSQL.
- The landing page calls `/health` on load to wake the backend, since Render's free tier spins the service down after inactivity.

## Design Decisions

**Cookie-based sessions over local storage.** Tokens live in httpOnly cookies, so client-side JavaScript can never read them. That removes the XSS-driven token theft that affects `localStorage`-based auth.

**Short access tokens with a silent refresh.** Access tokens expire after 15 minutes to limit the damage of a leaked token. The frontend's request wrapper refreshes transparently on a 401, so users stay signed in for the 7-day refresh window without noticing.

**Groups as an optional relation on expenses.** An expense has a nullable `groupId`. This keeps a single query path and a single analytics pipeline for both personal and shared spending, instead of two parallel data models.

**Atomic updates for running totals.** Goal contributions use Prisma's `increment`, so the database applies each addition itself. A read-then-write in application code would lose updates under concurrent requests.

**Separate rate limiters per route category.** Authentication and OAuth endpoints are the most attractive targets for abuse, so they get their own limits instead of one global limit that would be too strict for normal usage or too loose for these routes.

**Retry logic around the OAuth callback.** The callback is the one path where a dropped database connection on a cold-started instance would fail a login the user has already approved on Google's side, so it alone gets retry-with-backoff handling.

## Known Limitations

- **No cost splitting yet.** Groups share an expense log, but Vaultly does not yet calculate who owes whom.
- **Amounts are floating point.** Money is stored as double precision, which can introduce rounding errors. Moving to `Decimal` is planned.
- **Refresh tokens can't be revoked.** They are reissued on each refresh but not stored server-side, so logging out clears the cookies without invalidating a copied token.
- **In-memory rate limiting.** Limits reset when the server restarts and aren't shared across instances.
- **Cold starts.** The first request after inactivity can take several seconds on Render's free tier.

## Roadmap

- Balances and settle-up for groups
- `Decimal` amounts for money
- Server-side refresh token storage with revocation and reuse detection
- Redis-backed rate limiting
- Schema-based request validation and a single error-handling middleware
- Integration tests against a real PostgreSQL database
- Recurring expenses
