# ⚡ LEHELP Quick Reference Card

## 🚀 Quick Deploy (Production)

```bash
# 1. Run deploy wizard
./deploy.sh

# 2. Create accounts (all free tiers):
# - Vercel: https://vercel.com
# - Railway: https://railway.app
# - Supabase: https://supabase.com
# - Upstash: https://upstash.com

# 3. Deploy database
psql "your-supabase-url" -f database/schema.sql

# 4. Deploy backend (Railway)
railway login && railway up

# 5. Deploy frontend (Vercel)
cd frontend/client-portal && vercel --prod

# Done! Access at: https://your-app.vercel.app
```

**Total time:** 30 minutes  
**Total cost:** $0/month

📖 **Full guide:** [GETTING-STARTED.md](GETTING-STARTED.md)

---

## 💻 Quick Start (Local)

```bash
# 1. Start services
docker-compose up -d

# 2. Setup database
psql postgresql://lehelp_user:dev_password_change_in_prod@localhost:5432/lehelp_db -f database/schema.sql

# 3. Install & run (3 terminals)
# Backend
cd backend/api-gateway && npm install && npm run dev

# Frontend
cd frontend/client-portal && npm install && npm run dev

# AI Service
cd ai-services && pip install -r requirements.txt && uvicorn main:app --reload

# 4. Open http://localhost:5173
```

**Total time:** 20 minutes

---

## 🔗 Important URLs

### Production
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`
- AI Service: `https://your-ai.onrender.com`
- Health: `https://your-app.railway.app/health`

### Local Development
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1
- AI Service: http://localhost:8000
- MailHog (emails): http://localhost:8025
- MinIO (storage): http://localhost:9001
- Backend Health: http://localhost:3000/health

---

## 📁 Key Files

### Configuration
- `backend/api-gateway/.env` - Backend config (local)
- `backend/api-gateway/.env.production` - Backend config (prod)
- `frontend/client-portal/.env` - Frontend config (local)
- `frontend/client-portal/.env.production` - Frontend config (prod)
- `docker-compose.yml` - Local services
- `.github/workflows/ci-cd.yml` - CI/CD pipeline

### Code
- `backend/api-gateway/src/routes/auth.ts` - Authentication
- `backend/api-gateway/src/routes/cases.ts` - Case management
- `frontend/client-portal/src/components/` - UI components
- `ai-services/main.py` - AI endpoints

### Documentation
- `README.md` - Project overview
- `GETTING-STARTED.md` - Quick start guide
- `DEPLOYMENT.md` - Deployment details
- `SCALING.md` - Feature roadmap
- `PRODUCTION-CHECKLIST.md` - Security checklist
- `SUMMARY.md` - Complete summary

---

## 🔑 Environment Variables

### Backend (Required)
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<64-char-random>
REFRESH_TOKEN_SECRET=<64-char-random>
ENCRYPTION_KEY=<32-char-random>
SESSION_SECRET=<64-char-random>
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Backend (Optional)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid-key>
S3_ENDPOINT=<r2-endpoint>
S3_BUCKET=lehelp-documents
S3_ACCESS_KEY=<key>
S3_SECRET_KEY=<secret>
AI_SERVICE_URL=https://ai.onrender.com
SENTRY_DSN=<sentry-dsn>
```

### Frontend
```env
VITE_API_URL=https://your-backend.railway.app/api/v1
```

---

## 🐛 Troubleshooting

### Frontend can't reach backend
```bash
# Check CORS
# In Railway, verify: CORS_ORIGIN=https://your-frontend.vercel.app

# Check API URL
# In Vercel, verify: VITE_API_URL=https://your-backend.railway.app/api/v1

# Test backend
curl https://your-backend.railway.app/health
```

### Database connection fails
```bash
# Test connection
psql "your-database-url" -c "SELECT 1"

# Common issues:
# - Wrong password
# - SSL required (add ?sslmode=require)
# - Supabase project paused (free tier)
```

### Build fails
```bash
# Check logs:
# Railway: Dashboard → Deployments → Logs
# Vercel: Dashboard → Deployments → Build Logs
# Render: Dashboard → Events

# Common fixes:
# - npm install before build
# - Correct Node version (18+)
# - Environment variables set
```

---

## 📊 Free Tier Limits

| Service | Free Tier | Limit |
|---------|-----------|-------|
| Vercel | 100GB bandwidth | ~10K visitors |
| Railway | $5 credit | ~500 hours |
| Render | 750 hours | 15min sleep |
| Supabase | 500MB | Database size |
| Upstash | 10K commands | Cache ops |
| R2 | 10GB | File storage |
| SendGrid | 100 emails | Per day |

**When to upgrade:** See [SCALING.md](SCALING.md)

---

## 🔒 Security Checklist

Quick security check before going live:

- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] Environment variables set (not defaults)
- [ ] CORS configured to your frontend only
- [ ] Rate limiting enabled (check logs)
- [ ] Database uses SSL
- [ ] Redis uses TLS (Upstash default)
- [ ] File uploads validated
- [ ] Error messages don't leak data
- [ ] Health endpoint doesn't expose secrets

**Full checklist:** [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md)

---

## 📞 Get Help

**Documentation:**
- Quick Start: [GETTING-STARTED.md](GETTING-STARTED.md)
- Deployment: [DEPLOYMENT.md](DEPLOYMENT.md)
- Security: [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md)

**Support:**
- GitHub Issues: Bug reports
- GitHub Discussions: Questions
- Email: support@lehelp.org

**Security:**
- Email: security@lehelp.org

---

## 🎯 Next Steps

After deploying:

**Day 1:**
- [ ] Test all features
- [ ] Invite beta users
- [ ] Set up monitoring

**Week 1:**
- [ ] Gather feedback
- [ ] Fix critical bugs
- [ ] Update docs

**Month 1:**
- [ ] Build user profiles
- [ ] Add messaging
- [ ] Write tests

**See full roadmap:** [SCALING.md](SCALING.md)

---

## 💡 Quick Commands

### Generate Secrets
```bash
openssl rand -hex 32  # JWT_SECRET
openssl rand -hex 32  # REFRESH_TOKEN_SECRET
openssl rand -hex 16  # ENCRYPTION_KEY
openssl rand -hex 32  # SESSION_SECRET
```

### Test Services
```bash
# Backend health
curl https://your-backend.railway.app/health

# Frontend
curl -I https://your-frontend.vercel.app

# Database
psql "$DATABASE_URL" -c "SELECT version()"

# Redis
redis-cli -u "$REDIS_URL" ping
```

### View Logs
```bash
# Railway
railway logs

# Vercel (in project directory)
vercel logs

# Render
# Use dashboard

# Local
docker-compose logs -f
```

---

**Keep this handy!** Bookmark or print for quick reference.

---

*LEHELP Platform - Making justice accessible to all* ⚖️
