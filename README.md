# AirWatch backend starter (Vercel + Supabase)

This is a first backend layer for the AirWatch frontend. It stores campaigns, trailer uploads, channel URLs and alert history. It can send a clearly labelled **demo email**. It does NOT detect real trailer airings yet.

## Set up (browser-based, no local installation required)

1. Create a Supabase project at https://supabase.com.
2. In Supabase → SQL Editor, run `sql/schema.sql`.
3. In Supabase → Storage, create a **private** bucket named `trailer-cuts`.
4. In Supabase → Project Settings → API, copy Project URL and `service_role` key. Keep the service-role key secret.
5. Push these files to the same GitHub repository as your Vercel project. Keep the existing `index.html` at the repository root. Merge the `api/`, `sql/`, `package.json`, and `vercel.json` files into that repository.
6. In Vercel → Project → Settings → Environment Variables, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` (optional, for demo email)
   - `ALERT_FROM_EMAIL` (optional; must be a sender verified with Resend)
7. Redeploy in Vercel.

## Endpoints

- `GET /api/data` — dashboard data
- `POST /api/campaigns` — create campaign (JSON body with `title`, `alert_email`)
- `POST /api/cuts` — upload a trailer file (multipart form; field `campaign_id` plus file field)
- `POST /api/channels` — save YouTube URL (form or JSON)
- `POST /api/simulate/<campaign-id>` — add a demo alert and optionally email a demo notification

## Important limitations and security

- This starter is not production-ready: it does not implement login/tenant isolation or rate limiting. Do not use it with confidential client campaigns until those are added.
- A Supabase service-role key is highly privileged; only add it as a Vercel server environment variable. Never put it in `index.html` or any `NEXT_PUBLIC_` variable.
- Large uploads may exceed serverless request limits; a direct-to-Supabase signed upload flow should replace the current upload endpoint before production.
- The frontend HTML must send the fields `title`, `alert_email`, `campaign_id`, `url` (or `channel_url`), and a file field named `file` or `cut`. If its names differ, align the endpoint or frontend.
- Demo alerts are not evidence of real detection. The live monitor requires a separate persistent worker, authorized ingest, audio/video fingerprinting, duplicate suppression, and measured validation against real broadcasts.
- Do not bypass platform restrictions or access controls. Only monitor feeds you are authorized to ingest.
