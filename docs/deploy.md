## Deploying to Vercel

1. Create a Vercel project from this repo.
2. Set Environment Variables in Project Settings:
   - `EXPLORIUM_API_KEY` (Server)
   - `NEXT_PUBLIC_CALENDLY_URL` (Client)
   - `APP_ORIGIN` (e.g., `https://steelmatch.vercel.app`)
3. Ensure `vercel.json` is present; framework is detected automatically.
4. Trigger a deploy.

Local dev server runs on `http://localhost:5173` (see package.json scripts).


