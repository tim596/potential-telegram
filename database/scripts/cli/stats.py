#!/usr/bin/env python3
"""
CLI tool for displaying database statistics dashboard.
"""

import sqlite3
import sys
from pathlib import Path
from typing import List, Dict

class StatsDashboard:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        
    def get_overall_stats(self) -> Dict:
        """Get overall statistics."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            # Basic counts
            cursor = conn.execute("SELECT COUNT(*) as count FROM cities")
            total_cities = cursor.fetchone()['count']
            
            cursor = conn.execute("SELECT COUNT(*) as count FROM cities WHERE is_completed = TRUE")
            completed_cities = cursor.fetchone()['count']
            
            cursor = conn.execute("SELECT COUNT(*) as count FROM states WHERE total_cities > 0")
            active_states = cursor.fetchone()['count']
            
            cursor = conn.execute("SELECT COUNT(*) as count FROM metro_areas WHERE total_cities > 0")
            active_metros = cursor.fetchone()['count']
            
            completion_rate = round(completed_cities / total_cities * 100, 1) if total_cities > 0 else 0
            
            return {
                'total_cities': total_cities,
                'completed_cities': completed_cities,
                'remaining_cities': total_cities - completed_cities,
                'completion_rate': completion_rate,
                'active_states': active_states,
                'active_metros': active_metros
            }
            
        finally:
            conn.close()
    
    def get_top_states(self, limit: int = 5) -> List[Dict]:
        """Get top states by completion rate."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            query = """
            SELECT 
                state_name,
                state_code,
                total_cities,
                completed_cities,
                ROUND(CAST(completed_cities AS REAL) / CAST(total_cities AS REAL) * 100, 1) as completion_percentage
            FROM states
            WHERE total_cities > 0
            ORDER BY completion_percentage DESC, completed_cities DESC
            LIMIT ?
            """
            
            cursor = conn.execute(query, (limit,))
            return [dict(row) for row in cursor.fetchall()]
            
        finally:
            conn.close()
    
    def get_top_metros(self, limit: int = 5) -> List[Dict]:
        """Get top metro areas by completion rate."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            query = """
            SELECT 
                m.metro_name,
                s.state_code,
                m.metro_type,
                m.total_cities,
                m.completed_cities,
                ROUND(CAST(m.completed_cities AS REAL) / CAST(m.total_cities AS REAL) * 100, 1) as completion_percentage
            FROM metro_areas m
            JOIN states s ON m.state_id = s.id
            WHERE m.total_cities > 0
            ORDER BY completion_percentage DESC, m.completed_cities DESC
            LIMIT ?
            """
            
            cursor = conn.execute(query, (limit,))
            return [dict(row) for row in cursor.fetchall()]
            
        finally:
            conn.close()
    
    def get_type_breakdown(self) -> List[Dict]:
        """Get breakdown by city type."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            query = """
            SELECT 
                ct.type_name,
                ct.priority_score,
                COUNT(*) as total_cities,
                SUM(CASE WHEN c.is_completed THEN 1 ELSE 0 END) as completed_cities,
                ROUND(CAST(SUM(CASE WHEN c.is_completed THEN 1 ELSE 0 END) AS REAL) / CAST(COUNT(*) AS REAL) * 100, 1) as completion_percentage
            FROM city_types ct
            JOIN cities c ON ct.id = c.city_type_id
            GROUP BY ct.id, ct.type_name, ct.priority_score
            ORDER BY ct.priority_score ASC
            """
            
            cursor = conn.execute(query)
            return [dict(row) for row in cursor.fetchall()]
            
        finally:
            conn.close()
    
    def get_recent_completions(self, limit: int = 10) -> List[Dict]:
        """Get recently completed cities (if we had completion dates)."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            query = """
            SELECT 
                c.city_name,
                s.state_code,
                m.metro_name,
                ct.type_name as city_type
            FROM cities c
            JOIN states s ON c.state_id = s.id
            LEFT JOIN metro_areas m ON c.metro_area_id = m.id
            JOIN city_types ct ON c.city_type_id = ct.id
            WHERE c.is_completed = TRUE
            ORDER BY c.city_name ASC
            LIMIT ?
            """
            
            cursor = conn.execute(query, (limit,))
            return [dict(row) for row in cursor.fetchall()]
            
        finally:
            conn.close()
    
    def get_next_priorities(self, limit: int = 5) -> List[Dict]:
        """Get next priority cities."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            query = """
            SELECT 
                c.city_name,
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
            
            cursor = conn.execute(query, (limit,))
            return [dict(row) for row in cursor.fetchall()]
            
        finally:
            conn.close()

