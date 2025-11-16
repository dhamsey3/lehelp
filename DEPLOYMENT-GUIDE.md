# LEHELP Production Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION STACK                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Vercel         │         │   Render.com     │         │   Supabase       │
│   (Frontend)     │────────▶│   (Backend API)  │────────▶│   (PostgreSQL)   │
│                  │  HTTPS  │                  │  TCP    │                  │
│  React + Vite    │         │  Node.js + TS    │         │  Database        │
│  Material-UI     │         │  Express.js      │         │  + Storage       │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │
        │                            │
        └────────────────┬───────────┘
                         │
                    ┌────▼────┐
                    │  User   │
                    │ Browser │
                    └─────────┘
```

## Deployed Services

### 1. Frontend (Vercel)
- **URL**: https://lehelp-client-portal-9k8eu63cv-damis-projects-71187cb1.vercel.app
- **Platform**: Vercel
- **Framework**: Vite + React + TypeScript
- **Repository**: `dhamsey3/lehelp`
- **Root Directory**: `frontend/client-portal`

**Environment Variables:**
```
VITE_API_URL=https://lehelp-backend.onrender.com/api/v1
VITE_APP_NAME=LEHELP - Legal Aid Platform
VITE_APP_VERSION=1.0.0
VITE_ENABLE_PWA=true
VITE_ENVIRONMENT=production
```

### 2. Backend API (Render.com)
- **URL**: https://lehelp-backend.onrender.com
- **Platform**: Render.com (Free Tier)
- **Runtime**: Node.js 18
- **Repository**: `dhamsey3/lehelp`
- **Root Directory**: `backend/api-gateway`

**Environment Variables:**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres.eciilaafspnteitrntog:+PAU-.sC_@y7jRy@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
CORS_ORIGIN=https://lehelp-client-portal-9k8eu63cv-damis-projects-71187cb1.vercel.app,http://localhost:3000
JWT_SECRET=<secret>
REFRESH_TOKEN_SECRET=<secret>
ENCRYPTION_KEY=<secret>
SESSION_SECRET=<secret>
SUPABASE_SERVICE_ROLE_KEY=<secret>
```

### 3. Database (Supabase)
- **Host**: aws-1-eu-north-1.pooler.supabase.com
- **Port**: 5432 (Session Pooler - IPv4 compatible)
- **Type**: PostgreSQL
- **Tables**: 11 tables (users, cases, documents, messages, etc.)

**Connection Details:**
- Direct Connection (IPv6): `postgresql://postgres.eciilaafspnteitrntog:[PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:6543/postgres`
- Session Pooler (IPv4): `postgresql://postgres.eciilaafspnteitrntog:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:5432/postgres`
- **Used**: Session Pooler for Render compatibility

## API Endpoints

### Base URL
```
https://lehelp-backend.onrender.com
```

### Available Routes
```
GET  /                           # API info
GET  /health                     # Health check
GET  /api/v1/test               # System status

POST /api/v1/auth/register      # Create account
POST /api/v1/auth/login         # Login
POST /api/v1/auth/refresh       # Refresh token
POST /api/v1/auth/logout        # Logout
GET  /api/v1/auth/verify-email/:token
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password

GET  /api/v1/cases              # List cases
POST /api/v1/cases              # Create case
GET  /api/v1/cases/:id          # Get case
PUT  /api/v1/cases/:id          # Update case

GET  /api/v1/users/profile      # Get profile
PUT  /api/v1/users/profile      # Update profile

POST /api/v1/documents/upload   # Upload document
GET  /api/v1/documents/:id      # Get document

GET  /api/v1/messages/:caseId   # Get messages
POST /api/v1/messages           # Send message
```

## Request Flow

```
User Browser
    │
    │ 1. User visits frontend
    ▼
Vercel Frontend (React App)
    │
    │ 2. User submits registration form
    │ 3. POST /api/v1/auth/register
    │    Headers: Content-Type: application/json
    │    Body: { email, password, role, displayName }
    ▼
Render Backend (Express API)
    │
    │ 4. CORS Check (allow Vercel origin)
    │ 5. Validate request body
    │ 6. Hash password
    ▼
Supabase Database
    │
    │ 7. INSERT INTO users
    │ 8. INSERT INTO user_profiles
    │ 9. INSERT INTO activity_logs
    ▼
Render Backend
    │
    │ 10. Generate JWT token
    │ 11. Send response
    ▼
Vercel Frontend
    │
    │ 12. Store token in localStorage
    │ 13. Redirect to dashboard
    ▼
User Dashboard
```

## Deployment Process

### Frontend (Vercel)
1. **Automatic**: Push to GitHub `main` branch
2. Vercel detects changes in `frontend/client-portal`
3. Builds with: `npm run build` (TypeScript + Vite)
4. Deploys to CDN globally
5. ~2-3 minutes total

### Backend (Render)
1. **Automatic**: Push to GitHub `main` branch
2. Render detects changes in `backend/api-gateway`
3. Builds Docker image
4. Runs: `npm install && npm run build`
5. Starts: `npm start`
6. ~3-5 minutes total

## Common Issues & Solutions

### Issue: CORS Error
**Symptoms**: 
- Browser console shows: `Access to XMLHttpRequest has been blocked by CORS policy`
- Network tab shows `(failed)` or `CORS error`

