#!/usr/bin/env python3
import os
import re

def fix_yaml_file(filepath):
    """Fix malformed YAML front matter in a markdown file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if already properly formatted
        if content.startswith('---\nlayout: location.njk\ntitle:'):
            return False

        # Check if this is a malformed YAML file we need to fix
        if not content.startswith('---\nlayout: location.njk\ntitle: "'):
            return False

        lines = content.split('\n')
        if len(lines) < 3:
            return False

        # The third line should be the malformed YAML (all on one line)
        yaml_line = lines[2]

        # Split into key-value pairs and fix formatting
        # Pattern: key: "value" or key: value
        yaml_parts = []

        # Use regex to find key: value patterns
        pattern = r'(\w+):\s*'
        parts = re.split(pattern, yaml_line)

        # Remove empty first element if exists
        if parts and not parts[0].strip():
            parts = parts[1:]

        # Group into key-value pairs
        i = 0
        while i < len(parts) - 1:
            key = parts[i]
            value_part = parts[i + 1]

            # Find where the next key starts or end of string
            if i + 2 < len(parts):
                # There's another key, so value ends before next key
                next_key = parts[i + 2]
                # The value is everything before the next key
                value = value_part
                # Remove the next key from value if it got included
                if next_key in value:
                    value = value.split(next_key)[0].strip()
            else:
                # This is the last key-value pair
                value = value_part.strip()

            yaml_parts.append(f"{key}: {value}")
            i += 2

        # Rebuild the file with proper YAML formatting
        new_content = "---\n"
        new_content += "layout: location.njk\n"

        # Add the other YAML keys with proper formatting
        for part in yaml_parts:
            new_content += part + "\n"

        new_content += "---\n"

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"Fixed {filepath}")
        return True

    except Exception as e:
        print(f"Error fixing {filepath}: {e}")
        return False

# Find all problematic files and fix them
def main():
    count = 0
    for root, dirs, files in os.walk('src/mattress-removal'):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                if fix_yaml_file(filepath):
                    count += 1

    print(f"Fixed {count} files")

if __name__ == "__main__":
    main()