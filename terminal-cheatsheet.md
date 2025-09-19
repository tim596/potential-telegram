# Terminal Cheat Sheet - Bedder World Project

> macOS + iTerm2 focused commands for Eleventy static site development

## Project Commands

### Development & Build
```bash
# Start development server (runs on port 8081)
npm run dev

# Build production site
npm run build

# Production build with environment
npm run build:prod

# Clean build directory
npm run clean

# Start production server
npm start

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

### Location Generation
```bash
# Generate all location pages
npm run generate:locations

# Run location generator directly
node scripts/generate-locations.js
```

## File Navigation

### Basic Navigation
```bash
# List files with details
ls -la

# Navigate to project directories
cd src/mattress-removal/california/
cd dist/mattress-removal/
cd tasks/

# Show current directory
pwd

# Go back one directory
cd ..

# Go to project root
cd ~/Desktop/Working.../bedder-world-base/
```

### Quick Directory Access
```bash
# Source files
cd src/
cd src/_layouts/
cd src/_includes/css/
cd src/mattress-removal/

# Build output
cd dist/
cd dist/mattress-removal/california/

# Project management
cd tasks/
```

## File Operations

### Reading Files
```bash
# View file content
cat filename.md
cat src/mattress-removal/california/los-angeles.md

# View with line numbers
cat -n filename.md

# View first/last lines
head -20 filename.md
tail -20 filename.md

# Page through large files
less filename.html
```

### Searching Files
```bash
# Search for text in files
grep "phone number" src/mattress-removal/california/*.md
grep -r "720-263-6094" src/
grep -r "Same-day" src/mattress-removal/

# Search with line numbers
grep -n "Los Angeles" src/mattress-removal/california/los-angeles.md

# Case insensitive search
grep -i "mattress removal" src/mattress-removal/california/*.md

# Count occurrences
grep -c "Los Angeles" dist/mattress-removal/california/los-angeles/index.html
```

### File Management
```bash
# Copy files
cp src/mattress-removal/california/los-angeles.md backup/

# Move/rename files
mv old-file.md new-file.md

# Create directories
mkdir -p src/mattress-removal/new-state/

# Remove files (be careful!)
rm filename.md
rm -rf directory/  # Removes directory and contents
```

## Git Operations

### Status & Information
```bash
# Check repository status
git status

# View recent commits
git log --oneline -10

# View changes
git diff
git diff filename.md

# View staged changes
git diff --staged
```

### Staging & Committing
```bash
# Stage files
git add .
git add src/mattress-removal/california/los-angeles.md

# Commit changes
git commit -m "Fix Los Angeles phone numbers and service timing"

# Add and commit in one step
git commit -am "Quick fix for content"
```

### Branch Management
```bash
# Check current branch
git branch

# Create new branch
git checkout -b feature/new-city

# Switch branches
git checkout main
git checkout feature/new-city

# Push to remote
git push -u origin feature/new-city
```

## Content Verification

### Word Count & Analysis
```bash
# Count words in markdown file
wc -w src/mattress-removal/california/los-angeles.md

# Count lines
wc -l filename.md

# Count characters
wc -c filename.md

# Get all stats
wc src/mattress-removal/california/los-angeles.md
```

### Validation Commands
```bash
# Check for phone number consistency
grep -r "855.*555.*1234" src/mattress-removal/
grep -r "720-263-6094" src/mattress-removal/

# Check service timing consistency
grep -r "Same-day" src/mattress-removal/
grep -r "Next-day" src/mattress-removal/

# Verify city mentions
grep -c "Los Angeles" dist/mattress-removal/california/los-angeles/index.html

# Check for required content sections
grep -n "Environmental Impact" src/mattress-removal/california/los-angeles.md
grep -n "Service Areas" src/mattress-removal/california/los-angeles.md
```

## Project-Specific Patterns

### Finding City Files
```bash
# List all city files
find src/mattress-removal -name "*.md" -not -name "index.md"

# List cities by state
ls src/mattress-removal/california/
ls src/mattress-removal/texas/

# Check if city exists in dist
ls dist/mattress-removal/california/los-angeles/
```

### Bulk Operations
```bash
# Find all files with specific content
grep -l "855.*555.*1234" src/mattress-removal/*/*.md

# Replace text across multiple files (use with caution)
sed -i '' 's/855.*555.*1234/720-263-6094/g' src/mattress-removal/california/*.md

# Count total cities
find src/mattress-removal -name "*.md" -not -name "index.md" | wc -l
```

## iTerm2 Shortcuts

### Window Management
```bash
⌘T          # New tab
⌘W          # Close tab
⌘←/→        # Switch tabs
⌘D          # Split vertically
⌘⇧D         # Split horizontally
⌘[/]        # Switch panes
```

### Text Navigation
```bash
⌘A          # Go to beginning of line
⌘E          # Go to end of line
⌘K          # Clear from cursor to end
⌘R          # Search command history
⌘F          # Find in terminal
```

## Quick Project Workflow

### Daily Development
```bash
# 1. Check status
git status
npm run build

# 2. Start development
npm run dev  # (in one terminal)

# 3. Work on content
cd src/mattress-removal/california/
# Edit files...

# 4. Verify changes
npm run build
grep -c "target_content" dist/path/to/file.html
```

### City Review Process
```bash
# 1. Navigate to city file
cd src/mattress-removal/california/
cat los-angeles.md | head -50

# 2. Check requirements
grep -n "phone" los-angeles.md
grep -n "Next-day\|Same-day" los-angeles.md

# 3. Build and verify
npm run build
ls dist/mattress-removal/california/los-angeles/

# 4. Count content
wc -w los-angeles.md
grep -c "Los Angeles" dist/mattress-removal/california/los-angeles/index.html
```

### Emergency Fixes
```bash
# Find all instances of problem
grep -r "problem_text" src/

# Quick replace in single file
sed -i '' 's/old_text/new_text/g' filename.md

# Verify fix
grep "new_text" filename.md

# Build and check
npm run build
```

## Useful Aliases (add to ~/.zshrc)

```bash
# Project shortcuts
alias bedder="cd ~/Desktop/Working.../bedder-world-base/"
alias bdev="npm run dev"
alias bbuild="npm run build"
alias bclean="npm run clean"

# Git shortcuts
alias gs="git status"
alias ga="git add ."
alias gc="git commit -m"
alias gd="git diff"

# Common searches
alias phone-check="grep -r '855.*555.*1234' src/"
alias timing-check="grep -r 'Same-day' src/"
```

## Emergency Commands

### If Build Fails
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### If Git Issues
```bash
# See what changed
git status
git diff

# Discard local changes
git checkout -- filename.md
git reset --hard HEAD  # (careful - loses all changes)
```

### If Content Missing
```bash
# Check file exists
ls -la src/mattress-removal/california/los-angeles.md

# Check build output
ls -la dist/mattress-removal/california/los-angeles/

# Regenerate if needed
npm run generate:locations
npm run build
```