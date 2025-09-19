# City Launch Runner: Node.js Implementation

## Overview
Automated Node.js runner to systematically launch 774 remaining cities using `claude -p bedder-world-cities` with comprehensive quality validation and file management.

## Architecture

```
runner/
├── package.json                    # Node.js dependencies
├── generate-cities.js              # Main CLI entry point
├── lib/
│   ├── CityProcessor.js           # Core city processing logic
│   ├── QualityChecker.js          # Heuristic validation engine
│   ├── FileManager.js             # File operations (ingest/reports/review)
│   └── Logger.js                  # Pino logger configuration
└── files/
    ├── ingest/
    │   └── cities.md              # 774 cities to process
    ├── reports/
    │   └── cities.md              # Successfully completed cities
    └── for-review/
        └── cities.md              # Cities failing quality checks
```

## Implementation

### 1. Package Configuration

**runner/package.json**:
```json
{
  "name": "bedder-world-city-runner",
  "version": "1.0.0",
  "description": "Automated city content creation for Bedder World",
  "main": "generate-cities.js",
  "scripts": {
    "start": "node generate-cities.js"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "pino": "^8.16.0",
    "pino-pretty": "^10.2.0",
    "fs-extra": "^11.1.0",
    "child_process": "^1.0.2"
  }
}
```

### 2. CLI Entry Point

**runner/generate-cities.js**:
```javascript
#!/usr/bin/env node

const { Command } = require('commander');
const Logger = require('./lib/Logger');
const CityProcessor = require('./lib/CityProcessor');

const program = new Command();

program
  .name('generate-cities')
  .description('Launch cities systematically using Claude CLI')
  .requiredOption('--file <path>', 'Input cities file (e.g., ./files/ingest/cities.md)')
  .option('--batch <number>', 'Number of cities to process', '10')
  .option('--delay <seconds>', 'Delay between cities in seconds', '30')
  .option('--single <cityName>', 'Process only one specific city by name')
  .parse();

async function main() {
  const options = program.opts();
  const logger = Logger.create();
  
  logger.info('🚀 Starting City Launch Runner');
  logger.info(`📁 Input file: ${options.file}`);
  
  if (options.single) {
    logger.info(`🎯 Single city mode: ${options.single}`);
  } else {
    logger.info(`📊 Batch size: ${options.batch}`);
    logger.info(`⏱️  Delay: ${options.delay}s between cities`);
  }
  
  const processor = new CityProcessor({
    inputFile: options.file,
    batchSize: options.single ? 1 : parseInt(options.batch),
    delaySeconds: parseInt(options.delay),
    singleCity: options.single,
    logger
  });
  
  try {
    await processor.run();
    logger.info('✅ Runner completed successfully');
  } catch (error) {
    logger.error(`❌ Runner failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
```

### 3. Logger Configuration

**runner/lib/Logger.js**:
```javascript
const pino = require('pino');

class Logger {
  static create() {
    return pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
          messageFormat: '{msg}'
        }
      }
    });
  }
}

module.exports = Logger;
```

### 4. Core City Processing

**runner/lib/CityProcessor.js**:
```javascript
const { execSync } = require('child_process');
const path = require('path');
const FileManager = require('./FileManager');
const QualityChecker = require('./QualityChecker');

class CityProcessor {
  constructor({ inputFile, batchSize, delaySeconds, singleCity, logger }) {
    this.config = {
      inputFile,
      batchSize,
      delaySeconds,
      singleCity,
      workingDirectory: '/Users/timothysumerfield/Desktop/Working.../bedder-world-base',
      maxRetries: 3,
      retryDelayMs: 600000, // 10 minutes
      claudeTimeoutMs: 600000 // 10 minutes
    };
    
    this.logger = logger;
    this.fileManager = new FileManager(logger);
    this.qualityChecker = new QualityChecker(logger);
    this.stats = { processed: 0, successful: 0, failed: 0 };
  }

  async run() {
    const cities = await this.fileManager.loadCities(this.config.inputFile);
    const batch = this.filterCities(cities);
    
    this.logger.info(`📋 Loaded ${cities.length} cities from ingest file`);
    this.logger.info(`🎯 Processing ${batch.length} cities`);
    
    for (const city of batch) {
      await this.processSingleCity(city, batch.length);
      this.addDelayBetweenCities(batch.length);
    }
    
    this.logFinalSummary();
  }

