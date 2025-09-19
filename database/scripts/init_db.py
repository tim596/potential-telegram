#!/usr/bin/env python3
"""
Database initialization script for Bedder World cities tracking system.
Creates the SQLite database with proper schema.
"""

import sqlite3
import os
import sys
from pathlib import Path

def init_database(db_path=None):
    """Initialize the database with schema."""
    if db_path is None:
        db_path = Path(__file__).parent.parent / "bedder-cities.db"
    
    schema_path = Path(__file__).parent.parent / "schema.sql"
    
    if not schema_path.exists():
        print(f"ERROR: Schema file not found: {schema_path}")
        return False
    
    try:
        # Remove existing database if it exists
        if os.path.exists(db_path):
            print(f"Removing existing database: {db_path}")
            os.remove(db_path)
        
        # Create new database
        print(f"Creating database: {db_path}")
        conn = sqlite3.connect(db_path)
        
        # Read and execute schema
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Execute the entire schema at once
        conn.executescript(schema_sql)
        
        conn.commit()
        
        # Verify tables were created
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        expected_tables = ['city_types', 'states', 'metro_areas', 'cities']
        for table in expected_tables:
            if table not in tables:
                raise Exception(f"Table {table} was not created")
        
        print("✓ Database initialized successfully")
        print(f"✓ Created tables: {', '.join(tables)}")
        
        # Show city types that were inserted
        cursor = conn.execute("SELECT type_name, priority_score FROM city_types ORDER BY priority_score;")
        city_types = cursor.fetchall()
        print(f"✓ City types configured: {len(city_types)}")
        for type_name, priority in city_types:
            print(f"  - {type_name} (priority: {priority})")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to initialize database: {e}")
        return False

def main():
    """Main function."""
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    else:
        db_path = None
    
    success = init_database(db_path)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()