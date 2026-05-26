# Vercel Runbook — arcg-site

## Project Facts

- **Vercel project:** `arcg-site`
- **Git repo:** `thekidd2227/GOVCON`
- **Branch:** `main`
- **Framework:** Next.js (App Router)
- **Site source:** `sites/ariels-river-contracting-group`
- **Required Vercel Dashboard Root Directory:** `sites/ariels-river-contracting-group`

## Configuration Rule

**Do NOT set `rootDirectory` inside `vercel.json`.** It is not a valid Vercel
configuration key and will fail the deployment. The Root Directory is a
**project-level dashboard setting**, not a repo-level config.

The root of the GOVCON repo intentionally has **no `vercel.json`**.
`vercel.json` should only be added back if there is real, valid Vercel
configuration to express (rewrites, redirects, headers, crons, function
config, etc.) — and even then it lives under the Root Directory the
dashboard points at, not at the GOVCON repo root.

## How to Set Root Directory in the Dashboard

1. Open Vercel → Projects → `arcg-site`.
2. Settings → Build and Deployment → **Root Directory**.
3. Set value: `sites/ariels-river-contracting-group`.
4. Save.
5. Trigger a redeploy (push a commit or click Redeploy).

## Common Failure Modes

| Symptom | Likely Cause | Fix |
|---|---|---|
| `Error: Invalid vercel.json — Property rootDirectory is not allowed.` | `rootDirectory` key was added to `vercel.json` | Remove `vercel.json` (or strip `rootDirectory` from it) and set Root Directory in the dashboard. |
| Build runs at repo root, can't find `package.json` for the site | Dashboard Root Directory not set | Set Root Directory to `sites/ariels-river-contracting-group`. |
| Next.js build runs but serves a stale or wrong app | Wrong Root Directory in dashboard | Confirm Root Directory matches the site path exactly. |

## Verification Checklist

After any Vercel-related change to GOVCON:

- [ ] Repo root contains no `vercel.json` (unless we genuinely need rewrites/redirects/headers/crons)
- [ ] Vercel project `arcg-site` Root Directory = `sites/ariels-river-contracting-group`
- [ ] `sites/ariels-river-contracting-group/package.json` declares the Next.js scripts
- [ ] Latest deployment on the `arcg-site` project shows `Ready`

## Out of Scope for This Runbook

- ChartNav, SourceDeck, or any non-ARCG Vercel projects
- `.env.local`, Vercel secrets, environment variables (managed through Vercel dashboard / `vercel env`, not committed)
- Buffer / social posting workflows