  filterCities(cities) {
    if (this.config.singleCity) {
      const targetCity = cities.find(city => 
        city.name.toLowerCase().includes(this.config.singleCity.toLowerCase())
      );
      
      if (!targetCity) {
        throw new Error(`City "${this.config.singleCity}" not found in cities list`);
      }
      
      return [targetCity];
    }
    
    return cities.slice(0, this.config.batchSize);
  }

  async processSingleCity(city, totalCities) {
    this.stats.processed++;
    this.logger.info(`\n🏙️  [${this.stats.processed}/${totalCities}] Starting: ${city.name}, ${city.state}`);
    
    try {
      await this.executeClaudeCommand(city);
      await this.handleQualityValidation(city);
    } catch (error) {
      this.handleCityFailure(city, error);
    }
  }

  async executeClaudeCommand(city) {
    await this.processCity(city);
  }

  async handleQualityValidation(city) {
    const qualityResult = await this.qualityChecker.validate(city);
    
    if (qualityResult.passed) {
      await this.handleSuccessfulCity(city);
    } else {
      await this.handleFailedQuality(city, qualityResult.issues);
    }
  }

  async handleSuccessfulCity(city) {
    await this.fileManager.moveToReports(city, this.config.inputFile);
    this.stats.successful++;
    this.logger.info(`✅ ${city.name} completed successfully`);
  }

  async handleFailedQuality(city, issues) {
    await this.fileManager.moveToReview(city, issues, this.config.inputFile);
    this.stats.failed++;
    this.logger.warn(`⚠️  ${city.name} moved to review: ${issues.join(', ')}`);
  }

  handleCityFailure(city, error) {
    this.stats.failed++;
    this.logger.error(`❌ ${city.name} failed: ${error.message}`);
  }

  async addDelayBetweenCities(totalCities) {
    if (this.stats.processed < totalCities && this.config.delaySeconds > 0) {
      this.logger.info(`⏳ Waiting ${this.config.delaySeconds}s before next city...`);
      await this.sleep(this.config.delaySeconds * 1000);
    }
  }

  logFinalSummary() {
    this.logger.info(`\n📊 Final Summary:`);
    this.logger.info(`   ✅ Successful: ${this.stats.successful}`);
    this.logger.info(`   ⚠️  For Review: ${this.stats.failed}`);
    this.logger.info(`   ❌ Failed: ${this.stats.processed - this.stats.successful - this.stats.failed}`);
  }

