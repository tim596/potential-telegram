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