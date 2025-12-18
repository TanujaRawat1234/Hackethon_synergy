const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'all-logs.log');

// Simple logger implementation
const logger = {
  info: (message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} INFO: ${message} ${args.length ? JSON.stringify(args) : ''}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(logFile, logMessage);
  },
  
  error: (message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} ERROR: ${message} ${args.length ? JSON.stringify(args) : ''}\n`;
    console.error(logMessage.trim());
    fs.appendFileSync(logFile, logMessage);
  },
  
  warn: (message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} WARN: ${message} ${args.length ? JSON.stringify(args) : ''}\n`;
    console.warn(logMessage.trim());
    fs.appendFileSync(logFile, logMessage);
  },
  
  debug: (message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} DEBUG: ${message} ${args.length ? JSON.stringify(args) : ''}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(logFile, logMessage);
  }
};

module.exports = logger;