  async processCity(city) {
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        this.logger.info(`   🔄 Attempt ${attempt}/${this.config.maxRetries}: Launching ${city.name}`);
        
        await this.executeClaudeGeneration(city);
        await this.buildSiteVerification(city);
        
        return; // Success - exit retry loop
        
      } catch (error) {
        await this.handleRetryAttempt(city, attempt, error);
      }
    }
  }

  async executeClaudeGeneration(city) {
    const command = this.buildClaudeCommand(city);
    
    this.logger.info(`   📝 Running Claude command for ${city.name}...`);
    execSync(command, { 
      stdio: 'pipe',
      timeout: this.config.claudeTimeoutMs,
      encoding: 'utf8'
    });
    
    this.logger.info(`   ✅ Claude processing completed for ${city.name}`);
  }

  buildClaudeCommand(city) {
    const prompt = `Launch ${city.name}, ${city.state} next following all city launch sequences. Focus on deep research, high quality information and prioritize quality over speed. This is a ${city.type} city. Follow all requirements in launch-city.md and content-standards.md.`;
    
    return `cd "${this.config.workingDirectory}" && claude -p bedder-world-cities "${prompt}"`;
  }

  async buildSiteVerification(city) {
    this.logger.info(`   🔨 Building site to verify ${city.name}...`);
    
    execSync('npm run build', { 
      cwd: this.config.workingDirectory,
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    this.logger.info(`   ✅ Build completed for ${city.name}`);
  }

  async handleRetryAttempt(city, attempt, error) {
    this.logger.warn(`   ⚠️  Attempt ${attempt} failed: ${error.message}`);
    
    if (attempt === this.config.maxRetries) {
      throw new Error(`All ${this.config.maxRetries} attempts failed for ${city.name}`);
    }
    
    this.logger.info(`   😴 Sleeping 10 minutes before retry...`);
    await this.sleep(this.config.retryDelayMs);
  }

  sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
}

module.exports = CityProcessor;
```

### 5. Quality Validation Engine

**runner/lib/QualityChecker.js**:
```javascript
const fs = require('fs-extra');
const path = require('path');

class QualityChecker {
  constructor(logger) {
    this.logger = logger;
    this.config = {
      workingDirectory: '/Users/timothysumerfield/Desktop/Working.../bedder-world-base',
      rules: {
        phoneNumber: /720-263-6094/g,
        nextDayShipping: /next[- ]?day/gi,
        minimumWords: 2400,
        forbiddenSameDay: /same[- ]?day\s+(pickup|service|delivery)/gi
      }
    };
  }

  async validate(city) {
    const result = this.createValidationResult();
    
    try {
      this.logger.info(`   🔍 Running quality checks for ${city.name}...`);
      
      const cityPaths = this.buildCityPaths(city);
      const content = await this.loadCityContent(cityPaths.source, result);
      
      if (content) {
        this.validateContent(content, result);
        await this.validateBuiltPage(cityPaths.built, result);
      }
      
      this.logValidationResults(city, result);
      
    } catch (error) {
      this.addIssue(result, `Quality check error: ${error.message}`);
    }
    
    return result;
  }

  createValidationResult() {
    return { passed: true, issues: [] };
  }

  buildCityPaths(city) {
    const citySlug = this.slugify(city.name);
    const stateSlug = this.slugify(city.state);
    
    return {
      source: path.join(this.config.workingDirectory, 'src', 'mattress-removal', stateSlug, `${citySlug}.md`),
      built: path.join(this.config.workingDirectory, 'dist', 'mattress-removal', stateSlug, citySlug, 'index.html')
    };
  }

  async loadCityContent(cityFilePath, result) {
    if (!await fs.pathExists(cityFilePath)) {
      this.addIssue(result, 'City file not created');
      return null;
    }
    
    return await fs.readFile(cityFilePath, 'utf-8');
  }

  validateContent(content, result) {
    this.validatePhoneNumber(content, result);
    this.validateShippingLanguage(content, result);
    this.validateWordCount(content, result);
  }

  validatePhoneNumber(content, result) {
    if (!this.config.rules.phoneNumber.test(content)) {
      this.addIssue(result, 'Missing or incorrect phone number (720-263-6094)');
    }
  }

  validateShippingLanguage(content, result) {
    if (!this.config.rules.nextDayShipping.test(content)) {
      this.addIssue(result, 'Missing next-day shipping language');
    }
    
    if (this.config.rules.forbiddenSameDay.test(content)) {
      this.addIssue(result, 'Contains forbidden same-day language');
    }
  }

  validateWordCount(content, result) {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    if (words.length < this.config.rules.minimumWords) {
      this.addIssue(result, `Word count too low: ${words.length} (minimum ${this.config.rules.minimumWords})`);
    }
  }

  async validateBuiltPage(builtPagePath, result) {
    if (!await fs.pathExists(builtPagePath)) {
      this.addIssue(result, 'Built page not found in dist directory');
    }
  }

  logValidationResults(city, result) {
    if (result.passed) {
      this.logger.info(`   ✅ Quality checks passed for ${city.name}`);
    } else {
      this.logger.warn(`   ❌ Quality checks failed for ${city.name}: ${result.issues.join(', ')}`);
    }
  }

  addIssue(result, issue) {
    result.passed = false;
    result.issues.push(issue);
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

module.exports = QualityChecker;
```

### 6. File Management System

**runner/lib/FileManager.js**:
```javascript
const fs = require('fs-extra');
const path = require('path');

class FileManager {
  constructor(logger) {
    this.logger = logger;
  }

  async loadCities(inputFile) {
    this.logger.info(`📖 Loading cities from ${inputFile}...`);
    
    const content = await fs.readFile(inputFile, 'utf-8');
    const cities = [];
    let currentState = '';
    
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // State header: # StateName
      if (trimmedLine.startsWith('# ') && trimmedLine.length > 2) {
        currentState = trimmedLine.substring(2).trim();
        continue;
      }
      
      // City entry: - [ ] **CityName**
      const cityMatch = trimmedLine.match(/^-\s*\[\s*\]\s*\*\*([^*]+)\*\*/);
      if (cityMatch && currentState) {
        const cityName = cityMatch[1].trim();
        const cityType = this.guessCityType(cityName, currentState);
        
        cities.push({
          name: cityName,
          state: currentState,
          type: cityType,
          originalLine: line // Keep original for removal
        });
      }
    }
    
    this.logger.info(`📋 Loaded ${cities.length} cities from ${currentState ? 'multiple states' : 'file'}`);
    return cities;
  }

  async moveToReports(city, inputFile) {
    // Remove from ingest
    await this.removeCityFromIngest(city, inputFile);
    
    // Add to reports
    const reportsFile = inputFile.replace('/ingest/', '/reports/');
    await this.appendCityToFile(city, reportsFile, '✅ COMPLETED');
    
    this.logger.info(`   📝 Moved ${city.name} to reports`);
  }

  async moveToReview(city, issues, inputFile) {
    // Remove from ingest
    await this.removeCityFromIngest(city, inputFile);
    
    // Add to review with issues
    const reviewFile = inputFile.replace('/ingest/', '/for-review/');
    const issueText = issues.length > 0 ? ` (Issues: ${issues.join(', ')})` : '';
    await this.appendCityToFile(city, reviewFile, '⚠️ NEEDS REVIEW', issueText);
    
    this.logger.info(`   🔍 Moved ${city.name} to review queue`);
  }

  async removeCityFromIngest(city, inputFile) {
    const content = await fs.readFile(inputFile, 'utf-8');
    const lines = content.split('\n');
    
    // Find and remove the city's original line
    const updatedLines = lines.filter(line => line !== city.originalLine);
    
    await fs.writeFile(inputFile, updatedLines.join('\n'));
  }

  async appendCityToFile(city, filePath, status, additionalInfo = '') {
    await fs.ensureFile(filePath);
    
    const timestamp = new Date().toISOString();
    const entry = `${status} **${city.name}**, ${city.state} - ${timestamp}${additionalInfo}\n`;
    
    await fs.appendFile(filePath, entry);
  }

  guessCityType(cityName, stateName) {
    // Simple heuristics for city classification
    const majorCities = ['Phoenix', 'Los Angeles', 'Chicago', 'Houston', 'Dallas', 'Austin', 'Denver', 'Philadelphia'];
    const collegeTowns = ['Boulder', 'Flagstaff', 'Conway', 'Davis', 'Palo Alto'];
    
    if (majorCities.includes(cityName)) {
      return 'metro';
    }
    
    if (collegeTowns.includes(cityName)) {
      return 'college';
    }
    
    // Default to metro
    return 'metro';
  }
}

module.exports = FileManager;
```

### 7. Cities Ingest File

**runner/files/ingest/cities.md**:
```markdown
# Arkansas
- [ ] **Fayetteville**
- [ ] **Fort Smith**
- [ ] **Rogers**
- [ ] **Springdale**

# California
- [ ] **Sacramento**
- [ ] **San Diego**
- [ ] **San Francisco**
- [ ] **Anaheim**
- [ ] **Costa Mesa**
- [ ] **Downey**
- [ ] **El Monte**
- [ ] **Fullerton**
[... remaining 740+ cities ...]

# Colorado
- [ ] **Boulder**
- [ ] **Colorado Springs**
- [ ] **Fort Collins**
[... etc ...]
```

## Usage

### Setup
```bash
cd runner
npm install
```

### Run City Launcher
```bash
# Process single city by name
node ./runner/generate-cities.js --file ./runner/files/ingest/cities.md --single "Denver"

# Process cities from ingest file (batch mode)
node ./runner/generate-cities.js --file ./runner/files/ingest/cities.md

# Custom batch size and delay
node ./runner/generate-cities.js --file ./runner/files/ingest/cities.md --batch 5 --delay 60

# Large batch processing
node ./runner/generate-cities.js --file ./runner/files/ingest/cities.md --batch 20 --delay 30
```

## Quality Controls

### Automated Heuristics
- **Phone Number**: Must contain `720-263-6094`
- **Service Timing**: Must contain "next-day" language variants
- **Forbidden Content**: Cannot contain "same-day pickup/service/delivery"
- **Word Count**: Minimum 2,400 words
- **Build Verification**: Confirms page exists in `dist/` directory

### File Flow Management
- **Ingest**: `runner/files/ingest/cities.md` - Cities to process
- **Reports**: `runner/files/reports/cities.md` - Successfully completed
- **Review**: `runner/files/for-review/cities.md` - Failed quality checks

### Error Recovery
- Cities remain in ingest until fully validated
- Failed Claude commands retry 3 times with 10-minute delays
- Quality failures move to review queue for manual inspection
- Process can be restarted safely without duplicate work

## Monitoring

### Human-Readable Logging
```
🚀 Starting City Launch Runner
📁 Input file: ./runner/files/ingest/cities.md
📊 Batch size: 10
⏱️  Delay: 30s between cities

📋 Loaded 774 cities from ingest file
🎯 Processing batch of 10 cities

🏙️  [1/10] Starting: Fayetteville, Arkansas
   🔄 Attempt 1/3: Launching Fayetteville
   📝 Running Claude command for Fayetteville...
   ✅ Claude processing completed for Fayetteville
   🔨 Building site to verify Fayetteville...
   ✅ Build completed for Fayetteville
   🔍 Running quality checks for Fayetteville...
   ✅ Quality checks passed for Fayetteville
   📝 Moved Fayetteville to reports
✅ Fayetteville completed successfully

📊 Batch Summary:
   ✅ Successful: 8
   ⚠️  For Review: 2
   ❌ Failed: 0
```

## Implementation Timeline

**774 cities × 10-15 minutes average = 130-195 hours**

**Realistic Schedule**:
- 20 cities/day with quality verification
- 39 working days = ~8 weeks
- **Target completion: 2 months**

The Node.js implementation provides robust error handling, comprehensive logging, and systematic quality validation while maintaining the project's high content standards.

## Runner Completeness Evaluation Criteria

### Core Functionality (30 points)
- **✓ CLI Interface** (5 pts): Commander.js integration with proper argument parsing
- **✓ Single City Mode** (5 pts): `--single` flag correctly filters and processes one city
- **✓ Batch Processing** (5 pts): Multiple cities with configurable batch size
- **✓ Claude CLI Integration** (10 pts): Proper command execution with working directory
- **✓ Error Handling** (5 pts): Retry logic, timeouts, graceful failures

### DRY Code Architecture (25 points)
- **✓ Config Centralization** (5 pts): Single config object eliminates magic numbers
- **✓ Method Decomposition** (10 pts): Large methods broken into focused functions
- **✓ Reusable Components** (5 pts): Common logic extracted to shared methods
- **✓ Class Separation** (5 pts): Clear separation of concerns between classes

### Quality Validation (20 points)
- **✓ File Existence Checks** (5 pts): Source and built files validated
- **✓ Content Validation** (10 pts): Phone number, shipping language, word count
- **✓ Build Verification** (5 pts): Site builds successfully after generation

### File Management (15 points)
- **✓ State Tracking** (5 pts): Cities move between ingest/reports/review
- **✓ Atomic Operations** (5 pts): Safe file operations with error recovery
- **✓ City Parsing** (5 pts): Accurate extraction from markdown format

### Logging & Monitoring (10 points)
- **✓ Human-Readable Output** (5 pts): Pino-pretty integration with clear formatting
- **✓ Progress Tracking** (3 pts): Real-time status updates with emoji indicators
- **✓ Summary Statistics** (2 pts): Final batch summary with success/failure counts

### Total Score: __/100 points

**Completeness Threshold**: 85+ points = Production ready
**Current Status**: Requires implementation and testing to evaluate