#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    if (lines[0] !== '---') {
        return { changed: false, reason: 'No front matter' };
    }

    let endIndex = -1;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
            endIndex = i;
            break;
        }
    }

    if (endIndex === -1) {
        return { changed: false, reason: 'No end marker' };
    }

    const frontMatterLines = lines.slice(1, endIndex);
    const bodyLines = lines.slice(endIndex + 1);

    // Fix the front matter
    const fixedFrontMatter = [];
    let i = 0;

    while (i < frontMatterLines.length) {
        let line = frontMatterLines[i].trim();

        if (!line) {
            i++;
            continue;
        }

        // Handle lines ending with just ':'
        if (line.endsWith(':') && line.length > 1) {
            const key = line.slice(0, -1);
            let value = '';

            // Look for value on next line
            if (i + 1 < frontMatterLines.length) {
                const nextLine = frontMatterLines[i + 1].trim();

                // Check if next line is a value (not another key or category)
                if (nextLine && !nextLine.endsWith(':') && !nextLine.startsWith('-')) {
                    value = nextLine;

                    // Add quotes if needed
                    if (value && !value.startsWith('"') && !value.startsWith("'")) {
                        if (value.includes(' ') || value.includes('&') || value.includes(':') || value.includes('#')) {
                            value = `"${value}"`;
                        }
                    }

                    fixedFrontMatter.push(`${key}: ${value}`);
                    i += 2; // Skip both lines
                    continue;
                }
            }

            // Special handling for categories
            if (key === 'categories') {
                fixedFrontMatter.push(`${key}:`);
                i++;
                // Look for category items
                while (i < frontMatterLines.length) {
                    const catLine = frontMatterLines[i].trim();
                    if (catLine.startsWith('-') || catLine.startsWith('"')) {
                        fixedFrontMatter.push(`  - ${catLine.replace(/^-\s*/, '')}`);
                        i++;
                    } else {
                        break;
                    }
                }
                continue;
            }

            // If no value found, just add the key
            fixedFrontMatter.push(`${key}:`);
            i++;
        }
        // Handle category items
        else if (line.startsWith('-') || line.startsWith('"')) {
            fixedFrontMatter.push(`  - ${line.replace(/^-\s*/, '')}`);
            i++;
        }
        // Handle key: value pairs that are already correct
        else if (line.includes(':')) {
            fixedFrontMatter.push(line);
            i++;
        }
        // Handle standalone words that might be keys
        else {
            // If it looks like a key without a colon
            if (line && !line.includes(' ') && line !== 'layout' && line !== 'blog-post.njk') {
                if (line === 'categories') {
                    fixedFrontMatter.push(`${line}:`);
                } else {
                    fixedFrontMatter.push(`${line}:`);
                }
            } else {
                // It's some other content, add as-is
                fixedFrontMatter.push(line);
            }
            i++;
        }
    }

    // Ensure we have a layout field
    const hasLayout = fixedFrontMatter.some(line => line.startsWith('layout:'));
    if (!hasLayout) {
        fixedFrontMatter.push('layout: blog-post.njk');
    }

    // Rebuild the file
    const newContent = ['---', ...fixedFrontMatter, '---', ...bodyLines].join('\n');

    // Check if anything changed
    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        return { changed: true, reason: 'Fixed YAML front matter' };
    }

    return { changed: false, reason: 'Already correct' };
}

