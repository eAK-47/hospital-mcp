# NitroCloud Deployment Guide

## Quick Deployment Checklist

### ✅ Completed Steps
- [x] Updated `.env` with Gemini API key
- [x] Updated `.env.example` with Gemini configuration
- [x] Added `@google/generative-ai` to `package.json`
- [x] Modified `src/ai.service.ts` to use native Gemini API
- [x] Updated `README.md` with Gemini configuration
- [x] Committed and pushed changes to GitHub

### 📋 Next Steps for Automatic Deployment

#### 1. Install NitroCloud GitHub App
- Go to NitroCloud dashboard
- Navigate to App → MCP → Deployments
- Install/connect the NitroCloud GitHub App to your repository: `eAK-47/hospital-mcp`

#### 2. Configure Environment Variables in NitroCloud
Add these environment variables in the NitroCloud dashboard:

| Variable | Value |
|----------|-------|
| `NITRO_LOG_LEVEL` | `info` |
| `NITROSTACK_APP_MODE` | `openai` |
| `MCP_TRANSPORT_TYPE` | `dual` |
| `PORT` | `3000` |
| `HOST` | `0.0.0.0` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_mwEK7S9kiOPz@ep-little-meadow-awdnjdk6.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `DB_ENABLED` | `true` |
| `AI_API_KEY` | `your_gemini_api_key_here` |
| `AI_MODEL` | `gemini-2.0-flash` |

**Note:** `AI_BASE_URL` is not needed for native Gemini SDK.

#### 3. Enable Automatic Deployment
- In NitroCloud dashboard, select your repository
- Choose branch: `member-1-mcp` (or create a `main` branch)
- Enable "Automatic deployment" for the selected branch
- Optionally enable "Automatic NitroChat deployment"

#### 4. Deploy
- Push to the configured branch triggers automatic deployment
- Or manually trigger "Deploy from GitHub"

## Deployment Package Structure

For ZIP upload method, include only these files:

```
hospital-mcp/
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env.example
├── schema.sql
└── src/
    ├── index.ts
    ├── app.module.ts
    ├── http-api.ts
    ├── db.ts
    ├── ai.service.ts
    └── modules/
        └── hospital-guardian/
```

## Troubleshooting

### If deployment fails:
1. Check that `package.json` is at the root of the archive
2. Verify all required files are included
3. Check environment variables are set correctly
4. Review NitroCloud logs for build errors

### If Gemini API fails:
1. Verify API key is valid
2. Check model name is correct (`gemini-2.0-flash`)
3. System will fall back to template-based generation if API fails

## API Endpoints (Post-Deployment)

- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/patients/priority` - Get priority patient
- `GET /api/history` - Get telemetry history
- `GET /api/checklist` - Get nurse checklist
- `GET /api/notifications` - Get notifications
- `GET /api/connections` - Get connection status
- `POST /api/telemetry` - Update telemetry data