#!/usr/bin/env python3
"""
CLI tool to get the next city to launch.
Returns all cities in the metro area when a metro is selected.
"""

import sqlite3
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Optional

class NextCityFinder:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        
    def get_next_city(self, state_filter: Optional[str] = None, 
                     metro_filter: Optional[str] = None,
                     city_type_filter: Optional[str] = None,
                     return_metro_cities: bool = True) -> Dict:
        """
        Get the next priority city to launch.
        
        Args:
            state_filter: Filter by state name or code
            metro_filter: Filter by metro area name
            city_type_filter: Filter by city type
            return_metro_cities: If True and next city is a metro center, return all cities in that metro
        
        Returns:
            Dict with next city info and optionally all metro cities
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            # Build the query with filters
            where_clauses = ["c.is_completed = FALSE"]
            params = []
            
            if state_filter:
                where_clauses.append("(s.state_name LIKE ? OR s.state_code LIKE ?)")
                params.extend([f"%{state_filter}%", f"%{state_filter}%"])
            
            if metro_filter:
                where_clauses.append("m.metro_name LIKE ?")
                params.append(f"%{metro_filter}%")
            
            if city_type_filter:
                where_clauses.append("ct.type_name LIKE ?")
                params.append(f"%{city_type_filter}%")
            
            where_clause = " AND ".join(where_clauses)
            
            query = f"""
            SELECT 
                c.id,
                c.city_name,
                s.state_name,
                s.state_code,
                m.metro_name,
                m.metro_type,
                ct.type_name as city_type,
                c.priority_score,
                c.population
            FROM cities c
            JOIN states s ON c.state_id = s.id
            LEFT JOIN metro_areas m ON c.metro_area_id = m.id
            JOIN city_types ct ON c.city_type_id = ct.id
            WHERE {where_clause}
            ORDER BY c.priority_score ASC, c.city_name ASC
            LIMIT 1
            """
            
            cursor = conn.execute(query, params)
            next_city = cursor.fetchone()
            
            if not next_city:
                return {"error": "No incomplete cities found with the given filters"}
            
            result = {
                "next_city": dict(next_city),
                "metro_cities": []
            }
            
            # If this city has a metro area and return_metro_cities is True, get all cities in that metro
            if return_metro_cities and next_city['metro_name']:
                metro_cities_query = """
                SELECT 
                    c.id,
                    c.city_name,
                    s.state_name,
                    s.state_code,
                    m.metro_name,
                    ct.type_name as city_type,
                    c.is_completed,
                    c.priority_score
                FROM cities c
                JOIN states s ON c.state_id = s.id
                JOIN metro_areas m ON c.metro_area_id = m.id
                JOIN city_types ct ON c.city_type_id = ct.id
                WHERE m.metro_name = ? AND s.state_name = ?
                ORDER BY c.priority_score ASC, c.is_completed ASC, c.city_name ASC
                """
                
                cursor = conn.execute(metro_cities_query, (next_city['metro_name'], next_city['state_name']))
                metro_cities = [dict(row) for row in cursor.fetchall()]
                result["metro_cities"] = metro_cities
                
                # Add metro summary
                completed_count = sum(1 for city in metro_cities if city['is_completed'])
                result["metro_summary"] = {
                    "metro_name": next_city['metro_name'],
                    "state": next_city['state_name'],
                    "total_cities": len(metro_cities),
                    "completed_cities": completed_count,
                    "remaining_cities": len(metro_cities) - completed_count,
                    "completion_percentage": round(completed_count / len(metro_cities) * 100, 1) if metro_cities else 0
                }
            
            return result
            
        finally:
            conn.close()
    
    def get_next_cities(self, count: int = 5, **filters) -> List[Dict]:
        """Get multiple next priority cities."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            # Build the query with filters
            where_clauses = ["c.is_completed = FALSE"]
            params = []
            
            for filter_name, filter_value in filters.items():
                if filter_value:
                    if filter_name == 'state':
                        where_clauses.append("(s.state_name LIKE ? OR s.state_code LIKE ?)")
                        params.extend([f"%{filter_value}%", f"%{filter_value}%"])
                    elif filter_name == 'metro':
                        where_clauses.append("m.metro_name LIKE ?")
                        params.append(f"%{filter_value}%")
                    elif filter_name == 'city_type':
                        where_clauses.append("ct.type_name LIKE ?")
                        params.append(f"%{filter_value}%")
            
            where_clause = " AND ".join(where_clauses)
            
            query = f"""
            SELECT 
                c.id,
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
            WHERE {where_clause}
            ORDER BY c.priority_score ASC, c.city_name ASC
            LIMIT ?
            """
            
            params.append(count)
            cursor = conn.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
            
        finally:
            conn.close()

