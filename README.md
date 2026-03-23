# maggies-mental-load

A full-stack starter kit for shipping AI-powered products. Clone the repo, configure your environment, and have a working application with authentication, AI chat, and agent tools in minutes.

## Features

- **Authentication** — Email/password sign-up and sign-in via Better Auth with secure HTTP-only sessions and automatic refresh
- **Role-based access control** — USER, EDITOR, and ADMIN roles baked into the schema and session helpers
- **AI chat** — Conversational interface powered by VoltAgent and the Vercel AI SDK. Messages persist to PostgreSQL and are organized into threads
- **Agent tools** — The AI assistant can create, list, and search notes on behalf of the user, with tool invocations rendered inline in the chat
- **Notes** — A browsable notes page at `/notes` showing all notes saved by the agent, demonstrating the full tool-to-UI vertical slice
- **Working memory** — VoltAgent remembers user preferences and context across conversations via PostgreSQL-backed working memory
- **Form validation** — Client and server-side validation using Zod and React Hook Form with a working example
- **Type-safe end to end** — Prisma generates types from the schema, Zod validates runtime data, React Router 7 types routes and loaders, CVA ensures type-safe component variants

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Framework  | React Router v7 (SSR, config-based routing) |
| UI         | React 19, Tailwind CSS v4, DaisyUI v5       |
| Database   | PostgreSQL via Prisma ORM                   |
| Auth       | Better Auth                                 |
| AI         | VoltAgent, Vercel AI SDK, Anthropic Claude  |
| Validation | Zod, React Hook Form                        |
| Runtime    | Bun (dev), Node 20 Alpine (production)      |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database (local or hosted, e.g. [Railway](https://railway.com))
- Anthropic API key

### Installation

```bash
bun install
```

### Environment

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL="postgresql://..."
ANTHROPIC_API_KEY="sk-ant-..."
BETTER_AUTH_BASE_URL="http://localhost:5173"
VITE_BETTER_AUTH_BASE_URL="http://localhost:5173"
```

### Database

```bash
bunx prisma migrate dev   # Apply migrations
bunx prisma db seed       # Seed with demo users
```

### Development

```bash
bun run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
app/
├── components/          # Shared UI components
├── generated/prisma/    # Generated Prisma client
├── lib/                 # Prisma client, auth config
├── middleware/           # Auth middleware
├── models/              # Server-side data access (thread, note, session)
├── routes/              # React Router route modules
├── voltagent/           # Agent definition and tools
│   ├── agents.ts        # Agent config, tool definitions
│   └── index.ts         # Agent export
└── root.tsx             # App shell, navigation, layout
prisma/
├── schema.prisma        # Database schema
├── migrations/          # Migration history
└── seed.ts              # Database seeder
```

## Agent Tools

The AI assistant (defined in `app/voltagent/agents.ts`) has three tools:

| Tool           | Description                                         |
| -------------- | --------------------------------------------------- |
| `create_note`  | Saves a note with a title and content for the user  |
| `list_notes`   | Lists all of the user's saved notes                 |
| `search_notes` | Searches notes by keyword across titles and content |

Tool invocations are rendered inline in the chat via `NoteToolPart`. Notes are browsable at `/notes`.

To add your own tools, follow the pattern in `agents.ts` — define a `createTool()` with a Zod schema, implement the `execute` function, add it to the agent's `tools` array, and create a UI component for it.

## Troubleshooting

- Chat/tool-calling duplicate provider item IDs (`fc_*`): see [docs/chat-tool-calling.md](docs/chat-tool-calling.md)
- Deployment process and runbook: see [docs/iridium-delivery-system.md](docs/iridium-delivery-system.md)

## Automated screenshot updates to Linear

This repo supports an automated screenshot pipeline using Playwright and Linear.

- Screenshots are captured into dated + unique run folders:
  `screenshots/runs/YYYY-MM-DD/<human-id>/`
- `human-id` uses the requested format (`separator: '-'`, `capitalize: false`)
  and looks like `rare-geckos-jam`.
- A script posts markdown image embeds to a Linear issue comment.

### Local commands

```bash
bun run screenshots:capture
bun run screenshots:post:linear
```

Or run both:

```bash
bun run screenshots:capture-and-post
```

Required env vars:

- `LINEAR_API_KEY`
- `LINEAR_ISSUE_ID` (Linear issue UUID)

Optional:

- `SCREENSHOT_GITHUB_BRANCH` (defaults to `main`)
- `SCREENSHOT_GITHUB_OWNER` + `SCREENSHOT_GITHUB_REPO` (only needed outside
  GitHub Actions if `GITHUB_REPOSITORY` is unavailable)

### GitHub Actions workflow

Use `.github/workflows/linear-screenshot-update.yml` via `workflow_dispatch`.

Inputs:

- `linearIssueId`: target Linear issue UUID
- `branch`: branch to publish links from (default `main`)

The workflow captures screenshots, commits/pushes `screenshots/runs/**`, then
posts an update comment to the provided Linear issue.

## Building for Production

```bash
bun run build
```

### Docker

```bash
docker build -t iridium .
docker run -p 3000:3000 iridium
```

Deployable to Railway, Fly.io, AWS ECS, Google Cloud Run, or any Docker-compatible platform.

## Routes

| Route          | Description                                          |
| -------------- | ---------------------------------------------------- |
| `/`            | Home — overview of what maggies-mental-load includes |
| `/login`       | Sign in or create an account                         |
| `/chat`        | AI chat with thread sidebar                          |
| `/notes`       | Browse saved notes                                   |
| `/profile`     | User profile and role                                |
| `/form`        | Form validation example                              |
| `/api/chat`    | Chat API endpoint                                    |
| `/api/auth/*`  | Auth API endpoints                                   |
| `/healthcheck` | Health status                                        |
