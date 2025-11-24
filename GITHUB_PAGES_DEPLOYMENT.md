# Deploy to GitHub Pages

## 🚀 Quick Setup

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `scibowl-trials`)
3. **Don't** initialize with README (you already have files)

### Step 2: Update Repository Name in Config

In `vite.config.ts`, change the base path to match your repo name:

```typescript
base: process.env.GITHUB_PAGES ? '/YOUR-REPO-NAME/' : '/',
```

For example, if your repo is `scibowl-trials`:
```typescript
base: process.env.GITHUB_PAGES ? '/scibowl-trials/' : '/',
```

### Step 3: Push to GitHub

Open terminal in your project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Pages** in the left sidebar
4. Under "Build and deployment":
   - Source: **GitHub Actions**
5. The site will automatically deploy!

### Step 5: Update Google OAuth Settings

Your app will be at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

Update Google Cloud Console:

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth Client ID
3. Add to **Authorized JavaScript origins**:
   ```
   https://YOUR-USERNAME.github.io
   ```
4. Click **Save**

### Step 6: Access Your App! 🎉

Visit: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

---

## 🔄 Updating Your Deployed App

Every time you push to the `main` branch, GitHub Actions will automatically rebuild and redeploy!

```bash
git add .
git commit -m "Your update message"
git push
```

Wait ~2 minutes for deployment to complete.

---

## 🛠️ Manual Deployment (Alternative)

If you prefer manual deployment without GitHub Actions:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

This builds and pushes to `gh-pages` branch.

---

## ⚠️ Important Notes

### Google Drive Access
- Your OAuth credentials work from GitHub Pages
- Make sure to add your GitHub Pages URL to authorized origins
- Both localhost AND GitHub Pages can work simultaneously!

### Local Development
- `npm run dev` still works at `http://localhost:5173`
- No changes needed for local development

### Troubleshooting

**Blank page after deployment?**
- Check `vite.config.ts` base path matches your repo name
- Repo name is case-sensitive!

**OAuth not working?**
- Verify GitHub Pages URL is in Google Cloud Console authorized origins
- Check browser console for errors

**Build fails?**
- Run `npm install` to get all dependencies
- Check that all TypeScript errors are fixed locally first

---

## 📋 Checklist

- [ ] Create GitHub repository
- [ ] Update `vite.config.ts` with correct repo name
- [ ] Push code to GitHub
- [ ] Enable GitHub Pages (Source: GitHub Actions)
- [ ] Add GitHub Pages URL to Google OAuth settings
- [ ] Visit your deployed site!

Your app will be live at:
**`https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`**
