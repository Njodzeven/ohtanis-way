# GitHub Actions CI/CD Guide

## What We've Set Up

Your repository now has **automated quality checks** that run on every push and pull request.

## 🔄 Workflows

### 1. **CI/CD Pipeline** (`.github/workflows/ci.yml`)

Runs on every push to `main` or `develop` branches.

**What it does**:
- ✅ Builds backend
- ✅ Builds frontend  
- ✅ Runs linting
- ✅ Runs tests
- ✅ Generates Prisma client
- ✅ Checks if code compiles

**Jobs**:
```
backend-ci    → Build + test backend
frontend-ci   → Build + test frontend
deploy-ready  → Confirms ready for Render deployment
```

### 2. **PR Quality Checks** (`.github/workflows/pr-checks.yml`)

Runs on every pull request to `main`.

**What it does**:
- 🔍 Checks for TODOs/FIXMEs
- 🔐 Scans for potential secrets
- 📊 Warns if PR is too large
- 📝 Runs TypeScript type checking

---

## 🎯 How It Works

### Push to Main
```
1. You push code to GitHub
   ↓
2. GitHub Actions runs CI checks
   ↓
3. If passes → Render auto-deploys
   ↓
4. If fails → You get notified, Render doesn't deploy
```

### Pull Request Flow
```
1. Create PR to main
   ↓
2. GitHub Actions runs all checks
   ↓
3. PR shows ✅ or ❌ status
   ↓
4. Review checks before merging
   ↓
5. Merge → Triggers deployment
```

---

## 📊 Viewing CI Results

### On GitHub:
1. Go to your repository
2. Click **"Actions"** tab
3. See all workflow runs
4. Click any run to see detailed logs

### On Pull Requests:
- ✅ Green check = All tests passed
- ❌ Red X = Build failed
- 🟡 Yellow dot = Running

---

## 🛠️ Customizing Workflows

### Make Lint Errors Block Deployment

Currently, lint errors are **warnings only**. To make them **blocking**:

Edit `.github/workflows/ci.yml`:
```yaml
- name: Run ESLint
  run: npm run lint
  continue-on-error: false  # Change to false
```

### Add Environment Variables

For workflows that need env vars (like API keys for testing):

```yaml
- name: Run tests
  run: npm test
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

Then add the secret:
1. GitHub repo → Settings → Secrets and variables → Actions
2. New repository secret
3. Add `GEMINI_API_KEY`

---

## 🚀 GitHub Actions + Render Flow

### Current Setup:
```
┌─────────────────────────────────────────────────┐
│  1. Push to GitHub                              │
│     ↓                                           │
│  2. GitHub Actions CI runs                      │
│     ├─ Build backend ✅                         │
│     ├─ Build frontend ✅                        │
│     └─ Run tests ✅                             │
│     ↓                                           │
│  3. If CI passes → Render detects push          │
│     ↓                                           │
│  4. Render builds & deploys                     │
│     ├─ Backend → ohtanis-way-backend           │
│     └─ Frontend → ohtanis-way-frontend         │
└─────────────────────────────────────────────────┘
```

**Benefits**:
- Catch errors before wasting Render build time
- Free tier: 2,000 CI minutes/month on GitHub
- Faster feedback loop
- Better code quality

---

## ⚙️ Workflow Configuration

### When Workflows Run:

**CI Pipeline** (`ci.yml`):
- Every push to `main` or `develop`
- Every pull request to `main` or `develop`

**PR Checks** (`pr-checks.yml`):
- Only on pull requests to `main`

### Build Times:
- Backend build: ~2-3 minutes
- Frontend build: ~1-2 minutes
- Total: ~3-5 minutes per push

---

## 🎨 Badge for README

Add a build status badge to your README:

```markdown
![CI/CD Pipeline](https://github.com/Njodzeven/ohtanis-way/workflows/CI/CD%20Pipeline/badge.svg)
```

Shows:
- ![passing](https://img.shields.io/badge/build-passing-brightgreen) - All checks pass
- ![failing](https://img.shields.io/badge/build-failing-red) - Build broken

---

## 🐛 Troubleshooting

### "npm ci" fails
**Cause**: Lock file out of sync
**Fix**: Regenerate lock file locally and commit:
```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
```

### Build passes locally but fails on GitHub
**Cause**: Environment differences
**Check**:
- Node version (should be 18)
- Missing environment variables
- Platform-specific dependencies

### Prisma errors in CI
**Cause**: Database not available in CI
**Solution**: Already handled - we just generate the client, don't run migrations

---

## 📝 Best Practices

### ✅ DO:
- Keep workflows fast (under 10 minutes)
- Use `continue-on-error` for non-critical checks
- Cache dependencies (`cache: 'npm'`)
- Run only on relevant branches

### ❌ DON'T:
- Put secrets in workflow files
- Run expensive operations on every commit
- Ignore CI failures (fix them!)

---

## 🔄 Updating Workflows

Workflow files are in `.github/workflows/`:
```
.github/
└── workflows/
    ├── ci.yml          ← Main CI/CD pipeline
    └── pr-checks.yml   ← PR quality gates
```

After editing:
```bash
git add .github/workflows/
git commit -m "Update CI workflow"
git push
```

Changes take effect immediately!

---

## 📊 Free Tier Limits

**GitHub Actions Free Tier**:
- ✅ 2,000 minutes/month
- ✅ Unlimited for public repos
- ✅ 20 concurrent jobs

**Your usage** (estimated):
- ~5 minutes per push
- ~400 pushes/month possible
- Way under limit! 🎉

---

## ✅ What's Already Configured

- [x] Backend build check
- [x] Frontend build check
- [x] Lint checks (warnings only)
- [x] Prisma client generation
- [x] PR quality checks
- [x] Type checking
- [x] Artifact uploads
- [x] Deployment notifications

---

## 🚀 Ready to Use!

Your CI/CD pipeline is ready. Next push will automatically:
1. Run all checks
2. Report status
3. Deploy to Render if on `main` branch

**Next**: Commit and push these workflow files to see it in action!

```bash
git add .github/
git commit -m "Add GitHub Actions CI/CD workflows"
git push
```

Then go to GitHub → Actions tab to see it running!
