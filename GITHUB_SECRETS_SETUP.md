# 🔐 Setting Up GitHub Secrets

## Why You Need This

Your Google API credentials are now stored in environment variables (not in the code).
For GitHub Pages to build your app, you need to add these as **GitHub Secrets**.

## Step-by-Step Instructions

### 1. Go to Your Repository Settings

1. Visit: https://github.com/DanielC8/scibowl-trials
2. Click **"Settings"** tab (top right)
3. In the left sidebar, click **"Secrets and variables"** → **"Actions"**

### 2. Add First Secret (Client ID)

1. Click **"New repository secret"** button
2. Name: `VITE_GOOGLE_CLIENT_ID`
=4. Click **"Add secret"**

### 3. Add Second Secret (API Key)

1. Click **"New repository secret"** again
2. Name: `VITE_GOOGLE_API_KEY`
=4. Click **"Add secret"**

### 4. Enable GitHub Pages

1. Still in Settings, click **"Pages"** in left sidebar
2. Under **"Build and deployment"**:
   - Source: Select **"GitHub Actions"**
3. Done!

### 5. Trigger Deployment

The deployment will start automatically, OR you can manually trigger it:

1. Go to **"Actions"** tab
2. Click **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** → **"Run workflow"**

### 6. Wait for Deployment (2-3 minutes)

- Watch the workflow run in the Actions tab
- Wait for the green checkmark ✅
- Your site will be live!

---

## 🎉 Your Live Site URL

Once deployed, visit:
```
https://danielc8.github.io/scibowl-trials/
```

---

## ⚠️ Important Notes

### Security
- ✅ Credentials are NOT in your code
- ✅ They're stored securely as GitHub Secrets
- ✅ Only GitHub Actions can access them
- ✅ Your `.env` file is gitignored (never gets uploaded)

### Local Development
- Your local `.env` file still works
- Run `npm run dev` as normal
- No changes needed!

### If You Need to Update Credentials
1. Go to Settings → Secrets and variables → Actions
2. Click the pencil icon next to the secret
3. Enter new value and save

---

## ✅ Checklist

- [ ] Added `VITE_GOOGLE_CLIENT_ID` secret
- [ ] Added `VITE_GOOGLE_API_KEY` secret
- [ ] Enabled GitHub Pages (Source: GitHub Actions)
- [ ] Workflow ran successfully (green checkmark)
- [ ] Visited live site and tested
- [ ] Updated Google OAuth origins to include `https://danielc8.github.io`

---

## 🐛 Troubleshooting

**Build fails with "VITE_GOOGLE_CLIENT_ID is not defined"**
- You forgot to add the secrets - go back to step 2

**Google sign-in doesn't work on live site**
- Add `https://danielc8.github.io` to Google Cloud Console OAuth authorized origins

**Changes don't appear**
- Wait 2-3 minutes for rebuild
- Hard refresh: Ctrl+Shift+R

**Need help?**
- Check the Actions tab for error messages
- Make sure secret names are EXACTLY: `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_API_KEY`
