# Enhanced Redirect Generation Scripts

This directory contains tools to process CSV files for both redirects and 410 Gone responses.

## ✨ Features

- **Auto-detection** of CSV type (redirect vs delete)
- **301 Redirects** for pages that moved to new URLs
- **410 Gone** responses for permanently deleted pages (better than 404 for SEO)
- **Dual format** output (Netlify and Apache)
- **Batch processing** for thousands of URLs

## 🚀 Quick Start

### 1. Copy Your CSV Files
```bash
# Copy your CSV files here
cp /path/to/your/*.csv scripts/
```

### 2. Process Redirect CSV Files
```bash
# For redirect mappings (old_url -> new_url)
python3 scripts/generate-redirects.py scripts/redirect-mappings.csv
```

### 3. Process Delete CSV Files
```bash
# For URLs to mark as 410 Gone (15,000 deleted pages)
python3 scripts/generate-redirects.py scripts/delete-urls.csv --type delete
```

### 4. Review Generated Files
- `scripts/output/netlify_redirect.txt` - 301 redirects for Netlify
- `scripts/output/apache_redirect.txt` - 301 redirects for Apache
- `scripts/output/netlify_delete.txt` - 410 Gone for Netlify
- `scripts/output/apache_delete.txt` - 410 Gone for Apache

### 5. Add to Your Site
```bash
# Add all redirect rules to your site
cat scripts/output/netlify_redirect.txt >> src/_redirects
cat scripts/output/netlify_delete.txt >> src/_redirects
cat scripts/output/apache_redirect.txt >> src/.htaccess
cat scripts/output/apache_delete.txt >> src/.htaccess
```

## 📊 CSV File Formats

### Redirect CSV (Old → New URL mapping)
**Auto-detected columns:** `old_url`, `wordpress_url`, `source_url`, `from`, `old`
**Target columns:** `new_url`, `eleventy_url`, `target_url`, `to`, `new`

```csv
old_url,new_url
/gilbert-az/,/mattress-removal/arizona/phoenix/gilbert/
/boulder-co/,/mattress-removal/colorado/boulder/
/los-angeles-ca/,/mattress-removal/california/los-angeles/
```

### Delete CSV (URLs for 410 Gone)
**Auto-detected columns:** `url`, `delete_url`, `remove_url`, `old_url`, `path`

```csv
url
/old-page-1/
/old-page-2/
/old-page-3/
```

## 📤 Generated Output Examples

### 301 Redirects (Netlify)
```
/gilbert-az /mattress-removal/arizona/phoenix/gilbert/ 301
/gilbert-az/ /mattress-removal/arizona/phoenix/gilbert/ 301
```

### 410 Gone (Netlify)
```
/old-page-1 /410.html 410
/old-page-1/ /410.html 410
```

### 301 Redirects (Apache)
```
RewriteRule ^gilbert\-az/?$ /mattress-removal/arizona/phoenix/gilbert/ [R=301,L]
```

### 410 Gone (Apache)
```
RewriteRule ^old\-page\-1/?$ /410.html [R=410,L]
```

## 🔧 Advanced Usage

### Force CSV Type
```bash
# Explicitly specify type if auto-detection fails
python3 scripts/generate-redirects.py file.csv --type redirect
python3 scripts/generate-redirects.py file.csv --type delete
```

### Custom Output Directory
```bash
python3 scripts/generate-redirects.py file.csv --output-dir custom/path/
```

## ✅ Validation & Testing

### 1. Build Site First
```bash
npm run build:prod
```

### 2. Validate All Redirects
```bash
python3 scripts/validate-redirects.py
```

### 3. Test Specific URLs
After deployment, test redirects and 410 responses in browser or with curl:
```bash
curl -I https://yoursite.com/old-url  # Should return 301 or 410
```

## 🎯 SEO Benefits

- **301 Redirects**: Preserve SEO value, tell Google "content moved permanently"
- **410 Gone**: Tell Google "content deleted permanently, remove from index"
- **Faster removal**: 410 is processed faster than 404 for search engine removal