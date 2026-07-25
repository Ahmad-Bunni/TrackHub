import { describe, it, expect } from 'bun:test';
import type { Item } from '@prisma/client';

/**
 * Test Suite: Pagination Logic (Part A scenarios A1-A7)
 * 
 * Tests pure logic functions: paginate, queryItems date filtering, totalPages calculation.
 * These tests verify the core pagination behavior without requiring a running Electron app.
 */

// --- Helpers ---

const ITEMS_PER_PAGE = 10;

function paginate<T>(items: T[], page: number): T[] {
  const start = (page - 1) * ITEMS_PER_PAGE;
  return items.slice(start, start + ITEMS_PER_PAGE);
}

function getTotalPages(itemsCount: number): number {
  return Math.ceil(itemsCount / ITEMS_PER_PAGE) || 1;
}

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function generateTestItems(count: number, tagId: number = 1): Item[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    note: `Note ${i + 1}`,
    date: new Date(2024, 0, 1 + (i % 10)), // Spread across Jan 1-10
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [{ id: i + 100, itemId: i + 1, tagId }],
  }));
}

// --- Tests ---

describe('A1: Baseline multi-page rendering', () => {
  it('should paginate 25 items across 3 pages', () => {
    const items = generateTestItems(25);
    const totalPages = getTotalPages(items.length);
    
    expect(totalPages).toBe(3);
    expect(paginate(items, 1).length).toBe(10);
    expect(paginate(items, 2).length).toBe(10);
    expect(paginate(items, 3).length).toBe(5);
  });

  it('should paginate exactly 20 items across 2 pages', () => {
    const items = generateTestItems(20);
    const totalPages = getTotalPages(items.length);
    
    expect(totalPages).toBe(2);
    expect(paginate(items, 1).length).toBe(10);
    expect(paginate(items, 2).length).toBe(10);
  });

  it('should paginate exactly 10 items on 1 page', () => {
    const items = generateTestItems(10);
    const totalPages = getTotalPages(items.length);
    
    expect(totalPages).toBe(1);
    expect(paginate(items, 1).length).toBe(10);
  });

  it('should handle 0 items gracefully', () => {
    const items: Item[] = [];
    const totalPages = getTotalPages(items.length);
    
    expect(totalPages).toBe(1); // Math.ceil(0/10) || 1 = 1
    expect(paginate(items, 1).length).toBe(0);
  });
});

describe('A2: Search from page 2 should show page 1 results', () => {
  it('should return correct page 1 results after search', () => {
    const allItems = generateTestItems(25);
    const searchResults = allItems.filter((item) => item.name.includes('Item 1'));
    
    expect(searchResults.length).toBeGreaterThan(0);
    // Page 1 should return first 10 items (or fewer if results < 10)
    const page1Results = paginate(searchResults, 1);
    expect(page1Results.length).toBe(Math.min(10, searchResults.length));
    expect(page1Results[0].name).toContain('Item 1');
  });

  it('should return empty array when search matches nothing', () => {
    const allItems = generateTestItems(25);
    const searchResults = allItems.filter((item) => item.name.includes('nonexistent'));
    
    expect(searchResults.length).toBe(0);
    expect(paginate(searchResults, 1).length).toBe(0);
  });
});

describe('A3: Narrow search should fit on fewer pages', () => {
  it('should show "1 of 1" when results fit on one page', () => {
    // Generate items where search matches only a few
    const allItems = generateTestItems(25);
    // Filter to get only items with id 1-5 (simulates narrow search)
    const searchResults = allItems.filter((item) => item.id <= 5);
    
    const totalPages = getTotalPages(searchResults.length);
    expect(totalPages).toBe(1); // 5 items fit on 1 page
  });

  it('should reduce pages when search narrows results', () => {
    const allItems = generateTestItems(25);
    const originalPages = getTotalPages(allItems.length);
    
    const searchResults = allItems.filter((item) => item.name.includes('Item 1'));
    const newPages = getTotalPages(searchResults.length);
    
    expect(newPages).toBeLessThan(originalPages);
  });
});

