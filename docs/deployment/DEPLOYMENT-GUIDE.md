# Kitna Kharcha 2.0 — Production Cloud Deployment & Operations Guide

This guide provides exhaustive, enterprise-grade instructions for deploying, securing, monitoring, and operating **Kitna Kharcha 2.0** in a high-availability cloud environment (AWS, Hetzner, DigitalOcean, Linode, or bare-metal VPS).

Related repository assets:
- Production Stack Definition: [`docker-compose.prod.yml`](../../docker-compose.prod.yml)
- Development Stack Definition: [`docker-compose.yml`](../../docker-compose.yml)
- Backend Multi-Stage Dockerfile: [`backend/Dockerfile`](../../backend/Dockerfile)
- Frontend Production Dockerfile: [`frontend/Dockerfile`](../../frontend/Dockerfile)
- CI/CD Deployment Gates: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- Execution Progress & Verification: [`docs/EXECUTION-PROGRESS.md`](../EXECUTION-PROGRESS.md)

---

## 1. System Architecture Overview

Kitna Kharcha 2.0 operates as an interconnected multi-container stack orchestrated via Docker Compose:

```
                          [ Internet Traffic (HTTPS 443 / HTTP 80) ]
                                            │
                                            ▼
                           [ Host Reverse Proxy / Cloudflare ]
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │ (Port 80/443)                               │ (Port 3001)
                     ▼                                             ▼
          ┌───────────────────────┐                     ┌─────────────────────┐
          │   Frontend Container  │                     │  Backend Container  │
          │     (NGINX Alpine)    │                     │   (Node 20 Alpine)  │
          │   - SPA Routing       │                     │  - NestJS Fastify/Ex│
          │   - Gzip Compression  │                     │  - BullMQ Worker    │
          │   - Static Cache      │                     │  - Prisma ORM       │
          └───────────────────────┘                     └──────────┬──────────┘
                                                                   │
                                            ┌──────────────────────┴──────────┐
                                            ▼                                 ▼
                                ┌──────────────────────┐          ┌──────────────────────┐
                                │ PostgreSQL 15 Alpine │          │    Redis 7 Alpine    │
                                │ - Transactions       │          │ - BullMQ Queues      │
                                │ - PII Salt & Metadata│          │ - Async Parser Jobs  │
                                │ - Persistent Volume  │          │ - Persistent Volume  │
                                └──────────────────────┘          └──────────────────────┘
```

---

## 2. Server Prerequisites

### Hardware Recommendations
- **Minimum:** 2 vCPUs, 4 GB RAM, 40 GB NVMe SSD (Handles up to ~50 concurrent users / processing ~100 statements/day).
- **Recommended:** 4 vCPUs, 8 GB RAM, 80 GB NVMe SSD.
- **Operating System:** Ubuntu 22.04 LTS / Debian 12 x86_64.

### Software Requirements
- **Docker Engine:** v24.0 or higher
- **Docker Compose:** v2.20 or higher
- **Git:** v2.34+

```bash
# Install Docker and Docker Compose on Ubuntu 22.04
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version
```

---

## 3. Environment Configuration & Secret Management

Create a production `.env` file in the project root based on the template:

```bash
# Generate secure keys
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24)
REDIS_PASSWORD=$(openssl rand -base64 24)
```

Populate `.env`:

```env
# Node Environment
NODE_ENV=production
PORT=3001

# Public Application Domains
DOMAIN=kharcha.yourdomain.com
FRONTEND_URL=https://kharcha.yourdomain.com

# Database (PostgreSQL)
POSTGRES_USER=kharcha_admin
POSTGRES_PASSWORD=your_secure_postgres_password_here
POSTGRES_DB=kitna_kharcha_prod
DATABASE_URL=postgresql://kharcha_admin:your_secure_postgres_password_here@postgres:5432/kitna_kharcha_prod?schema=public&connection_limit=20

# Caching & BullMQ Pipeline (Redis)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password_here
REDIS_URL=redis://:your_secure_redis_password_here@redis:6379

# Security & Authentication
JWT_SECRET=your_32_byte_jwt_secret_here
JWT_EXPIRES_IN=7d

# Google Gemini Intelligence
GEMINI_API_KEY=AIzaSyYourProductionGeminiApiKey
LLM_PROVIDER=gemini
```

> [!CAUTION]
> Never commit `.env` or production credentials into git. Ensure `.env` has permissions `chmod 600 .env`.

---

## 4. Single-Command Production Deployment

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-org/kitna-kharcha-2.0.git /opt/kitna-kharcha
   cd /opt/kitna-kharcha
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   nano .env # Paste your secrets and production keys
   ```

3. **Build and Launch the Stack via [`docker-compose.prod.yml`](../../docker-compose.prod.yml):**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

4. **Run Database Migrations & Seeds:**
   ```bash
   # Apply pending schema migrations
   docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

   # Seed default categories, classification rules, and starter tags (if fresh installation)
   docker compose -f docker-compose.prod.yml exec backend npm run seed
   ```

5. **Verify Stack Health:**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

---

## 5. Host Reverse Proxy & Automated SSL (NGINX + Certbot)

Install NGINX and Certbot on the host server:
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

Configure `/etc/nginx/sites-available/kitna-kharcha.conf`:

```nginx
server {
    server_name kharcha.yourdomain.com;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Maximum file upload size (for bank statement PDFs/Excel)
    client_max_body_size 25M;

    # Frontend Single Page App
    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API Endpoints
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # LLM streaming & async ingestion timeouts
        proxy_read_timeout 180s;
        proxy_connect_timeout 60s;
    }
}
```

Enable the site and acquire Let's Encrypt SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/kitna-kharcha.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d kharcha.yourdomain.com
```

