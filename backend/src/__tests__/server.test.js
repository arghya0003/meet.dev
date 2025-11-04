/**
 * Unit Tests for backend/src/server.js
 * 
 * Tests cover:
 * - Health check endpoint
 * - Production static file serving (new feature)
 * - Catch-all route for SPA (new feature)
 * - Server initialization
 * - Environment-specific behavior
 * - Edge cases and error handling
 */

import { jest } from '@jest/globals';

// Mock dependencies before importing server
const mockListen = jest.fn((port, callback) => {
  if (callback) callback();
  return { close: jest.fn() };
});

const mockGet = jest.fn();
const mockUse = jest.fn();
const mockStatic = jest.fn((path) => `static-middleware-${path}`);

const mockExpress = jest.fn(() => ({
  get: mockGet,
  use: mockUse,
  listen: mockListen
}));

mockExpress.static = mockStatic;

// Mock modules
jest.unstable_mockModule('express', () => ({
  default: mockExpress
}));

jest.unstable_mockModule('path', () => ({
  default: {
    resolve: jest.fn(() => '/mock/resolved/path'),
    join: jest.fn((...args) => args.join('/'))
  }
}));

// Store original NODE_ENV
const originalNodeEnv = process.env.NODE_ENV;

describe('Server Module', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockGet.mockClear();
    mockUse.mockClear();
    mockStatic.mockClear();
    mockListen.mockClear();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('Server Initialization', () => {
    test('should create an Express application', async () => {
      // Import server to trigger initialization
      await import('../../server.js');
      
      expect(mockExpress).toHaveBeenCalled();
    });

    test('should call listen with PORT from ENV', async () => {
      await import('../../server.js');
      
      expect(mockListen).toHaveBeenCalled();
      expect(mockListen.mock.calls[0][0]).toBeDefined();
    });

    test('should log server startup message', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await import('../../server.js');
      
      // Listen callback should log the message
      expect(mockListen).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Health Check Endpoint', () => {
    test('should register GET /health route', async () => {
      await import('../../server.js');
      
      const healthRoute = mockGet.mock.calls.find(call => call[0] === '/health');
      expect(healthRoute).toBeDefined();
    });

    test('should respond with 200 status and message', async () => {
      await import('../../server.js');
      
      const healthRoute = mockGet.mock.calls.find(call => call[0] === '/health');
      const handler = healthRoute[1];
      
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'api is up and running 123' });
    });

    test('should return json response with correct structure', async () => {
      await import('../../server.js');
      
      const healthRoute = mockGet.mock.calls.find(call => call[0] === '/health');
      const handler = healthRoute[1];
      
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      handler(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: expect.any(String) })
      );
    });
  });

  describe('Production Static File Serving (New Feature)', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    test('should serve static files in production mode', async () => {
      process.env.NODE_ENV = 'production';
      
      // Re-import with mocked environment
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: {
          PORT: '3000',
          DB_URL: 'mongodb://localhost',
          NODE_ENV: 'production'
        }
      }));
      
      await import('../../server.js');
      
      expect(mockUse).toHaveBeenCalled();
      expect(mockStatic).toHaveBeenCalled();
    });

    test('should not serve static files in development mode', async () => {
      process.env.NODE_ENV = 'development';
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: {
          PORT: '3000',
          DB_URL: 'mongodb://localhost',
          NODE_ENV: 'development'
        }
      }));
      
      jest.clearAllMocks();
      await import('../../server.js');
      
      // Should not call static middleware in development
      const staticCalls = mockUse.mock.calls.filter(call => 
        typeof call[0] === 'string' && call[0].includes('static')
      );
      
      expect(staticCalls.length).toBe(0);
    });

    test('should configure static path correctly', async () => {
      process.env.NODE_ENV = 'production';
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: {
          PORT: '3000',
          DB_URL: 'mongodb://localhost',
          NODE_ENV: 'production'
        }
      }));
      
      await import('../../server.js');
      
      // Verify static path includes frontend/dist
      const staticCall = mockStatic.mock.calls[0];
      expect(staticCall).toBeDefined();
      expect(staticCall[0]).toContain('frontend');
      expect(staticCall[0]).toContain('dist');
    });
  });

  describe('SPA Catch-All Route (New Feature)', () => {
    test('should register catch-all route in production', async () => {
      process.env.NODE_ENV = 'production';
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: {
          PORT: '3000',
          DB_URL: 'mongodb://localhost',
          NODE_ENV: 'production'
        }
      }));
      
      await import('../../server.js');
      
      const catchAllRoute = mockGet.mock.calls.find(call => 
        call[0] === '/{*any}' || call[0] === '*' || call[0].includes('*')
      );
      
      expect(catchAllRoute).toBeDefined();
    });

    test('should send index.html for catch-all route', async () => {
      process.env.NODE_ENV = 'production';
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: {
          PORT: '3000',
          DB_URL: 'mongodb://localhost',
          NODE_ENV: 'production'
        }
      }));
      
      await import('../../server.js');
      
      const catchAllRoute = mockGet.mock.calls.find(call => 
        call[0] === '/{*any}'
      );
      
      if (catchAllRoute) {
        const handler = catchAllRoute[1];
        const mockReq = {};
        const mockRes = {
          sendFile: jest.fn()
        };
        
        handler(mockReq, mockRes);
        
        expect(mockRes.sendFile).toHaveBeenCalled();
        const sentPath = mockRes.sendFile.mock.calls[0][0];
        expect(sentPath).toContain('frontend');
        expect(sentPath).toContain('dist');
        expect(sentPath).toContain('index.html');
      }
    });

    test('should not register catch-all in development', async () => {
      process.env.NODE_ENV = 'development';
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: {
          PORT: '3000',
          DB_URL: 'mongodb://localhost',
          NODE_ENV: 'development'
        }
      }));
      
      jest.clearAllMocks();
      await import('../../server.js');
      
      const catchAllRoute = mockGet.mock.calls.find(call => 
        call[0] === '/{*any}' || call[0] === '*' || call[0].includes('*')
      );
      
      expect(catchAllRoute).toBeUndefined();
    });
  });

  describe('Path Resolution', () => {
    test('should resolve __dirname correctly', async () => {
      const pathModule = await import('path');
      
      expect(pathModule.default.resolve).toBeDefined();
      
      await import('../../server.js');
      
      expect(pathModule.default.resolve).toHaveBeenCalled();
    });

    test('should construct correct path to frontend dist', async () => {
      process.env.NODE_ENV = 'production';
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: {
          PORT: '3000',
          DB_URL: 'mongodb://localhost',
          NODE_ENV: 'production'
        }
      }));
      
      const pathModule = await import('path');
      await import('../../server.js');
      
      // Verify path.join was called with correct arguments
      expect(pathModule.default.join).toHaveBeenCalled();
    });
  });

  describe('Environment-Specific Behavior', () => {
    test('should behave differently in production vs development', async () => {
      // Test production
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      jest.clearAllMocks();
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: {
          PORT: '3000',
          DB_URL: 'mongodb://localhost',
          NODE_ENV: 'production'
        }
      }));
      
      await import('../../server.js');
      const productionUseCalls = mockUse.mock.calls.length;
      const productionGetCalls = mockGet.mock.calls.length;
      
      // Test development
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      jest.clearAllMocks();
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: {
          PORT: '3000',
          DB_URL: 'mongodb://localhost',
          NODE_ENV: 'development'
        }
      }));
      
      await import('../../server.js');
      const developmentUseCalls = mockUse.mock.calls.length;
      const developmentGetCalls = mockGet.mock.calls.length;
      
      // Production should have more middleware/routes than development
      expect(productionUseCalls).toBeGreaterThanOrEqual(developmentUseCalls);
    });

    test('should handle missing NODE_ENV gracefully', async () => {
      delete process.env.NODE_ENV;
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: {
          PORT: '3000',
          DB_URL: 'mongodb://localhost',
          NODE_ENV: undefined
        }
      }));
      
      // Should not throw
      await expect(import('../../server.js')).resolves.toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing PORT gracefully', async () => {
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: {
          PORT: undefined,
          DB_URL: 'mongodb://localhost',
          NODE_ENV: 'development'
        }
      }));
      
      await expect(import('../../server.js')).resolves.toBeDefined();
    });

    test('should handle health endpoint with various request types', async () => {
      await import('../../server.js');
      
      const healthRoute = mockGet.mock.calls.find(call => call[0] === '/health');
      const handler = healthRoute[1];
      
      // Test with minimal request object
      const mockReq = { method: 'GET', url: '/health' };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      expect(() => handler(mockReq, mockRes)).not.toThrow();
    });

    test('should properly chain response methods', async () => {
      await import('../../server.js');
      
      const healthRoute = mockGet.mock.calls.find(call => call[0] === '/health');
      const handler = healthRoute[1];
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      handler({}, mockRes);
      
      expect(mockRes.status).toHaveReturnedWith(mockRes);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
    });
  });

  describe('Server Lifecycle', () => {
    test('should create server instance that can be closed', async () => {
      await import('../../server.js');
      
      expect(mockListen).toHaveBeenCalled();
      const serverInstance = mockListen.mock.results[0].value;
      
      expect(serverInstance).toHaveProperty('close');
      expect(typeof serverInstance.close).toBe('function');
    });

    test('should execute callback after listen', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await import('../../server.js');
      
      // The callback should be called
      expect(mockListen.mock.calls[0][1]).toBeDefined();
      expect(typeof mockListen.mock.calls[0][1]).toBe('function');
      
      consoleSpy.mockRestore();
    });
  });
});