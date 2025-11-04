/**
 * Validation Tests for package.json files
 * 
 * Tests cover:
 * - Root package.json structure and scripts
 * - Backend package.json configuration
 * - Required fields and version formats
 * - Script definitions and consistency
 * - Dependencies validation
 */

import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Package.json Validation', () => {
  let rootPackageJson;
  let backendPackageJson;

  beforeAll(() => {
    // Load package.json files
    const rootPath = join(process.cwd(), '..', 'package.json');
    const backendPath = join(process.cwd(), 'package.json');
    
    try {
      rootPackageJson = JSON.parse(readFileSync(rootPath, 'utf-8'));
    } catch (e) {
      rootPackageJson = null;
    }
    
    try {
      backendPackageJson = JSON.parse(readFileSync(backendPath, 'utf-8'));
    } catch (e) {
      backendPackageJson = null;
    }
  });

  describe('Root package.json', () => {
    test('should exist and be valid JSON', () => {
      expect(rootPackageJson).toBeDefined();
      expect(rootPackageJson).not.toBeNull();
    });

    test('should have required metadata fields', () => {
      expect(rootPackageJson).toHaveProperty('name');
      expect(rootPackageJson).toHaveProperty('version');
      expect(rootPackageJson).toHaveProperty('description');
    });

    test('should have build script', () => {
      expect(rootPackageJson.scripts).toHaveProperty('build');
      expect(rootPackageJson.scripts.build).toContain('npm install --prefix backend');
      expect(rootPackageJson.scripts.build).toContain('npm install --prefix frontend');
      expect(rootPackageJson.scripts.build).toContain('npm run build --prefix frontend');
    });

    test('should have start script', () => {
      expect(rootPackageJson.scripts).toHaveProperty('start');
      expect(rootPackageJson.scripts.start).toContain('npm run start --prefix backend');
    });

    test('should have repository information', () => {
      expect(rootPackageJson).toHaveProperty('repository');
      expect(rootPackageJson.repository).toHaveProperty('type');
      expect(rootPackageJson.repository).toHaveProperty('url');
    });

    test('should have valid version format', () => {
      expect(rootPackageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('should have GitHub repository URL', () => {
      expect(rootPackageJson.repository.url).toContain('github.com');
      expect(rootPackageJson.repository.url).toContain('meet.dev');
    });

    test('should specify module type', () => {
      expect(rootPackageJson).toHaveProperty('type');
      expect(rootPackageJson.type).toBe('commonjs');
    });

    test('should have bug tracking URL', () => {
      expect(rootPackageJson).toHaveProperty('bugs');
      expect(rootPackageJson.bugs).toHaveProperty('url');
    });

    test('should have homepage', () => {
      expect(rootPackageJson).toHaveProperty('homepage');
      expect(rootPackageJson.homepage).toContain('github.com');
    });
  });

  describe('Backend package.json', () => {
    test('should exist and be valid JSON', () => {
      expect(backendPackageJson).toBeDefined();
      expect(backendPackageJson).not.toBeNull();
    });

    test('should have required metadata fields', () => {
      expect(backendPackageJson).toHaveProperty('name');
      expect(backendPackageJson).toHaveProperty('version');
      expect(backendPackageJson).toHaveProperty('description');
    });

    test('should have dev script', () => {
      expect(backendPackageJson.scripts).toHaveProperty('dev');
      expect(backendPackageJson.scripts.dev).toContain('nodemon');
      expect(backendPackageJson.scripts.dev).toContain('src/server.js');
    });

    test('should have start script (new)', () => {
      expect(backendPackageJson.scripts).toHaveProperty('start');
      expect(backendPackageJson.scripts.start).toContain('node');
      expect(backendPackageJson.scripts.start).toContain('src/server.js');
    });

    test('should specify ES module type', () => {
      expect(backendPackageJson).toHaveProperty('type');
      expect(backendPackageJson.type).toBe('module');
    });

    test('should have required dependencies', () => {
      expect(backendPackageJson).toHaveProperty('dependencies');
      expect(backendPackageJson.dependencies).toHaveProperty('dotenv');
      expect(backendPackageJson.dependencies).toHaveProperty('express');
      expect(backendPackageJson.dependencies).toHaveProperty('mongoose');
    });

    test('should have nodemon in devDependencies', () => {
      expect(backendPackageJson).toHaveProperty('devDependencies');
      expect(backendPackageJson.devDependencies).toHaveProperty('nodemon');
    });

    test('should have valid dependency versions', () => {
      const deps = { ...backendPackageJson.dependencies, ...backendPackageJson.devDependencies };
      
      Object.values(deps).forEach(version => {
        expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+$/);
      });
    });

    test('start script should use node (not nodemon)', () => {
      expect(backendPackageJson.scripts.start).toContain('node');
      expect(backendPackageJson.scripts.start).not.toContain('nodemon');
    });

    test('dev script should use nodemon', () => {
      expect(backendPackageJson.scripts.dev).toContain('nodemon');
    });
  });

  describe('Script Consistency', () => {
    test('backend start script should match root start delegation', () => {
      const rootStartCommand = rootPackageJson.scripts.start;
      expect(rootStartCommand).toContain('backend');
    });

    test('backend paths should be consistent across scripts', () => {
      const devScript = backendPackageJson.scripts.dev;
      const startScript = backendPackageJson.scripts.start;
      
      // Both should reference the same server file
      expect(devScript).toContain('src/server.js');
      expect(startScript).toContain('src/server.js');
    });

    test('root build script should orchestrate both frontend and backend', () => {
      const buildScript = rootPackageJson.scripts.build;
      
      expect(buildScript).toContain('backend');
      expect(buildScript).toContain('frontend');
      expect(buildScript.indexOf('backend')).toBeLessThan(buildScript.indexOf('frontend'));
    });
  });

  describe('Dependency Version Compatibility', () => {
    test('express version should be 5.x or higher', () => {
      const expressVersion = backendPackageJson.dependencies.express;
      const majorVersion = parseInt(expressVersion.replace(/[\^~]/, '').split('.')[0]);
      
      expect(majorVersion).toBeGreaterThanOrEqual(5);
    });

    test('mongoose version should be 8.x or higher', () => {
      const mongooseVersion = backendPackageJson.dependencies.mongoose;
      const majorVersion = parseInt(mongooseVersion.replace(/[\^~]/, '').split('.')[0]);
      
      expect(majorVersion).toBeGreaterThanOrEqual(8);
    });

    test('dotenv should be at a recent version', () => {
      const dotenvVersion = backendPackageJson.dependencies.dotenv;
      const majorVersion = parseInt(dotenvVersion.replace(/[\^~]/, '').split('.')[0]);
      
      expect(majorVersion).toBeGreaterThanOrEqual(16);
    });
  });

  describe('Package.json Structure', () => {
    test('root package.json should not have dependencies', () => {
      expect(rootPackageJson.dependencies).toBeUndefined();
    });

    test('backend package.json should have both dependencies and devDependencies', () => {
      expect(backendPackageJson.dependencies).toBeDefined();
      expect(backendPackageJson.devDependencies).toBeDefined();
    });

    test('package names should be appropriate', () => {
      expect(rootPackageJson.name).toBe('meet.dev');
      expect(backendPackageJson.name).toBe('backend');
    });

    test('should have appropriate license', () => {
      expect(rootPackageJson).toHaveProperty('license');
      expect(backendPackageJson).toHaveProperty('license');
      expect(rootPackageJson.license).toBe('ISC');
      expect(backendPackageJson.license).toBe('ISC');
    });
  });

  describe('Edge Cases and Validation', () => {
    test('scripts should not have trailing spaces', () => {
      Object.values(rootPackageJson.scripts).forEach(script => {
        expect(script).toBe(script.trim());
      });
      
      Object.values(backendPackageJson.scripts).forEach(script => {
        expect(script).toBe(script.trim());
      });
    });

    test('no scripts should be empty strings', () => {
      Object.values(rootPackageJson.scripts).forEach(script => {
        expect(script.length).toBeGreaterThan(0);
      });
      
      Object.values(backendPackageJson.scripts).forEach(script => {
        expect(script.length).toBeGreaterThan(0);
      });
    });

    test('repository URL should be properly formatted', () => {
      const repoUrl = rootPackageJson.repository.url;
      expect(repoUrl).toMatch(/^git\+https:\/\//);
      expect(repoUrl).toContain('.git');
    });

    test('version numbers should not have leading zeros', () => {
      const rootVersion = rootPackageJson.version;
      const backendVersion = backendPackageJson.version;
      
      rootVersion.split('.').forEach(part => {
        if (part.length > 1) {
          expect(part[0]).not.toBe('0');
        }
      });
      
      backendVersion.split('.').forEach(part => {
        if (part.length > 1) {
          expect(part[0]).not.toBe('0');
        }
      });
    });
  });
});