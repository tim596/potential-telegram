# City Runner Process Sequence

This document shows the complete workflow of the city runner system using Mermaid sequence diagrams.

## Overview Flow

```mermaid
sequenceDiagram
    participant CLI as CLI Interface
    participant CP as CityProcessor
    participant FM as FileManager
    participant Claude as Claude CLI
    participant QC as QualityChecker
    participant FS as File System

    CLI->>CLI: Parse command line args
    CLI->>CP: Create CityProcessor instance
    CLI->>CP: Call run()
    
    CP->>FM: loadCities(inputFile)
    FM->>FS: Read cities.md file
    FS-->>FM: File content
    FM->>FM: Parse cities from markdown
    FM-->>CP: Array of city objects
    
    CP->>CP: filterCities() - single/batch
    
    loop For each city in batch
        CP->>CP: processSingleCity()
        Note over CP: Retry logic (max 3 attempts)
        
        CP->>CP: executeClaudeGeneration()
        alt Dry Run Mode
            CP->>CP: Log commands without execution
        else Normal Mode
            CP->>FS: Write prompt to temp file
            CP->>Claude: Execute claude --print --max-turns 50
            Claude-->>FS: Write output to temp file
            CP->>FS: Read Claude output
            CP->>FS: Create city markdown file
            CP->>CP: buildSiteVerification()
            CP->>FS: Execute npm run build
        end
        
        CP->>QC: validate(city)
        QC->>FS: Read generated city file
        QC->>FS: Check built page exists
        QC->>QC: Validate content rules
        QC-->>CP: Validation result
        
        alt Quality Check Passed
            CP->>FM: moveToReports()
            FM->>FS: Update reports/cities.md
            FM->>FS: Remove from ingest/cities.md
        else Quality Check Failed
            CP->>FM: moveToReview()
            FM->>FS: Update for-review/cities.md
            FM->>FS: Remove from ingest/cities.md
        end
        
        CP->>CP: addDelayBetweenCities()
    end
    
    CP->>CP: logFinalSummary()
    CP-->>CLI: Success/failure status
```

## Detailed File Processing Flow

```mermaid
sequenceDiagram
    participant FM as FileManager
    participant FS as File System
    participant Parser as Markdown Parser

    FM->>FS: Read cities.md
    FS-->>FM: Raw markdown content
    
    FM->>Parser: Split into lines
    loop For each line
        alt State Header (# State)
            Parser->>Parser: Set currentState
        else City Entry (- [ ] **City**)
            Parser->>Parser: Extract city name
            Parser->>Parser: Create city object {name, state, originalLine}
        else Other
            Parser->>Parser: Skip line
        end
    end
    
    Parser-->>FM: Array of parsed cities
    FM-->>FM: Log count and return
```

## Claude Generation Process

```mermaid
sequenceDiagram
    participant CP as CityProcessor
    participant FS as File System
    participant Claude as Claude CLI
    participant Build as npm build

    CP->>CP: buildClaudeCommand() - Generate prompt
    CP->>FS: Write prompt to /tmp/claude_prompt_{city}.txt
    
    alt Dry Run Mode
        CP->>CP: Log command details
        CP->>CP: Log file paths
        CP->>CP: Log prompt preview
        Note over CP: No actual execution
    else Normal Mode
        CP->>Claude: Execute: claude --print --max-turns 50 < prompt > output
        Note over Claude: AI generates city content
        Claude->>FS: Write to /tmp/claude_output_{city}.md
        
        CP->>FS: Read Claude output
        CP->>FS: Validate content length
        
        CP->>FS: Create directory structure
        CP->>FS: Write final city file to src/mattress-removal/{state}/{city}.md
        
        CP->>Build: Execute npm run build
        Build->>FS: Generate dist/ files
    end
    
    CP->>FS: Cleanup temp files
```

## Quality Validation Flow

```mermaid
sequenceDiagram
    participant QC as QualityChecker
    participant FS as File System
    participant Rules as Validation Rules

    QC->>FS: Read generated city file
    alt File exists
        FS-->>QC: City content
        
        QC->>Rules: Check phone number (720-263-6094)
        QC->>Rules: Check for forbidden "same-day" language
        QC->>Rules: Check for required "next-day" language
        QC->>Rules: Check minimum word count (1000+)
        
        QC->>FS: Check built page exists in dist/
        
        Rules-->>QC: Validation results
        QC->>QC: Compile issues array
    else File missing
        QC->>QC: Add "File not found" issue
    end
    
    QC-->>QC: Return {passed: boolean, issues: string[]}
```

## File Movement and Tracking

```mermaid
sequenceDiagram
    participant FM as FileManager
    participant Ingest as ingest/cities.md
    participant Reports as reports/cities.md
    participant Review as for-review/cities.md

    alt Quality Check Passed
        FM->>Reports: Append success entry with timestamp
        FM->>Ingest: Remove city from ingest file
        Note over FM: City successfully processed
    else Quality Check Failed
        FM->>Review: Append city with issues list
        FM->>Ingest: Remove city from ingest file
        Note over FM: City needs manual review
    else Processing Error
        FM->>FM: Log error (city stays in ingest)
        Note over FM: City remains for retry
    end
```

## Error Handling and Retry Logic

```mermaid
sequenceDiagram
    participant CP as CityProcessor
    participant Retry as Retry Logic
    participant Sleep as Sleep Timer

    CP->>Retry: Start attempt 1
    
    loop Max 3 attempts
        alt Attempt succeeds
            Retry->>CP: Success - exit retry loop
        else Attempt fails
            Retry->>Sleep: Sleep 10 minutes
            Sleep-->>Retry: Resume
            Retry->>Retry: Increment attempt counter
            
            alt Max attempts reached
                Retry->>CP: Throw error - all attempts failed
            else Continue
                Retry->>CP: Try again
            end
        end
    end
```

## Configuration and Options

The runner supports several configuration options that affect the flow:

- `--dry-run`: Skips all file operations and Claude API calls
- `--single <city>`: Processes only one specific city
- `--batch <n>`: Processes n cities (default: 10)
- `--delay <s>`: Delay between cities in seconds (default: 30)
- `--max-turns 50`: Allows up to 50 Claude iterations per city

## Key Files and Directories

- **Input**: `files/ingest/cities.md` - Cities to process
- **Success**: `files/reports/cities.md` - Successfully processed cities
- **Review**: `files/for-review/cities.md` - Cities needing manual review
- **Output**: `src/mattress-removal/{state}/{city}.md` - Generated city pages
- **Temp**: `/tmp/claude_prompt_*.txt` and `/tmp/claude_output_*.md`