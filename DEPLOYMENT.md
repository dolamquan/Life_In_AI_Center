
## Live URLs
- **Frontend:** 
- **Backend:**

---

## GitHub
- **Repo:** 
- **Branch:** main

Push changes:
```bash
git add .
git commit -m "your message"
git push
```

Render and Vercel auto-deploy on every push to main.

---

## Backend — Render

**Service:** 
**Root Directory:** backend
**Build Command:** `npm install --include=dev && npm run build`
**Start Command:** `npm start`

### Environment Variables
| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | (set in Render dashboard) |
| `NODE_ENV` | production |
| `CORS_ORIGIN` |  |

> Free tier sleeps after 15min — first request can take 50+ seconds.

---

## Frontend — Vercel

**Project:** 
**Root Directory:** frontend
**Framework:** Vite

### Environment Variables
| Key | Value |
|-----|-------|
| `VITE_API_URL` |  |

> After changing env vars in Vercel, you must trigger a Redeploy for changes to take effect.

---

## Local Development

```bash
# Backend
cd backend
npm run dev        # runs on http://localhost:3000

# Frontend
cd frontend
npm run dev        # runs on http://localhost:5173
```

Frontend proxies `/api` requests to `localhost:3000` automatically in dev.
