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
        
        cities.push({
          name: cityName,
          state: currentState,
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

}

module.exports = FileManager;