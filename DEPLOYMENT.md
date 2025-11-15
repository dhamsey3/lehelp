# 🚀 LEHELP Platform - Production Deployment Guide

## Free Hosting Strategy

This guide will help you deploy LEHELP to free hosting platforms with zero cost.

### Architecture Overview

```
Frontend (Vercel) → Backend (Railway/Render) → Database (Free PostgreSQL)
                           ↓
                    AI Service (Render)
                           ↓
                    Redis (Upstash Free)
```

---

## Prerequisites

1. **GitHub Account** - For CI/CD and container registry
2. **Vercel Account** - For frontend hosting
3. **Railway/Render Account** - For backend & AI service
4. **Upstash Account** - For Redis (free tier)
5. **Supabase/Neon Account** - For PostgreSQL (free tier)

---

## Step 1: Database Setup

### Option A: Supabase (Recommended for Free Tier)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for provisioning (~2 minutes)
4. Copy the connection string from Settings → Database
5. Run migrations:
   ```bash
   psql "your-connection-string" -f database/schema.sql
   ```

### Option B: Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Run migrations as above

### Redis Setup (Upstash)

1. Sign up at [upstash.com](https://upstash.com)
2. Create a new Redis database (free tier: 10K commands/day)
3. Copy the `REDIS_URL` from the dashboard

---

## Step 2: Backend Deployment (Railway - Recommended)

### Railway Setup

1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your forked `lehelp` repository
4. Railway will auto-detect the Node.js project

### Configure Backend Service

1. Set root directory: `backend/api-gateway`
2. Add environment variables:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<your-postgres-connection-string>
REDIS_URL=<your-upstash-redis-url>
JWT_SECRET=<generate-random-string-64-chars>
REFRESH_TOKEN_SECRET=<generate-random-string-64-chars>
ENCRYPTION_KEY=<generate-random-string-32-chars>
SESSION_SECRET=<generate-random-string-64-chars>
CORS_ORIGIN=https://your-frontend-domain.vercel.app
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
S3_ENDPOINT=<cloudflare-r2-or-backblaze-endpoint>
S3_BUCKET=lehelp-documents
S3_ACCESS_KEY=<your-s3-access-key>
S3_SECRET_KEY=<your-s3-secret-key>
AI_SERVICE_URL=https://your-ai-service.onrender.com
```

3. Deploy! Railway will automatically deploy on push to main branch.

**Free Tier Limits:**
- $5/month credit (enough for small projects)
- Automatically sleeps after inactivity
- 500 hours/month

### Alternative: Render.com

1. Sign up at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name:** lehelp-backend
   - **Root Directory:** `backend/api-gateway`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. Add environment variables (same as above)

**Free Tier Limits:**
- 750 hours/month
- Spins down after 15 min inactivity
- Auto-wakes on request

---

## Step 3: AI Service Deployment (Render)

1. In Render dashboard, click "New +" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - **Name:** lehelp-ai-service
   - **Root Directory:** `ai-services`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000`
   - **Instance Type:** Free

4. No environment variables needed for basic setup

---

## Step 4: Frontend Deployment (Vercel)

1. Sign up at [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend/client-portal`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Add environment variables:
```env
VITE_API_URL=https://your-backend.railway.app/api/v1
```

6. Deploy!

**Vercel will:**
- Auto-deploy on every push to main
- Provide HTTPS automatically
- Give you a `.vercel.app` domain
- Support custom domains (free)

**Free Tier:**
- 100GB bandwidth/month
- Unlimited projects
- Automatic SSL

---

## Step 5: File Storage (Cloudflare R2)

### Why R2?
- Free tier: 10GB storage
- Zero egress fees
- S3-compatible API

### Setup:

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Go to R2 → Create Bucket
3. Name it: `lehelp-documents`
4. Create API token with R2 Read & Write permissions
5. Copy:
   - Account ID
   - Access Key ID
   - Secret Access Key
   - Endpoint URL

6. Update backend environment:
```env
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_BUCKET=lehelp-documents
S3_ACCESS_KEY=<access-key-id>
S3_SECRET_KEY=<secret-access-key>
S3_FORCE_PATH_STYLE=true
```

### Alternative: Backblaze B2
- Free tier: 10GB storage
- 1GB/day free download

---

## Step 6: Email Service (SendGrid)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Free tier: 100 emails/day
3. Create API key
4. Verify sender identity
5. Update backend environment:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
SMTP_FROM=noreply@yourdomain.com
```

### Alternative: Resend
- Free tier: 3,000 emails/month
- Better developer experience
- [resend.com](https://resend.com)

---

## Step 7: Set Up CI/CD

The GitHub Actions workflow is already configured in `.github/workflows/ci-cd.yml`.

1. Push code to GitHub
2. GitHub Actions will automatically:
   - Run tests
   - Build Docker images
   - Push to GitHub Container Registry
3. Railway/Render will auto-deploy on successful builds

---

## Step 8: Configure Custom Domain (Optional)

### Frontend (Vercel)
1. Buy domain from Namecheap (~$10/year) or use Freenom
2. In Vercel: Settings → Domains → Add Domain
3. Add DNS records as shown
4. SSL is automatic

### Backend (Railway)
1. In Railway: Settings → Domains → Generate Domain
2. Or add custom domain with CNAME record

---

## Cost Breakdown (Free Tier)

| Service | Free Tier | Limit |
|---------|-----------|-------|
| **Frontend (Vercel)** | Free Forever | 100GB bandwidth |
| **Backend (Railway)** | $5 credit/month | ~500 hours |
| **AI Service (Render)** | Free | 750 hours |
| **Database (Supabase)** | Free | 500MB + 2GB transfer |
| **Redis (Upstash)** | Free | 10K commands/day |
| **Storage (R2)** | Free | 10GB storage |
| **Email (SendGrid)** | Free | 100 emails/day |
| **Total** | **$0/month** | Perfect for MVP |

---

## Scaling Strategy

### When you outgrow free tier:

1. **Phase 1: Keep it Free** ($0/mo)
   - Current setup
   - Good for: 100-500 users

2. **Phase 2: Minimal Cost** ($15-25/mo)
   - Upgrade Railway to Hobby ($5)
   - Upgrade Supabase to Pro ($25)
   - Keep others free
   - Good for: 500-5,000 users

3. **Phase 3: Production Scale** ($100-200/mo)
   - Dedicated database (RDS/CloudSQL)
   - Redis Cloud Pro
   - CDN (Cloudflare)
   - Good for: 5,000-50,000 users

4. **Phase 4: Enterprise** ($500+/mo)
   - AWS/GCP/Azure
   - Multi-region deployment
   - Load balancers
   - Good for: 50,000+ users

---

## Monitoring & Logging

### Free Monitoring Tools:

1. **Sentry** (Error Tracking)
   - Sign up: [sentry.io](https://sentry.io)
   - Free: 5K errors/month
   - Add to backend:
   ```env
   SENTRY_DSN=<your-sentry-dsn>
   ```

2. **Better Stack** (Logs)
   - Sign up: [betterstack.com](https://betterstack.com)
   - Free: 1GB logs/month
   - Great dashboard

3. **UptimeRobot** (Uptime Monitoring)
   - Sign up: [uptimerobot.com](https://uptimerobot.com)
   - Free: 50 monitors
   - 5-minute checks
   - Email/SMS alerts

---

## Security Checklist

- [ ] All secrets in environment variables (never in code)
- [ ] HTTPS enabled everywhere (automatic with Vercel/Railway)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection (input sanitization)
- [ ] CSRF tokens for state-changing operations
- [ ] Secure password hashing (bcrypt)
- [ ] JWT tokens with short expiration
- [ ] Environment-specific configs
- [ ] Database backups enabled
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies updated regularly (`npm audit`)

---

## Quick Deploy Commands

### Deploy Everything in 10 Minutes:

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/lehelp.git
cd lehelp

# 2. Create accounts (manually):
# - Vercel: https://vercel.com
# - Railway: https://railway.app
# - Supabase: https://supabase.com
# - Upstash: https://upstash.com

# 3. Deploy database
psql "your-supabase-connection-string" -f database/schema.sql

# 4. Push to GitHub
git add .
git commit -m "Initial deployment"
git push origin main

# 5. Deploy frontend (Vercel CLI)
cd frontend/client-portal
npx vercel --prod

# 6. Deploy backend (Railway CLI)
cd ../../backend/api-gateway
railway login
railway link
railway up

# 7. Deploy AI service (Render - use dashboard)
# Or use render.yaml in root

# Done! ✅
```

---

## Troubleshooting

### Common Issues:

**1. Backend won't start**
- Check DATABASE_URL is correct
- Verify migrations ran successfully
- Check logs: `railway logs` or Render dashboard

**2. Frontend can't connect to backend**
- Verify VITE_API_URL in Vercel env vars
- Check CORS_ORIGIN in backend includes frontend URL
- Test backend endpoint: `curl https://your-backend.railway.app/health`

**3. Database connection errors**
- Supabase: Enable connection pooling
- Check SSL is enabled in connection string
- Verify IP allowlist (Supabase requires 0.0.0.0/0 for Railway)

**4. Redis connection fails**
- Upstash: Copy full REDIS_URL (includes password)
- Check TLS is enabled

**5. Email not sending**
- SendGrid: Verify sender identity
- Check API key is valid
- Review SendGrid activity logs

---

## Next Steps After Deployment

1. **Set up monitoring** (Sentry, UptimeRobot)
2. **Configure custom domain**
3. **Enable database backups** (Supabase: automatic)
4. **Add analytics** (Plausible/Umami - privacy-friendly)
5. **Set up staging environment** (duplicate on Vercel/Railway)
6. **Write tests** (CI/CD will run them)
7. **Document API** (use Swagger/OpenAPI)
8. **Create user documentation**
9. **Plan marketing/outreach**
10. **Celebrate! 🎉**

---

## Support

- **Documentation:** [GitHub Wiki](https://github.com/yourusername/lehelp/wiki)
- **Issues:** [GitHub Issues](https://github.com/yourusername/lehelp/issues)
- **Community:** [Discord/Slack]

---

## License

GNU Affero General Public License v3.0 - See LICENSE file

---

**Ready to deploy? Start with Step 1!** 🚀
