# My Photo Space — Unique, Smooth, Free-to-deploy

Two ways to use it:

## Path A — 100% Free Static (no backend)
- Host **frontend/** on GitHub Pages (free) or Netlify/Vercel (free subdomain).
- Put your images in `frontend/photos/` and list them in `frontend/photos.json` (already included).
- Works on any device + installable PWA.

## Path B — Full‑Stack (upload from web UI)
- Run **backend/** (Node + Express) on a free host (Railway/Render) and keep **frontend/** on GitHub Pages or the same host.
- Upload with `POST /api/upload` (field `photo`, optional `caption`, `tags` as CSV). Frontend will auto‑load from `/api/photos`.

---

## Local quickstart

### Static preview (Path A)
```bash
cd frontend
# Use any static server (Python 3)
python -m http.server 8080
# or VS Code Live Server extension
# then open http://localhost:8080
```

- Add your images into `frontend/photos/` and update `frontend/photos.json` with their paths and tags.
- The site will also work offline thanks to the service worker.

### Full‑stack dev (Path B)
```bash
cd backend
npm install
npm run dev  # starts server on http://localhost:3000
```
In another terminal:
```bash
cd frontend
python -m http.server 8080
```
Open http://localhost:8080 — the frontend tries `/api/photos` first (backend), then falls back to local `photos.json`.

**Test upload (Path B):**
```bash
curl -F "photo=@/absolute/path/to/your.jpg" -F "caption=My shot" -F "tags=me,portrait" http://localhost:3000/api/upload
```

---

## Free domain & deployment

### Easiest free subdomain (recommended)
- **GitHub Pages** → `https://USERNAME.github.io` (free, stable).  
  Steps:
  1) Create a repo `USERNAME.github.io` and push the `frontend/` files (contents directly in repo root).  
  2) In Repo → Settings → Pages: set Branch = `main` (or `master`) → `/` root.  
  3) Your site is live at `https://USERNAME.github.io` in a minute or two.
- **Netlify / Vercel** → automatic builds from your repo with a free subdomain like `yourname.netlify.app` or `yourname.vercel.app`.

### Custom domain for free?
- Fully free custom TLDs are rare/unreliable. A safer path is a **free subdomain** (above). If you buy a cheap domain, you can point it to GitHub Pages or Netlify easily.

### Deploy backend for free (optional)
- Use **Railway** or **Render** free tiers. Create a new service from your GitHub repo containing `backend/` and set:
  - Start command: `node server.js`
  - Root directory: `backend`
  - Add a persistent storage/volume if offered (or the DB JSON will reset on restarts).
  - After deploy, note the public URL (e.g., `https://your-app.onrender.com`).  
- Update `frontend/app.js` to prefer that URL by changing the `sources` array to `["https://your-app.onrender.com/api/photos", "photos.json"]`.

---

## Where do I add my photos?

### Path A (static)
- Copy your images to `frontend/photos/`
- Edit `frontend/photos.json` like:
```json
[
  { "url": "photos/mypic1.jpg", "caption": "Me at the beach", "tags": ["me","travel"] },
  { "url": "photos/mypic2.png", "caption": "Portrait", "tags": ["portrait"] }
]
```

### Path B (backend)
- Upload via REST as shown, or copy files to `backend/public/photos/` and add them to `backend/data/photos.db.json` with:
```json
[
  { "id":"abc", "filename":"abc.jpg", "caption":"My shot", "tags":["me"], "uploadedAt":"2025-01-01T00:00:00.000Z" }
]
```

---

## Customize the look
- Edit `frontend/styles.css`: colors, gradients, card radius, columns, etc.
- Replace the site title/logo in `frontend/index.html`.

---

## Notes
- This starter avoids heavy frameworks for speed and simplicity.
- If you later need user accounts or private galleries, add auth (e.g., Clerk/Supabase) and move images to an object store (e.g., Cloudflare R2, S3).

Happy shipping! 🚀
