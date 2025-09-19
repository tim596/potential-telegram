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
    
    const content = await fs.readFile(cityFilePath, 'utf-8');
    
    if (content.trim().length < 100) {
      this.addIssue(result, 'City file is empty or too short');
      return null;
    }
    
    return content;
  }

  validateContent(content, result) {
    this.validatePhoneNumber(content, result);
    this.validateShippingLanguage(content, result);
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