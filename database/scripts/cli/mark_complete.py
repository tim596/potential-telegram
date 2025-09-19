#!/usr/bin/env python3
"""
CLI tool to mark cities as completed.
"""

import sqlite3
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Optional

class CityCompleter:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        
    def mark_city_complete(self, city_name: str, state: Optional[str] = None) -> bool:
        """
        Mark a city as completed.
        
        Args:
            city_name: Name of the city to mark as complete
            state: Optional state filter for disambiguation
            
        Returns:
            True if successful, False if city not found
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            # Find the city
            if state:
                query = """
                SELECT c.city_id, c.city_name, s.state_name, s.state_code, c.is_completed
                FROM cities c
                JOIN states s ON c.state_id = s.state_id
                WHERE c.city_name LIKE ? AND (s.state_name LIKE ? OR s.state_code LIKE ?)
                """
                params = (f"%{city_name}%", f"%{state}%", f"%{state}%")
            else:
                query = """
                SELECT c.city_id, c.city_name, s.state_name, s.state_code, c.is_completed
                FROM cities c
                JOIN states s ON c.state_id = s.state_id
                WHERE c.city_name LIKE ?
                """
                params = (f"%{city_name}%",)
            
            cursor = conn.execute(query, params)
            cities = cursor.fetchall()
            
            if not cities:
                print(f"❌ No city found matching '{city_name}'")
                if state:
                    print(f"   in state '{state}'")
                return False
            
            if len(cities) > 1:
                print(f"❌ Multiple cities found matching '{city_name}':")
                for city in cities:
                    status = "✅ Complete" if city['is_completed'] else "❌ Incomplete"
                    print(f"   - {city['city_name']}, {city['state_code']} ({status})")
                print("\n💡 Please specify the state to disambiguate:")
                print(f"   python3 mark_complete.py '{city_name}' --state [STATE]")
                return False
            
            city = cities[0]
            
            if city['is_completed']:
                print(f"ℹ️  {city['city_name']}, {city['state_code']} is already marked as complete")
                return True
            
            # Update the city
            update_query = "UPDATE cities SET is_completed = TRUE WHERE city_id = ?"
            conn.execute(update_query, (city['city_id'],))
            conn.commit()
            
            print(f"✅ {city['city_name']}, {city['state_code']} marked as complete!")
            return True
            
        except Exception as e:
            print(f"❌ Error marking city complete: {e}")
            return False
        finally:
            conn.close()
    
    def search_cities(self, search_term: str, limit: int = 10) -> List[Dict]:
        """Search for cities by name."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            query = """
            SELECT c.city_name, s.state_name, s.state_code, c.is_completed,
                   m.metro_name, ct.type_name
            FROM cities c
            JOIN states s ON c.state_id = s.state_id
            JOIN metro_areas m ON c.metro_id = m.metro_id
            JOIN city_types ct ON c.type_id = ct.type_id
            WHERE c.city_name LIKE ?
            ORDER BY c.city_name
            LIMIT ?
            """
            cursor = conn.execute(query, (f"%{search_term}%", limit))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()
    
    def list_incomplete_cities(self, state: Optional[str] = None, limit: int = 20) -> List[Dict]:
        """List incomplete cities."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            if state:
                query = """
                SELECT c.city_name, s.state_name, s.state_code,
                       m.metro_name, ct.type_name, ct.priority_order
                FROM cities c
                JOIN states s ON c.state_id = s.state_id
                JOIN metro_areas m ON c.metro_id = m.metro_id
                JOIN city_types ct ON c.type_id = ct.type_id
                WHERE c.is_completed = FALSE AND (s.state_name LIKE ? OR s.state_code LIKE ?)
                ORDER BY ct.priority_order, c.city_name
                LIMIT ?
                """
                params = (f"%{state}%", f"%{state}%", limit)
            else:
                query = """
                SELECT c.city_name, s.state_name, s.state_code,
                       m.metro_name, ct.type_name, ct.priority_order
                FROM cities c
                JOIN states s ON c.state_id = s.state_id
                JOIN metro_areas m ON c.metro_id = m.metro_id
                JOIN city_types ct ON c.type_id = ct.type_id
                WHERE c.is_completed = FALSE
                ORDER BY ct.priority_order, c.city_name
                LIMIT ?
                """
                params = (limit,)
            
            cursor = conn.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()

def main():
    parser = argparse.ArgumentParser(description='Mark cities as completed')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Mark complete command
    complete_parser = subparsers.add_parser('complete', help='Mark a city as complete')
    complete_parser.add_argument('city', help='City name to mark as complete')
    complete_parser.add_argument('--state', '-s', help='State name or code (for disambiguation)')
    
    # Search command
    search_parser = subparsers.add_parser('search', help='Search for cities')
    search_parser.add_argument('term', help='Search term')
    search_parser.add_argument('--limit', '-l', type=int, default=10, help='Limit results (default: 10)')
    
    # List incomplete command
    list_parser = subparsers.add_parser('list', help='List incomplete cities')
    list_parser.add_argument('--state', '-s', help='Filter by state')
    list_parser.add_argument('--limit', '-l', type=int, default=20, help='Limit results (default: 20)')
    
    # If no command provided, default to complete
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(1)
    
    # Handle direct city name (backwards compatibility)
    if len(sys.argv) >= 2 and sys.argv[1] not in ['complete', 'search', 'list']:
        # Shift arguments to treat first arg as city name
        sys.argv.insert(1, 'complete')
    
    args = parser.parse_args()
    
    # Get database path
    script_dir = Path(__file__).parent.parent
    db_path = script_dir / "cities.db"
    
    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        print("💡 Run init_db.py and ingest_data.py first")
        sys.exit(1)
    
    completer = CityCompleter(db_path)
    
    if args.command == 'complete':
        success = completer.mark_city_complete(args.city, args.state)
        sys.exit(0 if success else 1)
        
    elif args.command == 'search':
        cities = completer.search_cities(args.term, args.limit)
        if not cities:
            print(f"❌ No cities found matching '{args.term}'")
            sys.exit(1)
        
        print(f"🔍 CITIES MATCHING '{args.term.upper()}'")
        print("=" * 50)
        for city in cities:
            status = "✅" if city['is_completed'] else "❌"
            print(f"{status} {city['city_name']}, {city['state_code']} ({city['type_name']})")
            print(f"   Metro: {city['metro_name']}")
        
    elif args.command == 'list':
        cities = completer.list_incomplete_cities(args.state, args.limit)
        if not cities:
            filter_text = f" in {args.state}" if args.state else ""
            print(f"✅ No incomplete cities found{filter_text}")
            sys.exit(0)
        
        filter_text = f" in {args.state.upper()}" if args.state else ""
        print(f"❌ INCOMPLETE CITIES{filter_text}")
        print("=" * 50)
        
        for i, city in enumerate(cities, 1):
            print(f"{i:2}. {city['city_name']}, {city['state_code']} ({city['type_name']})")
            print(f"    Metro: {city['metro_name']}")
        
        if len(cities) == args.limit:
            print(f"\n💡 Showing first {args.limit} results. Use --limit to see more.")

if __name__ == "__main__":
    main()