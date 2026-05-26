# OficiosPro

Production marketplace site with a public frontend, admin dashboard, Netlify Functions API, and persistent Netlify Blobs storage.

## Live URLs

- Public site: https://oficiospro-live.netlify.app
- Admin: https://oficiospro-live.netlify.app/admin.html
- Netlify project: https://app.netlify.com/projects/oficiospro-live
- GitHub repo: https://github.com/yihuwangji/oficiospro-live
- Netlify site ID: `71d25838-dffe-4e63-9485-3d6658fed790`

## Stack

- Static frontend: `index.html`
- Admin dashboard: `admin.html`
- API: `netlify/functions/api.mjs`
- Persistent storage: Netlify Blobs store `oficiospro-data`
- Hosting: Netlify

## Local Setup

```powershell
npm install
npx netlify dev
```

Then open:

```text
http://localhost:8888
http://localhost:8888/admin.html
```

## Admin Access

The admin API checks the `ADMIN_TOKEN` Netlify environment variable. Do not commit the real token.

For local development, create `.env` from `.env.example` and set:

```text
ADMIN_TOKEN=your-private-token
```

## Deploy

```powershell
npx netlify login
npx netlify link
npx netlify deploy --prod --dir .
```

The current Netlify site name is `oficiospro-live`.

## API

- `GET /api/public`: public professionals and content
- `POST /api/public`: create customer lead
- `GET /api/admin`: admin data, requires `x-admin-token`
- `PATCH /api/admin/lead-status`: update lead status
- `POST /api/admin/professional`: create/update professional
- `DELETE /api/admin/professional`: delete professional
- `PATCH /api/admin/content`: update homepage content
- `POST /api/admin/reset`: reset seed data

## Handoff To Another Computer

1. Clone the repository.

   ```powershell
   git clone https://github.com/yihuwangji/oficiospro-live.git
   cd oficiospro-live
   ```

2. Run `npm install`.
3. Run `npx netlify login` with the Netlify account that owns `oficiospro-live`.
4. Run `npx netlify link` and choose `oficiospro-live` if it is not already linked.
5. Use `npx netlify dev` for local work.
6. Publish with `npx netlify deploy --prod --dir .`.

If `npx netlify link` asks for a site ID, use:

```text
71d25838-dffe-4e63-9485-3d6658fed790
```

## Continuing Work With Codex

On a new computer, open the cloned folder in Codex and say what you want changed. Codex can run local checks, edit files, commit, push, and deploy as long as GitHub and Netlify are logged in on that machine.