---

## 6. Observability, Health Checks & Monitoring

Kitna Kharcha 2.0 provides native production health probes:

### 1. Liveness Probe (`GET /health/liveness`)
- Used by orchestrators (Kubernetes / Docker Swarm / AWS ECS) to detect frozen processes.
- **Request:** `curl -i https://kharcha.yourdomain.com/api/health/liveness`
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "kitna-kharcha-backend",
    "uptime": 14205,
    "timestamp": "2026-09-15T12:00:00.000Z"
  }
  ```

### 2. Readiness Probe (`GET /health/readiness`)
- Verifies live connectivity to PostgreSQL database and Redis worker queue.
- **Request:** `curl -i https://kharcha.yourdomain.com/api/health/readiness`
- **Response (Healthy - HTTP 200):**
  ```json
  {
    "status": "ok",
    "checks": {
      "database": "up",
      "redis": "up"
    },
    "timestamp": "2026-09-15T12:00:00.000Z"
  }
  ```
- **Response (Degraded - HTTP 503):**
  ```json
  {
    "status": "degraded",
    "checks": {
      "database": "down",
      "redis": "up"
    },
    "timestamp": "2026-09-15T12:00:00.000Z"
  }
  ```

### 3. LLM Spend & Latency Auditing (`GET /analytics/llm-usage`)
- Authenticated endpoint returning real-time token spend, estimated cost in USD, and latency statistics.

---

## 7. Automated Database Backups & Offsite Replication

Create an automated backup script `/opt/scripts/backup-db.sh`:

```bash
#!/bin/bash
set -eo pipefail

BACKUP_DIR="/var/backups/kitna-kharcha"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="db_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Dump and gzip PostgreSQL database
docker compose -f /opt/kitna-kharcha/docker-compose.prod.yml exec -T postgres \
  pg_dump -U kharcha_admin kitna_kharcha_prod | gzip > "${BACKUP_DIR}/${FILENAME}"

# Retain local backups for 14 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete

# Optional: Sync to S3 or Cloudflare R2
# aws s3 cp "${BACKUP_DIR}/${FILENAME}" s3://your-backup-bucket/kitna-kharcha/

echo "[$(date)] Database backup completed: ${FILENAME}"
```

Make executable and register with cron:
```bash
chmod +x /opt/scripts/backup-db.sh
# Run daily at 02:00 UTC
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/scripts/backup-db.sh >> /var/log/kharcha-backup.log 2>&1") | crontab -
```

---

## 8. Zero-Downtime Updates Runbook

When deploying updates to production:

```bash
cd /opt/kitna-kharcha

# 1. Take a safety snapshot backup
/opt/scripts/backup-db.sh

# 2. Pull latest verified release
git pull origin main

# 3. Build updated images in parallel
docker compose -f docker-compose.prod.yml build

# 4. Apply schema migrations if any
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# 5. Graceful container restart
docker compose -f docker-compose.prod.yml up -d --no-deps backend frontend

# 6. Verify health probe
curl -f http://127.0.0.1:3001/health/readiness || exit 1
```

---

## 9. Production Rollback Strategy

If a deployment introduces regressions, critical bugs, or failed health checks, execute this rollback runbook immediately:

### Step 1: Identify Known-Good Commit or Release Tag
```bash
cd /opt/kitna-kharcha
git log --oneline -n 5
# Note the last stable commit SHA (e.g., abc1234)
```

### Step 2: Roll Back Application Containers
```bash
# Check out the known-good commit
git checkout <known-good-commit-or-tag>

# Rebuild and start the frontend and backend services
docker compose -f docker-compose.prod.yml up -d --build backend frontend
```

### Step 3: Handle Database Rollback (If Migrations Were Applied)
If a destructive migration was applied during the failed deploy:
```bash
# Option A: Restore the pre-deployment snapshot
gunzip -c /var/backups/kitna-kharcha/db_backup_PRE_DEPLOY.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U kharcha_admin -d kitna_kharcha_prod

# Option B: Mark migration resolved if rolling back schema manually
docker compose -f docker-compose.prod.yml exec backend \
  npx prisma migrate resolve --rolled-back <migration_name>
```

### Step 4: Validate Recovery
```bash
# 1. Verify container status
docker compose -f docker-compose.prod.yml ps

# 2. Check readiness probe (database + redis)
curl -i http://127.0.0.1:3001/health/readiness

# 3. Check application logs for runtime exceptions
docker compose -f docker-compose.prod.yml logs --tail=50 backend
```
