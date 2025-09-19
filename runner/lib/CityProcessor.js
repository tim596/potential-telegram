const { execSync } = require('child_process');
const path = require('path');
const FileManager = require('./FileManager');
const QualityChecker = require('./QualityChecker');
const WebResearchGenerator = require('./WebResearchGenerator');

class CityProcessor {
  constructor({ inputFile, batchSize, delaySeconds, singleCity, dryRun, logger }) {
    this.config = {
      inputFile,
      batchSize,
      delaySeconds,
      singleCity,
      dryRun: dryRun || false,
      workingDirectory: '/Users/timothysumerfield/Desktop/Working.../bedder-world-base',
      maxRetries: 3,
      retryDelayMs: 600000, // 10 minutes
      claudeTimeoutMs: 600000 // 10 minutes
    };
    
    this.logger = logger;
    this.fileManager = new FileManager(logger);
    this.qualityChecker = new QualityChecker(logger);
    this.cityGenerator = new WebResearchGenerator(logger);
    this.stats = { processed: 0, successful: 0, failed: 0 };
  }

  async run() {
    const cities = await this.fileManager.loadCities(this.config.inputFile);
    const batch = this.filterCities(cities);
    
    this.logger.info(`📋 Loaded ${cities.length} cities from ingest file`);
    this.logger.info(`🎯 Processing ${batch.length} cities`);
    
    for (const city of batch) {
      await this.processSingleCity(city, batch.length);
      await this.addDelayBetweenCities(batch.length);
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
        
        this.logger.info(`   📝 Step 1/2: Generating quality content with research-based approach...`);
        await this.executeLaunchCityGeneration(city);
        this.logger.info(`   ✅ Content generation completed for ${city.name}`);
        
        this.logger.info(`   🔨 Step 2/2: Building and verifying site...`);
        await this.buildSiteVerification(city);
        this.logger.info(`   ✅ Site build verification completed for ${city.name}`);
        
        return; // Success - exit retry loop
        
      } catch (error) {
        await this.handleRetryAttempt(city, attempt, error);
      }
    }
  }

  async executeClaudeGeneration(city) {
    const { promptFile, outputFile, prompt } = this.buildClaudeCommand(city);
    const fs = require('fs-extra');
    const path = require('path');
    
    // Calculate file paths for dry-run display
    const stateSlug = this.slugify(city.state);
    const citySlug = this.slugify(city.name);
    const cityFilePath = path.join(
      this.config.workingDirectory,
      'src',
      'mattress-removal',
      stateSlug,
      `${citySlug}.md`
    );
    
    const command = `cd "${this.config.workingDirectory}" && claude --print --allowedTools "WebSearch,WebFetch" --max-turns 50 < "${promptFile}" > "${outputFile}"`;
    
    if (this.config.dryRun) {
      this.logger.info(`   🧪 [DRY RUN] Claude command for ${city.name}:`);
      this.logger.info(`     Command: ${command}`);
      this.logger.info(`     Prompt file: ${promptFile}`);
      this.logger.info(`     Output file: ${outputFile}`);
      this.logger.info(`     City file would be created at: ${cityFilePath}`);
      this.logger.info(`     Full prompt content:`);
      this.logger.info(`\n${prompt}\n`);
      return;
    }
    
    try {
      // Write prompt to file
      this.logger.info(`   📄 Writing prompt to temporary file...`);
      await fs.writeFile(promptFile, prompt);
      
      this.logger.info(`   🤖 Executing Claude CLI (max-turns: 50, timeout: ${this.config.claudeTimeoutMs/1000}s)...`);
      this.logger.info(`   ⏳ This may take several minutes for quality content generation...`);
      
      // Execute claude with file input
      execSync(command, { 
        stdio: 'pipe',
        timeout: this.config.claudeTimeoutMs,
        encoding: 'utf8'
      });
      
      this.logger.info(`   📥 Claude execution completed, processing output...`);
      
      // Read Claude's output and create the actual city file
      if (await fs.pathExists(outputFile)) {
        const claudeContent = await fs.readFile(outputFile, 'utf8');
        
        // Check if content is valid (not just error message)
        if (claudeContent.trim().length < 100 || claudeContent.includes('Execution error')) {
          throw new Error(`Claude returned insufficient content: ${claudeContent.substring(0, 100)}...`);
        }
        
        // Create the actual city file
        this.logger.info(`   📁 Creating directory structure for ${city.name}...`);
        await fs.ensureDir(path.dirname(cityFilePath));
        
        this.logger.info(`   💾 Writing city file: ${cityFilePath.split('/').pop()}`);
        await fs.writeFile(cityFilePath, claudeContent);
        
        this.logger.info(`   📊 Generated ${claudeContent.length} characters of content for ${city.name}`);
        
        this.logger.info(`   ✅ City file successfully created for ${city.name}`);
      } else {
        throw new Error(`Claude output file not found: ${outputFile}`);
      }
    } finally {
      // Clean up temp files
      if (await fs.pathExists(promptFile)) await fs.remove(promptFile);
      if (await fs.pathExists(outputFile)) await fs.remove(outputFile);
    }
  }

  async executeLaunchCityGeneration(city) {
    const path = require('path');
    
    // Calculate file path
    const stateSlug = this.slugify(city.state);
    const citySlug = this.slugify(city.name);
    const cityFilePath = path.join(
      this.config.workingDirectory,
      'src',
      'mattress-removal',
      stateSlug,
      `${citySlug}.md`
    );
    
    if (this.config.dryRun) {
      this.logger.info(`   🧪 [DRY RUN] LaunchCity generation for ${city.name}:`);
      this.logger.info(`     City file would be created at: ${cityFilePath}`);
      this.logger.info(`     Using research-based content generation`);
      return;
    }
    
    try {
      // Use our LaunchCityGenerator for quality, researched content
      const generatedFilePath = await this.cityGenerator.generateCityFile(city);
      
      // Read the generated content to report stats
      const fs = require('fs-extra');
      const content = await fs.readFile(generatedFilePath, 'utf8');
      
      this.logger.info(`   📊 Generated ${content.length} characters of quality content for ${city.name}`);
      this.logger.info(`   ✅ City file successfully created for ${city.name}`);
      
    } catch (error) {
      throw new Error(`LaunchCity generation failed for ${city.name}: ${error.message}`);
    }
  }

  buildClaudeCommand(city) {
    const outputFile = `/tmp/claude_output_${city.name.toLowerCase().replace(/\s+/g, '_')}.md`;
    const promptFile = `/tmp/claude_prompt_${city.name.toLowerCase().replace(/\s+/g, '_')}.txt`;
    
    const launchCityRequirements = `# City Launch Checklist

## ⚠️ CRITICAL: QUALITY-FIRST APPROACH
**MANDATORY**: Never create pages in bulk or batches. Each city must be completed individually with full quality verification before starting the next city.

### 🎯 **QUALITY OVER SPEED - NON-NEGOTIABLE RULES**
- **Take time for research**: Understand each city's unique character, challenges, and community features
- **Write original content**: Every section must be genuinely unique and valuable to users
- **Focus on user needs**: Content should genuinely help people in that specific city
- **Verify all details**: Check neighborhood names, ZIP codes, local regulations, and facilities
- **Test thoroughly**: Build site and verify content displays correctly before marking complete
- **One city excellence** is better than multiple rushed pages that need fixes later

## Research Phase
- **MANDATORY: Research unique city characteristics and positioning** (different from all existing pages)
- Identify 15-20 specific neighborhoods with ZIP codes

### **🎯 MANDATORY: "Same Facts, Different Angles" for Key Sections**
- **Collect factual base data**: Waste company name, recycling facilities, regulations, stewardship program details
- **Identify city's unique context**: What makes THIS city's residents experience these facts differently? (tech growth, university, geography, housing types, economic drivers, etc.)
- **Write through local lens**: Present same facts but explain WHY they matter to THIS city specifically and what unique challenges/benefits they create for local residents

### **🔧 CRITICAL: Waste Management & Recycling Infrastructure Research**
- **MANDATORY: Research local waste management companies** (EDCO, Republic Services, Waste Management, etc.)
- **MANDATORY: Identify specific mattress recycling facilities in the area**
- **MANDATORY: Research county/city mattress disposal regulations** (wrapping requirements, licensed haulers)
- **MANDATORY: Find local Bye Bye Mattress program details or state recycling programs**
- **MANDATORY: Locate licensed disposal sites and transfer stations**
- **MANDATORY: Research environmental compliance requirements** (documentation, preparation)
- **USER FOCUS: How does this impact actual customer experience?** (pickup requirements, preparation steps)

## Content Generation - Excellence Standards
- **MANDATORY: Write completely original content from scratch** (NO template language or copy-paste)
- **RESEARCH-DRIVEN CONTENT**: Use genuine city knowledge to create truly helpful, location-specific content
- **USER-FOCUSED VALUE**: Every paragraph should answer real questions people have about mattress removal in this city

### **🎨 CRITICAL: Writing Style Variation**
- **VARY SENTENCE STRUCTURES**: Different opening approaches, paragraph lengths, transitions between cities
- **VARY EMPHASIS POINTS**: Lead with community values vs. programs vs. environmental benefits (rotate approaches)
- **VARY VOICE & RHYTHM**: Mix active/passive voice, short/long sentences, different organizational patterns
- **UNIQUE COMMUNITY CONNECTIONS**: Same facts (EDCO, county programs) but different community tie-ins
- **NO REPETITIVE PHRASING**: Avoid identical sentence patterns from other cities (even if facts are similar)

- **CONCISE CONTENT RULE: Maximum 20 words per sentence, focus on clarity over length**
- **NO FILLER WORDS: Avoid "comprehensive," "sophisticated," "extensive," "thoroughly," "discrete"**
- **CRITICAL: Create unique city positioning** (different character/focus from all other pages)
- **QUALITY CHECK**: Read content aloud - does it sound natural and genuinely helpful?
- Create 3 authentic customer reviews focused on **mattress removal service experience** - NOT city lifestyle (**completely unique scenarios**)
  - **CRITICAL: Reviews must sound like real customers describing actual mattress pickup experiences**
  - **Focus on service details**: timing, team professionalism, logistics, pricing satisfaction
  - **Avoid city tourism language**: No "I love living here" or city promotional content
  - **Casual, conversational tone**: Use natural language, contractions, everyday speech patterns
  - **Specific service scenarios**: Moving situations, home renovations, bed replacements, apartment turnovers
  - **Real logistics details**: Stairs, elevators, parking, scheduling, team coordination
  - **Neighborhood mentions**: Include area names naturally in context, not as city promotion
  - **UNIQUE OPENINGS**: Avoid repetitive starter phrases across cities ("Called them," "Had an old," "We needed")
- Write 8 service-focused FAQs with practical customer questions (**6+ service-focused, 1-2 location-specific max**)
  - **CORE TOPICS**: Pricing, scheduling, service area coverage, what's included, licensing/insurance
  - **PRACTICAL QUESTIONS**: "How quickly can you pick up?", "Do you handle upstairs?", "What's included?"
  - **AVOID**: Extensive city details, cultural information, historical context
- Optimize content for "[City] mattress removal" and related keywords (**natural, non-repetitive**)

## 🏆 HIGH-QUALITY SEO DOMINANCE RULES

### Core Quality Principles
- **USER-FIRST CONTENT**: Every sentence must provide genuine value to users searching for mattress removal
- **SEARCH INTENT FULFILLMENT**: Answer what users actually want to know, not what we want to say
- **ACTIONABLE INFORMATION**: Include specific details users can act on (pricing, timing, process)
- **LOCAL RELEVANCE**: Connect service to genuine local needs, challenges, or benefits
- **EXPERTISE DEMONSTRATION**: Show knowledge through specific details, not generic claims

### Uniqueness Mandates  
- **80%+ UNIQUE CONTENT**: Every city must be <30% similar to any existing city page
- **UNIQUE ANGLES**: Each city needs a distinct angle/focus that no other city uses
- **NO CONTENT RECYCLING**: Never reuse paragraphs, sentences, or even phrase structures
- **VARIED SENTENCE STRUCTURE**: Different opening patterns, lengths, and flow from all other cities
- **ORIGINAL EXAMPLES**: All scenarios, benefits, and descriptions must be city-specific

### Content Quality Standards
- **SPECIFIC > GENERIC**: "Navigate narrow Victorian staircases" vs "handle all access challenges" 
- **CONCRETE > ABSTRACT**: "Coordinate with HOA security gates" vs "work with community guidelines"
- **PRACTICAL > PROMOTIONAL**: "Next-day pickup for $125" vs "unmatched service excellence"  
- **INFORMATIVE > MARKETING**: Focus on what, when, how, where - not why we're amazing
- **SCANNABLE**: Use short paragraphs, bullet points, clear structure for mobile users

### Anti-Spam/Anti-Pattern Rules
- **NO KEYWORD STUFFING**: City name should appear naturally, not forced repeatedly
- **NO SUPERLATIVE OVERUSE**: Avoid "best," "premier," "#1," "leading" unless genuinely differentiated
- **NO GENERIC BENEFIT LISTS**: Skip "licensed, insured, eco-friendly" unless explaining why it matters locally
- **NO FAKE URGENCY**: Avoid "call now," "limited time," or manufactured scarcity tactics
- **NO MANUFACTURED AUTHORITY**: Skip "years of experience" claims unless specific and relevant

### Local Value Integration
- **GENUINE LOCAL KNOWLEDGE**: Mention specific landmarks, geography, or local quirks that show real familiarity  
- **LOCAL PROBLEM SOLVING**: Address actual challenges residents face (parking, building types, regulations)
- **COMMUNITY CONNECTION**: Reference local waste programs, regulations, or environmental initiatives
- **NEIGHBORHOOD AUTHENTICITY**: Use actual neighborhood names in context, not as keyword dropping
- **NO DEMOGRAPHIC/ETHNICITY REFERENCES**: Avoid mentioning racial, ethnic, or demographic characteristics unless directly service-relevant (e.g., multilingual support needs)
- **SEASONAL/TEMPORAL RELEVANCE**: Include factors like weather, traffic patterns, local events that affect service

### Content Structure Excellence
- **FRONT-LOADED VALUE**: Most important information in first 100 words
- **LOGICAL FLOW**: Information organized by user decision-making process
- **SCANNABLE HIERARCHY**: Clear headings that guide users to what they need
- **MOBILE-OPTIMIZED**: Short sentences, brief paragraphs, easy thumb scrolling
- **FAQ INTEGRATION**: Address real questions users have about mattress removal process

## Technical Implementation  
- **CENTRALIZED TEMPLATE ONLY: Use layout: location.njk in frontmatter**
- **FRONTMATTER DATA ONLY: Provide only YAML frontmatter with all required fields**
- **NO MARKDOWN CONTENT: All content goes in pageContent: frontmatter section**
- **NO HTML: Template handles all HTML structure automatically**
- **NO CSS: All styling is centralized in template**
- Add complete frontmatter with coordinates, neighborhoods, pricing
- **Add pageContent: section with city-specific content variables**`;

    const prompt = `You are a markdown file generator. Your ONLY job is to output raw markdown file content for ${city.name}, ${city.state}.

${launchCityRequirements}

You MUST use the EXACT template structure from Denver's source page (/src/mattress-removal/colorado/denver.md) - DO NOT use basic Markdown format, DO NOT create your own template.

Generate a COMPLETE markdown file with:
- Frontmatter: layout: location.njk, title, description, permalink, city, state, stateSlug, tier, coordinates, pricing, pageContent, neighborhoods, zipCodes, nearbyCities, reviews: {count: featured: []}, faqs
- Phone number: 720-263-6094 throughout
- Next-day language (never same-day)  
- Unique ${city.name}-specific research: real neighborhoods, ZIP codes, local details
- 3 unique customer reviews about mattress removal service
- 8 location-specific FAQs
- Minimum 1000+ words of unique, researched content

⚠️ CRITICAL OUTPUT INSTRUCTIONS:
- Do NOT write "I have researched..." or "Research completed" or any explanatory text
- Do NOT write summaries, introductions, or conclusions
- Do NOT write "Here is the content..." or similar phrases
- Your response must start with "---" and end with the last line of the markdown file
- Output ONLY the raw markdown content that would be saved directly to a .md file
- Think of yourself as a markdown file generator, not a conversational assistant

BEGIN MARKDOWN FILE OUTPUT NOW:`;
    
    return { promptFile, outputFile, prompt };
  }

  async buildSiteVerification(city) {
    const buildCommand = 'npm run build';
    
    if (this.config.dryRun) {
      this.logger.info(`   🧪 [DRY RUN] Build verification for ${city.name}:`);
      this.logger.info(`     Command: ${buildCommand}`);
      this.logger.info(`     Working directory: ${this.config.workingDirectory}`);
      return;
    }
    
    this.logger.info(`   🔨 Running site build to verify ${city.name} page...`);
    this.logger.info(`   ⚙️  Executing: ${buildCommand}`);
    
    const startTime = Date.now();
    execSync(buildCommand, { 
      cwd: this.config.workingDirectory,
      stdio: 'pipe',
      encoding: 'utf8'
    });
    const buildTime = Date.now() - startTime;
    
    this.logger.info(`   ⏱️  Build completed in ${buildTime}ms`);
    this.logger.info(`   ✅ Site build verification successful for ${city.name}`);
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

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

module.exports = CityProcessor;