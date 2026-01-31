# @hyper/backend

Production-ready Node.js + Express + TypeScript backend starter.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | Type check |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/ready` | GET | Readiness probe |

## Project Structure

```
src/
├── index.ts        # Entry point
├── app.ts          # Express factory
├── config/env.ts   # Zod env validation
├── lib/logger.ts   # Pino logger
├── middleware/     # Request logging, error handling
└── routes/         # API routes
```
