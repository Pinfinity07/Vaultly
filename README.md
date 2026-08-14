# Vaultly

Vaultly is a full-stack finance tracker for individuals and groups. It lets users log personal expenses, split and track shared costs with roommates or family, set savings goals, and review spending patterns through a dedicated analytics dashboard.

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
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)
- [Roadmap](#roadmap)

---

## Overview

Most personal finance apps are built for a single user. Vaultly is built around the idea that money is often shared — rent with roommates, groceries with a partner, trip expenses with friends. It combines individual expense tracking with group-based expense sharing in one system, backed by a relational schema that models users, groups, expenses, and savings goals as first-class entities.

The application is split into two independently deployed services: a Next.js frontend and an Express/PostgreSQL backend, connected over a REST API with cookie-based authentication.

## Core Features

**Personal expense tracking**
Create, edit, and delete expenses with category tagging and date-based filtering.

**Group expense management**
Create groups, add or remove members, and log expenses that are tied to a group rather than a single user, so shared costs stay visible to everyone in it.

**Savings goals**
Define a target amount and optional deadline for a goal, then log contributions toward it over time and track progress.

**Analytics dashboard**
Aggregated views for spending overview, monthly trends, top expenses, group-level breakdowns, goal progress, and period-over-period comparisons, computed server-side via Prisma aggregation queries.

**Authentication**
Email and password auth alongside Google OAuth 2.0, with JWT-based sessions stored in httpOnly cookies rather than local storage.

## Architecture

```
┌─────────────────────┐         HTTPS / REST         ┌──────────────────────┐
│   vaultly-frontend   │ ────────────────────────────▶│    vaultly-backend    │
│   Next.js 16 (App    │◀──────────────────────────── │   Express 5 + Prisma  │
│   Router), Zustand    │      JSON + httpOnly cookie   │                        │
└─────────────────────┘                               └───────────┬──────────┘
                                                                    │
                                                                    ▼
                                                          ┌───────────────────┐
                                                          │   PostgreSQL        │
                                                          └───────────────────┘
```

The frontend is deployed on Vercel, the backend on Render, and the database is a managed PostgreSQL instance. The two services communicate purely over HTTP; there is no shared code or monorepo tooling between them.

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- Zustand for client-side state
- Tailwind CSS 4
- GSAP for animation
- react-hot-toast for notifications

**Backend**
- Node.js with Express 5
- Prisma ORM with the `@prisma/adapter-pg` driver adapter
- PostgreSQL
- JSON Web Tokens for session management
- bcrypt for password hashing
- googleapis for the Google OAuth flow
- express-rate-limit for request throttling on auth-sensitive routes

## Database Schema

The schema is defined in Prisma and models six entities:

| Model | Purpose |
|---|---|
| `Users` | Account records, including hashed passwords and role |
| `Groups` | A shared space owned by a user, containing members and expenses |
| `GroupMembers` | Join table linking users to groups with a per-group role, unique on `(groupId, userId)` |
| `Categories` | Expense categories used to classify spending |
| `Expenses` | A single expense, optionally attached to a group; always attached to a user and a category |
| `Goals` | A savings target for a user, with a running `currentAmount` updated via contributions |

An expense can belong to a group or stand alone as a personal expense, which is what allows the same table and the same analytics queries to serve both individual and shared spending.

## Authentication and Security

- **Password auth**: passwords are hashed with bcrypt before being stored; plaintext passwords are never persisted.
- **Sessions**: on signup, login, or a successful OAuth callback, the backend issues a JWT and sets it as an httpOnly, `SameSite`-scoped cookie, so the token is inaccessible to client-side JavaScript and not exposed to XSS.
- **Google OAuth**: implemented as an authorization-code flow using `googleapis`, with a signed, short-lived `state` cookie (10-minute expiry) to protect against CSRF during the redirect.
- **Rate limiting**: authentication (`/auth/signup`, `/auth/login`) and OAuth (`/auth/google`, `/auth/google/callback`) routes are throttled separately using `express-rate-limit`, keyed by client IP, with a 15-minute fixed window. This limits credential-stuffing and brute-force attempts without affecting normal API usage elsewhere in the app.
- **Database resilience**: the OAuth callback wraps its database calls in a small retry helper that detects transient connection errors (timeouts, connection resets, Prisma initialization failures) and retries with backoff, since the backend runs on a free-tier host that can cold-start.
- **CORS**: locked to the deployed frontend origin and `localhost:3000` for local development, with credentials enabled so cookies are sent cross-origin correctly.

## API Reference

All routes are prefixed by their resource name. Routes marked "Auth" require a valid `accessToken` cookie.

**Auth** — `/auth`

| Method | Route | Description | Rate limited |
|---|---|---|---|
| POST | `/auth/signup` | Create an account | Yes |
| POST | `/auth/login` | Log in with email and password | Yes |
| POST | `/auth/logout` | Clear the session cookie | No |
| GET | `/auth/me` | Return the current authenticated user | Auth |
| GET | `/auth/google` | Start the Google OAuth flow | Yes |
| GET | `/auth/google/callback` | Handle the OAuth redirect | Yes |

**Expenses** — `/expenses` (Auth)

| Method | Route | Description |
|---|---|---|
| GET | `/expenses` | List the current user's expenses |
| POST | `/expenses` | Create an expense |
| PUT | `/expenses/:id` | Update an expense |
| DELETE | `/expenses/:id` | Delete an expense |

**Groups** — `/groups` (Auth)

| Method | Route | Description |
|---|---|---|
| POST | `/groups` | Create a group |
| GET | `/groups` | List groups the user belongs to |
| GET | `/groups/:groupId` | Get a single group |
| PUT | `/groups/:groupId` | Update a group |
| DELETE | `/groups/:groupId` | Delete a group |
| POST | `/groups/:groupId/members` | Add a member to a group |
| DELETE | `/groups/:groupId/members/:memberId` | Remove a member from a group |

**Goals** — `/goals` (Auth)

| Method | Route | Description |
|---|---|---|
| GET | `/goals` | List the user's savings goals |
| POST | `/goals` | Create a goal |
| GET | `/goals/:goalId` | Get a single goal |
| PUT | `/goals/:goalId` | Update a goal |
| DELETE | `/goals/:goalId` | Delete a goal |
| POST | `/goals/:goalId/contribute` | Add a contribution toward a goal |

**Analytics** — `/analytics` (Auth)

| Method | Route | Description |
|---|---|---|
| GET | `/analytics/overview` | Spending overview with category breakdown |
| GET | `/analytics/trends` | Monthly spending trends |
| GET | `/analytics/top-expenses` | Largest expenses in a period |
| GET | `/analytics/groups` | Group-level spending analytics |
| GET | `/analytics/goals` | Progress across all goals |
| GET | `/analytics/comparison` | Period-over-period comparison |
| GET | `/analytics/dashboard` | Aggregated stats for the dashboard view |

**Users** — `/users` (Auth)

| Method | Route | Description |
|---|---|---|
| GET | `/users/:id` | Get a user's profile |
| PUT | `/users/:id` | Update a user's profile |

## Project Structure

```
Vaultly/
├── vaultly-backend/
│   ├── prisma/                  Schema and migrations
│   ├── src/
│   │   ├── config/               OAuth client configuration
│   │   ├── controllers/          Request handlers per resource
│   │   ├── lib/                  Prisma client instance
│   │   ├── middlewares/          Auth guard, rate limiters
│   │   ├── routes/                Express route definitions
│   │   ├── services/              Business logic and database queries
│   │   └── server.js              App entry point
│   └── package.json
│
└── vaultly-frontend/
    ├── src/
    │   ├── app/                   Next.js App Router pages
    │   │   ├── dashboard/
    │   │   ├── expenses/
    │   │   ├── groups/
    │   │   ├── goals/
    │   │   ├── reports/
    │   │   ├── profile/
    │   │   ├── login/
    │   │   └── signup/
    │   ├── components/            Shared and page-level UI components
    │   ├── hooks/                 Custom hooks (GSAP animation, count-up)
    │   └── lib/                   API client
    └── package.json
```

Each layer follows a route → controller → service pattern on the backend, keeping request handling, validation, and database access in separate, testable layers.

## Getting Started

### Prerequisites

- Node.js 18 or later
- A PostgreSQL database (local or hosted)
- A Google Cloud OAuth 2.0 client ID and secret, if you want to run the OAuth flow locally

### Backend

```bash
cd vaultly-backend
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

The server starts on `http://localhost:5000` by default.

### Frontend

```bash
cd vaultly-frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000` and expects the backend to be reachable at the URL configured in the frontend's environment variables.

## Environment Variables

**Backend (`vaultly-backend/.env`)**

```
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
NODE_ENV=development
PORT=5000
```

**Frontend (`vaultly-frontend/.env.local`)**

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Deployment

- **Frontend**: deployed on Vercel, built from `vaultly-frontend/`.
- **Backend**: deployed on Render, built from `vaultly-backend/` using `npx prisma generate && npx prisma migrate deploy` as the build step, so migrations are applied automatically on each deploy.
- **Database**: managed PostgreSQL.
- A `/health` endpoint is exposed on the backend specifically to support wake-up pings on Render's free tier, since the service spins down after inactivity.

## Design Decisions

**Cookie-based sessions over local storage.** Storing the JWT in an httpOnly cookie means it is never readable by client-side JavaScript, which removes an entire class of XSS-driven token theft that affects `localStorage`-based auth.

**Groups as an optional relation on expenses, not a separate table.** An expense has a nullable `groupId`. This keeps a single query path and a single analytics pipeline for both personal and shared spending, instead of maintaining two parallel data models.

**Separate rate limiters per route category.** Authentication and OAuth endpoints are the most attractive targets for abuse, so they carry their own limiter instances and thresholds, independent from the rest of the API, rather than one global limit that would either be too strict for normal usage or too loose for these routes.

**Retry logic around the OAuth callback specifically.** The callback is the one code path where a dropped database connection (common on a cold-started free-tier instance) would otherwise silently fail a login that the user has already approved on Google's side, so it is the one place given explicit retry-with-backoff handling.

## Roadmap

- Move the rate limiter store from in-memory to Redis-backed, so limits hold across server restarts and multiple instances.
- Add refresh tokens alongside the current short-lived access token.
- Support recurring expenses.
- Add CSV export for expense and analytics data.