# Pre-Deployment Checklist ✅

Before deploying to Render, complete these steps:

## ☑ STEP 1: Git Repository Setup

- [ ] Initialize Git: `git init`
- [ ] Add all files: `git add .`
- [ ] Initial commit: `git commit -m "Initial commit"`
- [ ] Create GitHub repository
- [ ] Add remote: `git remote add origin <YOUR_REPO_URL>`
- [ ] Push to GitHub: `git push -u origin main`

## ☑ STEP 2: External Services Setup

### MongoDB Atlas
- [ ] Sign up at https://cloud.mongodb.com
- [ ] Create M0 (FREE) cluster
- [ ] Create database user with read/write permissions
- [ ] Whitelist all IPs (0.0.0.0/0)
- [ ] Copy connection string
- [ ] Save connection string securely

### Google Gemini API
- [ ] Go to https://aistudio.google.com/app/apikey
- [ ] Sign in with Google account
- [ ] Click "Create API Key"
- [ ] Create API key in new or existing Google Cloud project
- [ ] Copy the API key
- [ ] Save API key securely

## ☑ STEP 3: Render.com Setup

- [ ] Sign up at https://render.com
- [ ] Connect GitHub account to Render
- [ ] Authorize Render to access your repositories

## ☑ STEP 4: Deploy PostgreSQL Database

- [ ] Create new PostgreSQL database on Render
- [ ] Name: `ohtanis-way-postgres`
- [ ] Choose Free plan
- [ ] Wait for provisioning
- [ ] Copy "Internal Database URL"
- [ ] Save connection string

## ☑ STEP 5: Deploy Backend Service

- [ ] Create new Web Service on Render
- [ ] Connect to GitHub repository
- [ ] Configure:
  - Root Directory: `backend`
  - Build Command: `npm install && npx prisma generate && npm run build`
  - Start Command: `npx prisma migrate deploy && npm run start:prod`
  - Plan: Free
- [ ] Add all environment variables:
  - [ ] NODE_ENV
  - [ ] PORT
  - [ ] DATABASE_URL
  - [ ] MONGO_URI
  - [ ] JWT_SECRET (generate random)
  - [ ] JWT_EXPIRATION
  - [ ] GEMINI_API_KEY
  - [ ] CORS_ORIGIN (placeholder for now)
- [ ] Deploy and wait for completion
- [ ] Copy backend URL
- [ ] Test backend is live

## ☑ STEP 6: Update Frontend Configuration

- [ ] Update `frontend/.env.production` with backend URL
- [ ] Commit changes: `git add frontend/.env.production`
- [ ] Push to GitHub: `git commit -m "Update API URL" && git push`

## ☑ STEP 7: Deploy Frontend Static Site

- [ ] Create new Static Site on Render
- [ ] Connect to same GitHub repository
- [ ] Configure:
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
  - Plan: Free
- [ ] Add environment variable:
  - [ ] VITE_API_URL (your backend URL)
- [ ] Deploy and wait for completion
- [ ] Copy frontend URL

## ☑ STEP 8: Final Configuration

- [ ] Update backend CORS_ORIGIN with frontend URL
- [ ] Wait for backend to redeploy
- [ ] Visit frontend URL
- [ ] Test registration
- [ ] Test login
- [ ] Test creating a Mandala chart
- [ ] Test AI features

## ☑ STEP 9: Optional Enhancements

- [ ] Set up custom domain
- [ ] Configure UptimeRobot to prevent cold starts
- [ ] Set up monitoring/alerts
- [ ] Enable GitHub auto-deploy (enabled by default)

---

## 📝 Information to Collect

Keep these handy during deployment:

| Item | Where to Get It | Save Here |
|------|----------------|-----------|
| MongoDB Connection String | MongoDB Atlas → Connect | _________________ |
| PostgreSQL URL | Render PostgreSQL → Connections | _________________ |
| Google Gemini API Key | Google AI Studio → API Keys | _________________ |
| JWT Secret | Generate with crypto | _________________ |
| Backend URL | Render Backend Service | _________________ |
| Frontend URL | Render Static Site | _________________ |

---

## 🆘 If Something Goes Wrong

1. **Check Render Logs**: Dashboard → Service → Logs tab
2. **Verify Environment Variables**: All values set correctly?
3. **Check GitHub**: Is latest code pushed?
4. **Database Connections**: Test connection strings
5. **CORS**: Ensure frontend URL matches CORS_ORIGIN exactly

---

## ✅ Deployment Complete!

Once all checkboxes are ticked:
- Your app is live 🎉
- Auto-deploy is enabled
- Databases are connected
- CORS is configured
- PWA is working

**Next**: Share your app URL and start using Ohtani's Way!

Frontend: ___________________________________
Backend: ____________________________________
