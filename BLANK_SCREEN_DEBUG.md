# 🔍 Blank Screen Debugging

## Step 1: Check Browser Console (MOST IMPORTANT)

1. Visit: https://danielc8.github.io/scibowl-trials/
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look for **RED error messages**

**Common errors you might see:**

### Error A: "Failed to load resource: /assets/index-xxx.js (404)"
This means the base path is wrong. The files exist but at a different location.

### Error B: "Uncaught SyntaxError: Unexpected token '<'"
This also means 404 - it's loading an HTML error page instead of JavaScript.

### Error C: Environment variable errors
"Cannot read property 'env' of undefined" - build configuration issue.

---

## Step 2: Try Different URLs

Sometimes the path needs adjustment. Try these:

1. https://danielc8.github.io/scibowl-trials/
2. https://danielc8.github.io/scibowl-trials/index.html

---

## Step 3: Check the Network Tab

1. Press F12
2. Click **"Network"** tab
3. Refresh the page (F5)
4. Look for RED items (failed requests)
5. Click on any red item to see what path it tried to load

**Screenshot the Console and Network tabs and show me!**

---

## Quick Fix: Try This First

The base path might need to be `/scibowl-trials/` with a trailing slash.

Let me know what you see in the browser console!