def print_city_info(city_data: Dict):
    """Print formatted city information."""
    next_city = city_data['next_city']
    
    print("🎯 NEXT CITY TO LAUNCH")
    print("=" * 50)
    print(f"City: {next_city['city_name']}, {next_city['state_code']}")
    print(f"State: {next_city['state_name']}")
    print(f"Type: {next_city['city_type']}")
    if next_city['metro_name']:
        print(f"Metro Area: {next_city['metro_name']}")
    print(f"Priority Score: {next_city['priority_score']}")
    
    # Print metro cities if available
    if city_data.get('metro_cities'):
        metro_summary = city_data['metro_summary']
        print(f"\n📍 ALL CITIES IN {metro_summary['metro_name'].upper()} METRO")
        print("=" * 50)
        print(f"Progress: {metro_summary['completed_cities']}/{metro_summary['total_cities']} "
              f"({metro_summary['completion_percentage']}% complete)")
        print(f"Remaining: {metro_summary['remaining_cities']} cities")
        print()
        
        for i, city in enumerate(city_data['metro_cities'], 1):
            status = "✅" if city['is_completed'] else "❌"
            print(f"{i:2}. {status} {city['city_name']} ({city['city_type']})")
        
        # Show which cities to do next
        incomplete_cities = [c for c in city_data['metro_cities'] if not c['is_completed']]
        if incomplete_cities:
            print(f"\n🚀 NEXT {min(3, len(incomplete_cities))} CITIES TO LAUNCH:")
            for i, city in enumerate(incomplete_cities[:3], 1):
                print(f"  {i}. {city['city_name']} ({city['city_type']})")

def main():
    """Main CLI function."""
    parser = argparse.ArgumentParser(description='Get the next city to launch')
    parser.add_argument('--state', '-s', help='Filter by state name or code')
    parser.add_argument('--metro', '-m', help='Filter by metro area name')
    parser.add_argument('--type', '-t', help='Filter by city type')
    parser.add_argument('--count', '-c', type=int, default=1, help='Number of cities to return')
    parser.add_argument('--list', '-l', action='store_true', help='List multiple cities instead of metro details')
    parser.add_argument('--no-metro', action='store_true', help='Don\'t return all metro cities')
    
    args = parser.parse_args()
    
    # Get database path
    db_path = Path(__file__).parent.parent.parent / "bedder-cities.db"
    
    if not db_path.exists():
        print("ERROR: Database not found. Run 'python database/scripts/init_db.py' first.")
        sys.exit(1)
    
    finder = NextCityFinder(db_path)
    
    try:
        if args.list or args.count > 1:
            # List mode - show multiple cities without metro details
            cities = finder.get_next_cities(
                count=args.count,
                state=args.state,
                metro=args.metro,
                city_type=args.type
            )
            
            if not cities:
                print("No incomplete cities found with the given filters.")
                return
            
            print(f"🎯 NEXT {len(cities)} CITIES TO LAUNCH")
            print("=" * 50)
            for i, city in enumerate(cities, 1):
                metro_info = f" ({city['metro_name']})" if city['metro_name'] else ""
                print(f"{i:2}. {city['city_name']}, {city['state_code']} - {city['city_type']}{metro_info}")
        
        else:
            # Single city mode - show city and all metro cities
            result = finder.get_next_city(
                state_filter=args.state,
                metro_filter=args.metro,
                city_type_filter=args.type,
                return_metro_cities=not args.no_metro
            )
            
            if 'error' in result:
                print(result['error'])
                return
            
            print_city_info(result)
    
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()