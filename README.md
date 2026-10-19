# SignalBoard

SignalBoard helps builders discover personalized micro-SaaS ideas, publish focused landing pages, and measure early interest through waitlists.

## Tech stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS and shadcn/ui-compatible design tokens
- Lucide React icons
- Supabase Auth, Postgres, and Row Level Security
- OpenAI-compatible API for idea generation
- Vercel deployment

## Run locally
1. Install Node.js 20.9 or newer.
2. Clone and install dependencies:
   ```bash
   git clone https://github.com/Fahaam-Jaffery/signalboard.git
   cd signalboard
   npm install
   cp .env.example .env.local
   npm run dev
   ```
3. Open http://localhost:3000.

The marketing site and sample idea preview can be explored without external keys. Authentication, saved preferences, publishing, and waitlist persistence require Supabase configuration.

## Supabase setup
1. Create a Supabase project.
2. Copy the Project URL and anon/public key from Project Settings → API into `.env.local`.
3. Run `supabase/schema.sql` in Supabase → SQL Editor.
4. In Authentication → URL Configuration, set the Site URL for local development and add your production URL to Redirect URLs.
5. Enable Google under Authentication → Providers and configure Google OAuth credentials if you want Google sign-in.

## Environment variables
See `.env.example`. For Grok, set `OPENAI_API_KEY` to your xAI API key, `AI_BASE_URL=https://api.x.ai/v1`, and `AI_MODEL` to a model enabled for your account. Keep provider keys server-only.

## Vercel deployment
- Import this repository into Vercel.
- Add the environment variables from `.env.example` in Project Settings → Environment Variables.
- Set `NEXT_PUBLIC_SITE_URL` to the production URL.
- Add the production URL to Supabase Auth redirect allowlists and your Google OAuth settings.
- Redeploy after environment variables are set and inspect the build logs.

## Notes
- Idea generation clearly returns sample ideas when no AI key is configured.
- Duplicate waitlist emails for the same page are handled gracefully.
- Apply the SQL schema before using database-backed features.
- Add rate limiting/CAPTCHA and a privacy notice before promoting public waitlists widely.
