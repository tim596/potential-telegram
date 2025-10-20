# Cloudflare Worker Deployment Guide
## Move 45,459 redirects from Netlify to Cloudflare Edge

### 🎯 Goal
Move your 6.2MB Netlify _redirects file to Cloudflare for massive performance improvement while maintaining exact hierarchical routing.

### 📋 Prerequisites
- Cloudflare Pro plan ($20/month) - needed for Workers
- Domain already on Cloudflare
- Command line access

---

## 🚀 Deployment Steps

### Step 1: Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### Step 2: Create KV Namespace
```bash
wrangler kv:namespace create "REDIRECTS"
```
*Save the namespace ID that's returned*

### Step 3: Create wrangler.toml
Create this file in your project root:
```toml
name = "abedderworld-redirects"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "REDIRECTS"
id = "YOUR_NAMESPACE_ID_HERE"  # Replace with ID from Step 2
```

### Step 4: Upload Redirect Data
```bash
./upload-to-kv.sh
```
*This uploads all 45,459 redirects to Cloudflare KV storage*

### Step 5: Deploy Worker
```bash
wrangler deploy cloudflare-worker-kv.js
```

### Step 6: Configure Route
In Cloudflare Dashboard:
1. Go to **Workers & Pages** → **Your Worker**
2. Click **Triggers** → **Add Route**
3. Add route: `abedderworld.com/*`
4. Save

---

## ✅ Verification

Test a few redirects:
- `https://abedderworld.com/dallas-tx/` should redirect to `/mattress-removal/texas/dallas/`
- `https://abedderworld.com/gilbert-az/` should redirect to `/mattress-removal/arizona/phoenix/gilbert/`

## 🔧 Files Created

- **`cloudflare-worker-kv.js`** - Worker code (small, under 1KB)
- **`upload-to-kv.sh`** - Script to upload redirects to KV
- **`redirects.json`** - Backup JSON of all redirects

## 📈 Performance Impact

**Before**: 6.2MB file processed at Netlify origin
**After**: Lightweight lookups at 200+ Cloudflare edge locations

**Expected improvement**: 50-90% faster redirect processing

## 🔄 Rollback Plan

If issues occur:
1. Delete the Worker route in Cloudflare Dashboard
2. Your original Netlify _redirects file remains unchanged
3. Redirects fall back to Netlify processing

## 🎯 Benefits

✅ **45,459 redirects** moved to edge
✅ **Lightning fast** redirect processing
✅ **Preserves exact** state/metro/suburb hierarchy
✅ **Zero risk** rollback available
✅ **Massive performance** improvement