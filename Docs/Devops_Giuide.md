DevOps & Setup Guide - Ohtani's Way

1. System Prerequisites

Node.js: v18 or higher (LTS recommended).

Docker Desktop: For running databases locally.

pnpm (Optional but recommended) or npm.

2. Environment Variables

Create a .env file in the root directory.

# --- APP CONFIG ---
PORT=3000
NODE_ENV=development

# --- DATABASE (PostgreSQL) ---
# Format: postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ohtani_db?schema=public"

# --- DATABASE (MongoDB) ---
MONGO_URI="mongodb://root:example@localhost:27017/ohtani_mongo?authSource=admin"

# --- AUTHENTICATION ---
JWT_SECRET="super-secret-key-change-this-in-prod"
JWT_EXPIRATION="7d"

# --- AI SERVICES ---
HUGGING_FACE_API_KEY="hf_..."


3. Docker Compose (Local Infrastructure)

We use Docker to spin up the databases without installing them directly on your machine.

File: docker-compose.yml

version: '3.8'
services:
  # PostgreSQL (User Data)
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ohtani_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # MongoDB (Grid Data)
  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    volumes:
      - mongo_data:/data/db

volumes:
  postgres_data:
  mongo_data:


4. Installation & Startup

Step 1: Start Infrastructure

Run the databases in the background.

docker-compose up -d


Step 2: Backend Setup

cd backend
npm install

# Initialize Prisma (Postgres)
npx prisma generate
npx prisma migrate dev --name init

# Start Backend
npm run start:dev


Backend runs on http://localhost:3000

Step 3: Frontend Setup

cd frontend
npm install
npm run dev


Frontend runs on http://localhost:5173

5. Deployment Guide (Production)

Option A: Render.com (Recommended for Free Tier)

Render supports both Node.js services and managed databases.

Web Service (Backend):

Connect GitHub repo.

Build Command: cd backend && npm install && npm run build.

Start Command: cd backend && npm run start:prod.

Add Environment Variables from .env.

Static Site (Frontend):

Connect GitHub repo.

Build Command: cd frontend && npm install && npm run build.

Publish Directory: frontend/dist.

Add Rewrite Rule: Source /*, Destination /index.html (for SPA routing).

Databases:

Use Render's managed PostgreSQL.

Use MongoDB Atlas (M0 Free Tier) for Mongo.

Option B: Docker Monolith

You can also build a single Docker image that serves the NestJS API, which in turn serves the React static files.

Dockerfile (Root):

# Build Frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build Backend
FROM node:18 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build

# Production Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/node_modules ./node_modules
# Copy Frontend build to Backend's public folder
COPY --from=frontend-build /app/frontend/dist ./client_build 

EXPOSE 3000
CMD ["node", "dist/main"]
