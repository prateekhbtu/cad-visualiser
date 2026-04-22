# CAD Visualizer

Internal tool for generating photorealistic room visualizations from architectural CAD drawings, powered by **Nano Banana** (Gemini 2.5 Flash Image) on Vertex AI.

## Repository layout

```
/
├── frontend/        React + Vite + TypeScript + Tailwind app
├── backend/         Hono + TypeScript server (Vertex AI / Imagen)
├── .env             Shared config (loaded by the backend from repo root)
├── .env.example
└── package.json     Root orchestration (concurrently runs both)
```

## Prerequisites

- Node.js 18+ or Bun
- Google Cloud project with Vertex AI API enabled and access to `gemini-2.5-flash-image`
- A service account with the **Vertex AI User** role (`roles/aiplatform.user`) — the backend authenticates with its `client_email` + `private_key` directly from `.env`, so no `gcloud auth` step is required

## Setup

```bash
git clone <repo>
cd cad-visualizer

# Install all workspaces (root + frontend + backend)
npm run install:all

# Configure environment — see .env.example for the full schema
cp .env.example .env
# Fill in:
#   VERTEX_AI_PROJECT_ID
#   VERTEX_AI_LOCATION          (default: us-central1)
#   VERTEX_AI_CLIENT_EMAIL      (from the service-account JSON key)
#   VERTEX_AI_PRIVATE_KEY       (paste the full PEM; keep the \n escapes, wrap in double quotes)
#   VERTEX_AI_MODEL             (default: gemini-2.5-flash-image)

# Start both apps (Vite on :5173, Hono on :3001)
npm run dev
```

Vite proxies `/api/*` to the Hono server, so the frontend calls same-origin in dev.

Run a single side:

```bash
npm run dev:web    # frontend only
npm run dev:api    # backend only
```

## Deployment

The Hono server exports `app` as default — it can be deployed to:

- Cloudflare Workers (`hono/cloudflare-workers` adapter)
- Vercel Edge Functions (`hono/vercel` adapter)
- Any Node server (current `@hono/node-server` setup)

Frontend: build with `npm run build` and deploy `frontend/dist/` to Vercel/Netlify. Set `VITE_API_BASE_URL` to your deployed Hono URL.

## How it works

1. User uploads a CAD image (floor plan, elevation, or single-room sketch).
2. User picks aesthetic preferences: **Design Style**, **Vibe**, **Color Palette** — no room list, no house type.
3. Backend calls `gemini-2.5-flash` with the CAD to auto-detect 3-6 distinct sections (name, description, viewpoint).
4. Backend calls `gemini-2.5-flash-image` (Nano Banana) in parallel, once per section × 2 variations, with the locked-geometry + style prompt.
5. Frontend renders each section as a labelled card: name, description, viewpoint, and two variations.

## API

**POST /api/generate** — `multipart/form-data`

- `cadFile`: File (PNG/JPG/PDF, max 15MB)
- `preferences`: JSON string `{ style, vibe, colorPalette }`

Response:

```json
{
  "success": true,
  "sections": [
    {
      "name": "Kitchen & Dining",
      "description": "Open galley with a central island, bar seating, and a full-height pantry.",
      "viewpoint": "Standing at the main entry, facing the kitchen island.",
      "variations": [
        { "index": 1, "imageBase64": "...", "mimeType": "image/jpeg" },
        { "index": 2, "imageBase64": "...", "mimeType": "image/jpeg" }
      ]
    }
  ]
}
```

Failed sections come back as `{ name, description, viewpoint, error: true, errorMessage, variations: [] }`.

**GET /api/health** → `{ status: "ok", model: string, textModel: string }`
