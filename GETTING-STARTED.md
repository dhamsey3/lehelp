# 🎯 LEHELP Platform - Getting Started Guide

## Welcome! 👋

You're about to deploy a production-ready legal aid platform for human rights. This guide will take you from zero to deployed in about **30 minutes**.

---

## What You're Building

**LEHELP** is a complete platform with:
- ✅ User authentication (register, login, password reset)
- ✅ Case management with AI-powered triage
- ✅ Document upload and storage
- ✅ Email notifications
- ✅ Lawyer-client matching algorithms
- ✅ Responsive web interface
- ✅ Production security hardening

**Tech Stack:**
- Frontend: React 18 + TypeScript + Material-UI (deployed on Vercel)
- Backend: Node.js + Express + PostgreSQL (deployed on Railway)
- AI Service: Python + FastAPI (deployed on Render)
- Database: PostgreSQL (Supabase free tier)
- Cache: Redis (Upstash free tier)
- Storage: S3-compatible (Cloudflare R2 free tier)

---

## Choose Your Path

### 🚀 Path A: Deploy to Production First (Recommended)

**Best for:** Getting a live site ASAP, then iterating

**Time:** ~30 minutes  
**Cost:** $0/month (free tiers)  
**Result:** Live website accessible worldwide

👉 **[Jump to Production Deployment](#production-deployment)**

---

### 💻 Path B: Develop Locally First

**Best for:** Developers who want to customize before deploying

**Time:** ~20 minutes setup  
**Cost:** Free (runs on your computer)  
**Result:** Local development environment

👉 **[Jump to Local Development](#local-development)**

---

## Production Deployment

### Prerequisites

**5 Accounts** (all have free tiers):

1. **GitHub** - For code hosting
   - Sign up: https://github.com/signup
   - Already have an account? Great!

2. **Vercel** - For frontend hosting
   - Sign up: https://vercel.com/signup
   - Use "Sign up with GitHub" (easiest)

3. **Railway** - For backend hosting
   - Sign up: https://railway.app/
   - Use "Login with GitHub"
   - Get $5/month free credit (enough for MVP)

4. **Supabase** - For PostgreSQL database
   - Sign up: https://supabase.com/dashboard
   - Use "Sign in with GitHub"
   - Free tier: 500MB database

5. **Upstash** - For Redis cache
   - Sign up: https://upstash.com/
   - Use "Login with GitHub"
   - Free tier: 10K commands/day

**Optional but recommended:**

6. **Cloudflare** - For file storage (R2)
   - Sign up: https://dash.cloudflare.com/sign-up
   - Free tier: 10GB storage

7. **SendGrid** - For emails
   - Sign up: https://signup.sendgrid.com/
   - Free tier: 100 emails/day

---

### Step 1: Fork the Repository

```bash
# On GitHub, click "Fork" button on the LEHELP repository
# Or clone directly if you have access:

git clone https://github.com/yourusername/lehelp.git
cd lehelp
```

---

### Step 2: Set Up Database (Supabase)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `lehelp-production`
   - Database Password: (generate a strong password - save it!)
   - Region: Choose closest to your users
4. Wait 2-3 minutes for provisioning
5. Go to "Settings" → "Database"
6. Copy the "Connection string" (it looks like `postgresql://postgres:...`)
7. Run migrations:

```bash
# Install PostgreSQL client if you don't have it
# Mac: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client
# Windows: Download from postgresql.org

# Connect and run migrations
psql "your-connection-string-here" -f database/schema.sql
```

**Troubleshooting:**
- Error "connection refused": Make sure you copied the full connection string
- Error "permission denied": Check your password is correct
- Can't install psql? Use Supabase SQL Editor in the dashboard

---

### Step 3: Set Up Redis (Upstash)

1. Go to https://console.upstash.com/
2. Click "Create Database"
3. Fill in:
   - Name: `lehelp-cache`
   - Type: Regional
   - Region: Choose same as Supabase
4. Click "Create"
5. Copy the "REDIS_URL" from the dashboard (looks like `rediss://default:...`)

---

### Step 4: Set Up File Storage (Cloudflare R2)

1. Go to https://dash.cloudflare.com/
2. Left sidebar → "R2"
3. Click "Create Bucket"
4. Name it: `lehelp-documents`
5. Create an API token:
   - Click "Manage R2 API Tokens"
   - "Create API Token"
   - Permissions: "Object Read & Write"
   - Copy: Account ID, Access Key ID, Secret Access Key
   - Endpoint URL: `https://<account-id>.r2.cloudflarestorage.com`

**Alternative:** Skip this for now and use local MinIO storage

---

### Step 5: Deploy Backend to Railway

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your `lehelp` repository
4. Railway will auto-detect it's a monorepo
5. Configure:
   - **Root Directory:** `backend/api-gateway`
   - **Build Command:** (auto-detected)
   - **Start Command:** `npm start`

6. Add environment variables (click "Variables" tab):

```env
NODE_ENV=production
DATABASE_URL=<your-supabase-connection-string>
REDIS_URL=<your-upstash-redis-url>
CORS_ORIGIN=https://your-app.vercel.app
JWT_SECRET=<generate-random-64-char-string>
REFRESH_TOKEN_SECRET=<generate-random-64-char-string>
ENCRYPTION_KEY=<generate-random-32-char-string>
SESSION_SECRET=<generate-random-64-char-string>
```

**Generate secrets:**
```bash
# On Mac/Linux:
openssl rand -hex 32  # For JWT_SECRET (run twice for refresh token)
openssl rand -hex 16  # For ENCRYPTION_KEY
openssl rand -hex 32  # For SESSION_SECRET

# Or use the deploy script:
./deploy.sh  # It generates them for you!
```

7. Click "Deploy"
8. Wait 2-3 minutes
9. Railway will give you a URL like: `https://your-app.up.railway.app`
10. Test it: `curl https://your-app.up.railway.app/health`

**Troubleshooting:**
- Build fails: Check the logs in Railway dashboard
- Health check fails: Database connection issue - verify DATABASE_URL
- Port error: Railway automatically sets PORT - don't override it

---

### Step 6: Deploy AI Service to Render

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `lehelp-ai-service`
   - **Root Directory:** `ai-services`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000`
   - **Instance Type:** Free

5. No environment variables needed for MVP
6. Click "Create Web Service"
7. Wait 3-5 minutes for first deploy
8. Render gives you a URL like: `https://lehelp-ai-service.onrender.com`
9. Test it: `curl https://lehelp-ai-service.onrender.com/health`

**Note:** Free tier spins down after 15 min inactivity. First request after may take 30 seconds.

---

### Step 7: Update Backend with AI Service URL

1. Go back to Railway dashboard
2. Click on your backend service
3. Add environment variable:
   ```env
   AI_SERVICE_URL=https://lehelp-ai-service.onrender.com
   ```
4. Railway will auto-redeploy (wait 1-2 min)

---

### Step 8: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your `lehelp` repository
4. Vercel detects it's a monorepo
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend/client-portal`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. Add environment variable:
   ```env
   VITE_API_URL=https://your-app.up.railway.app/api/v1
   ```
   (Use your Railway URL from Step 5)

7. Click "Deploy"
8. Wait 2-3 minutes
9. Vercel gives you a URL like: `https://lehelp-abc123.vercel.app`

---

### Step 9: Update CORS in Backend

**Important!** Tell your backend to accept requests from your frontend:

1. Go to Railway dashboard
2. Edit the `CORS_ORIGIN` variable:
   ```env
   CORS_ORIGIN=https://lehelp-abc123.vercel.app
   ```
   (Use your actual Vercel URL)
3. Railway auto-redeploys

---

### Step 10: Test Your Deployment! 🎉

1. **Visit your Vercel URL**
2. **Register a new account:**
   - Go to `/register`
   - Fill in the form
   - Click "Register"
3. **Check email** (if you set up SendGrid)
   - Or skip verification for now
4. **Login**
   - Use the credentials you just created
5. **Submit a test case:**
   - Click "New Case"
   - Fill in case details
   - Submit
6. **View the case dashboard**
   - Should see your case listed

**If everything works:** Congratulations! 🎊 You have a live platform!

**If something breaks:** Check the troubleshooting section below

---

## Troubleshooting

### Frontend issues

**Error: "Network Error" or "Failed to fetch"**
- Backend not running: Check Railway logs
- CORS issue: Verify CORS_ORIGIN matches your Vercel URL exactly
- API URL wrong: Check VITE_API_URL in Vercel

**Fix:**
```bash
# Test backend directly:
curl https://your-railway-url.railway.app/health

# Should return: {"status":"healthy",...}
```

### Backend issues

**Error: "Database connection failed"**
- DATABASE_URL incorrect
- Supabase project paused (free tier goes to sleep)
- Network issue

**Fix:**
```bash
# Test database connection:
psql "your-database-url" -c "SELECT 1"
```

**Error: "Redis connection failed"**
- REDIS_URL incorrect
- Upstash project paused

**Fix:** Backend should work without Redis (it's optional for MVP)

### AI Service issues

**Error: "AI service timeout"**
- Render free tier spins down after inactivity
- First request takes 30+ seconds

**Fix:** Just wait and retry. Subsequent requests will be fast.

---

## Local Development

Want to develop locally? Here's how:

### 1. Install Dependencies

```bash
# Backend
cd backend/api-gateway
npm install

# Frontend
cd ../../frontend/client-portal
npm install

# AI Service
cd ../../ai-services
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start Infrastructure

```bash
# In project root:
docker-compose up -d

# This starts:
# - PostgreSQL (port 5432)
# - Redis (port 6379)
# - MinIO (ports 9000, 9001)
# - MailHog (ports 1025, 8025)
```

### 3. Set Up Database

```bash
psql postgresql://lehelp_user:dev_password_change_in_prod@localhost:5432/lehelp_db -f database/schema.sql
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend/api-gateway
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend/client-portal
npm run dev
# Runs on http://localhost:5173
```

**Terminal 3 - AI Service:**
```bash
cd ai-services
source venv/bin/activate
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### 5. Open in Browser

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1
- MailHog (emails): http://localhost:8025
- MinIO (files): http://localhost:9001

---

## What's Next?

### Immediate (Day 1)
- [ ] Set up custom domain on Vercel (optional)
- [ ] Configure SendGrid for real emails
- [ ] Set up error tracking (Sentry)
- [ ] Add uptime monitoring (UptimeRobot)

### This Week
- [ ] Invite team members to test
- [ ] Gather feedback
- [ ] Fix bugs
- [ ] Add more case types

### This Month
- [ ] Build user profiles
- [ ] Add messaging system
- [ ] Improve AI matching
- [ ] Write documentation

### This Quarter
- [ ] Mobile app (PWA)
- [ ] Video conferencing
- [ ] Multi-language support
- [ ] Analytics dashboard

📚 **See [SCALING.md](SCALING.md) for the complete roadmap**

---

## Get Help

**Documentation:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md) - Security checklist
- [SCALING.md](SCALING.md) - Feature roadmap and scaling

**Community:**
- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions
- Email: support@lehelp.org

**Emergency:**
- Security issues: security@lehelp.org

---

## Cost Summary

### Free Tier (0-100 users)

| Service | Free Tier | When to Upgrade |
|---------|-----------|-----------------|
| Vercel | 100GB bandwidth | >10K visitors/month |
| Railway | $5 credit/month | >500 hours usage |
| Render | 750 hours | Never sleeps |
| Supabase | 500MB DB | >500MB data |
| Upstash | 10K commands/day | >10K cache hits |
| Cloudflare R2 | 10GB storage | >10GB files |
| SendGrid | 100 emails/day | >100 emails |
| **Total** | **$0/month** | 🎉 |

### Scaling Costs

**100-1,000 users:** ~$25/month
- Upgrade Railway to Pro ($5)
- Upgrade Supabase to Pro ($25)

**1,000-10,000 users:** ~$100-200/month
- Dedicated database
- Scaled backend
- CDN for files

---

## Success Checklist

**Before going live:**
- [ ] All services deployed and tested
- [ ] Database migrations run successfully
- [ ] User registration works
- [ ] Login and authentication works
- [ ] Case submission works
- [ ] File upload works
- [ ] Emails send correctly
- [ ] Error tracking configured
- [ ] Uptime monitoring set up
- [ ] Backups automated
- [ ] SSL certificates active (automatic on Vercel/Railway)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Production secrets set (not default values)
- [ ] Privacy policy published
- [ ] Terms of service published

**After going live:**
- [ ] Monitor error logs daily (first week)
- [ ] Respond to user feedback
- [ ] Fix critical bugs within 24 hours
- [ ] Update documentation as needed
- [ ] Plan next sprint

---

## You're Ready! 🚀

You now have everything you need to:
1. ✅ Deploy a production-ready legal aid platform
2. ✅ Scale it to thousands of users
3. ✅ Keep it running for free (initially)
4. ✅ Iterate and improve based on feedback

**Remember:** Start small, ship fast, iterate based on real user feedback.

**Good luck building something that matters!** ❤️

---

**Made with ❤️ for human rights**
