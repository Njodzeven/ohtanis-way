# Complete Render.com Deployment Guide
# Ohtani's Way - Full Stack PWA

This guide walks you through deploying the entire application stack on Render.com using GitHub.

## 📋 Prerequisites

Before you begin, ensure you have:

1. ✅ GitHub account
2. ✅ Render.com account (sign up at https://render.com)
3. ✅ MongoDB Atlas account (sign up at https://www.mongodb.com/cloud/atlas/register)
(HuggingFace API key (get from https://huggingface.co/settings/tokens))
4. ✅ Google Gemini API key (get from https://aistudio.google.com/app/apikey)
5. ✅ Git initialized in your project

---

## 🚀 Deployment Architecture

```
Frontend (Static Site)  ────►  Backend (Web Service)
   Render.com                     Render.com
                                       ▼
                                  PostgreSQL
                                  (Render DB)
                                       ▼
                                  MongoDB
                                 (Atlas M0)
```

---

## PART 1: Initialize Git Repository

### Step 1: Initialize Git (if not done yet)

```bash
# In the project root
git init
git add .
git commit -m "Initial commit - Ohtani's Way PWA"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `ohtanis-way`)
3. **Do NOT** initialize with README, .gitignore, or license
4. Click "Create repository"

### Step 3: Push to GitHub

```bash
# Add remote origin (replace with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ohtanis-way.git
git branch -M main
git push -u origin main
```

---

## PART 2: Set Up MongoDB Atlas (Free Tier)

MongoDB is not available on Render, so we use MongoDB Atlas.

### Step 1: Create MongoDB Cluster

1. Go to https://cloud.mongodb.com/
2. Sign in or create account
3. Click **"Build a Database"**
4. Choose **"M0 FREE"** tier
5. Select **AWS** provider and closest region
6. Name your cluster: `ohtani-cluster`
7. Click **"Create"**

### Step 2: Create Database User

1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Username: `ohtani_user`
4. Password: Generate a secure password (save it!)
5. Database User Privileges: **Read and write to any database**
6. Click **"Add User"**

### Step 3: Whitelist IP Addresses

1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is safe for development; Atlas handles security
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://ohtani_user:<password>@ohtani-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name at the end: `/ohtani_db`
   
   Final format:
   ```
   mongodb+srv://ohtani_user:YOUR_PASSWORD@ohtani-cluster.xxxxx.mongodb.net/ohtani_db?retryWrites=true&w=majority
   ```

**Save this connection string** - you'll need it later!

---

## PART 3: Deploy PostgreSQL Database on Render

### Step 1: Create PostgreSQL Database

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"PostgreSQL"**
3. Configuration:
   - **Name**: `ohtanis-way-postgres`
   - **Database**: `ohtani_db`
   - **User**: `ohtani_user`
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: 16
   - **Plan**: **Free** (512MB RAM, 1GB storage)
4. Click **"Create Database"**
5. Wait ~2 minutes for database to provision

### Step 2: Get Database Connection String

1. Once created, scroll down to **"Connections"**
2. Copy the **"Internal Database URL"** (starts with `postgresql://`)
3. **Save this** - you'll need it for the backend!

---

## PART 4: Deploy Backend (NestJS API)

### Step 1: Create Backend Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Authorize Render to access your GitHub
4. Select your repository: `YOUR_USERNAME/ohtanis-way`
5. Click **"Connect"**

### Step 2: Configure Backend Service

Fill in the configuration:

- **Name**: `ohtanis-way-backend`
- **Region**: Same as your database
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**:
  ```bash
  npm install && npx prisma generate && npm run build
  ```
- **Start Command**:
  ```bash
  npx prisma migrate deploy && npm run start:prod
  ```
- **Plan**: **Free**

### Step 3: Add Environment Variables

Scroll down to **"Environment Variables"** and add these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `8000` |
| `DATABASE_URL` | *Paste your PostgreSQL Internal URL from Step 3.2* |
| `MONGO_URI` | *Paste your MongoDB Atlas connection string from Step 2.4* |
| `JWT_SECRET` | *Generate a random string (32+ characters)* |
| `JWT_EXPIRATION` | `7d` |
| `GEMINI_API_KEY` | *Your Google Gemini API key* |
| `CORS_ORIGIN` | `https://ohtanis-way-frontend.onrender.com` |

**To generate JWT_SECRET**, run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Once deployed, you'll see: **"Your service is live 🎉"**
4. **Copy your backend URL** (e.g., `https://ohtanis-way-backend.onrender.com`)

### Step 5: Test Backend

Visit: `https://ohtanis-way-backend.onrender.com`

You should see a JSON response (or "Cannot GET /" - that's okay!)

---

## PART 5: Deploy Frontend (React PWA)

### Step 1: Update Frontend Environment Variable

1. Go back to your local project
2. Edit `frontend/.env.production`:
   ```env
   VITE_API_URL=https://ohtanis-way-backend.onrender.com
   ```
   *(Replace with your actual backend URL from Part 4.4)*

3. Commit and push:
   ```bash
   git add frontend/.env.production
   git commit -m "Update production API URL"
   git push
   ```

### Step 2: Create Frontend Static Site

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect to your GitHub repository again
3. Select `YOUR_USERNAME/ohtanis-way`

### Step 3: Configure Frontend Service

- **Name**: `ohtanis-way-frontend`
- **Region**: Same as backend
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**:
  ```bash
  npm install && npm run build
  ```
- **Publish Directory**: `dist`

### Step 4: Add Environment Variable

Scroll to **"Environment Variables"**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://ohtanis-way-backend.onrender.com` |

*(Use your actual backend URL)*

### Step 5: Deploy Frontend

1. Click **"Create Static Site"**
2. Wait 3-5 minutes for deployment
3. Your app will be live at: `https://ohtanis-way-frontend.onrender.com`

---

## PART 6: Update CORS on Backend

Now that frontend is deployed, update the backend to allow it.

### Step 1: Update Backend Environment Variable

1. Go to Render Dashboard
2. Click on **"ohtanis-way-backend"** service
3. Go to **"Environment"** tab
4. Find `CORS_ORIGIN` variable
5. Update value to:
   ```
   https://ohtanis-way-frontend.onrender.com
   ```
6. Click **"Save Changes"**
7. Backend will automatically redeploy (~2 minutes)

---

## ✅ PART 7: Verify Deployment

### Test the Full Stack

1. Visit your frontend: `https://ohtanis-way-frontend.onrender.com`
2. You should see the landing page
3. Try to register a new account
4. If successful, you should be able to create a Mandala chart!

### Troubleshooting

**Backend not responding?**
- Check backend logs: Render Dashboard → Backend Service → "Logs" tab
- Ensure all environment variables are set correctly

**CORS errors?**
- Verify `CORS_ORIGIN` matches your frontend URL exactly
- Check for trailing slashes (shouldn't have them)

**Database connection errors?**
- Test PostgreSQL connection string
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check MongoDB password doesn't contain special characters

**Frontend shows blank page?**
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Check if backend is running

---

## 🎉 Success!

Your app is now live on:
- **Frontend**: https://ohtanis-way-frontend.onrender.com
- **Backend API**: https://ohtanis-way-backend.onrender.com

---

## 📱 Next Steps

### Custom Domain (Optional)

1. Go to Frontend service → "Settings" → "Custom Domain"
2. Add your domain (e.g., `www.ohtanisway.com`)
3. Update DNS records as instructed
4. Update backend `CORS_ORIGIN` to your custom domain

### Enable Auto-Deploy

Auto-deploy is enabled by default. Every push to `main` branch will:
1. Trigger new frontend build
2. Trigger new backend build
3. Run Prisma migrations
4. Deploy automatically

---

## ⚠️ Free Tier Limitations

**Render Free Tier**:
- Services spin down after 15 minutes of inactivity
- First request after inactivity takes ~30 seconds (cold start)
- 750 hours/month of runtime
- Shared resources

**MongoDB Atlas M0**:
- 512MB storage
- Shared cluster
- No backups

**PostgreSQL Free**:
- 1GB storage
- 90 days retention
- Single database

---

## 💡 Tips

1. **Keep services warm**: Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 14 minutes
2. **Monitor logs**: Check Render logs regularly for errors
3. **Database backups**: Export your data periodically (free tier has limited backups)
4. **Upgrade for production**: Consider paid plans for serious usage

---

## 🔧 Making Changes

After deployment, to make updates:

```bash
# Make your changes locally
git add .
git commit -m "Your change description"
git push

# Render will automatically rebuild and redeploy!
```

---

## Support

If you encounter issues:
- Check Render Status: https://status.render.com/
- Check MongoDB Atlas Status: https://status.cloud.mongodb.com/
- Review deployment logs in Render Dashboard
- Verify all environment variables are correct

---

**Congratulations! Your PWA is live! 🚀**
