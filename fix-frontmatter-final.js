#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixFrontMatter(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check for malformed YAML front matter that spans multiple lines
    if (lines[0] === '---' && lines.length > 5) {
        let frontMatterEndIndex = -1;
        let inFrontMatter = true;

        // Find where the front matter ends
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                frontMatterEndIndex = i;
                break;
            }
        }

        if (frontMatterEndIndex > 0) {
            // Extract front matter lines (excluding the opening/closing ---)
            const frontMatterLines = lines.slice(1, frontMatterEndIndex);

            // Check if the front matter is malformed (multiple keys on same line)
            let needsFix = false;
            let fixedFrontMatter = [];

            for (let line of frontMatterLines) {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                    // Check if line has multiple key-value pairs
                    if (trimmedLine.includes(':') && trimmedLine.split(':').length > 2) {
                        needsFix = true;
                        // Try to parse multiple key-value pairs from one line
                        let remaining = trimmedLine;

                        while (remaining) {
                            // Look for pattern: key: "value" key: value
                            let match = remaining.match(/^([^:]+):\s*("([^"]+)"|([^\s]+))\s*(.*)$/);

                            if (match) {
                                const key = match[1].trim();
                                const value = match[3] || match[4]; // quoted or unquoted value
                                const quotedValue = match[3] ? `"${match[3]}"` : value;

                                fixedFrontMatter.push(`${key}: ${quotedValue}`);
                                remaining = match[5].trim();
                            } else {
                                // Fallback: just add the remaining as-is
                                if (remaining.trim()) {
                                    fixedFrontMatter.push(remaining.trim());
                                }
                                break;
                            }
                        }
                    } else {
                        // Regular line, keep as-is
                        fixedFrontMatter.push(trimmedLine);
                    }
                }
            }

            if (needsFix) {
                // Reconstruct the file
                const newLines = ['---', ...fixedFrontMatter, '---', ...lines.slice(frontMatterEndIndex + 1)];
                return {
                    needsFix: true,
                    newContent: newLines.join('\n')
                };
            }
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
            } else {
                console.log(`⏭️  Skipped: ${path.basename(filePath)} (already correct or different format)`);
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