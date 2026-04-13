# 🎮 Game Tracker

A full-stack personal game library and analytics tracker. Search for games, add them to your library, track your progress, and view statistics about your gaming habits.

Built as a portfolio project to demonstrate full-stack engineering with a modern TypeScript stack.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Authentication | Better Auth |
| External API | RAWG Video Games Database |
| Charts | Chart.js |

---

## Features

- **Authentication** — Register, login, and session-based auth with protected routes
- **Game Search** — Search 500,000+ games via the RAWG API with cover art and metadata
- **Personal Library** — Add games and track status: Backlog, Playing, Completed, or Dropped
- **Progress Tracking** — Log ratings (1–10), completion percentage, and hours played
- **Inline Editing** — Update any game's stats directly from the dashboard table
- **Analytics Dashboard** — View aggregated stats and a status breakdown chart

---

## Architecture & Technical Decisions

### Data Model

The schema separates external game data from personal tracking data into two distinct tables.

**`games`** — A cache of RAWG metadata. When a user searches for and adds a game, the game is stored here once regardless of how many users add it. This prevents redundant API calls.

**`user_games`** — The core tracking table. A junction table between `users` and `games` that holds all personal data: status, rating, hours, completion percentage, and timestamps.

```
users ──< user_games >── games
```

This design means game metadata is fetched once and reused, while each user maintains fully isolated tracking data.

### RAWG API Caching

Before hitting the RAWG API, the server checks the local `games` table by `rawg_id`. If the game already exists it's returned immediately. Only on a cache miss does the server fetch from RAWG and store the result.

```
Search request
  → Check games table by rawg_id
  → Hit: return cached row
  → Miss: fetch from RAWG → insert into games → return row
```

This keeps the app fast and avoids burning through API rate limits.

### Server-Side Aggregation

Dashboard statistics are computed entirely in SQL using Drizzle, not in the client. This keeps the client dumb and the server authoritative.

```sql
-- Status breakdown
SELECT status, COUNT(*) FROM user_games
WHERE user_id = $1
GROUP BY status

-- Aggregates
SELECT AVG(rating), SUM(hours_played) FROM user_games
WHERE user_id = $1 AND rating IS NOT NULL
```

### Status Transition Logic

When a game's status changes, automatic timestamps are applied server-side:

| Transition | Effect |
|---|---|
| Any → `playing` | Sets `started_at` if not already set |
| Any → `completed` | Sets `completed_at`, forces `completion_percentage` to 100 |
| `completed` → Any | Clears `completed_at` |

This logic lives in `src/lib/utils/statusTransitions.ts`, isolated from both the database layer and the route layer so it can be tested and reasoned about independently.

### SvelteKit Server Actions

All data mutations use SvelteKit server actions rather than client-side API calls. Forms post directly to named actions in `+page.server.ts` files, keeping business logic on the server and out of the browser entirely.

---

## Project Structure

```
src/
├── lib/
│   ├── server/
│   │   ├── auth/         # Better Auth configuration
│   │   └── db/
│   │       ├── schema.ts         # All table definitions + enums
│   │       └── queries/
│   │           ├── games.ts      # RAWG cache queries
│   │           ├── userGames.ts  # Library CRUD + updates
│   │           └── stats.ts      # Dashboard aggregations
│   ├── rawg/
│   │   ├── client.ts     # RAWG API fetch wrapper
│   │   └── types.ts      # RAWG response types
│   └── utils/
│       └── statusTransitions.ts  # Status change business logic
└── routes/
    ├── (auth)/
    │   ├── login/
    │   └── register/
    ├── dashboard/        # Stats, chart, library table
    └── search/           # RAWG search + add to library
```

Business logic is kept out of route files. Routes are thin — they validate input, call query functions, and return results. All DB logic lives in `lib/server/db/queries/`.

---

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL running locally

### Steps

**1. Clone and install**
```bash
git clone https://github.com/yourusername/game-tracker.git
cd game-tracker
npm install
```

**2. Set up environment variables**

Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/game_tracker"
RAWG_API_KEY="your_rawg_key_here"
BETTER_AUTH_SECRET="your_secret_here"
BETTER_AUTH_URL="http://localhost:5173"
```

- Get a free RAWG API key at [rawg.io/apidocs](https://rawg.io/apidocs)
- Generate an auth secret with `openssl rand -base64 32`

**3. Create the database**
```bash
psql -U postgres -c "CREATE DATABASE game_tracker;"
```

**4. Push the schema**
```bash
npm run db:push
```

**5. Run the dev server**
```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Sync schema changes to database |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
