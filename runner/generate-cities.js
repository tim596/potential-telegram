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
  .option('--dry-run', 'Print commands without executing them')
  .parse();

async function main() {
  const options = program.opts();
  const logger = Logger.create();
  
  logger.info('🚀 Starting City Launch Runner');
  logger.info(`📁 Input file: ${options.file}`);
  
  if (options.dryRun) {
    logger.info('🧪 DRY RUN MODE - No files will be created or commands executed');
  }
  
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
    dryRun: options.dryRun || false,
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