// Get all the problematic files
const problematicFiles = [
    'the-12-best-bed-frames-for-a-heavy-person-2023-we-tested-dozens.md',
    'alternatives-for-thuma-beds.md',
    'top-4-sofa-bed-mattress-replacement-options.md',
    'how-to-keep-a-mattress-topper-from-sliding.md',
    'tips-to-fix-an-air-bed-that-keeps-losing-air-or-deflates.md',
    'how-to-tie-a-mattress-to-your-car.md',
    'how-to-clean-a-futon-mattress.md',
    'how-long-does-it-take-a-memory-foam-mattress-to-expand.md',
    'how-to-fix-a-squeaky-bed-frame.md',
    'how-to-move-a-mattress-alone.md',
    'can-you-place-mattresses-on-top-of-another-mattress.md',
    'mattresses-made-in-the-usa.md',
    'mattress-extender.md',
    'mold-on-a-mattress.md',
    'european-mattress-sizes.md',
    'make-your-mattress-softer.md',
    'is-there-fiberglass-in-zinus-mattresses.md',
    'memory-foam-mattress-cause-back-pain.md',
    'mattress-tags.md',
    'how-to-raise-bed-higher-bed-risers-and-alternatives.md',
    'is-it-illegal-to-sell-a-used-mattress-state-by-state-guide.md',
    'brands-that-have-fiberglass-mattresses.md',
    'non-squeak-quiet-bed-frames.md',
    'airstream-replacement-mattress.md',
    'what-mattress-does-holiday-inn-use.md',
    'how-to-put-together-a-bed-frame.md',
    'what-happens-when-you-spray-rubbing-alcohol-on-your-mattress.md',
    '5-sturdy-bed-frames-for-active-couples-2020.md',
    'make-your-mattress-last-longer.md',
    'mattress-without-box-spring.md',
    'a-sagging-mattresses-vs-mattress-body-impressions.md',
    'mattress-alternatives.md',
    'how-to-find-hole-in-air-mattress-2-methods.md',
    'standard-height-of-a-bed-frame-and-mattress.md',
    'mattress-vacuums.md',
    'get-rid-of-a-mattress-by-throwing-it-in-the-dumpster.md',
    'how-to-return-a-mattress-to-amazon.md',
    'japanese-bed-frame.md',
    'how-to-cut-a-memory-foam-mattress.md',
    'how-much-does-it-cost-to-ship-a-mattress.md',
    'how-to-dry-a-mattress.md',
    'most-durable-mattress.md',
    'how-to-make-a-couch-from-a-twin-mattress.md',
    'how-long-can-you-leave-a-memory-foam-mattress-in-the-box.md',
    'what-mattress-does-marriott-use-where-to-buy-it.md',
    'how-to-reinforce-a-bed-frame.md',
    'how-much-does-mattress-removal-cost-price-of-5-popular-services.md',
    'rv-replacement-mattress.md',
    'dryer-sheets-for-bed-bugs.md',
    'how-much-does-a-mattress-weigh.md',
    'how-to-get-a-mattress-back-in-its-box.md',
    'worn-out-box-springs.md',
    'what-happens-if-you-sleep-on-memory-foam-mattress-before-24-hours.md',
    'how-to-fix-a-sagging-mattress.md',
    'latex-free-mattress.md',
    'is-a-bed-in-a-box-worth-it.md',
    'bed-bugs-in-pillow.md',
    'can-you-flip-a-pillow-top-mattress.md'
];

const blogDir = path.join(__dirname, 'src', 'blog');
let fixedCount = 0;
let errorCount = 0;

console.log(`Processing ${problematicFiles.length} problematic files...`);

for (const filename of problematicFiles) {
    const filePath = path.join(blogDir, filename);

    if (fs.existsSync(filePath)) {
        try {
            const result = fixFile(filePath);

            if (result.changed) {
                fixedCount++;
                console.log(`✅ Fixed: ${filename}`);
            } else {
                console.log(`⏭️  Skipped: ${filename} (${result.reason})`);
            }
        } catch (error) {
            errorCount++;
            console.log(`❌ Error: ${filename} - ${error.message}`);
        }
    } else {
        console.log(`⚠️  Missing: ${filename}`);
    }
}

console.log('\n=== SUMMARY ===');
console.log(`Files processed: ${problematicFiles.length}`);
console.log(`Files fixed: ${fixedCount}`);
console.log(`Errors: ${errorCount}`);