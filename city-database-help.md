# City Database Help Guide

Quick reference guide for the Bedder World Cities Database CLI tools.

## 🚀 Common Commands

### Get Your Next City to Launch
```bash
# Get next priority city + all cities in that metro
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py

# Get next city in a specific state
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py --state TX

# Get next city in a specific metro area
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py --metro "Los Angeles"

# Get multiple cities without metro details
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py --count 10 --list
```

### View Progress Dashboard
```bash
# See overall progress, top states, next priorities
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/stats.py
```

### Query Database
```bash
# State progress
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py states
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py states --filter CA

# Metro area progress
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py metros
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py metros --state TX

# Search for cities
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py search "new york"

# Get priority queue
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py queue

# See completion leaders
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py leaders
```

### Mark Cities Complete
```bash
# Mark a city as complete
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py complete "Phoenix"

# Mark city with state (for disambiguation)
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py complete "Phoenix" --state AZ

# Search for cities to complete
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py search "phoenix"

# List incomplete cities
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py list

# List incomplete cities in a state
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py list --state CA
```

## 📖 Command Reference

### `next_city.py` - Next City Finder

**Purpose**: Get the highest priority city to launch next

**Key Feature**: Returns all cities in the metro area (as requested)

```bash
# Basic usage - shows next city + all metro cities
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py

# Options:
--state, -s      Filter by state (TX, California, etc.)
--metro, -m      Filter by metro area name
--type, -t       Filter by city type
--count, -c      Number of cities to return
--list, -l       List mode (multiple cities, no metro details)
--no-metro       Don't show all metro cities
```

**Examples**:
```bash
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py --state FL
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py --metro Dallas
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py --type "Major Metro"
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py --count 5 --list
```

### `stats.py` - Progress Dashboard

**Purpose**: Show overall progress and key metrics

```bash
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/stats.py
```

Shows:
- Overall progress (782 total cities, completion %)
- Top states by completion rate
- Top metro areas by completion rate
- Breakdown by city type
- Next priority cities
- Recently completed cities

### `query.py` - Database Queries

**Purpose**: Flexible database queries with multiple subcommands

```bash
# Subcommands:
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py states     # State progress
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py metros     # Metro area progress
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py types      # City type statistics
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py search     # Search cities
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py leaders    # Completion leaders
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py queue      # Priority queue
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py stats      # Overall statistics
```

### `mark_complete.py` - Mark Cities Complete

**Purpose**: Mark cities as completed and manage completion status

```bash
# Mark a city as complete
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py complete "City Name"

# Mark with state disambiguation
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py complete "Phoenix" --state AZ

# Search for cities by name
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py search "search term"

# List incomplete cities
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py list

# List incomplete cities in specific state
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py list --state TX
```

**Key Features**:
- Handles city name disambiguation when multiple matches exist
- Shows completion status in search results
- Lists cities by priority order
- Provides clear success/error feedback

**Options for states/metros**:
```bash
--filter, -f     Filter by name
--state, -s      Filter by state (metros only)
```

**Options for search/leaders/queue**:
```bash
--limit, -l      Limit number of results
```

## 🏙️ City Types & Priorities

The database uses a priority system (lower number = higher priority):

1. **Major Metro** (Priority 1) - Large metropolitan centers
2. **Metro** (Priority 2) - Mid-size regional centers
3. **State Capital** (Priority 2) - State capital cities
4. **Suburb** (Priority 3) - Cities within metro areas
5. **College Town** (Priority 4) - University towns
6. **Vacation Town** (Priority 5) - Tourist destinations
7. **Other** (Priority 6) - Other cities

## 📊 Database Stats

- **Total Cities**: 782
- **Completed**: 102 (13.0%)
- **States**: 50
- **Metro Areas**: 301

## 💡 Pro Tips

### Getting Started Workflow
1. **See the big picture**: `python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/stats.py`
2. **Get your next city**: `python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py`
3. **Research the metro**: Note all cities shown in the metro area
4. **Check state progress**: `python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py states --filter [STATE]`

### Strategic Planning
```bash
# See which major metros are incomplete
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py queue | grep "Major Metro"

# Find metros that are partially complete (good for finishing)
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py metros | grep -v "0.0\|100.0"

# Find states with no completed cities yet
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py states | grep "0.0"
```

### Filtering Examples
```bash
# Next city in California
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py --state CA

# All Texas metros
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py metros --state TX

# Search for all Phoenix-related cities
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py search phoenix

# Get next 10 priorities
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py --count 10 --list
```

## 📊 Current Database Stats (Based on Output)

- **Total Cities**: 782  
- **Completed Cities**: 102 (13.0%)
- **Remaining Cities**: 680
- **Active States**: 50
- **Metro Areas**: 301

### Next Priority City
🎯 **Albuquerque, NM** - Major Metro (Albuquerque metro)
- Priority Score: 1
- Metro Progress: 0/2 (0.0% complete)
- Cities in metro: Albuquerque, Rio Rancho

## 🔧 Troubleshooting

### Database Not Found
```bash
# Initialize the database first
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/init_db.py
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/ingest_data.py
```

### Script Not Found
```bash
# Use full absolute path (shown in all examples above)
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py
```

### No Results Found
- Check your filter spelling
- Try partial matches (e.g., "tex" instead of "texas")
- Use `--limit` to increase result count

## 🎯 Quick Commands Cheat Sheet

```bash
# The essentials
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/stats.py                    # Dashboard
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py                # Next city + metro
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py states             # State progress
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py metros             # Metro progress

# Mark cities complete
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py complete "City Name"     # Mark complete
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py list --state CA         # List incomplete in CA
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/mark_complete.py search "phoenix"        # Search cities

# Filtering  
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/next_city.py --state TX     # Next TX city
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py search houston     # Find Houston cities
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py metros --state CA  # CA metros

# Planning
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py queue              # Priority queue
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py leaders            # Top performers
python3 /Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/cli/query.py types              # Type breakdown
```

## 📁 File Locations

All commands use absolute paths to your system:

```
/Users/timothysumerfield/Desktop/Working.../bedder-world-base/database/scripts/
├── cli/
│   ├── next_city.py       # Next city finder
│   ├── stats.py           # Dashboard  
│   ├── query.py           # Query tool
│   └── mark_complete.py   # Mark cities complete
├── init_db.py             # Initialize database
└── ingest_data.py         # Import data
```

**Example commands shown with your exact system path for easy copy/paste**