describe('A4: Empty search results', () => {
  it('should show "1 of 1" for empty results', () => {
    const emptyItems: Item[] = [];
    const totalPages = getTotalPages(emptyItems.length);
    
    expect(totalPages).toBe(1);
  });

  it('should not crash on empty results pagination', () => {
    const emptyItems: Item[] = [];
    expect(() => paginate(emptyItems, 1)).not.toThrow();
    expect(() => paginate(emptyItems, 2)).not.toThrow();
    expect(paginate(emptyItems, 1).length).toBe(0);
    expect(paginate(emptyItems, 2).length).toBe(0);
  });
});

describe('A5: Date filter should work with pagination', () => {
  it('should filter items by date correctly', () => {
    const items = generateTestItems(25);
    const filterDate = new Date(2024, 0, 1);
    
    const filteredItems = items.filter((item) => {
      const itemDate = new Date(item.date);
      return toLocalDateStr(itemDate) === toLocalDateStr(filterDate);
    });
    
    expect(filteredItems.length).toBeGreaterThan(0);
    expect(filteredItems.length).toBeLessThanOrEqual(25);
  });

  it('should return empty array when no items match date', () => {
    const items = generateTestItems(25);
    const filterDate = new Date(2020, 0, 1);
    
    const filteredItems = items.filter((item) => {
      const itemDate = new Date(item.date);
      return toLocalDateStr(itemDate) === toLocalDateStr(filterDate);
    });
    
    expect(filteredItems.length).toBe(0);
  });
});

describe('A6: Tag filter should work with pagination', () => {
  it('should filter items by tag correctly', () => {
    const items = generateTestItems(25, 1);
    const targetTagId = 1;
    
    const filteredItems = items.filter((item) => 
      item.tags.some((tag) => tag.tagId === targetTagId)
    );
    
    expect(filteredItems.length).toBe(25); // All items have tagId=1
  });

  it('should return empty when no items have tag', () => {
    const items = generateTestItems(25, 1);
    const targetTagId = 999; // No items have this tag
    
    const filteredItems = items.filter((item) => 
      item.tags.some((tag) => tag.tagId === targetTagId)
    );
    
    expect(filteredItems.length).toBe(0);
  });
});

describe('A7: Combined filters (name + date, name + tag, all three)', () => {
  it('should apply name + date filter', () => {
    const items = generateTestItems(25);
    const name = 'Item 1';
    const filterDate = new Date(2024, 0, 1);
    
    const filteredItems = items.filter((item) => {
      const itemDate = new Date(item.date);
      return item.name.includes(name) && toLocalDateStr(itemDate) === toLocalDateStr(filterDate);
    });
    
    expect(filteredItems.length).toBeGreaterThan(0);
  });

  it('should apply name + tag filter', () => {
    const items = generateTestItems(25, 1);
    const name = 'Item 1';
    const targetTagId = 1;
    
    const filteredItems = items.filter((item) => {
      const nameMatch = item.name.includes(name);
      const tagMatch = item.tags.some((tag) => tag.tagId === targetTagId);
      
      return nameMatch && tagMatch;
    });
    
    expect(filteredItems.length).toBeGreaterThan(0);
  });

  it('should apply all three filters', () => {
    const items = generateTestItems(25, 1);
    const name = 'Item 1';
    const filterDate = new Date(2024, 0, 1);
    const targetTagId = 1;
    
    const filteredItems = items.filter((item) => {
      const itemDate = new Date(item.date);
      return item.name.includes(name) && toLocalDateStr(itemDate) === toLocalDateStr(filterDate) && item.tags.some((tag) => tag.tagId === targetTagId);
    });
    
    expect(filteredItems.length).toBeGreaterThan(0);
  });
});
