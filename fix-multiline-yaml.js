#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixMultilineYaml(content) {
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

        // Handle keys that end with ':' (value on next line)
        if (line.endsWith(':') && line.length > 1) {
            const key = line.slice(0, -1); // Remove the colon

            if (i + 1 < frontMatterLines.length) {
                let nextLine = frontMatterLines[i + 1].trim();

                // Check if next line looks like a value (not another key)
                if (nextLine && !nextLine.endsWith(':')) {
                    // Clean up the value
                    let value = nextLine;

                    // Add quotes if needed
                    if (value && !value.startsWith('"') && !value.startsWith("'") && !value.startsWith('-')) {
                        if (value.includes(' ') || value.includes('&') || value.includes(':') || value.includes('#')) {
                            value = `"${value}"`;
                        }
                    }

                    fixedFrontMatter.push(`${key}: ${value}`);
                    i += 2; // Skip both the key and value lines
                    continue;
                }
            }

            // If we couldn't parse the value, just add the key
            fixedFrontMatter.push(`${key}:`);
            i++;
        }
        // Handle lines that look like categories
        else if (line.startsWith('- "') || line.startsWith('-"') || line.startsWith('- ')) {
            // This is a category item
            if (fixedFrontMatter.length > 0 && !fixedFrontMatter[fixedFrontMatter.length - 1].includes(':')) {
                // Previous line was probably "categories" without a colon
                fixedFrontMatter[fixedFrontMatter.length - 1] += ':';
            }
            fixedFrontMatter.push(`  ${line}`);
            i++;
        }
        // Handle regular key: value lines
        else if (line.includes(':') && !line.endsWith(':')) {
            fixedFrontMatter.push(line);
            i++;
        }
        // Handle single words that might be keys
        else if (line && !line.includes(':') && !line.startsWith('-')) {
            // This might be a key without a colon, like "categories"
            fixedFrontMatter.push(`${line}:`);
            i++;
        }
        // Skip empty lines
        else if (!line) {
            i++;
        }
        // Add anything else as-is
        else {
            fixedFrontMatter.push(line);
            i++;
        }
    }

    // Ensure we have a layout field
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

        // Check if file has multiline YAML front matter
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

                // Check if any line is just a key ending with colon
                const hasMultilineYaml = frontMatterLines.some(line => {
                    const trimmed = line.trim();
                    return trimmed.endsWith(':') && trimmed.length > 1 &&
                           !trimmed.includes(' ') && trimmed !== 'layout:' &&
                           trimmed !== 'categories:';
                });

                if (hasMultilineYaml) {
                    const fixedContent = fixMultilineYaml(content);
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