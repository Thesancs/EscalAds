# EscalAds Web

Next.js 15 dashboard that surfaces captured Meta ads, filters, and insights for media buyers.

## Development

```bash
npm install
npm run dev:web
```

Environment variables live in `.env.local` (see `.env.example`). The only required variable is `NEXT_PUBLIC_API_URL` pointing to the running Fastify API (defaults to `http://localhost:4000`).

Auth is powered by JWT tokens returned by the `/auth/login` endpoint. Tokens are stored in `localStorage` by the `AuthProvider`.

Key stacks:

- App Router + React Server Components
- shadcn/ui + TailwindCSS for layout
- React Query for client-side data
- Shared DTOs imported from `@escalads/shared`

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Run the production server |
| `npm run lint` | ESLint (Next config) |
| `npm run typecheck` | TypeScript type checking |
