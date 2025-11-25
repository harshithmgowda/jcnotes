This repository includes a SQL file `supabase-delete-policy.sql` that allows deletion of storage objects for the `notes` bucket.

Run the SQL in your Supabase project to enable storage delete permissions for the `notes` bucket (or modify to match your security model).

How to run
1. Go to your Supabase project → SQL Editor → New Query
2. Paste the contents of `supabase-delete-policy.sql` and click Run

Recommended (safer) approach
- Use the server-side deletion endpoint included in `server/` (see below) that uses the Supabase `service_role` key to perform storage + DB deletions securely.
- Do NOT expose `service_role` key to clients. Store it in server environment variables only.

Server usage (local)
1. cd server
2. npm install
3. copy `.env.example` to `.env` and fill in values:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - PORT (optional)
   - ADMIN_EMAILS (comma-separated list of admin emails)
4. npm run dev

API
POST /delete-note
Headers: Authorization: Bearer <access_token>
Body: { "id": "<note_id>" }

Notes
- The SQL in `supabase-delete-policy.sql` is permissive for storage deletes. In production, prefer to deny client storage deletes and rely on the secure server endpoint.
- Always rotate your service_role key if it is ever exposed.

