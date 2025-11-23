# JWT Configuration for Ohtani's Way

## What are JWT_SECRET and JWT_EXPIRATION?

### JWT_SECRET
**What it is**: A secret key used to sign and verify JSON Web Tokens (JWT) for user authentication.

**Your generated JWT_SECRET**:
```
b3fc77d5f479d86349c5d892ea767c3fb9d4c49b19da225a220f2810a77f4645
```

**How it's used**:
- When a user logs in, the backend creates a JWT token signed with this secret
- The token is sent to the frontend and stored in localStorage
- Every API request includes this token in the Authorization header
- The backend verifies the token using the same secret

**Security**: Keep this secret! Never commit to GitHub or share publicly.

---

## JWT_EXPIRATION
**What it is**: How long the authentication token remains valid before the user needs to log in again.

**Recommended value**: `7d` (7 days)

**Common values**:
- `15m` - 15 minutes (very secure, but user needs to re-login often)
- `1h` - 1 hour (secure, good for banking apps)
- `24h` - 24 hours (1 day)
- `7d` - 7 days (good balance for most apps) ← **RECOMMENDED**
- `30d` - 30 days (convenient but less secure)

**Why 7 days?**
- Users stay logged in for a week
- Not too short (annoying to re-login constantly)
- Not too long (security risk if token is stolen)
- Good for a goal-tracking PWA

---

## Environment Variables for Render

When deploying to Render, add these **two** environment variables:

| Key | Value | Description |
|-----|-------|-------------|
| `JWT_SECRET` | `b3fc77d5f479d86349c5d892ea767c3fb9d4c49b19da225a220f2810a77f4645` | Secret key for signing tokens |
| `JWT_EXPIRATION` | `7d` | Token validity period (7 days) |

**Yes, you need BOTH!**

---

## Complete Backend Environment Variables

Here's the full list for Render deployment:

```
NODE_ENV=production
PORT=8000
POSTGRES_URL=<your_render_postgres_internal_url>
MONGO_URI=<your_mongodb_atlas_connection_string>
JWT_SECRET=b3fc77d5f479d86349c5d892ea767c3fb9d4c49b19da225a220f2810a77f4645
JWT_EXPIRATION=7d
GEMINI_API_KEY=<your_gemini_api_key>
CORS_ORIGIN=https://ohtanis-way-frontend.onrender.com
```

---

## How Authentication Works in Your App

```
1. User registers/logs in
   ↓
2. Backend creates JWT token with JWT_SECRET
   ↓
3. Token is valid for JWT_EXPIRATION (7 days)
   ↓
4. Frontend stores token in localStorage
   ↓
5. Every API request includes token
   ↓
6. Backend verifies token with JWT_SECRET
   ↓
7. After 7 days, token expires → user must login again
```

---

## Testing Token Expiration

To test shorter expiration during development, you can use:
- `30s` - 30 seconds
- `5m` - 5 minutes
- `1h` - 1 hour

For production, stick with `7d`.

---

## Security Best Practices

✅ **DO**:
- Use long, random JWT_SECRET (32+ characters)
- Store JWT_SECRET in environment variables only
- Use reasonable expiration time (7d is good)
- Clear tokens on logout

❌ **DON'T**:
- Commit JWT_SECRET to Git
- Use simple/predictable secrets like "secret123"
- Set expiration too long (security risk)
- Share your JWT_SECRET publicly

---

## Quick Reference

**Your JWT Configuration**:
```
JWT_SECRET: b3fc77d5f479d86349c5d892ea767c3fb9d4c49b19da225a220f2810a77f4645
JWT_EXPIRATION: 7d
```

✅ Both are ready to use in Render deployment!
