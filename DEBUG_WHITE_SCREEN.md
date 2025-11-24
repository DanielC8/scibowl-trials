# 🐛 Debugging White Screen on GitHub Pages

## What's Happening

You have **TWO** deployment workflows running:
1. ❌ Custom workflow (`.github/workflows/deploy.yml`) - **FAILING**
2. ✅ Automatic GitHub Pages - **WORKING** (but maybe showing white screen)

## Why White Screen?

### Most Likely Causes:

1. **Base Path Issue** ⚠️
   - If you see a blank page, open browser console (F12)
   - Look for 404 errors like: `Failed to load resource: /assets/index-xxx.js`
   - This means the base path is wrong

2. **JavaScript Errors**
   - Open browser console (F12)
   - Look for red error messages
   - Common: "Cannot read property 'env' of undefined"

3. **Secrets Not Added**
   - Google Drive features won't work
   - But the page should still load

---

## 🔧 Quick Fixes

### Fix 1: Check Browser Console

1. Visit: https://danielc8.github.io/scibowl-trials/
2. Press **F12** (open DevTools)
3. Click **Console** tab
4. Take a screenshot and show me the errors

### Fix 2: Verify Base Path

The base path in `vite.config.ts` should be:
```typescript
base: process.env.GITHUB_PAGES ? '/scibowl-trials/' : '/',
```

Make sure:
- Starts with `/`
- Ends with `/`
- Matches your repository name EXACTLY (case-sensitive)

### Fix 3: Add GitHub Secrets (Required for Google Drive)

Even if the page loads, Google Drive won't work without these:

1. Go to: https://github.com/DanielC8/scibowl-trials/settings/secrets/actions
2. Add secret: `VITE_GOOGLE_CLIENT_ID`
   - Value: `878351028404-bvt9f02j9648gpd6fm8dggdiam93iiiq.apps.googleusercontent.com`
3. Add secret: `VITE_GOOGLE_API_KEY`
   - Value: `AIzaSyBtEgN6fH4RuqETTFYJ1be58n9qlaXVLqs`

### Fix 4: Force Rebuild

After adding secrets:

1. Go to: https://github.com/DanielC8/scibowl-trials/actions
2. Click **"Deploy to GitHub Pages"**
3. Click **"Run workflow"** → **"Run workflow"**

---

## 🔍 Check Which Deployment Succeeded

The site might actually be live from the automatic deployment!

Try these URLs:
1. https://danielc8.github.io/scibowl-trials/
2. https://danielc8.github.io/scibowl-trials/index.html

---

## 📊 What the Status Means

**Your Status:**
- ❌ Deploy to GitHub Pages / build (push) - **Custom workflow failing**
- ✅ pages build and deployment - **Automatic workflow working**

The automatic one succeeded, so your site IS deployed!
The custom one failed probably because secrets aren't added.

---

## 🎯 Most Likely Solution

**The site is actually live, just:**
1. Open browser console (F12)
2. Show me the error messages
3. We'll fix from there

**OR if you see "Failed to load /assets/...":**
- The base path is wrong
- Let me know and I'll fix it!
