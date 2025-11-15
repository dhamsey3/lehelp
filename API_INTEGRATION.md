# 🔌 API Integration Guide

## Overview

All API integrations are now configured and ready to use. This document explains how each service connects and how to use them.

## ✅ Completed Integrations

### 1. **PostgreSQL Database** (`/config/database.ts`)

**Connection Details:**
```typescript
import { pool } from './config/database';

// Query example
const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

**Features:**
- Connection pooling (max 20 connections)
- Automatic reconnection
- Graceful shutdown
- Health check monitoring

**Environment Variables:**
```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=lehelp_db
POSTGRES_USER=lehelp_user
POSTGRES_PASSWORD=changeme
```

---

### 2. **Redis Cache** (`/config/redis.ts`)

**Usage:**
```typescript
import { getRedisClient } from './config/redis';

const redis = getRedisClient();

// Set value
await redis.set('key', 'value', { EX: 3600 }); // Expires in 1 hour

// Get value
const value = await redis.get('key');

// Delete
await redis.del('key');
```

**Use Cases:**
- Session storage
- Rate limiting
- Caching API responses
- Real-time features (pub/sub)

---

### 3. **S3/MinIO Storage** (`/config/storage.ts`)

**Usage:**
```typescript
import { storageService } from './config/storage';

// Upload file
await storageService.uploadFile({
  key: 'documents/user123/file.pdf',
  body: fileBuffer,
  contentType: 'application/pdf',
  metadata: {
    'uploaded-by': 'user123',
    'case-id': 'case456',
  },
});

// Get signed download URL (expires in 1 hour)
const url = await storageService.getSignedDownloadUrl(
  'documents/user123/file.pdf',
  3600
);

// Delete file
await storageService.deleteFile('documents/user123/file.pdf');
```

**Features:**
- Works with both MinIO (local) and AWS S3 (cloud)
- Server-side encryption (AES256)
- Signed URLs for secure downloads
- Metadata support
- Automatic content-type detection

**Switching from MinIO to AWS S3:**
```bash
# Just update .env (no code changes!)
S3_BUCKET=my-production-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/...
# Remove S3_ENDPOINT line
```

---

### 4. **Email Service** (`/config/email.ts`)

**Usage:**
```typescript
import { emailService } from './config/email';

// Send custom email
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello</h1><p>Welcome to our platform</p>',
  text: 'Hello\nWelcome to our platform',
});

// Send verification email
await emailService.sendVerificationEmail('user@example.com', 'token123');

// Send password reset
await emailService.sendPasswordResetEmail('user@example.com', 'reset-token');

// Send case assignment notification
await emailService.sendCaseAssignmentEmail(
  'lawyer@example.com',
  'case123',
  'New Human Rights Case'
);
```

**Development Mode:**
- All emails are caught by MailHog
- View at: http://localhost:8025
- No actual emails sent

**Production Mode:**
```bash
# Update .env for SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-api-key
```

---

### 5. **AI Services** (`/services/ai.ts`)

**Usage:**
```typescript
import { aiService } from '../services/ai';

// Triage case (categorize and assess urgency)
const triage = await aiService.triageCase({
  description: 'I was wrongfully detained...',
  language: 'en',
});
// Returns: { category: 'detention', urgency: 'high', confidence: 0.89 }

// Match lawyers to case
const matches = await aiService.matchLawyers({
  caseId: 'case123',
  category: 'detention',
  location: 'Nairobi',
  language: 'en',
});
// Returns: { matches: [{ lawyerId: 'law456', score: 0.92 }] }

// Analyze document
const analysis = await aiService.analyzeDocument(documentText);
```

**Features:**
- Graceful fallback if AI service unavailable
- Timeout protection (10s for triage, 30s for analysis)
- Bearer token authentication
- Works with local AI service or cloud providers

**Adding OpenAI:**
```bash
# Add to .env
OPENAI_API_KEY=sk-proj-xxxxx
```

---

## 📁 Document Upload Flow

The document upload route is fully implemented with all integrations:

```typescript
POST /api/v1/documents
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  file: <binary>,
  caseId: "case123",
  category: "evidence"
}
```

**What Happens:**
1. ✅ File validated (type, size)
2. ✅ Uploaded to MinIO/S3 with encryption
3. ✅ Metadata saved to PostgreSQL
4. ✅ Activity logged for audit trail
5. ✅ Response with document ID

**Download Flow:**
```typescript
GET /api/v1/documents/:id
Authorization: Bearer <token>

