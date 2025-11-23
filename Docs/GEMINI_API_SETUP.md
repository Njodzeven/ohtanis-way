# Getting Your Google Gemini API Key

Your app uses **Google Gemini 2.0 Flash** for AI-powered Mandala Chart generation.

## 📝 Quick Steps

### 1. Go to Google AI Studio
Visit: **https://aistudio.google.com/app/apikey**

### 2. Sign In
- Use your Google account
- No special requirements needed

### 3. Create API Key
1. Click **"Create API Key"**
2. Choose to create in:
   - **New project** (if you don't have one), or
   - **Existing project** (if you have a Google Cloud project)
3. Click **"Create API Key in [project name]"**

### 4. Copy Your API Key
- It will look like: `AIzaSyA...`
- **Save it securely** - you'll need it for Render deployment
- Click "Copy" and store it somewhere safe

## ⚠️ Important Notes

### API Key Security
- ✅ **DO** store it in Render environment variables
- ❌ **DON'T** commit it to GitHub
- ❌ **DON'T** share it publicly
- The `.gitignore` file already prevents accidental commits

### Free Tier Limits
Google Gemini offers a **generous free tier**:
- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

This is more than enough for development and moderate usage!

### Rate Limiting
If you hit rate limits, the AI service will:
- Return an error to the user
- Log the error in backend logs
- User can try again after a minute

## 🔍 What the API Does

When a user enters a goal like **"Become a world-class developer"**, the Gemini API:
1. Analyzes the goal
2. Generates 8 supporting pillars (e.g., "Coding Skills", "Mental Focus", etc.)
3. Creates 8 specific tasks for each pillar
4. Returns structured JSON for the Mandala Chart

Example request to Gemini:
```json
{
  "goal": "Become a world-class developer",
  "response": {
    "center_goal": "World-Class Developer",
    "pillars": [
      {
        "title": "Coding Skills",
        "tasks": [
          "Practice algorithms daily",
          "Build 1 project per month",
          "...8 total tasks..."
        ]
      },
      "...7 more pillars..."
    ]
  }
}
```

## 🧪 Testing Locally

To test the AI integration locally:

1. Create `backend/.env` file:
   ```env
   GEMINI_API_KEY=AIzaSyA...your-key-here
   ```

2. Start backend:
   ```bash
   cd backend
   npm run start:dev
   ```

3. Test the endpoint:
   ```bash
   curl -X POST http://localhost:8000/ai/analyze \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"goal": "Test goal"}'
   ```

## 🚀 For Render Deployment

When deploying to Render, you'll add `GEMINI_API_KEY` as an environment variable:

1. Go to Render Dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Add new variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyA...` (your actual key)
5. Save and redeploy

## 📚 Additional Resources

- Google AI Studio: https://aistudio.google.com/
- Gemini API Docs: https://ai.google.dev/docs
- Pricing: https://ai.google.dev/pricing (Free tier is very generous!)
- Rate Limits: https://ai.google.dev/docs/rate_limits

## ✅ Checklist

Before deploying:
- [ ] Created Gemini API key
- [ ] Copied and saved the key securely
- [ ] Tested API key works locally (optional)
- [ ] Ready to add to Render environment variables

---

**Your API key is ready!** Continue with the deployment guide.
