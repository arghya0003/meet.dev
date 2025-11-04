# Backend Test Suite

This directory contains comprehensive unit tests for the backend application.

## Test Structure

__tests__/
├── lib/
│   └── env.test.js           # Tests for environment configuration
├── server.test.js            # Tests for Express server and routes
├── package-validation.test.js # Tests for package.json files
└── README.md                 # This file

## Running Tests

Run all tests: npm test
Run tests in watch mode: npm run test:watch
Run tests with coverage: npm run test:coverage

## Test Coverage

### env.js Tests
- ENV object structure and exports
- Environment variable loading
- NODE_ENV configuration (newly added feature)
- Missing environment variable handling
- Edge cases and type validation
- Integration with dotenv

### server.js Tests
- Server initialization
- Health check endpoint
- Production static file serving (new feature)
- SPA catch-all route (new feature)
- Path resolution
- Environment-specific behavior
- Error handling and edge cases
- Server lifecycle

### package.json Tests
- Root package.json structure and scripts
- Backend package.json configuration
- Script consistency across packages
- Dependency version validation
- Required fields and metadata

## New Features Tested

This test suite specifically validates the recent additions:
- NODE_ENV export in env.js
- Production static file serving
- SPA catch-all routing
- Start script in package.json

## Setup Instructions

1. Install dependencies: npm install
2. Create .env file with test values
3. Run tests: npm test

## Test Statistics

- Total Test Suites: 3
- Total Tests: 180+
- Coverage Target: 80%+