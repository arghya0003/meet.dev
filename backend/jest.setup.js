/**
 * Jest Setup File
 * 
 * Global test configuration and setup
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '3000';
process.env.DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/test';

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };