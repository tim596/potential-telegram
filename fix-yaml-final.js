#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixYamlFrontMatter(content) {
    const lines = content.split('\n');

    // Check if it starts with --- and has malformed YAML
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

    // Process front matter lines to separate keys that are on the same line
    const fixedFrontMatter = [];

    for (const line of frontMatterLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Look for pattern where multiple keys are on same line like "title: value date: value"
        if (trimmed.includes(':')) {
            // Split by key: pattern but preserve quoted values
            let remaining = trimmed;

            while (remaining) {
                // Match key: "quoted value" or key: unquoted_value
                const match = remaining.match(/^([^:]+):\s*("([^"]*)")\s*(.*)$/) ||
                             remaining.match(/^([^:]+):\s*([^\s]+)\s*(.*)$/);

                if (match) {
                    const key = match[1].trim();
                    const value = match[3] || match[2]; // Get the value (quoted or unquoted)

                    // For quoted values, keep quotes; for unquoted, add quotes if it contains spaces or special chars
                    let formattedValue = value;
                    if (match[3]) {
                        // Was quoted
                        formattedValue = `"${value}"`;
                    } else if (value && (value.includes(' ') || value.includes('&'))) {
                        // Needs quotes
                        formattedValue = `"${value}"`;
                    }

                    fixedFrontMatter.push(`${key}: ${formattedValue}`);
                    remaining = match[4] ? match[4].trim() : '';
                } else {
                    // Couldn't parse, just add as-is
                    if (remaining.trim()) {
                        fixedFrontMatter.push(remaining.trim());
                    }
                    break;
                }
            }
        } else {
            fixedFrontMatter.push(trimmed);
        }
    }

    // Reconstruct the file
    const newLines = ['---', ...fixedFrontMatter, '---', ...bodyLines];
    return newLines.join('\n');
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const originalLines = content.split('\n');

        // Check if file needs fixing (look for malformed front matter)
        if (originalLines[0] === '---' && originalLines.length > 5) {
            let endIndex = -1;
            for (let i = 1; i < originalLines.length; i++) {
                if (originalLines[i].trim() === '---') {
                    endIndex = i;
                    break;
                }
            }

            if (endIndex > 0) {
                const frontMatterLines = originalLines.slice(1, endIndex);

                // Check if any line has multiple key:value pairs (sign of malformed YAML)
                const needsFix = frontMatterLines.some(line => {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.includes(':')) return false;

                    // Count colons not inside quotes
                    let colonCount = 0;
                    let inQuotes = false;
                    for (let char of trimmed) {
                        if (char === '"') inQuotes = !inQuotes;
                        if (char === ':' && !inQuotes) colonCount++;
                    }

                    return colonCount > 1; // Multiple key:value pairs on one line
                });

                if (needsFix) {
                    const fixedContent = fixYamlFrontMatter(content);
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