def display_dashboard(dashboard: StatsDashboard):
    """Display the complete statistics dashboard."""
    
    # Overall stats
    stats = dashboard.get_overall_stats()
    
    print("🏙️  BEDDER WORLD CITIES DASHBOARD")
    print("=" * 50)
    print()
    
    # Overall progress
    print("📊 OVERALL PROGRESS")
    print("-" * 20)
    print(f"Total Cities:      {stats['total_cities']:,}")
    print(f"Completed Cities:  {stats['completed_cities']:,}")
    print(f"Remaining Cities:  {stats['remaining_cities']:,}")
    print(f"Completion Rate:   {stats['completion_rate']}%")
    print(f"Active States:     {stats['active_states']}")
    print(f"Metro Areas:       {stats['active_metros']}")
    print()
    
    # Progress bar
    bar_width = 30
    completed_bars = int(stats['completion_rate'] / 100 * bar_width)
    progress_bar = "█" * completed_bars + "░" * (bar_width - completed_bars)
    print(f"Progress: [{progress_bar}] {stats['completion_rate']}%")
    print()
    
    # Top states
    top_states = dashboard.get_top_states(5)
    if top_states:
        print("🏆 TOP STATES BY COMPLETION")
        print("-" * 30)
        for i, state in enumerate(top_states, 1):
            print(f"{i}. {state['state_name']} ({state['state_code']}): "
                  f"{state['completed_cities']}/{state['total_cities']} "
                  f"({state['completion_percentage']}%)")
        print()
    
    # Top metros
    top_metros = dashboard.get_top_metros(5)
    if top_metros:
        print("🌆 TOP METRO AREAS BY COMPLETION")
        print("-" * 35)
        for i, metro in enumerate(top_metros, 1):
            print(f"{i}. {metro['metro_name']}, {metro['state_code']} ({metro['metro_type']}): "
                  f"{metro['completed_cities']}/{metro['total_cities']} "
                  f"({metro['completion_percentage']}%)")
        print()
    
    # City type breakdown
    type_breakdown = dashboard.get_type_breakdown()
    if type_breakdown:
        print("🏘️  BREAKDOWN BY CITY TYPE")
        print("-" * 25)
        for city_type in type_breakdown:
            print(f"{city_type['type_name']:<15} "
                  f"{city_type['completed_cities']:>3}/{city_type['total_cities']:<3} "
                  f"({city_type['completion_percentage']:>5.1f}%) "
                  f"Priority: {city_type['priority_score']}")
        print()
    
    # Next priorities
    next_priorities = dashboard.get_next_priorities(5)
    if next_priorities:
        print("🚀 NEXT PRIORITY CITIES")
        print("-" * 25)
        for i, city in enumerate(next_priorities, 1):
            metro_info = f" ({city['metro_name']})" if city['metro_name'] else ""
            print(f"{i}. {city['city_name']}, {city['state_code']} - "
                  f"{city['city_type']}{metro_info}")
        print()
    
    # Recent completions
    recent = dashboard.get_recent_completions(5)
    if recent:
        print("✅ RECENTLY COMPLETED (Sample)")
        print("-" * 30)
        for i, city in enumerate(recent, 1):
            metro_info = f" ({city['metro_name']})" if city['metro_name'] else ""
            print(f"{i}. {city['city_name']}, {city['state_code']} - "
                  f"{city['city_type']}{metro_info}")
        print()
    
    print("💡 Use 'python query.py --help' for detailed queries")
    print("💡 Use 'python next_city.py' to get your next city to launch")

def main():
    """Main function."""
    # Get database path
    db_path = Path(__file__).parent.parent.parent / "bedder-cities.db"
    
    if not db_path.exists():
        print("ERROR: Database not found. Run 'python database/scripts/init_db.py' first.")
        sys.exit(1)
    
    try:
        dashboard = StatsDashboard(db_path)
        display_dashboard(dashboard)
    
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()