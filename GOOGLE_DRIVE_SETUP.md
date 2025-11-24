# Google Drive API Setup Guide

To use the Google Drive import feature, you need to set up Google Drive API credentials.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give it a name like "Science Bowl Trials"

## Step 2: Enable Google Drive API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**
4. Also enable "Google Picker API"

## Step 3: Create API Credentials

### Create API Key:
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the API key that appears
4. (Optional) Click **Restrict Key** and restrict it to:
   - Google Drive API
   - Google Picker API

### Create OAuth 2.0 Client ID:
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Select "External" user type
   - Fill in app name: "Science Bowl Trials"
   - Add your email as developer contact
   - Skip optional fields
   - Add scope: `https://www.googleapis.com/auth/drive.readonly`
4. Back in credentials, create OAuth client ID:
   - Application type: **Web application**
   - Name: "Science Bowl Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Add your production URL when deploying
   - Authorized redirect URIs: (can leave empty for now)
5. Copy the **Client ID** that appears

## Step 4: Add Credentials to Your App

1. Open `src/utils/googleDrive.ts`
2. Replace the placeholder values at the top:

```typescript
const CLIENT_ID = 'your-client-id-here.apps.googleusercontent.com';
const API_KEY = 'your-api-key-here';
```

## Step 5: Organize Your Google Drive

Your folder structure should be:

```
📁 Science Bowl Problems (root folder you'll select)
├── 📁 Physics
│   ├── 📁 Round 1
│   │   ├── 🖼️ problem1.png
│   │   ├── 🖼️ problem2.png
│   │   └── ...
│   ├── 📁 Round 2
│   │   └── ...
│   └── ...
├── 📁 Biology
│   ├── 📁 Round 1
│   └── ...
├── 📁 Chemistry
│   └── ...
└── 📁 Earth Science (or "Earth and Space")
    └── ...
```

### Folder Naming Rules:
- **Topic folders**: Must contain "Physics", "Biology", "Chemistry", or "Earth"
- **Round folders**: Must contain "Round" followed by a number (e.g., "Round 1", "Round 4")
- **Images**: Any image format (PNG, JPG, etc.)

## Step 6: Use the Feature

1. Run `npm install` to install the new `gapi-script` dependency
2. Start the dev server: `npm run dev`
3. Click **"Sign in to Google Drive"** in the app
4. Authorize the app when prompted
5. Click **"Import from Google Drive"**
6. Select your root folder (e.g., "Science Bowl Problems")
7. Watch the progress as it imports all your problems!

## Troubleshooting

**"Sign in button doesn't work"**
- Check browser console for errors
- Make sure API Key and Client ID are correct
- Ensure Google Drive API is enabled

**"Can't see my folders"**
- Make sure folders are in your Google Drive (not shared with you)
- Check folder naming matches the rules above

**"Images not importing"**
- Ensure files are actual images (PNG, JPG, etc.)
- Check browser console for download errors
- Very large images may take time

## Security Note

The app only requests **read-only** access to your Google Drive. It cannot modify, delete, or create any files. The credentials are only stored in your browser session and are never sent to any server.