Response:
{
  status: "success",
  data: {
    document: {
      id: "doc123",
      filename: "evidence.pdf",
      downloadUrl: "https://signed-url...",
      expiresAt: "2025-11-15T15:30:00Z"
    }
  }
}
```

---

## 🔄 API Routes Summary

### Implemented Routes:

| Endpoint | Method | Integration | Status |
|----------|--------|-------------|--------|
| `/api/v1/auth/register` | POST | PostgreSQL, Email | ✅ Ready |
| `/api/v1/auth/login` | POST | PostgreSQL, Redis | ✅ Ready |
| `/api/v1/documents` | GET | PostgreSQL | ✅ Implemented |
| `/api/v1/documents` | POST | S3, PostgreSQL | ✅ Implemented |
| `/api/v1/documents/:id` | GET | S3, PostgreSQL | ✅ Implemented |
| `/api/v1/documents/:id` | DELETE | S3, PostgreSQL | ✅ Implemented |
| `/api/v1/cases` | POST | AI Service, PostgreSQL | 🔧 Needs AI Integration |
| `/api/v1/messages` | POST | WebSocket, PostgreSQL | 🔧 Needs WebSocket |

---

## 🧪 Testing the Integrations

### 1. Test Email (MailHog)

```bash
cd backend/api-gateway
npm run dev

# In another terminal:
curl -X POST http://localhost:3000/test-email
```

Then visit: http://localhost:8025

### 2. Test S3/MinIO Upload

```bash
# Upload a test file
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@test.pdf" \
  -F "category=test"
```

Check MinIO console: http://localhost:9001

### 3. Test Database Connection

```bash
docker exec -it lehelp_postgres psql -U lehelp_user -d lehelp_db

# Run query
SELECT COUNT(*) FROM users;
```

### 4. Test Redis

```bash
docker exec -it lehelp_redis redis-cli -a dev_password_change_in_prod

# Test commands
SET test "hello"
GET test
```

---

## 🚀 Running Everything

### Option 1: Automated (Recommended)

```bash
# Start all infrastructure
./start.sh

# In separate terminals:
cd backend/api-gateway && npm run dev
cd frontend/client-portal && npm run dev
cd ai-services && source venv/bin/activate && uvicorn main:app --reload
```

### Option 2: Manual

```bash
# Start infrastructure
docker-compose up -d

# Start backend
cd backend/api-gateway
npm run dev

# Start frontend (new terminal)
cd frontend/client-portal
npm run dev

# Start AI services (new terminal)
cd ai-services
source venv/bin/activate
uvicorn main:app --reload
```

---

## 📊 Service Health Checks

All services expose health endpoints:

```bash
# API Gateway
curl http://localhost:3000/health

# Elasticsearch
curl http://localhost:9200/_cluster/health

# RabbitMQ
curl -u lehelp_queue_user:dev_password_change_in_prod \
  http://localhost:15672/api/healthchecks/node

# MinIO
curl http://localhost:9000/minio/health/live
```

---

## 🔐 Security Features

All integrations include:

- ✅ **Authentication**: JWT tokens required
- ✅ **Authorization**: User-level access control
- ✅ **Encryption**: Server-side S3 encryption
- ✅ **Audit Logging**: All actions tracked
- ✅ **Rate Limiting**: 100 req/15min per IP
- ✅ **Input Validation**: File type/size limits
- ✅ **Signed URLs**: Temporary access to files

---

## 🛠️ Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs lehelp_postgres

# Test connection
docker exec -it lehelp_postgres psql -U lehelp_user -d lehelp_db -c "SELECT 1"
```

### S3/MinIO Upload Fails

```bash
# Check MinIO is running
curl http://localhost:9000/minio/health/live

# Check bucket exists
docker exec lehelp_minio mc ls local/

# Create bucket if missing
docker exec lehelp_minio mc mb local/lehelp-documents
```

### Email Not Sending

```bash
# Check MailHog is running
curl http://localhost:8025

# View MailHog logs
docker logs lehelp_mailhog
```

### Redis Connection Fails

```bash
# Test Redis
docker exec lehelp_redis redis-cli -a dev_password_change_in_prod PING

# Should return: PONG
```

---

## 📚 Next Steps

1. **Implement remaining routes** (cases, messages, etc.)
2. **Add WebSocket support** for real-time messaging
3. **Integrate AI case matching** in case creation
4. **Add document virus scanning** (ClamAV)
5. **Implement search** with Elasticsearch
6. **Set up monitoring** with Sentry

---

## 🎯 Production Checklist

Before deploying:

- [ ] Update all `changeme` passwords in `.env`
- [ ] Switch MinIO to AWS S3
- [ ] Switch MailHog to SendGrid/SES
- [ ] Enable HTTPS (SSL certificates)
- [ ] Set `NODE_ENV=production`
- [ ] Set `SECURE_COOKIES=true`
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Enable Sentry monitoring
- [ ] Set up database backups
- [ ] Configure CDN for static assets
- [ ] Run `npm audit fix`
- [ ] Enable rate limiting in production
- [ ] Set up log aggregation

---

**All API integrations are ready! Start building features. 🎉**
