# ✅ Fix Deployment Source

## The Problem
GitHub Pages is deploying your source code instead of the built files.

## The Solution

### Step 1: Check Current Pages Settings

1. Go to: https://github.com/DanielC8/scibowl-trials/settings/pages
2. Look at **"Source"** - it should say **"GitHub Actions"**

**If it says anything else** (like "Deploy from a branch"), change it to:
- Source: **GitHub Actions**

### Step 2: Verify Workflow is Enabled

1. Go to: https://github.com/DanielC8/scibowl-trials/actions
2. Make sure the **"Deploy to GitHub Pages"** workflow exists and is enabled

### Step 3: Manually Trigger Rebuild

After confirming Source = GitHub Actions:

1. Go to: https://github.com/DanielC8/scibowl-trials/actions
2. Click **"Deploy to GitHub Pages"** workflow in the left sidebar
3. Click **"Run workflow"** button (top right)
4. Click green **"Run workflow"** button
5. Wait ~2 minutes for completion

### Step 4: Verify Build Output

After workflow completes:
1. Click on the completed workflow run
2. Click **"build"** job
3. Scroll to the **"Build"** step
4. You should see: `✓ built in X.XXs`
5. You should see files like: `dist/assets/index-xxx.js`

If you DON'T see the build output, the secrets might be missing!

---

## What Should Happen

**Correct deployment:**
- URL tries to load: `https://danielc8.github.io/scibowl-trials/assets/index-xxx.js` ✅
- Files exist in the `/scibowl-trials/assets/` folder ✅

**Wrong deployment (current):**
- URL tries to load: `https://danielc8.github.io/src/main.tsx` ❌
- This is the source file, not the built file ❌

---

## Quick Checklist

- [ ] GitHub Pages Source = **"GitHub Actions"** (not "branch")
- [ ] Secrets added (`VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_API_KEY`)
- [ ] Manually ran workflow
- [ ] Workflow shows green checkmark
- [ ] Build step shows `✓ built in X.XXs`
- [ ] Site loads at https://danielc8.github.io/scibowl-trials/

---

## If Still Blank

After doing all the above, refresh with **Ctrl+Shift+R** (hard refresh) and check the Network tab again. The URLs should now be `/scibowl-trials/assets/...` instead of `/src/...`
