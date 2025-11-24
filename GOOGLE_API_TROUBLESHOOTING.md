# Google Drive API Troubleshooting

## Current Error: 502 / API Discovery Failed

This usually means:
1. ❌ **API Key format is incorrect**
2. ❌ **Google Drive API not enabled**
3. ❌ **API Key restrictions blocking requests**

## Step 1: Verify Your API Key

A valid Google API Key should:
- Start with `AIzaSy`
- Be exactly 39 characters long
- Look like: `AIzaSyDaGmWdaogXoS_FWkr56s0yWc-4...`

The key you provided appears to be incomplete or in a different format.

## Step 2: Get the Correct API Key

### Go to [Google Cloud Console](https://console.cloud.google.com/)

1. **Select your project** (or create one)

2. **Enable APIs**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Drive API" → **Enable**
   - Search for "Google Picker API" → **Enable**

3. **Create/Check API Key**:
   - Go to **APIs & Services** → **Credentials**
   - Look for your API Key (or create a new one)
   - Click the key name to view details
   - Copy the **full key** (starts with AIzaSy)

4. **Configure API Key Restrictions** (Important!):
   - Click **Edit** on your API key
   - Under "Application restrictions":
     - Choose **HTTP referrers (web sites)**
     - Add: `http://localhost:5173/*` (for development)
   - Under "API restrictions":
     - Choose **Restrict key**
     - Select: **Google Drive API** and **Google Picker API**
   - Click **Save**

## Step 3: Verify OAuth 2.0 Client ID

Your Client ID looks correct: `878351028404-ei3p5pbho5aqn01g1rc3hdv4h1ptelvl.apps.googleusercontent.com`

But make sure:
1. It's configured for "Web application"
2. **Authorized JavaScript origins** includes: `http://localhost:5173`
3. **OAuth consent screen** is configured (can be External + Testing mode)

## Alternative Solution: Skip Google Drive Integration

If you're having trouble with the Google API setup, you can:

1. **Use Manual Image Upload** (already in the app)
   - Just drag/drop images into subject banks
   - Manually organize by subject

2. **Simplify the Import**
   - I can create a version that reads from a local folder instead of Google Drive
   - No API keys needed, just browse your local files

Would you like me to:
- **A)** Help you get the correct API key from Google Cloud Console
- **B)** Create a local folder import feature (no Google API needed)
- **C)** Both - keep Google Drive option but add local import too

Let me know!
