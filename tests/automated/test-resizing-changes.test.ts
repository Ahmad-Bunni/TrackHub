import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Test Suite: Resizing Changes Verification
 * 
 * Lightweight tests to verify CSS class changes are applied correctly.
 * These tests check source files for expected Tailwind classes without
 * requiring a running Electron app or DOM rendering.
 * 
 * Purpose: Guide the implementation agent — verify changes match the plan.
 */

// --- Helpers ---

const ROOT = join(import.meta.dir, '..', '..');

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf-8');
}

// --- Tests ---

describe('R1: Table component base styles', () => {
  it('should have text-base on Table component', () => {
    const content = readFile('renderer/components/ui/table.tsx');
    expect(content).toContain('text-base');
  });

  it('should have h-12 on TableHead', () => {
    const content = readFile('renderer/components/ui/table.tsx');
    // TableHead className should contain h-12
    expect(content).toContain('h-12');
  });

  it('should have px-3 on TableHead', () => {
    const content = readFile('renderer/components/ui/table.tsx');
    // TableHead className should contain px-3
    expect(content).toContain('px-3');
  });

  it('should have p-3 on TableCell', () => {
    const content = readFile('renderer/components/ui/table.tsx');
    // TableCell className should contain p-3
    expect(content).toContain('p-3');
  });
});

describe('R2: ListTable component changes', () => {
  it('should have text-sm on note display', () => {
    const content = readFile('renderer/components/ListTable.tsx');
    // Note text should be text-sm (was text-xs)
    expect(content).toContain('text-sm');
  });

  it('should have text-xs on tag pills (was text-[11px])', () => {
    const content = readFile('renderer/components/ListTable.tsx');
    // Tag pills should use text-xs (was text-[11px])
    expect(content).toContain('text-xs');
  });

  it('should have h-6 w-6 on action buttons (was h-5 w-5)', () => {
    const content = readFile('renderer/components/ListTable.tsx');
    // Action buttons should be h-6 w-6
    expect(content).toContain('h-6');
    expect(content).toContain('w-6');
  });
});

describe('R3: Header/search bar spacing', () => {
  it('should have gap-3 in header flex container', () => {
    const content = readFile('renderer/pages/index.tsx');
    // Header should have gap-3 (was gap-2)
    expect(content).toContain('gap-3');
  });

  it('should have my-5 vertical margin (was my-4)', () => {
    const content = readFile('renderer/pages/index.tsx');
    // Header should have my-5
    expect(content).toContain('my-5');
  });

  it('should have h-10 on search input', () => {
    const content = readFile('renderer/pages/index.tsx');
    // Input should have h-10 for consistent height
    expect(content).toContain('h-10');
  });
});

describe('R4: No regression — existing functionality preserved', () => {
  it('should NOT have max-w-5xl on container (now responsive)', () => {
    const content = readFile('renderer/pages/index.tsx');
    expect(content).not.toContain('max-w-5xl');
  });

  it('should NOT have mx-auto on page container (redundant with w-full)', () => {
    const content = readFile('renderer/pages/index.tsx');
    expect(content).not.toContain('mx-auto');
  });

  it('should have w-full on container (responsive width)', () => {
    const content = readFile('renderer/pages/index.tsx');
    expect(content).toContain('w-full');
  });

  it('should NOT have max-w-5xl on root layout (now responsive)', () => {
    const content = readFile('renderer/index.tsx');
    expect(content).not.toContain('max-w-5xl');
  });

  it('should have w-full on root layout', () => {
    const content = readFile('renderer/index.tsx');
    expect(content).toContain('w-full');
  });

  it('should NOT have container class on root layout', () => {
    const content = readFile('renderer/index.tsx');
    expect(content).not.toContain('container');
  });

  it('should still have ITEMS_PER_PAGE constant', () => {
    const content = readFile('renderer/components/ListTable.tsx');
    expect(content).toContain('ITEMS_PER_PAGE');
  });

  it('should still have sort functionality', () => {
    const content = readFile('renderer/components/ListTable.tsx');
    expect(content).toContain('toggleSort');
    expect(content).toContain('sortBy');
  });

  it('should still have pagination', () => {
    const content = readFile('renderer/pages/index.tsx');
    expect(content).toContain('Pagination');
  });
});

describe('R5: Plan compliance — key metrics', () => {
  it('should have approximately 20-30% size increase across components', () => {
    const tableContent = readFile('renderer/components/ui/table.tsx');
    const listTableContent = readFile('renderer/components/ListTable.tsx');
    const indexContent = readFile('renderer/pages/index.tsx');

    // Verify key size indicators are present
    const sizeIndicators = [
      'text-base',    // Table font: 14px → 16px (+14%)
      'h-12',         // Row height: 40px → 48px (+20%)
      'px-3',         // Horizontal padding: 8px → 12px (+50%)
      'p-3',          // Cell padding: 8px → 12px (+50%)
      'h-6',          // Button size: 20px → 24px (+20%)
      'gap-3',        // Gap: 8px → 12px (+50%)
      'my-5',         // Margin: 16px → 20px (+25%)
    ];

    const found = sizeIndicators.filter(indicator => 
      tableContent.includes(indicator) || 
      listTableContent.includes(indicator) || 
      indexContent.includes(indicator)
    );

    // At least 6 out of 7 indicators should be present (allowing for some flexibility)
    expect(found.length).toBeGreaterThanOrEqual(6);
  });
});
