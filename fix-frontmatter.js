#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix a single file
function fixFrontMatter(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check if first line starts with collapsed front matter
    if (lines[0] && lines[0].startsWith('--- ')) {
        const frontMatterLine = lines[0];

        // Extract everything between the opening --- and closing ---
        const frontMatterMatch = frontMatterLine.match(/^--- (.+) ---(.*)$/);

        if (frontMatterMatch) {
            const frontMatterContent = frontMatterMatch[1];
            const remainingContent = frontMatterMatch[2];

            // Split the front matter content into key-value pairs
            const pairs = [];
            let current = '';
            let inQuotes = false;
            let quoteChar = '';

            for (let i = 0; i < frontMatterContent.length; i++) {
                const char = frontMatterContent[i];

                if ((char === '"' || char === "'") && !inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                    current += char;
                } else if (char === quoteChar && inQuotes) {
                    inQuotes = false;
                    quoteChar = '';
                    current += char;
                } else if (char === ' ' && !inQuotes && current.includes(':')) {
                    pairs.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }

            // Add the last pair
            if (current.trim()) {
                pairs.push(current.trim());
            }

            // Format as proper YAML
            const yamlLines = ['---'];
            pairs.forEach(pair => {
                if (pair.includes(':')) {
                    yamlLines.push(pair);
                }
            });
            yamlLines.push('---');

            // Reconstruct the content
            const newContent = yamlLines.join('\n') + remainingContent + '\n' + lines.slice(1).join('\n');

            return {
                needsFix: true,
                newContent: newContent
            };
        }
    }

    return { needsFix: false };
}

// Main execution
function main() {
    const blogDir = path.join(__dirname, 'src', 'blog');
    const files = fs.readdirSync(blogDir)
        .filter(file => file.endsWith('.md'))
        .map(file => path.join(blogDir, file));

    let fixedCount = 0;
    let errorCount = 0;
    const fixedFiles = [];
    const errorFiles = [];

    console.log(`Found ${files.length} markdown files in src/blog/`);

    files.forEach(filePath => {
        try {
            const result = fixFrontMatter(filePath);

            if (result.needsFix) {
                fs.writeFileSync(filePath, result.newContent);
                fixedCount++;
                fixedFiles.push(path.basename(filePath));
                console.log(`✅ Fixed: ${path.basename(filePath)}`);
            }
        } catch (error) {
            errorCount++;
            errorFiles.push(path.basename(filePath));
            console.error(`❌ Error fixing ${path.basename(filePath)}:`, error.message);
        }
    });

    console.log('\n=== SUMMARY ===');
    console.log(`Total files processed: ${files.length}`);
    console.log(`Files fixed: ${fixedCount}`);
    console.log(`Errors: ${errorCount}`);

    if (fixedFiles.length > 0) {
        console.log('\nFixed files:');
        fixedFiles.forEach(file => console.log(`  - ${file}`));
    }

    if (errorFiles.length > 0) {
        console.log('\nFiles with errors:');
        errorFiles.forEach(file => console.log(`  - ${file}`));
    }
}

main();