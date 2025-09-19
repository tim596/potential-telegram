#!/usr/bin/env python3
"""
CLI tool for common database queries.
"""

import sqlite3
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Optional

class DatabaseQuery:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict]:
        """Execute a query and return results as list of dicts."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            cursor = conn.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()
    
    def get_state_progress(self, state_filter: Optional[str] = None) -> List[Dict]:
        """Get progress summary by state."""
        query = """
        SELECT 
            state_name,
            state_code,
            total_cities,
            completed_cities,
            (total_cities - completed_cities) as remaining_cities,
            ROUND(CAST(completed_cities AS REAL) / CAST(total_cities AS REAL) * 100, 1) as completion_percentage
        FROM states
        WHERE total_cities > 0
        """
        
        params = ()
        if state_filter:
            query += " AND (state_name LIKE ? OR state_code LIKE ?)"
            params = (f"%{state_filter}%", f"%{state_filter}%")
        
        query += " ORDER BY completion_percentage DESC, state_name ASC"
        
        return self.execute_query(query, params)
    
    def get_metro_progress(self, state_filter: Optional[str] = None, metro_filter: Optional[str] = None) -> List[Dict]:
        """Get progress summary by metro area."""
        query = """
        SELECT 
            m.metro_name,
            s.state_name,
            s.state_code,
            m.metro_type,
            m.total_cities,
            m.completed_cities,
            (m.total_cities - m.completed_cities) as remaining_cities,
            ROUND(CAST(m.completed_cities AS REAL) / CAST(m.total_cities AS REAL) * 100, 1) as completion_percentage
        FROM metro_areas m
        JOIN states s ON m.state_id = s.id
        WHERE m.total_cities > 0
        """
        
        params = []
        if state_filter:
            query += " AND (s.state_name LIKE ? OR s.state_code LIKE ?)"
            params.extend([f"%{state_filter}%", f"%{state_filter}%"])
        
        if metro_filter:
            query += " AND m.metro_name LIKE ?"
            params.append(f"%{metro_filter}%")
        
        query += " ORDER BY completion_percentage DESC, m.metro_name ASC"
        
        return self.execute_query(query, tuple(params))
    
    def get_city_type_stats(self) -> List[Dict]:
        """Get statistics by city type."""
        query = """
        SELECT 
            ct.type_name,
            ct.priority_score,
            COUNT(*) as total_cities,
            SUM(CASE WHEN c.is_completed THEN 1 ELSE 0 END) as completed_cities,
            COUNT(*) - SUM(CASE WHEN c.is_completed THEN 1 ELSE 0 END) as remaining_cities,
            ROUND(CAST(SUM(CASE WHEN c.is_completed THEN 1 ELSE 0 END) AS REAL) / CAST(COUNT(*) AS REAL) * 100, 1) as completion_percentage
        FROM city_types ct
        JOIN cities c ON ct.id = c.city_type_id
        GROUP BY ct.id, ct.type_name, ct.priority_score
        ORDER BY ct.priority_score ASC
        """
        
        return self.execute_query(query)
    
    def search_cities(self, search_term: str, limit: int = 20) -> List[Dict]:
        """Search cities by name."""
        query = """
        SELECT 
            c.city_name,
            s.state_name,
            s.state_code,
            m.metro_name,
            ct.type_name as city_type,
            c.is_completed,
            c.priority_score
        FROM cities c
        JOIN states s ON c.state_id = s.id
        LEFT JOIN metro_areas m ON c.metro_area_id = m.id
        JOIN city_types ct ON c.city_type_id = ct.id
        WHERE c.city_name LIKE ?
        ORDER BY c.is_completed ASC, c.priority_score ASC, c.city_name ASC
        LIMIT ?
        """
        
        return self.execute_query(query, (f"%{search_term}%", limit))
    
    def get_completion_leaders(self, limit: int = 10) -> List[Dict]:
        """Get states/metros with highest completion rates."""
        query = """
        SELECT 
            'State' as type,
            state_name as name,
            state_code as code,
            total_cities,
            completed_cities,
            ROUND(CAST(completed_cities AS REAL) / CAST(total_cities AS REAL) * 100, 1) as completion_percentage
        FROM states
        WHERE total_cities > 0
        UNION ALL
        SELECT 
            'Metro' as type,
            m.metro_name || ', ' || s.state_code as name,
            m.metro_type as code,
            m.total_cities,
            m.completed_cities,
            ROUND(CAST(m.completed_cities AS REAL) / CAST(m.total_cities AS REAL) * 100, 1) as completion_percentage
        FROM metro_areas m
        JOIN states s ON m.state_id = s.id
        WHERE m.total_cities > 0
        ORDER BY completion_percentage DESC, completed_cities DESC
        LIMIT ?
        """
        
        return self.execute_query(query, (limit,))
    
    def get_priority_queue(self, limit: int = 20) -> List[Dict]:
        """Get priority queue of next cities to launch."""
        query = """
        SELECT 
            c.city_name,
            s.state_name,
            s.state_code,
            m.metro_name,
            ct.type_name as city_type,
            c.priority_score
        FROM cities c
        JOIN states s ON c.state_id = s.id
        LEFT JOIN metro_areas m ON c.metro_area_id = m.id
        JOIN city_types ct ON c.city_type_id = ct.id
        WHERE c.is_completed = FALSE
        ORDER BY c.priority_score ASC, c.city_name ASC
        LIMIT ?
        """
        
        return self.execute_query(query, (limit,))

def print_table(data: List[Dict], title: str):
    """Print data as a formatted table."""
    if not data:
        print(f"No results found for {title}")
        return
    
    print(f"\n{title}")
    print("=" * len(title))
    
    # Get column widths
    headers = list(data[0].keys())
    col_widths = {h: len(h) for h in headers}
    
    for row in data:
        for header in headers:
            value_len = len(str(row[header]))
            if value_len > col_widths[header]:
                col_widths[header] = value_len
    
    # Print header
    header_row = " | ".join(h.ljust(col_widths[h]) for h in headers)
    print(header_row)
    print("-" * len(header_row))
    
    # Print rows
    for row in data:
        row_str = " | ".join(str(row[h]).ljust(col_widths[h]) for h in headers)
        print(row_str)

def main():
    """Main CLI function."""
    parser = argparse.ArgumentParser(description='Query the cities database')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # State progress command
    state_parser = subparsers.add_parser('states', help='Show state progress')
    state_parser.add_argument('--filter', '-f', help='Filter by state name or code')
    
    # Metro progress command
    metro_parser = subparsers.add_parser('metros', help='Show metro area progress')
    metro_parser.add_argument('--state', '-s', help='Filter by state')
    metro_parser.add_argument('--filter', '-f', help='Filter by metro name')
    
    # City types command
    subparsers.add_parser('types', help='Show city type statistics')
    
    # Search command
    search_parser = subparsers.add_parser('search', help='Search cities')
    search_parser.add_argument('term', help='Search term')
    search_parser.add_argument('--limit', '-l', type=int, default=20, help='Limit results')
    
    # Leaders command
    leaders_parser = subparsers.add_parser('leaders', help='Show completion leaders')
    leaders_parser.add_argument('--limit', '-l', type=int, default=10, help='Limit results')
    
    # Priority queue command
    priority_parser = subparsers.add_parser('queue', help='Show priority queue')
    priority_parser.add_argument('--limit', '-l', type=int, default=20, help='Limit results')
    
    # Overall stats command
    subparsers.add_parser('stats', help='Show overall statistics')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Get database path
    db_path = Path(__file__).parent.parent.parent / "bedder-cities.db"
    
    if not db_path.exists():
        print("ERROR: Database not found. Run 'python database/scripts/init_db.py' first.")
        sys.exit(1)
    
    db = DatabaseQuery(db_path)
    
    try:
        if args.command == 'states':
            data = db.get_state_progress(args.filter)
            print_table(data, "STATE PROGRESS")
        
        elif args.command == 'metros':
            data = db.get_metro_progress(args.state, args.filter)
            print_table(data, "METRO AREA PROGRESS")
        
        elif args.command == 'types':
            data = db.get_city_type_stats()
            print_table(data, "CITY TYPE STATISTICS")
        
        elif args.command == 'search':
            data = db.search_cities(args.term, args.limit)
            print_table(data, f"SEARCH RESULTS FOR '{args.term}'")
        
        elif args.command == 'leaders':
            data = db.get_completion_leaders(args.limit)
            print_table(data, "COMPLETION LEADERS")
        
        elif args.command == 'queue':
            data = db.get_priority_queue(args.limit)
            print_table(data, "PRIORITY QUEUE")
        
        elif args.command == 'stats':
            # Overall statistics
            conn = sqlite3.connect(db_path)
            cursor = conn.execute("SELECT COUNT(*) FROM cities")
            total_cities = cursor.fetchone()[0]
            
            cursor = conn.execute("SELECT COUNT(*) FROM cities WHERE is_completed = TRUE")
            completed_cities = cursor.fetchone()[0]
            
            cursor = conn.execute("SELECT COUNT(*) FROM states")
            total_states = cursor.fetchone()[0]
            
            cursor = conn.execute("SELECT COUNT(*) FROM metro_areas")
            total_metros = cursor.fetchone()[0]
            
            conn.close()
            
            completion_rate = round(completed_cities / total_cities * 100, 1) if total_cities > 0 else 0
            
            print("\n📊 OVERALL STATISTICS")
            print("=" * 30)
            print(f"Total Cities: {total_cities}")
            print(f"Completed Cities: {completed_cities}")
            print(f"Remaining Cities: {total_cities - completed_cities}")
            print(f"Completion Rate: {completion_rate}%")
            print(f"Total States: {total_states}")
            print(f"Total Metro Areas: {total_metros}")
    
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()