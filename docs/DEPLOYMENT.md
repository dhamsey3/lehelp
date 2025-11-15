# LEHELP Platform - Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (for production)
- Domain name and SSL certificates
- Cloud provider account (AWS, GCP, or Azure)

## Development Deployment

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 2. Start Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Initialize Database

```bash
# Run database migrations
docker-compose exec postgres psql -U lehelp_user -d lehelp_db -f /docker-entrypoint-initdb.d/init.sql

# Or if using the API gateway
cd backend/api-gateway
npm run migrate
```

### 4. Access Services

- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- AI Services: http://localhost:8000
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017
- Redis: localhost:6379
- Elasticsearch: http://localhost:9200
- RabbitMQ Management: http://localhost:15672
- MinIO Console: http://localhost:9001

## Production Deployment

### Architecture Overview

```
Internet
    |
    └── Load Balancer (SSL Termination)
        |
        ├── Frontend (React PWA)
        ├── API Gateway
        │   ├── Auth Service
        │   ├── Case Service
        │   ├── Document Service
        │   ├── Messaging Service
        │   └── Analytics Service
        ├── AI Services (FastAPI)
        └── WebSocket Server
            |
            └── Backend Services
                ├── PostgreSQL (Primary DB)
                ├── MongoDB (Documents)
                ├── Redis (Cache/Sessions)
                ├── Elasticsearch (Search)
                ├── RabbitMQ (Message Queue)
                └── Object Storage (S3/MinIO)
```

### Kubernetes Deployment

See `infrastructure/kubernetes/` for manifests.

```bash
# Create namespace
kubectl create namespace lehelp-prod

# Create secrets
kubectl create secret generic lehelp-secrets \
  --from-env-file=.env.production \
  -n lehelp-prod

# Deploy database
kubectl apply -f infrastructure/kubernetes/postgres.yaml

# Deploy Redis
kubectl apply -f infrastructure/kubernetes/redis.yaml

# Deploy backend services
kubectl apply -f infrastructure/kubernetes/backend.yaml

# Deploy frontend
kubectl apply -f infrastructure/kubernetes/frontend.yaml

# Deploy AI services
kubectl apply -f infrastructure/kubernetes/ai-services.yaml

# Deploy ingress
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

### SSL/TLS Setup

```bash
# Using cert-manager for Let's Encrypt
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Apply certificate issuer
kubectl apply -f infrastructure/kubernetes/cert-issuer.yaml
```

## Monitoring & Logging

### Prometheus & Grafana

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

### Logging with EFK Stack

```bash
# Install Elasticsearch, Fluentd, Kibana
kubectl apply -f infrastructure/kubernetes/logging/
```

## Backup & Recovery

### Database Backups

```bash
# Automated backup script
./scripts/backup-database.sh

# Restore from backup
./scripts/restore-database.sh <backup-file>
```

### Object Storage Backups

```bash
# Backup encrypted documents
./scripts/backup-storage.sh
```

## Security Checklist

- [ ] All secrets in environment variables, not hardcoded
- [ ] SSL/TLS enabled for all external connections
- [ ] Database connections encrypted
- [ ] Regular security updates applied
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] DDoS protection configured
- [ ] Intrusion detection system active
- [ ] Regular penetration testing scheduled
- [ ] Vulnerability scanning automated
- [ ] Backup encryption verified
- [ ] Access logs monitored
- [ ] Incident response plan documented

## Scaling

### Horizontal Scaling

```bash
# Scale API gateway
kubectl scale deployment api-gateway --replicas=5 -n lehelp-prod

# Scale AI services
kubectl scale deployment ai-services --replicas=3 -n lehelp-prod

# Auto-scaling
kubectl apply -f infrastructure/kubernetes/hpa.yaml
```

### Database Scaling

- Use read replicas for PostgreSQL
- Implement connection pooling
- Configure Redis cluster for high availability

## CI/CD Pipeline

See `.github/workflows/` for GitHub Actions pipelines.

### Build and Deploy

```bash
# Automated on push to main branch
git push origin main

# Manual deployment
./scripts/deploy.sh production
```

## Health Checks

```bash
# Check all service health
curl https://api.lehelp.org/health

# Detailed status
kubectl get pods -n lehelp-prod
kubectl describe pod <pod-name> -n lehelp-prod
```

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check database status
kubectl logs -f deployment/postgres -n lehelp-prod

# Verify connection string
kubectl get secret lehelp-secrets -n lehelp-prod -o yaml
```

**High Memory Usage**
```bash
# Check resource usage
kubectl top pods -n lehelp-prod

# Adjust resource limits
kubectl edit deployment <service-name> -n lehelp-prod
```

**Slow Response Times**
```bash
# Check Redis cache
redis-cli ping

# View slow queries
kubectl exec -it postgres-0 -n lehelp-prod -- psql -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

## Support

For deployment issues, contact: devops@lehelp.org
