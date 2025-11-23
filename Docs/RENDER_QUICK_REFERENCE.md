# Quick Reference - Render Deployment Commands

## Local Development
```bash
# Start all services locally
docker-compose up -d
npm run dev:backend
npm run dev:frontend
```

## Environment Variables for Render

### Backend Service
```
NODE_ENV=production
PORT=8000
POSTGRES_URL=<from_render_postgres>
MONGO_URI=<from_mongodb_atlas>
JWT_SECRET=<generate_random_32_chars>
JWT_EXPIRATION=7d
GEMINI_API_KEY=<your_gemini_api_key>
CORS_ORIGIN=https://ohtanis-way-frontend.onrender.com
```

### Frontend Static Site
```
VITE_API_URL=https://ohtanis-way-backend.onrender.com
```

## Render Configuration

### Backend Web Service
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma migrate deploy && npm run start:prod`
- **Root Directory**: `backend`

### Frontend Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Root Directory**: `frontend`

## URLs (Replace with your actual URLs)
- Frontend: https://ohtanis-way-frontend.onrender.com
- Backend: https://ohtanis-way-backend.onrender.com
- PostgreSQL: Internal (provided by Render)
- MongoDB: Atlas (mongodb+srv://...)

## Useful Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Backend Locally
```bash
cd backend
npm run start:dev
```

### Test Frontend Locally
```bash
cd frontend
npm run dev
```

### Build Frontend for Production
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## Troubleshooting

### Check Backend Logs
Render Dashboard → Backend Service → Logs tab

### Check Frontend Build Logs
Render Dashboard → Frontend Static Site → Events tab

### Test Database Connection
Check PostgreSQL: Render Dashboard → Database → Connection Details
Check MongoDB: Atlas Dashboard → Clusters → Connect

### CORS Issues
Ensure backend CORS_ORIGIN matches frontend URL exactly (no trailing slash)
