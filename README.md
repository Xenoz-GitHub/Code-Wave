# CodeWave — Browser IDE

A fullstack browser-based code editor built with Next.js, Neon DB, and Neon Auth.

## Features

- **Code Editor** — Monaco Editor (VS Code engine) with IntelliSense, multi-tabs
- **50+ Languages** — Execute code via Piston API (JS, Python, C++, Rust, Go, etc.)
- **Live Preview** — HTML/CSS/JS iframe preview with responsive viewports
- **File Manager** — Tree view, drag-drop upload, image preview, mobile drawer
- **Real-time Collaboration** — WebSocket-based multi-user editing (optional)
- **Export/Import** — Download/upload projects as ZIP
- **Dark/Light Theme** — Toggleable
- **PWA** — Installable on mobile (Add to Home Screen)
- **Auth** — Email OTP via Neon Auth

## Tech Stack

| Layer | Stack |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Neon (serverless PostgreSQL) |
| Auth | Neon Auth (email OTP, OAuth) |
| Editor | Monaco Editor |
| Code Execution | Piston API |
| Real-time | WebSocket |
| Styling | Tailwind CSS |

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) account (free tier)
- A Neon project with Auth enabled

## Setup

```bash
git clone <repo-url>
cd codewave

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Neon DB and Auth URLs

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import repo into [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` — Your Neon DB connection string
   - `NEXT_PUBLIC_NEON_AUTH_URL` — Your Neon Auth URL
4. Deploy

> Note: Real-time collaboration requires a WebSocket server. The app gracefully degrades when one isn't available.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_NEON_AUTH_URL` | Yes | Neon Auth service URL |
| `NEXT_PUBLIC_WS_URL` | No | WebSocket server URL (for collaboration) |

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── api/          # REST API endpoints
│   ├── auth/         # Sign in/up page
│   ├── account/      # Account management
│   ├── dashboard/    # Project listing
│   └── editor/[id]/  # The IDE
├── components/       # React components
│   ├── Editor/       # Monaco editor
│   ├── FileManager/  # File tree, upload, mobile drawer
│   ├── Output/       # Code output panel
│   ├── Preview/      # Live preview iframe
│   └── Collaboration/# Real-time collaboration UI
├── lib/              # Auth, Prisma, utilities
├── providers/        # Theme, Neon Auth providers
├── prisma/           # Database schema
└── public/           # Static assets, PWA files
```

## Mobile

CodeWave is a PWA — open in Chrome on Android, tap "Add to Home Screen" to install like an app.
