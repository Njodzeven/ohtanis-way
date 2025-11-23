# CI/CD Architecture - Ohtani's Way

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPER WORKFLOW                          │
└─────────────────────────────────────────────────────────────────┘

    Developer writes code locally
              ↓
    git add . && git commit -m "..."
              ↓
         git push origin main
              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB ACTIONS                             │
│                                                                 │
│  ┌──────────────┐              ┌──────────────┐               │
│  │  Backend CI  │              │ Frontend CI  │               │
│  ├──────────────┤              ├──────────────┤               │
│  │ npm install  │              │ npm install  │               │
│  │ prisma gen   │              │ npm build    │               │
│  │ npm build    │              │ eslint       │               │
│  │ npm test     │              │              │               │
│  │ eslint       │              │              │               │
│  └──────┬───────┘              └──────┬───────┘               │
│         │                             │                        │
│         └─────────┬───────────────────┘                        │
│                   ↓                                            │
│            All checks pass?                                    │
│         ┌────────┴────────┐                                   │
│         │                  │                                   │
│        YES                NO                                   │
│         │                  │                                   │
│         ↓                  ↓                                   │
│    ✅ SUCCESS         ❌ FAILURE                              │
│         │                  │                                   │
│         │                  └─→ Notify developer               │
│         │                      (Don't deploy)                 │
└─────────┼──────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────────────┐
│                       RENDER.COM                                │
│                                                                 │
│  Detects new commit on main branch                             │
│         ↓                                                       │
│  ┌──────────────┐              ┌──────────────┐               │
│  │   Backend    │              │  Frontend    │               │
│  │   Service    │              │Static Site   │               │
│  ├──────────────┤              ├──────────────┤               │
│  │ npm install  │              │ npm install  │               │
│  │ prisma gen   │              │ vite build   │               │
│  │ npm build    │              │              │               │
│  │ prisma migrate              │              │               │
│  │ npm start    │              │ serve dist/  │               │
│  └──────┬───────┘              └──────┬───────┘               │
│         │                             │                        │
│         └─────────┬───────────────────┘                        │
│                   ↓                                            │
│            🚀 DEPLOYED                                         │
│                                                                 │
│  Backend:  https://ohtanis-way-backend.onrender.com           │
│  Frontend: https://ohtanis-way-frontend.onrender.com          │
└─────────────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                   │
│                                                                 │
│  Access the PWA and use the Mandala Chart app! 🎉             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pull Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  FEATURE DEVELOPMENT                            │
└─────────────────────────────────────────────────────────────────┘

    git checkout -b feature/new-feature
              ↓
    Make changes and commit
              ↓
    git push origin feature/new-feature
              ↓
    Create Pull Request on GitHub
              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 GITHUB ACTIONS (PR)                             │
│                                                                 │
│  Runs automatically on PR:                                     │
│                                                                 │
│  ✓  Build backend                                              │
│  ✓  Build frontend                                             │
│  ✓  Run tests                                                  │
│  ✓  TypeScript type check                                      │
│  ✓  Check for TODOs                                            │
│  ✓  Check for secrets                                          │
│  ✓  PR size check                                              │
│                                                                 │
│         All pass?                                              │
│    ┌────────┴────────┐                                        │
│   YES                NO                                        │
│    │                  │                                        │
│    ↓                  ↓                                        │
│  ✅ PR Ready      ❌ Fix Issues                               │
└────┼─────────────────────────────────────────────────────────────┘
     ↓
   Reviewer approves PR
     ↓
   Merge to main
     ↓
   (Triggers deployment flow above)
```

---

## Branch Protection Strategy (Optional)

```
main branch
    │
    ├─ Require PR reviews (1 minimum)
    ├─ Require status checks to pass:
    │   ├─ Backend CI
    │   ├─ Frontend CI
    │   └─ Type Check
    ├─ Require branches to be up to date
    └─ No direct pushes (enforce PR workflow)
```

**To enable**: GitHub repo → Settings → Branches → Add rule for `main`

---

## CI Minutes Usage (Example)

```
Monthly Activity:
├─ 20 pushes to main × 5 minutes = 100 minutes
├─ 10 PRs × 8 minutes = 80 minutes
└─ Total: 180 minutes/month

GitHub Free Tier: 2,000 minutes/month
Your usage: ~180 minutes/month (9%)
Remaining: 1,820 minutes/month ✅
```

---

## Error Detection Points

```
Code Quality Gates:

LOCAL                      GITHUB ACTIONS           RENDER
  │                              │                     │
  ├─ ESLint (warnings)          │                     │
  ├─ TypeScript check           │                     │
  ├─ Local tests                │                     │
  │                              │                     │
  └──────────────────► ├─ Build check ✅        │
                        ├─ Lint check ✅         │
                        ├─ Type check ✅         │
                        ├─ Test run ✅           │
                        │                          │
                        └────────────► ├─ Final build ✅
                                        ├─ Deploy ✅
                                        └─ Health check ✅

Catches:                Catches:                 Catches:
- Obvious errors        - Build failures         - Runtime errors
- Lint warnings         - Test failures          - Integration issues
                        - Type errors            - Database issues
                        - Missing deps           - Service crashes
```

---

## Notification Flow

```
Push to GitHub
     ↓
GitHub Actions starts
     ↓
     ├─ In Progress → 🟡 Email notification (optional)
     ↓
     ├─ Success → ✅ Green check (GitHub UI)
     │             └─ Render deploys
     │
     └─ Failure → ❌ Red X (GitHub UI)
                   └─ Email notification
                   └─ Stop deployment
                   └─ Check logs
```

Configure notifications:
GitHub → Settings → Notifications → Actions

---

## Optimization Tips

### 1. **Cache Dependencies**
Already configured! Saves ~30 seconds per run.

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  ← Caching enabled
```

### 2. **Run Jobs in Parallel**
Already configured! Backend and frontend build simultaneously.

```yaml
jobs:
  backend-ci:   ← Runs in parallel
  frontend-ci:  ← Runs in parallel
```

### 3. **Skip CI on Docs Changes**
Add to workflow if needed:

```yaml
on:
  push:
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

---

## Monitoring

### View CI Status:
1. GitHub → Your repo → Actions tab
2. See all workflow runs in real-time
3. Click any run for detailed logs

### View Deployment Status:
1. Render → Dashboard
2. See deployment history
3. View logs for errors

### Both Together:
```
GitHub Actions ✅ → Render 🚀 → Production ✅
      ↓                ↓              ↓
  Build logs     Deploy logs     App logs
```

---

## Success Criteria

✅ **CI is working correctly when**:
- Builds complete in under 5 minutes
- Failed builds are caught before deployment
- Notifications arrive promptly
- No false positives (builds fail when they shouldn't)
- Render only deploys when CI passes

---

This architecture ensures **high code quality** and **zero-downtime deployments**! 🎉
