#!/usr/bin/env python3
"""
Test script to verify KV upload works with correct syntax
"""

import subprocess
import json
import sys
from pathlib import Path

def test_small_upload():
    """Test upload with small batch to verify syntax"""

    # Create small test batch
    test_redirects = [
        {"key": "/test-redirect-1", "value": "/test-target-1"},
        {"key": "/test-redirect-2", "value": "/test-target-2"},
        {"key": "/test-redirect-3", "value": "/test-target-3"}
    ]

    # Write test file
    test_filename = "test_batch.json"
    with open(test_filename, 'w', encoding='utf-8') as f:
        json.dump(test_redirects, f, separators=(',', ':'))

    print(f"🧪 Testing KV upload with {len(test_redirects)} test redirects...")

    try:
        # Upload using corrected wrangler syntax
        result = subprocess.run([
            'wrangler', 'kv', 'bulk', 'put', test_filename,
            '--binding', 'REDIRECTS'
        ], capture_output=True, text=True, timeout=30)

        # Clean up test file
        Path(test_filename).unlink(missing_ok=True)

        if result.returncode == 0:
            print("✅ Test upload successful!")
            print(f"Output: {result.stdout}")
            return True
        else:
            print(f"❌ Test upload failed: {result.stderr}")
            return False

    except subprocess.TimeoutExpired:
        print("⏰ Test upload timed out")
        return False
    except Exception as e:
        print(f"💥 Test upload error: {e}")
        return False

if __name__ == "__main__":
    success = test_small_upload()
    if success:
        print("\n🎯 Syntax verified! Ready for full upload.")
    else:
        print("\n⚠️  Need to fix syntax before proceeding.")
        sys.exit(1)