# Deployment Plan

## 🏗️ Architecture Overview

| Component | Recommended Hosting | Tooling |
|-----------|--------------------|---------|
| **Frontend** | Vercel / Netlify | Git-based CI/CD |
| **Backend** | Render / Railway / AWS App Runner | Docker-based |
| **Database** | Supabase / Railway / AWS RDS | Managed PostgreSQL |

---

## 🚀 Environment Setup

### 1. Database (Managed Postgres)
- Create a production database instance.
- **Critical**: Ensure backups are enabled.
- Copy the Connection String.

### 2. Backend (Docker-based)
Configure the following Environment Variables in your hosting provider:
| Variable | Value Hint | Secret? |
|----------|------------|---------|
| `NODE_ENV` | `production` | No |
| `DATABASE_URL` | `postgresql://...` | **Yes** |
| `JWT_SECRET` | 64-char random string | **Yes** |
| `JWT_REFRESH_SECRET` | 64-char random string | **Yes** |
| `CORS_ORIGINS` | `https://your-frontend-domain.com` | No |
| `PORT` | `3000` | No |

### 3. Frontend
Configure Environment Variables:
| Variable | Value Hint |
|----------|------------|
| `NEXT_PUBLIC_API_URL` | `https://api.your-domain.com/v1` |

---

## 🔐 Secrets Management
1. **Never** commit `.env` files.
2. Use the hosting provider's "Environment Variables" or "Secrets" dashboard.
3. For AWS, use **AWS Secrets Manager**.
4. Use a secure generator (e.g., `openssl rand -base64 48`) for JWT secrets.

---

## 🌐 Domain & HTTPS

### Step 1: Purchasing a Domain
- Use Namecheap, Google Domains, or Route 53.

### Step 2: DNS Configuration
- **Backend**: Create an `A` record or `CNAME` pointing to your backend provider (e.g., `api.example.com`).
- **Frontend**: Point the root domain `example.com` or `www` to the frontend provider.

### Step 3: SSL/TLS (HTTPS)
- **Automatic**: Vercel/Netlify/Render provide automatic Let's Encrypt certificates.
- **Manual**: If using raw VPS, use `certbot` to generate Let's Encrypt certificates for Nginx/Apache.

---

## 📦 Deployment Workflow

### 1. Database Migration
```bash
# Apply migrations to production DB before backend deploy
DATABASE_URL=prod_url npm run db:migrate:deploy
```

### 2. Backend Deployment
- Push code to GitHub.
- Hosting provider detects changes, builds Docker image using `apps/backend/Dockerfile`.
- Provider runs healthcheck (via Docker `HEALTHCHECK`).

### 3. Frontend Deployment
- Push code to GitHub.
- Provider builds and serves static assets.

---

## 🛠️ Post-Deploy Checklist
- [ ] Verify `/health` endpoint returns 200 OK.
- [ ] Run smoke test script: `API_URL=https://api.example.com/v1 npm run test:smoke`.
- [ ] Check logs for any startup errors.
- [ ] Verify database backups are running.
- [ ] Confirm CORS allows only your frontend domain.

---

## 🚨 Disaster Recovery
Reference [BACKUPS.md](./apps/backend/BACKUPS.md) for restoration procedures.
