# Enable Google Picker API

## The Error
`Cannot read properties of undefined (reading 'PickerBuilder')`

This means **Google Picker API is not enabled** in your Google Cloud project.

## Fix: Enable Google Picker API

### Step 1: Go to API Library
1. Open [Google Cloud Console - API Library](https://console.cloud.google.com/apis/library)
2. Make sure you're in the correct project (the one with your OAuth client)

### Step 2: Search for Picker API
1. In the search bar, type: **"Google Picker API"**
2. Click on **"Google Picker API"** in the results

### Step 3: Enable It
1. Click the big blue **"ENABLE"** button
2. Wait a few seconds for it to enable

### Step 4: Verify API Key Access
1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your **API Key** (the one starting with `AIzaSy...`)
3. Under "API restrictions":
   - Make sure it's either:
     - **Option A:** "Don't restrict key" (easier for testing)
     - **Option B:** "Restrict key" and includes:
       - ✅ Google Drive API
       - ✅ Google Picker API

### Step 5: Test Again
1. Refresh your browser
2. Click **"Select Folder & Import"**
3. The Google Picker popup should now appear!

## What is Google Picker API?

It's the API that creates the popup where you can browse and select folders from your Google Drive. Without it enabled, the app can't show the folder picker.

## Quick Checklist

Make sure you have enabled:
- ✅ Google Drive API (for reading files)
- ✅ Google Picker API (for folder selection popup)
- ✅ Both APIs are in your API Key's allowed list

---

After enabling, try the import again!
