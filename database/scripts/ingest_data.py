#!/usr/bin/env python3
"""
Data ingestion script for Bedder World cities tracking system.
Parses tasks/cities.md and populates the database.
"""

import sqlite3
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional

class CitiesParser:
    def __init__(self, markdown_file: Path):
        self.markdown_file = markdown_file
        self.states = {}
        self.metro_areas = {}
        self.cities = []
        self.current_state = None
        self.current_metro = None
        self.current_metro_type = None
        
    def parse(self) -> Dict:
        """Parse the markdown file and extract city data."""
        with open(self.markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line or (line.startswith('##') and 'Progress Summary' in line):
                # Stop at progress summary
                if 'Progress Summary' in line:
                    break
                continue
                
            self._parse_line(line)
        
        return {
            'states': self.states,
            'metro_areas': self.metro_areas,
            'cities': self.cities
        }
    
    def _parse_line(self, line: str):
        """Parse a single line from the markdown file."""
        # State headers (# Alabama)
        if line.startswith('# ') and not line.startswith('## '):
            state_name = line[2:].strip()
            if state_name and state_name != 'Strategic Cities Launch List':
                self.current_state = state_name
                if state_name not in self.states:
                    self.states[state_name] = {
                        'name': state_name,
                        'code': self._get_state_code(state_name),
                        'metros': []
                    }
        
        # Section headers (## Major Metro Areas, ## Other Metro Areas, etc.)
        elif line.startswith('## '):
            section = line[3:].strip()
            self.current_metro_type = self._map_section_to_metro_type(section)
            self.current_metro = None
        
        # Subsection headers (### Los Angeles Suburbs)
        elif line.startswith('### '):
            suburb_section = line[4:].strip()
            if 'Suburbs' in suburb_section:
                parent_metro = suburb_section.replace(' Suburbs', '').strip()
                self.current_metro = f"{parent_metro} Suburbs"
                self.current_metro_type = 'Suburbs'
        
        # City entries
        elif line.startswith('- '):
            self._parse_city_line(line)
    
    def _parse_city_line(self, line: str):
        """Parse a city line and extract city information."""
        if not self.current_state:
            return
        
        # Remove list marker and clean up
        city_line = line[2:].strip()
        
        # Check for completion marker
        is_completed = '✅' in city_line
        
        # Clean up city name
        city_line = city_line.replace('✅', '').strip()
        
        # Parse different patterns
        city_name = None
        city_type = 'Other'
        metro_area = None
        
        # Pattern: [x] **Birmingham** (Major Metro)
        # Pattern: [x] Hoover
        # Pattern: [ ] **Bakersfield** (Metro)
        
        # Remove completion markers [x] or [ ]
        city_line = re.sub(r'^\[[ x]\]\s*', '', city_line)
        
        # Extract city name from **City Name** (Type) format
        bold_match = re.match(r'\*\*(.*?)\*\*\s*\((.*?)\)', city_line)
        if bold_match:
            city_name = bold_match.group(1).strip()
            type_text = bold_match.group(2).strip()
            city_type = self._map_type_text_to_city_type(type_text)
            
            # This is a metro area, not just a city
            if city_type in ['Major Metro', 'Metro']:
                metro_area = city_name
                self.current_metro = city_name
                
                # Add to metro areas
                if self.current_state not in self.metro_areas:
                    self.metro_areas[self.current_state] = []
                
                self.metro_areas[self.current_state].append({
                    'name': city_name,
                    'type': city_type,
                    'parent_metro': None,
                    'cities': []
                })
        
        else:
            # Simple city name (suburb or regular city)
            city_name = city_line.strip()
            if self.current_metro_type == 'Suburbs' or (self.current_metro and 'Suburbs' in self.current_metro):
                city_type = 'Suburb'
            elif self.current_metro_type:
                city_type = self.current_metro_type
            else:
                city_type = 'Other'
            metro_area = self.current_metro
        
        if city_name:
            city_data = {
                'name': city_name,
                'state': self.current_state,
                'metro_area': metro_area,
                'city_type': city_type,
                'is_completed': is_completed,
                'priority_score': self._get_priority_score(city_type)
            }
            
            self.cities.append(city_data)
    
    def _get_state_code(self, state_name: str) -> str:
        """Get state code from state name."""
        state_codes = {
            'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
            'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
            'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
            'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
            'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
            'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
            'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
            'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
            'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
            'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
            'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
            'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
            'Wisconsin': 'WI', 'Wyoming': 'WY'
        }
        return state_codes.get(state_name, 'XX')
    
    def _map_section_to_metro_type(self, section: str) -> str:
        """Map section headers to metro types."""
        if 'Major Metro' in section:
            return 'Major Metro'
        elif 'Metro' in section and 'Major' not in section:
            return 'Metro'
        elif 'College' in section:
            return 'College Town'
        elif 'Vacation' in section:
            return 'Vacation Town'
        elif 'Capital' in section:
            return 'State Capital'
        elif 'Suburb' in section:
            return 'Suburbs'
        else:
            return 'Other'
    
    def _map_type_text_to_city_type(self, type_text: str) -> str:
        """Map type text to standardized city type."""
        type_text = type_text.lower()
        if 'major metro' in type_text:
            return 'Major Metro'
        elif 'metro' in type_text and 'major' not in type_text:
            return 'Metro'
        elif 'state capital' in type_text or 'capital' in type_text:
            return 'State Capital'
        elif 'college' in type_text:
            return 'College Town'
        elif 'vacation' in type_text:
            return 'Vacation Town'
        else:
            return 'Other'
    
    def _get_priority_score(self, city_type: str) -> int:
        """Get priority score for city type."""
        priority_map = {
            'Major Metro': 1,
            'Metro': 2,
            'State Capital': 2,
            'Suburb': 3,
            'College Town': 4,
            'Vacation Town': 5,
            'Other': 6
        }
        return priority_map.get(city_type, 6)

class DatabaseIngestor:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        
    def ingest(self, data: Dict):
        """Ingest parsed data into the database."""
        conn = sqlite3.connect(self.db_path)
        conn.execute('PRAGMA foreign_keys = ON')
        
        try:
            # Insert states
            state_ids = self._insert_states(conn, data['states'])
            
            # Insert metro areas
            metro_ids = self._insert_metro_areas(conn, data['metro_areas'], state_ids)
            
            # Insert cities
            self._insert_cities(conn, data['cities'], state_ids, metro_ids)
            
            # Update counts
            self._update_counts(conn)
            
            conn.commit()
            
            # Print summary
            self._print_summary(conn)
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def _insert_states(self, conn: sqlite3.Connection, states: Dict) -> Dict[str, int]:
        """Insert states and return mapping of state names to IDs."""
        state_ids = {}
        
        for state_name, state_data in states.items():
            cursor = conn.execute(
                "INSERT INTO states (state_name, state_code) VALUES (?, ?)",
                (state_name, state_data['code'])
            )
            state_ids[state_name] = cursor.lastrowid
        
        return state_ids
    
    def _insert_metro_areas(self, conn: sqlite3.Connection, metro_areas: Dict, state_ids: Dict[str, int]) -> Dict[Tuple[str, str], int]:
        """Insert metro areas and return mapping to IDs."""
        metro_ids = {}
        
        for state_name, metros in metro_areas.items():
            state_id = state_ids[state_name]
            
            for metro in metros:
                priority_score = 1 if metro['type'] == 'Major Metro' else 2
                
                cursor = conn.execute(
                    "INSERT INTO metro_areas (state_id, metro_name, metro_type, priority_score) VALUES (?, ?, ?, ?)",
                    (state_id, metro['name'], metro['type'], priority_score)
                )
                metro_ids[(state_name, metro['name'])] = cursor.lastrowid
        
        return metro_ids
    
    def _insert_cities(self, conn: sqlite3.Connection, cities: List[Dict], state_ids: Dict[str, int], metro_ids: Dict[Tuple[str, str], int]):
        """Insert cities into the database."""
        # Get city type IDs
        cursor = conn.execute("SELECT id, type_name FROM city_types")
        type_ids = {type_name: type_id for type_id, type_name in cursor.fetchall()}
        
        for city in cities:
            state_id = state_ids[city['state']]
            city_type_id = type_ids[city['city_type']]
            
            # Find metro area ID
            metro_area_id = None
            if city['metro_area']:
                metro_key = (city['state'], city['metro_area'])
                metro_area_id = metro_ids.get(metro_key)
                
                # If not found, try to find parent metro
                if not metro_area_id and 'Suburbs' in city['metro_area']:
                    parent_metro = city['metro_area'].replace(' Suburbs', '').strip()
                    parent_key = (city['state'], parent_metro)
                    metro_area_id = metro_ids.get(parent_key)
            
            completion_date = 'CURRENT_TIMESTAMP' if city['is_completed'] else None
            
            try:
                conn.execute(
                    """INSERT INTO cities (city_name, state_id, metro_area_id, city_type_id, 
                       is_completed, completion_date, priority_score) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (city['name'], state_id, metro_area_id, city_type_id, 
                     city['is_completed'], completion_date, city['priority_score'])
                )
            except sqlite3.IntegrityError as e:
                print(f"WARNING: Duplicate city {city['name']} in {city['state']} - skipping")
    
    def _update_counts(self, conn: sqlite3.Connection):
        """Update total and completed city counts."""
        # Update state counts
        conn.execute("""
            UPDATE states 
            SET total_cities = (
                SELECT COUNT(*) FROM cities WHERE state_id = states.id
            ),
            completed_cities = (
                SELECT COUNT(*) FROM cities WHERE state_id = states.id AND is_completed = TRUE
            )
        """)
        
        # Update metro area counts
        conn.execute("""
            UPDATE metro_areas 
            SET total_cities = (
                SELECT COUNT(*) FROM cities WHERE metro_area_id = metro_areas.id
            ),
            completed_cities = (
                SELECT COUNT(*) FROM cities WHERE metro_area_id = metro_areas.id AND is_completed = TRUE
            )
        """)
    
    def _print_summary(self, conn: sqlite3.Connection):
        """Print ingestion summary."""
        cursor = conn.execute("SELECT COUNT(*) FROM states")
        state_count = cursor.fetchone()[0]
        
        cursor = conn.execute("SELECT COUNT(*) FROM metro_areas")
        metro_count = cursor.fetchone()[0]
        
        cursor = conn.execute("SELECT COUNT(*) FROM cities")
        city_count = cursor.fetchone()[0]
        
        cursor = conn.execute("SELECT COUNT(*) FROM cities WHERE is_completed = TRUE")
        completed_count = cursor.fetchone()[0]
        
        print("✓ Data ingestion completed successfully")
        print(f"✓ Inserted {state_count} states")
        print(f"✓ Inserted {metro_count} metro areas")
        print(f"✓ Inserted {city_count} cities")
        completion_pct = (completed_count/city_count*100) if city_count > 0 else 0
        print(f"✓ {completed_count} cities marked as completed ({completion_pct:.1f}%)")

def main():
    """Main function."""
    # Get paths
    script_dir = Path(__file__).parent
    cities_file = script_dir.parent.parent / "tasks" / "cities.md"
    db_path = script_dir.parent / "bedder-cities.db"
    
    if not cities_file.exists():
        print(f"ERROR: Cities file not found: {cities_file}")
        sys.exit(1)
    
    if not db_path.exists():
        print(f"ERROR: Database not found: {db_path}")
        print("Run 'python init_db.py' first to create the database")
        sys.exit(1)
    
    try:
        # Parse cities data
        print("Parsing cities.md...")
        parser = CitiesParser(cities_file)
        data = parser.parse()
        
        # Ingest into database
        print("Ingesting data into database...")
        ingestor = DatabaseIngestor(db_path)
        ingestor.ingest(data)
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()