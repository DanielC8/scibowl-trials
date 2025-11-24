# Fix OAuth Error: "NATIVE_DESKTOP client type"

## The Problem
Your OAuth Client ID is configured as **"Desktop"** but needs to be **"Web application"** for browser access.

## Solution: Create a New Web Application OAuth Client

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Make sure you're in the correct project

### Step 2: Create New OAuth Client ID
1. Click **"+ CREATE CREDENTIALS"** at the top
2. Select **"OAuth client ID"**
3. For "Application type", choose **"Web application"** ⚠️ NOT Desktop!
4. Give it a name: "Science Bowl Web Client"

### Step 3: Configure Web Application Settings

**Authorized JavaScript origins:**
```
http://localhost:5173
```

**Authorized redirect URIs:** (can leave empty or add)
```
http://localhost:5173
```

### Step 4: Get the New Client ID
1. Click **"CREATE"**
2. Copy the **Client ID** that appears (looks like: `xxxxx-xxxxx.apps.googleusercontent.com`)
3. Give me the new Client ID and I'll update the code

### Step 5: Configure OAuth Consent Screen (if not done)
1. Go to **"OAuth consent screen"** in the left menu
2. Choose **"External"** user type
3. Fill in:
   - App name: "Science Bowl Trials"
   - User support email: your email
   - Developer contact: your email
4. Click **"Save and Continue"**
5. On the Scopes page, click **"Add or Remove Scopes"**
   - Search for and add: `https://www.googleapis.com/auth/drive.readonly`
6. Click **"Save and Continue"**
7. On Test users page, add your email: `duhduck673e@gmail.com`
8. Click **"Save and Continue"**

## Alternative: Edit Existing Client

If you want to edit the existing client instead:
1. Go to your credentials list
2. Find your OAuth Client ID
3. Click the pencil icon to edit
4. **Change Application type to "Web application"**
5. Add JavaScript origins: `http://localhost:5173`
6. Save

---

Once you create the new Web application OAuth Client ID, paste it here and I'll update the code!
