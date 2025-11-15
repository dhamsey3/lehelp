# 🚀 Cloud Migration Guide

This document explains how to migrate from local development to cloud deployment with minimal code changes.

## 📋 Current Setup (Local)

All services run locally via Docker Compose:
- **Database**: PostgreSQL (local)
- **Storage**: MinIO (S3-compatible, local)
- **Email**: MailHog (local email catcher)
- **Cache**: Redis (local)
- **Search**: Elasticsearch (local)
- **Queue**: RabbitMQ (local)

## 🌐 Cloud Migration Paths

### Option 1: Lift & Shift (Easiest)
Deploy entire Docker setup to a VM (AWS EC2, DigitalOcean Droplet, Hetzner)
- **Effort**: Low
- **Cost**: $10-50/month
- **Change Required**: Just update `CORS_ORIGIN` and domain names

### Option 2: Hybrid (Recommended)
Keep Docker for backend services, use managed services for data
- **Databases**: AWS RDS PostgreSQL, MongoDB Atlas (free tier)
- **Storage**: AWS S3, DigitalOcean Spaces
- **Cache**: AWS ElastiCache, Redis Cloud (free tier)
- **Email**: SendGrid (free 100 emails/day), AWS SES
- **Effort**: Medium
- **Cost**: $0-30/month (using free tiers)

### Option 3: Full Managed (Scalable)
Use cloud providers for everything
- **Backend**: AWS ECS/Fargate, Google Cloud Run, Railway.app
- **Frontend**: Vercel, Netlify, Cloudflare Pages (free)
- **Databases**: Managed services
- **Effort**: High
- **Cost**: $20-100/month

---

## 🔄 Migration Checklist

### 1. Storage: MinIO → S3/Spaces

**Current `.env` (Local):**
```bash
S3_BUCKET=lehelp-documents
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_ENDPOINT=http://localhost:9000
```

**AWS S3:**
```bash
S3_BUCKET=lehelp-documents-prod
S3_REGION=eu-central-1
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCY...
# Remove S3_ENDPOINT line
```

**DigitalOcean Spaces:**
```bash
S3_BUCKET=lehelp-documents
S3_REGION=nyc3
S3_ACCESS_KEY=DO00EXAMPLE...
S3_SECRET_KEY=your-spaces-secret
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

**Code Change Required:** None! The S3 SDK handles it.

---

### 2. Email: MailHog → SendGrid/SES

**Current `.env` (Local):**
```bash
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
```

**SendGrid (Free 100/day):**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-api-key-here
SMTP_FROM=Legal Aid Platform <noreply@yourdomain.com>
```

**AWS SES:**
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
SMTP_FROM=Legal Aid Platform <verified@yourdomain.com>
```

**Code Change Required:** None!

---

### 3. Database: Local → Managed

**PostgreSQL:**

**Current:** `POSTGRES_HOST=localhost`

**AWS RDS:**
```bash
POSTGRES_HOST=lehelp-db.xxxxx.us-east-1.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=lehelp_db
POSTGRES_USER=lehelp_admin
POSTGRES_PASSWORD=your-rds-password
```

**Supabase (Free tier):**
```bash
POSTGRES_HOST=db.xxxxx.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-project-password
```

**MongoDB:**

**MongoDB Atlas (Free 512MB):**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lehelp_docs
```

---

### 4. AI Services: Add OpenAI When Ready

**Current:**
```bash
AI_SERVICE_URL=http://localhost:8000
OPENAI_API_KEY=
```

**With OpenAI (Pay as you go):**
```bash
AI_SERVICE_URL=http://localhost:8000  # Or deploy AI service
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxx
```

**Models to use:**
- `gpt-4o-mini`: $0.15/1M tokens (cheap, fast)
- `gpt-4o`: $2.50/1M tokens (best quality)
- `text-embedding-3-small`: $0.02/1M tokens (embeddings)

---

### 5. Video: Public Jitsi → Self-Hosted/8x8

**Current (Free public):**
```bash
JITSI_DOMAIN=meet.jit.si
JITSI_APP_ID=
JITSI_APP_SECRET=
```

**8x8 Jaas (Paid, stable):**
```bash
JITSI_DOMAIN=8x8.vc
JITSI_APP_ID=vpaas-magic-cookie-your-app-id
JITSI_APP_SECRET=your-app-secret
```

**Self-hosted:**
```bash
JITSI_DOMAIN=meet.yourdomain.com
JITSI_APP_ID=your_jitsi_app
JITSI_APP_SECRET=your_secret
```

---

### 6. Production Environment Updates

```bash
# Change environment
NODE_ENV=production

# Update security
SECURE_COOKIES=true
COOKIE_DOMAIN=yourdomain.com
CORS_ORIGIN=https://app.yourdomain.com,https://admin.yourdomain.com

# Reduce logging
LOG_LEVEL=warn
```

---

## 💰 Cost Estimates

### Free Tier Setup
- **Frontend**: Vercel/Netlify (Free)
- **Backend**: Railway.app ($5/month) or Render (Free tier)
- **Database**: Supabase PostgreSQL (Free 500MB)
- **MongoDB**: Atlas (Free 512MB)
- **Cache**: Redis Cloud (Free 30MB)
- **Storage**: AWS S3 (Free 5GB first year)
- **Email**: SendGrid (Free 100/day)
- **Total**: $0-5/month

### Small Production
- **Backend**: DigitalOcean Droplet ($12/month)
- **Database**: Managed PostgreSQL ($15/month)
- **Storage**: S3/Spaces ($5/month)
- **Email**: SendGrid (Free or $15/month)
- **CDN**: Cloudflare (Free)
- **Total**: $32-47/month

### Scalable Production
- **Backend**: AWS ECS/Fargate ($30-100/month)
- **Database**: RDS Multi-AZ ($100/month)
- **Storage**: S3 ($20/month)
- **Email**: AWS SES ($10/month)
- **Cache**: ElastiCache ($50/month)
- **CDN**: CloudFront ($20/month)
- **Total**: $230-300/month

---

## 🎯 Recommended Migration Path

1. **Start Local** (Current)
   - Develop and test everything
   - Use Docker Compose
   - Zero costs

2. **Deploy to Railway/Render** (When ready for users)
   - Push Docker setup
   - Add custom domain
   - Still use free tiers for data
   - Cost: $0-10/month

3. **Add Managed Services** (When traffic grows)
   - Move to managed PostgreSQL
   - Use SendGrid for email
   - Keep backend on Railway/Render
   - Cost: $20-40/month

4. **Scale Up** (When you have funding)
   - Move to AWS/GCP
   - Add CDN, load balancers
   - Auto-scaling
   - Cost: Variable based on usage

---

## ✅ Zero-Downtime Migration Steps

1. **Set up cloud services** (database, storage, etc.)
2. **Update `.env` with cloud credentials**
3. **Test in staging environment**
4. **Migrate data** (database export/import)
5. **Switch DNS** to new deployment
6. **Monitor logs** for errors
7. **Keep local backup** running for 24h

---

## 🔧 Code Changes Required

**None!** Your code is already cloud-ready because:
- ✅ Using environment variables for all config
- ✅ S3 SDK works with MinIO and AWS S3
- ✅ Standard SMTP for email
- ✅ Standard database connections
- ✅ Docker containers deploy anywhere

Just update `.env` file and redeploy!
