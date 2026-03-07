# Deployment Guide

This guide covers deploying the DPRIDE International School website to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Deployment Options](#deployment-options)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- [x] Node.js 18+ installed
- [x] PostgreSQL database (production)
- [x] Domain name configured
- [x] SSL certificate ready
- [x] Environment variables prepared
- [x] Sanity CMS project configured

## Environment Variables

### Required Variables

Create a `.env.production` file with these required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth - CRITICAL: Generate strong secrets
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long-for-production"
NEXTAUTH_URL="https://yourdomain.com"

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_PREVIEW_SECRET="your-sanity-preview-secret"

# Node Environment
NODE_ENV="production"
```

### Generating Secrets

Generate a secure `NEXTAUTH_SECRET`:

```bash
# Option 1: Using openssl
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online
# Visit: https://generate-secret.vercel.app/32
```

### Security Checklist

- [ ] `NEXTAUTH_SECRET` is at least 32 characters
- [ ] `NEXTAUTH_SECRET` is unique and not shared with other environments
- [ ] `DATABASE_URL` uses a strong password
- [ ] Database credentials are not exposed
- [ ] All secrets are stored securely (not in version control)

## Database Setup

### 1. Create Production Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE dprideschools_prod;
CREATE USER dpride_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE dprideschools_prod TO dpride_user;
```

### 2. Run Migrations

```bash
# Set the production DATABASE_URL
export DATABASE_URL="postgresql://dpride_user:password@host:5432/dprideschools_prod"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 3. Seed Initial Data

```bash
# Seed roles and permissions
ADMIN_EMAIL="admin@dprideschools.com" \
ADMIN_PASSWORD="SecurePassword123!" \
npm run db:seed
```

## Deployment Options

### Option 1: Vercel (Recommended)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login

```bash
vercel login
```

#### Step 3: Deploy

```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

#### Step 4: Configure Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all required environment variables
3. Redeploy to apply changes

#### Vercel Configuration

Create or update `vercel.json`:

```json
{
  "buildCommand": "npx prisma generate && npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXTAUTH_URL": "@nextauth-url"
  }
}
```

### Option 2: Self-Hosted (VPS/Dedicated Server)

#### Prerequisites

- Ubuntu 22.04 LTS (recommended)
- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2 (process manager)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

#### Step 2: Clone and Build

```bash
# Clone repository
cd /var/www
git clone https://github.com/DSNOUSE/dprideinternationalschool.git
cd dprideinternationalschool

# Install dependencies
npm ci --production

# Set up environment variables
cp env.example .env.production
nano .env.production  # Fill in production values

# Generate Prisma Client and run migrations
npx prisma generate
npx prisma migrate deploy

# Build the application
npm run build
```

#### Step 3: Configure PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'dprideschools',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start with PM2:

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

#### Step 4: Configure Nginx

Create `/etc/nginx/sites-available/dprideschools`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "origin-when-cross-origin" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/dprideschools /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 5: SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Option 3: Docker Deployment

#### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: dprideschools
      POSTGRES_USER: dpride
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Deploy:

```bash
docker-compose up -d
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health
curl https://yourdomain.com

# Test authentication
curl https://yourdomain.com/api/auth/session

# Verify database connection
# (check application logs)
```

### 2. Initial Configuration

1. **Login as Admin**
   - Go to `https://yourdomain.com/admin-signin`
   - Use credentials from seed script

2. **Configure Sanity Studio**
   - Access at `https://yourdomain.com/admin/studio`
   - Set up initial content

3. **Test Core Features**
   - Student login
   - Parent login
   - Results lookup
   - Admin dashboard

### 3. Set Up Backups

```bash
# Database backup script
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

## Monitoring

### Set Up Error Tracking

1. **Sentry** (Recommended)
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

2. **Update logger.ts**
   ```typescript
   import * as Sentry from '@sentry/nextjs';

   // In error method
   Sentry.captureException(error);
   ```

### Set Up Uptime Monitoring

- UptimeRobot: https://uptimerobot.com
- Pingdom: https://www.pingdom.com
- Better Uptime: https://betteruptime.com

### Log Monitoring

```bash
# View PM2 logs
pm2 logs dprideschools

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs dprideschools --lines 100

# Common issues:
# 1. Missing environment variables
# 2. Database connection failed
# 3. Build errors
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check PostgreSQL status
sudo systemctl status postgresql

# Verify credentials
# Check DATABASE_URL format
```

### High Memory Usage

```bash
# Check memory
pm2 monit

# Restart app
pm2 restart dprideschools

# Adjust max memory
pm2 start ecosystem.config.js --max-memory-restart 1024M
```

### SSL Certificate Issues

```bash
# Test SSL
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t
```

## Performance Optimization

### Enable Caching

Add to `next.config.ts`:

```typescript
export default {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
};
```

### Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_student_admission ON "Student"("admissionNo");
CREATE INDEX idx_student_class ON "Student"("classId");
CREATE INDEX idx_grade_student ON "Grade"("studentId");
```

### CDN Setup

Use Vercel's CDN or configure Cloudflare:

1. Point domain to Cloudflare
2. Enable CDN caching
3. Configure cache rules
4. Enable DDoS protection

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Security audit
npm audit fix

# Rebuild and redeploy
npm run build
pm2 restart dprideschools
```

### Database Maintenance

```bash
# Run vacuum
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size('dprideschools'));"
```

## Support

For deployment issues:
- Email: deploy@dprideschools.com
- Check GitHub Issues
- Review logs first

---

**Congratulations!** Your DPRIDE International School website is now deployed to production! 🎉
