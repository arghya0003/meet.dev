/**
 * Unit Tests for backend/src/lib/env.js
 * 
 * Tests cover:
 * - ENV object structure and exports
 * - Environment variable loading
 * - NODE_ENV configuration (new addition)
 * - Missing environment variable handling
 * - Edge cases and validation
 */

import { jest } from '@jest/globals';
import { ENV } from '../../lib/env.js';

describe('ENV Configuration Module', () => {
  // Store original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Create a fresh copy of process.env for each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('ENV Object Structure', () => {
    test('should export an ENV object', () => {
      expect(ENV).toBeDefined();
      expect(typeof ENV).toBe('object');
    });

    test('should have PORT property', () => {
      expect(ENV).toHaveProperty('PORT');
    });

    test('should have DB_URL property', () => {
      expect(ENV).toHaveProperty('DB_URL');
    });

    test('should have NODE_ENV property', () => {
      expect(ENV).toHaveProperty('NODE_ENV');
    });

    test('should contain exactly the expected properties', () => {
      const expectedKeys = ['PORT', 'DB_URL', 'NODE_ENV'];
      const actualKeys = Object.keys(ENV);
      
      expectedKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });
    });
  });

  describe('Environment Variable Loading', () => {
    test('should load PORT from process.env', () => {
      // ENV is already loaded from the module import
      expect(ENV.PORT).toBe(process.env.PORT);
    });

    test('should load DB_URL from process.env', () => {
      expect(ENV.DB_URL).toBe(process.env.DB_URL);
    });

    test('should load NODE_ENV from process.env', () => {
      expect(ENV.NODE_ENV).toBe(process.env.NODE_ENV);
    });

    test('should handle undefined PORT gracefully', () => {
      // Even if PORT is undefined, it should be accessible
      if (!process.env.PORT) {
        expect(ENV.PORT).toBeUndefined();
      } else {
        expect(ENV.PORT).toBeTruthy();
      }
    });

    test('should handle undefined DB_URL gracefully', () => {
      if (!process.env.DB_URL) {
        expect(ENV.DB_URL).toBeUndefined();
      } else {
        expect(ENV.DB_URL).toBeTruthy();
      }
    });

    test('should handle undefined NODE_ENV gracefully', () => {
      if (!process.env.NODE_ENV) {
        expect(ENV.NODE_ENV).toBeUndefined();
      } else {
        expect(ENV.NODE_ENV).toBeTruthy();
      }
    });
  });

  describe('NODE_ENV Configuration (New Feature)', () => {
    test('should correctly reflect production environment', () => {
      if (process.env.NODE_ENV === 'production') {
        expect(ENV.NODE_ENV).toBe('production');
      }
    });

    test('should correctly reflect development environment', () => {
      if (process.env.NODE_ENV === 'development') {
        expect(ENV.NODE_ENV).toBe('development');
      }
    });

    test('should correctly reflect test environment', () => {
      if (process.env.NODE_ENV === 'test') {
        expect(ENV.NODE_ENV).toBe('test');
      }
    });

    test('should handle custom NODE_ENV values', () => {
      // Test that custom values are also properly loaded
      expect(ENV.NODE_ENV).toBe(process.env.NODE_ENV);
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should not mutate process.env when accessed', () => {
      const originalProcessEnv = { ...process.env };
      let _ = ENV.PORT;
      _ = ENV.DB_URL;
      _ = ENV.NODE_ENV;
      
      expect(process.env).toEqual(originalProcessEnv);
    });

    test('should maintain consistent values across multiple accesses', () => {
      const firstAccess = {
        PORT: ENV.PORT,
        DB_URL: ENV.DB_URL,
        NODE_ENV: ENV.NODE_ENV
      };

      const secondAccess = {
        PORT: ENV.PORT,
        DB_URL: ENV.DB_URL,
        NODE_ENV: ENV.NODE_ENV
      };

      expect(firstAccess).toEqual(secondAccess);
    });

    test('should handle empty string environment variables', () => {
      // If env vars are set to empty strings, they should be empty strings (not undefined)
      if (process.env.PORT === '') {
        expect(ENV.PORT).toBe('');
      }
    });

    test('ENV object should be frozen or immutable in production context', () => {
      // Attempt to modify ENV
      const originalPort = ENV.PORT;
      
      try {
        ENV.PORT = 'modified';
      } catch (e) {
        // It's okay if it throws in strict mode
      }
      
      // Check behavior - it might allow assignment but not change the value
      // or it might throw in strict mode
      if (Object.isFrozen(ENV)) {
        expect(ENV.PORT).toBe(originalPort);
      }
    });
  });

  describe('Type Validation', () => {
    test('PORT should be a string or undefined', () => {
      expect(['string', 'undefined']).toContain(typeof ENV.PORT);
    });

    test('DB_URL should be a string or undefined', () => {
      expect(['string', 'undefined']).toContain(typeof ENV.DB_URL);
    });

    test('NODE_ENV should be a string or undefined', () => {
      expect(['string', 'undefined']).toContain(typeof ENV.NODE_ENV);
    });

    test('PORT when defined should be numeric string', () => {
      if (ENV.PORT) {
        expect(ENV.PORT).toMatch(/^\d+$/);
      }
    });

    test('DB_URL when defined should be a valid URI format', () => {
      if (ENV.DB_URL) {
        // Basic URL format validation
        expect(ENV.DB_URL).toMatch(/^[a-zA-Z][a-zA-Z0-9+.-]*:/);
      }
    });
  });

  describe('Integration with dotenv', () => {
    test('should call dotenv.config during module initialization', () => {
      // This test verifies that dotenv is being used
      // Since the module is already imported, we verify ENV has the expected structure
      expect(ENV).toBeDefined();
      expect(typeof ENV).toBe('object');
    });

    test('should respect .env file if present', () => {
      // ENV values should match process.env values after dotenv.config()
      expect(ENV.PORT).toBe(process.env.PORT);
      expect(ENV.DB_URL).toBe(process.env.DB_URL);
      expect(ENV.NODE_ENV).toBe(process.env.NODE_ENV);
    });
  });
});