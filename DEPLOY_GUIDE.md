# 🚀 Deploy to GitHub Pages - Complete Guide

## Step 1: Choose Your Repository Name

Pick a name for your GitHub repository, for example:
- `scibowl-trials`
- `science-bowl`
- `scibowl-generator`

**Remember this name!** You'll need it in the next step.

---

## Step 2: Update Base Path

Open `vite.config.ts` and change line 8:

**Change from:**
```typescript
base: process.env.GITHUB_PAGES ? '/windsurf-project/' : '/',
```

**Change to:** (replace with YOUR repository name)
```typescript
base: process.env.GITHUB_PAGES ? '/YOUR-REPO-NAME/' : '/',
```

**Example:** If your repo is `scibowl-trials`:
```typescript
base: process.env.GITHUB_PAGES ? '/scibowl-trials/' : '/',
```

⚠️ **Important:** The name must match EXACTLY (case-sensitive)!

---

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: Enter your chosen name (e.g., `scibowl-trials`)
3. Description: "Science Bowl problem set generator"
4. **Public** (required for free GitHub Pages)
5. **DON'T** check "Add a README file"
6. Click **"Create repository"**

---

## Step 4: Push Your Code to GitHub

Open PowerShell/Terminal in your project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Science Bowl Trials"

# Set main branch
git branch -M main

# Add remote (replace with YOUR username and repo name)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/duhduck673e/scibowl-trials.git
git push -u origin main
```

---

## Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** tab (top right)
3. Click **"Pages"** in left sidebar
4. Under **"Build and deployment"**:
   - Source: Select **"GitHub Actions"**
5. Click **"Save"** (if there's a save button)

The deployment will start automatically! ⚡

---

## Step 6: Wait for Deployment (2-3 minutes)

1. Go to the **"Actions"** tab in your repository
2. You should see a workflow running: "Deploy to GitHub Pages"
3. Wait for the green checkmark ✅
4. Your site is now live!

---

## Step 7: Update Google OAuth Settings

Your app will be at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

**Example:**
```
https://duhduck673e.github.io/scibowl-trials/
```

### Update Google Cloud Console:

1. Go to https://console.cloud.google.com/apis/credentials
2. Click your **OAuth 2.0 Client ID**
3. Under **"Authorized JavaScript origins"**, click **"+ ADD URI"**
4. Add: `https://YOUR-USERNAME.github.io`
5. Click **"SAVE"**

---

## Step 8: Access Your Live Site! 🎉

Visit your site at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

Everything should work exactly like localhost!

---

## 🔄 Making Updates

When you want to update your site:

```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub will automatically rebuild and redeploy! (Takes ~2 minutes)

---

## ✅ Quick Checklist

- [ ] Chose repository name
- [ ] Updated `vite.config.ts` with correct base path
- [ ] Created GitHub repository (Public)
- [ ] Pushed code to GitHub
- [ ] Enabled GitHub Pages (Source: GitHub Actions)
- [ ] Waited for deployment to complete
- [ ] Updated Google OAuth authorized origins
- [ ] Visited live site and tested!

---

## 🐛 Troubleshooting

### Site shows blank page
- Check `vite.config.ts` - base path must match repo name exactly
- Check browser console for errors
- Make sure GitHub Pages is set to "GitHub Actions"

### Google Drive sign-in doesn't work
- Make sure you added `https://YOUR-USERNAME.github.io` to Google OAuth
- Check that you're using the correct OAuth Client ID (Web application)

### Build fails in GitHub Actions
- Go to Actions tab, click the failed workflow
- Read the error message
- Usually means TypeScript errors - fix locally and push again

### Changes don't appear
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check Actions tab - deployment might still be running
- Wait 2-3 minutes after push

---

## 📝 Your URLs

**Local development:**
```
http://localhost:5173
```

**Live site:**
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

Both can work at the same time!

---

## 💡 Pro Tips

- Keep using `npm run dev` for local development
- Only push to GitHub when ready to deploy
- The live site updates automatically with every push to `main`
- You can have multiple people access the GitHub Pages URL
- It's completely free! 🎉