**Solution**:
Update `CORS_ORIGIN` on Render to include your Vercel URL:
```
CORS_ORIGIN=https://lehelp-client-portal-9k8eu63cv-damis-projects-71187cb1.vercel.app,http://localhost:3000
```

### Issue: Cannot POST /auth/register
**Symptoms**:
- Error message: `Cannot POST /auth/register`
- 404 Not Found

**Solution**:
Update `VITE_API_URL` in Vercel to include `/api/v1`:
```
VITE_API_URL=https://lehelp-backend.onrender.com/api/v1
```
Then redeploy frontend.

### Issue: Database Connection Failed
**Symptoms**:
- Backend logs show: `ENETUNREACH` or `connection timeout`

**Solution**:
Use IPv4 Session Pooler instead of direct connection:
```
DATABASE_URL=postgresql://postgres.eciilaafspnteitrntog:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

### Issue: Redis Connection Timeout
**Symptoms**:
- Render deployment times out
- Logs show: `Redis Client Error: connect ECONNREFUSED`

**Solution**:
Redis is optional. The backend has fallback handling:
- Connection timeout set to 5 seconds
- Auto-reconnect disabled
- Graceful degradation (in-memory rate limiting)

### Issue: TypeScript Build Errors
**Symptoms**:
- Vercel build fails with TS errors
- `Property 'env' does not exist on type 'ImportMeta'`

**Solution**:
Ensure `vite-env.d.ts` exists with proper types:
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  // ... other env vars
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Security Configuration

### HTTPS/TLS
- ✅ Vercel: Automatic HTTPS with free SSL
- ✅ Render: Automatic HTTPS with free SSL
- ✅ Supabase: TLS 1.2+ enforced

### CORS Policy
- **Allowed Origins**: Vercel frontend + localhost for development
- **Credentials**: Enabled for cookie-based auth
- **Methods**: GET, POST, PUT, DELETE, OPTIONS

### Environment Variables
- ❌ Never commit `.env` files
- ✅ Use platform environment variable managers
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/prod

### Password Security
- Hashing: bcrypt with cost factor 12
- Min length: 8 characters
- Storage: Never stored in plaintext

### JWT Tokens
- Access token: 24h expiry
- Refresh token: 7d expiry
- Stored in: localStorage (frontend) + Redis (backend)

## Monitoring & Logs

### Frontend (Vercel)
- **Deployments**: https://vercel.com/dashboard
- **Logs**: Real-time function logs
- **Analytics**: Page views, performance metrics

### Backend (Render)
- **Deployments**: https://dashboard.render.com
- **Logs**: Live tail with `render logs`
- **Metrics**: CPU, memory, request count

### Database (Supabase)
- **Dashboard**: https://supabase.com/dashboard
- **Logs**: Query performance, errors
- **Metrics**: Connection count, query latency

## Performance Metrics

### Frontend (Vercel)
- **First Load**: ~2-3s
- **Time to Interactive**: ~3-4s
- **Bundle Size**: ~530KB (gzipped)
- **CDN**: Global edge network

### Backend (Render - Free Tier)
- **Cold Start**: 30-60s (first request after inactivity)
- **Warm Response**: 100-300ms
- **Memory**: 512MB limit
- **CPU**: Shared

### Database (Supabase)
- **Latency**: 50-150ms (EU to EU)
- **Connection Pool**: Session Pooler (6543 connections max)
- **Storage**: Unlimited (free tier)

## Backup & Recovery

### Database Backups
- **Automatic**: Daily backups by Supabase
- **Retention**: 7 days (free tier)
- **Manual**: Export via Supabase dashboard

### Code Repository
- **GitHub**: Full version history
- **Branches**: `main` (production), `dev` (development)

## Cost Breakdown

| Service | Tier | Cost | Limits |
|---------|------|------|--------|
| Vercel | Free | $0/mo | 100 GB bandwidth, unlimited deployments |
| Render | Free | $0/mo | 750 hours/month, sleeps after 15min inactivity |
| Supabase | Free | $0/mo | 500MB database, 1GB storage, 2GB bandwidth |
| **Total** | | **$0/mo** | |

**Note**: Free tier limitations:
- Render backend sleeps after 15 minutes of inactivity (30-60s cold start on next request)
- Supabase pauses after 7 days of inactivity

## Upgrade Path

When ready to scale:

1. **Render** → Paid ($7/mo): No sleep, faster CPU, more memory
2. **Supabase** → Pro ($25/mo): 8GB database, 100GB storage, no pause
3. **Vercel** → Pro ($20/mo): Advanced analytics, priority support
4. **Add Redis** → Upstash ($10/mo): Distributed rate limiting, sessions

**Total Paid**: ~$62/month for production-grade infrastructure

## Maintenance Checklist

### Weekly
- [ ] Check Render logs for errors
- [ ] Monitor Supabase database size
- [ ] Review failed login attempts

### Monthly
- [ ] Update dependencies (`npm audit fix`)
- [ ] Review and rotate API keys
- [ ] Check storage usage

### Quarterly
- [ ] Database backup download
- [ ] Security audit
- [ ] Performance optimization review

## Contact & Support

- **GitHub Issues**: https://github.com/dhamsey3/lehelp/issues
- **Render Support**: https://render.com/docs
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support

---

**Last Updated**: November 16, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
