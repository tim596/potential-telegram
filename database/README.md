# Bedder World Cities Database

Professional SQLite database system for tracking city launch progress across 780 cities in 50 states.

## Quick Start

1. **Initialize Database**
   ```bash
   cd database/scripts
   python3 init_db.py
   ```

2. **Import City Data**
   ```bash
   python3 ingest_data.py
   ```

3. **View Dashboard**
   ```bash
   python3 cli/stats.py
   ```

4. **Get Next City to Launch**
   ```bash
   python3 cli/next_city.py
   ```

## CLI Tools

### 📊 Stats Dashboard
```bash
python3 cli/stats.py
```
Displays overall progress, top states/metros, city type breakdown, and next priorities.

### 🎯 Next City Finder
```bash
# Get next priority city (shows all cities in metro area)
python3 cli/next_city.py

# Filter by state
python3 cli/next_city.py --state CA

# Filter by metro area
python3 cli/next_city.py --metro "Los Angeles"

# Get multiple cities without metro details
python3 cli/next_city.py --count 10 --list

# Get next city without metro area details
python3 cli/next_city.py --no-metro
```

### 🔍 Query Tool
```bash
# State progress
python3 cli/query.py states
python3 cli/query.py states --filter CA

# Metro area progress  
python3 cli/query.py metros
python3 cli/query.py metros --state TX

# City type statistics
python3 cli/query.py types

# Search cities
python3 cli/query.py search "new york"

# Completion leaders
python3 cli/query.py leaders

# Priority queue
python3 cli/query.py queue

# Overall statistics
python3 cli/query.py stats
```

## Database Schema

### Tables
- **states** - State information and completion counts
- **metro_areas** - Metropolitan areas with hierarchical relationships
- **cities** - Individual city records with completion status
- **city_types** - City type definitions and priorities

### City Types (Priority Order)
1. **Major Metro** - Large metropolitan centers (Priority 1)
2. **Metro** - Mid-size regional centers (Priority 2) 
3. **State Capital** - State capitals (Priority 2)
4. **Suburb** - Cities within metro areas (Priority 3)
5. **College Town** - University towns (Priority 4)
6. **Vacation Town** - Tourist destinations (Priority 5)
7. **Other** - Other cities (Priority 6)

### Views
- **v_city_progress** - Complete city information with progress
- **v_state_summary** - State-level completion summary
- **v_metro_summary** - Metro area completion summary

## Data Statistics

- **Total Cities**: 782
- **Completed Cities**: 102 (13.0%)
- **States**: 50
- **Metro Areas**: 301
- **Top Completed States**: Arizona (100%), Alabama (100%), Arkansas (100%), Alaska (100%)

## SQL Queries

Pre-built SQL queries are available in `queries/`:
- `completion_stats.sql` - Various completion statistics
- `next_priorities.sql` - Priority-based city selection
- `metro_progress.sql` - Metro area analysis

## Files Structure

```
database/
├── bedder-cities.db          # SQLite database file
├── schema.sql                # Database schema definition
├── scripts/
│   ├── init_db.py           # Database initialization
│   ├── ingest_data.py       # Data import from cities.md
│   └── cli/
│       ├── stats.py         # Statistics dashboard
│       ├── next_city.py     # Next city finder
│       └── query.py         # Query tool
└── queries/                 # Pre-built SQL queries
    ├── completion_stats.sql
    ├── next_priorities.sql
    └── metro_progress.sql
```

## Key Features

✅ **Smart Priority System** - Prioritizes Major Metros → Metros → State Capitals → Suburbs  
✅ **Metro Area Awareness** - Returns all cities in metro when selecting next city  
✅ **Completion Tracking** - Tracks progress with automatic count updates  
✅ **Flexible Filtering** - Filter by state, metro, or city type  
✅ **Professional CLI** - Beautiful, informative command-line interface  
✅ **Comprehensive Queries** - Pre-built queries for common operations  

## Example Usage

```bash
# See overall progress
python3 cli/stats.py

# Get next city to launch (returns all cities in that metro)
python3 cli/next_city.py
# Output shows: Albuquerque, NM + all 2 cities in Albuquerque metro

# Find next city in a specific state
python3 cli/next_city.py --state FL
# Returns highest priority incomplete city in Florida

# View California metro progress  
python3 cli/query.py metros --state CA
# Shows completion rates for all CA metro areas

# Search for specific cities
python3 cli/query.py search houston
# Finds all cities matching "houston"
```