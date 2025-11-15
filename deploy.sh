#!/bin/bash

# LEHELP Platform - Quick Deploy Script
# This script helps you deploy LEHELP to production in minutes

set -e  # Exit on error

echo "🚀 LEHELP Platform - Production Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo -e "${BLUE}Checking requirements...${NC}"
    
    command -v git >/dev/null 2>&1 || { echo -e "${RED}Error: git is not installed${NC}"; exit 1; }
    command -v node >/dev/null 2>&1 || { echo -e "${RED}Error: node is not installed${NC}"; exit 1; }
    command -v npm >/dev/null 2>&1 || { echo -e "${RED}Error: npm is not installed${NC}"; exit 1; }
    
    echo -e "${GREEN}✓ All requirements met${NC}"
    echo ""
}

# Generate secure secrets
generate_secrets() {
    echo -e "${BLUE}Generating secure secrets...${NC}"
    
    JWT_SECRET=$(openssl rand -hex 32)
    REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
    ENCRYPTION_KEY=$(openssl rand -hex 16)
    SESSION_SECRET=$(openssl rand -hex 32)
    
    echo -e "${GREEN}✓ Secrets generated${NC}"
    echo ""
}

# Create environment file template
create_env_template() {
    echo -e "${BLUE}Creating environment configuration...${NC}"
    
    cat > .env.deploy << EOF
# LEHELP Platform - Deployment Configuration
# Generated on $(date)

# === REQUIRED: Fill these in before deploying ===

# Database (Supabase, Neon, or other PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (Upstash or other Redis provider)
REDIS_URL=redis://user:password@host:6379

# Frontend URL (Vercel will provide this)
FRONTEND_URL=https://your-app.vercel.app

# Email Service (SendGrid, Resend, etc.)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key

# Storage (Cloudflare R2, Backblaze B2, or AWS S3)
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_BUCKET=lehelp-documents
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# === AUTO-GENERATED SECRETS (already set) ===
JWT_SECRET=$JWT_SECRET
REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
SESSION_SECRET=$SESSION_SECRET

# === OPTIONAL ===
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
AI_SERVICE_URL=https://your-ai-service.onrender.com
EOF

    echo -e "${GREEN}✓ Environment template created: .env.deploy${NC}"
    echo -e "${YELLOW}⚠ Edit .env.deploy with your actual values before deploying${NC}"
    echo ""
}

# Run database migrations
run_migrations() {
    echo -e "${BLUE}Preparing database migrations...${NC}"
    
    if [ -f "database/schema.sql" ]; then
        echo -e "${YELLOW}To run migrations, execute:${NC}"
        echo "  psql \"\$DATABASE_URL\" -f database/schema.sql"
    else
        echo -e "${YELLOW}⚠ No schema.sql found${NC}"
    fi
    echo ""
}

# Build and test
build_and_test() {
    echo -e "${BLUE}Building and testing...${NC}"
    
    # Backend
    echo "Building backend..."
    cd backend/api-gateway
    npm ci --only=production
    npm run build
    cd ../..
    echo -e "${GREEN}✓ Backend built${NC}"
    
    # Frontend
    echo "Building frontend..."
    cd frontend/client-portal
    npm ci
    npm run build
    cd ../..
    echo -e "${GREEN}✓ Frontend built${NC}"
    
    echo ""
}

# Show deployment instructions
show_deployment_steps() {
    cat << 'EOF'

📋 DEPLOYMENT CHECKLIST
=======================

1. ✅ Set up accounts:
   □ Vercel account (https://vercel.com)
   □ Railway account (https://railway.app) OR Render (https://render.com)
   □ Supabase account (https://supabase.com)
   □ Upstash account (https://upstash.com)
   □ Cloudflare account (https://cloudflare.com) for R2 storage

2. ✅ Database setup:
   □ Create PostgreSQL database on Supabase
   □ Run migrations: psql "$DATABASE_URL" -f database/schema.sql
   □ Copy connection string to .env.deploy

3. ✅ Redis setup:
   □ Create Redis database on Upstash
   □ Copy REDIS_URL to .env.deploy

4. ✅ Storage setup:
   □ Create R2 bucket on Cloudflare
   □ Create API token
   □ Copy credentials to .env.deploy

5. ✅ Email setup:
   □ Sign up for SendGrid (free tier: 100 emails/day)
   □ Create API key
   □ Copy to .env.deploy

6. ✅ Deploy Backend (Railway):
   □ Install Railway CLI: npm i -g @railway/cli
   □ Login: railway login
   □ Create project: railway init
   □ Set root directory: backend/api-gateway
   □ Add environment variables from .env.deploy
   □ Deploy: railway up

7. ✅ Deploy AI Service (Render):
   □ Go to Render dashboard
   □ New Web Service → Connect GitHub repo
   □ Root directory: ai-services
   □ Deploy

8. ✅ Deploy Frontend (Vercel):
   □ Install Vercel CLI: npm i -g vercel
   □ Login: vercel login
   □ Deploy: cd frontend/client-portal && vercel --prod
   □ Set VITE_API_URL to your Railway backend URL

9. ✅ Update CORS:
   □ In Railway, set CORS_ORIGIN to your Vercel URL

10. ✅ Test deployment:
    □ Visit your Vercel URL
    □ Register a test account
    □ Submit a test case
    □ Check emails in SendGrid dashboard

11. ✅ Set up monitoring:
    □ Sentry for error tracking
    □ UptimeRobot for uptime monitoring
    □ Railway/Render logs for debugging

12. ✅ Security:
    □ All secrets are environment variables (not in code)
    □ HTTPS enabled everywhere
    □ CORS properly configured
    □ Rate limiting enabled

🎉 READY TO LAUNCH!

Next steps:
- Read DEPLOYMENT.md for detailed instructions
- Check SCALING.md for feature roadmap
- Join community for support

Need help? Check GitHub issues or documentation.

EOF
}

# Main execution
main() {
    echo -e "${GREEN}"
    cat << 'EOF'
   _     _____ _   _ _____ _     ____  
  | |   | ____| | | | ____| |   |  _ \ 
  | |   |  _| | |_| |  _| | |   | |_) |
  | |___| |___|  _  | |___| |___|  __/ 
  |_____|_____|_| |_|_____|_____|_|    
                                        
  Legal Aid for Human Rights Platform
EOF
    echo -e "${NC}"
    echo ""
    
    check_requirements
    generate_secrets
    create_env_template
    run_migrations
    
    read -p "Do you want to build the project now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_and_test
    fi
    
    show_deployment_steps
    
    echo -e "${GREEN}✓ Setup complete!${NC}"
    echo -e "${YELLOW}Next: Edit .env.deploy and follow the deployment checklist${NC}"
    echo ""
}

# Run main function
main
