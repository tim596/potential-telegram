#!/usr/bin/env python3
"""
Fix malformed redirects file by separating merged redirect lines
"""

def fix_redirects_file(input_file, output_file):
    """Fix malformed redirect lines where multiple redirects are merged"""

    print(f"Fixing malformed redirects in {input_file}...")

    fixed_lines = []
    issues_found = 0

    with open(input_file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()

            # Skip empty lines and comments
            if not line or line.startswith('#'):
                fixed_lines.append(line)
                continue

            # Check for malformed lines with pattern "301/"
            if '301/' in line:
                # Split on '301/' and fix each part
                parts = line.split('301/')

                # First part should end with 301
                first_part = parts[0].strip()
                if first_part and not first_part.endswith(' 301'):
                    first_part += ' 301'
                if first_part:
                    fixed_lines.append(first_part)

                # Remaining parts need 301 added back
                for part in parts[1:]:
                    part = part.strip()
                    if part:
                        # This should be a new redirect line
                        if not part.endswith(' 301'):
                            part += ' 301'
                        fixed_lines.append(part)

                issues_found += 1
                print(f"Fixed line {line_num}: merged redirects separated")
            else:
                fixed_lines.append(line)

    # Write fixed file
    with open(output_file, 'w', encoding='utf-8') as f:
        for line in fixed_lines:
            f.write(line + '\n')

    print(f"✅ Fixed {issues_found} malformed lines")
    print(f"✅ Clean redirects file saved: {output_file}")

    return issues_found

def main():
    input_file = "src/_redirects"
    output_file = "src/_redirects_fixed"

    issues_found = fix_redirects_file(input_file, output_file)

    if issues_found > 0:
        print(f"\n🔧 Found and fixed {issues_found} malformed redirect lines")
        print(f"📝 Review the fixed file: {output_file}")
        print(f"📝 Then replace the original: mv {output_file} {input_file}")
    else:
        print("\n✅ No malformed lines found")

if __name__ == "__main__":
    main()