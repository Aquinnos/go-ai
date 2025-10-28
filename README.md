## Go AI

Go AI is a Gemini-inspired conversational assistant built with Next.js 15 App Router, Prisma (MongoDB), NextAuth, TanStack Query, React Hook Form, and Tailwind + shadcn/ui.

### Features

- Authenticated chat experience with Markdown responses, copy-to-clipboard, usage quota indicator, and mobile sidebar.
- Chat management: create, rename, delete threads.
- Account settings: update display name, avatar URL, and password.
- Middleware-protected routes and structured logging.

### Development

```bash
npm install
npm run dev
```

Environment variables required:

- `DATABASE_URL` – MongoDB connection string used by Prisma.
- `NEXTAUTH_SECRET` – secret for NextAuth JWT/encryption.
- `GOOGLE_API_KEY` – API key for Gemini (or adjust `lib/gemini.ts`).

Run Prisma migrations and generate types as needed:

```bash
npx prisma migrate deploy
npx prisma generate
```

### Deployment

The project targets Vercel. Configure the same environment variables in your hosting environment and run `npm run build` before deploying.
