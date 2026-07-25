import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Test Suite: Window Resize Configuration
 * 
 * Verifies Electron window is resizable with appropriate boundaries
 * that harmonize with the 25% larger UI spacing.
 */

const ROOT = join(import.meta.dir, '..', '..');

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf-8');
}

describe('W1: Window resize configuration', () => {
  it('should have resizable: true', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).toContain('resizable: true');
  });

  it('should have minWidth: 1024', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).toContain('minWidth: 1024');
  });

  it('should have minHeight: 768', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).toContain('minHeight: 768');
  });

  it('should have fullscreenable: true', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).toContain('fullscreenable: true');
  });

  it('should not have maxWidth constraint', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).not.toContain('maxWidth');
  });

  it('should not have maxHeight constraint', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).not.toContain('maxHeight');
  });

  it('should keep default width: 1024', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).toContain('width: 1024');
  });

  it('should keep default height: 768', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).toContain('height: 768');
  });
});

describe('W2: No regression — other config preserved', () => {
  it('should still have autoHideMenuBar: true', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).toContain('autoHideMenuBar: true');
  });

  it('should still have nodeIntegration: false', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).toContain('nodeIntegration: false');
  });

  it('should still have contextIsolation: true', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).toContain('contextIsolation: true');
  });

  it('should still load the correct preload file', () => {
    const content = readFile('electron-src/index.ts');
    expect(content).toContain("preload: join(__dirname, 'preload.js')");
  });
});
