#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixSplitYamlLines(content) {
    const lines = content.split('\n');

    if (lines[0] !== '---') return content;

    let endIndex = -1;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
            endIndex = i;
            break;
        }
    }

    if (endIndex === -1) return content;

    const frontMatterLines = lines.slice(1, endIndex);
    const bodyLines = lines.slice(endIndex + 1);

    const fixedFrontMatter = [];
    let i = 0;

    while (i < frontMatterLines.length) {
        const line = frontMatterLines[i].trim();

        if (line.endsWith(':')) {
            // This is a key without a value, value is on next line
            const key = line.slice(0, -1); // Remove the colon
            if (i + 1 < frontMatterLines.length) {
                const value = frontMatterLines[i + 1].trim();

                // Clean up the value - remove quotes if they're the only thing on the line
                let cleanValue = value;
                if (value.startsWith('"') && value.endsWith('"')) {
                    cleanValue = value;
                } else if (value && !value.startsWith('"')) {
                    // Add quotes if the value has special characters or spaces
                    if (value.includes(' ') || value.includes('&') || value.includes(':')) {
                        cleanValue = `"${value}"`;
                    }
                }

                fixedFrontMatter.push(`${key}: ${cleanValue}`);
                i += 2; // Skip the value line
            } else {
                fixedFrontMatter.push(line);
                i++;
            }
        } else if (line.includes(':')) {
            // Regular key: value line
            fixedFrontMatter.push(line);
            i++;
        } else if (line) {
            // Non-empty line that doesn't fit pattern
            fixedFrontMatter.push(line);
            i++;
        } else {
            // Empty line, skip
            i++;
        }
    }

    // Make sure we have the layout field
    const hasLayout = fixedFrontMatter.some(line => line.startsWith('layout:'));
    if (!hasLayout) {
        fixedFrontMatter.push('layout: blog-post.njk');
    }

    const newLines = ['---', ...fixedFrontMatter, '---', ...bodyLines];
    return newLines.join('\n');
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        // Check if file has split YAML front matter
        if (lines[0] === '---' && lines.length > 5) {
            let endIndex = -1;
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '---') {
                    endIndex = i;
                    break;
                }
            }

            if (endIndex > 0) {
                const frontMatterLines = lines.slice(1, endIndex);

                // Check if any line ends with just a colon (split YAML)
                const hasSplitYaml = frontMatterLines.some(line =>
                    line.trim().endsWith(':') && line.trim().length > 1
                );

                if (hasSplitYaml) {
                    const fixedContent = fixSplitYamlLines(content);
                    fs.writeFileSync(filePath, fixedContent);
                    return { fixed: true, filename: path.basename(filePath) };
                }
            }
        }

        return { fixed: false, filename: path.basename(filePath) };
    } catch (error) {
        return { error: true, filename: path.basename(filePath), message: error.message };
    }
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

    console.log(`Processing ${files.length} markdown files...`);

    for (const file of files) {
        const result = processFile(file);

        if (result.error) {
            errorCount++;
            errorFiles.push(result.filename);
            console.log(`❌ Error: ${result.filename} - ${result.message}`);
        } else if (result.fixed) {
            fixedCount++;
            fixedFiles.push(result.filename);
            console.log(`✅ Fixed: ${result.filename}`);
        } else {
            console.log(`⏭️  Skipped: ${result.filename} (already correct)`);
        }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total files processed: ${files.length}`);
    console.log(`Files fixed: ${fixedCount}`);
    console.log(`Files skipped: ${files.length - fixedCount - errorCount}`);
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